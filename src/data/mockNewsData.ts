import type { NewsEvent } from '../types'

export const mockNewsEvents: NewsEvent[] = [
  // 2024 Events
  {
    id: 'news-001',
    time: '2024-11-15',
    title: 'Fonterra raises forecast milk price to $9.50/kgMS',
    description: 'Fonterra has raised its 2024/25 season forecast Farmgate Milk Price range to $9.00-$10.00 per kgMS, up from the previous range of $8.25-$9.75 per kgMS.',
    source: 'Fonterra Co-operative Group',
    url: 'https://www.fonterra.com/nz/en/our-stories/media/fonterra-raises-forecast',
    category: 'commodity',
    impact: 'high',
    relatedIndicators: ['milk-farmgate', 'butter-export', 'wmp', 'smp']
  },
  {
    id: 'news-002',
    time: '2024-10-22',
    title: 'Global dairy prices surge 4.7% at GDT auction',
    description: 'The GDT Price Index rose 4.7%, with whole milk powder up 5.4% to US$3,559/tonne and butter prices climbing 3.2% to US$6,883/tonne.',
    source: 'GlobalDairyTrade',
    category: 'market',
    impact: 'high',
    relatedIndicators: ['butter-export', 'wmp', 'smp', 'amf']
  },
  {
    id: 'news-003',
    time: '2024-09-18',
    title: 'RBNZ holds OCR at 5.5% amid sticky inflation',
    description: 'The Reserve Bank of New Zealand kept the Official Cash Rate unchanged at 5.5%, citing persistent inflation pressures including rising food prices.',
    source: 'Reserve Bank of New Zealand',
    category: 'economic',
    impact: 'medium',
    relatedIndicators: ['ocr', 'cpi', 'nzdusd']
  },
  {
    id: 'news-004',
    time: '2024-08-05',
    title: 'Butter shortage hits NZ supermarkets',
    description: 'New Zealand consumers face empty butter shelves as strong export demand and limited local supply drive retail prices to record highs above $8 per 500g block.',
    source: 'NZ Herald',
    category: 'market',
    impact: 'high',
    relatedIndicators: ['butter-retail']
  },
  {
    id: 'news-005',
    time: '2024-07-12',
    title: 'EU-NZ trade deal increases dairy export quotas',
    description: 'The European Union and New Zealand finalize trade agreement, expanding dairy export quotas including a 15% increase for butter exports over 7 years.',
    source: 'Ministry of Foreign Affairs and Trade',
    category: 'regulatory',
    impact: 'medium',
    relatedIndicators: ['butter-export', 'wmp', 'smp']
  },
  
  // 2023 Events
  {
    id: 'news-006',
    time: '2023-12-15',
    title: 'La Niña weather pattern threatens milk production',
    description: 'NIWA confirms La Niña conditions expected to bring dry conditions to key dairy regions, potentially impacting milk production volumes for 2024 season.',
    source: 'NIWA',
    category: 'general',
    impact: 'medium',
    relatedIndicators: ['milk-farmgate', 'butter-export', 'wmp']
  },
  {
    id: 'news-007',
    time: '2023-10-03',
    title: 'China resumes imports of NZ dairy products',
    description: 'China lifts temporary restrictions on New Zealand dairy imports, boosting demand expectations for whole milk powder and butter in Q4 2023.',
    source: 'Ministry for Primary Industries',
    category: 'market',
    impact: 'high',
    relatedIndicators: ['wmp', 'butter-export', 'amf']
  },
  {
    id: 'news-008',
    time: '2023-08-22',
    title: 'Fonterra posts record annual revenue of $24.7B',
    description: 'Fonterra announces record revenue driven by strong global dairy prices, with butter and milk powder exports leading growth.',
    source: 'Fonterra Annual Report',
    category: 'commodity',
    impact: 'medium',
    relatedIndicators: ['butter-export', 'wmp', 'smp', 'milk-farmgate']
  },
  {
    id: 'news-009',
    time: '2023-06-14',
    title: 'RBNZ raises OCR to 5.5% to combat inflation',
    description: 'Reserve Bank increases Official Cash Rate by 25 basis points to 5.5%, the highest level since 2008, citing persistent inflation including food prices.',
    source: 'Reserve Bank of New Zealand',
    category: 'economic',
    impact: 'high',
    relatedIndicators: ['ocr', 'cpi', 'nzdusd', 'nzdaud']
  },
  {
    id: 'news-010',
    time: '2023-04-05',
    title: 'Global dairy demand softens on recession fears',
    description: 'GDT auction sees 7.1% price decline as global buyers reduce purchases amid economic uncertainty, butter prices fall 8.3% to US$5,245/tonne.',
    source: 'GlobalDairyTrade',
    category: 'market',
    impact: 'high',
    relatedIndicators: ['butter-export', 'wmp', 'smp']
  },
  
  // 2022 Events
  {
    id: 'news-011',
    time: '2022-11-28',
    title: 'Record butter prices as global shortage intensifies',
    description: 'International butter prices hit all-time high of US$7,200/tonne as European production falls and global demand remains strong.',
    source: 'USDA Foreign Agricultural Service',
    category: 'commodity',
    impact: 'high',
    relatedIndicators: ['butter-export', 'butter-retail']
  },
  {
    id: 'news-012',
    time: '2022-09-15',
    title: 'Spring milk production exceeds expectations',
    description: 'Favorable weather conditions boost New Zealand spring milk production 4.2% above forecast, easing supply concerns for dairy products.',
    source: 'DairyNZ',
    category: 'commodity',
    impact: 'medium',
    relatedIndicators: ['milk-farmgate', 'butter-export', 'wmp', 'smp']
  },
  {
    id: 'news-013',
    time: '2022-07-20',
    title: 'Ukraine conflict disrupts global dairy trade',
    description: 'Ongoing conflict in Ukraine affects global dairy supply chains, redirecting trade flows and supporting higher prices for New Zealand exports.',
    source: 'International Dairy Federation',
    category: 'market',
    impact: 'high',
    relatedIndicators: ['butter-export', 'wmp', 'smp', 'amf']
  },
  {
    id: 'news-014',
    time: '2022-05-10',
    title: 'Fonterra launches sustainability-linked pricing',
    description: 'Fonterra introduces new pricing structure rewarding farmers for meeting sustainability targets, potentially affecting future milk supply costs.',
    source: 'Fonterra Co-operative Group',
    category: 'regulatory',
    impact: 'low',
    relatedIndicators: ['milk-farmgate']
  },
  {
    id: 'news-015',
    time: '2022-03-02',
    title: 'NZ dollar strengthens on commodity boom',
    description: 'New Zealand dollar reaches 0.69 USD as surging commodity prices, including dairy exports, boost terms of trade.',
    source: 'Reserve Bank of New Zealand',
    category: 'economic',
    impact: 'medium',
    relatedIndicators: ['nzdusd', 'nzdaud', 'twi']
  },
  
  // 2021 Events
  {
    id: 'news-016',
    time: '2021-12-08',
    title: 'Supply chain crisis impacts dairy packaging',
    description: 'Global shipping delays and packaging shortages affect New Zealand dairy exporters, adding costs and delays to butter and milk powder shipments.',
    source: 'Dairy Companies Association of NZ',
    category: 'market',
    impact: 'medium',
    relatedIndicators: ['butter-export', 'wmp', 'smp']
  },
  {
    id: 'news-017',
    time: '2021-10-19',
    title: 'China dairy demand drives record GDT prices',
    description: 'Strong Chinese buying pushes GDT index up 4.3%, with butter prices reaching US$5,532/tonne amid global supply constraints.',
    source: 'GlobalDairyTrade',
    category: 'market',
    impact: 'high',
    relatedIndicators: ['butter-export', 'wmp', 'smp', 'amf']
  },
  {
    id: 'news-018',
    time: '2021-08-11',
    title: 'NZ enters COVID-19 lockdown, dairy deemed essential',
    description: 'New Zealand enters nationwide lockdown but dairy processing and exports continue as essential services, maintaining supply chains.',
    source: 'New Zealand Government',
    category: 'general',
    impact: 'low',
    relatedIndicators: ['butter-retail', 'milk-farmgate']
  },
  {
    id: 'news-019',
    time: '2021-06-03',
    title: 'Fonterra announces $8.40/kgMS forecast',
    description: 'Fonterra opens 2021/22 season with strong forecast milk price of $7.90-$8.90 per kgMS, reflecting robust global demand.',
    source: 'Fonterra Co-operative Group',
    category: 'commodity',
    impact: 'high',
    relatedIndicators: ['milk-farmgate', 'butter-export', 'wmp', 'smp']
  },
  {
    id: 'news-020',
    time: '2021-04-14',
    title: 'Environmental regulations tighten for dairy farms',
    description: 'New freshwater regulations come into effect, requiring dairy farmers to reduce nitrogen leaching by 2025, potentially impacting production costs.',
    source: 'Ministry for the Environment',
    category: 'regulatory',
    impact: 'medium',
    relatedIndicators: ['milk-farmgate']
  },
  
  // 2020 Events
  {
    id: 'news-021',
    time: '2020-11-25',
    title: 'COVID-19 shifts global dairy consumption patterns',
    description: 'Pandemic drives retail dairy demand up 15% while foodservice sector remains weak, creating volatility in butter and cheese markets.',
    source: 'International Dairy Federation',
    category: 'market',
    impact: 'high',
    relatedIndicators: ['butter-retail', 'butter-export']
  },
  {
    id: 'news-022',
    time: '2020-09-08',
    title: 'RBNZ introduces Funding for Lending Programme',
    description: 'Reserve Bank launches new monetary stimulus program to support economy, keeping OCR at record low 0.25% to boost recovery.',
    source: 'Reserve Bank of New Zealand',
    category: 'economic',
    impact: 'high',
    relatedIndicators: ['ocr', 'nzdusd', 'nzdaud']
  },
  {
    id: 'news-023',
    time: '2020-07-01',
    title: 'Dairy prices recover as economies reopen',
    description: 'Global dairy prices rebound from COVID lows, with butter up 23% from April as restaurants and cafes gradually reopen worldwide.',
    source: 'GlobalDairyTrade',
    category: 'market',
    impact: 'medium',
    relatedIndicators: ['butter-export', 'wmp', 'smp']
  },
  {
    id: 'news-024',
    time: '2020-04-22',
    title: 'Dairy exports remain resilient despite lockdowns',
    description: 'New Zealand dairy exports continue flowing to international markets despite domestic lockdown, supporting rural economy.',
    source: 'Ministry for Primary Industries',
    category: 'market',
    impact: 'medium',
    relatedIndicators: ['butter-export', 'wmp', 'smp', 'amf']
  },
  {
    id: 'news-025',
    time: '2020-02-05',
    title: 'Drought declared in North Island regions',
    description: 'Government declares drought in Northland and parts of Auckland, affecting dairy production and increasing feed costs for farmers.',
    source: 'Ministry for Primary Industries',
    category: 'general',
    impact: 'high',
    relatedIndicators: ['milk-farmgate', 'butter-export', 'wmp']
  }
]

// Helper function to get news events within a date range
export function getNewsInRange(startDate: string, endDate: string): NewsEvent[] {
  return mockNewsEvents.filter(event => {
    return event.time >= startDate && event.time <= endDate
  })
}

// Helper function to get news events related to specific indicators
export function getNewsForIndicator(indicatorId: string): NewsEvent[] {
  return mockNewsEvents.filter(event => 
    event.relatedIndicators?.includes(indicatorId) || false
  )
}

// Helper function to get news by impact level
export function getNewsByImpact(impact: 'high' | 'medium' | 'low'): NewsEvent[] {
  return mockNewsEvents.filter(event => event.impact === impact)
}