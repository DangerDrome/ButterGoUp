import type { PriceData } from '../types'

export interface BollingerBands {
  upper: number
  middle: number
  lower: number
  time: string
}

export interface MovingAverage {
  value: number
  time: string
}

export interface RSI {
  value: number
  time: string
}

// Simple Moving Average
export function calculateSMA(data: PriceData[], period: number): MovingAverage[] {
  if (data.length < period) return []
  
  const result: MovingAverage[] = []
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    result.push({
      value: sum / period,
      time: data[i].time
    })
  }
  
  return result
}

// Exponential Moving Average
export function calculateEMA(data: PriceData[], period: number): MovingAverage[] {
  if (data.length < period) return []
  
  const multiplier = 2 / (period + 1)
  const result: MovingAverage[] = []
  
  // Start with SMA for first value
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i].close
  }
  let ema = sum / period
  result.push({ value: ema, time: data[period - 1].time })
  
  // Calculate EMA for remaining values
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema
    result.push({ value: ema, time: data[i].time })
  }
  
  return result
}

// Bollinger Bands
export function calculateBollingerBands(data: PriceData[], period: number = 20, stdDev: number = 2): BollingerBands[] {
  if (data.length < period) return []
  
  const result: BollingerBands[] = []
  
  for (let i = period - 1; i < data.length; i++) {
    // Calculate SMA for current window
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    const smaValue = sum / period
    
    // Calculate standard deviation
    let sumSquaredDiff = 0
    for (let j = 0; j < period; j++) {
      const diff = data[i - j].close - smaValue
      sumSquaredDiff += diff * diff
    }
    const stdDevValue = Math.sqrt(sumSquaredDiff / period)
    
    result.push({
      upper: smaValue + stdDev * stdDevValue,
      middle: smaValue,
      lower: smaValue - stdDev * stdDevValue,
      time: data[i].time
    })
  }
  
  return result
}

// Relative Strength Index
export function calculateRSI(data: PriceData[], period: number = 14): RSI[] {
  if (data.length < period + 1) return []
  
  const result: RSI[] = []
  let gains = 0
  let losses = 0
  
  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close
    if (change > 0) {
      gains += change
    } else {
      losses -= change
    }
  }
  
  let avgGain = gains / period
  let avgLoss = losses / period
  
  // Calculate RSI
  for (let i = period; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close
    
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period
      avgLoss = (avgLoss * (period - 1)) / period
    } else {
      avgGain = (avgGain * (period - 1)) / period
      avgLoss = (avgLoss * (period - 1) - change) / period
    }
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    const rsi = 100 - (100 / (1 + rs))
    
    result.push({
      value: rsi,
      time: data[i].time
    })
  }
  
  return result
}

// MACD (Moving Average Convergence Divergence)
export interface MACD {
  macd: number
  signal: number
  histogram: number
  time: string
}

// Standard Deviation Channels
export interface StdDevChannel {
  upper: number
  middle: number
  lower: number
  time: string
}

// Bollinger Bands Percentile
export interface BBPercentile {
  value: number
  time: string
}

export function calculateMACD(data: PriceData[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): MACD[] {
  if (data.length < slowPeriod + signalPeriod) return []
  
  const ema12 = calculateEMA(data, fastPeriod)
  const ema26 = calculateEMA(data, slowPeriod)
  const result: MACD[] = []
  
  // Calculate MACD line
  const macdLine: { value: number; time: string }[] = []
  for (let i = slowPeriod - fastPeriod; i < ema26.length; i++) {
    const macdValue = ema12[i + fastPeriod - slowPeriod].value - ema26[i].value
    macdLine.push({
      value: macdValue,
      time: ema26[i].time
    })
  }
  
  // Calculate signal line (EMA of MACD)
  const signalLine = calculateEMAFromValues(macdLine.map(m => m.value), signalPeriod)
  
  // Build final MACD data
  for (let i = signalPeriod - 1; i < macdLine.length; i++) {
    const macd = macdLine[i].value
    const signal = signalLine[i - signalPeriod + 1]
    
    result.push({
      macd,
      signal,
      histogram: macd - signal,
      time: macdLine[i].time
    })
  }
  
  return result
}

// Helper function for MACD
function calculateEMAFromValues(values: number[], period: number): number[] {
  if (values.length < period) return []
  
  const multiplier = 2 / (period + 1)
  const result: number[] = []
  
  // Start with SMA
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += values[i]
  }
  let ema = sum / period
  result.push(ema)
  
  // Calculate EMA
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema
    result.push(ema)
  }
  
  return result
}

// Standard Deviation Channels
export function calculateStdDevChannels(data: PriceData[], period: number = 20, stdDev: number = 2): StdDevChannel[] {
  if (data.length < period) return []
  
  const result: StdDevChannel[] = []
  
  // Calculate linear regression for each window
  for (let i = period - 1; i < data.length; i++) {
    // Get the window of data
    const window = data.slice(i - period + 1, i + 1)
    
    // Calculate linear regression
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumX2 = 0
    
    window.forEach((item, index) => {
      const x = index
      const y = item.close
      sumX += x
      sumY += y
      sumXY += x * y
      sumX2 += x * x
    })
    
    const n = window.length
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    // Calculate the regression value at the current point
    const regressionValue = slope * (period - 1) + intercept
    
    // Calculate standard deviation from the regression line
    let sumSquaredDiff = 0
    window.forEach((item, index) => {
      const expectedValue = slope * index + intercept
      const diff = item.close - expectedValue
      sumSquaredDiff += diff * diff
    })
    
    const stdDevValue = Math.sqrt(sumSquaredDiff / period)
    
    result.push({
      upper: regressionValue + stdDev * stdDevValue,
      middle: regressionValue,
      lower: regressionValue - stdDev * stdDevValue,
      time: data[i].time
    })
  }
  
  return result
}

// Bollinger Bands Percentile (B%)
export function calculateBBPercentile(data: PriceData[], period: number = 20, stdDev: number = 2): BBPercentile[] {
  const bbData = calculateBollingerBands(data, period, stdDev)
  if (bbData.length === 0) return []
  
  const result: BBPercentile[] = []
  
  // Start from where we have Bollinger Bands data
  const startIndex = data.length - bbData.length
  
  for (let i = 0; i < bbData.length; i++) {
    const bb = bbData[i]
    const price = data[startIndex + i].close
    
    // Calculate %B = (Price - Lower Band) / (Upper Band - Lower Band)
    const bandwidth = bb.upper - bb.lower
    const percentile = bandwidth > 0 ? ((price - bb.lower) / bandwidth) * 100 : 50
    
    result.push({
      value: percentile,
      time: bb.time
    })
  }
  
  return result
}