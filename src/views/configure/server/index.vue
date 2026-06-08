<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar v-model="searchForm" :card="false" :items="searchItems" @search="handleSearch" @reset="resetSearchParams" />
      </div>
      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElButton v-permission="'configure:server:add'" v-ripple type="primary" :icon="Plus" @click="showDialog('add')">
              新增服务
            </ElButton>
          </template>
        </ArtTableHeader>
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #status="{ row }">
            <el-switch
              v-model="row.status"
              :disabled="!$hasPermission('configure:server:update')"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
              :before-change="handleUpdateStatus(row)"
            />
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增服务' : '编辑服务'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="480px"
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
  import { useTable } from '@/composables/useTable'
  import { Plus, Edit, Delete } from '@element-plus/icons-vue'
  import { ListServer, CreateServer, UpdateServer, DeleteServer } from '@/api/configure/server/api'
  import { Server, CreateServerRequest, UpdateServerRequest } from '@/api/configure/server/type'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'ConfigureServer' })

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Server>>({})

  const searchForm = ref({ keyword: undefined, name: undefined, status: undefined })

  const searchItems = [
    { label: '服务标识', key: 'keyword', type: 'input', props: { placeholder: '请输入服务标识', clearable: true } },
    { label: '服务名称', key: 'name', type: 'input', props: { placeholder: '请输入服务名称', clearable: true } },
    {
      label: '服务状态',
      key: 'status',
      type: 'select',
      props: { placeholder: '请选择服务状态', clearable: true, options: [{ label: '启用', value: true }, { label: '禁用', value: false }] }
    }
  ]

  const formItems = [
    { key: 'name', label: '服务名称', type: 'input', props: { placeholder: '请输入服务名称', rules: [{ required: true, message: '请输入服务名称', trigger: ['blur', 'change'] }] } },
    { key: 'keyword', label: '服务标识', type: 'input', props: { placeholder: '请输入服务标识', rules: [{ required: true, message: '请输入服务标识', trigger: ['blur', 'change'] }] } },
    { key: 'description', label: '服务描述', type: 'input', props: { placeholder: '请输入服务描述', type: 'textarea', rules: [{ required: true, message: '请输入服务描述', trigger: ['blur', 'change'] }] } }
  ]

  const operationItems = [
    {
      icon: Edit,
      label: '修改',
      color: 'warning',
      permission: 'configure:server:update',
      click: (row: Server) => showDialog('edit', row)
    },
    {
      icon: Delete,
      label: '删除',
      color: 'danger',
      popConfirm: true,
      permission: 'configure:server:delete',
      click: async (row: Server) => {
        await DeleteServer({ id: row.id })
        refreshRemove()
      }
    }
  ]

  const { columns, columnChecks, data, loading, pagination, searchParams, getData, resetSearchParams, handleSizeChange, handleCurrentChange, refreshData, refreshCreate, refreshUpdate, refreshRemove } =
    useTable({
      core: {
        apiFn: ListServer,
        apiParams: { page: 1, pageSize: 10, ...searchForm.value },
        columnsFactory: () => [
          { type: 'index', width: '60', label: '#' },
          { prop: 'keyword', label: '服务标识' },
          { prop: 'name', label: '服务名称' },
          { prop: 'status', label: '服务状态', useSlot: true, slotName: 'status' },
          { prop: 'description', label: '服务描述' },
          { prop: 'createdAt', label: '创建时间', formatter: (row: Server) => formatTime(row.createdAt) },
          { prop: 'updatedAt', label: '更新时间', formatter: (row: Server) => formatTime(row.updatedAt) },
          { prop: 'operation', label: '操作', fixed: 'right', useSlot: true, slotName: 'operation' }
        ]
      }
    })

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: Form.DialogType, row?: Server) => {
    dialogType.value = type
    currentData.value = row ? { ...row } : {}
    nextTick(() => { dialogVisible.value = true })
  }

  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateServer(currentData.value as CreateServerRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateServer(currentData.value as UpdateServerRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (row: Server): (() => Promise<boolean>) => {
    return () =>
      new Promise((resolve) => {
        ElMessageBox.confirm(`确认要${row.status ? '禁用' : '启用'}此服务？`, '提示', { type: 'warning' })
          .then(async () => {
            await UpdateServer({ id: row.id, status: !row.status })
            ElMessage.success('操作成功')
            refreshUpdate()
            resolve(true)
          })
          .catch(() => resolve(false))
      })
  }
</script>
