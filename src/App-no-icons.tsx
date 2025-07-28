import { useEffect } from 'react'
import { PriceChart } from './components/PriceChart'
import { MarketStatus } from './components/MarketStatus'
import { useEconomicStore } from './stores/economicStore'
import { mockIndicators } from './data/mockData'
import './index.css'

function formatValue(value: number, unit: string, decimals: number = 2): string {
  if (unit === '%' || unit === '% YoY' || unit === '% QoQ') {
    return `${value.toFixed(decimals)}${unit}`
  }
  return value.toFixed(decimals)
}

function formatLastUpdated(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
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
  
  // Initialize with mock data (only on first mount)
  useEffect(() => {
    mockIndicators.forEach(addIndicator)
    // Select first indicator if none selected
    if (!selectedId && indicators.length === 0 && mockIndicators.length > 0) {
      selectIndicator(mockIndicators[0].id)
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
    }
    
    return selectedIndicator.data.filter(item => {
      const itemDate = new Date(item.time)
      return itemDate >= startDate
    })
  }

  const categories = [
    { value: 'all', label: 'All Indicators' },
    { value: 'currency', label: 'Currencies' },
    { value: 'rate', label: 'Interest Rates' },
    { value: 'index', label: 'Indices' },
    { value: 'percentage', label: 'Economic Data' }
  ]

  const timeRanges = ['1W', '1M', '3M', '1Y']

  return (
    <div className="app">
      <header>
        <div>
          <h1>EcoWatch</h1>
          <p className="subheader">NZ Economic Eyes</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('ecowatch-storage')
            window.location.reload()
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2e2e2e',
            color: '#ededed',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease'
          }}
        >
          Reset Data
        </button>
      </header>
      
      <main className="container">
        <aside className="sidebar">
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
              return (
                <div 
                  key={`${indicator.id}-${index}`} 
                  className={`indicator-item ${selectedId === indicator.id ? 'active' : ''}`}
                  onClick={() => selectIndicator(indicator.id)}
                >
                  <div className="indicator-header">
                    <strong>{indicator.symbol}</strong>
                    <span className="indicator-category">{indicator.category}</span>
                  </div>
                  <div className="indicator-name">{indicator.name}</div>
                  <div className="indicator-value">
                    <strong>
                      {isCurrency ? '' : indicator.unit === '%' ? '' : indicator.unit}
                      {formatValue(indicator.currentValue, indicator.unit, isCurrency ? 4 : 2)}
                    </strong>
                    <span className={`indicator-change ${indicator.change >= 0 ? 'positive' : 'negative'}`}>
                      {indicator.change >= 0 ? '+' : ''}{indicator.change.toFixed(isCurrency ? 4 : 2)} 
                      ({indicator.changePercent >= 0 ? '+' : ''}{indicator.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="indicator-meta">
                    <span className="update-time">{formatLastUpdated(indicator.lastUpdated)}</span>
                    <span className="update-freq">{indicator.updateFrequency}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
        
        <section className="chart-section">
          {selectedIndicator ? (
            <>
              <div className="chart-header">
                <div>
                  <h2>{selectedIndicator.symbol} - {selectedIndicator.name}</h2>
                  {'source' in selectedIndicator && (
                    <p className="data-source">Source: {selectedIndicator.source}</p>
                  )}
                </div>
                <div className="chart-controls">
                  <div className="time-range-selector">
                    {timeRanges.map(range => (
                      <button
                        key={range}
                        className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
                        onClick={() => setTimeRange(range as any)}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
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
                    {selectedIndicator.change >= 0 ? '+' : ''}{selectedIndicator.change.toFixed(selectedIndicator.category === 'currency' ? 4 : 2)} 
                    ({selectedIndicator.changePercent >= 0 ? '+' : ''}{selectedIndicator.changePercent.toFixed(2)}%)
                  </span>
                </div>
                
                {selectedIndicator.category === 'currency' && 'bid' in selectedIndicator && (
                  <div className="bid-ask-spread">
                    <div>
                      <span className="label">Bid</span>
                      <span className="value">{selectedIndicator.bid?.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="label">Ask</span>
                      <span className="value">{selectedIndicator.ask?.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="label">Spread</span>
                      <span className="value">{selectedIndicator.spread?.toFixed(4)}</span>
                    </div>
                  </div>
                )}
                
                {'nextUpdate' in selectedIndicator && selectedIndicator.nextUpdate && (
                  <div className="next-update">
                    Next update: {(typeof selectedIndicator.nextUpdate === 'string' ? new Date(selectedIndicator.nextUpdate) : selectedIndicator.nextUpdate).toLocaleDateString('en-NZ')}
                  </div>
                )}
              </div>
              
              <PriceChart data={getFilteredChartData()} />
              
              <MarketStatus />
            </>
          ) : (
            <div className="empty-state">Select an indicator to view chart</div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App