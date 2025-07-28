import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ColorType, ISeriesApi } from 'lightweight-charts'
import type { PriceData, NewsEvent } from '../types'
import { 
  calculateBollingerBands, 
  calculateSMA, 
  calculateEMA, 
  calculateStdDevChannels,
  calculateBBPercentile
} from '../utils/technicalIndicators'
import { fetchNewsEvents } from '../services/newsService'
import { NewsMarkersBar } from './NewsMarkersBar'

export type TechnicalIndicatorType = 'none' | 'bollinger' | 'sma' | 'ema' | 'rsi' | 'macd' | 'stddev' | 'bbpercent' | 'sma20' | 'sma50' | 'ema12' | 'ema26'

interface PriceChartProps {
  data: PriceData[]
  activeIndicators?: TechnicalIndicatorType[]
  chartType?: 'candlestick' | 'line' | 'area' | 'hlcArea' | 'columns' | 'baseline'
  shouldFitContent?: boolean
  setShouldFitContent?: (value: boolean) => void
  showNews?: boolean
  indicatorId?: string
  compareRanges?: string[]
}

export function PriceChart({ data, activeIndicators = [], chartType = 'candlestick', shouldFitContent = false, setShouldFitContent, showNews = false, indicatorId, compareRanges = [] }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<any> | null>(null)
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map())
  const compareSeriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map())
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([])

  // Create chart only once
  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#1f1f1f' },
        textColor: '#8b8b8b',
      },
      grid: {
        vertLines: { color: 'rgba(46, 46, 46, 0.5)' },
        horzLines: { color: 'rgba(46, 46, 46, 0.5)' },
      },
      crosshair: {
        mode: 1,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: true,
        },
        mouseWheel: true,
        pinch: true,
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderVisible: false,
        rightBarStaysOnScroll: false,
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 3,
        minBarSpacing: 0.01,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: true,
        rightOffset: 12,
        shiftVisibleRangeOnNewBar: false,
        allowShiftVisibleRangeOnWhitespaceReplacement: true,
      },
    })

    chartRef.current = chart

    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        })
      }
    }
    

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      // Clean up all indicator series
      indicatorSeriesRef.current.clear()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, []) // Empty deps - only create chart once

  // Handle chart type changes (only when chartType actually changes)
  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return
    
    // Remove existing series
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current)
      seriesRef.current = null
    }
    
    // Create new series based on chart type
    let newSeries: ISeriesApi<any>
    
    switch (chartType) {
      case 'line':
        newSeries = chartRef.current.addLineSeries({
          color: '#3ecf8e',
          lineWidth: 2,
        })
        newSeries.setData(data.map(d => ({ time: d.time, value: d.close })))
        break
        
      case 'area':
        newSeries = chartRef.current.addAreaSeries({
          topColor: 'rgba(62, 207, 142, 0.5)',
          bottomColor: 'rgba(62, 207, 142, 0.1)',
          lineColor: '#3ecf8e',
          lineWidth: 2,
        })
        newSeries.setData(data.map(d => ({ time: d.time, value: d.close })))
        break
        
      case 'hlcArea':
        newSeries = chartRef.current.addAreaSeries({
          topColor: 'rgba(62, 207, 142, 0.5)',
          bottomColor: 'rgba(62, 207, 142, 0.1)',
          lineColor: '#3ecf8e',
          lineWidth: 2,
        })
        // For HLC area, use high as the value
        newSeries.setData(data.map(d => ({ time: d.time, value: d.high })))
        break
        
      case 'columns':
        newSeries = chartRef.current.addHistogramSeries({
          color: '#3ecf8e',
        })
        // For columns, show volume or price change
        newSeries.setData(data.map((d, i) => ({ 
          time: d.time, 
          value: i === 0 ? 0 : Math.abs(d.close - data[i-1].close),
          color: d.close >= d.open ? '#3ecf8e' : '#f45171'
        })))
        break
        
      case 'baseline':
        // Calculate the average price for baseline
        const avgPrice = data.reduce((sum, d) => sum + d.close, 0) / data.length
        newSeries = chartRef.current.addBaselineSeries({
          baseValue: { type: 'price', price: avgPrice },
          topLineColor: '#3ecf8e',
          topFillColor1: 'rgba(62, 207, 142, 0.28)',
          topFillColor2: 'rgba(62, 207, 142, 0.05)',
          bottomLineColor: '#f45171',
          bottomFillColor1: 'rgba(244, 81, 113, 0.05)',
          bottomFillColor2: 'rgba(244, 81, 113, 0.28)',
          lineWidth: 2,
        })
        newSeries.setData(data.map(d => ({ time: d.time, value: d.close })))
        break
        
      case 'candlestick':
      default:
        newSeries = chartRef.current.addCandlestickSeries({
          upColor: '#3ecf8e',
          downColor: '#f45171',
          borderVisible: false,
          wickUpColor: '#3ecf8e',
          wickDownColor: '#f45171',
        })
        newSeries.setData(data)
        break
    }
    
    seriesRef.current = newSeries
    // Don't fit content here - let the user control zoom
  }, [chartType, data]) // Include data to handle initial load

  // Update data separately without recreating chart
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current || !data.length) return
    
    try {
      // Update data based on chart type
      switch (chartType) {
        case 'line':
        case 'area':
        case 'baseline':
          seriesRef.current.setData(data.map(d => ({ time: d.time, value: d.close })))
          break
        case 'hlcArea':
          seriesRef.current.setData(data.map(d => ({ time: d.time, value: d.high })))
          break
        case 'columns':
          seriesRef.current.setData(data.map((d, i) => ({ 
            time: d.time, 
            value: i === 0 ? 0 : Math.abs(d.close - data[i-1].close),
            color: d.close >= d.open ? '#3ecf8e' : '#f45171'
          })))
          break
        case 'candlestick':
        default:
          seriesRef.current.setData(data)
          break
      }
      
      // Only fit content when explicitly requested (time range button clicked)
      if (shouldFitContent) {
        chartRef.current.timeScale().fitContent()
        // Reset the flag
        if (setShouldFitContent) {
          setShouldFitContent(false)
        }
      }
    } catch (error) {
      console.error('Error updating chart data:', error)
    }
  }, [data, chartType, shouldFitContent, setShouldFitContent])

  // Handle indicators
  useEffect(() => {
    if (!chartRef.current || !data.length) return

    // First, handle removals
    const indicatorsToRemove = new Set<string>()
    
    indicatorSeriesRef.current.forEach((_series, key) => {
      // For bollinger bands, check the main indicator
      if (key === 'bollinger' || key === 'bollinger-upper' || key === 'bollinger-lower' || key === 'bollinger-fill') {
        if (!activeIndicators.includes('bollinger')) {
          indicatorsToRemove.add(key)
        }
      } 
      // For standard deviation channels
      else if (key === 'stddev' || key === 'stddev-upper' || key === 'stddev-lower' || key === 'stddev-fill') {
        if (!activeIndicators.includes('stddev')) {
          indicatorsToRemove.add(key)
        }
      }
      // For BB percentile and its reference lines
      else if (key === 'bbpercent' || key.startsWith('bbpercent-ref')) {
        if (!activeIndicators.includes('bbpercent')) {
          indicatorsToRemove.add(key)
        }
      }
      else if (!activeIndicators.includes(key as TechnicalIndicatorType)) {
        indicatorsToRemove.add(key)
      }
    })
    
    // Remove indicators
    indicatorsToRemove.forEach(key => {
      const series = indicatorSeriesRef.current.get(key)
      if (series && chartRef.current) {
        chartRef.current.removeSeries(series)
        indicatorSeriesRef.current.delete(key)
      }
    })

    // Then handle additions/updates
    activeIndicators.forEach(indicator => {
      const existingSeries = indicatorSeriesRef.current.get(indicator)
      
      switch (indicator) {
        case 'bollinger':
          const bbData = calculateBollingerBands(data, 20, 2)
          
          // Check if ALL bollinger series exist
          const hasAllBollingerSeries = 
            indicatorSeriesRef.current.has('bollinger') &&
            indicatorSeriesRef.current.has('bollinger-upper') &&
            indicatorSeriesRef.current.has('bollinger-lower') &&
            indicatorSeriesRef.current.has('bollinger-fill')
          
          if (!hasAllBollingerSeries) {
            // Remove any partial bollinger series first
            ['bollinger', 'bollinger-upper', 'bollinger-lower', 'bollinger-fill'].forEach(key => {
              const series = indicatorSeriesRef.current.get(key)
              if (series && chartRef.current) {
                chartRef.current.removeSeries(series)
                indicatorSeriesRef.current.delete(key)
              }
            })
            
            // Create area series for the background fill
            if (!chartRef.current) break
            const fillSeries = chartRef.current.addAreaSeries({
              topColor: 'rgba(62, 207, 142, 0.05)',
              bottomColor: 'rgba(62, 207, 142, 0.05)',
              lineColor: 'transparent',
              lineWidth: 1,
              lineVisible: false,
              crosshairMarkerVisible: false,
            })
            
            // Create line series for the bands
            const upperSeries = chartRef.current.addLineSeries({
              color: 'rgba(62, 207, 142, 0.4)',
              lineWidth: 1,
              lineStyle: 2,
            })
            const middleSeries = chartRef.current.addLineSeries({
              color: 'rgba(62, 207, 142, 0.8)',
              lineWidth: 1,
            })
            const lowerSeries = chartRef.current.addLineSeries({
              color: 'rgba(62, 207, 142, 0.4)',
              lineWidth: 1,
              lineStyle: 2,
            })
            
            // Set data for fill (using upper band as the area top)
            fillSeries.setData(bbData.map(d => ({ time: d.time, value: d.upper })))
            
            // Set data for lines
            upperSeries.setData(bbData.map(d => ({ time: d.time, value: d.upper })))
            middleSeries.setData(bbData.map(d => ({ time: d.time, value: d.middle })))
            lowerSeries.setData(bbData.map(d => ({ time: d.time, value: d.lower })))
            
            indicatorSeriesRef.current.set('bollinger-fill', fillSeries as unknown as ISeriesApi<'Line'>)
            indicatorSeriesRef.current.set('bollinger', middleSeries)
            indicatorSeriesRef.current.set('bollinger-upper', upperSeries)
            indicatorSeriesRef.current.set('bollinger-lower', lowerSeries)
          } else {
            // Update existing Bollinger Bands
            const fillSeries = indicatorSeriesRef.current.get('bollinger-fill')
            const middleSeries = indicatorSeriesRef.current.get('bollinger')
            const upperSeries = indicatorSeriesRef.current.get('bollinger-upper')
            const lowerSeries = indicatorSeriesRef.current.get('bollinger-lower')
            
            fillSeries?.setData(bbData.map(d => ({ time: d.time, value: d.upper })))
            middleSeries?.setData(bbData.map(d => ({ time: d.time, value: d.middle })))
            upperSeries?.setData(bbData.map(d => ({ time: d.time, value: d.upper })))
            lowerSeries?.setData(bbData.map(d => ({ time: d.time, value: d.lower })))
          }
          break
          
        case 'sma20':
          const sma20Data = calculateSMA(data, 20)
          if (!existingSeries && chartRef.current) {
            const series = chartRef.current.addLineSeries({
              color: '#ff9800',
              lineWidth: 2,
            })
            series.setData(sma20Data.map(d => ({ time: d.time, value: d.value })))
            indicatorSeriesRef.current.set(indicator, series)
          } else if (existingSeries) {
            existingSeries.setData(sma20Data.map(d => ({ time: d.time, value: d.value })))
          }
          break
          
        case 'sma50':
          const sma50Data = calculateSMA(data, 50)
          if (!existingSeries && chartRef.current) {
            const series = chartRef.current.addLineSeries({
              color: '#2196f3',
              lineWidth: 2,
            })
            series.setData(sma50Data.map(d => ({ time: d.time, value: d.value })))
            indicatorSeriesRef.current.set(indicator, series)
          } else if (existingSeries) {
            existingSeries.setData(sma50Data.map(d => ({ time: d.time, value: d.value })))
          }
          break
          
        case 'ema12':
          const ema12Data = calculateEMA(data, 12)
          if (!existingSeries && chartRef.current) {
            const series = chartRef.current.addLineSeries({
              color: '#9c27b0',
              lineWidth: 2,
            })
            series.setData(ema12Data.map(d => ({ time: d.time, value: d.value })))
            indicatorSeriesRef.current.set(indicator, series)
          } else if (existingSeries) {
            existingSeries.setData(ema12Data.map(d => ({ time: d.time, value: d.value })))
          }
          break
          
        case 'ema26':
          const ema26Data = calculateEMA(data, 26)
          if (!existingSeries && chartRef.current) {
            const series = chartRef.current.addLineSeries({
              color: '#e91e63',
              lineWidth: 2,
            })
            series.setData(ema26Data.map(d => ({ time: d.time, value: d.value })))
            indicatorSeriesRef.current.set(indicator, series)
          } else if (existingSeries) {
            existingSeries.setData(ema26Data.map(d => ({ time: d.time, value: d.value })))
          }
          break
          
        case 'stddev':
          const stdDevData = calculateStdDevChannels(data, 20, 2)
          
          // Check if ALL std dev series exist
          const hasAllStdDevSeries = 
            indicatorSeriesRef.current.has('stddev') &&
            indicatorSeriesRef.current.has('stddev-upper') &&
            indicatorSeriesRef.current.has('stddev-lower') &&
            indicatorSeriesRef.current.has('stddev-fill')
          
          if (!hasAllStdDevSeries) {
            // Remove any partial std dev series first
            ['stddev', 'stddev-upper', 'stddev-lower', 'stddev-fill'].forEach(key => {
              const series = indicatorSeriesRef.current.get(key)
              if (series && chartRef.current) {
                chartRef.current.removeSeries(series)
                indicatorSeriesRef.current.delete(key)
              }
            })
            
            // Create area series for the background fill
            if (!chartRef.current) break
            const fillSeries = chartRef.current.addAreaSeries({
              topColor: 'rgba(156, 39, 176, 0.05)',
              bottomColor: 'rgba(156, 39, 176, 0.05)',
              lineColor: 'transparent',
              lineWidth: 1,
              lineVisible: false,
              crosshairMarkerVisible: false,
            })
            
            // Create line series for the channels
            const upperSeries = chartRef.current.addLineSeries({
              color: 'rgba(156, 39, 176, 0.6)',
              lineWidth: 1,
              lineStyle: 2,
            })
            const middleSeries = chartRef.current.addLineSeries({
              color: 'rgba(156, 39, 176, 0.9)',
              lineWidth: 2,
            })
            const lowerSeries = chartRef.current.addLineSeries({
              color: 'rgba(156, 39, 176, 0.6)',
              lineWidth: 1,
              lineStyle: 2,
            })
            
            // Set data
            fillSeries.setData(stdDevData.map(d => ({ time: d.time, value: d.upper })))
            upperSeries.setData(stdDevData.map(d => ({ time: d.time, value: d.upper })))
            middleSeries.setData(stdDevData.map(d => ({ time: d.time, value: d.middle })))
            lowerSeries.setData(stdDevData.map(d => ({ time: d.time, value: d.lower })))
            
            indicatorSeriesRef.current.set('stddev-fill', fillSeries as unknown as ISeriesApi<'Line'>)
            indicatorSeriesRef.current.set('stddev', middleSeries)
            indicatorSeriesRef.current.set('stddev-upper', upperSeries)
            indicatorSeriesRef.current.set('stddev-lower', lowerSeries)
          } else {
            // Update existing Standard Deviation Channels
            const fillSeries = indicatorSeriesRef.current.get('stddev-fill')
            const middleSeries = indicatorSeriesRef.current.get('stddev')
            const upperSeries = indicatorSeriesRef.current.get('stddev-upper')
            const lowerSeries = indicatorSeriesRef.current.get('stddev-lower')
            
            fillSeries?.setData(stdDevData.map(d => ({ time: d.time, value: d.upper })))
            middleSeries?.setData(stdDevData.map(d => ({ time: d.time, value: d.middle })))
            upperSeries?.setData(stdDevData.map(d => ({ time: d.time, value: d.upper })))
            lowerSeries?.setData(stdDevData.map(d => ({ time: d.time, value: d.lower })))
          }
          break
          
        case 'bbpercent':
          const bbPercentData = calculateBBPercentile(data, 20, 2)
          if (!existingSeries && chartRef.current) {
            const series = chartRef.current.addLineSeries({
              color: '#ff5722',
              lineWidth: 2,
              priceScaleId: 'bbpercent',
            })
            
            // Configure the separate price scale
            chartRef.current.priceScale('bbpercent').applyOptions({
              scaleMargins: {
                top: 0.8,
                bottom: 0,
              },
            })
            
            series.setData(bbPercentData.map(d => ({ time: d.time, value: d.value })))
            indicatorSeriesRef.current.set(indicator, series)
            
            // Add reference lines at 0, 50, and 100
            if (!chartRef.current) break
            const referenceLine0 = chartRef.current.addLineSeries({
              color: 'rgba(255, 87, 34, 0.3)',
              lineWidth: 1,
              lineStyle: 3,
              priceScaleId: 'bbpercent',
              crosshairMarkerVisible: false,
            })
            const referenceLine50 = chartRef.current.addLineSeries({
              color: 'rgba(255, 87, 34, 0.3)',
              lineWidth: 1,
              lineStyle: 3,
              priceScaleId: 'bbpercent',
              crosshairMarkerVisible: false,
            })
            const referenceLine100 = chartRef.current.addLineSeries({
              color: 'rgba(255, 87, 34, 0.3)',
              lineWidth: 1,
              lineStyle: 3,
              priceScaleId: 'bbpercent',
              crosshairMarkerVisible: false,
            })
            
            // Set constant values for reference lines
            const times = bbPercentData.map(d => d.time)
            referenceLine0.setData(times.map(time => ({ time, value: 0 })))
            referenceLine50.setData(times.map(time => ({ time, value: 50 })))
            referenceLine100.setData(times.map(time => ({ time, value: 100 })))
            
            indicatorSeriesRef.current.set('bbpercent-ref0', referenceLine0)
            indicatorSeriesRef.current.set('bbpercent-ref50', referenceLine50)
            indicatorSeriesRef.current.set('bbpercent-ref100', referenceLine100)
          } else if (existingSeries) {
            existingSeries.setData(bbPercentData.map(d => ({ time: d.time, value: d.value })))
            
            // Update reference lines
            const times = bbPercentData.map(d => d.time)
            indicatorSeriesRef.current.get('bbpercent-ref0')?.setData(times.map(time => ({ time, value: 0 })))
            indicatorSeriesRef.current.get('bbpercent-ref50')?.setData(times.map(time => ({ time, value: 50 })))
            indicatorSeriesRef.current.get('bbpercent-ref100')?.setData(times.map(time => ({ time, value: 100 })))
          }
          break
      }
    })
  }, [activeIndicators, data])

  // Handle compare series
  useEffect(() => {
    if (!chartRef.current || !data.length) return

    // First, remove compare series that are no longer selected
    const seriesToRemove = new Set<string>()
    compareSeriesRef.current.forEach((_, key) => {
      if (!compareRanges.includes(key)) {
        seriesToRemove.add(key)
      }
    })

    // Remove series
    seriesToRemove.forEach(key => {
      const series = compareSeriesRef.current.get(key)
      if (series && chartRef.current) {
        chartRef.current.removeSeries(series)
        compareSeriesRef.current.delete(key)
      }
    })

    // Define colors for each range
    const rangeColors: Record<string, string> = {
      '1Y': '#f59e0b',
      '2Y': '#3b82f6',
      '3Y': '#a855f7',
      '5Y': '#ec4899',
      'AVG': '#6b7280'
    }

    // Add new compare series
    compareRanges.forEach(range => {
      if (!compareSeriesRef.current.has(range) && chartRef.current) {
        const color = rangeColors[range] || '#8b8b8b'
        
        // Create offset data based on range
        let offsetData: any[] = []
        
        if (range === 'AVG') {
          // Calculate moving average
          const avgValue = data.reduce((sum, d) => sum + d.close, 0) / data.length
          offsetData = data.map(d => ({ time: d.time, value: avgValue }))
        } else {
          // Offset by years - use simulated data with some variation
          const yearOffset = parseInt(range)
          offsetData = data.map((d, i) => {
            const baseValue = d.close
            const randomVariation = Math.sin(i * 0.1 + yearOffset) * baseValue * 0.1
            const trendAdjustment = yearOffset * baseValue * 0.02
            return {
              time: d.time,
              value: baseValue - trendAdjustment + randomVariation
            }
          })
        }

        // Create line series
        const series = chartRef.current.addLineSeries({
          color: color,
          lineWidth: 2,
          lineStyle: range === 'AVG' ? 3 : 0, // Dashed for average
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false,
        })
        
        series.setData(offsetData)
        compareSeriesRef.current.set(range, series)
      }
    })
  }, [compareRanges, data])

  // Fetch news events when data changes
  useEffect(() => {
    if (!data || data.length === 0) return
    
    async function loadNews() {
      const startDate = data[0].time
      const endDate = data[data.length - 1].time
      const events = await fetchNewsEvents(startDate, endDate, indicatorId)
      setNewsEvents(events)
    }
    
    loadNews()
  }, [data, indicatorId])

  
  // Remove click handler since markers can't be clicked directly in lightweight-charts
  // Instead, we'll show news on hover or add a news list panel

  // Don't render until we have data
  if (!data || data.length === 0) {
    return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b8b8b' }}>Loading chart data...</div>
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div ref={chartContainerRef} style={{ width: '100%', height: 'calc(100% - 30px)' }} />
      {showNews && newsEvents.length > 0 && chartRef.current && (
        <NewsMarkersBar 
          newsEvents={newsEvents}
          chart={chartRef.current}
        />
      )}
    </div>
  )
}