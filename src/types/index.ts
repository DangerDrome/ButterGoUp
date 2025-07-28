export interface PriceData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type IndicatorType = 'currency' | 'rate' | 'index' | 'percentage' | 'commodity'

export interface EconomicIndicator {
  id: string
  symbol: string
  name: string
  category: IndicatorType
  currentValue: number
  previousValue: number
  change: number
  changePercent: number
  unit: string
  lastUpdated: Date
  updateFrequency: string
  data: PriceData[]
}

export interface CurrencyPair extends EconomicIndicator {
  category: 'currency'
  base: string
  quote: string
  bid?: number
  ask?: number
  spread?: number
}

export interface EconomicRate extends EconomicIndicator {
  category: 'rate' | 'index' | 'percentage'
  source: string
  nextUpdate?: Date
}

export interface CommodityPrice extends EconomicIndicator {
  category: 'commodity'
  commodityType: 'dairy' | 'meat' | 'produce' | 'other'
  measureUnit: string // e.g., "per kg", "per 500g", "per tonne"
  source: string
  grade?: string // e.g., "Premium", "Standard"
}

export interface NewsEvent {
  id: string
  time: string
  title: string
  description: string
  source: string
  url?: string
  category: 'economic' | 'commodity' | 'regulatory' | 'market' | 'general'
  impact: 'high' | 'medium' | 'low'
  relatedIndicators?: string[] // IDs of indicators this news affects
}