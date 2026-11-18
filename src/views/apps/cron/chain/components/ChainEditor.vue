<template>
  <div class="chain-edit">
    <header class="ce-header">
      <ElButton text circle :icon="ArrowLeft" @click="requestClose" />
      <span class="ce-logo"
        ><ElIcon><Share /></ElIcon
      ></span>
      <div class="ce-title">
        <div class="ce-title__name">
          <span>{{ chain?.name || '流程调度' }}</span>
          <span class="ce-title__keyword">{{ chain?.keyword }}</span>
        </div>
        <div class="ce-title__meta">
          <span v-if="baseVersionNo" class="ce-pill">基于 v{{ baseVersionNo }}</span>
          <span v-if="store.dirty" class="ce-pill is-warn">未保存</span>
          <span v-if="store.draftSavedAt" class="ce-pill">草稿已暂存 {{ draftTime }}</span>
        </div>
      </div>
      <div class="ce-header__actions">
        <ElTooltip content="撤销（Ctrl+Z）">
          <ElButton text circle :icon="RefreshLeft" :disabled="!store.canUndo" @click="store.undo" />
        </ElTooltip>
        <ElTooltip content="重做（Ctrl+Shift+Z）">
          <ElButton text circle :icon="RefreshRight" :disabled="!store.canRedo" @click="store.redo" />
        </ElTooltip>
        <ElTooltip content="链设置">
          <ElButton text circle :icon="Setting" @click="openSettings" />
        </ElTooltip>
        <ElTooltip content="版本记录">
          <ElButton text circle :icon="Clock" :disabled="!chain" @click="openVersions" />
        </ElTooltip>
        <ElTooltip :disabled="!store.hasError" content="存在错误，修复后才能保存">
          <span>
            <ElButton
              v-permission="'cron:chain_version:add'"
              type="primary"
              class="ce-save"
              :disabled="store.hasError"
              @click="openSave"
            >
              保存版本
            </ElButton>
          </span>
        </ElTooltip>
      </div>
    </header>

    <div v-if="store.editingLoopId" class="ce-crumb">
      <ElButton text size="small" :icon="ArrowLeft" @click="store.exitLoop()">返回主链</ElButton>
      <ElTag size="small" type="info">循环体</ElTag>
      <span class="ce-crumb__tip">已进入循环体子图编辑（拖节点、连线、配置与主画布一致）</span>
    </div>

    <div v-loading="loading" class="ce-body">
      <ChainCanvas
        v-if="ready"
        ref="canvasRef"
        :rule="store.activeRule"
        :issues="store.issues"
        :warn-nodes="store.warnNodes"
        :plugins="store.plugins"
        :controls="false"
        :minimap="minimapOn"
        :overlay="liveOverlay"
        @status-click="openLiveNode"
        fit
        @select="onSelect"
        @drop="onDrop"
        @connect="onConnect"
        @move="store.moveNodes"
        @remove="onRemove"
        @quick-add="openQuickAdd"
      />

      <!-- 属性面板：选中节点 / 连线或打开链设置时浮在画布右侧 -->
      <aside v-if="panelVisible" class="ce-panel">
        <div class="ce-panel__head">
          <span class="ce-panel__title">{{ panelTitle }}</span>
          <ElTooltip v-if="testable" content="测试节点">
            <ElButton text circle :icon="CaretRight" @click="testVisible = true" />
          </ElTooltip>
          <ElTooltip v-if="store.selectedNode && !isTerminal(store.selectedNode)" content="复制节点">
            <ElButton text circle :icon="CopyDocument" @click="store.duplicateNode(store.selectedNode.id)" />
          </ElTooltip>
          <ElTooltip v-if="canRemove" content="删除">
            <ElButton text circle :icon="Delete" @click="removeSelected" />
          </ElTooltip>
          <ElButton text circle :icon="Close" @click="closePanel" />
        </div>
        <ElScrollbar class="ce-panel__body">
          <TerminalPanel
            v-if="isTerminal(store.selectedNode)"
            :key="`t-${store.selectedNode!.id}`"
            :issues="selectionIssues"
            :candidates="candidates"
          />
          <SelectorPanel
            v-else-if="store.selectedNode?.type === 'selector'"
            :key="`s-${store.selectedNode.id}`"
            :issues="selectionIssues"
            :candidates="candidates"
          />
          <LoopPanel
            v-else-if="store.selectedNode?.type === 'loop'"
            :key="`l-${store.selectedNode.id}`"
            :issues="selectionIssues"
            :candidates="candidates"
          />
          <NodePanel
            v-else-if="store.selectedNode"
            :key="`n-${store.selectedNode.id}`"
            :issues="selectionIssues"
            :candidates="candidates"
            :is-warn="store.warnNodes.includes(store.selectedNode.id)"
            @rename="store.renameNode"
          />
          <EdgePanel v-else-if="store.selectedEdge" :key="`e-${store.selectedEdge.id}`" />
        </ElScrollbar>
      </aside>

      <NodeTestDialog v-model="testVisible" :node="testable ? store.selectedNode : undefined" />

      <!-- 快速添加：点击输出端口或拖线到空白处时弹出，选中的节点自动连到该端口 -->
      <div v-if="quick" ref="quickRef" class="ce-quick" :style="quickStyle">
        <NodePalette :plugins="store.plugins" @pick="onQuickPick" />
      </div>

      <!-- 问题列表：从底部工具栏打开 -->
      <!-- 试运行实时回显状态条 -->
      <div v-if="liveRid" class="ce-live">
        <ElIcon v-if="!liveRun || liveRun.status === 'running'" class="is-loading"><Loading /></ElIcon>
        <ElTag v-if="liveRun" :type="RUN_STATUS[liveRun.status]?.type" size="small">
          {{ RUN_STATUS[liveRun.status]?.label || liveRun.status }}
        </ElTag>
        <span class="ce-live__text">测试执行 {{ liveRid.slice(0, 8) }}</span>
        <span v-if="liveRun?.errorMsg" class="ce-live__error" :title="liveRun.errorMsg">{{ liveRun.errorMsg }}</span>
        <ElPopover v-if="liveOutput !== undefined" trigger="click" placement="bottom" :width="420">
          <template #reference>
            <ElButton link type="primary">结果</ElButton>
          </template>
          <pre class="ce-live__output">{{ pretty(liveOutput) || 'null' }}</pre>
        </ElPopover>
        <ElButton link @click="clearLive">退出</ElButton>
      </div>

      <div v-if="issuesOpen" class="ce-issues">
        <IssueBar :issues="store.issues" :nodes="store.rule.nodes" :validating="store.validating" @locate="locate" />
      </div>

      <!-- 底部浮动工具栏（参考 Coze） -->
      <div v-if="ready" class="ce-dock">
        <div class="ce-dock__group">
          <ElDropdown trigger="click" @command="onZoom">
            <span class="ce-zoom"
              >{{ zoomText }}<ElIcon><ArrowDown /></ElIcon
            ></span>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="in">放大</ElDropdownItem>
                <ElDropdownItem command="out">缩小</ElDropdownItem>
                <ElDropdownItem v-for="z in ZOOM_LEVELS" :key="z" :command="z">{{ z * 100 }}%</ElDropdownItem>
                <ElDropdownItem command="fit" divided>适应画布</ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
          <ElTooltip content="小地图">
            <ElButton text :class="{ 'is-on': minimapOn }" :icon="MapLocation" @click="minimapOn = !minimapOn" />
          </ElTooltip>
          <ElTooltip content="自动布局">
            <ElButton text :icon="Operation" :disabled="!store.activeNodes.length" @click="store.autoLayout" />
          </ElTooltip>
          <ElTooltip content="问题列表">
            <ElBadge
              :value="errorCount || warnCount"
              :hidden="!errorCount && !warnCount"
              :type="errorCount ? 'danger' : 'warning'"
              class="ce-dock__badge"
            >
              <ElButton text :class="{ 'is-on': issuesOpen }" @click="issuesOpen = !issuesOpen">
                <ElIcon :class="errorCount ? 'is-danger' : warnCount ? 'is-warn' : 'is-ok'">
                  <CircleCloseFilled v-if="errorCount" />
                  <WarningFilled v-else-if="warnCount" />
                  <CircleCheckFilled v-else />
                </ElIcon>
              </ElButton>
            </ElBadge>
          </ElTooltip>
          <ElPopover v-model:visible="paletteOpen" trigger="click" placement="top" :width="452" :offset="14">
            <template #reference>
              <span class="ce-dock__ref">
                <ElTooltip content="添加节点" :disabled="paletteOpen">
                  <ElButton class="ce-add" :icon="Plus" />
                </ElTooltip>
              </span>
            </template>
            <NodePalette :plugins="store.plugins" @pick="onPick" />
          </ElPopover>
        </div>
        <div class="ce-dock__group">
          <ElTooltip content="测试执行">
            <ElButton
              v-permission="'cron:chain:debug-run'"
              type="success"
              class="ce-run"
              :icon="VideoPlay"
              :disabled="!chain"
              @click="openDebug"
            />
          </ElTooltip>
        </div>
      </div>
    </div>

    <ElDialog v-model="saveVisible" title="保存版本" width="460px" :close-on-click-modal="false">
      <ElForm label-position="top">
        <ElFormItem label="备注">
          <ElInput
            v-model="saveForm.remark"
            type="textarea"
            :rows="3"
            maxlength="255"
            show-word-limit
            placeholder="本次修改说明"
          />
        </ElFormItem>
        <ElFormItem v-permission="'cron:chain_version:switch'">
          <ElCheckbox v-model="saveForm.publish">保存并发布（设为生效版本）</ElCheckbox>
        </ElFormItem>
      </ElForm>
      <div v-if="warnCount" class="ce-save-tip">存在 {{ warnCount }} 条警告，不影响保存。</div>
      <template #footer>
        <ElButton @click="saveVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="save">保存</ElButton>
      </template>
    </ElDialog>

    <NodeRunDrawer
      v-if="liveRid"
      v-model="liveNodeVisible"
      :rid="liveRid"
      :nid="liveNid"
      :node-name="store.activeNodes.find((n) => n.id === liveNid)?.name"
    />

    <DebugRunDialog
      v-if="chain"
      v-model="debugVisible"
      :keyword="chain.keyword"
      :body-rule="startRequest?.body"
      :get-rule="store.exportRule"
      live
      @started="startLive"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  import { onClickOutside } from '@vueuse/core'
  import { onBeforeRouteLeave, useRouter } from 'vue-router'
  import {
    ArrowDown,
    ArrowLeft,
    CaretRight,
    CircleCheckFilled,
    CircleCloseFilled,
    Clock,
    Close,
    CopyDocument,
    Delete,
    Loading,
    MapLocation,
    Operation,
    Plus,
    RefreshLeft,
    RefreshRight,
    Setting,
    Share,
    VideoPlay,
    WarningFilled
  } from '@element-plus/icons-vue'
  import { CreateChainVersion, GetChain, GetChainVersion, ListChainVersion } from '@/api/cron/chain/api'
  import type { ChainInfo } from '@/api/cron/chain/type'
  import { useMenuStore } from '@/store/modules/menu'
  import { useChainEditorStore } from '@/store/modules/chain-editor'
  import ChainCanvas from './graph/ChainCanvas.vue'
  import { isTerminal, parseRule } from './graph/flow-convert'
  import { variableCandidates } from './graph/graph-utils'
  import { freePosition } from './graph/layout'
  import NodePalette from './NodePalette.vue'
  import IssueBar from './IssueBar.vue'
  import { useLiveRun } from './use-live-run'
  import NodeRunDrawer from './NodeRunDrawer.vue'
  import NodeTestDialog from './NodeTestDialog.vue'
  import DebugRunDialog from './DebugRunDialog.vue'
  import NodePanel from './panel/NodePanel.vue'
  import EdgePanel from './panel/EdgePanel.vue'
  import LoopPanel from './panel/LoopPanel.vue'
  import TerminalPanel from './panel/TerminalPanel.vue'
  import SelectorPanel from './panel/SelectorPanel.vue'
  import type { Rule, UIPosition } from '../types/dsl'
  import type { EditorSelection, NodeLink, PaletteDrop, QuickAddRequest, VariableScope } from '../types/graph'
  import type { Issue } from '../types/issue'
  import { MAX_NODES, RUN_STATUS } from '../utils/constants'
  import { pretty } from '../utils/format'
  import { parseTime } from '@/utils/time'

  // 链编辑器：编辑页与全屏编辑弹窗共用；chainId / versionId 由外部传入，关闭由外部处理
  defineOptions({ name: 'ChainEditor' })

  const props = defineProps<{
    chainId: number
    /** 以指定版本为底编辑；不传 = 当前生效版本，没有则取最新保存版本 */
    versionId?: number
  }>()

  const emit = defineEmits<{
    /** 请求关闭（未保存修改已确认放弃） */
    close: []
    /** 保存了新版本 */
    saved: []
  }>()

  const router = useRouter()
  const store = useChainEditorStore()
  const menuStore = useMenuStore()

  const canvasRef = ref<InstanceType<typeof ChainCanvas>>()
  const loading = ref(false)
  const ready = ref(false)
  const chain = ref<ChainInfo>()
  /** 当前编辑基于的版本号（展示用） */
  const baseVersionNo = ref(0)

  /** 工具栏缩放档位 */
  const ZOOM_LEVELS = [0.5, 0.75, 1, 1.5, 2]

  /** 链设置面板（未选中任何对象时打开） */
  const settingsOpen = ref(false)
  const issuesOpen = ref(false)
  const paletteOpen = ref(false)
  const minimapOn = ref(false)

  const panelVisible = computed(() => !!store.selection || settingsOpen.value)

  const zoomText = computed(() => `${Math.round((canvasRef.value?.zoom ?? 1) * 100)}%`)

  const errorCount = computed(() => store.issues.filter((i) => i.level === 'error').length)

  const draftTime = computed(() => (store.draftSavedAt ? parseTime(store.draftSavedAt, '{h}:{i}:{s}') : ''))

  /** 开始节点的入参规则（试运行入参模板） */
  const startRequest = computed(() => store.rule.nodes.find((n) => n.type === 'start')?.request)

  /** 单节点测试：只有任务节点（api / script / 插件）可以单独执行 */
  const testVisible = ref(false)
  const testable = computed(() => {
    const n = store.selectedNode
    return !!n && !isTerminal(n) && n.type !== 'selector'
  })

  /** 开始 / 结束节点不能删除 */
  const canRemove = computed(() => !!store.selection && !isTerminal(store.selectedNode))

  const panelTitle = computed(() => {
    const n = store.selectedNode
    if (n?.type === 'start') return '开始'
    if (n?.type === 'end') return '结束'
    if (n?.type === 'selector') return '分支器'
    if (n) return '节点属性'
    if (store.selectedEdge) return '连线属性'
    return '链设置'
  })

  // ---------- 问题与变量补全 ----------

  const selectionIssues = computed<Issue[]>(() => {
    const s = store.selection
    if (!s) return []
    return store.issues.filter((i) => i.target === s.kind && i.id === s.id)
  })

  const warnCount = computed(() => store.issues.filter((i) => i.level === 'warning').length)

  const candidates = computed(() => {
    const s = store.selection
    let scope: VariableScope = { kind: 'none' }
    if (s?.kind === 'node')
      scope = store.selectedNode?.type === 'end' ? { kind: 'response' } : { kind: 'task', nodeId: s.id }
    return variableCandidates(store.rule, scope, store.specOf)
  })

  /** 画布选中：选中对象时关闭链设置，点空白处关闭面板 */
  function onSelect(s: EditorSelection) {
    settingsOpen.value = false
    store.select(s)
  }

  function openSettings() {
    store.select(null)
    settingsOpen.value = true
  }

  function closePanel() {
    store.select(null)
    settingsOpen.value = false
  }

  /** 去版本页：先确认未保存修改，再关闭编辑器（弹窗模式下弹窗不能留在版本页上） */
  async function openVersions() {
    if (!chain.value || !(await confirmLeave())) return
    leaving = true
    const id = chain.value.id
    emit('close')
    router.push({ path: '/cron/chain/version', query: { id } })
  }

  function onZoom(cmd: string | number) {
    const c = canvasRef.value
    if (!c) return
    if (cmd === 'in') c.zoomIn()
    else if (cmd === 'out') c.zoomOut()
    else if (cmd === 'fit') c.fitView()
    else c.zoomTo(Number(cmd))
  }

  /** 节点面板点击：添加到画布可视区中央（连续添加时错开，避免完全重叠） */
  let pickCount = 0
  function onPick(payload: PaletteDrop) {
    const c = canvasRef.value
    if (!c) return
    const p = c.centerPosition()
    const offset = (pickCount++ % 5) * 24
    paletteOpen.value = false
    onDrop(payload, { x: p.x + offset, y: p.y + offset })
  }

  function locate(i: Issue) {
    if (i.target === 'node' && store.activeNodes.some((n) => n.id === i.id)) {
      store.select({ kind: 'node', id: i.id })
      canvasRef.value?.focusNode(i.id)
    } else if (i.target === 'edge' && store.activeEdges.some((e) => e.id === i.id)) {
      store.select({ kind: 'edge', id: i.id })
      const e = store.activeEdges.find((x) => x.id === i.id)
      if (e) canvasRef.value?.focusNode(e.source)
    } else {
      openSettings()
    }
  }

  // ---------- 画布事件 ----------

  // ---------- 快速添加 ----------

  /** 快速添加面板尺寸（NodePalette 420 + 内边距），用于贴边时收回视口内 */
  const QUICK_WIDTH = 452
  const QUICK_HEIGHT = 560

  const quick = ref<QuickAddRequest | null>(null)
  const quickRef = ref<HTMLElement>()

  /** 面板出现在鼠标右侧，超出视口时向内收 */
  const quickStyle = computed(() => {
    const c = quick.value?.client
    if (!c) return {}
    const left = Math.max(8, Math.min(c.x + 16, window.innerWidth - QUICK_WIDTH - 8))
    const top = Math.max(8, Math.min(c.y - 40, window.innerHeight - QUICK_HEIGHT - 8))
    return { left: `${left}px`, top: `${top}px` }
  })

  onClickOutside(quickRef, () => (quick.value = null))

  function openQuickAdd(req: QuickAddRequest) {
    paletteOpen.value = false
    quick.value = req
  }

  function onQuickPick(payload: PaletteDrop) {
    const req = quick.value
    quick.value = null
    if (!req) return
    const pos = req.avoidOverlap ? freePosition(store.activeRule, req.position) : req.position
    onDrop(payload, pos, req.link)
  }

  /** 添加节点；link 非空时自动从该端口连到新节点 */
  function onDrop(payload: PaletteDrop, pos: UIPosition, link?: NodeLink) {
    paletteOpen.value = false
    if (store.activeNodes.length >= MAX_NODES) {
      ElMessage.warning(`节点数不能超过 ${MAX_NODES}`)
      return
    }
    if (payload.kind === 'selector') {
      store.addSelector(pos, link)
      return
    }
    if (payload.kind === 'plugin') {
      if (!store.addPluginNode(payload.keyword, pos, link)) ElMessage.warning('插件未发布或已停用')
      return
    }
    if (payload.type === 'loop') {
      store.addLoop(pos, link)
    } else {
      store.addNode(payload.mode, payload.type, pos, link)
    }
  }

  function onConnect(source: string, target: string, port?: string) {
    const reason = store.connect(source, target, port)
    if (reason) ElMessage.warning(reason)
  }

  function onRemove(nodeIds: string[], edgeIds: string[]) {
    store.removeElements(nodeIds, edgeIds)
  }

  function removeSelected() {
    const s = store.selection
    if (s?.kind === 'node' && canRemove.value) store.removeElements([s.id])
    if (s?.kind === 'edge') store.removeElements([], [s.id])
  }

  // ---------- 加载 ----------

  /** 选择要加载的版本：URL 指定 > 当前生效 > 最新保存 */
  async function resolveVersion(c: ChainInfo): Promise<number> {
    if (props.versionId) return props.versionId
    if (c.currentVersion) return c.currentVersion
    const res = await ListChainVersion({ chainId: c.id, page: 1, pageSize: 1 })
    return res?.list?.[0]?.id || 0
  }

  async function init() {
    const id = props.chainId
    if (!id) {
      ElMessage.error('缺少链 id')
      emit('close')
      return
    }
    loading.value = true
    ready.value = false
    try {
      const res = await GetChain({ id })
      chain.value = res.chain
      const versionId = await resolveVersion(res.chain)
      let rule: Rule = { nodes: [], edges: [] }
      baseVersionNo.value = 0
      if (versionId) {
        const v = await GetChainVersion({ id: versionId })
        rule = parseRule(v.rule)
        baseVersionNo.value = v.version?.version || 0
      }
      store.load(id, versionId, rule)
      await offerDraft(id, versionId)
    } finally {
      loading.value = false
      ready.value = true
    }
    await nextTick()
    store.registerViewport(() => canvasRef.value!.getViewport())
  }

  /** 有本地草稿时提示恢复 / 丢弃 */
  async function offerDraft(id: number, versionId: number) {
    const d = store.readDraft(id)
    if (!d) return
    // 草稿与当前线上内容一致（用户未实际修改）→ 直接清理，不提示
    if (JSON.stringify(d.rule) === JSON.stringify(store.rule)) {
      store.clearDraft(id)
      return
    }
    const stale = d.baseVersionId !== versionId
    const tip = stale
      ? `发现 ${parseTime(d.savedAt)} 暂存的本地草稿，但草稿基于的版本不是当前加载的版本，恢复后保存会覆盖期间他人的修改。`
      : `发现 ${parseTime(d.savedAt)} 暂存的本地草稿。`
    try {
      await ElMessageBox.confirm(tip, '恢复草稿', {
        confirmButtonText: '恢复草稿',
        cancelButtonText: '丢弃',
        distinguishCancelAndClose: true,
        type: stale ? 'warning' : 'info'
      })
      store.load(id, d.baseVersionId, d.rule, true)
    } catch (action) {
      if (action === 'cancel') store.clearDraft(id)
    }
  }

  // ---------- 保存 ----------

  const saveVisible = ref(false)
  const saving = ref(false)
  const saveForm = reactive({ remark: '', publish: false })

  async function openSave() {
    // 先提交未合并的属性修改并取得最新校验结果
    store.commit()
    await store.validateNow()
    if (store.hasError) {
      ElMessage.error('存在错误，修复后才能保存')
      return
    }
    saveForm.remark = ''
    saveForm.publish = false
    saveVisible.value = true
  }

  async function save() {
    if (!chain.value) return
    saving.value = true
    try {
      const publish = saveForm.publish && menuStore.hasPermission('cron:chain_version:switch')
      const res = await CreateChainVersion({
        chainId: chain.value.id,
        rule: store.exportRule(),
        remark: saveForm.remark || undefined,
        publish
      })
      store.markSaved(res.id)
      baseVersionNo.value = res.version
      ElMessage.success(`已保存为 v${res.version}${publish ? ' 并发布' : ''}`)
      saveVisible.value = false
      const c = await GetChain({ id: chain.value.id })
      chain.value = c.chain
      emit('saved')
    } finally {
      saving.value = false
    }
  }

  // ---------- 试运行 ----------

  const debugVisible = ref(false)

  // 发起后在画布上实时显示各节点状态：执行中转圈，未执行到的显示"未开始"
  const {
    rid: liveRid,
    run: liveRun,
    overlay: liveOverlay,
    output: liveOutput,
    start: startLive,
    clear: clearLive
  } = useLiveRun(() => store.rule)

  // 点击节点状态条：抽屉展示该节点本次执行的请求 / 响应 / 输出 / 日志
  const liveNodeVisible = ref(false)
  const liveNid = ref('')

  function openLiveNode(id: string) {
    liveNid.value = id
    liveNodeVisible.value = true
  }

  /** 试运行编辑器当前内容（不需要先保存或发布）；有错误时先修复 */
  async function openDebug() {
    store.commit()
    await store.validateNow()
    if (store.hasError) {
      ElMessage.error('存在错误，修复后才能测试执行')
      return
    }
    // 再次试运行：先清掉上一次的节点状态与结果
    clearLive()
    debugVisible.value = true
  }

  // ---------- 快捷键与离开确认 ----------

  function isEditable(el: EventTarget | null): boolean {
    const t = el as HTMLElement | null
    if (!t) return false
    return t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && quick.value) {
      quick.value = null
      return
    }
    if (isEditable(e.target)) return
    const mod = e.ctrlKey || e.metaKey
    if (!mod) return
    const key = e.key.toLowerCase()
    if (key === 'z' && !e.shiftKey) {
      e.preventDefault()
      store.undo()
    } else if ((key === 'z' && e.shiftKey) || key === 'y') {
      e.preventDefault()
      store.redo()
    }
  }

  function onBeforeUnload(e: BeforeUnloadEvent) {
    if (!store.dirty) return
    e.preventDefault()
    e.returnValue = ''
  }

  /** 已确认离开（避免路由守卫重复询问） */
  let leaving = false

  /** 有未保存修改时确认放弃；返回是否可以离开 */
  async function confirmLeave(): Promise<boolean> {
    if (leaving || !store.dirty) return true
    try {
      await ElMessageBox.confirm('有未保存的修改（已暂存为本地草稿），确定离开？', '离开编辑', { type: 'warning' })
      return true
    } catch {
      return false
    }
  }

  /** 返回 / 关闭：确认后通知外部关闭 */
  async function requestClose() {
    if (await confirmLeave()) emit('close')
  }

  onBeforeRouteLeave(confirmLeave)

  defineExpose({
    requestClose,
    /** 弹窗打开动画结束后重新测量画布节点 */
    refreshCanvas: () => canvasRef.value?.refresh()
  })

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('beforeunload', onBeforeUnload)
    store.loadPlugins()
    init()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('beforeunload', onBeforeUnload)
    store.dispose()
  })
