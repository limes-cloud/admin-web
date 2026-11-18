<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="resetSearchParams"
        />
      </div>
      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElButton v-permission="'cron:chain:add'" v-ripple type="primary" :icon="Plus" @click="showDialog('add')">
              新增流程调度
            </ElButton>
            <ElButton
              v-permission="'cron:chain_batch:query'"
              v-ripple
              :icon="Upload"
              @click="router.push('/cron/chain/batch')"
            >
              批量执行
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
          <template #status="{ row }">
            <ElTooltip :disabled="!!row.currentVersion || row.status" content="尚未发布任何版本，不能启用">
              <ElSwitch
                v-model="row.status"
                :disabled="!$hasPermission('cron:chain:update-status') || (!row.currentVersion && !row.status)"
                inline-prompt
                active-text="启用"
                inactive-text="禁用"
                :before-change="handleUpdateStatus(row)"
              />
            </ElTooltip>
          </template>
          <template #version="{ row }">
            <ElTag v-if="row.currentVersion" size="small">v{{ row.currentVersionNo }}</ElTag>
            <ElTag v-else size="small" type="info">未发布</ElTag>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增流程调度' : '修改流程调度'"
        :destroy-on-close="true"
        width="520px"
        align-center
      >
        <ElForm ref="formRef" :model="currentData" label-position="top">
          <ElFormItem
            label="标识（keyword）"
            prop="keyword"
            :rules="[
              { required: true, message: '请输入标识', trigger: 'blur' },
              { pattern: /^[a-zA-Z0-9_-]{1,64}$/, message: '只能包含字母、数字、_、-，长度 1～64', trigger: 'blur' }
            ]"
          >
            <ElInput
              v-model="currentData.keyword"
              :disabled="dialogType === 'edit'"
              placeholder="业务服务调用开放接口时使用，创建后不可修改"
            />
          </ElFormItem>
          <ElFormItem label="名称" prop="name" :rules="[{ required: true, message: '请输入名称', trigger: 'blur' }]">
            <ElInput v-model="currentData.name" maxlength="64" placeholder="请输入名称" />
          </ElFormItem>
          <ElFormItem label="描述" prop="description">
            <ElInput
              v-model="currentData.description"
              type="textarea"
              :rows="3"
              maxlength="255"
              placeholder="请输入描述"
            />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <DebugRunDialog
        v-if="debugChain"
        v-model="debugVisible"
        :keyword="debugChain.keyword"
        :body-rule="debugBodyRule"
      />
    </ElCard>

    <ChainEditorDialog v-model="editorVisible" :chain-id="editorChainId" @saved="refreshUpdate" />
  </div>
</template>

