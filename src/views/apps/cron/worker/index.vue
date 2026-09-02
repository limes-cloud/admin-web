<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar v-model="searchForm" :card="false" :items="searchItems" @search="handleSearch" @reset="resetSearchParams" />
      </div>
      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElButton v-permission="'cron:worker:add'" v-ripple type="primary" :icon="Plus" @click="showDialog('add')">
              新增节点
            </ElButton>
          </template>
        </ArtTableHeader>
        <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination" row-key="id"
          @pagination:size-change="handleSizeChange" @pagination:current-change="handleCurrentChange">
          <template #status="{ row }">
            <el-switch v-model="row.status" :disabled="!$hasPermission('cron:worker:update')" inline-prompt
              active-text="在线" inactive-text="离线" :before-change="handleUpdateStatus(row)" />
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增节点' : '编辑节点'" :destroy-on-close="true" body-class="art-form-dialog" width="520px" align-center>
        <ArtForm v-model="currentData" :items="formItems" :span="24" @cancel="dialogVisible = false" @submit="handleSubmit" />
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus, Edit, Delete } from '@element-plus/icons-vue'
  import { ListWorker, CreateWorker, UpdateWorker, UpdateWorkerStatus, DeleteWorker, ListWorkerGroup } from '@/api/cron/worker/api'
  import { Worker, CreateWorkerRequest, UpdateWorkerRequest } from '@/api/cron/worker/type'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'CronWorker' })

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Worker>>({})
  const groupOptions = ref<{ label: string; value: number }[]>([])

  const searchForm = ref({ name: undefined, ip: undefined, groupId: undefined, status: undefined })
  const searchItems = computed(() => [
    { label: '节点名称', key: 'name', type: 'input', props: { placeholder: '请输入节点名称', clearable: true } },
    { label: '节点IP', key: 'ip', type: 'input', props: { placeholder: '请输入节点IP', clearable: true } },
    { label: '所属分组', key: 'groupId', type: 'select', props: { placeholder: '请选择分组', clearable: true, options: groupOptions.value } },
    { label: '节点状态', key: 'status', type: 'select', props: { placeholder: '请选择状态', clearable: true, options: [{ label: '在线', value: true }, { label: '离线', value: false }] } }
  ])

  const formItems = computed(() => [
    { key: 'name', label: '节点名称', type: 'input', props: { placeholder: '请输入节点名称', rules: [{ required: true, message: '请输入节点名称', trigger: ['blur', 'change'] }] } },
    { key: 'ip', label: '节点IP', type: 'input', props: { placeholder: '请输入节点IP', disabled: dialogType.value === 'edit' && currentData.value.status, rules: [{ required: true, message: '请输入节点IP', trigger: ['blur', 'change'] }] } },
    { key: 'groupId', label: '所属分组', type: 'select', props: { placeholder: '请选择所属分组', options: groupOptions.value, rules: [{ required: true, message: '请选择所属分组', trigger: ['blur', 'change'] }] } },
    { key: 'ak', label: 'Access Key', type: 'input', props: { placeholder: '请输入AK', disabled: dialogType.value === 'edit' && currentData.value.status, rules: [{ required: true, message: '请输入AK', trigger: ['blur', 'change'] }] } },
    { key: 'sk', label: 'Secret Key', type: 'input', props: { placeholder: '请输入SK', disabled: dialogType.value === 'edit' && currentData.value.status, rules: [{ required: true, message: '请输入SK', trigger: ['blur', 'change'] }] } },
    { key: 'description', label: '节点描述', type: 'input', props: { placeholder: '请输入节点描述', type: 'textarea' } }
  ])

  const operationItems = [
    { icon: Edit, label: '修改', color: 'warning', permission: 'cron:worker:update', click: (row: Worker) => showDialog('edit', row) },
    {
      icon: Delete, label: '删除', color: 'danger', popConfirm: true, permission: 'cron:worker:delete',
      click: async (row: Worker) => { await DeleteWorker({ id: row.id }); refreshRemove() }
    }
  ]

  const { columns, columnChecks, data, loading, pagination, searchParams, getData, resetSearchParams, handleSizeChange, handleCurrentChange, refreshData, refreshCreate, refreshUpdate, refreshRemove } =
    useTable({
      core: {
        apiFn: ListWorker,
        apiParams: { page: 1, pageSize: 10, ...searchForm.value },
        columnsFactory: () => [
          { type: 'index', width: '60', label: '#' },
          { prop: 'name', label: '节点名称' },
          { prop: 'ip', label: '节点IP' },
          { prop: 'ak', label: 'Access Key' },
          { prop: 'status', label: '节点状态', useSlot: true, slotName: 'status' },
          { prop: 'description', label: '节点描述' },
          { prop: 'createdAt', label: '创建时间', formatter: (row: Worker) => formatTime(row.createdAt) },
          { prop: 'operation', label: '操作', fixed: 'right', useSlot: true, slotName: 'operation' }
        ]
      }
    })

  const loadGroups = async () => {
    const res = await ListWorkerGroup({ page: 1, pageSize: 100 })
    groupOptions.value = res.list.map(g => ({ label: g.name, value: g.id }))
  }
  loadGroups()

  const handleSearch = () => { Object.assign(searchParams, { ...searchForm.value }); getData() }

  const showDialog = (type: Form.DialogType, row?: Worker) => {
    dialogType.value = type
    currentData.value = row ? { ...row } : {}
    nextTick(() => { dialogVisible.value = true })
  }

  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateWorker(currentData.value as CreateWorkerRequest)
      ElMessage.success('创建成功'); refreshCreate()
    } else {
      await UpdateWorker(currentData.value as UpdateWorkerRequest)
      ElMessage.success('修改成功'); refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (row: Worker): (() => Promise<boolean>) => {
    return () => new Promise((resolve) => {
      ElMessageBox.confirm(`确认要${row.status ? '下线' : '上线'}此节点？`, '提示', { type: 'warning' })
        .then(async () => {
          await UpdateWorkerStatus({ id: row.id, status: !row.status })
          ElMessage.success('操作成功'); refreshUpdate(); resolve(true)
        })
        .catch(() => resolve(false))
    })
  }
</script>
