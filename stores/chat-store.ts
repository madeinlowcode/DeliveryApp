// AIDEV-NOTE: Zustand store for chat customer info (phone, name, addresses)
// Persists to localStorage for cross-session continuity

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ChatCustomerInfo } from '@/types/chat'

/**
 * Chat store interface
 */
interface ChatStore extends ChatCustomerInfo {
  setPhone: (phone: string) => void
  setName: (name: string) => void
  addAddress: (address: string) => void
  removeAddress: (address: string) => void
  clearCustomer: () => void
  setCustomerInfo: (info: Partial<ChatCustomerInfo>) => void
}

/**
 * Zustand store with localStorage persistence
 */
export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      // Initial state
      phone: undefined,
      name: undefined,
      addresses: [],

      // Actions
      setPhone: (phone) => set({ phone }),

      setName: (name) => set({ name }),

      addAddress: (address) =>
        set((state) => ({
          addresses: state.addresses
            ? [...state.addresses, address]
            : [address],
        })),

      removeAddress: (address) =>
        set((state) => ({
          addresses: state.addresses?.filter((a) => a !== address) || [],
        })),

      clearCustomer: () =>
        set({
          phone: undefined,
          name: undefined,
          addresses: [],
        }),

      setCustomerInfo: (info) => set((state) => ({ ...state, ...info })),
    }),
    {
      name: 'customer-chat-storage',
      // AIDEV-NOTE: Only persist these fields
      partialize: (state) => ({
        phone: state.phone,
        name: state.name,
        addresses: state.addresses,
      }),
    }
  )
)

/**
 * Selector hooks for better performance
 */
export const useCustomerPhone = () => useChatStore((state) => state.phone)
export const useCustomerName = () => useChatStore((state) => state.name)
export const useCustomerAddresses = () => useChatStore((state) => state.addresses)
