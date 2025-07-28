import { useEffect, useState } from 'react'
import { PriceChart, TechnicalIndicatorType } from './components/PriceChart'
import { MarketStatusCompact } from './components/MarketStatusCompact'
import { useEconomicStore } from './stores/economicStore'
import type { CurrencyPair, EconomicRate, CommodityPrice } from './types'
import { mockIndicators } from './data/mockData'
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, Activity, Package, Home, Settings, Bell, FileText, Download, Plus, Filter, Palette, LineChart, CandlestickChart, AreaChart, BarChart, TrendingUp as ChartLine, Newspaper } from 'lucide-react'
import logo from '../logo.svg'
import './index.css'

function formatValue(value: number, unit: string, decimals: number = 2): string {
  if (unit === '%' || unit === '% YoY' || unit === '% QoQ') {
    return `${value.toFixed(decimals)}${unit}`
  }
  return value.toFixed(decimals)
}

function App() {
  const { 
    indicators, 
    selectedId, 
    categoryFilter,
    timeRange,
    addIndicator, 
    updateIndicator,
    selectIndicator,
    setCategoryFilter,
    setTimeRange,
    getFilteredIndicators 
  } = useEconomicStore()
  
  const [showIndicators, setShowIndicators] = useState(false)
  const [activeIndicators, setActiveIndicators] = useState<TechnicalIndicatorType[]>([])
  const [showChartTypes, setShowChartTypes] = useState(false)
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area' | 'hlcArea' | 'columns' | 'baseline'>('candlestick')
  const [shouldFitContent, setShouldFitContent] = useState(false)
  const [showNews, setShowNews] = useState(true)
  const [showCompare, setShowCompare] = useState(false)
  const [compareRanges, setCompareRanges] = useState<string[]>([])
  
  // Initialize with mock data (only on first mount)
  useEffect(() => {
    try {
      // Only add indicators if we don't have any
      if (indicators.length === 0) {
        mockIndicators.forEach(addIndicator)
        // Trigger fit content after data loads
        setTimeout(() => setShouldFitContent(true), 100)
      } else {
        // Always restore data for all indicators to ensure they have data
        indicators.forEach(indicator => {
          const mockIndicator = mockIndicators.find(m => m.id === indicator.id)
          if (mockIndicator) {
            updateIndicator(indicator.id, { data: mockIndicator.data })
          }
        })
        // Trigger fit content after data restore
        setTimeout(() => setShouldFitContent(true), 100)
      }
    } catch (error) {
      console.error('Error initializing data:', error)
      // If there's a storage error, clear and reload
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        localStorage.removeItem('buttergoup-storage')
        window.location.reload()
      }
    }
  }, []) // Empty deps - only run once on mount

  // Simulate real-time updates for currency pairs
  useEffect(() => {
    const updateInterval = setInterval(() => {
      indicators.forEach(indicator => {
        if (indicator.category === 'currency') {
          // Small random price movement
          const movement = (Math.random() - 0.5) * 0.0010 // ±0.001 movement
          const newValue = indicator.currentValue + movement
          
          updateIndicator(indicator.id, {
            currentValue: newValue,
            previousValue: indicator.currentValue,
            lastUpdated: new Date()
          })
        }
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(updateInterval)
  }, [indicators, updateIndicator])

  const filteredIndicators = getFilteredIndicators()
  const selectedIndicator = indicators.find(item => item.id === selectedId)
  
  // Filter chart data based on selected time range
  const getFilteredChartData = () => {
    if (!selectedIndicator) return []
    
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '1W':
        startDate.setDate(now.getDate() - 7)
        break
      case '1M':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3M':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case '5Y':
        startDate.setFullYear(now.getFullYear() - 5)
        break
      case '10Y':
        startDate.setFullYear(now.getFullYear() - 10)
        break
    }
    
    const filteredData = selectedIndicator.data.filter(item => {
      const itemDate = new Date(item.time)
      return itemDate >= startDate
    })
    
    return filteredData
  }

  const categories = [
    { value: 'all', label: 'All Indicators' },
    { value: 'currency', label: 'Currencies' },
    { value: 'rate', label: 'Interest Rates' },
    { value: 'index', label: 'Indices' },
    { value: 'percentage', label: 'Economic Data' },
    { value: 'commodity', label: 'Commodities' }
  ]

  const timeRanges = ['1W', '1M', '3M', '1Y', '5Y', '10Y']

  return (
    <div className="app">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={logo} alt="ButterGoUp Logo" style={{ height: '50px', width: 'auto' }} />
          <div>
            <h1>ButterGoUp</h1>
            <p className="subheader">NZ Economic Eyes</p>
          </div>
        </div>
        <MarketStatusCompact />
      </header>
      
      <main className="container">
        <aside className="toolbar">
          <button className="toolbar-button active" title="Dashboard">
            <Home size={20} />
          </button>
          <button className="toolbar-button" title="Add Indicator">
            <Plus size={20} />
          </button>
          <button className="toolbar-button" title="Filters">
            <Filter size={20} />
          </button>
          <button 
            className={`toolbar-button ${showChartTypes ? 'active' : ''}`} 
            title="Chart Type"
            onClick={() => setShowChartTypes(!showChartTypes)}
          >
            <CandlestickChart size={20} />
          </button>
          <button 
            className={`toolbar-button ${showIndicators ? 'active' : ''}`} 
            title="Technical Indicators"
            onClick={() => setShowIndicators(!showIndicators)}
          >
            <LineChart size={20} />
          </button>
          <button 
            className={`toolbar-button ${showNews ? 'active' : ''}`} 
            title="News Markers"
            onClick={() => setShowNews(!showNews)}
          >
            <Newspaper size={20} />
          </button>
          <button 
            className={`toolbar-button ${showCompare ? 'active' : ''}`} 
            title="Compare Series"
            onClick={() => setShowCompare(!showCompare)}
          >
            <TrendingUp size={20} />
          </button>
          <button className="toolbar-button" title="Alerts">
            <Bell size={20} />
          </button>
          
          <div className="toolbar-divider" />
          
          <button className="toolbar-button" title="Export Data">
            <Download size={20} />
          </button>
          <button className="toolbar-button" title="Reports">
            <FileText size={20} />
          </button>
          
          <div className="toolbar-divider" />
          
          <button className="toolbar-button" title="Theme">
            <Palette size={20} />
          </button>
          <button className="toolbar-button" title="Settings">
            <Settings size={20} />
          </button>
          
          <div className="toolbar-divider" />
          
          <button 
            className="toolbar-button" 
            title="Reset Data"
            onClick={() => {
              localStorage.removeItem('buttergoup-storage')
              window.location.reload()
            }}
          >
            <RefreshCw size={20} />
          </button>
        </aside>
        
        <section className="chart-section">
          {selectedIndicator ? (
            <>
              <div className="chart-container">
                {selectedIndicator && selectedIndicator.data && selectedIndicator.data.length > 0 ? (
                  <PriceChart 
                    data={getFilteredChartData()} 
                    activeIndicators={activeIndicators} 
                    chartType={chartType} 
                    shouldFitContent={shouldFitContent} 
                    setShouldFitContent={setShouldFitContent}
                    showNews={showNews}
                    indicatorId={selectedIndicator.id}
                    compareRanges={compareRanges}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b8b8b' }}>
                    Loading chart data...
                  </div>
                )}
              </div>
              
              {showChartTypes && (
                <div className="chart-types-panel">
                  <h3>Chart Type</h3>
                  <div className="chart-type-options">
                    <button 
                      className={`chart-type-option ${chartType === 'candlestick' ? 'active' : ''}`}
                      onClick={() => {
                        setChartType('candlestick')
                        setShowChartTypes(false)
                      }}
                    >
                      <CandlestickChart size={16} />
                      <span>Candlestick</span>
                    </button>
                    <button 
                      className={`chart-type-option ${chartType === 'line' ? 'active' : ''}`}
                      onClick={() => {
                        setChartType('line')
                        setShowChartTypes(false)
                      }}
                    >
                      <ChartLine size={16} />
                      <span>Line</span>
                    </button>
                    <button 
                      className={`chart-type-option ${chartType === 'area' ? 'active' : ''}`}
                      onClick={() => {
                        setChartType('area')
                        setShowChartTypes(false)
                      }}
                    >
                      <AreaChart size={16} />
                      <span>Area</span>
                    </button>
                    <button 
                      className={`chart-type-option ${chartType === 'hlcArea' ? 'active' : ''}`}
                      onClick={() => {
                        setChartType('hlcArea')
                        setShowChartTypes(false)
                      }}
                    >
                      <BarChart3 size={16} />
                      <span>HLC Area</span>
                    </button>
                    <button 
                      className={`chart-type-option ${chartType === 'columns' ? 'active' : ''}`}
                      onClick={() => {
                        setChartType('columns')
                        setShowChartTypes(false)
                      }}
                    >
                      <BarChart size={16} />
                      <span>Columns</span>
                    </button>
                    <button 
                      className={`chart-type-option ${chartType === 'baseline' ? 'active' : ''}`}
                      onClick={() => {
                        setChartType('baseline')
                        setShowChartTypes(false)
                      }}
                    >
                      <Activity size={16} />
                      <span>Baseline</span>
                    </button>
                  </div>
                </div>
              )}
              
              {showIndicators && (
                <div className="indicators-panel">
                  <h3>Technical Indicators</h3>
                  <div className="indicator-options">
                    <label className="indicator-option">
                      <input
                        type="checkbox"
                        checked={activeIndicators.includes('bollinger')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveIndicators([...activeIndicators, 'bollinger'])
                          } else {
                            setActiveIndicators(activeIndicators.filter(i => i !== 'bollinger'))
                          }
                        }}
                      />
                      <span>Bollinger Bands</span>
                    </label>
                    <label className="indicator-option">
                      <input
                        type="checkbox"
                        checked={activeIndicators.includes('sma20')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveIndicators([...activeIndicators, 'sma20'])
                          } else {
                            setActiveIndicators(activeIndicators.filter(i => i !== 'sma20'))
                          }
                        }}
                      />
                      <span>SMA (20)</span>
                    </label>
                    <label className="indicator-option">
                      <input
                        type="checkbox"
                        checked={activeIndicators.includes('sma50')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveIndicators([...activeIndicators, 'sma50'])
                          } else {
                            setActiveIndicators(activeIndicators.filter(i => i !== 'sma50'))
                          }
                        }}
                      />
                      <span>SMA (50)</span>
                    </label>
                    <label className="indicator-option">
                      <input
                        type="checkbox"
                        checked={activeIndicators.includes('ema12')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveIndicators([...activeIndicators, 'ema12'])
                          } else {
                            setActiveIndicators(activeIndicators.filter(i => i !== 'ema12'))
                          }
                        }}
                      />
                      <span>EMA (12)</span>
                    </label>
                    <label className="indicator-option">
                      <input
                        type="checkbox"
                        checked={activeIndicators.includes('ema26')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveIndicators([...activeIndicators, 'ema26'])
                          } else {
                            setActiveIndicators(activeIndicators.filter(i => i !== 'ema26'))
                          }
                        }}
                      />
                      <span>EMA (26)</span>
                    </label>
                    <label className="indicator-option">
                      <input
                        type="checkbox"
                        checked={activeIndicators.includes('stddev')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveIndicators([...activeIndicators, 'stddev'])
                          } else {
                            setActiveIndicators(activeIndicators.filter(i => i !== 'stddev'))
                          }
                        }}
                      />
                      <span>Std Dev Channels</span>
                    </label>
                    <label className="indicator-option">
                      <input
                        type="checkbox"
                        checked={activeIndicators.includes('bbpercent')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveIndicators([...activeIndicators, 'bbpercent'])
                          } else {
                            setActiveIndicators(activeIndicators.filter(i => i !== 'bbpercent'))
                          }
                        }}
                      />
                      <span>BB %ile</span>
                    </label>
                  </div>
                </div>
              )}
              
              {showCompare && (
                <div className="compare-panel">
                  <h3>Compare Series</h3>
                  <div className="compare-options">
                    <label className="compare-option">
                      <input
                        type="checkbox"
                        checked={compareRanges.includes('1Y')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCompareRanges([...compareRanges, '1Y'])
                          } else {
                            setCompareRanges(compareRanges.filter(r => r !== '1Y'))
                          }
                        }}
                      />
                      <span>1 Year Ago</span>
                    </label>
                    <label className="compare-option">
                      <input
                        type="checkbox"
                        checked={compareRanges.includes('2Y')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCompareRanges([...compareRanges, '2Y'])
                          } else {
                            setCompareRanges(compareRanges.filter(r => r !== '2Y'))
                          }
                        }}
                      />
                      <span>2 Years Ago</span>
                    </label>
                    <label className="compare-option">
                      <input
                        type="checkbox"
                        checked={compareRanges.includes('3Y')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCompareRanges([...compareRanges, '3Y'])
                          } else {
                            setCompareRanges(compareRanges.filter(r => r !== '3Y'))
                          }
                        }}
                      />
                      <span>3 Years Ago</span>
                    </label>
                    <label className="compare-option">
                      <input
                        type="checkbox"
                        checked={compareRanges.includes('5Y')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCompareRanges([...compareRanges, '5Y'])
                          } else {
                            setCompareRanges(compareRanges.filter(r => r !== '5Y'))
                          }
                        }}
                      />
                      <span>5 Years Ago</span>
                    </label>
                    <label className="compare-option">
                      <input
                        type="checkbox"
                        checked={compareRanges.includes('AVG')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCompareRanges([...compareRanges, 'AVG'])
                          } else {
                            setCompareRanges(compareRanges.filter(r => r !== 'AVG'))
                          }
                        }}
                      />
                      <span>Historical Average</span>
                    </label>
                  </div>
                  <div className="compare-legend">
                    {compareRanges.includes('1Y') && (
                      <div className="legend-item">
                        <div className="legend-line" style={{ backgroundColor: '#f59e0b' }} />
                        <span>1 Year Ago</span>
                      </div>
                    )}
                    {compareRanges.includes('2Y') && (
                      <div className="legend-item">
                        <div className="legend-line" style={{ backgroundColor: '#3b82f6' }} />
                        <span>2 Years Ago</span>
                      </div>
                    )}
                    {compareRanges.includes('3Y') && (
                      <div className="legend-item">
                        <div className="legend-line" style={{ backgroundColor: '#a855f7' }} />
                        <span>3 Years Ago</span>
                      </div>
                    )}
                    {compareRanges.includes('5Y') && (
                      <div className="legend-item">
                        <div className="legend-line" style={{ backgroundColor: '#ec4899' }} />
                        <span>5 Years Ago</span>
                      </div>
                    )}
                    {compareRanges.includes('AVG') && (
                      <div className="legend-item">
                        <div className="legend-line" style={{ backgroundColor: '#6b7280', borderStyle: 'dashed' }} />
                        <span>Historical Avg</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="chart-header">
                <div>
                  <h2>
                    {selectedIndicator.symbol} - {selectedIndicator.name}
                    {selectedIndicator.category === 'commodity' && 'measureUnit' in selectedIndicator && (
                      <span className="measure-unit"> ({(selectedIndicator as CommodityPrice).measureUnit})</span>
                    )}
                  </h2>
                  {'source' in selectedIndicator && (
                    <p className="data-source">Source: {(selectedIndicator as EconomicRate | CommodityPrice).source}</p>
                  )}
                </div>
              </div>
              
              <div className="price-info">
                <div className="current-value">
                  <span className="value-label">Current</span>
                  <span className="value">
                    {selectedIndicator.category === 'currency' ? '' : selectedIndicator.unit === '%' ? '' : selectedIndicator.unit}
                    {formatValue(selectedIndicator.currentValue, selectedIndicator.unit, selectedIndicator.category === 'currency' ? 4 : 2)}
                  </span>
                  <span className={`value-change ${selectedIndicator.change >= 0 ? 'positive' : 'negative'}`}>
                    {selectedIndicator.change >= 0 ? <TrendingUp size={20} style={{ display: 'inline', marginRight: '0.5rem' }} /> : <TrendingDown size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />}
                    {selectedIndicator.change >= 0 ? '+' : ''}{selectedIndicator.change.toFixed(selectedIndicator.category === 'currency' ? 4 : 2)} 
                    ({selectedIndicator.changePercent >= 0 ? '+' : ''}{selectedIndicator.changePercent.toFixed(2)}%)
                  </span>
                </div>
                
                {selectedIndicator.category === 'currency' && 'bid' in selectedIndicator && (
                  <div className="bid-ask-spread">
                    <div>
                      <span className="label">Bid</span>
                      <span className="value">{(selectedIndicator as CurrencyPair).bid?.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="label">Ask</span>
                      <span className="value">{(selectedIndicator as CurrencyPair).ask?.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="label">Spread</span>
                      <span className="value">{(selectedIndicator as CurrencyPair).spread?.toFixed(4)}</span>
                    </div>
                  </div>
                )}
                
                {'nextUpdate' in selectedIndicator && (selectedIndicator as EconomicRate).nextUpdate && (
                  <div className="next-update">
                    Next update: {(() => {
                      const nextUpdate = (selectedIndicator as EconomicRate).nextUpdate
                      if (!nextUpdate) return ''
                      return (typeof nextUpdate === 'string' ? new Date(nextUpdate) : nextUpdate).toLocaleDateString('en-NZ')
                    })()}
                  </div>
                )}
              </div>
              
              <div className="time-range-overlay">
                <div className="time-range-selector">
                  {timeRanges.map(range => (
                    <button
                      key={range}
                      className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
                      onClick={() => {
                        setTimeRange(range as any)
                        setShouldFitContent(true)
                      }}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">Select an indicator to view chart</div>
          )}
        </section>
        
        <aside className="sidebar">
          <div className="indicator-panel">
            <div className="filter-section">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="category-filter"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div className="indicator-list">
              {filteredIndicators.map((indicator, index) => {
                const isCurrency = indicator.category === 'currency'
                const isCommodity = indicator.category === 'commodity'
                const getIcon = () => {
                  switch (indicator.category) {
                    case 'currency': return <DollarSign size={16} />
                    case 'rate': return <Percent size={16} />
                    case 'index': return <BarChart3 size={16} />
                    case 'percentage': return <Activity size={16} />
                    case 'commodity': return <Package size={16} />
                    default: return null
                  }
                }
                
                return (
                  <div 
                    key={`${indicator.id}-${index}`} 
                    className={`indicator-item ${selectedId === indicator.id ? 'active' : ''}`}
                    onClick={() => {
                      selectIndicator(indicator.id)
                      setShouldFitContent(true)
                    }}
                  >
                    <div className="indicator-left">
                      <div className="indicator-header">
                        <span className="indicator-icon">{getIcon()}</span>
                        <strong>{indicator.symbol}</strong>
                      </div>
                      <div className="indicator-name">
                        {indicator.name}
                        {isCommodity && 'measureUnit' in indicator && (
                          <span className="measure-unit"> ({(indicator as CommodityPrice).measureUnit})</span>
                        )}
                      </div>
                    </div>
                    <div className="indicator-right">
                      <div className="indicator-value">
                        <strong>
                          {isCurrency ? '' : indicator.unit === '%' ? '' : indicator.unit}
                          {formatValue(indicator.currentValue, indicator.unit, isCurrency ? 4 : 2)}
                        </strong>
                      </div>
                      <div className={`indicator-change ${indicator.change >= 0 ? 'positive' : 'negative'}`}>
                        {indicator.change >= 0 ? '+' : ''}{indicator.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="info-panel">
            <h3>Market Information</h3>
            {selectedIndicator ? (
              <div className="info-content">
                <div className="info-section">
                  <h4>Performance</h4>
                  <div className="performance-cards">
                    {[
                      { label: '1 Week', range: 5 },
                      { label: '1 Month', range: 10 },
                      { label: '3 Months', range: 15 },
                      { label: '1 Year', range: 25 }
                    ].map(({ label, range }) => {
                      const isPositive = Math.random() > 0.5
                      const value = (Math.random() * range).toFixed(2)
                      return (
                        <div 
                          key={label} 
                          className="perf-card"
                          style={{
                            background: isPositive 
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
                              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                            border: `1px solid ${isPositive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                          }}
                        >
                          <span className="perf-label">{label}</span>
                          <span className={`perf-value ${isPositive ? 'positive' : 'negative'}`}>
                            {isPositive ? '+' : '-'}{value}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="info-section">
                  <h4>Seasonal Trends</h4>
                  <div className="seasonal-chart">
                    <svg viewBox="0 0 300 80" className="seasonal-svg">
                      {/* Grid lines */}
                      {[0, 25, 50, 75, 100].map(y => (
                        <line
                          key={y}
                          x1="0"
                          y1={80 - (y * 0.8)}
                          x2="300"
                          y2={80 - (y * 0.8)}
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="1"
                        />
                      ))}
                      
                      {/* Year lines */}
                      {[
                        { year: '2024', color: '#3ecf8e', offset: 0 },
                        { year: '2023', color: '#f59e0b', offset: 5 },
                        { year: '2022', color: '#3b82f6', offset: -5 },
                        { year: '2021', color: '#a855f7', offset: 10 }
                      ].map(({ year, color, offset }) => {
                        const points = Array.from({ length: 12 }, (_, i) => {
                          const x = (i / 11) * 280 + 10
                          const baseValue = Math.sin((i / 12) * Math.PI * 2) * 25 + 50
                          const y = 80 - ((baseValue + offset + (Math.random() * 10 - 5)) * 0.8)
                          return `${x},${y}`
                        }).join(' ')
                        
                        return (
                          <g key={year}>
                            <polyline
                              points={points}
                              fill="none"
                              stroke={color}
                              strokeWidth="2"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              opacity="0.8"
                            />
                            {/* Add glow effect */}
                            <polyline
                              points={points}
                              fill="none"
                              stroke={color}
                              strokeWidth="4"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              opacity="0.3"
                              filter="blur(4px)"
                            />
                          </g>
                        )
                      })}
                      
                      {/* Month labels */}
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((month, i) => (
                        <text
                          key={month}
                          x={(i / 11) * 280 + 10}
                          y="78"
                          fontSize="9"
                          fill="var(--text-secondary)"
                          textAnchor="middle"
                        >
                          {month}
                        </text>
                      ))}
                    </svg>
                    
                    {/* Legend */}
                    <div className="seasonal-legend">
                      {[
                        { year: '2024', color: '#3ecf8e' },
                        { year: '2023', color: '#f59e0b' },
                        { year: '2022', color: '#3b82f6' },
                        { year: '2021', color: '#a855f7' }
                      ].map(({ year, color }) => (
                        <div key={year} className="legend-item">
                          <div className="legend-dot" style={{ backgroundColor: color }} />
                          <span className="legend-label">{year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="info-section">
                  <h4>Technical Details</h4>
                  <div className="info-details">
                    <div className="info-detail">
                      <span className="info-label">52W High</span>
                      <span className="info-value">{(selectedIndicator.currentValue * 1.15).toFixed(selectedIndicator.category === 'currency' ? 4 : 2)}</span>
                    </div>
                    <div className="info-detail">
                      <span className="info-label">52W Low</span>
                      <span className="info-value">{(selectedIndicator.currentValue * 0.85).toFixed(selectedIndicator.category === 'currency' ? 4 : 2)}</span>
                    </div>
                    <div className="info-detail">
                      <span className="info-label">Volatility</span>
                      <span className="info-value">{(Math.random() * 30 + 10).toFixed(1)}%</span>
                    </div>
                    <div className="info-detail">
                      <span className="info-label">Update Freq</span>
                      <span className="info-value">{selectedIndicator.updateFrequency}</span>
                    </div>
                    {'source' in selectedIndicator && (
                      <div className="info-detail">
                        <span className="info-label">Source</span>
                        <span className="info-value">{(selectedIndicator as EconomicRate | CommodityPrice).source}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="info-placeholder">
                <p>Select an indicator to view detailed information</p>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App