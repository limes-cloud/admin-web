<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar v-model="searchForm" :card="false" :items="searchItems" @search="handleSearch" @reset="resetSearchParams" />
      </div>
      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElButton v-permission="'cron:task:add'" v-ripple type="primary" :icon="Plus" @click="showDialog('add')">
              新增任务
            </ElButton>
          </template>
        </ArtTableHeader>
        <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination" row-key="id"
          @pagination:size-change="handleSizeChange" @pagination:current-change="handleCurrentChange">
          <template #status="{ row }">
            <el-switch v-model="row.status" :disabled="!$hasPermission('cron:task:update')" inline-prompt
              active-text="启用" inactive-text="禁用" :before-change="handleUpdateStatus(row)" />
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>

      <!-- 新增/编辑弹窗 -->
      <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增任务' : '编辑任务'" :destroy-on-close="true" width="640px" align-center>
        <ElForm ref="formRef" :model="currentData" label-position="top" style="max-height:70vh;overflow-y:auto;padding-right:8px">
          <ElRow :gutter="12">
            <ElCol :span="12">
              <ElFormItem label="任务名称" prop="name" :rules="[{ required: true, message: '请输入任务名称', trigger: ['blur', 'change'] }]">
                <ElInput v-model="currentData.name" placeholder="请输入任务名称" clearable />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="任务分组" prop="groupId" :rules="[{ required: true, message: '请选择任务分组', trigger: ['blur', 'change'] }]">
                <ElSelect v-model="currentData.groupId" placeholder="请选择任务分组" filterable style="width:100%" :options="groupOptions" />
              </ElSelect>
            </ElFormItem>
          </ElRow>
          <ElRow :gutter="12">
            <ElCol :span="12">
              <ElFormItem label="节点类型" prop="workerType" :rules="[{ required: true, message: '请选择节点类型', trigger: ['blur', 'change'] }]">
                <ElSelect v-model="currentData.workerType" placeholder="请选择节点类型" style="width:100%">
                  <ElOption label="节点" value="worker" />
                  <ElOption label="分组" value="group" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem v-if="currentData.workerType === 'group'" label="执行分组" prop="workerGroupId" :rules="[{ required: true, message: '请选择执行分组', trigger: ['blur', 'change'] }]">
                <ElSelect v-model="currentData.workerGroupId" placeholder="请选择执行分组" filterable style="width:100%" :options="workerGroupOptions" />
              </ElFormItem>
              <ElFormItem v-else label="执行节点" prop="workerId" :rules="[{ required: true, message: '请选择执行节点', trigger: ['blur', 'change'] }]">
                <ElSelect v-model="currentData.workerId" placeholder="请选择执行节点" filterable style="width:100%" :options="workerOptions" />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="12">
            <ElCol :span="12">
              <ElFormItem label="任务标签" prop="tag" :rules="[{ required: true, message: '请输入任务标签', trigger: ['blur', 'change'] }]">
                <ElInput v-model="currentData.tag" placeholder="请输入任务标签" clearable />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="执行类型" prop="execType" :rules="[{ required: true, message: '请选择执行类型', trigger: ['blur', 'change'] }]">
                <ElSelect v-model="currentData.execType" placeholder="请选择执行类型" style="width:100%">
                  <ElOption label="Shell" value="shell" />
                  <ElOption label="Http" value="http" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElFormItem label="Cron 表达式" prop="spec" :rules="[{ required: true, message: '请输入Cron表达式', trigger: ['blur', 'change'] }, { validator: validateCron, trigger: ['blur', 'change'] }]">
            <ElInput v-model="currentData.spec" placeholder="例：0 * * * * * (秒 分 时 日 月 周)" clearable />
            <div v-if="nextTimes.length" style="font-size:12px;color:var(--el-text-color-secondary);margin-top:4px">
              下次执行：{{ nextTimes[0] }}　再次执行：{{ nextTimes[1] }}
            </div>
          </ElFormItem>
          <ElFormItem label="执行内容" prop="execValue" :rules="[{ required: true, message: '请输入执行内容', trigger: ['blur', 'change'] }]">
            <ArtCodeEditor v-model="currentData.execValue" :style="{ width: '100%', height: '150px' }" />
          </ElFormItem>
          <ElRow :gutter="12">
            <ElCol :span="8">
              <ElFormItem label="成功状态码" prop="expectCode" :rules="[{ required: true, message: '请输入成功状态码', trigger: ['blur', 'change'] }]">
                <ElInputNumber v-model="currentData.expectCode" placeholder="如: 0" style="width:100%" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="重试次数" prop="retryCount" :rules="[{ required: true, message: '请输入重试次数', trigger: ['blur', 'change'] }]">
                <ElInputNumber v-model="currentData.retryCount" :min="0" placeholder="0" style="width:100%" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="重试等待(秒)" prop="retryWaitTime">
                <ElInputNumber v-model="currentData.retryWaitTime" :min="0" placeholder="0" style="width:100%" />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow :gutter="12">
            <ElCol :span="12">
              <ElFormItem label="最大执行时长(秒)" prop="maxExecTime">
                <ElInputNumber v-model="currentData.maxExecTime" :min="0" placeholder="0=不限制" style="width:100%" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="周期执行" prop="execCycle">
                <ElSelect v-model="currentData.execCycle" style="width:100%">
                  <ElOption label="开启" :value="true" />
                  <ElOption label="关闭" :value="false" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElFormItem v-if="currentData.execCycle" label="执行时间范围" prop="startAndEnd" :rules="[{ required: true, message: '请选择时间范围', trigger: ['blur', 'change'] }]">
            <ElDatePicker v-model="currentData.startAndEnd" type="datetimerange" range-separator="至"
              start-placeholder="开始时间" end-placeholder="结束时间" value-format="x" style="width:100%" />
          </ElFormItem>
          <ElFormItem label="任务描述">
            <ElInput v-model="currentData.description" type="textarea" placeholder="请输入任务描述" />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <!-- 日志弹窗 -->
      <ElDialog v-model="logVisible" title="执行日志" width="900px" :destroy-on-close="true" @close="clearLogTimers">
        <div class="log-panel">
          <div class="log-list">
            <div v-for="item in logList" :key="item.id" class="log-item" :class="{ active: currentLogId === item.id }" @click="handleSelectLog(item)">
              <div class="log-uuid" :title="item.uuid">{{ item.uuid.substring(0, 12) }}</div>
              <div>开始：{{ formatTime(item.startAt) }}</div>
              <div>结束：{{ item.endAt ? formatTime(item.endAt) : '-' }}</div>
              <div style="display:flex;align-items:center;gap:4px">
                <ElTag v-if="item.status === 'success'" type="success" size="small">成功</ElTag>
                <ElTag v-else-if="item.status === 'fail'" type="danger" size="small">失败</ElTag>
                <ElTag v-else-if="item.status === 'cancel'" type="warning" size="small">中止</ElTag>
                <template v-else-if="item.status === 'running'">
                  <ElTag type="info" size="small">运行中</ElTag>
                  <ElPopconfirm title="确认要取消此任务？" @confirm="handleCancelTask(item.uuid)">
                    <template #reference>
                      <ElTag v-permission="'cron:task:cancel'" type="warning" size="small" style="cursor:pointer">取消</ElTag>
                    </template>
                  </ElPopconfirm>
                </template>
              </div>
            </div>
            <ElEmpty v-if="!logList.length" :image-size="60" description="暂无运行记录" />
            <ElPagination v-if="logTotal > 0" :total="logTotal" :current-page="logParams.page" :page-size="logParams.pageSize"
              layout="prev, pager, next" small style="margin-top:8px" @current-change="(p) => { logParams.page = p; fetchLogs() }" />
          </div>
          <div class="log-content">
            <div v-for="(msg, i) in logContent" :key="i" :class="msg.type === 'error' ? 'log-error' : 'log-info'">
              {{ formatTime(msg.time) }}：{{ msg.content }}
            </div>
            <div v-if="!logContent.length" style="color:#666;padding:16px">暂无日志内容</div>
          </div>
        </div>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus, Edit, Delete, VideoPlay, Document } from '@element-plus/icons-vue'
  import cronParser from 'cron-parser'
  import { ListTask, CreateTask, UpdateTask, UpdateTaskStatus, DeleteTask, ExecTask, CancelTask, GetTask, ListTaskGroup, ListWorkerGroup as _ListWorkerGroup } from '@/api/cron/task/api'
  import { ListWorker, ListWorkerGroup } from '@/api/cron/worker/api'
  import { GetLog, ListLog } from '@/api/cron/log/api'
  import { Task, CreateTaskRequest, UpdateTaskRequest, Log, LogMsg } from '@/api/cron/task/type'
  import { formatTime } from '@/utils/time'
  import ArtCodeEditor from '@/components/core/base/art-code-editor/index.vue'

  defineOptions({ name: 'CronTask' })

  // ---- 表格 ----
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<CreateTaskRequest & UpdateTaskRequest & { id?: number }>>({})
  const formRef = ref()
  const nextTimes = ref<string[]>([])

  const groupOptions = ref<{ label: string; value: number }[]>([])
  const workerGroupOptions = ref<{ label: string; value: number }[]>([])
  const workerOptions = ref<{ label: string; value: number }[]>([])

  const searchForm = ref({ name: undefined, tag: undefined, groupId: undefined, status: undefined })
  const searchItems = computed(() => [
    { label: '任务名称', key: 'name', type: 'input', props: { placeholder: '请输入任务名称', clearable: true } },
    { label: '任务标签', key: 'tag', type: 'input', props: { placeholder: '请输入任务标签', clearable: true } },
    { label: '任务分组', key: 'groupId', type: 'select', props: { placeholder: '请选择分组', clearable: true, options: groupOptions.value } },
    { label: '任务状态', key: 'status', type: 'select', props: { placeholder: '请选择状态', clearable: true, options: [{ label: '启用', value: true }, { label: '禁用', value: false }] } }
  ])

  const operationItems = [
    {
      icon: VideoPlay, label: '立即执行', color: 'primary', permission: 'cron:task:exec',
      click: async (row: Task) => {
        await ElMessageBox.confirm('确认要立即执行此任务？', '提示', { type: 'warning' })
        await ExecTask({ id: row.id })
        ElMessage.success('任务已触发')
      }
    },
    { icon: Document, label: '执行日志', color: 'primary', permission: 'cron:task:log', click: (row: Task) => openLog(row.id) },
    { icon: Edit, label: '修改', color: 'warning', permission: 'cron:task:update', click: (row: Task) => showEditDialog(row.id) },
    {
      icon: Delete, label: '删除', color: 'danger', popConfirm: true, permission: 'cron:task:delete',
      click: async (row: Task) => { await DeleteTask({ id: row.id }); refreshRemove() }
    }
  ]

  const { columns, columnChecks, data, loading, pagination, searchParams, getData, resetSearchParams, handleSizeChange, handleCurrentChange, refreshData, refreshCreate, refreshUpdate, refreshRemove } =
    useTable({
      core: {
        apiFn: ListTask,
        apiParams: { page: 1, pageSize: 10, ...searchForm.value },
        columnsFactory: () => [
          { type: 'index', width: '60', label: '#' },
          { prop: 'name', label: '任务名称' },
          { prop: 'tag', label: '任务标签' },
          { prop: 'spec', label: 'Cron表达式' },
          { prop: 'execType', label: '执行类型' },
          { prop: 'status', label: '任务状态', useSlot: true, slotName: 'status' },
          { prop: 'createdAt', label: '创建时间', formatter: (row: Task) => formatTime(row.createdAt) },
          { prop: 'operation', label: '操作', fixed: 'right', useSlot: true, slotName: 'operation' }
        ]
      }
    })

  const loadOptions = async () => {
    const [gRes, wgRes, wRes] = await Promise.all([
      ListTaskGroup({ page: 1, pageSize: 100 }),
      ListWorkerGroup({ page: 1, pageSize: 100 }),
      ListWorker({ page: 1, pageSize: 100 })
    ])
    groupOptions.value = gRes.list.map(g => ({ label: g.name, value: g.id }))
    workerGroupOptions.value = wgRes.list.map(g => ({ label: g.name, value: g.id }))
    workerOptions.value = wRes.list.map(w => ({ label: w.name, value: w.id }))
  }
  loadOptions()

  const handleSearch = () => { Object.assign(searchParams, { ...searchForm.value }); getData() }

  const validateCron = (_: any, value: string, cb: (msg?: string) => void) => {
    nextTimes.value = []
    if (!value) { cb(); return }
    const parts = value.trim().split(/\s+/)
    if (parts.length < 6 || parts.length > 7) { cb('表达式格式错误，需6~7个字段'); return }
    try {
      const interval = cronParser.parseExpression(value)
      nextTimes.value = [interval.next().toDate().toLocaleString(), interval.next().toDate().toLocaleString()]
      cb()
    } catch {
      cb('表达式错误')
    }
  }

  const showDialog = (type: Form.DialogType) => {
    dialogType.value = type
    currentData.value = { execCycle: false, startAndEnd: [], workerType: 'worker', expectCode: 0, retryCount: 0, retryWaitTime: 0, maxExecTime: 0 }
    nextTick(() => { dialogVisible.value = true })
  }

  const showEditDialog = async (id: number) => {
    const detail = await GetTask({ id })
    currentData.value = {
      ...detail,
      execCycle: !!detail.start,
      startAndEnd: detail.start ? [detail.start * 1000, (detail.end || 0) * 1000] : []
    }
    dialogType.value = 'edit'
    nextTick(() => { dialogVisible.value = true })
  }

  const handleSubmit = async () => {
    await formRef.value?.validate()
    const payload = { ...currentData.value }
    if (payload.execCycle && payload.startAndEnd?.length === 2) {
      payload.start = (payload.startAndEnd[0] as number) / 1000
      payload.end = (payload.startAndEnd[1] as number) / 1000
    }
    if (dialogType.value === 'add') {
      await CreateTask(payload as CreateTaskRequest)
      ElMessage.success('创建成功'); refreshCreate()
    } else {
      await UpdateTask(payload as UpdateTaskRequest)
      ElMessage.success('修改成功'); refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (row: Task): (() => Promise<boolean>) => {
    return () => new Promise((resolve) => {
      ElMessageBox.confirm(`确认要${row.status ? '禁用' : '启用'}此任务？`, '提示', { type: 'warning' })
        .then(async () => { await UpdateTaskStatus({ id: row.id, status: !row.status }); ElMessage.success('操作成功'); refreshUpdate(); resolve(true) })
        .catch(() => resolve(false))
    })
  }

  // ---- 日志 ----
  const logVisible = ref(false)
  const logList = ref<Log[]>([])
  const logTotal = ref(0)
  const logParams = ref({ page: 1, pageSize: 10, taskId: 0, orderBy: 'id', order: 'desc' })
  const currentLogId = ref(0)
  const logContent = ref<LogMsg[]>([])
  const isRunning = ref(false)
  let pageTimer: ReturnType<typeof setInterval> | null = null
  let runTimer: ReturnType<typeof setInterval> | null = null

  const fetchLogs = async () => {
    const res = await ListLog(logParams.value)
    logList.value = res.list
    logTotal.value = res.total
    if (res.list.length && !currentLogId.value) {
      handleSelectLog(res.list[0])
    }
  }

  const handleSelectLog = async (item: Log) => {
    currentLogId.value = item.id
    const detail = await GetLog({ id: item.id })
    logContent.value = JSON.parse(`[${detail.content}]`) as LogMsg[]
    isRunning.value = detail.status === 'running'
    if (!isRunning.value) {
      logList.value = logList.value.map(l => l.id === detail.id ? detail : l)
    }
  }

  const openLog = (taskId: number) => {
    logList.value = []
    logContent.value = []
    currentLogId.value = 0
    isRunning.value = false
    logParams.value = { page: 1, pageSize: 10, taskId, orderBy: 'id', order: 'desc' }
    logVisible.value = true
    fetchLogs()
    pageTimer = setInterval(fetchLogs, 5000)
    runTimer = setInterval(() => { if (currentLogId.value && isRunning.value) handleSelectLog({ id: currentLogId.value } as Log) }, 1000)
  }

  const clearLogTimers = () => {
    if (pageTimer) { clearInterval(pageTimer); pageTimer = null }
    if (runTimer) { clearInterval(runTimer); runTimer = null }
  }

  const handleCancelTask = async (uuid: string) => {
    await CancelTask({ uuid })
    fetchLogs()
  }

  onBeforeUnmount(clearLogTimers)
</script>

<style scoped>
  .log-panel { display: flex; height: 500px; gap: 0; }
  .log-list { width: 200px; flex-shrink: 0; border-right: 1px solid var(--el-border-color); overflow-y: auto; padding: 8px; display: flex; flex-direction: column; }
  .log-item { font-size: 12px; padding: 8px 6px; cursor: pointer; border-radius: 4px; margin-bottom: 6px; border: 1px solid var(--el-border-color-lighter); }
  .log-item.active, .log-item:hover { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
  .log-uuid { font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .log-content { flex: 1; background: #192638; overflow-y: auto; padding: 12px; font-size: 12px; font-family: monospace; }
  .log-info { color: #ddd; margin-bottom: 2px; }
  .log-error { color: #f44; margin-bottom: 2px; }
</style>
