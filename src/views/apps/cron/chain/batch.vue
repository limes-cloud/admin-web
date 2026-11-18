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
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElButton
              v-permission="'cron:chain_batch:add'"
              v-ripple
              type="primary"
              :icon="Upload"
              @click="uploadVisible = true"
            >
              上传 xlsx
            </ElButton>
          </template>
        </ArtTableHeader>
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
          <template #name="{ row }">
            <span>{{ row.name || `-` }}</span>
            <ElTooltip :content="row.fileName">
              <ElTag size="small" class="cr-file" type="info" effect="plain">{{ row.fileName }}</ElTag>
            </ElTooltip>
          </template>
          <template #status="{ row }">
            <ElTag size="small" :type="BATCH_STATUS[row.status]?.type">{{
              BATCH_STATUS[row.status]?.label || row.status
            }}</ElTag>
          </template>
          <template #stat="{ row }">
            <span
              >成功 <b class="cr-ok">{{ row.successCount }}</b></span
            >
            <span class="cr-stat-sep">/</span>
            <span
              >失败 <b class="cr-fail">{{ row.failCount }}</b></span
            >
            <span class="cr-stat-sep">/</span>
            <span
              >执行中 <b class="cr-running">{{ row.runningCount ?? 0 }}</b></span
            >
            <span class="cr-stat-sep">/</span>
            <span
              >挂起 <b class="cr-suspended">{{ row.suspendedCount ?? 0 }}</b></span
            >
            <template v-if="row.canceledCount">
              <span class="cr-stat-sep">/</span>
              <span
                >取消 <b>{{ row.canceledCount }}</b></span
              >
            </template>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>
    </ElCard>

    <!-- 上传 xlsx 弹窗：选择链 + 文件 + 并发数；提交后展示行级校验结果 -->
    <ElDialog v-model="uploadVisible" title="上传批量执行" :destroy-on-close="true" width="620px" align-center>
      <ElForm ref="uploadFormRef" :model="uploadForm" label-position="top">
        <ElFormItem label="目标流程" required>
          <ElSelect v-model="uploadForm.chainId" placeholder="请选择流程" filterable style="width: 100%">
            <ElOption v-for="c in chains" :key="c.id" :label="`${c.name}（${c.keyword}）`" :value="c.id" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="xlsx 文件（每行 = 一次流程运行的入参；列名 = 入参字段，支持 a.b 嵌套）" required>
          <ElUpload
            ref="uploadRef"
            drag
            :auto-upload="false"
            :limit="1"
            accept=".xlsx"
            :on-change="handleFileChange"
            :on-remove="() => (uploadForm.file = undefined)"
          >
            <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
            <div class="el-upload__text">将文件拖到此处，或 <em>点击选择</em></div>
            <template #tip>
              <div class="el-upload__tip"> 仅支持 .xlsx；第 1 行为表头（列名），第 2 行起为数据；空行自动跳过 </div>
            </template>
          </ElUpload>
        </ElFormItem>
        <ElFormItem label="批次名称">
          <ElInput v-model="uploadForm.name" maxlength="128" placeholder="留空自动生成（批量-文件名-时间）" />
        </ElFormItem>
        <ElFormItem label="最大并发运行数">
          <ElInputNumber v-model="uploadForm.maxConcurrent" :min="1" :max="100" />
          <span class="cr-tip">同批次同时运行的行数上限（1～100，默认 10）</span>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="uploadVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="uploading" @click="handleUpload">创建批量</ElButton>
      </template>
    </ElDialog>

    <!-- 行级校验问题展示（上传失败时） -->
    <ElDialog v-model="issueVisible" title="校验未通过" :destroy-on-close="true" width="720px" align-center>
      <ElAlert
        type="error"
        :closable="false"
        show-icon
        title="以下数据行未通过校验，请修正后重新上传（本次未入库）"
        class="cr-issue-alert"
      />
      <ElTable :data="issues" size="small" max-height="420">
        <ElTableColumn prop="row" label="行" width="70" />
        <ElTableColumn prop="field" label="字段" width="180" show-overflow-tooltip />
        <ElTableColumn prop="code" label="错误码" width="140" show-overflow-tooltip />
        <ElTableColumn prop="message" label="说明" min-width="260" show-overflow-tooltip />
      </ElTable>
      <template #footer>
        <ElButton type="primary" @click="issueVisible = false">知道了</ElButton>
      </template>
    </ElDialog>

    <!-- 批次详情抽屉：批次信息 + 行列表（点击行跳转运行详情） -->
    <ElDrawer v-model="detailVisible" class="cr-detail-drawer" :title="`批量执行 #${detail?.id || ''}`" size="80%">
      <div class="cr-detail-table">
        <ArtSearchBar
          v-model="itemSearchForm"
          :card="false"
          :items="itemSearchItems"
          class="cr-detail-search"
          @search="handleItemSearch"
          @reset="handleItemReset"
        />
        <div class="cr-detail-table-body">
          <ArtTable
            ref="itemTableRef"
            :loading="itemLoading"
            :data="items"
            :columns="itemColumns"
            :pagination="itemPagination"
            :show-table-header="false"
            row-key="id"
            table-layout="fixed"
            @pagination:size-change="handleItemSizeChange"
            @pagination:current-change="handleItemCurrentChange"
          >
            <template #rowNo="{ row }">
              <ElTag size="small" type="info" effect="plain">第 {{ row.rowNo }} 行</ElTag>
            </template>
            <template #status="{ row }">
              <ElTag size="small" :type="ITEM_STATUS[row.status]?.type">{{
                ITEM_STATUS[row.status]?.label || row.status
              }}</ElTag>
            </template>
            <template #runId="{ row }">
              <ElTooltip v-if="row.runId" :content="row.runId" placement="top">
                <ElLink type="primary" :underline="false" @click="openRun(row)">
                  <span class="cr-run-id">{{ row.runId }}</span>
                </ElLink>
              </ElTooltip>
              <span v-else>-</span>
            </template>
            <template #error="{ row }">
              <ElTooltip v-if="row.errorCode || row.errorMsg" :content="row.errorMsg || row.errorCode">
                <span class="cr-error">{{ row.errorCode || row.errorMsg }}</span>
              </ElTooltip>
              <span v-else>-</span>
            </template>
            <template #startedAt="{ row }">{{ formatTs(row.startedAt) }}</template>
            <template #finishedAt="{ row }">{{ formatTs(row.finishedAt) }}</template>
            <template #operation="{ row }">
              <ArtOperation :list="itemOperations(row)" :data="row" />
            </template>
          </ArtTable>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { computed, onActivated, onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, UploadFile, UploadInstance } from 'element-plus'
  import { Upload, UploadFilled, View, CircleClose, Refresh } from '@element-plus/icons-vue'
  import { useTable } from '@/composables/useTable'
  import { getAppKeyword } from '@/utils/app-context'
  import { ListApp } from '@/api/manager/app/api'
  import {
    AbandonChainRun,
    CancelChainBatch,
    GetChainBatch,
    ListChainBatch,
    ListChainBatchItem,
    RerunChainBatchItem,
    UploadChainBatch
  } from '@/api/cron/chain/api'
  import type { ChainBatchInfo, ChainBatchIssue, ChainBatchItemInfo } from '@/api/cron/chain/type'
  import { listAllChains } from './utils/options'
  import { formatTs } from './utils/format'

  defineOptions({ name: 'CronChainBatch' })

  const router = useRouter()
  const route = useRoute()

  /** 批次状态展示 */
  const BATCH_STATUS: Record<string, { label: string; type: 'primary' | 'success' | 'info' | 'warning' | 'danger' }> = {
    preparing: { label: '接收中', type: 'info' },
    pending: { label: '未开始', type: 'info' },
    running: { label: '进行中', type: 'primary' },
    completed: { label: '已完成', type: 'success' },
    canceled: { label: '已取消', type: 'warning' },
    failed: { label: '创建失败', type: 'danger' },
    fail: { label: '执行失败', type: 'danger' }
  }

  /** 行状态展示 */
  const ITEM_STATUS: Record<string, { label: string; type: 'primary' | 'success' | 'info' | 'warning' | 'danger' }> = {
    pending: { label: '待执行', type: 'info' },
    running: { label: '执行中', type: 'primary' },
    success: { label: '成功', type: 'success' },
    fail: { label: '失败', type: 'danger' },
    canceled: { label: '已取消', type: 'warning' }
  }

  const isManager = getAppKeyword() === 'manager'
  const chains = ref<Awaited<ReturnType<typeof listAllChains>>>([])
  const chainName = (id: number) => chains.value.find((c) => c.id === id)?.name || `#${id}`

  const allApps = ref<{ name: string; keyword: string }[]>([])
  if (isManager) {
    ListApp({ page: 1, pageSize: 50, status: true })
      .then((r) => (allApps.value = (r.list || []).map((a) => ({ name: a.name, keyword: a.keyword }))))
      .catch(() => undefined)
  }

  const searchForm = ref<{ chainId?: number; name?: string; status?: string; filterApp?: string }>({
    chainId: undefined,
    name: undefined,
    status: undefined,
    filterApp: undefined
  })

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
      label: '流程',
      key: 'chainId',
      type: 'select',
      props: {
        placeholder: '全部',
        clearable: true,
        filterable: true,
        options: chains.value.map((c) => ({ label: `${c.name}（${c.keyword}）`, value: c.id }))
      }
    },
    { label: '批次名称', key: 'name', type: 'input', props: { placeholder: '请输入名称', clearable: true } },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '全部',
        clearable: true,
        options: Object.entries(BATCH_STATUS).map(([value, v]) => ({ label: v.label, value }))
      }
    }
  ])

  /** 未终态（可取消） */
  const cancellable = (s: string) => s === 'pending' || s === 'running'

  const operationItems = [
    { icon: View, label: '详情', color: 'primary', click: (row: ChainBatchInfo) => openDetail(row) },
    ...(isManager || getAppKeyword()
      ? [
          {
            icon: CircleClose,
            label: '取消',
            color: 'danger',
            hidden: (row: ChainBatchInfo) => !cancellable(row.status),
            click: (row: ChainBatchInfo) => handleCancel(row)
          }
        ]
      : [])
  ]

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
      apiFn: ListChainBatch,
      apiParams: { page: 1, pageSize: 20 },
      columnsFactory: () => [
        ...(isManager ? [{ prop: 'app', label: '所属应用', width: 110 }] : []),
        { prop: 'id', label: '批次', width: 70, useSlot: true, slotName: 'id' },
        { prop: 'name', label: '名称 / 文件', minWidth: 200, useSlot: true, slotName: 'name' },
        { prop: 'chainId', label: '流程', minWidth: 130, formatter: (row: ChainBatchInfo) => chainName(row.chainId) },
        { prop: 'rowCount', label: '行数', width: 70 },
        { prop: 'maxConcurrent', label: '并发', width: 70 },
        { prop: 'status', label: '状态', width: 90, useSlot: true, slotName: 'status' },
        { prop: 'stat', label: '执行结果', width: 300, useSlot: true, slotName: 'stat' },
        { prop: 'createdBy', label: '创建人', minWidth: 110, showOverflowTooltip: true },
        {
          prop: 'createdAt',
          label: '创建时间',
          width: 165,
          formatter: (row: ChainBatchInfo) => formatTs(row.createdAt)
        },
        { prop: 'operation', label: '操作', fixed: 'right', width: 120, useSlot: true, slotName: 'operation' }
      ]
    }
  })

  function search() {
    ;['chainId', 'name', 'status', 'filterApp'].forEach((k) => delete (searchParams as Record<string, unknown>)[k])
    Object.assign(searchParams, { ...searchForm.value, page: 1 })
    getData()
  }

  const handleSearch = () => search()

  function handleReset() {
    searchForm.value = { chainId: undefined, name: undefined, status: undefined, filterApp: undefined }
    resetSearchParams()
  }

  // ---------- 上传 ----------

  const uploadVisible = ref(false)
  const uploading = ref(false)
  const uploadFormRef = ref<FormInstance>()
  const uploadRef = ref<UploadInstance>()
  const uploadForm = reactive<{ chainId?: number; name: string; maxConcurrent: number; file?: File }>({
    chainId: undefined,
    name: '',
    maxConcurrent: 10,
    file: undefined
  })
  const issueVisible = ref(false)
  const issues = ref<ChainBatchIssue[]>([])

  function handleFileChange(file: UploadFile) {
    uploadForm.file = file.raw
  }

  async function handleUpload() {
    if (!uploadForm.chainId) {
      ElMessage.warning('请选择目标流程')
      return
    }
    if (!uploadForm.file) {
      ElMessage.warning('请选择 xlsx 文件')
      return
    }
    if (!/\.xlsx$/i.test(uploadForm.file.name)) {
      ElMessage.warning('仅支持 .xlsx 文件')
      return
    }
    const fd = new FormData()
    fd.append('chainId', String(uploadForm.chainId))
    fd.append('file', uploadForm.file)
    if (uploadForm.name) fd.append('name', uploadForm.name)
    fd.append('maxConcurrent', String(uploadForm.maxConcurrent || 10))
    uploading.value = true
    try {
      const res = await UploadChainBatch(fd)
      if (res.valid) {
        ElMessage.success(`校验通过，已接收批次 #${res.id}（${res.total} 行），正在后台写入`)
        uploadVisible.value = false
        uploadForm.file = undefined
        uploadRef.value?.clearFiles()
        search()
      } else {
        issues.value = res.issues || []
        issueVisible.value = true
      }
    } finally {
      uploading.value = false
    }
  }

  // ---------- 详情（行列表） ----------

  const detailVisible = ref(false)
  const detail = ref<ChainBatchInfo>()
  const itemTableRef = ref<{ scrollToTop: () => void }>()
  const itemSearchForm = ref<{ status?: string; rowNo?: number }>({})
  const itemSearchItems = computed(() => [
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '全部',
        clearable: true,
        options: Object.entries(ITEM_STATUS).map(([value, v]) => ({ label: v.label, value }))
      }
    },
    {
      label: '行号',
      key: 'rowNo',
      type: 'number',
      props: { placeholder: '请输入行号', min: 1, controlsPosition: 'right', style: { width: '100%' } }
    }
  ])
  const itemApiParams = reactive<{ page: number; pageSize: number; batchId?: number }>({
    page: 1,
    pageSize: 20,
    batchId: undefined
  })
  const {
    columns: itemColumns,
    data: items,
    loading: itemLoading,
    pagination: itemPagination,
    searchParams: itemSearchParams,
    getData: getItems,
    resetSearchParams: resetItemSearchParams,
    handleSizeChange: handleItemSizeChange,
    handleCurrentChange: handleItemCurrentChange
  } = useTable({
    core: {
      apiFn: ListChainBatchItem,
      apiParams: itemApiParams,
      immediate: false,
      columnsFactory: () => [
        { prop: 'rowNo', label: '行', width: 96, useSlot: true, slotName: 'rowNo' },
        { prop: 'status', label: '状态', width: 68, useSlot: true, slotName: 'status' },
        { prop: 'runId', label: '运行 ID', minWidth: 160, useSlot: true, slotName: 'runId' },
        { prop: 'error', label: '错误信息', minWidth: 75, useSlot: true, slotName: 'error' },
        { prop: 'startedAt', label: '开始时间', width: 158, useSlot: true, slotName: 'startedAt' },
        { prop: 'finishedAt', label: '结束时间', width: 158, useSlot: true, slotName: 'finishedAt' },
        { prop: 'operation', label: '操作', fixed: 'right', width: 90, useSlot: true, slotName: 'operation' }
      ]
    }
  })

  async function handleItemSearch() {
    ;['status', 'rowNo'].forEach((key) => delete (itemSearchParams as Record<string, unknown>)[key])
    Object.assign(itemSearchParams, itemSearchForm.value, { page: 1 })
    await getItems()
    itemTableRef.value?.scrollToTop()
  }

  async function handleItemReset() {
    itemSearchForm.value = {}
    await resetItemSearchParams()
    itemTableRef.value?.scrollToTop()
  }

  async function openDetail(row: ChainBatchInfo) {
    detail.value = row
    detailVisible.value = true
    itemSearchForm.value = {}
    itemApiParams.batchId = row.id
    await resetItemSearchParams()
    itemTableRef.value?.scrollToTop()
  }

  /** 返回批次详情时自动恢复抽屉（运行详情返回会带 batchId） */
  async function restoreDetailFromQuery() {
    const id = Number(route.query.batchId)
    if (!id) return
    if (detailVisible.value && detail.value?.id === id) {
      await router.replace({ path: '/cron/chain/batch' })
      return
    }
    try {
      const res = await GetChainBatch({ id })
      if (res.batch) await openDetail(res.batch)
    } catch {
      // 批次不存在或已清理时保持列表页，不阻断返回
    } finally {
      await router.replace({ path: '/cron/chain/batch' })
    }
  }

  /** 跳转运行详情（行 → 运行） */
  function openRun(row: ChainBatchItemInfo) {
    if (!row.runId) return
    router.push({
      path: '/cron/chain/run-detail',
      query: { rid: row.runId, from: 'batch', batchId: String(row.batchId) }
    })
  }

  /** 批次行操作：详情 / 作废 / 重跑 */
  function itemOperations(row: ChainBatchItemInfo) {
    const list = []
    if (row.runId) {
      list.push({ icon: View, label: '详情', color: 'primary', click: () => openRun(row) })
    }
    if (row.status === 'running' && row.runId) {
      list.push({
        icon: CircleClose,
        label: '作废',
        color: 'danger',
        permission: 'cron:chain_run:abandon',
        popConfirm: true,
        popTitle: `作废第 ${row.rowNo} 行的运行？待触发节点会一并取消，且不可恢复。`,
        click: () => abandonItem(row)
      })
    }
    if (row.status === 'success' || row.status === 'fail' || row.status === 'canceled') {
      list.push({
        icon: Refresh,
        label: '重跑',
        color: 'warning',
        permission: 'cron:chain_batch:rerun',
        popConfirm: true,
        popTitle: `按当前批次冻结版本重新执行第 ${row.rowNo} 行？`,
        click: () => rerunItem(row)
      })
    }
    return list
  }

  async function refreshItemView() {
    await Promise.all([getItems(), refreshData(), refreshDetail()])
  }

  async function refreshDetail() {
    if (!detail.value?.id) return
    try {
      const res = await GetChainBatch({ id: detail.value.id })
      if (res.batch) detail.value = res.batch
    } catch {
      // 详情刷新失败不阻断行列表
    }
  }

  async function abandonItem(row: ChainBatchItemInfo) {
    if (!row.runId) return
    await AbandonChainRun({ id: row.runId })
    ElMessage.success('已作废，批次行状态将在调度回写后更新')
    await refreshItemView()
  }

  async function rerunItem(row: ChainBatchItemInfo) {
    if (!detail.value?.id) return
    const res = await RerunChainBatchItem({ batchId: detail.value.id, rowNo: row.rowNo })
    ElMessage.success(`已重新发起运行${res.runId ? `：${res.runId}` : ''}`)
    await refreshItemView()
  }

  // ---------- 取消 ----------

  async function handleCancel(row: ChainBatchInfo) {
    try {
      await ElMessageBox.confirm(
        `确定取消批次 #${row.id}（${row.name || row.fileName}）？\n未开始的行将标记为取消，执行中的行不受影响。`,
        '取消批量执行',
        { type: 'warning', confirmButtonText: '确定取消', cancelButtonText: '返回' }
      )
    } catch {
      return
    }
    await CancelChainBatch({ id: row.id })
    ElMessage.success('已发起取消')
    refreshData()
  }

  onMounted(async () => {
    chains.value = await listAllChains()
    await restoreDetailFromQuery()
  })

  onActivated(async () => {
    await refreshData()
    await restoreDetailFromQuery()
  })
