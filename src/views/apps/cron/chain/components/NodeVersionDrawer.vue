<template>
  <ElDrawer
    :model-value="modelValue"
    :title="`版本列表：${node?.name || ''}（${node?.keyword || ''}）`"
    size="720px"
    @update:model-value="emit('update:modelValue', $event)"
    @open="load(1)"
  >
    <!-- 统一表格组件；抽屉内没有 ArtTableHeader，高度由外层容器决定 -->
    <div class="nvd-table">
      <ArtTable
        :loading="loading"
        :data="list"
        :columns="columns"
        :pagination="pagination"
        :pagination-options="{ layout: 'total, prev, pager, next' }"
        :show-table-header="false"
        row-key="id"
        @pagination:current-change="load"
      >
        <template #version="{ row }">
          v{{ row.version }}
          <ElTag v-if="row.current" size="small" type="success" class="nvd-tag">生效中</ElTag>
        </template>
        <template #operation="{ row }">
          <ArtOperation :list="operationsFor(row)" :data="row" />
        </template>
      </ArtTable>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { EditPen, Promotion, View } from '@element-plus/icons-vue'
  import { ListChainNodeVersion, SwitchChainNodeVersion } from '@/api/cron/chain/api'
  import type { ChainNodeInfo, ChainNodeVersion } from '@/api/cron/chain/type'
  import { useTableColumns } from '@/composables/useTableColumns'
  import { formatTs } from '../utils/format'

  // 插件版本列表抽屉（节点插件页"版本"操作打开）：所属插件可基于某版本开发、设为生效；其他应用只读查看
  defineOptions({ name: 'NodeVersionDrawer' })

  const props = defineProps<{ modelValue: boolean; node?: ChainNodeInfo }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    /** 基于该版本开发（非所属插件为只读查看） */
    develop: [version: ChainNodeVersion]
    /** 切换了生效版本 */
    switched: [version: ChainNodeVersion]
  }>()

  const loading = ref(false)
  const list = ref<ChainNodeVersion[]>([])
  const pagination = reactive({ current: 1, size: 20, total: 0 })

  const { columns } = useTableColumns<ChainNodeVersion>(() => [
    { prop: 'version', label: '版本', width: 120, useSlot: true, slotName: 'version' },
    {
      prop: 'type',
      label: '类型',
      width: 80,
      formatter: (row: ChainNodeVersion) => (row.type === 'script' ? '脚本' : 'API')
    },
    { prop: 'remark', label: '版本备注', minWidth: 160, showOverflowTooltip: true },
    {
      prop: 'createdAt',
      label: '创建时间',
      width: 170,
      formatter: (row: ChainNodeVersion) => formatTs(row.createdAt)
    },
    { prop: 'operation', label: '操作', fixed: 'right' as const, width: 100, useSlot: true, slotName: 'operation' }
  ])

  async function load(page: number) {
    if (!props.node) return
    pagination.current = page
    loading.value = true
    try {
      const res = await ListChainNodeVersion({ nodeId: props.node.id, page, pageSize: pagination.size })
      list.value = res?.list || []
      pagination.total = res?.total || 0
    } finally {
      loading.value = false
    }
  }

  /** 所属插件：开发、设为生效（非生效版本）；其他应用：查看 */
  function operationsFor(row: ChainNodeVersion) {
    const owned = !!props.node?.owned
    return [
      {
        icon: owned ? EditPen : View,
        label: owned ? '开发' : '查看',
        color: 'primary',
        click: () => {
          emit('update:modelValue', false)
          emit('develop', row)
        }
      },
      {
        icon: Promotion,
        label: '设为生效',
        color: 'success',
        hide: !owned || row.current,
        permission: 'cron:chain_node_version:switch',
        click: () => switchVersion(row)
      }
    ].filter((o) => !o.hide)
  }

  async function switchVersion(row: ChainNodeVersion) {
    if (!props.node) return
    try {
      await ElMessageBox.confirm(
        `将 v${row.version} 设为生效版本？已有流程固定引用各自的版本，不受影响；编辑器会提示可升级。`,
        '切换生效版本',
        { type: 'warning' }
      )
    } catch {
      return
    }
    await SwitchChainNodeVersion({ nodeId: props.node.id, versionId: row.id })
    ElMessage.success('已切换生效版本')
    emit('switched', row)
    load(pagination.current)
  }
</script>

<style scoped lang="scss">
  .nvd-table {
    height: 100%;
  }

  .nvd-tag {
    margin-left: 4px;
  }
</style>
