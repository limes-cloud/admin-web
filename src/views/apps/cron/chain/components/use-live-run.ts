// 编辑器试运行实时回显：轮询运行图，把各节点状态叠加到编辑画布上

import { computed, onBeforeUnmount, ref } from 'vue'
import { GetChainRun, GetChainRunGraph } from '@/api/cron/chain/api'
import type { ChainRunGraphRun } from '@/api/cron/chain/type'
import type { Rule } from '../types/dsl'
import type { RunNodeOverlay } from '../types/graph'
import { RUN_TERMINAL } from '../utils/constants'
import { toNum } from '../utils/format'

/** 运行中的轮询间隔（毫秒）：试运行要看到节点逐个推进，比运行详情页更密 */
const LIVE_POLL_MS = 1000

export function useLiveRun(rule: () => Rule) {
  const rid = ref('')
  const run = ref<ChainRunGraphRun>()
  /** 已产生状态的节点（后端按需建节点行，没有行 = 还未执行） */
  const nodes = ref<Record<string, RunNodeOverlay>>({})
  /** 运行结束后的最终输出 */
  const output = ref<any>()

  let timer: ReturnType<typeof setTimeout> | null = null
  let token = 0

  /** 叠加状态：画布上每个节点都有状态，没执行到的显示"未开始"；未在回显时为 undefined（编辑态外观）。
   *  回显节点含循环体子图节点（按 nid 全局唯一），一并叠加。 */
  const overlay = computed<Record<string, RunNodeOverlay> | undefined>(() => {
    if (!rid.value) return undefined
    const map: Record<string, RunNodeOverlay> = {}
    for (const [id, n] of Object.entries(nodes.value)) map[id] = n
    for (const n of rule().nodes) if (!map[n.id]) map[n.id] = { status: 'pending' }
    return map
  })

  const active = computed(() => !!rid.value)
  const finished = computed(() => !!run.value && run.value.status !== 'running')

  function stopPolling() {
    if (timer) clearTimeout(timer)
    timer = null
  }

  async function poll(current: number) {
    try {
      const res = await GetChainRunGraph({ id: rid.value }, false)
      if (current !== token) return
      run.value = res.run
      const map: Record<string, RunNodeOverlay> = {}
      for (const n of res.nodes || []) map[n.nid] = { status: n.status, error: n.error, costMs: n.costMs }
      for (const t of res.triggers || []) {
        const o = map[t.nid] || (map[t.nid] = { status: 'running' })
        o.trigger = {
          status: t.status,
          startedAt: toNum(t.startedAt),
          deadlineAt: toNum(t.deadlineAt),
          triggeredAt: toNum(t.triggeredAt)
        }
      }
      nodes.value = map
    } catch {
      // 单次失败不打断，下一轮继续
    }
    if (current !== token) return
    // 只有运行中继续轮询；挂起（含待触发被动节点）与终态停止，结束时取一次最终输出
    if (!run.value || run.value.status === 'running') {
      timer = setTimeout(() => poll(current), LIVE_POLL_MS)
      return
    }
    if (RUN_TERMINAL.includes(run.value.status)) {
      GetChainRun({ id: rid.value })
        .then((r) => current === token && (output.value = r.output))
        .catch(() => undefined)
    }
  }

  /** 开始回显一次运行 */
  function start(id: string) {
    clear()
    rid.value = id
    poll(token)
  }

  /** 退出回显，画布恢复编辑态外观 */
  function clear() {
    token++
    stopPolling()
    rid.value = ''
    run.value = undefined
    nodes.value = {}
    output.value = undefined
  }

  onBeforeUnmount(clear)

  return { rid, run, overlay, output, active, finished, start, clear }
}
