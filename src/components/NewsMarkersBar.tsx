import { useState, useEffect, useRef } from 'react'
import { IChartApi } from 'lightweight-charts'
import type { NewsEvent, PriceData } from '../types'
import { impactColors } from '../services/newsService'

interface NewsMarkersBarProps {
  newsEvents: NewsEvent[]
  chart: IChartApi
  data: PriceData[]
}

export function NewsMarkersBar({ newsEvents, chart, data }: NewsMarkersBarProps) {
  const [selectedNews, setSelectedNews] = useState<NewsEvent | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Calculate marker positions based on time scale
  const getMarkerPosition = (eventTime: string) => {
    if (!containerRef.current) return null
    
    const timeScale = chart.timeScale()
    const coordinate = timeScale.timeToCoordinate(eventTime as any)
    
    if (coordinate === null) return null
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const chartRect = containerRef.current.parentElement?.getBoundingClientRect()
    
    if (!chartRect) return null
    
    // Adjust for chart margins
    return coordinate
  }
  
  const handleMarkerClick = (event: React.MouseEvent, newsEvent: NewsEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    })
    setSelectedNews(newsEvent)
  }
  
  const closePopover = () => {
    setSelectedNews(null)
    setPopoverPosition(null)
  }
  
  // Filter events that are within the visible range
  const visibleEvents = newsEvents.filter(event => {
    const position = getMarkerPosition(event.time)
    return position !== null
  })
  
  return (
    <>
      <div ref={containerRef} className="news-markers-bar">
        {visibleEvents.map(event => {
          const position = getMarkerPosition(event.time)
          if (!position) return null
          
          return (
            <div
              key={event.id}
              className="news-marker"
              style={{
                left: `${position}px`,
                backgroundColor: impactColors[event.impact],
                width: event.impact === 'high' ? '10px' : '8px',
                height: event.impact === 'high' ? '10px' : '8px',
              }}
              onClick={(e) => handleMarkerClick(e, event)}
              title={event.title}
            />
          )
        })}
      </div>
      
      {selectedNews && popoverPosition && (
        <NewsPopover
          news={selectedNews}
          position={popoverPosition}
          onClose={closePopover}
        />
      )}
    </>
  )
}

interface NewsPopoverProps {
  news: NewsEvent
  position: { x: number; y: number }
  onClose: () => void
}

function NewsPopover({ news, position, onClose }: NewsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-NZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  
  return (
    <div 
      ref={popoverRef}
      className="news-popover"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y - 10}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="news-popover-arrow" />
      <div className="news-popover-content">
        <h4>{news.title}</h4>
        <div className="news-popover-meta">
          <span className="news-date">{formatDate(news.time)}</span>
          <span className="news-source">{news.source}</span>
        </div>
        <p>{news.description}</p>
        {news.url && (
          <a href={news.url} target="_blank" rel="noopener noreferrer" className="news-link">
            Read more →
          </a>
        )}
      </div>
    </div>
  )
}