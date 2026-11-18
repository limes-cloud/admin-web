<template>
  <div class="run-detail art-full-height">
    <div class="rdt-head">
      <div class="rdt-title">
        <ElButton text :icon="ArrowLeft" @click="goBack" />
        <span class="rdt-rid">运行 {{ rid }}</span>
        <ElTag v-if="run" :type="RUN_STATUS[run.status]?.type">{{ RUN_STATUS[run.status]?.label || run.status }}</ElTag>
        <span v-if="chainName" class="rdt-meta">{{ chainName }}</span>
        <span v-if="waitingCount" class="rdt-meta is-warn">{{ waitingCount }} 个节点待触发</span>
        <span v-if="polling" class="rdt-meta">自动刷新 {{ pollSeconds }}s</span>
      </div>
      <div class="rdt-actions">
        <ElButton :icon="Refresh" :loading="refreshing" @click="refresh(true)">刷新</ElButton>
        <ElButton v-permission="'cron:chain_run:context-query'" :icon="Document" @click="openContext">上下文</ElButton>
        <ElButton
          v-if="run && (run.status === 'running' || run.status === 'suspended')"
          v-permission="'cron:chain_run:abandon'"
          type="danger"
          :icon="CircleClose"
          @click="abandon"
        >
          作废
        </ElButton>
      </div>
    </div>
    <ElAlert
      v-if="run?.errorCode || run?.errorMsg"
      type="error"
      :closable="false"
      show-icon
      :title="`${run?.errorCode || ''} ${run?.errorMsg || ''}`"
      class="rdt-alert"
    />

    <div v-if="editingLoopId" class="rdt-crumb">
      <ElButton text size="small" :icon="ArrowLeft" @click="exitLoop()">返回主链</ElButton>
      <ElTag size="small" type="info">循环体</ElTag>
      <span class="rdt-crumb__tip">当前查看循环体子图运行状态</span>
    </div>

    <div v-loading="!rule && loading" class="rdt-canvas">
      <ChainCanvas
        v-if="rule"
        :rule="activeRule!"
        :overlay="overlay"
        :plugins="plugins"
        readonly
        @node-click="onNodeClick"
        @status-click="openNode"
      />
      <ElEmpty v-else-if="!loading" description="未获取到运行规则" />
    </div>

    <NodeRunDrawer
      v-model="nodeVisible"
      :rid="rid"
      :nid="activeNid"
      :node-name="activeNode?.name"
      :node-type="activeIsStart ? 'start' : ''"
      :run-input="runInput"
      :can-trigger="canTrigger(activeNid)"
      @trigger="openTrigger(activeNid)"
    />
    <TriggerDialog
      v-model="triggerVisible"
      :rid="rid"
      :nid="triggerNid"
      :node-name="triggerNode?.name"
      :body-rule="triggerNode?.body"
      @done="afterAction"
    />
    <ElDrawer v-model="contextVisible" title="运行上下文" size="560px">
      <div v-loading="contextLoading">
        <ElTree
          v-if="contextTree.length"
          :data="contextTree"
          :props="{ label: 'label', children: 'children' }"
          default-expand-all
        />
        <ElEmpty v-else-if="!contextLoading" description="无上下文" />
      </div>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ArrowLeft, CircleClose, Document, Refresh } from '@element-plus/icons-vue'
  import { AbandonChainRun, GetChain, GetChainRun, GetChainRunContext, GetChainRunGraph } from '@/api/cron/chain/api'
  import type { ChainRunGraphRun } from '@/api/cron/chain/type'
  import { useMenuStore } from '@/store/modules/menu'
  import ChainCanvas from './components/graph/ChainCanvas.vue'
  import { parseRule } from './components/graph/flow-convert'
  import { fillMissingPositions } from './components/graph/layout'
  import NodeRunDrawer from './components/NodeRunDrawer.vue'
  import TriggerDialog from './components/TriggerDialog.vue'
  import type { Rule } from './types/dsl'
  import type { RunNodeOverlay, PluginBrief } from './types/graph'
  import { POLL_EXECUTING_MS, POLL_WAITING_MS, RUN_STATUS, RUN_TERMINAL } from './utils/constants'
  import { toNum } from './utils/format'
  import { pluginBriefsFor } from './utils/options'

  defineOptions({ name: 'CronChainRunDetail' })

  const route = useRoute()
  const router = useRouter()
  const menuStore = useMenuStore()
  const rid = String(route.query.rid || '')

  /** 返回列表：从批量执行进入时回到批次详情，否则回调度日志 */
  const backTarget = computed(() => {
    if (route.query.from === 'batch') {
      const batchId = String(route.query.batchId || '')
      return { path: '/cron/chain/batch', query: batchId ? { batchId } : undefined }
    }
    return { path: '/cron/chain/run' }
  })

  function goBack() {
    router.push(backTarget.value)
  }

  const loading = ref(false)
  const refreshing = ref(false)
  const run = ref<ChainRunGraphRun>()
  const rule = ref<Rule>()
  const overlay = ref<Record<string, RunNodeOverlay>>({})
  const chainName = ref('')
  const plugins = ref<PluginBrief[]>([])
  const waitingCount = computed(
    () => Object.values(overlay.value).filter((o) => o.status === 'running' && o.trigger?.status === 'waiting').length
  )

  // ---------- 轮询 ----------

  let timer: ReturnType<typeof setTimeout> | null = null
  /** 下次请求是否带规则（首次与恢复后） */
  let needRule = true
  let disposed = false
  const pollSeconds = ref(0)
  const polling = computed(() => pollSeconds.value > 0)

  /** 轮询间隔：executing 2s，运行中无执行 10s；挂起与终态停止 */
  function nextInterval(): number {
    const r = run.value
    if (!r || r.status !== 'running') return 0
    return r.executing ? POLL_EXECUTING_MS : POLL_WAITING_MS
  }

  function schedule() {
    if (timer) clearTimeout(timer)
    timer = null
    const ms = disposed ? 0 : nextInterval()
    pollSeconds.value = ms / 1000
    if (!ms) return
    timer = setTimeout(() => {
      // 页面不可见时暂停，回到可见时由 visibilitychange 触发刷新
      if (document.hidden) {
        timer = null
        return
      }
      refresh()
    }, ms)
  }

  async function refresh(manual = false) {
    if (!rid) return
    if (manual) refreshing.value = true
    try {
      const withRule = needRule
      const res = await GetChainRunGraph({ id: rid, withRule: withRule || undefined }, manual || withRule)
      run.value = res.run
      if (withRule && res.rule) {
        const r = parseRule(res.rule)
        fillMissingPositions(r)
        rule.value = r
        needRule = false
        if (!plugins.value.length) pluginBriefsFor(r).then((t) => (plugins.value = t))
      }
      const map: Record<string, RunNodeOverlay> = {}
      for (const n of res.nodes || []) {
        map[n.nid] = { status: n.status, error: n.error, costMs: n.costMs }
      }
      for (const t of res.triggers || []) {
        const o = map[t.nid] || (map[t.nid] = { status: 'running' })
        o.trigger = {
          status: t.status,
          startedAt: toNum(t.startedAt),
          deadlineAt: toNum(t.deadlineAt),
          triggeredAt: toNum(t.triggeredAt)
        }
      }
      overlay.value = map
    } catch {
      // 轮询失败不打断，下一轮继续
    } finally {
      refreshing.value = false
      schedule()
    }
  }

  function onVisibility() {
    if (!document.hidden && !timer && nextInterval()) refresh()
  }

  // ---------- 节点详情 / 手动触发 ----------

  const nodeVisible = ref(false)
  const activeNid = ref('')
  const activeNode = computed(() => rule.value?.nodes.find((n) => n.id === activeNid.value))
  const activeIsStart = ref(false)
  const runInput = ref<any>()

  /** 当前查看的循环体 id；null = 主链（运行详情只读子图视图） */
  const editingLoopId = ref<string | null>(null)

  /** 当前查看的规则视图（主链或循环体子图） */
  const activeRule = computed<Rule | undefined>(() => {
    const r = rule.value
    if (!r) return undefined
    if (editingLoopId.value) {
      const n = r.nodes.find((x) => x.id === editingLoopId.value)
      if (n?.loop?.body) {
        return { ...r, nodes: n.loop.body.nodes, edges: n.loop.body.edges }
      }
    }
    return r
  })

  /** 节点点击：循环节点进入子图视图，其余打开节点详情 */
  function onNodeClick(id: string) {
    const scope = activeRule.value
    const n = scope?.nodes.find((x) => x.id === id)
    if (n?.type === 'loop' && n.loop?.body) {
      editingLoopId.value = id
      return
    }
    openNode(id)
  }

  function exitLoop() {
    editingLoopId.value = null
  }

  async function openNode(id: string) {
    activeNid.value = id
    nodeVisible.value = true
    const n = activeRule.value?.nodes.find((x) => x.id === id)
    activeIsStart.value = n?.type === 'start' && !editingLoopId.value
    if (!activeIsStart.value) {
      runInput.value = undefined
      return
    }
    runInput.value = undefined
    try {
      runInput.value = (await GetChainRun({ id: rid }))?.input
    } catch {
      // 入参读取失败不影响查看节点其他信息
    }
  }

  /** 被动节点待触发、运行未终结时可手动触发 */
  function canTrigger(nid: string): boolean {
    const o = overlay.value[nid]
    if (!o || !run.value || RUN_TERMINAL.includes(run.value.status)) return false
    return o.status === 'running' && o.trigger?.status === 'waiting'
  }

  const triggerVisible = ref(false)
  const triggerNid = ref('')
  const triggerNode = computed(() => rule.value?.nodes.find((n) => n.id === triggerNid.value))

  function openTrigger(nid: string) {
    triggerNid.value = nid
    nodeVisible.value = false
    triggerVisible.value = true
  }

  function afterAction() {
    refresh()
  }

  // ---------- 作废 ----------

  async function abandon() {
    try {
      await ElMessageBox.confirm(
        '作废不可撤销：待触发的被动节点一并取消，外部再触发会被拒绝。需要重来请重新发起运行。确认作废？',
        '作废运行',
        { type: 'warning', confirmButtonText: '作废', confirmButtonClass: 'el-button--danger' }
      )
    } catch {
      return
    }
    await AbandonChainRun({ id: rid })
    ElMessage.success('已作废')
    refresh(true)
  }

  // ---------- 上下文 ----------

  interface TreeNode {
    label: string
    children?: TreeNode[]
  }

  const contextVisible = ref(false)
  const contextLoading = ref(false)
  const contextTree = ref<TreeNode[]>([])

  /** JSON 转树：叶子显示 key: value */
  function toTree(v: any, key = ''): TreeNode {
    if (v && typeof v === 'object') {
      const entries = Array.isArray(v) ? v.map((x, i) => [String(i), x]) : Object.entries(v)
      const tag = Array.isArray(v) ? `[${v.length}]` : `{${entries.length}}`
      return { label: key ? `${key} ${tag}` : tag, children: entries.map(([k, x]) => toTree(x, k)) }
    }
    const text = typeof v === 'string' ? JSON.stringify(v) : String(v)
    return { label: key ? `${key}: ${text}` : text }
  }

  async function openContext() {
    contextVisible.value = true
    contextLoading.value = true
    try {
      const res = await GetChainRunContext({ id: rid })
      const ctx = res?.context
      contextTree.value =
        ctx && typeof ctx === 'object' ? Object.entries(ctx).map(([k, v]) => toTree(v, k)) : ctx ? [toTree(ctx)] : []
    } finally {
      contextLoading.value = false
    }
  }

  // ---------- 生命周期 ----------

  onMounted(async () => {
    if (!rid) {
      router.replace(backTarget.value)
      return
    }
    document.addEventListener('visibilitychange', onVisibility)
    loading.value = true
    await refresh()
    loading.value = false
    if (run.value?.chainId && menuStore.hasPermission('cron:chain:query')) {
      GetChain({ id: run.value.chainId })
        .then((r) => (chainName.value = r.chain?.name || ''))
        .catch(() => undefined)
    }
  })

  onBeforeUnmount(() => {
    disposed = true
    if (timer) clearTimeout(timer)
    document.removeEventListener('visibilitychange', onVisibility)
  })
</script>

<style scoped lang="scss">
  .run-detail {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
  }

  .rdt-head {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .rdt-title {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .rdt-rid {
    font-family: Menlo, Monaco, Consolas, monospace;
    font-weight: 500;
  }

  .rdt-meta {
    font-size: 12px;
    color: var(--el-text-color-secondary);

    &.is-warn {
      color: var(--el-color-warning);
    }
  }

  .rdt-actions {
    display: flex;
    gap: 8px;

    .el-button + .el-button {
      margin-left: 0;
    }
  }

  .rdt-alert {
    margin: 8px 12px 0;
  }

  .rdt-canvas {
    flex: 1;
    min-height: 0;
  }

  .rdt-tip {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .rdt-error {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-color-danger);
  }

  .mono :deep(textarea) {
    font-family: Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
  }
</style>

<style scoped lang="scss">
  .rdt-crumb {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 6px 16px;
    background: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color-lighter);

    &__tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
