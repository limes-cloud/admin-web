<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="handleResetSearch"
        />
      </div>

      <div class="table">
        <ArtTableHeader :loading="loading" @refresh="loadSKs">
          <template #left>
            <ElSpace wrap>
              <ElButton v-ripple type="primary" :icon="Plus" @click="openGenerateDialog">生成 SK</ElButton>
              <span class="hermes-tip">SK 只能在此页生成和查看，请妥善保管</span>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          row-key="sk"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #sk="{ row }">
            <div class="sk-cell">
              <code :title="row.sk">{{ maskSK(row.sk) }}</code>
              <ElButton text :icon="CopyDocument" @click="copyText(row.sk, 'SK 已复制')" />
            </div>
          </template>

          <template #status="{ row }">
            <div class="status-cell">
              <ElSwitch
                :model-value="row.status === 'enabled'"
                inline-prompt
                active-text="启用"
                inactive-text="禁用"
                :loading="statusUpdating === row.sk"
                @change="(value) => handleStatusChange(row, value)"
              />
              <ElTag v-if="row.expired" type="danger" effect="light" size="small">已过期</ElTag>
            </div>
          </template>

          <template #bindings="{ row }">{{ row.activeDeviceCount }} / {{ row.maxBindCount }}</template>

          <template #searchUsage="{ row }">{{ formatUsage(row.searchUsedToday, row.maxSearchCount) }}</template>

          <template #transferUsage="{ row }">
            {{ formatUsage(row.transferUsedToday, row.maxTransferCount) }}
          </template>

          <template #expiresAt="{ row }">{{ formatExpiry(row.expiresAt, row.expired) }}</template>

          <template #createdAt="{ row }">{{ formatTime(row.createdAt) }}</template>

          <template #operation="{ row }">
            <ElSpace>
              <ElButton link type="primary" :icon="Monitor" @click="openDevices(row)">设备</ElButton>
            </ElSpace>
          </template>
        </ArtTable>
      </div>
    </ElCard>

    <ElDialog
      v-model="generateVisible"
      title="生成 Hermes SK"
      width="560px"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
    >
      <ElForm label-width="120px" class="generate-form">
        <ElFormItem label="最大绑定设备">
          <ElInputNumber v-model="createForm.maxBindCount" :min="0" :max="1000" controls-position="right" />
          <span class="form-tip">超过上限的新设备无法激活</span>
        </ElFormItem>
        <ElFormItem label="每日搜索次数">
          <ElInputNumber v-model="createForm.maxSearchCount" :min="-1" controls-position="right" />
          <span class="form-tip">-1 不限，0 禁止</span>
        </ElFormItem>
        <ElFormItem label="每日转存次数">
          <ElInputNumber v-model="createForm.maxTransferCount" :min="-1" controls-position="right" />
          <span class="form-tip">-1 不限，0 禁止</span>
        </ElFormItem>
        <ElFormItem label="有效期">
          <div class="expiry-field">
            <ElSwitch v-model="neverExpire" active-text="永不过期" inactive-text="指定时间" />
            <ElDatePicker
              v-if="!neverExpire"
              v-model="expireAt"
              type="datetime"
              placeholder="选择过期时间"
              :disabled-date="disablePastDate"
            />
          </div>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="generateVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="generating" @click="handleGenerate">生成</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="createdVisible" title="SK 已生成" width="620px" align-center :close-on-click-modal="false">
      <ElAlert
        title="请立即复制并妥善保存。SK 不会再次自动展示，数据库中也只能由管理员查看。"
        type="warning"
        :closable="false"
        show-icon
      />
      <div class="created-sk-box">
        <code>{{ createdSK }}</code>
        <ElButton type="primary" :icon="CopyDocument" @click="copyText(createdSK, 'SK 已复制')">复制</ElButton>
      </div>
      <div v-if="createdExpiresAt !== -1" class="created-expiry">
        过期时间：{{ formatTime(createdExpiresAt) }}
      </div>
      <template #footer>
        <ElButton type="primary" @click="createdVisible = false">我已保存</ElButton>
      </template>
    </ElDialog>

    <ElDrawer v-model="deviceVisible" title="设备绑定" size="780px" destroy-on-close>
      <div class="drawer-head">
        <div>
          <span class="drawer-label">SK</span>
          <code>{{ currentSK ? maskSK(currentSK) : '-' }}</code>
        </div>
        <ElButton :icon="Refresh" :loading="deviceLoading" @click="loadDevices">刷新</ElButton>
      </div>
      <ElTable v-loading="deviceLoading" :data="devices" row-key="deviceId" empty-text="暂无设备绑定">
        <ElTableColumn label="设备" min-width="160">
          <template #default="{ row }">
            <div class="device-name">
              <b>{{ row.deviceName || '未命名设备' }}</b>
              <span>{{ row.os || '-' }} / {{ row.arch || '-' }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="设备标识" min-width="180">
          <template #default="{ row }">
            <div class="device-id">
              <code :title="row.deviceId">{{ maskDeviceID(row.deviceId) }}</code>
              <ElButton text :icon="CopyDocument" @click="copyText(row.deviceId, '设备标识已复制')" />
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="版本" width="100" prop="appVersion" />
        <ElTableColumn label="首次绑定" width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </ElTableColumn>
        <ElTableColumn label="最近使用" width="170">
          <template #default="{ row }">{{ row.lastSeenAt ? formatTime(row.lastSeenAt) : '-' }}</template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="90">
          <template #default="{ row }">
            <ElTag :type="row.revokedAt ? 'info' : 'success'" effect="light" size="small">
              {{ row.revokedAt ? '已撤销' : '生效中' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <ElButton
              v-if="!row.revokedAt"
              link
              type="danger"
              @click="handleRevokeDevice(row)"
            >
              撤销
            </ElButton>
            <span v-else class="muted">-</span>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { CopyDocument, Monitor, Plus, Refresh } from '@element-plus/icons-vue'

  import {
    CreateHermesSK,
    ListHermesDevice,
    ListHermesSK,
    RevokeHermesDevice,
    UpdateHermesSKStatus
  } from '@/api/psou/hermes/api'
  import type { HermesDevice, HermesSK } from '@/api/psou/hermes/type'
  import type { ColumnOption } from '@/types/component'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'PsouHermes' })

  const loading = ref(false)
  const data = ref<HermesSK[]>([])
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const statusUpdating = ref('')

  const searchForm = ref({
    sk: '',
    status: undefined as 'enabled' | 'disabled' | undefined
  })

  const searchItems = computed(() => [
    {
      label: 'SK',
      key: 'sk',
      type: 'input',
      props: { placeholder: '输入完整 SK 或前缀', clearable: true, maxlength: 32 }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '全部状态',
        clearable: true,
        options: [
          { label: '启用', value: 'enabled' },
          { label: '禁用', value: 'disabled' }
        ]
      }
    }
  ])

  const columns: ColumnOption<HermesSK>[] = [
    { prop: 'sk', label: 'SK', minWidth: 240, useSlot: true, slotName: 'sk' },
    { prop: 'status', label: '状态', width: 150, useSlot: true, slotName: 'status' },
    { prop: 'bindings', label: '设备绑定', width: 110, useSlot: true, slotName: 'bindings' },
    { prop: 'searchUsage', label: '今日搜索', width: 120, useSlot: true, slotName: 'searchUsage' },
    { prop: 'transferUsage', label: '今日转存', width: 120, useSlot: true, slotName: 'transferUsage' },
    { prop: 'expiresAt', label: '有效期', width: 190, useSlot: true, slotName: 'expiresAt' },
    { prop: 'createdAt', label: '创建时间', width: 170, useSlot: true, slotName: 'createdAt' },
    { prop: 'operation', label: '操作', width: 100, fixed: 'right', useSlot: true, slotName: 'operation' }
  ]

  const pagination = computed(() => ({ current: page.value, size: pageSize.value, total: total.value }))

  const loadSKs = async () => {
    loading.value = true
    try {
      const reply = await ListHermesSK({
        page: page.value,
        pageSize: pageSize.value,
        sk: searchForm.value.sk.trim() || undefined,
        status: searchForm.value.status
      })
      data.value = Array.isArray(reply.list) ? reply.list : []
      total.value = Number(reply.total) || 0
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    page.value = 1
    loadSKs()
  }

  const handleResetSearch = () => {
    searchForm.value.sk = ''
    searchForm.value.status = undefined
    page.value = 1
    loadSKs()
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    page.value = 1
    loadSKs()
  }

  const handleCurrentChange = (current: number) => {
    page.value = current
    loadSKs()
  }

  const generateVisible = ref(false)
  const generating = ref(false)
  const createForm = reactive({ maxBindCount: 2, maxSearchCount: 500, maxTransferCount: 20 })
  const neverExpire = ref(true)
  const expireAt = ref<Date | null>(null)
  const createdVisible = ref(false)
  const createdSK = ref('')
  const createdExpiresAt = ref(-1)

  const openGenerateDialog = () => {
    createForm.maxBindCount = 2
    createForm.maxSearchCount = 500
    createForm.maxTransferCount = 20
    neverExpire.value = true
    expireAt.value = null
    generateVisible.value = true
  }

  const handleGenerate = async () => {
    let expiresAt = -1
    if (!neverExpire.value) {
      if (!expireAt.value) {
        ElMessage.warning('请选择过期时间')
        return
      }
      expiresAt = Math.floor(expireAt.value.getTime() / 1000)
      if (expiresAt <= Math.floor(Date.now() / 1000)) {
        ElMessage.warning('过期时间必须晚于当前时间')
        return
      }
    }
    generating.value = true
    try {
      const reply = await CreateHermesSK({
        maxBindCount: Number(createForm.maxBindCount),
        maxSearchCount: Number(createForm.maxSearchCount),
        maxTransferCount: Number(createForm.maxTransferCount),
        expiresAt
      })
      createdSK.value = reply.sk
      createdExpiresAt.value = reply.expiresAt
      generateVisible.value = false
      createdVisible.value = true
      page.value = 1
      await loadSKs()
    } finally {
      generating.value = false
    }
  }

  const handleStatusChange = async (row: HermesSK, value: string | number | boolean) => {
    const status = value ? 'enabled' : 'disabled'
    statusUpdating.value = row.sk
    try {
      await UpdateHermesSKStatus({ sk: row.sk, status })
      ElMessage.success(status === 'enabled' ? 'SK 已启用' : 'SK 已禁用')
      await loadSKs()
    } finally {
      statusUpdating.value = ''
    }
  }

  const deviceVisible = ref(false)
  const deviceLoading = ref(false)
  const devices = ref<HermesDevice[]>([])
  const currentSK = ref('')

  const openDevices = async (row: HermesSK) => {
    currentSK.value = row.sk
    deviceVisible.value = true
    await loadDevices()
  }

  const loadDevices = async () => {
    if (!currentSK.value) return
    deviceLoading.value = true
    try {
      const reply = await ListHermesDevice({ sk: currentSK.value })
      devices.value = Array.isArray(reply.list) ? reply.list : []
    } finally {
      deviceLoading.value = false
    }
  }

  const handleRevokeDevice = async (row: HermesDevice) => {
    try {
      await ElMessageBox.confirm(
        `确定撤销设备「${row.deviceName || row.deviceId.slice(0, 12)}」吗？撤销后该设备需要重新激活。`,
        '撤销设备',
        { type: 'warning', confirmButtonText: '撤销', cancelButtonText: '取消' }
      )
    } catch {
      return
    }
    await RevokeHermesDevice({ sk: currentSK.value, deviceId: row.deviceId })
    ElMessage.success('设备已撤销')
    await Promise.all([loadDevices(), loadSKs()])
  }

  const maskSK = (value: string) => {
    if (!value) return '-'
    if (value.length <= 18) return value
    return `${value.slice(0, 8)}••••••${value.slice(-6)}`
  }

  const maskDeviceID = (value: string) => {
    if (!value) return '-'
    return `${value.slice(0, 10)}...${value.slice(-8)}`
  }

  const formatUsage = (used: number, limit: number) => (limit === -1 ? `${used} / 不限` : `${used} / ${limit}`)

  const formatExpiry = (value: number, expired: boolean) => {
    if (value === -1) return '永不过期'
    const time = formatTime(value)
    return expired ? `已过期 · ${time}` : time
  }

  const disablePastDate = (date: Date) => date.getTime() < Date.now() - 24 * 60 * 60 * 1000

  const copyText = async (value: string, successMessage = '已复制') => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const input = document.createElement('textarea')
      input.value = value
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    ElMessage.success(successMessage)
  }

  onMounted(loadSKs)
</script>

<style scoped lang="scss">
  .hermes-tip {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 32px;
  }

  .sk-cell,
  .device-id {
    display: flex;
    gap: 4px;
    align-items: center;
    min-width: 0;
  }

  .sk-cell code,
  .device-id code,
  .created-sk-box code {
    padding: 3px 7px;
    overflow: hidden;
    font-family: var(--el-font-family-mono, ui-monospace, 'SFMono-Regular', Menlo, monospace);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: var(--el-fill-color-light);
    border-radius: 5px;
  }

  .status-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .form-tip {
    margin-left: 10px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .expiry-field {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .created-sk-box {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 18px;
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
  }

  .created-sk-box code {
    flex: 1;
    padding: 10px 12px;
    overflow-wrap: anywhere;
    white-space: normal;
  }

  .created-expiry {
    margin-top: 10px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .drawer-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .drawer-head > div {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .drawer-label {
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .device-name {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .device-name span {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .muted {
    color: var(--el-text-color-placeholder);
  }

  @media (width <= 768px) {
    .hermes-tip {
      display: none;
    }

    .created-sk-box {
      align-items: stretch;
      flex-direction: column;
    }
  }
</style>
