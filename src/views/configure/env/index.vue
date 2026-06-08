<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar v-model="searchForm" :card="false" :items="searchItems" @search="handleSearch" @reset="resetSearchParams" />
      </div>
      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElButton v-permission="'configure:env:add'" v-ripple type="primary" :icon="Plus" @click="showDialog('add')">
              新增环境
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
              :disabled="!$hasPermission('configure:env:update')"
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

      <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增环境' : '编辑环境'" :destroy-on-close="true" body-class="art-form-dialog" width="480px" align-center>
        <ArtForm v-model="currentData" :items="formItems" :span="24" @cancel="dialogVisible = false" @submit="handleSubmit" />
      </ElDialog>

      <ElDialog v-model="tokenVisible" title="环境密钥" width="480px" align-center>
        <ElInput v-model="currentToken" readonly>
          <template #append>
            <ElButton @click="handleCopyToken">复制</ElButton>
          </template>
        </ElInput>
        <template #footer>
          <ElButton @click="tokenVisible = false">关闭</ElButton>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus, Edit, Delete, Key, Refresh } from '@element-plus/icons-vue'
  import { ListEnv, CreateEnv, UpdateEnv, DeleteEnv, GetEnvToken, ResetEnvToken } from '@/api/configure/env/api'
  import { Env, CreateEnvRequest, UpdateEnvRequest } from '@/api/configure/env/type'
  import { formatTime } from '@/utils/time'
  import { useClipboard } from '@vueuse/core'

  defineOptions({ name: 'ConfigureEnv' })

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Env>>({})
  const tokenVisible = ref(false)
  const currentToken = ref('')

  const { copy } = useClipboard()

  const searchForm = ref({ keyword: undefined, name: undefined, status: undefined })

  const searchItems = [
    { label: '环境标识', key: 'keyword', type: 'input', props: { placeholder: '请输入环境标识', clearable: true } },
    { label: '环境名称', key: 'name', type: 'input', props: { placeholder: '请输入环境名称', clearable: true } },
    {
      label: '环境状态',
      key: 'status',
      type: 'select',
      props: { placeholder: '请选择环境状态', clearable: true, options: [{ label: '启用', value: true }, { label: '禁用', value: false }] }
    }
  ]

  const formItems = [
    { key: 'name', label: '环境名称', type: 'input', props: { placeholder: '请输入环境名称', rules: [{ required: true, message: '请输入环境名称', trigger: ['blur', 'change'] }] } },
    { key: 'keyword', label: '环境标识', type: 'input', props: { placeholder: '请输入环境标识', rules: [{ required: true, message: '请输入环境标识', trigger: ['blur', 'change'] }] } },
    { key: 'description', label: '环境描述', type: 'input', props: { placeholder: '请输入环境描述', type: 'textarea' } }
  ]

  const operationItems = [
    {
      icon: Key,
      label: '获取密钥',
      color: 'primary',
      permission: 'configure:env:token:query',
      click: async (row: Env) => {
        const res = await GetEnvToken(row.id)
        currentToken.value = res.token
        tokenVisible.value = true
      }
    },
    {
      icon: Refresh,
      label: '重置密钥',
      color: 'warning',
      permission: 'configure:env:token:reset',
      click: async (row: Env) => {
        await ElMessageBox.confirm('确认要重置此环境的密钥？重置后旧密钥将立即失效。', '提示', { type: 'warning' })
        const res = await ResetEnvToken(row.id)
        currentToken.value = res.token
        tokenVisible.value = true
        ElMessage.success('重置成功')
      }
    },
    {
      icon: Edit,
      label: '修改',
      color: 'warning',
      permission: 'configure:env:update',
      click: (row: Env) => showDialog('edit', row)
    },
    {
      icon: Delete,
      label: '删除',
      color: 'danger',
      popConfirm: true,
      permission: 'configure:env:delete',
      click: async (row: Env) => {
        await DeleteEnv({ id: row.id })
        refreshRemove()
      }
    }
  ]

  const { columns, columnChecks, data, loading, pagination, searchParams, getData, resetSearchParams, handleSizeChange, handleCurrentChange, refreshData, refreshCreate, refreshUpdate, refreshRemove } =
    useTable({
      core: {
        apiFn: ListEnv,
        apiParams: { page: 1, pageSize: 10, ...searchForm.value },
        columnsFactory: () => [
          { type: 'index', width: '60', label: '#' },
          { prop: 'keyword', label: '环境标识' },
          { prop: 'name', label: '环境名称' },
          { prop: 'status', label: '环境状态', useSlot: true, slotName: 'status' },
          { prop: 'description', label: '环境描述' },
          { prop: 'createdAt', label: '创建时间', formatter: (row: Env) => formatTime(row.createdAt) },
          { prop: 'updatedAt', label: '更新时间', formatter: (row: Env) => formatTime(row.updatedAt) },
          { prop: 'operation', label: '操作', fixed: 'right', useSlot: true, slotName: 'operation' }
        ]
      }
    })

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: Form.DialogType, row?: Env) => {
    dialogType.value = type
    currentData.value = row ? { ...row } : {}
    nextTick(() => { dialogVisible.value = true })
  }

  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateEnv(currentData.value as CreateEnvRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateEnv(currentData.value as UpdateEnvRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (row: Env): (() => Promise<boolean>) => {
    return () =>
      new Promise((resolve) => {
        ElMessageBox.confirm(`确认要${row.status ? '禁用' : '启用'}此环境？`, '提示', { type: 'warning' })
          .then(async () => {
            await UpdateEnv({ id: row.id, status: !row.status })
            ElMessage.success('操作成功')
            refreshUpdate()
            resolve(true)
          })
          .catch(() => resolve(false))
      })
  }

  const handleCopyToken = () => {
    copy(currentToken.value)
    ElMessage.success('复制成功')
  }
</script>
