// 下拉选项数据：接口 pageSize 上限 50，按页拉取全部

import { ListChain, ListChainNode } from '@/api/cron/chain/api'
import type { ChainInfo } from '@/api/cron/chain/type'
import type { Rule } from '../types/dsl'
import type { PluginBrief } from '../types/graph'

/** 接口分页上限 */
const PAGE_SIZE = 50

/** 最多拉取页数（防止异常数据导致无限请求） */
const MAX_PAGES = 20

async function fetchAll<T>(fn: (p: { page: number; pageSize: number }) => Promise<{ total: number; list: T[] }>) {
  const out: T[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fn({ page, pageSize: PAGE_SIZE })
    const list = res?.list || []
    out.push(...list)
    if (list.length < PAGE_SIZE || out.length >= (res?.total || 0)) break
  }
  return out
}

/** 全部调度链 */
export function listAllChains(): Promise<ChainInfo[]> {
  return fetchAll(ListChain)
}

/** 规则含模板节点时取模板展示信息（只读画布显示模板名称与图标）；失败返回空列表 */
export async function pluginBriefsFor(rule?: Rule): Promise<PluginBrief[]> {
  if (!rule?.nodes.some((n) => n.plugin)) return []
  try {
    const res = await ListChainNode({ page: 1, pageSize: 200 }, false)
    return (res?.list || []).map((t) => ({
      keyword: t.keyword,
      name: t.name,
      icon: t.icon,
      iconBg: t.iconBg,
      type: t.type,
      currentVersionNo: t.currentVersionNo
    }))
  } catch {
    return []
  }
}