<script setup lang="ts">
  import { nextTick, onActivated, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import type { FormInstance } from 'element-plus'
  import { Plus, Edit, Delete, EditPen, Files, List, VideoPlay, Upload } from '@element-plus/icons-vue'
  import { useTable } from '@/composables/useTable'
  import { getAppKeyword } from '@/utils/app-context'
  import { ListApp } from '@/api/manager/app/api'
  import {
    CreateChain,
    DeleteChain,
    GetChainVersion,
    ListChain,
    ListChainRun,
    UpdateChain,
    UpdateChainStatus
  } from '@/api/cron/chain/api'
  import type { ChainInfo } from '@/api/cron/chain/type'
  import DebugRunDialog from './components/DebugRunDialog.vue'
  import ChainEditorDialog from './components/ChainEditorDialog.vue'
  import { parseRule } from './components/graph/flow-convert'
  import type { FieldRule } from './types/dsl'
  import { formatTs } from './utils/format'

  defineOptions({ name: 'CronChain' })

  const router = useRouter()

  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const submitting = ref(false)
  const formRef = ref<FormInstance>()
  const currentData = ref<Partial<ChainInfo>>({})

  const searchForm = ref<{ keyword?: string; name?: string; status?: boolean; filterApp?: string }>({
    keyword: undefined,
    name: undefined,
    status: undefined,
    filterApp: undefined
  })
  /** 平台管理：可按所属应用筛选 */
  const isManager = getAppKeyword() === 'manager'
  const appOptions = ref<{ name: string; keyword: string }[]>([])
  if (isManager) {
    ListApp({ page: 1, pageSize: 50, status: true })
      .then((r) => (appOptions.value = (r.list || []).map((a) => ({ name: a.name, keyword: a.keyword }))))
      .catch(() => undefined)
  }

  const searchItems = [
    ...(isManager
      ? [
          {
            label: '所属应用',
            key: 'filterApp',
            type: 'select',
            props: {
              placeholder: '全部应用',
              clearable: true,
              options: appOptions.value.map((a) => ({ label: `${a.name}（${a.keyword}）`, value: a.keyword }))
            }
          }
        ]
      : []),
    { label: '流程标识', key: 'keyword', type: 'input', props: { placeholder: '请输入流程标识', clearable: true } },
    { label: '流程名称', key: 'name', type: 'input', props: { placeholder: '请输入流程名称', clearable: true } },
    {
      label: '流程状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '启用', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ]

  // ---------- 全屏编辑 ----------

  const editorVisible = ref(false)
  const editorChainId = ref(0)

  function openEditor(id: number) {
    editorChainId.value = id
    editorVisible.value = true
  }

  const operationItems = [
    {
      icon: EditPen,
      label: '流程设计',
      color: 'primary',
      permission: 'cron:chain_version:query',
      click: (row: ChainInfo) => openEditor(row.id)
    },
    {
      icon: Files,
      label: '历史版本',
      permission: 'cron:chain_version:query',
      click: (row: ChainInfo) => router.push({ path: '/cron/chain/version', query: { id: row.id } })
    },
    {
      icon: List,
      label: '调度日志',
      permission: 'cron:chain_run:query',
      click: (row: ChainInfo) => router.push({ path: '/cron/chain/run', query: { chainId: row.id } })
    },
    {
      icon: VideoPlay,
      label: '测试执行',
      permission: 'cron:chain:debug-run',
      click: (row: ChainInfo) => openDebug(row)
    },
    {
      icon: Edit,
      label: '修改',
      color: 'warning',
      permission: 'cron:chain:update',
      click: (row: ChainInfo) => showDialog('edit', row)
    },
    {
      icon: Delete,
      label: '删除',
      color: 'danger',
      popConfirm: true,
      popTitle: '删除前需先禁用，且没有运行中或挂起的运行。确定删除？',
      permission: 'cron:chain:delete',
      click: async (row: ChainInfo) => {
        await DeleteChain({ id: row.id })
        ElMessage.success('删除成功')
        refreshRemove()
      }
    }
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
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: ListChain,
      apiParams: { page: 1, pageSize: 10, ...searchForm.value },
      columnsFactory: () => [
        { type: 'index', width: '60', label: '#' },
        { prop: 'keyword', label: '标识', minWidth: 140 },
        { prop: 'name', label: '名称', minWidth: 140 },
        { prop: 'description', label: '描述', minWidth: 160, showOverflowTooltip: true },
        { prop: 'currentVersionNo', label: '生效版本', width: 100, useSlot: true, slotName: 'version' },
        { prop: 'status', label: '状态', width: 100, useSlot: true, slotName: 'status' },
        { prop: 'updatedAt', label: '更新时间', width: 170, formatter: (row: ChainInfo) => formatTs(row.updatedAt) },
        { prop: 'operation', label: '操作', fixed: 'right', width: 120, useSlot: true, slotName: 'operation' }
      ]
    }
  })

  onActivated(() => refreshData())

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: 'add' | 'edit', row?: ChainInfo) => {
    dialogType.value = type
    currentData.value = row ? { ...row } : {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleSubmit = async () => {
    if (!(await formRef.value?.validate().catch(() => false))) return
    submitting.value = true
    try {
      const d = currentData.value
      if (dialogType.value === 'add') {
        const res = await CreateChain({ keyword: d.keyword!, name: d.name!, description: d.description || undefined })
        ElMessage.success('创建成功')
        dialogVisible.value = false
        refreshCreate()
        try {
          await ElMessageBox.confirm('流程调度已创建，是否立即进入流程设计？', '提示', { type: 'success' })
          openEditor(res.id)
        } catch {
          // 留在列表页
        }
      } else {
        await UpdateChain({ id: d.id!, name: d.name!, description: d.description || undefined })
        ElMessage.success('修改成功')
        dialogVisible.value = false
        refreshUpdate()
      }
    } finally {
      submitting.value = false
    }
  }

  /** 进行中（running / suspended）的运行数 */
  async function activeRunCount(chainId: number): Promise<number> {
    const [a, b] = await Promise.all([
      ListChainRun({ page: 1, pageSize: 1, chainId, status: 'running' }),
      ListChainRun({ page: 1, pageSize: 1, chainId, status: 'suspended' })
    ])
    return (a?.total || 0) + (b?.total || 0)
  }

  const handleUpdateStatus = (row: ChainInfo): (() => Promise<boolean>) => {
    return async () => {
      try {
        if (row.status) {
          let n = '若干'
          try {
            n = String(await activeRunCount(row.id))
          } catch {
            // 无运行查询权限时不展示具体数量
          }
          await ElMessageBox.confirm(`停用只拦截新调用，正在进行的 ${n} 个运行不受影响。确认停用？`, '停用流程调度', {
            type: 'warning'
          })
        } else {
          await ElMessageBox.confirm('确认启用此流程调度？', '启用流程调度', { type: 'info' })
        }
      } catch {
        return false
      }
      await UpdateChainStatus({ id: row.id, status: !row.status })
      ElMessage.success('操作成功')
      refreshUpdate()
      return true
    }
  }

  // ---------- 试运行 ----------

  const debugVisible = ref(false)
  const debugChain = ref<ChainInfo>()
  const debugBodyRule = ref<Record<string, FieldRule>>()

  async function openDebug(row: ChainInfo) {
    if (!row.currentVersion) {
      ElMessage.warning('尚未发布任何版本，不能测试执行')
      return
    }
    if (!row.status) {
      ElMessage.warning('流程调度未启用，不能测试执行')
      return
    }
    debugChain.value = row
    debugBodyRule.value = undefined
    try {
      const v = await GetChainVersion({ id: row.currentVersion })
      debugBodyRule.value = parseRule(v.rule).nodes.find((n) => n.type === 'start')?.request?.body
    } catch {
      // 读取入参规则失败时使用空模板
    }
    debugVisible.value = true
  }
</script>
