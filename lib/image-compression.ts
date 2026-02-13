// AIDEV-PERF: Image compression utility
// Compresses images to WebP format with maximum 500KB file size

// Configuration
const MAX_FILE_SIZE = 500 * 1024 // 500KB
const MAX_DIMENSION = 1920 // Maximum width or height
const QUALITY_STEPS = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4] // Quality reduction steps
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export interface CompressionOptions {
  /** Maximum file size in bytes (default: 500KB) */
  maxSize?: number
  /** Maximum dimension in pixels (default: 1920) */
  maxDimension?: number
  /** Output format (default: 'image/webp') */
  format?: 'image/webp' | 'image/jpeg' | 'image/png'
  /** Initial quality (0-1, default: 0.9) */
  quality?: number
  /** Whether to preserve aspect ratio (default: true) */
  preserveAspectRatio?: boolean
}

export interface CompressedImage {
  /** Compressed image as Blob */
  blob: Blob
  /** Compressed image as Data URL */
  dataUrl: string
  /** Original file size in bytes */
  originalSize: number
  /** Compressed file size in bytes */
  compressedSize: number
  /** Compression ratio (0-1) */
  compressionRatio: number
  /** Final dimensions */
  width: number
  height: number
  /** Final format */
  format: string
}

/**
 * Check if file is a supported image type
 */
export function isSupportedImageType(file: File): boolean {
  return SUPPORTED_TYPES.includes(file.type)
}

/**
 * Get file extension for MIME type
 */
export function getExtensionForMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/webp': '.webp',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
  }
  return extensions[mimeType] || '.webp'
}

/**
 * Calculate new dimensions while preserving aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension: number
): { width: number; height: number } {
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return { width: originalWidth, height: originalHeight }
  }

  const aspectRatio = originalWidth / originalHeight

  if (originalWidth > originalHeight) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / aspectRatio),
    }
  } else {
    return {
      width: Math.round(maxDimension * aspectRatio),
      height: maxDimension,
    }
  }
}

/**
 * Load an image from a File object
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Convert canvas to Blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      format,
      quality
    )
  })
}

/**
 * Convert Blob to Data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read blob'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Compress an image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed image data
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImage> {
  const {
    maxSize = MAX_FILE_SIZE,
    maxDimension = MAX_DIMENSION,
    format = 'image/webp',
    quality: initialQuality = 0.9,
    preserveAspectRatio = true,
  } = options

  // Validate file type
  if (!isSupportedImageType(file)) {
    throw new Error(`Unsupported image type: ${file.type}. Supported types: ${SUPPORTED_TYPES.join(', ')}`)
  }

  // Load the image
  const img = await loadImage(file)
  const originalSize = file.size

  // Calculate dimensions
  const { width, height } = preserveAspectRatio
    ? calculateDimensions(img.width, img.height, maxDimension)
    : { width: Math.min(img.width, maxDimension), height: Math.min(img.height, maxDimension) }

  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Draw image
  ctx.drawImage(img, 0, 0, width, height)

  // Try to compress with decreasing quality until size is under limit
  let blob: Blob
  let quality = initialQuality
  let qualityIndex = 0

  blob = await canvasToBlob(canvas, format, quality)

  // If still too large, progressively reduce quality
  while (blob.size > maxSize && qualityIndex < QUALITY_STEPS.length) {
    quality = QUALITY_STEPS[qualityIndex]
    blob = await canvasToBlob(canvas, format, quality)
    qualityIndex++
  }

  // If still too large after all quality reductions, reduce dimensions
  if (blob.size > maxSize) {
    let currentDimension = maxDimension * 0.75

    while (blob.size > maxSize && currentDimension >= 320) {
      const newDims = calculateDimensions(img.width, img.height, currentDimension)
      canvas.width = newDims.width
      canvas.height = newDims.height
      ctx.drawImage(img, 0, 0, newDims.width, newDims.height)
      blob = await canvasToBlob(canvas, format, 0.7)
      currentDimension *= 0.75
    }
  }

  // Generate data URL
  const dataUrl = await blobToDataUrl(blob)

  return {
    blob,
    dataUrl,
    originalSize,
    compressedSize: blob.size,
    compressionRatio: blob.size / originalSize,
    width: canvas.width,
    height: canvas.height,
    format,
  }
}

/**
 * Compress multiple images
 * @param files - Array of image files
 * @param options - Compression options
 * @returns Array of compressed images
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<CompressedImage[]> {
  return Promise.all(files.map((file) => compressImage(file, options)))
}

/**
 * Create a compressed image file from a File object
 * @param file - The original file
 * @param options - Compression options
 * @returns New File object with compressed data
 */
export async function createCompressedFile(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const compressed = await compressImage(file, options)
  const extension = getExtensionForMimeType(compressed.format)
  const baseName = file.name.replace(/\.[^/.]+$/, '')
  const newName = `${baseName}${extension}`

  return new File([compressed.blob], newName, {
    type: compressed.format,
    lastModified: Date.now(),
  })
}

/**
 * Validate and compress an image for upload
 * Returns the original file if already under size limit
 */
export async function prepareImageForUpload(
  file: File,
  options: CompressionOptions = {}
): Promise<{
  file: File
  wasCompressed: boolean
  compressionInfo?: CompressedImage
}> {
  const { maxSize = MAX_FILE_SIZE } = options

  // If file is already under the limit and is WebP, return as-is
  if (file.size <= maxSize && file.type === 'image/webp') {
    return { file, wasCompressed: false }
  }

  // Compress the image
  const compressed = await compressImage(file, options)
  const newFile = await createCompressedFile(file, options)

  return {
    file: newFile,
    wasCompressed: true,
    compressionInfo: compressed,
  }
}

/**
 * Generate image thumbnail
 */
export async function generateThumbnail(
  file: File,
  size = 200
): Promise<string> {
  const compressed = await compressImage(file, {
    maxDimension: size,
    quality: 0.7,
    format: 'image/webp',
  })
  return compressed.dataUrl
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Calculate compression percentage
 */
export function getCompressionPercentage(
  originalSize: number,
  compressedSize: number
): number {
  return Math.round((1 - compressedSize / originalSize) * 100)
}
