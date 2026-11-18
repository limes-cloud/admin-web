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
              <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')">新增账号</ElButton>
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
          <template #status="{ row }">
            <ElTooltip v-if="row.status !== 0 && row.reason" :content="row.reason" placement="top">
              <ElTag class="status-tag" :type="statusMeta(row.status).type" effect="light" size="small">
                {{ statusMeta(row.status).label }}
              </ElTag>
            </ElTooltip>
            <ElTag v-else :type="statusMeta(row.status).type" effect="light" size="small">
              {{ statusMeta(row.status).label }}
            </ElTag>
          </template>
          <template #quota="{ row }">
            <span v-if="row.quota">{{ row.quota }}</span>
            <span v-else class="muted">不限</span>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems(row)" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增账号' : '编辑分发账号'"
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
        >
          <template #token="{ modelValue }">
            <div class="credential-editor">
              <div class="credential-mode">
                <ElSegmented
                  v-model="credentialInputMode"
                  :options="credentialInputModeOptions"
                  size="small"
                  @change="handleCredentialInputModeChange"
                />
                <span class="credential-mode-tip">推荐扫码，登录态由服务端直接保存</span>
              </div>

              <div v-if="useCredentialQR" class="qr-panel">
                <template v-if="qrImage">
                  <div class="qr-frame">
                    <img :src="qrImage" :alt="`${qrAppName}登录二维码`" />
                    <div v-if="qrState === 'expired' || qrState === 'failed'" class="qr-mask">
                      {{ qrState === 'expired' ? '二维码已过期' : '获取失败' }}
                    </div>
                  </div>
                  <div class="qr-detail">
                    <ElTag :type="qrStateMeta.type" effect="light">{{ qrStateMeta.label }}</ElTag>
                    <p>{{ qrDescription }}</p>
                    <ElButton
                      v-if="qrState !== 'confirmed'"
                      type="primary"
                      plain
                      size="small"
                      :icon="Refresh"
                      :loading="qrLoading"
                      @click="startQRSession"
                    >
                      刷新二维码
                    </ElButton>
                  </div>
                </template>
                <div v-else class="qr-empty">
                  <ElIcon :size="34"><Picture /></ElIcon>
                  <p>{{ qrEmptyText }}</p>
                  <ElButton type="primary" plain :loading="qrLoading" @click="startQRSession">
                    获取登录二维码
                  </ElButton>
                </div>
              </div>

              <template v-else>
                <ElInput
                  v-model="modelValue.token"
                  type="textarea"
                  :rows="4"
                  maxlength="8192"
                  :placeholder="credentialPlaceholder"
                />
                <div class="credential-manual-tip">
                  {{
                    dialogType === 'edit' && currentData.hasToken
                      ? '留空将保留原 Token；填写后会用新值覆盖。'
                      : '扫码不可用时，可手工粘贴渠道 Token。'
                  }}
                </div>
              </template>
            </div>
          </template>
        </ArtForm>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Delete, Edit, Picture, Plus, Refresh, VideoPause, VideoPlay } from '@element-plus/icons-vue'

  import { useTable } from '@/composables/useTable'
  import { ListLegacyAccounts } from '@/api/psou/account/legacy'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import {
    CheckDistributeAccount,
    CreateDistributeAccount,
    CreateDistributeAccountQRSession,
    DeleteDistributeAccount,
    GetDistributeAccountQRSession,
    ListDistributeAccounts,
    ListDistributeChannels,
    UpdateDistributeAccount
  } from '@/api/psou/distribute-account/api'
  import type {
    CreateDistributeAccountRequest,
    DistributeAccount,
    DistributeAccountQRState,
    DistributeChannel,
    UpdateDistributeAccountRequest
  } from '@/api/psou/distribute-account/type'
  defineOptions({ name: 'PsouDistributeAccount' })

  type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'
  type CredentialMode = 'pan' | 'token'
  type CredentialInputMode = 'qr' | 'manual'
  type QRViewState = 'idle' | 'loading' | DistributeAccountQRState

  interface DistributeAccountForm extends Partial<DistributeAccount> {
    credentialMode: CredentialMode
    token?: string
  }

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<DistributeAccountForm>({ credentialMode: 'pan' })
  const checkingAccountId = ref<number | null>(null)
  const channels = ref<DistributeChannel[]>([])
  const panAccounts = ref<Awaited<ReturnType<typeof ListLegacyAccounts>>['list']>([])
  const credentialInputMode = ref<CredentialInputMode>('qr')
  const qrSessionId = ref('')
  const qrImage = ref('')
  const qrState = ref<QRViewState>('idle')
  const qrTicket = ref('')
  const qrExpiresAt = ref(0)
  const qrLoading = ref(false)

  let qrPollTimer: ReturnType<typeof setTimeout> | null = null
  let qrGeneration = 0

  const qrPlatform = 'baidu'
  const qrAppName = '百度 App'
  const credentialInputModeOptions = [
    { label: '扫码录入', value: 'qr' },
    { label: '手工 Token', value: 'manual' }
  ]

  const filterStatusOptions = [
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

  const credentialPlaceholder = computed(() =>
    dialogType.value === 'edit' && currentData.value.hasToken ? '留空表示保持原 Token' : '请输入渠道 Token'
  )

  const useCredentialQR = computed(
    () => currentData.value.credentialMode === 'token' && credentialInputMode.value === 'qr'
  )

  const qrStateMeta = computed((): { label: string; type: TagType } => {
    const map: Record<QRViewState, { label: string; type: TagType }> = {
      idle: { label: '待获取', type: 'info' },
      loading: { label: '加载中', type: 'info' },
      pending: { label: '待扫码', type: 'warning' },
      scanned: { label: '待确认', type: 'primary' },
      confirmed: { label: '已完成', type: 'success' },
      expired: { label: '已过期', type: 'warning' },
      failed: { label: '失败', type: 'danger' }
    }
    return map[qrState.value]
  })

  const qrDescription = computed(() => {
    switch (qrState.value) {
      case 'pending':
        return `请使用${qrAppName}扫码，二维码 3 分钟内有效。`
      case 'scanned':
        return '已扫码，请在手机上确认登录。'
      case 'confirmed':
        return '登录态已安全获取，点击“确定”保存到分发账号。'
      case 'expired':
        return '二维码已过期，请刷新后重新扫码。'
      case 'failed':
        return '登录二维码获取失败，请稍后重试。'
      default:
        return `二维码有效期至 ${new Date(qrExpiresAt.value * 1000).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })}`
    }
  })

  const qrEmptyText = computed(() =>
    qrLoading.value ? '正在获取登录二维码…' : `使用${qrAppName}扫码录入登录态，无需手工复制 Token`
  )

  const validateCredential = (_rule: unknown, _value: unknown, callback: (error?: Error) => void) => {
    if (currentData.value.credentialMode !== 'token') {
      callback()
      return
    }
    if (credentialInputMode.value === 'qr') {
      if (!qrTicket.value) {
        callback(new Error(`请先扫码完成${qrAppName}登录`))
        return
      }
      callback()
      return
    }
    const hasToken = Boolean(currentData.value.hasToken)
    if (!hasToken && !String(currentData.value.token || '').trim()) {
      callback(new Error('请输入渠道 Token'))
      return
    }
    callback()
  }

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
        options: filterStatusOptions
      }
    }
  ])

  const formItems = computed<FormItem[]>(() => [
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
      tip: '保存后根据登录态自动获取',
      tipPosition: 'after',
      props: {
        disabled: true,
        placeholder: '保存后自动获取账号名称',
        maxlength: 128
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
          { label: '独立凭证', value: 'token' }
        ],
        onChange: (value: CredentialMode) => handleCredentialModeChange(value),
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
      tipPosition: 'after',
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
      tip: '保存后根据登录态自动获取',
      tipPosition: 'after',
      props: {
        disabled: true,
        placeholder: '保存后自动获取渠道 UID',
        maxlength: 128
      }
    },
    {
      key: 'token',
      span: 24,
      label: '用户凭证',
      type: 'input',
      hidden: currentData.value.credentialMode !== 'token',
      props: {
        rules:
          currentData.value.credentialMode === 'token'
            ? [{ required: true, validator: validateCredential, trigger: ['blur', 'change'] }]
            : []
      }
    },
    {
      key: 'priority',
      label: '调度权重',
      type: 'number',
      defaultValue: 0,
      tip: '数值越大权重越高',
      tipPosition: 'after',
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
      tipPosition: 'after',
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

  const stopQRPolling = () => {
    if (qrPollTimer) {
      clearTimeout(qrPollTimer)
      qrPollTimer = null
    }
  }

  const resetQRState = () => {
    qrGeneration += 1
    stopQRPolling()
    qrSessionId.value = ''
    qrImage.value = ''
    qrState.value = 'idle'
    qrTicket.value = ''
    qrExpiresAt.value = 0
    qrLoading.value = false
  }

  const scheduleQRPoll = (generation: number, delay = 2200) => {
    stopQRPolling()
    if (!dialogVisible.value || generation !== qrGeneration) return
    qrPollTimer = setTimeout(() => {
      void pollQRSession(generation)
    }, delay)
  }

  const pollQRSession = async (generation: number) => {
    if (!qrSessionId.value || qrTicket.value || generation !== qrGeneration) return
    try {
      const res = await GetDistributeAccountQRSession({ sessionId: qrSessionId.value })
      if (generation !== qrGeneration) return
      qrState.value = res.state
      if (res.state === 'confirmed') {
        qrTicket.value = res.qrTicket || ''
        stopQRPolling()
        if (qrTicket.value) {
          ElMessage.success('扫码成功，提交后将更新分发账号登录态')
        } else {
          qrState.value = 'failed'
        }
        return
      }
      if (res.state === 'expired' || res.state === 'failed') {
        stopQRPolling()
        return
      }
      scheduleQRPoll(generation)
    } catch {
      if (generation !== qrGeneration) return
      qrState.value = 'failed'
      stopQRPolling()
    }
  }

  const startQRSession = async () => {
    if (qrLoading.value) return
    resetQRState()
    const generation = qrGeneration
    qrState.value = 'loading'
    qrLoading.value = true
    try {
      const res = await CreateDistributeAccountQRSession({ platform: qrPlatform })
      if (generation !== qrGeneration) return
      qrSessionId.value = res.sessionId
      qrImage.value = res.image
      qrExpiresAt.value = res.expiresAt
      qrState.value = 'pending'
      scheduleQRPoll(generation, 800)
    } catch {
      if (generation === qrGeneration) {
        qrState.value = 'failed'
      }
    } finally {
      if (generation === qrGeneration) {
        qrLoading.value = false
      }
    }
  }

  const handleCredentialInputModeChange = (value: string | number | boolean) => {
    if (value === 'manual') {
      resetQRState()
      return
    }
    if (value === 'qr' && !qrSessionId.value) {
      void startQRSession()
    }
  }

  const handleCredentialModeChange = (value: CredentialMode) => {
    if (value === 'pan') {
      currentData.value.token = ''
      resetQRState()
      return
    }
    currentData.value.panAccountId = undefined
    credentialInputMode.value = 'qr'
    void startQRSession()
  }

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
          useSlot: true,
          slotName: 'name'
        },
        {
          prop: 'channel',
          label: '渠道',
          useSlot: true,
          slotName: 'channel'
        },
        {
          prop: 'status',
          label: '状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'priority',
          label: '调度权重'
        },
        {
          prop: 'quota',
          label: '额度上限',
          useSlot: true,
          slotName: 'quota'
        },
        {
          prop: 'operation',
          label: '操作',
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
    const reply = await ListLegacyAccounts({
      page: 1,
      pageSize: 200,
      status: 1,
      orderBy: 'priority',
      order: 'desc'
    })
    panAccounts.value = reply.list || []
  }

  const showDialog = (type: Form.DialogType, row?: DistributeAccount) => {
    resetQRState()
    dialogType.value = type
    credentialInputMode.value = type === 'edit' ? 'manual' : 'qr'
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

  const buildPayload = () => {
    const item = currentData.value
    const credentialMode = item.credentialMode
    const usingQR = credentialMode === 'token' && credentialInputMode.value === 'qr'
    const quota = Number(item.quota)
    const reason = String(item.reason || '').trim()
    return {
      channelCode: String(item.channelCode || ''),
      panAccountId: credentialMode === 'pan' ? Number(item.panAccountId) : 0,
      token: credentialMode === 'token' && !usingQR ? String(item.token || '').trim() || undefined : undefined,
      qrTicket: usingQR ? qrTicket.value || undefined : undefined,
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

  watch(dialogVisible, (visible) => {
    if (!visible) resetQRState()
  })

  onBeforeUnmount(() => {
    resetQRState()
  })

  onMounted(async () => {
    await Promise.allSettled([loadChannels(), loadPanAccounts()])
  })
</script>

<style scoped>
  .name-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .name-cell small {
    overflow: hidden;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-tag {
    cursor: help;
  }

  .muted {
    color: var(--el-text-color-placeholder);
  }

  .credential-editor {
    width: 100%;
  }

  .credential-mode {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
  }

  .credential-mode-tip,
  .credential-manual-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .credential-manual-tip {
    margin-top: 6px;
    line-height: 1.5;
  }

  .qr-panel {
    display: flex;
    gap: 22px;
    align-items: center;
    min-height: 210px;
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
  }

  .qr-frame {
    position: relative;
    width: 184px;
    height: 184px;
    overflow: hidden;
    background: #fff;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .qr-frame img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .qr-mask {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 13px;
    color: var(--el-color-white);
    background: rgb(0 0 0 / 62%);
  }

  .qr-detail {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
    min-width: 0;
  }

  .qr-detail p,
  .qr-empty p {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  .qr-empty {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    justify-content: center;
    min-height: 178px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
</style>
