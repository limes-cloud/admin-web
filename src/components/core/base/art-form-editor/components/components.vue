<template>
  <div class="components" :class="[size]">
    <!-- 搜索框 -->
    <div class="component-search">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索组件"
        :prefix-icon="Search"
        clearable
        size="small"
      />
    </div>

    <template v-if="filteredGroups.length">
      <template v-for="(ite, ind) in filteredGroups" :key="ind">
        <div class="component-item">
          <div class="title">
            <el-icon><Operation /> </el-icon>
            <span class="text">{{ ite.title }}</span>
          </div>
          <div class="content">
            <VueDraggable
              v-model="ite.nodes"
              :group="{ name: 'form-nodes', pull: 'clone', put: false }"
              :sort="false"
              :clone="cloneItem"
              ghost-class="ghost"
              class="component-drag-list"
              :class="{ 'component-drag-list--mini': size === 'mini' }"
            >
              <div
                v-for="node in ite.nodes"
                :key="node.id"
                class="item"
                @click="handleClick(node)"
              >
                <el-icon><component :is="getIcon(node.type)" /></el-icon>
                <span style="margin-left: 5px">{{ node.name }}</span>
              </div>
            </VueDraggable>
          </div>
        </div>
      </template>
    </template>
    <div v-else class="component-empty">无匹配组件</div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, computed, Component as VueComponent } from 'vue'
  import { VueDraggable } from 'vue-draggable-plus'
  import { componentGroups } from '../lib/editor'
  import { FormNode } from '../lib/types'
  import {
    Operation,
    Edit,
    Document,
    Odometer,
    Lock,
    Select,
    Check,
    ArrowDown,
    Clock,
    Calendar,
    Timer,
    Upload,
    Grid,
    Menu,
    Connection,
    Box,
    Collection,
    Notebook,
    Fold,
    Minus,
    Warning,
    DocumentCopy,
    Search,
    Aim,
    Pointer,
    Stamp,
    Reading,
    PriceTag,
    Link as LinkIcon,
    ChatDotRound,
    SetUp
  } from '@element-plus/icons-vue'

  withDefaults(defineProps<{ size?: string }>(), { size: 'lg' })
  const emit = defineEmits(['create'])

  // 搜索关键字
  const searchKeyword = ref('')

  // 组件类型 → 图标映射
  const iconMap: Record<string, VueComponent> = {
    input: Edit,
    textarea: Document,
    number: Odometer,
    password: Lock,
    radio: Select,
    checkbox: Check,
    select: ArrowDown,
    time: Clock,
    date: Calendar,
    datetime: Timer,
    datepicker: Calendar,
    daterange: Calendar,
    colorpicker: Aim,
    treeselect: Connection,
    upload: Upload,
    row: Grid,
    table: Menu,
    inline: Connection,
    box: Box,
    tabs: Collection,
    space: Minus,
    card: Notebook,
    collapse: Fold,
    descriptions: DocumentCopy,
    divider: Minus,
    alert: Warning,
    text: Document,
    button: Pointer,
    html: Stamp,
    paragraph: Reading,
    tag: PriceTag,
    link: LinkIcon,
    tooltip: ChatDotRound,
    watermark: SetUp
  }

  const getIcon = (type: string): VueComponent => {
    return iconMap[type] || Operation
  }

  // 扩展 FormNode，附带显示名称
  interface DisplayNode extends FormNode {
    name: string
  }

  // 将 componentGroups 转为带 DisplayNode[] 的结构，方便拖拽
  const groupedNodes = reactive(
    componentGroups.map((g) => ({
      title: g.title,
      nodes: g.items.map((item) => ({
        ...item.creater(),
        name: item.name
      })) as DisplayNode[]
    }))
  )

  // 搜索过滤
  const filteredGroups = computed(() => {
    const kw = searchKeyword.value.trim().toLowerCase()
    if (!kw) return groupedNodes
    return groupedNodes
      .map((g) => ({
        ...g,
        nodes: g.nodes.filter((n) => n.name.toLowerCase().includes(kw) || n.type.toLowerCase().includes(kw))
      }))
      .filter((g) => g.nodes.length > 0)
  })

  // clone 时生成全新节点（每次拖拽产生独立 id）
  const cloneItem = (original: DisplayNode): FormNode => {
    // 找到对应的 creater 重新调用
    for (const g of componentGroups) {
      const found = g.items.find((item) => item.type === original.type)
      if (found) return found.creater()
    }
    // fallback: 深拷贝（去掉 name 字段）
    const { name, ...node } = original
    return JSON.parse(JSON.stringify(node))
  }

  const handleClick = (node: DisplayNode) => {
    // 点击也能添加
    for (const g of componentGroups) {
      const found = g.items.find((item) => item.type === node.type)
      if (found) {
        emit('create', found.creater())
        return
      }
    }
  }
</script>

<style lang="scss" scoped>
  .components {
    position: relative;
    box-sizing: border-box;
    flex-grow: 1;
    width: 240px;
    min-width: 240px;
    max-width: 240px;
    height: 100%;
    padding: 20px 15px;
    overflow-y: auto;
    background: #fff;
    border: 1px solid #f2f2fe;
    border-radius: 4px;

    &::-webkit-scrollbar {
      display: none;
    }

    .component-search {
      margin-bottom: 12px;
    }

    .component-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100px;
      color: #999;
      font-size: 13px;
    }

    .component-item {
      .title {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 700;
        color: #555;
      }

      .content {
        padding-top: 15px;
        padding-bottom: 10px;
      }
    }
  }

  .component-drag-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px 8px;

    > div {
      min-width: 0;
    }

    &--mini {
      grid-template-columns: 1fr;
    }
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    width: 100%;
    height: 30px;
    padding-left: 10px;
    font-size: 13px;
    line-height: 30px;
    cursor: grab;
    border: 1px solid #fff;
    border-radius: 4px;

    &:hover {
      color: #787be8;
      border: 1px dashed #787be8;
    }
  }

  :deep(.ghost) {
    opacity: 0.5;
    background: #f0f0ff;
  }

  .mini {
    width: 120px;
    min-width: 120px;
    max-width: 120px;
  }
</style>
