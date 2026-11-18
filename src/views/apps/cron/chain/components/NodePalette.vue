<template>
  <div class="node-palette">
    <ElInput v-model="keyword" clearable placeholder="搜索节点" :suffix-icon="Search" class="np-search" />
    <div class="np-scroll">
      <div v-for="g in visibleGroups" :key="g.title" class="np-group">
        <div class="np-group__title">{{ g.title }}</div>
        <div class="np-grid">
          <div
            v-for="item in g.items"
            :key="item.key"
            class="np-item"
            draggable="true"
            :title="item.desc"
            @click="emit('pick', item.drop)"
            @dragstart="onDragStart($event, item.drop)"
          >
            <span class="np-item__logo" :style="{ background: item.color }">
              <ArtIcon v-if="item.artIcon" :value="item.artIcon" :size="20" />
              <ElIcon v-else><component :is="item.icon" /></ElIcon>
            </span>
            <span class="np-item__label">{{ item.label }}</span>
            <span v-if="item.tag" class="np-item__tag">{{ item.tag }}</span>
          </div>
        </div>
      </div>
      <div v-if="!visibleGroups.length" class="np-empty">没有匹配的节点</div>
    </div>
    <div class="np-help">点击添加到画布中央，或拖到指定位置；从节点右侧圆点拖到另一节点左侧圆点连线。</div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import type { Component } from 'vue'
  import { Box, Connection, Document, Refresh, Search, Share } from '@element-plus/icons-vue'
  import type { ChainNodeInfo } from '@/api/cron/chain/type'
  import type { PaletteDrop } from '../types/graph'
  import { DRAG_MIME, NODE_COLOR } from '../utils/constants'

  defineOptions({ name: 'NodePalette' })

  // 添加节点面板（参考 Coze）：按分组两列排列，点击添加到画布中央，也可拖入画布
  const props = withDefaults(defineProps<{ plugins?: ChainNodeInfo[] }>(), { plugins: () => [] })

  const emit = defineEmits<{ pick: [payload: PaletteDrop] }>()

  interface PaletteItem {
    key: string
    label: string
    desc: string
    color: string
    icon?: Component
    artIcon?: string
    tag?: string
    drop: PaletteDrop
  }

  const keyword = ref('')

  /** 内置节点：业务逻辑 / 工具；执行方式（自动执行 / 被动触发）是节点属性，添加后在属性面板切换 */
  const basicGroups: { title: string; items: PaletteItem[] }[] = [
    {
      title: '业务逻辑',
      items: [
        {
          key: 'selector',
          label: '分支器',
          desc: '按条件分成多个分支，命中第一个满足的分支，都不满足走否则',
          color: NODE_COLOR.selector,
          icon: Share,
          drop: { kind: 'selector' }
        },
        {
          key: 'loop',
          label: '循环',
          desc: '循环体按次数或集合反复执行，每轮可引用 ${loop.index}；循环体内可引用外层输出',
          color: NODE_COLOR.selector,
          icon: Refresh,
          drop: { kind: 'basic', mode: 'auto', type: 'loop' as const }
        }
      ]
    },
    {
      title: '工具',
      items: [
        {
          key: 'api',
          label: 'HTTP 请求',
          desc: '调用 HTTP 接口；需要等外部触发后再调用时，在属性面板把执行方式改为被动触发',
          color: NODE_COLOR.api,
          icon: Connection,
          drop: { kind: 'basic', mode: 'auto', type: 'api' }
        },
        {
          key: 'script',
          label: '脚本',
          desc: '执行 JS 脚本；需要等外部触发后再执行时，在属性面板把执行方式改为被动触发',
          color: NODE_COLOR.script,
          icon: Document,
          drop: { kind: 'basic', mode: 'auto', type: 'script' }
        },
        {
          key: 'chain',
          label: '运行指定流程',
          desc: '调用另一条流程（子流程）：输入作为子链入参，输出为子链最终输出；不支持嵌套调用',
          color: NODE_COLOR.chain,
          icon: Connection,
          drop: { kind: 'basic', mode: 'auto', type: 'chain' }
        }
      ]
    }
  ]

  /** 插件按分组归类，分组按排序（越大越靠前），未分组放最后 */
  const pluginGroups = computed(() => {
    const map = new Map<string, PaletteItem[]>()
    const sorted = [...props.plugins].sort(
      (a, b) => (b.groupId ? 1 : 0) - (a.groupId ? 1 : 0) || (b.groupWeight || 0) - (a.groupWeight || 0)
    )
    for (const t of sorted) {
      const c = t.groupName || '未分组'
      const item: PaletteItem = {
        key: `tpl-${t.keyword}`,
        label: t.name,
        desc: t.description || `${t.name}（${t.keyword}）v${t.currentVersionNo}`,
        color: t.iconBg || NODE_COLOR.plugin,
        icon: Box,
        artIcon: t.icon || undefined,
        tag: t.type === 'script' ? '脚本' : 'API',
        drop: { kind: 'plugin', keyword: t.keyword }
      }
      const list = map.get(c)
      if (list) list.push(item)
      else map.set(c, [item])
    }
    return [...map.entries()].map(([category, items]) => ({ title: `插件 · ${category}`, items }))
  })

  /** 按关键字过滤，空分组不显示 */
  const visibleGroups = computed(() => {
    const k = keyword.value.trim().toLowerCase()
    return [...basicGroups, ...pluginGroups.value]
      .map((g) => ({ ...g, items: k ? g.items.filter((i) => i.label.toLowerCase().includes(k)) : g.items }))
      .filter((g) => g.items.length)
  })

  function onDragStart(e: DragEvent, payload: PaletteDrop) {
    if (!e.dataTransfer) return
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'move'
  }
</script>

<style scoped lang="scss">
  .node-palette {
    display: flex;
    flex-direction: column;
    width: 420px;
    max-height: 520px;
  }

  .np-search {
    flex-shrink: 0;
    margin-bottom: 12px;
  }

  .np-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .np-group {
    margin-bottom: 12px;
  }

  .np-group__title {
    margin-bottom: 4px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .np-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2px 8px;
  }

  .np-item {
    display: flex;
    gap: 10px;
    align-items: center;
    height: 40px;
    padding: 0 8px;
    font-size: 14px;
    color: var(--el-text-color-primary);
    cursor: pointer;
    user-select: none;
    border-radius: 6px;
    transition: background 0.15s;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }

  .np-item__logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 14px;
    color: #fff;
    border-radius: 6px;
  }

  .np-item__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .np-item__tag {
    flex-shrink: 0;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .np-empty {
    padding: 12px 0;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  .np-help {
    flex-shrink: 0;
    padding-top: 8px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
    border-top: 1px solid var(--el-border-color-lighter);
  }
</style>
