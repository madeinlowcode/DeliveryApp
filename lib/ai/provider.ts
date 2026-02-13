// TASK-003: OpenRouter AI provider configuration
// AIDEV-NOTE: This provider connects to OpenRouter API which gives access to multiple AI models

import { createOpenAI } from "@ai-sdk/openai"

// TASK-056: OpenRouter timeout configuration (30 seconds)
// AIDEV-SECURITY: Prevent long-hanging requests that could exhaust resources
export const OPENROUTER_TIMEOUT_MS = 30000

// AIDEV-NOTE: OpenRouter provider configured with base URL and API key
// OpenRouter provides access to models like GPT-4, Claude, Llama, etc.
export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

// AIDEV-NOTE: Default model for the AI agent - using a cost-effective model
// Can be changed to other models supported by OpenRouter
export const DEFAULT_MODEL = "openai/gpt-4o-mini"

// AIDEV-NOTE: Alternative models for different use cases
export const MODELS = {
  // Fast and cheap - good for simple tasks
  fast: "openai/gpt-4o-mini",
  // More capable - for complex reasoning
  capable: "openai/gpt-4o",
  // Claude models
  claude: "anthropic/claude-3.5-sonnet",
  // Open source options
  llama: "meta-llama/llama-3.1-70b-instruct",
} as const

// AIDEV-NOTE: Helper to get the configured model
export function getModel(modelKey: keyof typeof MODELS = "fast") {
  return openrouter(MODELS[modelKey])
}
