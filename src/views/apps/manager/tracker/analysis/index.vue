<template>
  <div class="tracker-analysis">
    <ElCard class="filter-card" shadow="never">
      <div class="filter-row">
        <ElSelect
          v-if="isManagerApp"
          v-model="selectedApp"
          class="filter-app"
          placeholder="选择应用"
          @change="handleAppChange"
        >
          <ElOption v-for="item in appList" :key="item.app" :label="item.name || item.app" :value="item.app" />
        </ElSelect>

        <ElButtonGroup>
          <ElButton
            v-for="item in quickRanges"
            :key="item.value"
            :type="activeQuick === item.value ? 'primary' : ''"
            @click="setQuickRange(item.value)"
          >
            {{ item.label }}
          </ElButton>
        </ElButtonGroup>

        <ElDatePicker
          v-model="dateRange"
          type="daterange"
          unlink-panels
          :disabled-date="disabledDate"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :clearable="false"
          @change="handleDateChange"
        />

        <ElSelect
          v-model="selectedPage"
          class="filter-page"
          clearable
          placeholder="全部页面"
          @change="handlePageChange"
        >
          <ElOption v-for="item in pageList" :key="item.key" :label="`${item.name}（${item.key}）`" :value="item.key" />
        </ElSelect>

        <ElSelect
          v-model="selectedPoint"
          class="filter-page"
          clearable
          placeholder="全部点位"
          @change="handlePointChange"
        >
          <ElOption
            v-for="item in currentPoints"
            :key="item.key"
            :label="`${item.name}（${item.key}）`"
            :value="item.key"
          />
        </ElSelect>

        <ElSelect v-model="metric" class="filter-metric" @change="loadDashboard">
          <ElOption label="指标：事件量" value="event" />
          <ElOption label="指标：PV" value="pv" />
          <ElOption label="指标：UV" value="uv" />
          <ElOption label="指标：数值和" value="sum" />
          <ElOption label="指标：均值" value="avg" />
        </ElSelect>

        <ElSelect v-model="compare" class="filter-compare" @change="loadDashboard">
          <ElOption label="对比前一日" value="prevDay" />
          <ElOption label="对比上周同期" value="prevWeek" />
          <ElOption label="不对比" value="none" />
        </ElSelect>

        <ElButton type="primary" :loading="loading" :icon="Refresh" @click="refreshAll">刷新</ElButton>
      </div>
    </ElCard>

    <div class="traffic-grid" v-loading="trafficLoading">
      <div v-for="card in trafficCards" :key="card.key" class="traffic-card" :class="{ 'is-expected': card.expected }">
        <div class="traffic-card__head">
          <span>{{ card.title }}</span>
          <ElTooltip v-if="card.expected" :content="expectedTooltip" placement="top">
            <ElTag size="small" type="warning" effect="plain">预估</ElTag>
          </ElTooltip>
        </div>
        <div class="traffic-card__hero">
          <strong>{{ card.pv }}</strong>
          <span>PV</span>
        </div>
        <div class="traffic-card__metrics">
          <div
            ><span>访客</span><b>{{ card.uv }}</b></div
          >
          <div
            ><span>IP</span><b>{{ card.ip }}</b></div
          >
          <div
            ><span>转化</span><b>{{ card.conversion }}</b></div
          >
        </div>
      </div>
    </div>

    <div class="overview-grid" v-loading="loading">
      <div v-for="item in overviewCards" :key="item.label" class="overview-card">
        <div class="overview-card__label">{{ item.label }}</div>
        <div class="overview-card__value">{{ item.value }}</div>
        <div class="overview-card__compare" :class="item.trendClass">{{ item.compare }}</div>
      </div>
    </div>

    <div class="chart-grid">
      <ElCard class="chart-card chart-card--wide" shadow="never">
        <template #header>
          <div class="card-header">
            <div>
              <span class="card-header__title">每日访问量趋势</span>
              <span class="card-header__tip">{{ rangeLabel }}</span>
            </div>
            <div class="card-header__actions">
              <ElRadioGroup v-model="trendMetric" size="small">
                <ElRadioButton label="pv">浏览量(PV)</ElRadioButton>
                <ElRadioButton label="uv">访客数(UV)</ElRadioButton>
                <ElRadioButton label="event">事件量</ElRadioButton>
              </ElRadioGroup>
              <ElTag effect="plain">{{ granularity === 'day' ? '按天' : '按小时' }}</ElTag>
            </div>
          </div>
        </template>
        <ArtLineChart
          height="330px"
          :data="trendChartData"
          :xAxisData="trendLabels"
          :showLegend="true"
          :loading="loading"
          :showAreaColor="true"
          legendPosition="top"
        />
      </ElCard>

      <ElCard class="chart-card visitor-card" shadow="never" v-loading="visitorLoading">
        <template #header>
          <div class="card-header">
            <div>
              <span class="card-header__title">新老访客</span>
              <span class="card-header__tip">{{ rangeLabel }}</span>
            </div>
            <ElTag effect="plain">按访客去重</ElTag>
          </div>
        </template>
        <div class="visitor-summary">
          <svg class="visitor-avatar" viewBox="0 0 88 88" aria-hidden="true">
            <defs>
              <linearGradient id="visitor-new-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#b8efaa" />
                <stop offset="1" stop-color="#79d46a" />
              </linearGradient>
            </defs>
            <circle cx="44" cy="25" r="14" fill="url(#visitor-new-gradient)" />
            <path d="M29 49c-5 3-9 9-11 17-1 5 2 8 7 8h20c5 0 8-3 7-8-2-10-8-16-15-18Z" fill="#dceaff" />
            <path d="M47 48c13 1 23 10 25 21 1 4-2 7-6 7H49c-5 0-8-3-7-8 1-10 3-16 5-20Z" fill="#75a9f4" />
          </svg>
          <div class="visitor-share visitor-share--new">
            <span>新访客</span>
            <strong>{{ newVisitorRate }}</strong>
          </div>
          <div class="visitor-share visitor-share--old">
            <span>老访客</span>
            <strong>{{ oldVisitorRate }}</strong>
          </div>
        </div>
        <div class="visitor-table">
          <div v-for="row in visitorRows" :key="row.label" class="visitor-table__row">
            <span>{{ row.label }}</span>
            <b>{{ row.newValue }}</b>
            <b>{{ row.oldValue }}</b>
          </div>
        </div>
      </ElCard>
    </div>

    <ElCard v-if="selectedPoint" class="section-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-header__title">维度分布</span>
          <ElSelect
            v-if="dimensionOptions.length"
            v-model="selectedDimension"
            class="dimension-select"
            @change="loadBreakdown"
          >
            <ElOption v-for="item in dimensionOptions" :key="item" :label="dimensionLabel(item)" :value="item" />
          </ElSelect>
        </div>
      </template>
      <ElEmpty
        v-if="!dimensionOptions.length"
        description="该点位尚未声明维度，可在“页面点位”中配置"
        :image-size="80"
      />
      <ElTable v-else :data="breakdownList" size="small" v-loading="breakdownLoading">
        <ElTableColumn prop="value" label="维度值" min-width="180" show-overflow-tooltip />
        <ElTableColumn prop="pv" label="PV" width="100" align="right" />
        <ElTableColumn prop="eventCount" label="事件量" width="110" align="right" />
        <ElTableColumn prop="uv" label="UV" width="100" align="right" />
        <ElTableColumn prop="valueSum" label="数值和" width="120" align="right" />
        <ElTableColumn prop="valueCount" label="数值事件" width="110" align="right" />
      </ElTable>
    </ElCard>

    <ElCard class="section-card event-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <span class="card-header__title">事件明细</span>
            <span class="card-header__tip">按服务端接收时间倒序，仅查询最近 7 天</span>
          </div>
          <ElButton :loading="eventLoading" @click="loadEvents(true)">加载更多</ElButton>
        </div>
      </template>

      <ElTable :data="eventList" size="small" v-loading="eventLoading">
        <ElTableColumn label="时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="page" label="页面" width="140" show-overflow-tooltip />
        <ElTableColumn prop="point" label="点位" min-width="170" show-overflow-tooltip />
        <ElTableColumn prop="eventType" label="类型" width="90" />
        <ElTableColumn label="用户/访客" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.userId || '-' }} / {{ row.distinctId || '-' }}</template>
        </ElTableColumn>
        <ElTableColumn prop="device" label="设备" width="90" />
        <ElTableColumn prop="browser" label="浏览器" width="110" show-overflow-tooltip />
        <ElTableColumn label="属性" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">{{ prettyProps(row.propsJson) }}</template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Refresh } from '@element-plus/icons-vue'
  import {
    GetTrackerBreakdown,
    GetTrackerOverview,
    GetTrackerTraffic,
    GetTrackerTrend,
    GetTrackerVisitors,
    ListTrackerApps,
    ListTrackerEvents,
    ListTrackerPages,
    ListTrackerPoints
  } from '@/api/manager/tracker/api'
  import { getAppKeyword } from '@/utils/app-context'
  import { isHttpError } from '@/utils/http/error'
  import type {
    GetTrackerTrafficReply,
    GetTrackerVisitorsReply,
    ListTrackerEventsReply,
    TrackerAppItem,
    TrackerBreakdownItem,
    TrackerEventItem,
    TrackerOverviewReply,
    TrackerPageItem,
    TrackerPointItem,
    TrackerTrendPoint,
    TrackerVisitorCohort
  } from '@/api/manager/tracker/type'

  defineOptions({ name: 'TrackerAnalysis' })

  const isManagerApp = getAppKeyword() === 'manager'

  type QuickRange = 'today' | 'yesterday' | 'last7' | 'last30'

  const DAY_SECONDS = 86400
  const quickRanges: Array<{ label: string; value: QuickRange }> = [
    { label: '今天', value: 'today' },
    { label: '昨天', value: 'yesterday' },
    { label: '最近 7 天', value: 'last7' },
    { label: '最近 30 天', value: 'last30' }
  ]

  const appList = ref<TrackerAppItem[]>([])
  const pageList = ref<TrackerPageItem[]>([])
  const pointList = ref<TrackerPointItem[]>([])
  const selectedApp = ref('')
  const selectedPage = ref('')
  const selectedPoint = ref('')
  const selectedDimension = ref('')
  const metric = ref<'event' | 'pv' | 'uv' | 'sum' | 'avg'>('event')
  const trendMetric = ref<'pv' | 'uv' | 'event'>('pv')
  const compare = ref<'prevDay' | 'prevWeek' | 'none'>('prevDay')
  const activeQuick = ref<QuickRange>('last7')
  const dateRange = ref<Date[]>([])

  const traffic = ref<GetTrackerTrafficReply>()
  const overview = ref<TrackerOverviewReply>()
  const trendPoints = ref<TrackerTrendPoint[]>([])
  const compareTrendPoints = ref<TrackerTrendPoint[]>([])
  const granularity = ref<'hour' | 'day'>('day')
  const visitorStats = ref<GetTrackerVisitorsReply>()
  const breakdownList = ref<TrackerBreakdownItem[]>([])
  const eventList = ref<TrackerEventItem[]>([])
  const nextCursor = ref('')

  const loading = ref(false)
  const trafficLoading = ref(false)
  const visitorLoading = ref(false)
  const breakdownLoading = ref(false)
  const eventLoading = ref(false)

  const currentPoints = computed(() =>
    pointList.value.filter((item) => !selectedPage.value || item.page === selectedPage.value)
  )
  const selectedPointMeta = computed(() =>
    pointList.value.find((item) => item.key === selectedPoint.value && item.page === selectedPage.value)
  )
  const dimensionOptions = computed(() => selectedPointMeta.value?.dimensions ?? [])
  const range = computed(() => resolveRange(activeQuick.value, dateRange.value))
  const eventRange = computed(() => {
    const { startAt, endAt } = range.value
    return { startAt: Math.max(startAt, endAt - 7 * DAY_SECONDS), endAt }
  })
  const rangeLabel = computed(() => `${formatDate(range.value.startAt)} 至 ${formatDate(range.value.endAt - 1)}`)
  const expectedTooltip = computed(() => {
    const expected = traffic.value?.expected
    if (!expected?.available)
      return '完整历史基线仍在积累，或当日进度不足 5%，暂不估算；预计今日估算 PV、事件量、访客和 IP'
    if (expected.method === 'recent_day_share_median') {
      return `同星期基线不足 3 天，暂按最近 ${expected.basisDays} 个完整日的同时间进度估算，仅供参考`
    }
    return `基于最近 4 个同星期几的全天曲线按当前进度估算，有效基线 ${expected.basisDays} 天`
  })

  const trafficCards = computed(() => {
    const empty = { pv: '--', uv: '--', ip: '--', conversion: '--' }
    return [
      { key: 'today', title: '今日', expected: false, ...(traffic.value ? windowOf(traffic.value.today) : empty) },
      {
        key: 'yesterday',
        title: '昨日',
        expected: false,
        ...(traffic.value ? windowOf(traffic.value.yesterday) : empty)
      },
      {
        key: 'expected',
        title: '预计今日',
        expected: true,
        pv: traffic.value?.expected.available ? formatNumber(traffic.value.expected.pv) : '--',
        uv: traffic.value?.expected.available ? formatNumber(traffic.value.expected.uv) : '--',
        ip: traffic.value?.expected.available ? formatNumber(traffic.value.expected.ipCount) : '--',
        conversion: '--'
      }
    ]
  })

  const overviewCards = computed(() => {
    const data = overview.value
    const pvComparison = estimatedComparison(data?.pv, traffic.value?.today?.pv, traffic.value?.expected?.pv)
    const eventComparison = estimatedComparison(
      data?.eventCount,
      traffic.value?.today?.eventCount,
      traffic.value?.expected?.eventCount
    )
    const uvComparison = estimatedComparison(data?.uv, traffic.value?.today?.uv, traffic.value?.expected?.uv)
    const ipComparison = estimatedComparison(
      data?.ipCount,
      traffic.value?.today?.ipCount,
      traffic.value?.expected?.ipCount
    )
    return [
      metricCard('PV', data?.pv, data?.prevPv, false, pvComparison),
      metricCard('事件量', data?.eventCount, data?.prevEventCount, false, eventComparison),
      metricCard('UV', data?.uv, data?.prevUv, false, uvComparison),
      metricCard(
        'IP 数',
        selectedPage.value ? undefined : data?.ipCount,
        selectedPage.value ? undefined : data?.prevIpCount,
        false,
        selectedPage.value ? undefined : ipComparison
      ),
      metricCard('转化次数', data?.conversionCount, data?.prevConversionCount),
      metricCard(
        '数值均值',
        Number(data?.valueCount) ? Number(data?.valueSum) / Number(data?.valueCount) : 0,
        Number(data?.prevValueCount) ? Number(data?.prevValueSum) / Number(data?.prevValueCount) : 0,
        true
      ),
      metricCard('活跃页面', data?.pageCount),
      metricCard('活跃点位', data?.pointCount)
    ]
  })

  const visitorTotal = computed(() => {
    const data = visitorStats.value
    return Number(data?.newVisitors?.uv || 0) + Number(data?.oldVisitors?.uv || 0)
  })
  const newVisitorRate = computed(() =>
    formatVisitorRate(Number(visitorStats.value?.newVisitors?.uv || 0), visitorTotal.value)
  )
  const oldVisitorRate = computed(() =>
    formatVisitorRate(Number(visitorStats.value?.oldVisitors?.uv || 0), visitorTotal.value)
  )
  const visitorRows = computed(() => [
    {
      label: '浏览量',
      newValue: visitorMetric(visitorStats.value?.newVisitors, 'pv'),
      oldValue: visitorMetric(visitorStats.value?.oldVisitors, 'pv')
    },
    {
      label: '访客数',
      newValue: visitorMetric(visitorStats.value?.newVisitors, 'uv'),
      oldValue: visitorMetric(visitorStats.value?.oldVisitors, 'uv')
    },
    {
      label: '跳出率',
      newValue: visitorMetric(visitorStats.value?.newVisitors, 'bounce'),
      oldValue: visitorMetric(visitorStats.value?.oldVisitors, 'bounce')
    },
    {
      label: '平均访问时长',
      newValue: visitorMetric(visitorStats.value?.newVisitors, 'duration'),
      oldValue: visitorMetric(visitorStats.value?.oldVisitors, 'duration')
    },
    {
      label: '平均访问页数',
      newValue: visitorMetric(visitorStats.value?.newVisitors, 'pages'),
      oldValue: visitorMetric(visitorStats.value?.oldVisitors, 'pages')
    }
  ])

  const trendLabels = computed(() => trendPoints.value.map((item) => formatBucket(item.bucket, granularity.value)))
  const trendChartData = computed(() => {
    const config = {
      pv: { name: '浏览量(PV)', pick: (item: TrackerTrendPoint) => item.pv },
      uv: { name: '访客数(UV)', pick: (item: TrackerTrendPoint) => item.uv },
      event: { name: '事件量', pick: (item: TrackerTrendPoint) => item.eventCount }
    }[trendMetric.value]
    const series = [{ name: config.name, data: trendPoints.value.map(config.pick) }]
    if (compare.value !== 'none' && compareTrendPoints.value.length) {
      series.push({ name: `${config.name} 对比`, data: compareTrendPoints.value.map(config.pick) })
    }
    return series
  })

  onMounted(async () => {
    setQuickRange('last7')
    try {
      if (isManagerApp) {
        const res = await ListTrackerApps()
        appList.value = res.list || []
        selectedApp.value = appList.value[0]?.app || ''
      } else {
        selectedApp.value = getAppKeyword()
      }
      if (selectedApp.value) await handleAppChange(selectedApp.value)
    } catch (error) {
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '加载点位应用失败')
    }
  })

  function setQuickRange(value: QuickRange) {
    activeQuick.value = value
    const today = startOfDay(new Date())
    const startAt =
      value === 'today'
        ? today
        : value === 'yesterday'
          ? today - DAY_SECONDS
          : value === 'last7'
            ? today - 6 * DAY_SECONDS
            : today - 29 * DAY_SECONDS
    const endAt = today + DAY_SECONDS
    dateRange.value = [new Date(startAt * 1000), new Date((endAt - 1) * 1000)]
    if (selectedApp.value) void loadAll()
  }

  function handleDateChange() {
    if (!dateRange.value?.length) return
    activeQuick.value = 'last7'
    void loadAll()
  }

  async function handleAppChange(app: string) {
    selectedPage.value = ''
    selectedPoint.value = ''
    selectedDimension.value = ''
    if (!app) return
    try {
      await Promise.all([loadTraffic(), loadPages(), loadPoints()])
    } catch (error) {
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '加载点位基础数据失败')
      return
    }
    await loadAll()
  }

  function handlePageChange() {
    selectedPoint.value = ''
    selectedDimension.value = ''
    void loadAll()
  }

  function handlePointChange() {
    void Promise.all([loadDashboard(), loadVisitors()])
  }

  async function loadAll() {
    if (!selectedApp.value) return
    await Promise.all([loadDashboard(), loadVisitors(), loadEvents(false), loadBreakdown()])
  }

  async function refreshAll() {
    if (!selectedApp.value) return
    await Promise.all([loadTraffic(), loadAll()])
  }

  async function loadTraffic() {
    if (!selectedApp.value) return
    trafficLoading.value = true
    try {
      traffic.value = await GetTrackerTraffic({ app: selectedApp.value })
    } catch (error) {
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '加载今日流量失败')
    } finally {
      trafficLoading.value = false
    }
  }

  async function loadPages() {
    if (!selectedApp.value) return
    const res = await ListTrackerPages({ app: selectedApp.value })
    pageList.value = res.list || []
  }

  async function loadPoints() {
    if (!selectedApp.value) return
    const res = await ListTrackerPoints({ app: selectedApp.value })
    pointList.value = res.list || []
  }

  async function loadDashboard() {
    if (!selectedApp.value) return
    loading.value = true
    const { startAt, endAt } = range.value
    try {
      const [overviewRes, trendRes] = await Promise.all([
        GetTrackerOverview({
          app: selectedApp.value,
          startAt,
          endAt,
          page: selectedPage.value || undefined,
          point: selectedPoint.value || undefined,
          compare: compare.value
        }),
        GetTrackerTrend({
          app: selectedApp.value,
          startAt,
          endAt,
          page: selectedPage.value || undefined,
          point: selectedPoint.value || undefined,
          metric: metric.value,
          compare: compare.value
        })
      ])
      overview.value = overviewRes
      trendPoints.value = trendRes.list?.[0]?.list || []
      compareTrendPoints.value = trendRes.compareList?.[0]?.list || []
      granularity.value = trendRes.granularity || 'day'
    } catch (error) {
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '加载点位看板失败')
    } finally {
      loading.value = false
    }
  }

  async function loadVisitors() {
    if (!selectedApp.value) return
    visitorLoading.value = true
    const { startAt, endAt } = range.value
    try {
      visitorStats.value = await GetTrackerVisitors({
        app: selectedApp.value,
        startAt,
        endAt,
        page: selectedPage.value || undefined,
        point: selectedPoint.value || undefined
      })
    } catch (error) {
      visitorStats.value = undefined
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '加载新老访客失败')
    } finally {
      visitorLoading.value = false
    }
  }

  async function loadBreakdown() {
    const point = selectedPointMeta.value
    if (!point || !dimensionOptions.value.length) {
      breakdownList.value = []
      selectedDimension.value = ''
      return
    }
    if (!dimensionOptions.value.includes(selectedDimension.value)) selectedDimension.value = dimensionOptions.value[0]
    breakdownLoading.value = true
    try {
      const res = await GetTrackerBreakdown({
        app: selectedApp.value,
        startAt: range.value.startAt,
        endAt: range.value.endAt,
        page: point.page,
        point: point.key,
        dimension: selectedDimension.value,
        metric: metric.value === 'pv' ? 'pv' : metric.value,
        limit: 30
      })
      breakdownList.value = res.list || []
    } catch (error) {
      breakdownList.value = []
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '加载维度分布失败')
    } finally {
      breakdownLoading.value = false
    }
  }

  async function loadEvents(append: boolean) {
    if (!selectedApp.value) return
    eventLoading.value = true
    const { startAt, endAt } = eventRange.value
    try {
      const res: ListTrackerEventsReply = await ListTrackerEvents({
        app: selectedApp.value,
        startAt,
        endAt,
        page: selectedPage.value || undefined,
        point: selectedPoint.value || undefined,
        cursor: append ? nextCursor.value || undefined : undefined,
        limit: 50
      })
      eventList.value = append ? [...eventList.value, ...(res.list || [])] : res.list || []
      nextCursor.value = res.nextCursor || ''
    } catch (error) {
      if (!append) eventList.value = []
      nextCursor.value = ''
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '加载事件明细失败')
    } finally {
      eventLoading.value = false
    }
  }

  function disabledDate(date: Date) {
    const today = startOfDay(new Date())
    const timestamp = Math.floor(date.getTime() / 1000)
    return timestamp < today - 89 * DAY_SECONDS || timestamp > today
  }

  function resolveRange(quick: QuickRange, selected: Date[]) {
    if (selected?.length === 2) {
      return { startAt: startOfDay(selected[0]), endAt: startOfDay(selected[1]) + DAY_SECONDS }
    }
    const today = startOfDay(new Date())
    if (quick === 'today') return { startAt: today, endAt: today + DAY_SECONDS }
    if (quick === 'yesterday') return { startAt: today - DAY_SECONDS, endAt: today }
    if (quick === 'last30') return { startAt: today - 29 * DAY_SECONDS, endAt: today + DAY_SECONDS }
    return { startAt: today - 6 * DAY_SECONDS, endAt: today + DAY_SECONDS }
  }

  function startOfDay(date: Date) {
    return Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 1000)
  }

  function windowOf(value: GetTrackerTrafficReply['today']) {
    return {
      pv: formatNumber(value.pv),
      uv: formatNumber(value.uv),
      ip: formatNumber(value.ipCount),
      conversion: formatNumber(value.conversionCount)
    }
  }

  interface MetricComparison {
    value: number | string
    estimated: boolean
    unavailable?: boolean
  }

  function estimatedComparison(
    actual?: number | string,
    todayActual?: number | string,
    expected?: number | string
  ): MetricComparison | undefined {
    if (actual === undefined || actual === null || actual === '') return undefined
    const today = startOfDay(new Date())
    if (range.value.startAt > today || range.value.endAt <= today) return undefined
    if (selectedPage.value || selectedPoint.value) return undefined
    const expectedData = traffic.value?.expected
    if (!expectedData?.available) return { value: actual, estimated: false, unavailable: true }
    const current = Number(actual)
    const currentToday = Number(todayActual) || 0
    const expectedValue = Number(expected)
    if (!Number.isFinite(expectedValue) || expectedValue <= 0) {
      return { value: actual, estimated: false, unavailable: true }
    }
    return {
      value: Math.max(0, current - currentToday + expectedValue),
      estimated: true
    }
  }

  function metricCard(
    label: string,
    value?: number | string,
    prev?: number | string,
    decimal = false,
    comparison?: MetricComparison
  ) {
    if (value === undefined || value === null || value === '') {
      return { label, value: '--', compare: '页面/点位筛选下不可用', trendClass: 'is-neutral' }
    }
    const current = Number(value)
    const previous = prev === undefined || prev === null || prev === '' ? undefined : Number(prev)
    const compareCurrent = comparison ? Number(comparison.value) : current
    const hasCompare =
      !comparison?.unavailable &&
      previous !== undefined &&
      Number.isFinite(previous) &&
      previous !== 0 &&
      Number.isFinite(compareCurrent)
    const compareText = comparison?.unavailable
      ? '预估不可用'
      : !hasCompare
        ? '无对比数据'
        : `${comparison?.estimated ? '预计 ' : ''}${compareCurrent >= previous ? '+' : ''}${(((compareCurrent - previous) / previous) * 100).toFixed(1)}%`
    return {
      label,
      value: decimal ? current.toFixed(2) : formatNumber(current),
      compare: compareText,
      trendClass: !hasCompare ? 'is-neutral' : compareCurrent >= previous ? 'is-up' : 'is-down'
    }
  }

  type VisitorMetric = 'pv' | 'uv' | 'bounce' | 'duration' | 'pages'

  function formatVisitorRate(value: number, total: number) {
    if (!total) return '--'
    const rate = (value / total) * 100
    return `${Number.isInteger(rate) ? rate.toFixed(0) : rate.toFixed(1)}%`
  }

  function visitorMetric(cohort: TrackerVisitorCohort | undefined, metric: VisitorMetric) {
    if (!cohort || Number(cohort.uv || 0) <= 0) return '--'
    const pv = Number(cohort.pv || 0)
    const sessions = Number(cohort.sessions || 0)
    if (metric === 'pv') return formatNumber(pv)
    if (metric === 'uv') return formatNumber(cohort.uv)
    if (sessions <= 0) return '--'
    if (metric === 'bounce') return formatVisitorRate(Number(cohort.bounceSessions || 0), sessions)
    if (metric === 'duration') return formatDuration(Number(cohort.durationSeconds || 0) / sessions)
    const pages = pv / sessions
    return Number.isInteger(pages) ? String(pages) : pages.toFixed(1)
  }

  function formatDuration(value: number) {
    const total = Math.max(0, Math.round(value))
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60
    return [hours, minutes, seconds].map((item) => String(item).padStart(2, '0')).join(':')
  }

  function formatNumber(value?: number | string) {
    return new Intl.NumberFormat('zh-CN').format(Number(value) || 0)
  }

  function formatDate(timestamp: number) {
    const date = new Date(timestamp * 1000)
    return `${date.getMonth() + 1}-${date.getDate()}`
  }

  function formatDateTime(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleString('zh-CN', { hour12: false })
  }

  function formatBucket(timestamp: number, mode: 'hour' | 'day') {
    const date = new Date(timestamp * 1000)
    if (mode === 'day') return `${date.getMonth() + 1}/${date.getDate()}`
    return `${String(date.getHours()).padStart(2, '0')}:00`
  }

  function dimensionLabel(value: string) {
    return { $device: '设备', $browser: '浏览器', $os: '操作系统', $event_type: '事件类型' }[value] || value
  }

  function prettyProps(value: string) {
    if (!value) return '-'
    try {
      return JSON.stringify(JSON.parse(value))
    } catch {
      return value
    }
  }
