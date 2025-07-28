import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { IChartApi } from 'lightweight-charts'
import { ChevronUp, ArrowUpCircle } from 'lucide-react'
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
  const [markerPositions, setMarkerPositions] = useState<Map<string, number>>(new Map())
  const [selectedMarkerX, setSelectedMarkerX] = useState<number | null>(null)
  const [hoveredMarkerX, setHoveredMarkerX] = useState<number | null>(null)
  const [selectedMarkerColor, setSelectedMarkerColor] = useState<string | null>(null)
  const [hoveredMarkerColor, setHoveredMarkerColor] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Update marker positions on animation frame for smooth updates
  useLayoutEffect(() => {
    let animationFrameId: number
    
    const updatePositions = () => {
      const timeScale = chart.timeScale()
      const newPositions = new Map<string, number>()
      
      newsEvents.forEach(event => {
        const coordinate = timeScale.timeToCoordinate(event.time as any)
        if (coordinate !== null) {
          newPositions.set(event.id, coordinate)
        }
      })
      
      setMarkerPositions(newPositions)
      
      // Keep updating on next frame
      animationFrameId = requestAnimationFrame(updatePositions)
    }
    
    // Start the animation loop
    animationFrameId = requestAnimationFrame(updatePositions)
    
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [chart, newsEvents])
  
  const handleMarkerClick = (event: React.MouseEvent, newsEvent: NewsEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const markerX = markerPositions.get(newsEvent.id)
    
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    })
    setSelectedNews(newsEvent)
    setSelectedMarkerX(markerX || null)
    setSelectedMarkerColor(impactColors[newsEvent.impact])
  }
  
  const closePopover = () => {
    setSelectedNews(null)
    setPopoverPosition(null)
    setSelectedMarkerX(null)
    setSelectedMarkerColor(null)
  }
  
  const handleMarkerHover = (event: React.MouseEvent, newsEvent: NewsEvent) => {
    const markerX = markerPositions.get(newsEvent.id)
    setHoveredMarkerX(markerX || null)
    setHoveredMarkerColor(impactColors[newsEvent.impact])
  }
  
  const handleMarkerLeave = () => {
    setHoveredMarkerX(null)
    setHoveredMarkerColor(null)
  }
  
  return (
    <>
      <div ref={containerRef} className="news-markers-bar">
        {selectedMarkerX !== null && (
          <div 
            className="news-marker-line selected"
            style={{ 
              left: `${selectedMarkerX}px`,
              borderColor: selectedMarkerColor || 'var(--accent)'
            }}
          />
        )}
        {hoveredMarkerX !== null && selectedMarkerX !== hoveredMarkerX && (
          <div 
            className="news-marker-line hovered"
            style={{ 
              left: `${hoveredMarkerX}px`,
              borderColor: hoveredMarkerColor || 'var(--text-secondary)'
            }}
          />
        )}
        {newsEvents.map(event => {
          const position = markerPositions.get(event.id)
          if (position === undefined) return null
          
          const iconSize = event.impact === 'high' ? 20 : 16
          
          return (
            <div
              key={event.id}
              className="news-marker"
              style={{
                left: `${position}px`,
                marginLeft: `-${iconSize / 2}px`,
              }}
              onClick={(e) => handleMarkerClick(e, event)}
              onMouseEnter={(e) => handleMarkerHover(e, event)}
              onMouseLeave={handleMarkerLeave}
              title={event.title}
            >
              <ArrowUpCircle 
                size={iconSize} 
                color={impactColors[event.impact]}
              />
            </div>
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
        top: `${position.y - 40}px`,
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