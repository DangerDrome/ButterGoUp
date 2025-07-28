import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { IChartApi } from 'lightweight-charts'
import { ArrowUpCircle, ExternalLink, X } from 'lucide-react'
import type { NewsEvent } from '../types'
import { impactColors } from '../services/newsService'

interface NewsMarkersBarProps {
  newsEvents: NewsEvent[]
  chart: IChartApi
}

export function NewsMarkersBar({ newsEvents, chart }: NewsMarkersBarProps) {
  const [selectedNews, setSelectedNews] = useState<NewsEvent | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null)
  const [markerPositions, setMarkerPositions] = useState<Map<string, number>>(new Map())
  const [selectedMarkerX, setSelectedMarkerX] = useState<number | null>(null)
  const [hoveredMarkerX, setHoveredMarkerX] = useState<number | null>(null)
  const [selectedMarkerColor, setSelectedMarkerColor] = useState<string | null>(null)
  const [hoveredMarkerColor, setHoveredMarkerColor] = useState<string | null>(null)
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null)
  const [hoveredNewsId, setHoveredNewsId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalUrl, setModalUrl] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const closePopover = () => {
    setSelectedNews(null)
    setSelectedNewsId(null)
    setPopoverPosition(null)
    setSelectedMarkerX(null)
    setSelectedMarkerColor(null)
  }
  
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
      
      // Update selected marker position if one is selected
      if (selectedNewsId) {
        const selectedX = newPositions.get(selectedNewsId)
        if (selectedX !== undefined) {
          setSelectedMarkerX(selectedX)
          
          // Update popover position if it's visible
          if (selectedNews && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect()
            setPopoverPosition({
              x: containerRect.left + selectedX,
              y: containerRect.top
            })
          }
        } else {
          // Clear selected state if marker is no longer visible
          closePopover()
        }
      }
      
      // Update hovered marker position if one is hovered
      if (hoveredNewsId) {
        const hoveredX = newPositions.get(hoveredNewsId)
        if (hoveredX !== undefined) {
          setHoveredMarkerX(hoveredX)
        } else {
          // Clear hover state if marker is no longer visible
          setHoveredNewsId(null)
          setHoveredMarkerX(null)
          setHoveredMarkerColor(null)
        }
      }
      
      // Keep updating on next frame
      animationFrameId = requestAnimationFrame(updatePositions)
    }
    
    // Start the animation loop
    animationFrameId = requestAnimationFrame(updatePositions)
    
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [chart, newsEvents, selectedNewsId, hoveredNewsId, selectedNews])
  
  const handleMarkerClick = (_event: React.MouseEvent, newsEvent: NewsEvent) => {
    const markerX = markerPositions.get(newsEvent.id)
    
    if (markerX !== undefined && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      setPopoverPosition({
        x: containerRect.left + markerX,
        y: containerRect.top
      })
      setSelectedNews(newsEvent)
      setSelectedNewsId(newsEvent.id)
      setSelectedMarkerX(markerX)
      setSelectedMarkerColor(impactColors[newsEvent.impact])
    }
  }
  
  const handleMarkerHover = (_event: React.MouseEvent, newsEvent: NewsEvent) => {
    const markerX = markerPositions.get(newsEvent.id)
    // Only update if we're hovering a different marker
    if (hoveredNewsId !== newsEvent.id) {
      setHoveredNewsId(newsEvent.id)
      setHoveredMarkerX(markerX || null)
      setHoveredMarkerColor(impactColors[newsEvent.impact])
    }
  }
  
  const handleMarkerLeave = () => {
    setHoveredNewsId(null)
    setHoveredMarkerX(null)
    setHoveredMarkerColor(null)
  }
  
  return (
    <div 
      ref={containerRef} 
      className="news-markers-bar"
      onMouseLeave={() => {
        // Clear hover state when mouse leaves the entire container
        setHoveredNewsId(null)
        setHoveredMarkerX(null)
        setHoveredMarkerColor(null)
      }}>
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
      
      {selectedNews && popoverPosition && selectedMarkerX !== null && (
        <NewsPopover
          news={selectedNews}
          markerX={selectedMarkerX}
          onClose={closePopover}
          onOpenModal={(url) => {
            setModalUrl(url)
            setShowModal(true)
          }}
        />
      )}
      
      {showModal && modalUrl && (
        <LinkModal
          url={modalUrl}
          onClose={() => {
            setShowModal(false)
            setModalUrl(null)
          }}
        />
      )}
    </div>
  )
}

interface NewsPopoverProps {
  news: NewsEvent
  markerX: number
  onClose: () => void
  onOpenModal: (url: string) => void
}

function NewsPopover({ news, markerX, onClose, onOpenModal }: NewsPopoverProps) {
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
        position: 'absolute',
        left: `${markerX}px`,
        bottom: '100%',
        marginBottom: '40px',
        transform: 'translateX(-50%)'
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
          <button 
            onClick={(e) => {
              e.preventDefault()
              onOpenModal(news.url!)
            }}
            className="news-link-button"
          >
            <ExternalLink size={14} />
            View source
          </button>
        )}
      </div>
    </div>
  )
}

interface LinkModalProps {
  url: string
  onClose: () => void
}

function LinkModal({ url, onClose }: LinkModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const modalRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Simulate loading delay for iframe
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [url])
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])
  
  return (
    <div className="news-modal-overlay" onClick={onClose}>
      <div 
        ref={modalRef}
        className="news-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="news-modal-header">
          <h3>Source Content</h3>
          <button className="news-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="news-modal-content">
          {isLoading ? (
            <div className="news-modal-loading">Loading content...</div>
          ) : (
            <iframe 
              src={url}
              className="news-modal-iframe"
              title="Source content"
              sandbox="allow-same-origin allow-scripts"
            />
          )}
        </div>
        <div className="news-modal-footer">
          <a href={url} target="_blank" rel="noopener noreferrer" className="news-modal-link">
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>
      </div>
    </div>
  )
}