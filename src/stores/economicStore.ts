import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EconomicIndicator, IndicatorType } from '../types'

export type TimeRange = '1W' | '1M' | '3M' | '1Y' | '5Y' | '10Y'

interface EconomicStore {
  indicators: EconomicIndicator[]
  selectedId: string | null
  timeRange: TimeRange
  categoryFilter: IndicatorType | 'all'
  alerts: Alert[]
  
  // Indicator actions
  addIndicator: (indicator: EconomicIndicator) => void
  removeIndicator: (id: string) => void
  updateIndicator: (id: string, updates: Partial<EconomicIndicator>) => void
  selectIndicator: (id: string) => void
  
  // Filter actions
  setTimeRange: (range: TimeRange) => void
  setCategoryFilter: (category: IndicatorType | 'all') => void
  
  // Alert actions
  addAlert: (alert: Alert) => void
  removeAlert: (id: string) => void
  updateAlert: (id: string, updates: Partial<Alert>) => void
  
  // Utility actions
  getFilteredIndicators: () => EconomicIndicator[]
}

export interface Alert {
  id: string
  indicatorId: string
  type: 'above' | 'below'
  threshold: number
  enabled: boolean
  createdAt: Date
  triggeredAt?: Date
}

export const useEconomicStore = create<EconomicStore>()(
  persist(
    (set, get) => ({
      indicators: [],
      selectedId: 'butter-retail',
      timeRange: '10Y',
      categoryFilter: 'all',
      alerts: [],
      
      addIndicator: (indicator) => set((state) => {
        // Check if indicator already exists
        const exists = state.indicators.some(i => i.id === indicator.id)
        if (exists) {
          return state
        }
        return { indicators: [...state.indicators, indicator] }
      }),
      
      removeIndicator: (id) => set((state) => ({ 
        indicators: state.indicators.filter(item => item.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId
      })),
      
      updateIndicator: (id, updates) => set((state) => ({
        indicators: state.indicators.map(item => {
          if (item.id !== id) return item
          
          const newValue = updates.currentValue ?? item.currentValue
          const change = newValue - item.currentValue
          const changePercent = item.currentValue !== 0 
            ? (change / item.currentValue) * 100 
            : 0
          
          return { 
            ...item, 
            ...updates,
            change: updates.change ?? change,
            changePercent: updates.changePercent ?? changePercent,
            lastUpdated: new Date()
          }
        })
      })),
      
      selectIndicator: (id) => set({ selectedId: id }),
      
      setTimeRange: (range) => set({ timeRange: range }),
      
      setCategoryFilter: (category) => set({ categoryFilter: category }),
      
      addAlert: (alert) => set((state) => ({
        alerts: [...state.alerts, alert]
      })),
      
      removeAlert: (id) => set((state) => ({
        alerts: state.alerts.filter(alert => alert.id !== id)
      })),
      
      updateAlert: (id, updates) => set((state) => ({
        alerts: state.alerts.map(alert => 
          alert.id === id ? { ...alert, ...updates } : alert
        )
      })),
      
      getFilteredIndicators: () => {
        const state = get()
        if (state.categoryFilter === 'all') {
          return state.indicators
        }
        return state.indicators.filter(
          indicator => indicator.category === state.categoryFilter
        )
      }
    }),
    { 
      name: 'buttergoup-storage',
      partialize: (state) => ({ 
        // Store indicators without the data array to save space
        indicators: state.indicators.map(ind => ({
          ...ind,
          data: [] // Don't persist the price data
        })),
        alerts: state.alerts,
        timeRange: state.timeRange,
        selectedId: state.selectedId,
        categoryFilter: state.categoryFilter
      })
    }
  )
)