<template>
  <ElDrawer
    :model-value="modelValue"
    title="插件分组"
    size="720px"
    @update:model-value="emit('update:modelValue', $event)"
    @open="refresh"
  >
    <div class="ngd-bar">
      <ElInput
        v-model="keyword"
        placeholder="搜索分组名称"
        clearable
        class="ngd-search"
        @keyup.enter="refresh"
        @clear="refresh"
      />
      <ElButton
        v-if="isManager"
        v-permission="'cron:chain_node_group:add'"
        type="primary"
        :icon="Plus"
        @click="showDialog('add')"
      >
        新增分组
      </ElButton>
      <span v-else class="ngd-tip">插件分组全平台共用，由 manager 维护</span>
    </div>

    <!-- 统一表格组件；抽屉内没有 ArtTableHeader，高度由外层容器决定 -->
    <div class="ngd-table">
      <ArtTable :loading="loading" :data="list" :columns="columns" :show-table-header="false" row-key="id">
        <template #operation="{ row }">
          <ArtOperation :list="operationItems" :data="row" />
        </template>
      </ArtTable>
    </div>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增分组' : '修改分组'"
      width="480px"
      append-to-body
      destroy-on-close
      align-center
    >
      <ElForm ref="formRef" :model="currentData" label-width="auto">
        <ElFormItem
          label="分组名称"
          prop="name"
          :rules="[{ required: true, message: '请输入分组名称', trigger: 'blur' }]"
        >
          <ElInput v-model="currentData.name" maxlength="32" placeholder="如 AI、文件、通知" />
        </ElFormItem>
        <ElFormItem label="分组排序" prop="weight">
          <ElInputNumber v-model="currentData.weight" :min="0" :max="9999" controls-position="right" />
          <div class="ngd-desc">数值越大越靠前（节点面板与下拉中的顺序）</div>
        </ElFormItem>
        <ElFormItem label="分组描述" prop="description">
          <ElInput v-model="currentData.description" type="textarea" :rows="3" maxlength="255" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { nextTick, ref } from 'vue'
  import type { FormInstance } from 'element-plus'
  import { Delete, Edit, Plus } from '@element-plus/icons-vue'
  import {
    CreateChainNodeGroup,
    DeleteChainNodeGroup,
    ListChainNodeGroup,
    UpdateChainNodeGroup
  } from '@/api/cron/chain/api'
  import type { ChainNodeGroupInfo } from '@/api/cron/chain/type'
  import { getAppKeyword } from '@/utils/app-context'
  import { useTableColumns } from '@/composables/useTableColumns'

  // 插件分组管理抽屉（节点插件页内打开）：全平台共用一套，只有 manager 能新增、修改、删除，其他应用只读
  defineOptions({ name: 'NodeGroupDrawer' })

  defineProps<{ modelValue: boolean }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    /** 分组有增删改：插件页刷新分组下拉 */
    changed: []
  }>()

  const isManager = getAppKeyword() === 'manager'

  const loading = ref(false)
  const keyword = ref('')
  const list = ref<ChainNodeGroupInfo[]>([])

  // 非 manager 只读，不显示操作列
  const { columns } = useTableColumns<ChainNodeGroupInfo>(() => [
    { prop: 'name', label: '分组名称', minWidth: 140 },
    { prop: 'weight', label: '分组排序', width: 90 },
    { prop: 'nodeCount', label: '插件数量', width: 90 },
    { prop: 'description', label: '分组描述', minWidth: 160, showOverflowTooltip: true },
    ...(isManager
      ? [
          {
            prop: 'operation',
            label: '操作',
            fixed: 'right' as const,
            width: 120,
            useSlot: true,
            slotName: 'operation'
          }
        ]
      : [])
  ])

  /** 分组数量少，不分页，一次取全部 */
  async function refresh() {
    loading.value = true
    try {
      const res = await ListChainNodeGroup({ name: keyword.value.trim() || undefined })
      list.value = res.list || []
    } finally {
      loading.value = false
    }
  }

  const operationItems = [
    {
      icon: Edit,
      label: '修改',
      color: 'warning',
      permission: 'cron:chain_node_group:update',
      click: (row: ChainNodeGroupInfo) => showDialog('edit', row)
    },
    {
      icon: Delete,
      label: '删除',
      color: 'danger',
      popConfirm: true,
      popTitle: '分组下还有插件时不能删除。确定删除？',
      permission: 'cron:chain_node_group:delete',
      click: async (row: ChainNodeGroupInfo) => {
        await DeleteChainNodeGroup({ id: row.id })
        ElMessage.success('删除成功')
        refresh()
        emit('changed')
      }
    }
  ]

  // ---------- 新增 / 修改 ----------

  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const submitting = ref(false)
  const formRef = ref<FormInstance>()
  const currentData = ref<Partial<ChainNodeGroupInfo>>({})

  function showDialog(type: 'add' | 'edit', row?: ChainNodeGroupInfo) {
    dialogType.value = type
    currentData.value = row ? { ...row } : { weight: 0 }
    nextTick(() => (dialogVisible.value = true))
  }

  async function handleSubmit() {
    if (!(await formRef.value?.validate().catch(() => false))) return
    submitting.value = true
    try {
      const d = currentData.value
      const payload = { name: d.name!.trim(), description: d.description || undefined, weight: d.weight || 0 }
      if (dialogType.value === 'add') await CreateChainNodeGroup(payload)
      else await UpdateChainNodeGroup({ id: d.id!, ...payload })
      ElMessage.success(dialogType.value === 'add' ? '创建成功' : '修改成功')
      dialogVisible.value = false
      refresh()
      emit('changed')
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss">
  .ngd-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
  }

  .ngd-table {
    height: calc(100% - 44px);
  }

  .ngd-search {
    width: 220px;
  }

  .ngd-tip {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .ngd-desc {
    width: 100%;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }
</style>
