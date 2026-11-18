export interface TrackerAppItem {
  app: string
  name: string
}

export interface ListTrackerAppReply {
  list: TrackerAppItem[]
}

export interface TrackerTrafficWindow {
  pv: number
  eventCount: number
  uv: number
  ipCount: number
  conversionCount: number
  startAt: number
  endAt: number
}

export interface TrackerTrafficExpected {
  available: boolean
  pv: number
  eventCount: number
  uv: number
  ipCount: number
  basisDays: number
  method: string
}

export interface GetTrackerTrafficReply {
  today: TrackerTrafficWindow
  yesterday: TrackerTrafficWindow
  lastWeekSameDay: TrackerTrafficWindow
  expected: TrackerTrafficExpected
}

export interface TrackerOverviewRequest {
  app: string
  startAt: number
  endAt: number
  page?: string
  point?: string
  compare?: 'prevDay' | 'prevWeek' | 'none'
}

export interface TrackerOverviewReply {
  pv: number
  eventCount: number
  uv: number
  ipCount: number
  conversionCount: number
  valueSum: number
  valueCount: number
  pageCount: number
  pointCount: number
  prevPv: number
  prevEventCount: number
  prevUv: number
  prevIpCount: number
  prevConversionCount: number
  prevValueSum: number
  prevValueCount: number
}

export interface TrackerTrendPoint {
  bucket: number
  pv: number
  eventCount: number
  uv: number
  valueSum: number
  valueCount: number
}

export interface TrackerTrendSeries {
  page: string
  point: string
  list: TrackerTrendPoint[]
}

export interface GetTrackerTrendRequest {
  app: string
  startAt: number
  endAt: number
  page?: string
  point?: string
  metric: 'event' | 'pv' | 'uv' | 'sum' | 'avg'
  compare?: 'prevDay' | 'prevWeek' | 'none'
}

export interface GetTrackerTrendReply {
  list: TrackerTrendSeries[]
  granularity: 'hour' | 'day'
  compareList: TrackerTrendSeries[]
}

export interface TrackerVisitorCohort {
  pv: number | string
  uv: number | string
  sessions: number | string
  bounceSessions: number | string
  durationSeconds: number | string
}

export interface GetTrackerVisitorsRequest {
  app: string
  startAt: number
  endAt: number
  page?: string
  point?: string
}

export interface GetTrackerVisitorsReply {
  available: boolean
  newVisitors: TrackerVisitorCohort
  oldVisitors: TrackerVisitorCohort
}

export interface TrackerRankItem {
  name?: string
  page: string
  point: string
  pv: number
  eventCount: number
  uv: number
  valueSum: number
  valueCount: number
}

export interface ListTrackerRankReply {
  list: TrackerRankItem[]
}

export interface TrackerBreakdownItem {
  value: string
  pv: number
  eventCount: number
  uv: number
  valueSum: number
  valueCount: number
}

export interface GetTrackerBreakdownReply {
  list: TrackerBreakdownItem[]
}

export interface TrackerEventItem {
  id: number
  createdAt: number
  app: string
  page: string
  point: string
  eventType: string
  distinctId: string
  userId: number
  value?: number
  propsJson: string
  url: string
  title: string
  referer: string
  device: string
  browser: string
  os: string
  ip: string
  sessionId: string
}

export interface ListTrackerEventsRequest {
  app: string
  startAt: number
  endAt: number
  page?: string
  point?: string
  distinctId?: string
  userId?: number
  cursor?: string
  limit?: number
}

export interface ListTrackerEventsReply {
  list: TrackerEventItem[]
  nextCursor: string
}

export interface TrackerPageItem {
  id: number
  app: string
  key: string
  name: string
  status: boolean
  pointCount: number
  createdAt: number
  updatedAt: number
}

export interface ListTrackerPageReply {
  list: TrackerPageItem[]
}

export interface UpdateTrackerPageRequest {
  id: number
  name?: string
  status?: boolean
}

export interface TrackerPointItem {
  id: number
  app: string
  page: string
  key: string
  name: string
  description: string
  dimensions: string[]
  status: boolean
  createdAt: number
  updatedAt: number
  pv: number
  eventCount: number
}

export interface ListTrackerPointReply {
  list: TrackerPointItem[]
}

export interface ListTrackerPointRequest {
  app: string
  page?: string
  keyword?: string
  status?: boolean
}

export interface UpdateTrackerPointRequest {
  id: number
  name?: string
  description?: string
  dimensionsJson?: string
  status?: boolean
}