</script>

<style scoped lang="scss">
  .cr-file {
    margin-left: 6px;
  }
  .cr-ok {
    color: var(--el-color-success);
  }
  .cr-fail {
    color: var(--el-color-danger);
  }
  .cr-running {
    color: var(--el-color-primary);
  }
  .cr-suspended {
    color: var(--el-color-warning);
  }
  .cr-stat-sep {
    margin: 0 5px;
    color: var(--el-text-color-placeholder);
  }
  .cr-tip {
    margin-left: 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
  .cr-issue-alert {
    margin-bottom: 12px;
  }
  .cr-detail-search {
    flex: none;
    margin-bottom: 12px;
  }
  .cr-run-id {
    display: block;
    overflow: hidden;
    font-family: monospace;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cr-error {
    color: var(--el-color-danger);
  }
</style>

<style lang="scss">
  .cr-detail-drawer {
    .el-drawer__body {
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }
    .cr-detail-table {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      width: 100%;
      overflow: hidden;
    }
    .cr-detail-table-body {
      flex: 1;
      min-height: 0;
      width: 100%;
      padding-bottom: 12px;
      overflow: hidden;
      box-sizing: border-box;
    }
    .cr-detail-table-body > .art-table {
      width: 100%;
    }
    .el-table .cell {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .el-table .el-table__body-wrapper {
      overflow-x: hidden;
    }
  }
</style>
