<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="table">
        <ArtTableHeader :loading="loading" layout="refresh,fullscreen" @refresh="loadGroups">
          <template #left>
            <ElButton
              v-permission="'manager:app:group:add'"
              v-ripple
              type="primary"
              :icon="Plus"
              @click="showDialog('add')"
            >
              新增分组
            </ElButton>
          </template>
        </ArtTableHeader>

        <ArtTable :loading="loading" :data="data" :columns="columns" :show-pagination="false" row-key="id">
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增应用分组' : '编辑应用分组'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="420px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="24"
          @cancel="dialogVisible = false"
          @submit="handleSubmit"
        />
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { Delete, Edit, Plus } from '@element-plus/icons-vue'
  import { CreateAppGroup, DeleteAppGroup, ListAppGroup, UpdateAppGroup } from '@/api/manager/app/api'
  import type { AppGroup, CreateAppGroupRequest, UpdateAppGroupRequest } from '@/api/manager/app/type'
  import type { ColumnOption } from '@/types/component'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'AppGroup' })

  const loading = ref(false)
  const data = ref<AppGroup[]>([])
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<AppGroup>>({})

  const columns: ColumnOption<AppGroup>[] = [
    { type: 'index', width: '60', label: '#' },
    { prop: 'name', label: '分组名称' },
    { prop: 'sort', label: '排序', width: 100 },
    {
      prop: 'createdAt',
      label: '创建时间',
      formatter: (row: AppGroup) => formatTime(row.createdAt)
    },
    {
      prop: 'updatedAt',
      label: '修改时间',
      formatter: (row: AppGroup) => formatTime(row.updatedAt)
    },
    {
      prop: 'operation',
      label: '操作',
      width: 120,
      fixed: 'right',
      useSlot: true,
      slotName: 'operation'
    }
  ]

  const formItems = computed(() => [
    {
      key: 'name',
      label: '分组名称',
      type: 'input',
      props: {
        maxlength: 32,
        showWordLimit: true,
        placeholder: '请输入分组名称',
        rules: [{ required: true, message: '请输入分组名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'sort',
      label: '分组排序',
      type: 'number',
      defaultValue: 0,
      tip: '数值越小越靠前',
      props: {
        placeholder: '请输入分组排序',
        min: 0,
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入分组排序', trigger: ['blur', 'change'] }]
      }
    }
  ])

  const loadGroups = async () => {
    loading.value = true
    try {
      const res = await ListAppGroup()
      data.value = res.list || []
    } finally {
      loading.value = false
    }
  }

  const showDialog = (type: Form.DialogType, row?: AppGroup) => {
    dialogType.value = type
    const maxSort = data.value.reduce((max, item) => Math.max(max, item.sort || 0), 0)
    currentData.value = row ? { ...row } : { name: '', sort: maxSort + 10 }
    dialogVisible.value = true
  }

  const handleSubmit = async () => {
    const name = String(currentData.value.name || '').trim()
    const sort = Number(currentData.value.sort) || 0
    if (dialogType.value === 'add') {
      await CreateAppGroup({ name, sort } as CreateAppGroupRequest)
      ElMessage.success('创建成功')
    } else {
      await UpdateAppGroup({ id: Number(currentData.value.id), name, sort } as UpdateAppGroupRequest)
      ElMessage.success('修改成功')
    }
    dialogVisible.value = false
    await loadGroups()
  }

  const operationItems = [
    {
      icon: Edit,
      label: '修改分组',
      color: 'warning',
      permission: 'manager:app:group:update',
      click: (row: AppGroup) => showDialog('edit', row)
    },
    {
      icon: Delete,
      label: '删除分组',
      color: 'danger',
      popConfirm: true,
      permission: 'manager:app:group:delete',
      click: async (row: AppGroup) => {
        await DeleteAppGroup({ id: row.id })
        await loadGroups()
      }
    }
  ]

  onMounted(loadGroups)
</script>
