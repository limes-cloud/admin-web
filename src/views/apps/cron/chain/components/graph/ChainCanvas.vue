<template>
  <div ref="rootRef" class="chain-canvas" @drop="onDrop" @dragover.prevent>
    <VueFlow
      :id="flowId"
      :nodes-draggable="!readonly"
      :nodes-connectable="!readonly"
      :elements-selectable="true"
      :delete-key-code="readonly ? null : ['Delete', 'Backspace']"
      :default-viewport="initialViewport"
      :min-zoom="0.1"
      :max-zoom="2"
      :zoom-on-double-click="false"
      :select-nodes-on-drag="false"
      :fit-view-on-init="!initialViewport"
      @node-click="onNodeClick"
      @edge-click="onEdgeClick"
      @pane-click="emit('select', null)"
      @node-drag-stop="onDragStop"
      :connect-on-click="false"
      @connect-start="onConnectStart"
      @connect="onConnect"
      @connect-end="onConnectEnd"
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
    >
      <template #node-chain="p">
        <ChainNode :id="p.id" :selected="p.selected" />
      </template>
      <template #node-terminal="p">
        <TerminalNode :id="p.id" :selected="p.selected" />
      </template>
      <template #node-selector="p">
        <SelectorNode :id="p.id" :selected="p.selected" />
      </template>
      <template #edge-chain="p">
        <ChainEdge v-bind="p" />
      </template>
      <Background variant="dots" :gap="20" :size="1.4" pattern-color="#c9ccd4" />
      <Controls v-if="controls" :show-interactive="false" />
      <MiniMap v-if="minimap" pannable zoomable :node-color="miniMapColor" />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, provide, ref, watch } from 'vue'
  import { VueFlow, useVueFlow } from '@vue-flow/core'
  import type {
    Connection,
    EdgeChange,
    EdgeMouseEvent,
    GraphNode,
    NodeChange,
    NodeDragEvent,
    NodeMouseEvent
  } from '@vue-flow/core'
  import { Background } from '@vue-flow/background'
  import { Controls } from '@vue-flow/controls'
  import { MiniMap } from '@vue-flow/minimap'
  import '@vue-flow/core/dist/style.css'
  import '@vue-flow/core/dist/theme-default.css'
  import '@vue-flow/controls/dist/style.css'
  import '@vue-flow/minimap/dist/style.css'
  import ChainNode from './ChainNode.vue'
  import ChainEdge from './ChainEdge.vue'
  import TerminalNode from './TerminalNode.vue'
  import SelectorNode from './SelectorNode.vue'
  import { CANVAS_CONTEXT } from './canvas-context'
  import { toFlowEdges, toFlowNodes } from './flow-convert'
  import { nodeHeight, RANK_GAP } from './layout'
  import type { Edge, Node, Rule, UIPosition, UIViewport } from '../../types/dsl'
  import type { EditorSelection, PaletteDrop, QuickAddRequest, RunNodeOverlay, PluginBrief } from '../../types/graph'
  import type { Issue } from '../../types/issue'
  import { nowSec, uuid } from '../../utils/format'
  import { DRAG_MIME, NODE_HEAD_HEIGHT, NODE_WIDTH } from '../../utils/constants'

  defineOptions({ name: 'ChainCanvas' })

  const props = withDefaults(
    defineProps<{
      rule: Rule
      issues?: Issue[]
      readonly?: boolean
      /** 运行详情叠加状态（nid → 状态）；编辑模式不传 */
      overlay?: Record<string, RunNodeOverlay>
      warnNodes?: string[]
      /** 节点模板展示信息（模板节点显示模板名称与图标） */
      plugins?: PluginBrief[]
      /** 显示内置缩放控件；编辑页用自己的底部工具栏时关闭 */
      controls?: boolean
      /** 显示小地图 */
      minimap?: boolean
      /** 忽略保存的视口，初始缩放到能完整显示所有节点（只读查看用） */
      fit?: boolean
    }>(),
    {
      issues: () => [],
      readonly: false,
      overlay: undefined,
      warnNodes: () => [],
      plugins: () => [],
      controls: true,
      minimap: true,
      fit: false
    }
  )

  const emit = defineEmits<{
    select: [selection: EditorSelection]
    /** 节点点击（运行详情打开节点抽屉） */
    nodeClick: [id: string]
    /** 点击节点底部的运行状态条（查看该节点本次执行详情） */
    statusClick: [id: string]
    /** port：分支器出端口（分支 id 或 default），其余节点为空 */
    connect: [source: string, target: string, port?: string]
    /** 点击输出端口，或拖出连线后在空白处松手：请求弹出添加节点面板 */
    quickAdd: [req: QuickAddRequest]
    drop: [payload: PaletteDrop, position: UIPosition]
    move: [moved: { id: string; x: number; y: number }[]]
    remove: [nodeIds: string[], edgeIds: string[]]
  }>()

  const flowId = `chain-canvas-${uuid()}`
  const {
    screenToFlowCoordinate,
    getViewport,
    fitView,
    setCenter,
    viewport,
    zoomIn,
    zoomOut,
    zoomTo,
    updateNodeInternals,
    setNodes,
    setEdges
  } = useVueFlow(flowId)
  const rootRef = ref<HTMLElement>()

  const savedViewport = props.fit ? undefined : props.rule.ui?.viewport
  const initialViewport = savedViewport
    ? { x: savedViewport.x, y: savedViewport.y, zoom: savedViewport.zoom }
    : undefined

  // ---------- 渲染上下文 ----------

  const nodeMap = computed(() => new Map<string, Node>(props.rule.nodes.map((n) => [n.id, n])))
  const edgeMap = computed(() => new Map<string, Edge>(props.rule.edges.map((e) => [e.id, e])))

  const issueIndex = computed(() => {
    const nodes = new Map<string, Issue[]>()
    const edges = new Map<string, Issue[]>()
    for (const i of props.issues) {
      if (!i.id) continue
      const m = i.target === 'node' ? nodes : i.target === 'edge' ? edges : null
      if (!m) continue
      const list = m.get(i.id)
      if (list) list.push(i)
      else m.set(i.id, [i])
    }
    return { nodes, edges }
  })

  const now = ref(nowSec())
  let timer: ReturnType<typeof setInterval> | null = null

  provide(CANVAS_CONTEXT, {
    getNode: (id) => nodeMap.value.get(id),
    getEdge: (id) => edgeMap.value.get(id),
    nodeIssues: (id) => issueIndex.value.nodes.get(id) || [],
    edgeIssues: (id) => issueIndex.value.edges.get(id) || [],
    isWarnNode: (id) => props.warnNodes.includes(id),
    overlay: (id) => props.overlay?.[id],
    getPlugin: (keyword) => props.plugins.find((t) => t.keyword === keyword),
    now,
    openStatus: (id) => emit('statusClick', id)
  })

  // ---------- 规则 → 画布 ----------

  /** 结构键：节点 id/坐标与边变化时才重建画布元素，属性变化只驱动组件重渲染 */
  const structureKey = computed(() =>
    JSON.stringify([
      props.rule.nodes.map((n) => [n.id, n.type, props.rule.ui?.nodes?.[n.id]]),
      props.rule.edges.map((e) => [e.id, e.source, e.sourcePort, e.target])
    ])
  )

  watch(
    structureKey,
    // 直接写入画布 store，先节点后边：边在写入时校验两端节点，新节点与它的入边同一步加入时，
    // 若边先于节点生效会被当作悬空边丢弃（通过 :nodes / :edges 传入时两个 watcher 的先后不受控）
    () => {
      setNodes(toFlowNodes(props.rule))
      setEdges(toFlowEdges(props.rule))
    },
    { immediate: true }
  )

  // ---------- 交互 ----------

  function onNodeClick(e: NodeMouseEvent) {
    // 编辑时点击输出端口用于快速添加节点，不选中节点、不打开属性面板
    if (!props.readonly && (e.event.target as HTMLElement | null)?.closest?.('.vue-flow__handle')) return
    emit('select', { kind: 'node', id: e.node.id })
    emit('nodeClick', e.node.id)
  }

  function onEdgeClick(e: EdgeMouseEvent) {
    emit('select', { kind: 'edge', id: e.edge.id })
  }

  function onDragStop(e: NodeDragEvent) {
    const list: GraphNode[] = e.nodes?.length ? e.nodes : [e.node]
    emit(
      'move',
      list.map((n) => ({ id: n.id, x: n.position.x, y: n.position.y }))
    )
  }

  // ---------- 输出端口：点击弹出添加节点面板，拖动为连线 ----------

  /** 按下与松开的移动距离不超过该值视为点击（像素） */
  const CLICK_TOLERANCE = 4

  /** 本次从端口发起的连线：按下位置与是否已连上目标 */
  let pending: { nodeId: string; port?: string; x: number; y: number; connected: boolean } | null = null

  /** 鼠标或触摸事件的屏幕坐标 */
  function pointOf(e?: MouseEvent | TouchEvent): { x: number; y: number } | null {
    if (!e) return null
    if ('changedTouches' in e) {
      const t = e.changedTouches[0] || e.touches[0]
      return t ? { x: t.clientX, y: t.clientY } : null
    }
    return { x: e.clientX, y: e.clientY }
  }

  function onConnectStart(p: {
    event?: MouseEvent | TouchEvent
    nodeId?: string
    handleId: string | null
    handleType?: string
  }) {
    pending = null
    const pt = pointOf(p.event)
    // 只处理输出端口；输入端口仍只能拖动连线
    if (props.readonly || p.handleType !== 'source' || !p.nodeId || !pt) return
    pending = { nodeId: p.nodeId, port: p.handleId || undefined, ...pt, connected: false }
  }

  function onConnect(c: Connection) {
    if (props.readonly) return
    if (pending) pending.connected = true
    emit('connect', c.source, c.target, c.sourceHandle || undefined)
  }

  function onConnectEnd(e?: MouseEvent | TouchEvent) {
    const start = pending
    pending = null
    const pt = pointOf(e)
    if (!start || start.connected || !pt) return
    const link = { source: start.nodeId, port: start.port }
    const moved = Math.hypot(pt.x - start.x, pt.y - start.y)
    if (moved <= CLICK_TOLERANCE) {
      // 点击：新节点放在源节点右侧，输入端口与被点的端口同高
      const src = props.rule.ui?.nodes?.[start.nodeId]
      const at = screenToFlowCoordinate(pt)
      const x = (src?.x ?? at.x) + NODE_WIDTH + RANK_GAP
      emit('quickAdd', { link, position: { x, y: at.y - NODE_HEAD_HEIGHT / 2 }, avoidOverlap: true, client: pt })
      return
    }
    // 拖到空白处松手：新节点放在松手位置；落在节点上（未连上）不处理
    const target = document.elementFromPoint(pt.x, pt.y)
    if (!target?.closest('.vue-flow__pane') || target.closest('.vue-flow__node')) return
    const at = screenToFlowCoordinate(pt)
    emit('quickAdd', { link, position: { x: at.x, y: at.y - NODE_HEAD_HEIGHT / 2 }, avoidOverlap: false, client: pt })
  }

  // 删除键产生的节点/边移除合并为一次，避免拆成多步历史
  let pendingNodes: string[] = []
  let pendingEdges: string[] = []
  let flushScheduled = false

  function scheduleFlush() {
    if (flushScheduled) return
    flushScheduled = true
    nextTick(() => {
      flushScheduled = false
      const n = pendingNodes
      const e = pendingEdges
      pendingNodes = []
      pendingEdges = []
      if (n.length || e.length) emit('remove', n, e)
    })
  }

  function onNodesChange(changes: NodeChange[]) {
    if (props.readonly) return
    const removed = changes.filter((c) => c.type === 'remove').map((c) => (c as { id: string }).id)
    if (!removed.length) return
    pendingNodes.push(...removed)
    scheduleFlush()
  }

  function onEdgesChange(changes: EdgeChange[]) {
    if (props.readonly) return
    const removed = changes.filter((c) => c.type === 'remove').map((c) => (c as { id: string }).id)
    if (!removed.length) return
    pendingEdges.push(...removed)
    scheduleFlush()
  }

  function onDrop(e: DragEvent) {
    if (props.readonly) return
    const raw = e.dataTransfer?.getData(DRAG_MIME)
    if (!raw) return
    e.preventDefault()
    let payload: PaletteDrop
    try {
      payload = JSON.parse(raw) as PaletteDrop
    } catch {
      return
    }
    const p = screenToFlowCoordinate({ x: e.clientX, y: e.clientY })
    // 落点为鼠标位置，节点左上角向左上偏移半个节点
    emit('drop', payload, { x: p.x - NODE_WIDTH / 2, y: p.y - NODE_HEAD_HEIGHT / 2 })
  }

  /** 小地图节点颜色：运行态按状态着色 */
  function miniMapColor(n: GraphNode): string {
    const s = props.overlay?.[n.id]
    if (!s) return 'var(--el-border-color-darker)'
    if (s.status === 'running') return s.trigger?.status === 'waiting' ? '#e6a23c' : '#409eff'
    if (s.status === 'success' || s.status === 'ignored') return '#67c23a'
    if (s.status === 'fail') return '#f56c6c'
    if (s.status === 'bypassed') return '#909399'
    return '#c0c4cc'
  }

  // 有运行叠加状态时每秒走时（待触发节点的已等 / 剩余时长）
  watch(
    () => props.overlay !== undefined,
    (on) => {
      if (timer) clearInterval(timer)
      timer = on ? setInterval(() => (now.value = nowSec()), 1000) : null
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  defineExpose({
    /** 当前视口（保存时写入 ui.viewport） */
    getViewport: (): UIViewport => getViewport(),
    fitView: () => fitView({ padding: 0.2, duration: 300 }),
    /** 重新测量全部节点的尺寸与端口位置（容器动画结束后调用，修正连线端点） */
    refresh: () => updateNodeInternals(),
    /** 当前缩放比例（工具栏显示） */
    zoom: computed(() => viewport.value.zoom),
    zoomIn: () => zoomIn({ duration: 200 }),
    zoomOut: () => zoomOut({ duration: 200 }),
    zoomTo: (level: number) => zoomTo(level, { duration: 200 }),
    /** 可视区中心对应的节点左上角坐标（点击添加节点时的落点） */
    centerPosition: (): UIPosition => {
      const r = rootRef.value?.getBoundingClientRect()
      if (!r) return { x: 0, y: 0 }
      const p = screenToFlowCoordinate({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      return { x: p.x - NODE_WIDTH / 2, y: p.y - NODE_HEAD_HEIGHT / 2 }
    },
    /** 视口居中到节点（问题列表定位） */
    focusNode: (id: string) => {
      const p = props.rule.ui?.nodes?.[id]
      const n = nodeMap.value.get(id)
      if (!p || !n) return
      setCenter(p.x + NODE_WIDTH / 2, p.y + nodeHeight(n) / 2, { zoom: Math.max(getViewport().zoom, 1), duration: 300 })
    }
  })
</script>

<style scoped lang="scss">
  .chain-canvas {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 300px;
    background: var(--el-fill-color-light);

    // 端口：卡片边缘的实心小圆点，悬停放大（参考 Coze）
    :deep(.vue-flow__handle) {
      width: 9px;
      height: 9px;
      background: var(--el-color-primary);
      border: 2px solid var(--el-bg-color);
      box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
      transition:
        width 0.15s,
        height 0.15s;

      &:hover,
      &.connecting {
        width: 13px;
        height: 13px;
      }
    }

    :deep(.vue-flow__node.selected) {
      z-index: 2;
    }

    :deep(.vue-flow__node-chain),
    :deep(.vue-flow__node-terminal),
    :deep(.vue-flow__node-selector) {
      padding: 0;
      background: transparent;
      border: none;
    }
  }
</style>
