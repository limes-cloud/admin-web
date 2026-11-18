<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          :default-expanded="true"
          @search="handleSearch"
          @reset="resetSearchParams"
        />
      </div>

      <div class="table">
        <ArtTableHeader :loading="loading" layout="refresh,fullscreen" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')"> 新增账号 </ElButton>
            </ElSpace>
          </template>
          <template #right-after-refresh>
            <ElDropdown trigger="hover" placement="bottom-end" @command="handleSortModeChange">
              <button
                type="button"
                class="account-sort"
                :class="{ 'is-active': sortMode !== 'priority' }"
                aria-label="排序"
              >
                <ElIcon><Sort /></ElIcon>
              </button>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem v-for="item in sortOptions" :key="item.value" :command="item.value">
                    {{ item.label }}
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </template>
        </ArtTableHeader>

        <div class="account-card-scroll">
          <ElEmpty v-if="!loading && !accountList.length" description="暂无账号" />

          <div v-else v-loading="loading" class="account-grid">
            <article
              v-for="item in accountList"
              :key="item.id"
              class="account-card"
              :class="{ 'has-vip': item.ext?.isVip }"
            >
              <ElTag v-if="item.ext?.isVip" class="account-card__vip" type="warning" effect="dark" size="small">
                VIP
              </ElTag>

              <div class="account-card__header">
                <div class="account-card__avatar" :class="platformAvatarClass(item.platform)">
                  <img
                    v-if="platformLogos[item.platform]"
                    :src="platformLogos[item.platform]"
                    :alt="platformMeta(item.platform).label"
                    referrerpolicy="no-referrer"
                  />
                  <template v-else>{{ platformInitial(item.platform) }}</template>
                </div>

                <div class="account-card__identity">
                  <div class="account-card__name-line">
                    <h2 :title="item.name || '待解析昵称'">{{ item.name || '待解析昵称' }}</h2>
                    <ElTag :type="platformMeta(item.platform).type" effect="plain" size="small">
                      {{ platformMeta(item.platform).label }}
                    </ElTag>
                  </div>
                  <p :title="item.remark || '暂无账号备注'">{{ item.remark || '暂无账号备注' }}</p>
                </div>

                <ArtOperation :single="true" :list="operationItems(item)" :data="item" :has-background="false">
                  <ElButton class="account-card__more" text :icon="MoreFilled" />
                </ArtOperation>
              </div>

              <div class="account-card__storage">
                <div class="account-card__section-title">
                  <span>存储用量</span>
                  <b v-if="Number(item.storageTotal) > 0">{{ storageUsagePercent(item) }}%</b>
                  <b v-else>未探测</b>
                </div>
                <ElProgress
                  :percentage="storageUsagePercent(item)"
                  :stroke-width="7"
                  :show-text="false"
                  :color="storageProgressColor(storageUsagePercent(item))"
                />
                <div class="account-card__storage-detail">
                  <template v-if="Number(item.storageTotal) > 0">
                    {{ getFileSize(Number(item.storageUsed) || 0) || '0B' }} /
                    {{ getFileSize(Number(item.storageTotal) || 0) }}
                  </template>
                  <span v-else>尚未获取到账号容量</span>
                </div>
              </div>

              <div class="account-card__routes">
                <div class="account-card__section-title">
                  <span>今日转存与分享</span>
                  <b>共 {{ todayStats(item).total }} 次</b>
                </div>
                <div class="today-ops">
                  <div class="today-ops__ring" :style="todayRingStyle(item)">
                    <span>{{ todayStats(item).total }}</span>
                  </div>
                  <div class="today-ops__legend">
                    <div class="today-ops__item">
                      <span class="today-ops__dot is-transfer"></span>
                      <span class="today-ops__label">转存</span>
                      <b>{{ todayStats(item).transfer }}</b>
                    </div>
                    <div class="today-ops__item">
                      <span class="today-ops__dot is-share"></span>
                      <span class="today-ops__label">分享</span>
                      <b>{{ todayStats(item).share }}</b>
                    </div>
                  </div>
                </div>
              </div>

              <div class="account-card__footer">
                <div class="account-card__footer-status">
                  <div class="status-cell">
                    <ElTag :type="accountStatus(item.status).type" effect="light" size="small">
                      {{ accountStatus(item.status).label }}
                    </ElTag>
                    <ElTag v-if="item.ext?.isUnzipAccount" type="success" effect="plain" size="small"> 解压账号 </ElTag>
                    <ElTag
                      v-if="item.ext?.isUnzipAccount && item.ext?.unzipDir"
                      type="info"
                      effect="plain"
                      size="small"
                      :title="item.ext.unzipDir"
                    >
                      自定义解压目录
                    </ElTag>
                    <ElTag
                      v-if="item.ext?.limitedAt"
                      type="warning"
                      effect="plain"
                      size="small"
                      :title="`限流时间：${formatTime(item.ext.limitedAt)}`"
                    >
                      限流 · {{ item.ext.limitOp || '未知' }}
                    </ElTag>
                  </div>
                  <span class="account-card__check">{{ formatCheckAge(item.ext?.lastCheckAt) }}</span>
                </div>
                <div class="account-card__enable">
                  <span>是否启用</span>
                  <ElSwitch
                    :model-value="item.status === 1"
                    :loading="updatingAccountId === item.id"
                    :disabled="updatingAccountId !== null && updatingAccountId !== item.id"
                    inline-prompt
                    active-text="启用"
                    inactive-text="停用"
                    @change="(value) => handleStatusChange(item, value)"
                  />
                </div>
              </div>
            </article>
          </div>
        </div>

        <div v-if="pagination.total > 0" class="account-pagination">
          <ElPagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="pagination.current"
            :page-size="pagination.size"
            :page-sizes="[6, 9, 12, 24, 48]"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增账号' : '编辑账号'"
        :destroy-on-close="true"
        :close-on-click-modal="!submitting"
        :close-on-press-escape="!submitting"
        :show-close="!submitting"
        body-class="art-form-dialog"
        width="780px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="12"
          label-width="110px"
          :loading-submit="submitting"
          :loading-text="dialogType === 'add' ? '正在创建账号并初始化网盘目录...' : '正在保存账号配置...'"
          @submit="handleSubmit"
          @cancel="dialogVisible = false"
        >
          <template #token="{ modelValue }">
            <div class="login-state">
              <div v-if="supportsQRLogin(currentData.platform)" class="login-mode">
                <ElSegmented v-model="tokenMode" :options="tokenModeOptions" @change="handleTokenModeChange" />
                <span class="login-mode-tip">推荐扫码，登录态由服务端直接保存</span>
              </div>

              <div v-if="useQRLogin" class="qr-panel">
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
                  maxlength="65535"
                  :placeholder="tokenPlaceholder"
                />
                <div class="login-manual-tip">
                  {{
                    dialogType === 'edit'
                      ? '留空将保留原 Token；填写后会用新值覆盖。'
                      : '扫码不可用时，可手工粘贴平台登录 Token。'
                  }}
                </div>
              </template>
            </div>
          </template>

          <template #routes>
            <div class="route-config-wrap">
              <div class="route-configs">
                <div v-for="section in routeSections" :key="section.key" class="route-card">
                  <div class="route-card-head">
                    <b>{{ section.label }}</b>
                    <span class="route-description">{{ section.description }}</span>
                  </div>

                  <div class="route-field">
                    <span>转存目录</span>
                    <ElInput
                      v-model="currentData.config[section.key].transferDir"
                      maxlength="512"
                      :placeholder="section.defaultDir"
                    />
                  </div>

                  <div class="route-limit-grid">
                    <div class="route-field">
                      <span>每日转存上限</span>
                      <ElInputNumber
                        v-model="currentData.config[section.key].dailyTransferLimit"
                        :min="-1"
                        :step="1"
                        :precision="0"
                        controls-position="right"
                      />
                    </div>
                    <div class="route-field">
                      <span>每日分享上限</span>
                      <ElInputNumber
                        v-model="currentData.config[section.key].dailyShareLimit"
                        :min="-1"
                        :step="1"
                        :precision="0"
                        controls-position="right"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <p class="route-tip">
                所有正常账号自动参与四条转存通路；目录留空时使用平台根目录。每日上限 -1 表示不限，0
                表示不参与该通路（后续不会被选中），正数为每日上限。今日计数只读，跨日自动重置。
              </p>
            </div>
          </template>
        </ArtForm>
      </ElDialog>

      <AccountFileManager v-model="fileManagerVisible" :account="fileManagerAccount" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    CircleCheck,
    CopyDocument,
    Delete,
    Edit,
    FolderOpened,
    MoreFilled,
    Picture,
    Plus,
    Refresh,
    RefreshRight,
    Sort,
    Warning
  } from '@element-plus/icons-vue'

  import { useTable } from '@/composables/useTable'
  import {
    ProbeAccount,
    CreateAccount,
    CreateAccountQRSession,
    DeleteAccount,
    GetAccountQRSession,
    ListAccount,
    ProbeAndRecoverAccount,
    RefreshAccountStorage,
    UpdateAccount
  } from '@/api/psou/account/api'
  import type {
    Account,
    AccountConfig,
    AccountExt,
    AccountQRState,
    AccountRouteConfig,
    AccountRouteKey,
    AccountStatus,
    CreateAccountRequest,
    UpdateAccountRequest,
    UInt64Value
  } from '@/api/psou/account/type'
  import { getFileSize } from '@/utils/file'
  import { formatTime } from '@/utils/time'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import AccountFileManager from './components/AccountFileManager.vue'

  defineOptions({ name: 'PsouAccount' })

  const { copy, isSupported: isClipboardSupported } = useClipboard()

  type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'
  type TokenMode = 'qr' | 'manual'
  type QRViewState = AccountQRState | 'idle' | 'loading'
  type RouteFormConfig = Required<AccountRouteConfig>
  type AccountSortMode = 'priority' | 'storageDesc' | 'storageAsc'

  interface RouteSection {
    key: AccountRouteKey
    label: string
    description: string
    type: TagType
    defaultDir: string
  }

  interface AccountFormData extends Partial<Omit<Account, 'ext'>> {
    token?: string
    config: Record<AccountRouteKey, RouteFormConfig>
    ext?: AccountExt
  }

  const defaultTransferDirs: Record<AccountRouteKey, string> = {
    fixed: '/psou/fixed',
    transfer: '/psou/transfer',
    search: '/psou/search',
    manual: '/psou/manual'
  }

  const defaultDailyShareLimits: Record<AccountRouteKey, number> = {
    fixed: 200,
    transfer: -1,
    search: -1,
    manual: -1
  }

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const fileManagerVisible = ref(false)
  const fileManagerAccount = ref<Account>()
  const currentData = ref<AccountFormData>({ config: emptyRouteConfigs() })
  const checkingAccountId = ref<UInt64Value | null>(null)
  const refreshingAccountId = ref<UInt64Value | null>(null)
  const recoveringAccountId = ref<UInt64Value | null>(null)
  const updatingAccountId = ref<UInt64Value | null>(null)
  const tokenMode = ref<TokenMode>('qr')
  const qrSessionId = ref('')
  const qrImage = ref('')
  const qrState = ref<QRViewState>('idle')
  const qrTicket = ref('')
  const qrExpiresAt = ref(0)
  const qrLoading = ref(false)
  const submitting = ref(false)

  let qrPollTimer: ReturnType<typeof setTimeout> | null = null
  let qrGeneration = 0

  const qrPlatforms = new Set(['baidu', 'quark'])

  const supportsQRLogin = (platform?: string) => qrPlatforms.has(String(platform || ''))

  const tokenModeOptions = [
    { label: '扫码录入', value: 'qr' },
    { label: '手工 Token', value: 'manual' }
  ]

  const platformOptions = [
    { label: '百度网盘', value: 'baidu' },
    { label: '夸克网盘', value: 'quark' }
  ]

  const platformLabels: Record<string, string> = {
    baidu: '百度网盘',
    quark: '夸克网盘'
  }

  const statusOptions: Array<{ label: string; value: AccountStatus }> = [
    { label: '启用', value: 1 },
    { label: '停用', value: 0 },
    { label: '失效', value: -1 }
  ]

  const vipOptions: Array<{ label: string; value: boolean }> = [
    { label: '是', value: true },
    { label: '否', value: false }
  ]

  const routeSections: RouteSection[] = [
    {
      key: 'fixed',
      label: '固定资源',
      description: 'fixed 资源包日常转存与分享',
      type: 'success',
      defaultDir: '留空使用平台根目录，例如 /psou/fixed'
    },
    {
      key: 'transfer',
      label: '离线转存',
      description: '内容生产任务转存与分享',
      type: 'primary',
      defaultDir: '留空使用平台根目录，例如 /psou/transfer'
    },
    {
      key: 'search',
      label: '在线搜索',
      description: '用户在线提取与临时分享',
      type: 'warning',
      defaultDir: '留空使用平台根目录，例如 /psou/search'
    },
    {
      key: 'manual',
      label: '手动转存',
      description: '分类资源人工触发转存',
      type: 'info',
      defaultDir: '留空使用平台根目录，例如 /psou/manual'
    }
  ]

  function emptyRouteConfig(route: AccountRouteKey): RouteFormConfig {
    return {
      transferDir: defaultTransferDirs[route],
      dailyTransferLimit: -1,
      dailyShareLimit: defaultDailyShareLimits[route]
    }
  }

  function emptyRouteConfigs(): Record<AccountRouteKey, RouteFormConfig> {
    return {
      fixed: emptyRouteConfig('fixed'),
      transfer: emptyRouteConfig('transfer'),
      search: emptyRouteConfig('search'),
      manual: emptyRouteConfig('manual')
    }
  }

  function configFromExt(ext?: AccountExt): Record<AccountRouteKey, RouteFormConfig> {
    const config = emptyRouteConfigs()
    routeSections.forEach(({ key }) => {
      const route = ext?.[key]
      config[key] = {
        transferDir: route?.transferDir || defaultTransferDirs[key],
        dailyTransferLimit: route?.dailyTransfer?.limit === undefined ? -1 : Number(route.dailyTransfer.limit),
        dailyShareLimit:
          route?.dailyShare?.limit === undefined ? defaultDailyShareLimits[key] : Number(route.dailyShare.limit)
      }
    })
    return config
  }

  const platformMeta = (platform: string): { label: string; type: TagType } => {
    const typeMap: Record<string, TagType> = { baidu: 'primary', quark: 'success' }
    return {
      label: platformLabels[platform] || platform || '未知',
      type: typeMap[platform] || 'info'
    }
  }

  const platformLogos: Record<string, string> = {
    baidu: 'https://gips3.baidu.com/it/u=1455301038,626612076&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f400_400',
    quark: 'https://img0.baidu.com/it/u=2193187888,1696047286&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500'
  }
  const platformInitial = (platform: string) => (platformLabels[platform] || platform || '账').slice(0, 1)
  const platformAvatarClass = (platform: string) => `is-${platformMeta(platform).type}`

  const storageUsagePercent = (row: Account) => {
    const total = Number(row.storageTotal) || 0
    if (total <= 0) return 0
    const used = Number(row.storageUsed) || 0
    return Math.min(100, Math.max(0, Math.round((used / total) * 100)))
  }

  const storageProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'var(--el-color-danger)'
    if (percentage >= 70) return 'var(--el-color-warning)'
    return 'var(--el-color-primary)'
  }

  const accountStatus = (status: AccountStatus): { label: string; type: TagType } => {
    const map: Record<AccountStatus, { label: string; type: TagType }> = {
      1: { label: '启用', type: 'success' },
      0: { label: '停用', type: 'info' },
      [-1]: { label: '失效', type: 'danger' }
    }
    return map[status] ?? { label: '未知', type: 'info' }
  }

  const formatCheckAge = (ts?: number) => {
    if (!ts) return '未检测'
    const seconds = Math.max(0, Math.floor(Date.now() / 1000 - Number(ts)))
    if (seconds < 60) return '刚刚检测'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前检测`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前检测`
    return `${Math.floor(seconds / 86400)} 天前检测`
  }

  const todayStats = (row: Account) => {
    let transfer = 0
    let share = 0
    routeSections.forEach(({ key }) => {
      const route = row.ext?.[key]
      transfer += Number(route?.dailyTransfer?.count) || 0
      share += Number(route?.dailyShare?.count) || 0
    })
    return { transfer, share, total: transfer + share }
  }

  const todayRingStyle = (row: Account) => {
    const { transfer, total } = todayStats(row)
    if (total <= 0) return { background: 'var(--el-fill-color)' }
    const percent = Math.round((transfer / total) * 100)
    return {
      background: `conic-gradient(rgb(var(--art-primary)) 0 ${percent}%, rgb(var(--art-success)) ${percent}% 100%)`
    }
  }

  const searchForm = ref<{
    keyword: string
    platform: string | undefined
    status: AccountStatus | undefined
    isVip: boolean | undefined
  }>({
    keyword: '',
    platform: undefined,
    status: undefined,
    isVip: undefined
  })
  const sortMode = ref<AccountSortMode>('priority')

  const sortOptions: Array<{ label: string; value: AccountSortMode }> = [
    { label: '优先级排序', value: 'priority' },
    { label: '存储占用从高到低', value: 'storageDesc' },
    { label: '存储占用从低到高', value: 'storageAsc' }
  ]

  const searchItems = computed(() => [
    {
      label: '账号搜索',
      key: 'keyword',
      type: 'input',
      props: {
        placeholder: '账号名称 / UID / 备注',
        clearable: true,
        maxlength: 128,
        onKeydown: (event: KeyboardEvent) => {
          if (event.key === 'Enter' && !event.isComposing) handleSearch()
        }
      }
    },
    {
      label: '平台类型',
      key: 'platform',
      type: 'select',
      props: {
        placeholder: '请选择平台类型',
        clearable: true,
        options: platformOptions
      }
    },
    {
      label: '是否启用',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '全部',
        clearable: true,
        options: statusOptions
      }
    },
    {
      label: '是否VIP',
      key: 'isVip',
      type: 'select',
      props: {
        placeholder: '全部',
        clearable: true,
        options: vipOptions
      }
    }
  ])

  const qrAppName = computed(() => (currentData.value.platform === 'quark' ? '夸克 App' : '百度 App'))

  const tokenPlaceholder = computed(() => {
    if (currentData.value.platform === 'baidu') return '粘贴百度网盘登录 Token'
    if (currentData.value.platform === 'quark') return '粘贴夸克网盘登录 Token'
    return '请输入平台登录 Token'
  })

  const useQRLogin = computed(() => supportsQRLogin(currentData.value.platform) && tokenMode.value === 'qr')

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
        return `请使用${qrAppName.value}扫码，二维码 3 分钟内有效。`
      case 'scanned':
        return '已扫码，请在手机上确认登录。'
      case 'confirmed':
        return '登录态已安全获取，点击“确定”保存到账号。'
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
    qrLoading.value ? '正在获取登录二维码…' : `点击下方按钮获取${qrAppName.value}登录二维码`
  )

  const validateLoginState = (_rule: unknown, _value: unknown, callback: (error?: Error) => void) => {
    const platform = String(currentData.value.platform || '')
    if (tokenMode.value === 'qr') {
      if (supportsQRLogin(platform) && !qrTicket.value) {
        callback(new Error(`请先扫码完成${platformLabels[platform] || '账号'}登录`))
        return
      }
      callback()
      return
    }
    if (dialogType.value === 'add' && !String(currentData.value.token || '').trim()) {
      callback(new Error('请输入账号 Token'))
      return
    }
    callback()
  }

  const validateUnzipDir = (_rule: unknown, _value: unknown, callback: (error?: Error) => void) => {
    const dir = String(currentData.value.ext?.unzipDir || '').trim()
    if (!dir) {
      callback()
      return
    }
    if (!dir.startsWith('/')) {
      callback(new Error('解压目录必须是绝对路径'))
      return
    }
    if (dir === '/' || dir.split('/').includes('..')) {
      callback(new Error('解压目录不能是根目录或包含上级路径'))
      return
    }
    callback()
  }

  const formItems = computed<FormItem[]>(() => [
    {
      key: 'platform',
      label: '平台类型',
      type: 'select',
      props: {
        placeholder: '请选择平台类型',
        options: platformOptions,
        disabled: dialogType.value === 'edit',
        onChange: (value: string) => handlePlatformChange(value),
        rules: [{ required: true, message: '请选择平台类型', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'name',
      label: '账号名称',
      type: 'input',
      tip: dialogType.value === 'add' ? '扫码或保存时自动获取平台昵称' : '账号名称由平台昵称自动维护',
      tipPosition: 'after',
      props: {
        placeholder: dialogType.value === 'add' ? '扫码或保存时自动获取平台昵称' : '账号名称由平台昵称自动维护',
        disabled: true,
        maxlength: 128
      }
    },
    {
      key: 'token',
      span: 24,
      label: '用户凭证',
      type: 'input',
      props: {
        rules: [
          {
            required: dialogType.value === 'add' || tokenMode.value === 'qr',
            validator: validateLoginState,
            trigger: ['blur', 'change']
          }
        ]
      }
    },
    {
      key: 'routes',
      span: 24,
      label: '转存通路',
      props: {}
    },
    {
      key: 'status',
      span: 24,
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
      key: 'ext.isUnzipAccount',
      label: '解压账号',
      type: 'switch',
      hidden: dialogType.value === 'add',
      tip: currentData.value.ext?.isVip ? '开启后可执行在线解压' : '仅 VIP 账号可开启',
      tipPosition: 'after',
      props: {
        activeText: '开启',
        inactiveText: '关闭',
        activeValue: true,
        inactiveValue: false,
        disabled: !currentData.value.ext?.isVip
      }
    },
    {
      key: 'ext.unzipDir',
      label: '解压目录',
      type: 'input',
      hidden: dialogType.value === 'add' || !currentData.value.ext?.isUnzipAccount,
      tip: '留空默认使用 /psou/unzip；代理解压的临时文件也放在此目录',
      tipPosition: 'after',
      props: {
        maxlength: 512,
        placeholder: '例如 /psou/unzip',
        rules: [{ validator: validateUnzipDir, trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'priority',
      label: '账号权重',
      type: 'number',
      tip: '数值越大越优先被选号',
      tipPosition: 'after',
      props: {
        precision: 0,
        controlsPosition: 'right',
        placeholder: '0'
      }
    },
    {
      key: 'remark',
      label: '账号备注',
      type: 'input',
      props: {
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
      const res = await GetAccountQRSession({ sessionId: qrSessionId.value })
      if (generation !== qrGeneration) return
      qrState.value = res.state
      if (res.state === 'confirmed') {
        qrTicket.value = res.qrTicket || ''
        stopQRPolling()
        if (qrTicket.value) {
          if (res.accountName) {
            currentData.value.name = res.accountName
          }
          ElMessage.success('扫码成功，提交后将更新账号登录态')
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
    const platform = String(currentData.value.platform || '')
    if (!supportsQRLogin(platform) || qrLoading.value) return
    resetQRState()
    if (dialogType.value === 'add') {
      currentData.value.name = ''
    }
    const generation = qrGeneration
    qrState.value = 'loading'
    qrLoading.value = true
    try {
      const res = await CreateAccountQRSession({ platform })
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

  const handleTokenModeChange = (value: string | number | boolean) => {
    if (value === 'manual') {
      resetQRState()
    }
  }

  const handlePlatformChange = (value: string) => {
    if (!dialogVisible.value || dialogType.value !== 'add') return
    resetQRState()
    tokenMode.value = supportsQRLogin(value) ? 'qr' : 'manual'
  }

  const handleCopyAccountId = async (record: Account) => {
    const accountId = String(record.id)
    try {
      if (!isClipboardSupported.value) throw new Error('clipboard unsupported')
      await copy(accountId)
      ElMessage.success('账号 ID 已复制')
    } catch {
      ElMessage.warning(`复制失败，请手动复制：${accountId}`)
    }
  }

  const operationItems = (row: Account) => {
    const checking = checkingAccountId.value === row.id
    const refreshing = refreshingAccountId.value === row.id
    const recovering = recoveringAccountId.value === row.id
    return [
      {
        icon: FolderOpened,
        label: '文件管理',
        color: 'primary',
        click: (record: Account) => openFileManager(record)
      },
      {
        icon: CircleCheck,
        label: checking ? '检测中...' : '登录检测',
        color: 'primary',
        disabled: checking,
        click: (record: Account) => handleCheck(record)
      },
      {
        icon: RefreshRight,
        label: refreshing ? '刷新中...' : '刷新容量',
        color: 'success',
        disabled: refreshing,
        click: (record: Account) => handleRefreshStorage(record)
      },
      {
        icon: CopyDocument,
        label: '复制账号 ID',
        color: 'primary',
        click: (record: Account) => handleCopyAccountId(record)
      },
      ...(row.ext?.limitedAt
        ? [
            {
              icon: Warning,
              label: recovering ? '恢复中...' : '恢复限流',
              color: 'warning',
              disabled: recovering,
              click: (record: Account) => handleRecover(record)
            }
          ]
        : []),
      {
        icon: Edit,
        label: '编辑账号',
        color: 'warning',
        click: (record: Account) => showDialog('edit', record)
      },
      {
        icon: Delete,
        popConfirm: true,
        label: '删除账号',
        color: 'danger',
        click: async (record: Account) => {
          await DeleteAccount({ accountId: record.id })
          ElMessage.success('删除成功')
          refreshRemove()
        }
      }
    ]
  }

  const {
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
      apiFn: ListAccount,
      apiParams: {
        page: 1,
        pageSize: 9,
        orderBy: 'priority',
        order: 'desc',
        ...searchForm.value
      }
    }
  })

  const accountList = computed(() => data.value as Account[])

  const openFileManager = (row: Account) => {
    fileManagerAccount.value = row
    fileManagerVisible.value = true
  }

  const handleSearch = () => {
    Object.assign(searchParams, {
      keyword: searchForm.value.keyword.trim() || undefined,
      platform: searchForm.value.platform || undefined,
      status: searchForm.value.status,
      isVip: searchForm.value.isVip
    })
    getData()
  }

  const handleSortModeChange = (value: AccountSortMode) => {
    sortMode.value = value
    searchParams.orderBy = value === 'priority' ? 'priority' : 'storageUsed'
    searchParams.order = value === 'storageAsc' ? 'asc' : 'desc'
    getData()
  }

  const showDialog = (type: Form.DialogType, row?: Account) => {
    resetQRState()
    dialogType.value = type
    currentData.value =
      type === 'add'
        ? {
            platform: 'baidu',
            name: '',
            userId: undefined,
            token: '',
            priority: 0,
            remark: '',
            config: emptyRouteConfigs(),
            ext: {}
          }
        : {
            ...(row as Account),
            token: '',
            config: configFromExt(row?.ext),
            ext: row?.ext || {}
          }
    tokenMode.value = type === 'add' && supportsQRLogin(currentData.value.platform) ? 'qr' : 'manual'
    dialogVisible.value = true
  }

  const buildConfigPayload = (): AccountConfig | undefined => {
    const original = configFromExt(dialogType.value === 'edit' ? currentData.value.ext : undefined)
    const payload: AccountConfig = {}
    routeSections.forEach(({ key }) => {
      const current = currentData.value.config[key]
      const normalized: Required<AccountRouteConfig> = {
        transferDir: current.transferDir.trim(),
        dailyTransferLimit: Math.max(-1, Math.trunc(Number(current.dailyTransferLimit) || 0)),
        dailyShareLimit: Math.max(-1, Math.trunc(Number(current.dailyShareLimit) || 0))
      }
      const hasValue =
        Boolean(normalized.transferDir) || normalized.dailyTransferLimit !== -1 || normalized.dailyShareLimit !== -1
      const changed =
        normalized.transferDir !== original[key].transferDir ||
        normalized.dailyTransferLimit !== original[key].dailyTransferLimit ||
        normalized.dailyShareLimit !== original[key].dailyShareLimit
      if ((dialogType.value === 'add' && hasValue) || (dialogType.value === 'edit' && changed)) {
        payload[key] = normalized
      }
    })
    return Object.keys(payload).length ? payload : undefined
  }

  const buildPayload = () => {
    const item = currentData.value
    const manualToken = tokenMode.value === 'manual'
    return {
      platform: String(item.platform || ''),
      name: String(item.name || '').trim(),
      token: manualToken ? String(item.token || '').trim() : '',
      qrTicket: manualToken ? '' : qrTicket.value,
      priority: Number(item.priority) || 0,
      remark: String(item.remark || '').trim(),
      config: buildConfigPayload()
    }
  }

  const handleSubmit = async () => {
    if (submitting.value) return
    submitting.value = true
    try {
      const payload = buildPayload()
      if (dialogType.value === 'add') {
        const data: CreateAccountRequest = {
          platform: payload.platform,
          name: payload.name,
          priority: payload.priority,
          remark: payload.remark,
          ...(payload.token ? { token: payload.token } : {}),
          ...(payload.qrTicket ? { qrTicket: payload.qrTicket } : {}),
          ...(payload.config ? { config: payload.config } : {})
        }
        await CreateAccount(data)
        ElMessage.success('创建成功')
        refreshCreate()
      } else {
        const data: UpdateAccountRequest = {
          accountId: Number(currentData.value.id),
          status: currentData.value.status ?? 1,
          priority: payload.priority,
          remark: payload.remark,
          isUnzipAccount: currentData.value.ext?.isVip ? Boolean(currentData.value.ext?.isUnzipAccount) : false,
          ...(currentData.value.ext?.isUnzipAccount
            ? { unzipDir: String(currentData.value.ext?.unzipDir || '').trim() }
            : {}),
          ...(payload.name ? { name: payload.name } : {}),
          ...(payload.token ? { token: payload.token } : {}),
          ...(payload.qrTicket ? { qrTicket: payload.qrTicket } : {}),
          ...(payload.config ? { config: payload.config } : {})
        }
        await UpdateAccount(data)
        ElMessage.success('修改成功')
        refreshUpdate()
      }
      dialogVisible.value = false
    } finally {
      submitting.value = false
    }
  }

  const handleCheck = async (row: Account) => {
    if (checkingAccountId.value !== null) return
    checkingAccountId.value = row.id
    try {
      await ProbeAccount({ accountId: row.id })
      ElMessage.success('检测完成')
      refreshData()
    } finally {
      checkingAccountId.value = null
    }
  }

  const handleStatusChange = async (row: Account, value: string | number | boolean) => {
    if (updatingAccountId.value !== null) return
    const status: AccountStatus = value ? 1 : 0
    if (row.status === status) return

    updatingAccountId.value = row.id
    try {
      await UpdateAccount({ accountId: row.id, status })
      ElMessage.success(status === 1 ? '账号已启用' : '账号已停用')
      refreshUpdate()
    } finally {
      updatingAccountId.value = null
    }
  }

  const handleRefreshStorage = async (row: Account) => {
    if (refreshingAccountId.value !== null) return
    refreshingAccountId.value = row.id
    try {
      await RefreshAccountStorage({ accountId: row.id })
      ElMessage.success('容量已刷新')
      refreshData()
    } finally {
      refreshingAccountId.value = null
    }
  }

  const handleRecover = async (row: Account) => {
    if (recoveringAccountId.value !== null) return
    recoveringAccountId.value = row.id
    try {
      await ProbeAndRecoverAccount({ accountId: row.id })
      ElMessage.success('账号已恢复')
      refreshData()
    } finally {
      recoveringAccountId.value = null
    }
  }

  watch(dialogVisible, (visible) => {
    if (!visible) resetQRState()
  })

  onBeforeUnmount(() => {
    resetQRState()
  })
</script>

<style scoped>
  :deep(.table) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .account-sort {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-left: 8px;
    color: var(--art-gray-700);
    cursor: pointer;
    background-color: rgba(var(--art-gray-200-rgb), 0.8);
    border: 0;
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
      color: var(--art-gray-800);
      background-color: rgba(var(--art-gray-300-rgb), 0.75);
    }

    &.is-active {
      color: var(--el-color-primary);

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .account-card-scroll {
    flex: 1;
    min-height: 0;
    padding-right: 4px;
    margin-top: 12px;
    overflow-y: auto;
  }

  .account-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
    align-items: stretch;
  }

  .account-card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-width: 260px;
    padding: 14px;
    background: var(--art-main-bg-color);
    border: 1px solid var(--art-border-color);
    border-radius: 8px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .account-card:hover {
    border-color: rgba(var(--art-primary), 0.45);
    box-shadow: var(--art-root-card-box-shadow);
  }

  .account-card__header {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) 32px;
    gap: 10px;
    align-items: flex-start;
  }

  .account-card.has-vip .account-card__header {
    padding-top: 10px;
  }

  .account-card__vip {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border-radius: 0 7px 0 8px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .account-card__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    overflow: hidden;
    font-size: 16px;
    font-weight: 700;
    color: rgb(var(--art-primary));
    background: rgb(var(--art-bg-primary));
    border-radius: 10px;
    box-shadow: var(--el-box-shadow-lighter);
  }

  .account-card__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }

  .account-card__avatar.is-success {
    color: rgb(var(--art-success));
    background: rgb(var(--art-bg-success));
  }

  .account-card__avatar.is-warning {
    color: rgb(var(--art-warning));
    background: rgb(var(--art-bg-warning));
  }

  .account-card__avatar.is-danger {
    color: rgb(var(--art-error));
    background: rgb(var(--art-bg-error));
  }

  .account-card__identity {
    min-width: 0;
  }

  .account-card__name-line {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .account-card__name-line h2 {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    font-size: 15px;
    font-weight: 700;
    line-height: 22px;
    color: var(--art-gray-900);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-card__identity p {
    margin: 3px 0 0;
    overflow: hidden;
    font-size: 12px;
    line-height: 19px;
    color: var(--art-gray-600);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-card__more {
    --el-button-border-color: transparent;
    --el-button-bg-color: transparent;
    --el-button-hover-border-color: transparent;
    --el-button-hover-bg-color: rgba(var(--art-gray-200-rgb), 0.72);
    --el-button-active-border-color: transparent;
    --el-button-active-bg-color: rgba(var(--art-gray-200-rgb), 0.72);

    width: 32px !important;
    height: 32px !important;
    color: var(--art-gray-500);
    border-color: transparent !important;
    border-radius: 6px;
    box-shadow: none !important;
  }

  .account-card__more:hover,
  .account-card__more:focus,
  .account-card__more:active {
    color: var(--art-gray-500);
    background: rgba(var(--art-gray-200-rgb), 0.72) !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  .status-cell {
    display: flex;
    flex-wrap: nowrap;
    gap: 6px;
    min-width: 0;
    overflow: hidden;
  }

  .account-card__storage,
  .account-card__routes {
    padding-top: 10px;
    margin-top: 10px;
    border-top: 1px solid var(--art-border-color);
  }

  .account-card__routes {
    padding-bottom: 12px;
  }

  .account-card__section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 12px;
    line-height: 18px;
    color: var(--art-gray-500);
  }

  .account-card__section-title b {
    font-size: 12px;
    font-weight: 600;
    color: var(--art-gray-700);
  }

  .account-card__storage :deep(.el-progress-bar__outer) {
    background: rgba(var(--art-gray-200-rgb), 0.72);
  }

  .account-card__storage-detail {
    margin-top: 4px;
    overflow: hidden;
    font-size: 12px;
    line-height: 18px;
    color: var(--art-gray-600);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .today-ops {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .today-ops__ring {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 58px;
    border-radius: 50%;
  }

  .today-ops__ring::after {
    position: absolute;
    inset: 7px;
    content: '';
    background: var(--art-main-bg-color);
    border-radius: 50%;
  }

  .today-ops__ring span {
    position: relative;
    z-index: 1;
    font-size: 13px;
    font-weight: 700;
    color: var(--art-gray-800);
  }

  .today-ops__legend {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .today-ops__item {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    line-height: 18px;
  }

  .today-ops__label {
    color: var(--art-gray-500);
  }

  .today-ops__item b {
    margin-left: auto;
    font-weight: 600;
    color: var(--art-gray-800);
  }

  .today-ops__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .today-ops__dot.is-transfer {
    background: rgb(var(--art-primary));
  }

  .today-ops__dot.is-share {
    background: rgb(var(--art-success));
  }

  .account-card__footer {
    display: flex;
    gap: 12px;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
    margin-top: auto;
    font-size: 12px;
    line-height: 18px;
    color: var(--art-gray-500);
    border-top: 1px solid var(--art-border-color);
  }

  .account-card__footer-status {
    display: flex;
    flex-shrink: 1;
    flex-wrap: nowrap;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .account-card__check {
    flex-shrink: 0;
    font-size: 11px;
    color: var(--art-gray-500);
    white-space: nowrap;
  }

  .account-card__enable {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
  }

  .account-pagination {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    margin-top: 16px;
  }

  @media (width <= 768px) {
    .account-sort {
      margin-left: 0;
    }

    .account-grid {
      grid-template-columns: 1fr;
    }

    .account-card {
      padding: 14px;
    }

    .account-pagination {
      justify-content: flex-start;
      overflow-x: auto;
    }
  }

  .login-state {
    width: 100%;
  }

  .login-mode {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
  }

  .login-mode-tip,
  .login-manual-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .login-manual-tip {
    margin-top: 6px;
    line-height: 1.5;
  }

  .route-configs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 12px;
    width: 100%;
  }

  .route-config-wrap {
    width: 100%;
  }

  .route-card {
    padding: 14px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
  }

  .route-card-head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .route-card-head b {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .route-description {
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
    text-align: right;
  }

  .route-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .route-field > span {
    font-size: 12px;
    color: var(--el-text-color-regular);
  }

  .route-field :deep(.el-input-number) {
    width: 100%;
  }

  .route-limit-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
  }

  .route-tip {
    padding: 10px 0 4px;
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
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
