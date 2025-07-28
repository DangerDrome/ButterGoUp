import { useEffect, useState } from 'react'
import { Circle } from 'lucide-react'

interface TradingSession {
  name: string
  market: string
  openTime: string
  closeTime: string
}

const tradingSessions: TradingSession[] = [
  { name: 'SYD', market: 'ASX', openTime: '10:00', closeTime: '16:00' },
  { name: 'TKY', market: 'JPX', openTime: '09:00', closeTime: '15:00' },
  { name: 'LON', market: 'LSE', openTime: '08:00', closeTime: '16:30' },
  { name: 'NYC', market: 'NYSE', openTime: '09:30', closeTime: '16:00' },
]

export function MarketStatusCompact() {
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
      hour12: false
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
    <div className="market-status-compact">
      <div className="nz-time-compact">
        <span className="time-compact">{formatNZTime(nzTime)}</span>
        <span className="timezone-compact">NZDT</span>
      </div>
      
      <div className="markets-compact">
        {tradingSessions.map(session => {
          const isOpen = getMarketStatus(session)
          return (
            <div key={session.name} className={`market-compact ${isOpen ? 'open' : ''}`}>
              <Circle size={6} fill={isOpen ? '#3ecf8e' : '#f45171'} color={isOpen ? '#3ecf8e' : '#f45171'} />
              <span>{session.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}