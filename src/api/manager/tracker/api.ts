import request from '@/utils/http'
import {
  GetTrackerBreakdownReply,
  GetTrackerTrafficReply,
  GetTrackerTrendReply,
  GetTrackerTrendRequest,
  GetTrackerVisitorsReply,
  GetTrackerVisitorsRequest,
  ListTrackerAppReply,
  ListTrackerEventsReply,
  ListTrackerEventsRequest,
  ListTrackerPageReply,
  ListTrackerPointReply,
  ListTrackerPointRequest,
  ListTrackerRankReply,
  TrackerOverviewReply,
  TrackerOverviewRequest,
  UpdateTrackerPageRequest,
  UpdateTrackerPointRequest
} from './type'

export function ListTrackerApps() {
  return request.get<ListTrackerAppReply>({ url: '/manager/api/tracker/apps' })
}

export function GetTrackerTraffic(params: { app: string }) {
  return request.get<GetTrackerTrafficReply>({ url: '/manager/api/tracker/traffic', params })
}

export function GetTrackerOverview(params: TrackerOverviewRequest) {
  return request.get<TrackerOverviewReply>({ url: '/manager/api/tracker/overview', params })
}

export function GetTrackerTrend(params: GetTrackerTrendRequest) {
  return request.get<GetTrackerTrendReply>({ url: '/manager/api/tracker/trend', params })
}

export function GetTrackerVisitors(params: GetTrackerVisitorsRequest) {
  return request.get<GetTrackerVisitorsReply>({ url: '/manager/api/tracker/visitors', params })
}

export function ListTrackerRank(params: {
  app: string
  startAt: number
  endAt: number
  metric: string
  page?: string
  limit?: number
}) {
  return request.get<ListTrackerRankReply>({ url: '/manager/api/tracker/rank', params })
}

export function GetTrackerBreakdown(params: {
  app: string
  startAt: number
  endAt: number
  page: string
  point: string
  dimension: string
  metric: string
  limit?: number
}) {
  return request.get<GetTrackerBreakdownReply>({ url: '/manager/api/tracker/breakdown', params })
}

export function ListTrackerEvents(params: ListTrackerEventsRequest) {
  return request.get<ListTrackerEventsReply>({ url: '/manager/api/tracker/events', params })
}

export function ListTrackerPages(params: { app: string; keyword?: string; status?: boolean }) {
  return request.get<ListTrackerPageReply>({ url: '/manager/api/tracker/pages', params })
}

export function UpdateTrackerPage(data: UpdateTrackerPageRequest) {
  return request.put({ url: '/manager/api/tracker/page', data })
}

export function ListTrackerPoints(params: ListTrackerPointRequest) {
  return request.get<ListTrackerPointReply>({ url: '/manager/api/tracker/points', params })
}

export function UpdateTrackerPoint(data: UpdateTrackerPointRequest) {
  return request.put({ url: '/manager/api/tracker/point', data })
}