</script>

<style lang="scss" scoped>
  .tracker-analysis {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .filter-card :deep(.el-card__body) {
    padding: 14px 16px;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .filter-app {
    width: 180px;
  }

  .filter-page {
    width: 190px;
  }

  .filter-metric,
  .filter-compare {
    width: 150px;
  }

  .traffic-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .traffic-card {
    padding: 18px 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: calc(var(--custom-radius) / 2 + 4px);
    box-shadow: var(--el-box-shadow-light);

    &.is-expected {
      background: linear-gradient(135deg, var(--el-color-warning-light-9), var(--el-bg-color));
      border-color: var(--el-color-warning-light-5);
    }
  }

  .traffic-card__head,
  .card-header,
  .traffic-card__metrics {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .traffic-card__head {
    color: var(--art-text-gray-700);
    font-size: 14px;
  }

  .traffic-card__hero {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin: 12px 0 16px;

    strong {
      font-size: 34px;
      font-weight: 700;
      line-height: 1;
      color: var(--el-text-color-primary);
    }

    span {
      color: var(--art-text-gray-500);
      font-size: 13px;
    }
  }

  .traffic-card__metrics {
    gap: 12px;

    > div {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 5px;
      padding-top: 12px;
      border-top: 1px dashed var(--el-border-color-lighter);
    }

    span {
      color: var(--art-text-gray-500);
      font-size: 12px;
    }

    b {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .overview-card {
    padding: 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: calc(var(--custom-radius) / 2 + 2px);
  }

  .overview-card__label {
    color: var(--art-text-gray-500);
    font-size: 13px;
  }

  .overview-card__value {
    margin: 9px 0 7px;
    font-size: 24px;
    font-weight: 650;
    color: var(--el-text-color-primary);
  }

  .overview-card__compare {
    font-size: 12px;
    color: var(--art-text-gray-500);
  }

  .overview-card__compare.is-up {
    color: var(--el-color-success);
  }

  .overview-card__compare.is-down {
    color: var(--el-color-danger);
  }

  .chart-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(420px, 0.8fr);
    gap: 16px;
  }

  .chart-card :deep(.el-card__body),
  .section-card :deep(.el-card__body) {
    padding: 14px 16px;
  }

  .card-header {
    gap: 12px;
  }

  .card-header__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-header__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .card-header__tip {
    margin-left: 8px;
    color: var(--art-text-gray-500);
    font-size: 12px;
    font-weight: 400;
  }

  .visitor-card :deep(.el-card__body) {
    display: flex;
    min-height: 330px;
    flex-direction: column;
  }

  .visitor-summary {
    display: grid;
    grid-template-columns: 100px repeat(2, minmax(0, 1fr));
    align-items: center;
    min-height: 126px;
  }

  .visitor-avatar {
    width: 86px;
    height: 86px;
  }

  .visitor-share {
    display: flex;
    min-height: 74px;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    padding-left: 24px;
    border-left: 1px solid var(--el-border-color-lighter);

    span {
      color: var(--art-text-gray-700);
      font-size: 16px;
    }

    strong {
      font-size: 30px;
      font-weight: 500;
      line-height: 1;
    }
  }

  .visitor-share--new strong {
    color: #5bc84f;
  }

  .visitor-share--old strong {
    color: #5f9ced;
  }

  .visitor-table {
    margin-top: auto;
    border-top: 1px solid var(--el-border-color-lighter);
    border-left: 1px solid var(--el-border-color-lighter);
  }

  .visitor-table__row {
    display: grid;
    grid-template-columns: 1.1fr 1fr 1fr;
    font-size: 13px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    > span,
    > b {
      display: flex;
      min-height: 42px;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
      border-right: 1px solid var(--el-border-color-lighter);
      font-weight: 400;
    }

    > span {
      color: var(--art-text-gray-600);
      background: var(--el-fill-color-lighter);
    }

    > b {
      color: var(--el-text-color-primary);
      font-variant-numeric: tabular-nums;
    }
  }

  .dimension-select {
    width: 180px;
  }

  @media (max-width: 1440px) {
    .overview-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .chart-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 900px) {
    .traffic-grid,
    .overview-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
