import type { NewsEvent } from '../types'
import { mockNewsEvents, getNewsInRange, getNewsByImpact } from '../data/mockNewsData'

// Color mapping for impact levels
export const impactColors = {
  high: '#f45171',    // Red
  medium: '#ff9800',  // Orange  
  low: '#3ecf8e'      // Green
}

// Shape mapping for news categories
export const categoryShapes = {
  economic: 'circle',
  commodity: 'square',
  regulatory: 'arrowUp',
  market: 'arrowDown',
  general: 'circle'
} as const

// Get news events for a specific date range and optionally filter by indicator
export async function fetchNewsEvents(
  startDate: string,
  endDate: string,
  indicatorId?: string
): Promise<NewsEvent[]> {
  // In production, this would make an API call
  // For now, use mock data
  let events = getNewsInRange(startDate, endDate)
  
  if (indicatorId) {
    events = events.filter(event => 
      event.relatedIndicators?.includes(indicatorId) || false
    )
  }
  
  // Return events without sorting (formatNewsForMarkers will handle sorting)
  return events
}

// Get recent high-impact news
export async function fetchHighImpactNews(limit: number = 5): Promise<NewsEvent[]> {
  const highImpactNews = getNewsByImpact('high')
  return highImpactNews.slice(0, limit)
}

// Search news by keyword
export function searchNews(keyword: string): NewsEvent[] {
  const lowercaseKeyword = keyword.toLowerCase()
  return mockNewsEvents.filter(event => 
    event.title.toLowerCase().includes(lowercaseKeyword) ||
    event.description.toLowerCase().includes(lowercaseKeyword) ||
    event.source.toLowerCase().includes(lowercaseKeyword)
  )
}

// Format news for chart markers
export function formatNewsForMarkers(events: NewsEvent[]) {
  // Sort events by time in ascending order before formatting
  const sortedEvents = [...events].sort((a, b) => a.time.localeCompare(b.time))
  
  return sortedEvents.map(event => ({
    time: event.time,
    position: 'belowBar' as const,
    color: impactColors[event.impact],
    shape: categoryShapes[event.category],
    text: '', // Empty text to just show the marker
    id: event.id,
    size: event.impact === 'high' ? 2 : 1
  }))
}

// Get news summary for a specific date
export function getNewsSummaryForDate(date: string): string {
  const events = mockNewsEvents.filter(event => event.time === date)
  if (events.length === 0) return ''
  
  if (events.length === 1) {
    return events[0].title
  }
  
  return `${events.length} news events`
}

// Future: Integration with real news APIs
export async function fetchFromNewsAPI(): Promise<NewsEvent[]> {
  // This would be implemented when integrating with NewsAPI
  // const API_KEY = import.meta.env.VITE_NEWS_API_KEY
  // const url = `https://newsapi.org/v2/everything?q=${query}&from=${fromDate}&to=${toDate}&apiKey=${API_KEY}`
  
  // For now, return mock data
  return mockNewsEvents
}

// Cache news data to reduce API calls
const newsCache = new Map<string, { data: NewsEvent[], timestamp: number }>()
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

export function getCachedNews(cacheKey: string): NewsEvent[] | null {
  const cached = newsCache.get(cacheKey)
  if (!cached) return null
  
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    newsCache.delete(cacheKey)
    return null
  }
  
  return cached.data
}

export function setCachedNews(cacheKey: string, data: NewsEvent[]): void {
  newsCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  })
}