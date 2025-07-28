import type { PriceData, CurrencyPair, EconomicRate, CommodityPrice } from '../types'

function generateMockPrices(currentPrice: number, volatility: number = 0.02, days = 3650): PriceData[] {
  
  const data: PriceData[] = []
  
  // Work backwards from current price to generate historical data
  let price = currentPrice
  const prices: number[] = [price]
  
  // Generate price path backwards
  for (let i = 1; i < days; i++) {
    const dailyVolatility = volatility + Math.random() * volatility * 0.5
    const trend = Math.random() > 0.5 ? 1 : -1
    const change = price * dailyVolatility * trend
    price = price * (1 - change * 0.01) // Apply percentage change backwards
    
    // For percentages that can go negative, don't floor at 0
    if (currentPrice < 0) {
      prices.unshift(price)
    } else {
      prices.unshift(Math.max(price, currentPrice * 0.2)) // Prevent too low prices for positive values
    }
  }
  
  // Now create candlestick data going forward
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)
  
  console.log(`[generateMockPrices] Start date: ${startDate.toISOString()}`)
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const basePrice = prices[i]
    const intraday = volatility * 0.3
    
    const open = i === 0 ? basePrice : prices[i - 1]
    const close = prices[i]
    const high = Math.max(open, close) * (1 + Math.random() * intraday)
    const low = Math.min(open, close) * (1 - Math.random() * intraday)
    
    data.push({
      time: date.toISOString().split('T')[0],
      open: Math.round(open * 10000) / 10000,
      high: Math.round(high * 10000) / 10000,
      low: Math.round(low * 10000) / 10000,
      close: Math.round(close * 10000) / 10000,
    })
  }
  
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + days - 1)
  
  console.log(`[generateMockPrices] Generated ${data.length} data points`)
  console.log(`[generateMockPrices] Date range: ${data[0].time} to ${data[data.length - 1].time}`)
  console.log(`[generateMockPrices] End date: ${endDate.toISOString()}`)
  
  return data
}

const now = new Date()

export const mockCurrencyPairs: CurrencyPair[] = [
  {
    id: 'nzdusd',
    symbol: 'NZD/USD',
    name: 'New Zealand Dollar / US Dollar',
    category: 'currency',
    base: 'NZD',
    quote: 'USD',
    currentValue: 0.5912,
    previousValue: 0.5895,
    change: 0.0017,
    changePercent: 0.29,
    bid: 0.5911,
    ask: 0.5913,
    spread: 0.0002,
    unit: '',
    lastUpdated: now,
    updateFrequency: 'Real-time',
    data: generateMockPrices(0.5912, 0.005)
  },
  {
    id: 'nzdaud',
    symbol: 'NZD/AUD',
    name: 'New Zealand Dollar / Australian Dollar',
    category: 'currency',
    base: 'NZD',
    quote: 'AUD',
    currentValue: 0.9085,
    previousValue: 0.9102,
    change: -0.0017,
    changePercent: -0.19,
    bid: 0.9084,
    ask: 0.9086,
    spread: 0.0002,
    unit: '',
    lastUpdated: now,
    updateFrequency: 'Real-time',
    data: generateMockPrices(0.9085, 0.003)
  },
  {
    id: 'nzdeur',
    symbol: 'NZD/EUR',
    name: 'New Zealand Dollar / Euro',
    category: 'currency',
    base: 'NZD',
    quote: 'EUR',
    currentValue: 0.5465,
    previousValue: 0.5478,
    change: -0.0013,
    changePercent: -0.24,
    bid: 0.5464,
    ask: 0.5466,
    spread: 0.0002,
    unit: '',
    lastUpdated: now,
    updateFrequency: 'Real-time',
    data: generateMockPrices(0.5465, 0.004)
  },
  {
    id: 'nzdgbp',
    symbol: 'NZD/GBP',
    name: 'New Zealand Dollar / British Pound',
    category: 'currency',
    base: 'NZD',
    quote: 'GBP',
    currentValue: 0.4598,
    previousValue: 0.4612,
    change: -0.0014,
    changePercent: -0.30,
    bid: 0.4597,
    ask: 0.4599,
    spread: 0.0002,
    unit: '',
    lastUpdated: now,
    updateFrequency: 'Real-time',
    data: generateMockPrices(0.4598, 0.004)
  },
  {
    id: 'nzdjpy',
    symbol: 'NZD/JPY',
    name: 'New Zealand Dollar / Japanese Yen',
    category: 'currency',
    base: 'NZD',
    quote: 'JPY',
    currentValue: 89.45,
    previousValue: 88.92,
    change: 0.53,
    changePercent: 0.60,
    bid: 89.44,
    ask: 89.46,
    spread: 0.02,
    unit: '',
    lastUpdated: now,
    updateFrequency: 'Real-time',
    data: generateMockPrices(89.45, 0.008)
  }
]

