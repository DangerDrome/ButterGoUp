import { useState } from 'react'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import type { NewsEvent } from '../types'
import { impactColors } from '../services/newsService'

interface NewsPanelProps {
  newsEvents: NewsEvent[]
  onNewsClick?: (news: NewsEvent) => void
}

export function NewsPanel({ newsEvents }: NewsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  if (newsEvents.length === 0) {
    return (
      <div className="news-panel">
        <h3>News & Events</h3>
        <p className="news-empty">No news events in this time range</p>
      </div>
    )
  }
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-NZ', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  return (
    <div className="news-panel">
      <h3>News & Events ({newsEvents.length})</h3>
      <div className="news-list">
        {newsEvents.map(news => {
          const isExpanded = expandedId === news.id
          
          return (
            <div key={news.id} className="news-item">
              <div 
                className="news-item-header"
                onClick={() => setExpandedId(isExpanded ? null : news.id)}
              >
                <div className="news-item-left">
                  <div 
                    className="news-impact-dot"
                    style={{ backgroundColor: impactColors[news.impact] }}
                  />
                  <div className="news-item-content">
                    <h4>{news.title}</h4>
                    <div className="news-item-meta">
                      <span className="news-date">
                        <Calendar size={12} />
                        {formatDate(news.time)}
                      </span>
                      <span className="news-source">{news.source}</span>
                    </div>
                  </div>
                </div>
                <button className="news-expand-btn">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              
              {isExpanded && (
                <div className="news-item-details">
                  <p>{news.description}</p>
                  {news.url && (
                    <a 
                      href={news.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="news-link"
                    >
                      Read full article →
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}