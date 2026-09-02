<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar v-model="searchForm" :card="false" :items="searchItems" @search="handleSearch" @reset="resetSearchParams" />
      </div>
      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElButton v-permission="'cron:task_group:add'" v-ripple type="primary" :icon="Plus" @click="showDialog('add')">
              新增分组
            </ElButton>
          </template>
        </ArtTableHeader>
        <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination" row-key="id"
          @pagination:size-change="handleSizeChange" @pagination:current-change="handleCurrentChange">
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>
      <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增分组' : '编辑分组'" :destroy-on-close="true" body-class="art-form-dialog" width="480px" align-center>
        <ArtForm v-model="currentData" :items="formItems" :span="24" @cancel="dialogVisible = false" @submit="handleSubmit" />
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus, Edit, Delete } from '@element-plus/icons-vue'
  import { ListTaskGroup, CreateTaskGroup, UpdateTaskGroup, DeleteTaskGroup } from '@/api/cron/task/api'
  import { TaskGroup, CreateTaskGroupRequest, UpdateTaskGroupRequest } from '@/api/cron/task/type'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'CronTaskGroup' })

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<TaskGroup>>({})

  const searchForm = ref({ name: undefined })
  const searchItems = [
    { label: '分组名称', key: 'name', type: 'input', props: { placeholder: '请输入分组名称', clearable: true } }
  ]

  const formItems = [
    { key: 'name', label: '分组名称', type: 'input', props: { placeholder: '请输入分组名称', rules: [{ required: true, message: '请输入分组名称', trigger: ['blur', 'change'] }] } },
    { key: 'description', label: '分组描述', type: 'input', props: { placeholder: '请输入分组描述', type: 'textarea' } }
  ]

  const operationItems = [
    { icon: Edit, label: '修改', color: 'warning', permission: 'cron:task_group:update', click: (row: TaskGroup) => showDialog('edit', row) },
    {
      icon: Delete, label: '删除', color: 'danger', popConfirm: true, permission: 'cron:task_group:delete',
      click: async (row: TaskGroup) => { await DeleteTaskGroup({ id: row.id }); refreshRemove() }
    }
  ]

  const { columns, columnChecks, data, loading, pagination, searchParams, getData, resetSearchParams, handleSizeChange, handleCurrentChange, refreshData, refreshCreate, refreshUpdate, refreshRemove } =
    useTable({
      core: {
        apiFn: ListTaskGroup,
        apiParams: { page: 1, pageSize: 10, ...searchForm.value },
        columnsFactory: () => [
          { type: 'index', width: '60', label: '#' },
          { prop: 'name', label: '分组名称' },
          { prop: 'description', label: '分组描述' },
          { prop: 'createdAt', label: '创建时间', formatter: (row: TaskGroup) => formatTime(row.createdAt) },
          { prop: 'operation', label: '操作', fixed: 'right', useSlot: true, slotName: 'operation' }
        ]
      }
    })

  const handleSearch = () => { Object.assign(searchParams, { ...searchForm.value }); getData() }

  const showDialog = (type: Form.DialogType, row?: TaskGroup) => {
    dialogType.value = type
    currentData.value = row ? { ...row } : {}
    nextTick(() => { dialogVisible.value = true })
  }

  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateTaskGroup(currentData.value as CreateTaskGroupRequest)
      ElMessage.success('创建成功'); refreshCreate()
    } else {
      await UpdateTaskGroup(currentData.value as UpdateTaskGroupRequest)
      ElMessage.success('修改成功'); refreshUpdate()
    }
    dialogVisible.value = false
  }
</script>