export const mockEconomicIndicators: EconomicRate[] = [
  {
    id: 'ocr',
    symbol: 'OCR',
    name: 'Official Cash Rate',
    category: 'rate',
    currentValue: 5.50,
    previousValue: 5.50,
    change: 0.00,
    changePercent: 0.00,
    unit: '%',
    source: 'Reserve Bank of New Zealand',
    lastUpdated: new Date('2024-02-28'),
    nextUpdate: new Date('2024-04-10'),
    updateFrequency: 'Every 6 weeks',
    data: generateMockPrices(5.50, 0.001)
  },
  {
    id: 'cpi',
    symbol: 'CPI',
    name: 'Consumer Price Index',
    category: 'percentage',
    currentValue: 4.7,
    previousValue: 5.6,
    change: -0.9,
    changePercent: -16.07,
    unit: '% YoY',
    source: 'Statistics New Zealand',
    lastUpdated: new Date('2024-01-17'),
    nextUpdate: new Date('2024-04-17'),
    updateFrequency: 'Quarterly',
    data: generateMockPrices(4.7, 0.02)
  },
  {
    id: 'gdp',
    symbol: 'GDP',
    name: 'GDP Growth Rate',
    category: 'percentage',
    currentValue: -0.3,
    previousValue: 0.2,
    change: -0.5,
    changePercent: -250.00,
    unit: '% QoQ',
    source: 'Statistics New Zealand',
    lastUpdated: new Date('2023-12-21'),
    nextUpdate: new Date('2024-03-21'),
    updateFrequency: 'Quarterly',
    data: generateMockPrices(-0.3, 0.05)
  },
  {
    id: 'unemployment',
    symbol: 'UNEMP',
    name: 'Unemployment Rate',
    category: 'percentage',
    currentValue: 4.0,
    previousValue: 3.9,
    change: 0.1,
    changePercent: 2.56,
    unit: '%',
    source: 'Statistics New Zealand',
    lastUpdated: new Date('2024-02-07'),
    nextUpdate: new Date('2024-05-01'),
    updateFrequency: 'Quarterly',
    data: generateMockPrices(4.0, 0.01)
  },
  {
    id: 'twi',
    symbol: 'TWI',
    name: 'Trade Weighted Index',
    category: 'index',
    currentValue: 71.24,
    previousValue: 70.89,
    change: 0.35,
    changePercent: 0.49,
    unit: '',
    source: 'Reserve Bank of New Zealand',
    lastUpdated: now,
    updateFrequency: 'Daily',
    data: generateMockPrices(71.24, 0.01)
  }
]

export const mockCommodities: CommodityPrice[] = [
  {
    id: 'butter-retail',
    symbol: 'BUTTER-R',
    name: 'Butter Retail Price',
    category: 'commodity',
    commodityType: 'dairy',
    currentValue: 7.50,
    previousValue: 7.25,
    change: 0.25,
    changePercent: 3.45,
    unit: 'NZ$',
    measureUnit: 'per 500g',
    source: 'Fonterra Co-operative Group',
    lastUpdated: now,
    updateFrequency: 'Weekly',
    data: generateMockPrices(7.50, 0.015)
  },
  {
    id: 'butter-export',
    symbol: 'BUTTER-X',
    name: 'Butter Export Price (Fonterra Reference)',
    category: 'commodity',
    commodityType: 'dairy',
    currentValue: 7821,
    previousValue: 7650,
    change: 171,
    changePercent: 2.24,
    unit: 'US$',
    measureUnit: 'per metric tonne',
    source: 'Fonterra / GlobalDairyTrade',
    grade: 'Premium',
    lastUpdated: new Date('2024-03-12'),
    updateFrequency: 'Bi-weekly (GDT Auction)',
    data: generateMockPrices(7821, 0.025)
  },
  {
    id: 'milk-farmgate',
    symbol: 'MILK-FG',
    name: 'Milk Price (Farmgate)',
    category: 'commodity',
    commodityType: 'dairy',
    currentValue: 8.40,
    previousValue: 8.20,
    change: 0.20,
    changePercent: 2.44,
    unit: 'NZ$',
    measureUnit: 'per kg milk solids',
    source: 'Fonterra',
    lastUpdated: new Date('2024-03-01'),
    updateFrequency: 'Monthly',
    data: generateMockPrices(8.40, 0.02)
  },
  {
    id: 'wmp',
    symbol: 'WMP',
    name: 'Whole Milk Powder (Fonterra Reference)',
    category: 'commodity',
    commodityType: 'dairy',
    currentValue: 4332,
    previousValue: 4250,
    change: 82,
    changePercent: 1.93,
    unit: 'US$',
    measureUnit: 'per metric tonne',
    source: 'Fonterra / GlobalDairyTrade',
    grade: 'Regular',
    lastUpdated: new Date('2024-03-12'),
    updateFrequency: 'Bi-weekly (GDT Auction)',
    data: generateMockPrices(4332, 0.02)
  },
  {
    id: 'smp',
    symbol: 'SMP',
    name: 'Skim Milk Powder (Fonterra Reference)',
    category: 'commodity',
    commodityType: 'dairy',
    currentValue: 2817,
    previousValue: 2750,
    change: 67,
    changePercent: 2.44,
    unit: 'US$',
    measureUnit: 'per metric tonne',
    source: 'Fonterra / GlobalDairyTrade',
    grade: 'Medium Heat',
    lastUpdated: new Date('2024-03-12'),
    updateFrequency: 'Bi-weekly (GDT Auction)',
    data: generateMockPrices(2817, 0.025)
  },
  {
    id: 'amf',
    symbol: 'AMF',
    name: 'Anhydrous Milk Fat (Fonterra Reference)',
    category: 'commodity',
    commodityType: 'dairy',
    currentValue: 7273,
    previousValue: 7150,
    change: 123,
    changePercent: 1.72,
    unit: 'US$',
    measureUnit: 'per metric tonne',
    source: 'Fonterra / GlobalDairyTrade',
    lastUpdated: new Date('2024-03-12'),
    updateFrequency: 'Bi-weekly (GDT Auction)',
    data: generateMockPrices(7273, 0.018)
  }
]

export const mockIndicators = [...mockCurrencyPairs, ...mockEconomicIndicators, ...mockCommodities]