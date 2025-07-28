import { useEffect, useState } from 'react'
import { Globe, Circle } from 'lucide-react'

interface TradingSession {
  name: string
  market: string
  openTime: string
  closeTime: string
  isOpen?: boolean
}

const tradingSessions: TradingSession[] = [
  { name: 'Sydney', market: 'ASX', openTime: '10:00', closeTime: '16:00' },
  { name: 'Tokyo', market: 'JPX', openTime: '09:00', closeTime: '15:00' },
  { name: 'London', market: 'LSE', openTime: '08:00', closeTime: '16:30' },
  { name: 'New York', market: 'NYSE', openTime: '09:30', closeTime: '16:00' },
]

export function MarketStatus() {
  const [nzTime, setNzTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNzTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatNZTime = (date: Date) => {
    return date.toLocaleString('en-NZ', {
      timeZone: 'Pacific/Auckland',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const formatNZDate = (date: Date) => {
    return date.toLocaleString('en-NZ', {
      timeZone: 'Pacific/Auckland',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getMarketStatus = (session: TradingSession): boolean => {
    const now = new Date()
    const currentTime = now.toLocaleString('en-US', {
      timeZone: getTimeZone(session.market),
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    const [openHour, openMin] = session.openTime.split(':').map(Number)
    const [closeHour, closeMin] = session.closeTime.split(':').map(Number)
    const [currentHour, currentMin] = currentTime.split(':').map(Number)
    
    const currentMinutes = currentHour * 60 + currentMin
    const openMinutes = openHour * 60 + openMin
    const closeMinutes = closeHour * 60 + closeMin

    // Check if it's a weekend
    const dayOfWeek = now.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return false

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes
  }

  const getTimeZone = (market: string): string => {
    switch (market) {
      case 'ASX': return 'Australia/Sydney'
      case 'JPX': return 'Asia/Tokyo'
      case 'LSE': return 'Europe/London'
      case 'NYSE': return 'America/New_York'
      default: return 'Pacific/Auckland'
    }
  }

  return (
    <div className="market-status">
      <div className="nz-time">
        <div className="time-display">
          <span className="time">{formatNZTime(nzTime)}</span>
          <span className="timezone">NZDT</span>
        </div>
        <div className="date">{formatNZDate(nzTime)}</div>
      </div>

      <div className="trading-sessions">
        <h3>
          <Globe size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Global Markets
        </h3>
        <div className="sessions-grid">
          {tradingSessions.map(session => {
            const isOpen = getMarketStatus(session)
            return (
              <div key={session.name} className={`session ${isOpen ? 'open' : 'closed'}`}>
                <div className="session-name">{session.name}</div>
                <div className="session-status">
                  <Circle size={8} fill={isOpen ? '#3ecf8e' : '#f45171'} color={isOpen ? '#3ecf8e' : '#f45171'} />
                  {isOpen ? 'Open' : 'Closed'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}