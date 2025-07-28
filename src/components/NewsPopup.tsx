import { useEffect, useRef, useState } from 'react'
import { X, ExternalLink, Calendar, Tag, AlertCircle } from 'lucide-react'
import type { NewsEvent } from '../types'
import { impactColors } from '../services/newsService'

interface NewsPopupProps {
  news: NewsEvent | null
  onClose: () => void
  anchorPosition?: { x: number; y: number }
}

export function NewsPopup({ news, onClose, anchorPosition }: NewsPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  
  // Calculate popover position
  useEffect(() => {
    if (!news || !popupRef.current || !anchorPosition) return
    
    const rect = popupRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    
    let top = anchorPosition.y - rect.height - 10
    let left = anchorPosition.x - rect.width / 2
    
    // Keep popover within viewport
    if (top < 10) {
      top = anchorPosition.y + 20
    }
    if (left < 10) {
      left = 10
    }
    if (left + rect.width > viewportWidth - 10) {
      left = viewportWidth - rect.width - 10
    }
    
    setPosition({ top, left })
  }, [news, anchorPosition])
  
  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    
    if (news) {
      // Small delay to prevent immediate close on marker click
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [news, onClose])
  
  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    if (news) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [news, onClose])
  
  if (!news) return null
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-NZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  
  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }
  
  return (
    <div 
      className="news-popover" 
      ref={popupRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
        <div className="news-popup-header">
          <h3>{news.title}</h3>
          <button className="news-popup-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="news-popup-meta">
          <div className="news-meta-item">
            <Calendar size={14} />
            <span>{formatDate(news.time)}</span>
          </div>
          <div className="news-meta-item">
            <Tag size={14} />
            <span>{getCategoryLabel(news.category)}</span>
          </div>
          <div 
            className="news-meta-item"
            style={{ color: impactColors[news.impact] }}
          >
            <AlertCircle size={14} />
            <span>{news.impact.toUpperCase()} Impact</span>
          </div>
        </div>
        
        <div className="news-popup-content">
          <p>{news.description}</p>
          
          <div className="news-popup-source">
            <span>Source: {news.source}</span>
          </div>
          
          {news.url && (
            <a 
              href={news.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="news-popup-link"
            >
              <span>Read full article</span>
              <ExternalLink size={16} />
            </a>
          )}
          
          {news.relatedIndicators && news.relatedIndicators.length > 0 && (
            <div className="news-popup-indicators">
              <h4>Related Indicators:</h4>
              <div className="related-indicators-list">
                {news.relatedIndicators.map(ind => (
                  <span key={ind} className="indicator-tag">
                    {ind.toUpperCase().replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  )
}