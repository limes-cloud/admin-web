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
            <ElSpace wrap>
              <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')">新增分发账号</ElButton>
            </ElSpace>
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
          <template #name="{ row }">
            <div class="name-cell">
              <b>{{ row.name }}</b>
              <small>{{ row.uid ? `UID: ${row.uid}` : '未填写 UID' }}</small>
            </div>
          </template>
          <template #channel="{ row }">
            <ElTag type="primary" effect="plain">{{ channelName(row.channelCode) }}</ElTag>
          </template>
          <template #credential="{ row }">
            <div v-if="row.panAccountId" class="credential-cell">
              <ElTag type="success" effect="light" size="small">网盘账号</ElTag>
              <small>{{ row.panAccountName || `#${row.panAccountId}` }}</small>
            </div>
            <div v-else class="credential-cell">
              <ElTag type="info" effect="light" size="small">独立 Token</ElTag>
              <small>{{ row.hasToken ? '凭证已配置' : '凭证缺失' }}</small>
            </div>
          </template>
          <template #status="{ row }">
            <ElTag :type="statusMeta(row.status).type" effect="light" size="small">
              {{ statusMeta(row.status).label }}
            </ElTag>
          </template>
          <template #reason="{ row }">
            <span v-if="row.reason" class="reason" :title="row.reason">{{ row.reason }}</span>
            <span v-else class="muted">-</span>
          </template>
          <template #quota="{ row }">
            <span v-if="row.quota">{{ row.quota }}</span>
            <span v-else class="muted">不限</span>
          </template>
          <template #lastCheckAt="{ row }">
            {{ parseExt(row.ext).lastCheckAt ? formatTime(parseExt(row.ext).lastCheckAt!) : '-' }}
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems(row)" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增分发账号' : '编辑分发账号'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="720px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="12"
          label-width="104px"
          @submit="handleSubmit"
          @cancel="dialogVisible = false"
        />
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Delete, Edit, Plus, Refresh, VideoPause, VideoPlay } from '@element-plus/icons-vue'

  import { useTable } from '@/composables/useTable'
  import { ListAccounts } from '@/api/psou/account/api'
  import {
    CheckDistributeAccount,
    CreateDistributeAccount,
    DeleteDistributeAccount,
    ListDistributeAccounts,
    ListDistributeChannels,
    UpdateDistributeAccount
  } from '@/api/psou/distribute-account/api'
  import type {
    CreateDistributeAccountRequest,
    DistributeAccount,
    DistributeAccountExt,
    DistributeChannel,
    UpdateDistributeAccountRequest
  } from '@/api/psou/distribute-account/type'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'PsouDistributeAccount' })

  type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'
  type CredentialMode = 'pan' | 'token'

  interface DistributeAccountForm extends Partial<DistributeAccount> {
    credentialMode: CredentialMode
    token?: string
  }

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<DistributeAccountForm>({ credentialMode: 'pan' })
  const checkingAccountId = ref<number | null>(null)
  const channels = ref<DistributeChannel[]>([])
  const panAccounts = ref<Awaited<ReturnType<typeof ListAccounts>>['list']>([])

  const statusOptions = [
    { label: '正常', value: 0 },
    { label: '失效', value: 1 },
    { label: '冻结', value: 2 },
    { label: '停用', value: 3 },
    { label: '限流', value: 4 },
    { label: '无权限', value: 5 },
    { label: '封禁', value: 6 }
  ]

  const channelMap = computed(() => new Map(channels.value.map((item) => [item.code, item])))
  const channelOptions = computed(() =>
    channels.value.map((item) => ({
      label: item.status === 0 ? item.name : `${item.name}（已停用）`,
      value: item.code
    }))
  )
  const enabledChannelOptions = computed(() =>
    channels.value
      .filter((item) => item.status === 0 || item.code === currentData.value.channelCode)
      .map((item) => ({
        label: item.status === 0 ? item.name : `${item.name}（已停用）`,
        value: item.code,
        disabled: item.status !== 0
      }))
  )
  const panAccountOptions = computed(() =>
    panAccounts.value.map((item) => ({
      label: `${item.name} · ${platformLabel(item.platform)}`,
      value: item.id
    }))
  )

  const platformLabel = (platform: string) => {
    const labels: Record<string, string> = {
      baidu: '百度网盘',
      quark: '夸克网盘',
      xunlei: '迅雷网盘'
    }
    return labels[platform] || platform || '未知平台'
  }

  const channelName = (code: string) => channelMap.value.get(code)?.name || code || '-'

  const statusMeta = (status: number): { label: string; type: TagType } => {
    const map: Record<number, { label: string; type: TagType }> = {
      0: { label: '正常', type: 'success' },
      1: { label: '失效', type: 'danger' },
      2: { label: '冻结', type: 'warning' },
      3: { label: '停用', type: 'info' },
      4: { label: '限流', type: 'warning' },
      5: { label: '无权限', type: 'danger' },
      6: { label: '封禁', type: 'danger' }
    }
    return map[status] ?? { label: '未知', type: 'info' }
  }

  const parseExt = (raw?: string | null): DistributeAccountExt => {
    if (!raw) return {}
    try {
      const ext = JSON.parse(raw)
      return ext && typeof ext === 'object' && !Array.isArray(ext) ? ext : {}
    } catch {
      return {}
    }
  }

  const searchForm = ref({
    name: undefined as string | undefined,
    channelCode: undefined as string | undefined,
    status: undefined as number | undefined
  })

  const searchItems = computed(() => [
    {
      label: '账号名称',
      key: 'name',
      type: 'input',
      props: {
        placeholder: '请输入账号名称',
        clearable: true,
        maxlength: 128
      }
    },
    {
      label: '分发渠道',
      key: 'channelCode',
      type: 'select',
      props: {
        placeholder: '请选择分发渠道',
        clearable: true,
        options: channelOptions.value
      }
    },
    {
      label: '账号状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择账号状态',
        clearable: true,
        options: statusOptions
      }
    }
  ])

  const formItems = computed(() => [
    {
      key: 'channelCode',
      label: '分发渠道',
      type: 'select',
      props: {
        placeholder: '请选择分发渠道',
        options: enabledChannelOptions.value,
        disabled: dialogType.value === 'edit',
        rules: [{ required: true, message: '请选择分发渠道', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'name',
      label: '账号名称',
      type: 'input',
      props: {
        placeholder: '请输入渠道内账号名称',
        maxlength: 128,
        rules: [{ required: true, message: '请输入账号名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'credentialMode',
      span: 24,
      label: '凭证来源',
      type: 'select',
      props: {
        placeholder: '请选择凭证来源',
        options: [
          { label: '关联网盘账号', value: 'pan' },
          { label: '独立 Token', value: 'token' }
        ],
        rules: [{ required: true, message: '请选择凭证来源', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'panAccountId',
      span: 24,
      label: '网盘账号',
      type: 'select',
      hidden: currentData.value.credentialMode !== 'pan',
      tip: '仅展示状态正常的网盘账号',
      props: {
        placeholder: panAccountOptions.value.length ? '请选择网盘账号' : '暂无状态正常的网盘账号',
        filterable: true,
        options: panAccountOptions.value,
        rules:
          currentData.value.credentialMode === 'pan'
            ? [{ required: true, message: '请选择网盘账号', trigger: ['blur', 'change'] }]
            : []
      }
    },
    {
      key: 'uid',
      label: '渠道 UID',
      type: 'input',
      hidden: currentData.value.credentialMode !== 'token',
      props: {
        placeholder: '请输入渠道侧用户 ID，可选',
        maxlength: 128
      }
    },
    {
      key: 'token',
      span: 24,
      label: 'Token',
      type: 'input',
      hidden: currentData.value.credentialMode !== 'token',
      tip: dialogType.value === 'edit' && currentData.value.hasToken ? '留空表示保持原 Token' : '',
      props: {
        type: 'textarea',
        rows: 4,
        maxlength: 8192,
        placeholder:
          dialogType.value === 'edit' && currentData.value.hasToken ? '留空表示保持原 Token' : '请输入渠道 Token',
        rules:
          currentData.value.credentialMode === 'token' && !(dialogType.value === 'edit' && currentData.value.hasToken)
            ? [{ required: true, message: '请输入渠道 Token', trigger: ['blur', 'change'] }]
            : []
      }
    },
    {
      key: 'priority',
      label: '调度优先级',
      type: 'number',
      defaultValue: 0,
      tip: '数值越大越优先',
      props: {
        min: -999999,
        max: 999999,
        align: 'left',
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'quota',
      label: '额度上限',
      type: 'number',
      tip: '0 或留空表示不限制',
      props: {
        min: 0,
        max: 999999999,
        align: 'left',
        controlsPosition: 'right',
        placeholder: '0 表示不限',
        style: { width: '100%' }
      }
    },
    {
      key: 'status',
      label: '账号状态',
      type: 'select',
      hidden: dialogType.value === 'add',
      props: {
        placeholder: '请选择账号状态',
        options: statusOptions,
        rules: [{ required: true, message: '请选择账号状态', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'reason',
      span: 24,
      label: '暂停原因',
      type: 'input',
      hidden: dialogType.value === 'add' || Number(currentData.value.status) === 0,
      props: {
        type: 'textarea',
        rows: 2,
        maxlength: 512,
        placeholder: '填写渠道导致的暂停原因'
      }
    },
    {
      key: 'remark',
      span: 24,
      label: '备注',
      type: 'input',
      props: {
        type: 'textarea',
        rows: 2,
        maxlength: 255,
        placeholder: '账号来源、限制说明等'
      }
    }
  ])

  const operationItems = (row: DistributeAccount) => {
    const checking = checkingAccountId.value === row.id
    return [
      {
        icon: Refresh,
        label: checking ? '检测中...' : '检测',
        color: 'primary',
        disabled: checking,
        click: (record: DistributeAccount) => handleCheck(record)
      },
      ...(row.status === 0 || row.status === 3
        ? [
            {
              icon: row.status === 0 ? VideoPause : VideoPlay,
              label: row.status === 0 ? '停用' : '启用',
              color: row.status === 0 ? 'info' : 'success',
              popConfirm: true,
              popTitle: `确定${row.status === 0 ? '停用' : '启用'}「${row.name}」吗？`,
              click: (record: DistributeAccount) => handleToggleStatus(record)
            }
          ]
        : []),
      {
        icon: Edit,
        label: '编辑',
        color: 'warning',
        click: (record: DistributeAccount) => showDialog('edit', record)
      },
      {
        icon: Delete,
        popConfirm: true,
        label: '删除',
        color: 'danger',
        click: async (record: DistributeAccount) => {
          await DeleteDistributeAccount({ id: record.id })
          ElMessage.success('删除成功')
          refreshRemove()
        }
      }
    ]
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    searchParams,
    pagination,
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
      apiFn: ListDistributeAccounts,
      apiParams: {
        page: 1,
        pageSize: 10,
        orderBy: 'priority',
        order: 'desc',
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'name',
          label: '账号名称',
          minWidth: 180,
          useSlot: true,
          slotName: 'name'
        },
        {
          prop: 'channel',
          label: '渠道',
          width: 110,
          useSlot: true,
          slotName: 'channel'
        },
        {
          prop: 'credential',
          label: '凭证来源',
          minWidth: 170,
          useSlot: true,
          slotName: 'credential'
        },
        {
          prop: 'status',
          label: '状态',
          width: 90,
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'reason',
          label: '暂停原因',
          minWidth: 160,
          useSlot: true,
          slotName: 'reason'
        },
        {
          prop: 'priority',
          label: '优先级',
          width: 90
        },
        {
          prop: 'quota',
          label: '额度上限',
          width: 100,
          useSlot: true,
          slotName: 'quota'
        },
        {
          prop: 'lastCheckAt',
          label: '最近检测',
          width: 170,
          useSlot: true,
          slotName: 'lastCheckAt'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 230,
          fixed: 'right',
          useSlot: true,
          slotName: 'operation'
        }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const loadChannels = async () => {
    const reply = await ListDistributeChannels()
    channels.value = reply.list || []
  }

  const loadPanAccounts = async () => {
    const reply = await ListAccounts({
      page: 1,
      pageSize: 200,
      status: 1,
      orderBy: 'priority',
      order: 'desc'
    })
    panAccounts.value = reply.list || []
  }

  const showDialog = (type: Form.DialogType, row?: DistributeAccount) => {
    dialogType.value = type
    currentData.value =
      type === 'add'
        ? {
            channelCode: channels.value.find((item) => item.status === 0)?.code,
            name: '',
            credentialMode: 'pan',
            panAccountId: undefined,
            uid: '',
            token: '',
            priority: 0,
            quota: undefined,
            remark: ''
          }
        : {
            ...(row as DistributeAccount),
            credentialMode: row?.panAccountId ? 'pan' : 'token',
            uid: row?.uid || '',
            token: '',
            quota: row?.quota ?? undefined
          }
    dialogVisible.value = true
  }

  watch(
    () => currentData.value.credentialMode,
    (mode, previous) => {
      if (!previous || mode === previous) return
      if (mode === 'pan') {
        currentData.value.token = ''
      } else {
        currentData.value.panAccountId = undefined
      }
    }
  )

  const buildPayload = () => {
    const item = currentData.value
    const credentialMode = item.credentialMode
    const quota = Number(item.quota)
    const reason = String(item.reason || '').trim()
    return {
      channelCode: String(item.channelCode || ''),
      panAccountId: credentialMode === 'pan' ? Number(item.panAccountId) : 0,
      name: String(item.name || '').trim(),
      uid: credentialMode === 'token' ? String(item.uid || '').trim() || undefined : undefined,
      token: credentialMode === 'token' ? String(item.token || '').trim() || undefined : undefined,
      status: dialogType.value === 'edit' ? Number(item.status ?? 0) : undefined,
      reason: Number(item.status) === 0 ? undefined : reason || undefined,
      priority: Number(item.priority) || 0,
      quota: Number.isFinite(quota) && quota > 0 ? quota : 0,
      remark: String(item.remark || '').trim()
    }
  }

  const handleSubmit = async () => {
    const payload = buildPayload()
    if (dialogType.value === 'add') {
      await CreateDistributeAccount(payload as CreateDistributeAccountRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateDistributeAccount({
        ...payload,
        id: Number(currentData.value.id)
      } as UpdateDistributeAccountRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleCheck = async (row: DistributeAccount) => {
    if (checkingAccountId.value !== null) return
    checkingAccountId.value = row.id
    try {
      const result = await CheckDistributeAccount({ id: row.id })
      const quota = result.remainingQuota > 0 ? `，剩余额度 ${result.remainingQuota}` : ''
      ElMessage.success(`检测完成：${statusMeta(result.status).label}${quota}`)
      refreshData()
    } finally {
      checkingAccountId.value = null
    }
  }

  const handleToggleStatus = async (row: DistributeAccount) => {
    const nextStatus = row.status === 3 ? 0 : 3
    await UpdateDistributeAccount({ id: row.id, status: nextStatus })
    ElMessage.success(nextStatus === 0 ? '已启用' : '已停用')
    refreshData()
  }

  onMounted(async () => {
    await Promise.allSettled([loadChannels(), loadPanAccounts()])
  })
</script>

<style scoped>
  .name-cell,
  .credential-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .name-cell small,
  .credential-cell small {
    overflow: hidden;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reason {
    display: block;
    overflow: hidden;
    color: var(--el-text-color-regular);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .muted {
    color: var(--el-text-color-placeholder);
  }
</style>