</script>

<style scoped lang="scss">
  .chain-edit {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: var(--el-bg-color);
  }

  // 顶栏：返回 + 图标 + 名称与保存状态，右侧操作（参考 Coze）
  .ce-header {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
    height: 64px;
    padding: 0 16px 0 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .ce-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    font-size: 20px;
    color: #fff;
    background: #2bb673;
    border-radius: 8px;
  }

  .ce-title {
    flex: 1;
    min-width: 0;
  }

  .ce-title__name {
    display: flex;
    gap: 8px;
    align-items: baseline;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
  }

  .ce-title__keyword {
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }

  .ce-title__meta {
    display: flex;
    gap: 6px;
    margin-top: 2px;
  }

  .ce-pill {
    padding: 0 6px;
    font-size: 12px;
    line-height: 18px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color);
    border-radius: 4px;

    &.is-warn {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }
  }

  .ce-header__actions {
    display: flex;
    gap: 4px;
    align-items: center;

    .el-button + .el-button {
      margin-left: 0;
    }
  }

  .ce-save {
    height: 36px;
    padding: 0 20px;
    margin-left: 8px;
    border-radius: 8px;
  }

  .ce-body {
    position: relative;
    flex: 1;
    min-height: 0;
  }

  // 浮动属性面板
  .ce-panel {
    position: absolute;
    top: 12px;
    right: 12px;
    bottom: 12px;
    z-index: 5;
    display: flex;
    flex-direction: column;
    width: 400px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    box-shadow: 0 6px 24px rgb(0 0 0 / 10%);
  }

  .ce-panel__head {
    display: flex;
    flex-shrink: 0;
    gap: 2px;
    align-items: center;
    height: 48px;
    padding: 0 8px 0 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .el-button + .el-button {
      margin-left: 0;
    }
  }

  .ce-panel__title {
    flex: 1;
    font-size: 15px;
    font-weight: 500;
  }

  .ce-panel__body {
    flex: 1;
    min-height: 0;
    padding: 0 16px;

    // 属性面板只允许上下滚动：内容超宽时收在面板内，不出现横向滚动
    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }

    :deep(.el-scrollbar__bar.is-horizontal) {
      display: none;
    }
  }

  // 快速添加面板：固定在鼠标位置附近
  .ce-quick {
    position: fixed;
    z-index: 3000;
    box-sizing: border-box;
    padding: 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    box-shadow: 0 8px 28px rgb(0 0 0 / 14%);
  }

  // 试运行状态条：浮在画布顶部居中
  .ce-live {
    position: absolute;
    top: 12px;
    left: 50%;
    z-index: 4;
    display: flex;
    gap: 8px;
    align-items: center;
    max-width: calc(100% - 460px);
    height: 40px;
    padding: 0 12px;
    font-size: 13px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
    transform: translateX(-50%);

    .el-button + .el-button {
      margin-left: 0;
    }
  }

  .ce-live__text {
    font-family: Menlo, Monaco, Consolas, monospace;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  .ce-live__error {
    min-width: 0;
    overflow: hidden;
    color: var(--el-color-danger);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ce-live__output {
    max-height: 320px;
    margin: 0;
    overflow: auto;
    font-size: 12px;
  }

  // 问题列表：浮在工具栏上方
  .ce-issues {
    position: absolute;
    bottom: 76px;
    left: 50%;
    z-index: 5;
    width: 560px;
    max-width: calc(100% - 24px);
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    box-shadow: 0 6px 24px rgb(0 0 0 / 10%);
    transform: translateX(-50%);
  }

  // 底部浮动工具栏
  .ce-dock {
    position: absolute;
    bottom: 16px;
    left: 50%;
    z-index: 4;
    display: flex;
    gap: 8px;
    transform: translateX(-50%);
  }

  .ce-dock__group {
    display: flex;
    gap: 4px;
    align-items: center;
    height: 52px;
    padding: 0 8px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 8%);

    .el-button + .el-button {
      margin-left: 0;
    }

    // 工具栏按钮统一为正方形（宽 = 高，只放图标）
    .el-button {
      width: var(--el-component-custom-height);
      padding: 0;
    }

    // 图标按钮（小地图 / 自动布局 / 问题列表）加浅灰底，与表格工具栏按钮一致
    .el-button.is-text {
      background-color: rgba(var(--art-gray-200-rgb), 0.8);
      border-radius: 6px;

      &:not(.is-disabled):hover {
        background-color: rgba(var(--art-gray-300-rgb), 0.75);
      }
    }

    .el-button.is-on {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .is-danger {
      color: var(--el-color-danger);
    }

    .is-warn {
      color: var(--el-color-warning);
    }

    .is-ok {
      color: var(--el-color-success);
    }
  }

  .ce-zoom {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: space-between;
    width: 76px;
    height: 32px;
    padding: 0 8px;
    font-size: 14px;
    cursor: pointer;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
  }

  // 问题数角标挂在按钮右上角，不撑宽按钮
  .ce-dock__badge {
    display: flex;
  }

  .ce-dock__ref {
    display: flex;
  }

  .ce-dock__group .ce-add {
    margin-left: 4px;
    font-weight: 500;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border: none;
    border-radius: 8px;

    &:hover {
      background: var(--el-color-primary-light-8);
    }
  }

  .ce-dock__group .ce-run {
    font-weight: 500;
    border-radius: 8px;
  }

  .ce-save-tip {
    font-size: 12px;
    color: var(--el-color-warning);
  }
</style>

<style scoped lang="scss">
  .ce-crumb {
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
