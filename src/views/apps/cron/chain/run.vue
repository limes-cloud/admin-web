<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="handleReset"
        />
      </div>
      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" />
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #id="{ row }">
            <ElLink type="primary" :underline="false" @click="openDetail(row)">{{ row.id }}</ElLink>
          </template>
          <template #status="{ row }">
            <ElTag size="small" :type="RUN_STATUS[row.status as ChainRunStatus]?.type">
              {{ RUN_STATUS[row.status as ChainRunStatus]?.label || row.status }}
            </ElTag>
          </template>
          <template #error="{ row }">
            <ElTooltip v-if="row.errorCode || row.errorMsg" :content="row.errorMsg || row.errorCode">
              <span class="cr-error">{{ row.errorCode || row.errorMsg }}</span>
            </ElTooltip>
            <span v-else>-</span>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onActivated, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { View } from '@element-plus/icons-vue'
  import { useTable } from '@/composables/useTable'
  import { getAppKeyword } from '@/utils/app-context'
  import { ListApp } from '@/api/manager/app/api'
  import { ListChainRun } from '@/api/cron/chain/api'
  import type { ChainInfo, ChainRunInfo, ChainRunStatus } from '@/api/cron/chain/type'
  import { RUN_ORIGIN_LABEL, RUN_STATUS } from './utils/constants'
  import { formatTs } from './utils/format'
  import { listAllChains } from './utils/options'

  defineOptions({ name: 'CronChainRun' })

  const route = useRoute()
  const router = useRouter()

  const chains = ref<ChainInfo[]>([])
  const chainName = (id: number) => chains.value.find((c) => c.id === id)?.name || `#${id}`

  const initChainId = Number(route.query.chainId) || undefined
  const initStatus = (route.query.status as string) || undefined

  /** 状态筛选里的"待触发"选项值 */
  const STATUS_PENDING_TRIGGER = 'pendingTrigger'

  const isManager = getAppKeyword() === 'manager'
  const allApps = ref<{ name: string; keyword: string }[]>([])
  if (isManager) {
    ListApp({ page: 1, pageSize: 50, status: true })
      .then((r) => (allApps.value = (r.list || []).map((a) => ({ name: a.name, keyword: a.keyword }))))
      .catch(() => undefined)
  }

  const searchForm = ref<{ chainId?: number; status?: string; trx?: string; range?: [Date, Date]; filterApp?: string }>(
    {
      chainId: initChainId,
      status: initStatus,
      trx: undefined,
      range: undefined,
      filterApp: undefined
    }
  )

  const searchItems = computed(() => [
    ...(isManager
      ? [
          {
            label: '所属应用',
            key: 'filterApp',
            type: 'select',
            props: {
              placeholder: '全部应用',
              clearable: true,
              options: allApps.value.map((a) => ({ label: `${a.name}（${a.keyword}）`, value: a.keyword }))
            }
          }
        ]
      : []),
    {
      label: '所属流程',
      key: 'chainId',
      type: 'select',
      props: {
        placeholder: '全部',
        clearable: true,
        filterable: true,
        options: chains.value.map((c) => ({ label: `${c.name}（${c.keyword}）`, value: c.id }))
      }
    },
    {
      label: '运行状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '全部',
        clearable: true,
        // 待触发不是运行状态：运行中且有被动节点在等待，按 pendingTrigger 查询
        options: [
          ...Object.entries(RUN_STATUS).map(([value, v]) => ({ label: v.label, value })),
          { label: '待触发', value: STATUS_PENDING_TRIGGER }
        ]
      }
    },
    { label: '事务编号', key: 'trx', type: 'input', props: { placeholder: 'trx', clearable: true } },
    {
      label: '开始时间',
      key: 'range',
      type: 'datetimerange',
      props: { startPlaceholder: '开始', endPlaceholder: '结束' }
    }
  ])

  const operationItems = [
    { icon: View, label: '详情', color: 'primary', click: (row: ChainRunInfo) => openDetail(row) }
  ]

  /** 搜索表单 → 接口参数 */
  function toParams() {
    const f = searchForm.value
    const [start, end] = f.range || []
    return {
      chainId: f.chainId || undefined,
      status: f.status && f.status !== STATUS_PENDING_TRIGGER ? f.status : undefined,
      trx: f.trx || undefined,
      pendingTrigger: f.status === STATUS_PENDING_TRIGGER ? true : undefined,
      filterApp: f.filterApp || undefined,
      startTime: start ? Math.floor(new Date(start).getTime() / 1000) : undefined,
      endTime: end ? Math.floor(new Date(end).getTime() / 1000) : undefined
    }
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    getData,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: ListChainRun,
      apiParams: { page: 1, pageSize: 20, ...toParams() },
      columnsFactory: () => [
        ...(isManager ? [{ prop: 'app', label: '所属应用', width: 120 }] : []),
        { prop: 'id', label: '运行 ID', minWidth: 290, useSlot: true, slotName: 'id' },
        { prop: 'chainId', label: '流程调度', minWidth: 140, formatter: (row: ChainRunInfo) => chainName(row.chainId) },
        { prop: 'status', label: '状态', width: 90, useSlot: true, slotName: 'status' },
        {
          prop: 'origin',
          label: '发起方式',
          width: 100,
          formatter: (row: ChainRunInfo) => RUN_ORIGIN_LABEL[row.origin] || row.origin
        },
        { prop: 'attempt', label: '轮次', width: 70 },
        { prop: 'trx', label: '事务号', minWidth: 160, showOverflowTooltip: true },
        { prop: 'startedAt', label: '开始时间', width: 170, formatter: (row: ChainRunInfo) => formatTs(row.startedAt) },
        {
          prop: 'finishedAt',
          label: '结束时间',
          width: 170,
          formatter: (row: ChainRunInfo) => formatTs(row.finishedAt)
        },
        { prop: 'errorCode', label: '错误码', minWidth: 140, useSlot: true, slotName: 'error' },
        { prop: 'operation', label: '操作', fixed: 'right', width: 90, useSlot: true, slotName: 'operation' }
      ]
    }
  })

  function search() {
    // 清掉旧的可选参数后再写入，避免 undefined 字段残留
    ;['chainId', 'status', 'trx', 'pendingTrigger', 'startTime', 'endTime'].forEach(
      (k) => delete (searchParams as Record<string, unknown>)[k]
    )
    Object.assign(searchParams, toParams(), { page: 1 })
    getData()
  }

  const handleSearch = () => search()

  function handleReset() {
    searchForm.value = { chainId: undefined, status: undefined, trx: undefined, range: undefined }
    resetSearchParams()
  }

  function openDetail(row: ChainRunInfo) {
    router.push({ path: '/cron/chain/run-detail', query: { rid: row.id } })
  }

  onMounted(async () => {
    chains.value = await listAllChains()
  })

  onActivated(() => refreshData())
</script>

<style scoped lang="scss">
  .cr-error {
    color: var(--el-color-danger);
  }
</style>
