<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar v-model="searchForm" :card="false" :items="searchItems" @search="handleSearch" @reset="handleReset" />
      </div>
      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElButton v-permission="'configure:business:add'" v-ripple type="primary" :icon="Plus" :disabled="!searchForm.serverId" @click="showDialog('add')">
              新增变量
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
          <template #type="{ row }">
            {{ variableTypes[row.type] || row.type }}
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增变量' : '编辑变量'" :destroy-on-close="true" body-class="art-form-dialog" width="480px" align-center>
        <ArtForm v-model="currentData" :items="formItems" :span="24" @cancel="dialogVisible = false" @submit="handleSubmit" />
      </ElDialog>

      <!-- 值配置抽屉 -->
      <ElDrawer v-model="valueVisible" title="变量值配置" size="420px" :destroy-on-close="true">
        <ElForm label-position="top">
          <ElFormItem v-for="env in envs" :key="env.id" :label="`${env.name}(${env.keyword})`">
            <ElInputNumber v-if="currentBusiness.type === 'int'" v-model="valueForm[env.id]" :precision="0" style="width:100%" />
            <ElInputNumber v-else-if="currentBusiness.type === 'float'" v-model="valueForm[env.id]" style="width:100%" />
            <ElSwitch v-else-if="currentBusiness.type === 'bool'" v-model="valueForm[env.id]" active-text="是" inactive-text="否" />
            <ElInput v-else v-model="valueForm[env.id]" :type="currentBusiness.type === 'object' ? 'textarea' : 'text'" :rows="4" placeholder="请输入变量值" />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="valueVisible = false">取消</ElButton>
          <ElButton v-permission="'configure:business:value:update'" type="primary" @click="handleValueSubmit">保存</ElButton>
        </template>
      </ElDrawer>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus, Edit, Delete, Setting } from '@element-plus/icons-vue'
  import { ListBusiness, CreateBusiness, UpdateBusiness, DeleteBusiness, ListBusinessValue, UpdateBusinessValue } from '@/api/configure/business/api'
  import { ListEnv } from '@/api/configure/env/api'
  import { Business, CreateBusinessRequest, UpdateBusinessRequest } from '@/api/configure/business/type'
  import { Env } from '@/api/configure/env/type'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'ConfigureBusiness' })

  const variableTypes: Record<string, string> = { int: '整数', float: '浮点数', string: '字符串', bool: '布尔值', object: '对象' }

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Business>>({})
  const valueVisible = ref(false)
  const currentBusiness = ref<Business>({} as Business)
  const valueForm = ref<Record<number, any>>({})
  const envs = ref<Env[]>([])

  const searchForm = ref<{ keyword?: string; serverId?: number }>({ keyword: undefined, serverId: undefined })

  const searchItems = computed(() => [
    {
      label: '所属服务',
      key: 'serverId',
      type: 'select',
      props: {
        placeholder: '请选择所属服务',
        clearable: true,
        options: serverOptions.value
      }
    },
    { label: '变量标识', key: 'keyword', type: 'input', props: { placeholder: '请输入变量标识', clearable: true } }
  ])

  const serverOptions = ref<{ label: string; value: number }[]>([])

  const formItems = computed(() => [
    {
      key: 'keyword',
      label: '变量标识',
      type: 'input',
      props: { placeholder: '请输入变量标识', rules: [{ required: true, message: '请输入变量标识', trigger: ['blur', 'change'] }] }
    },
    {
      key: 'type',
      label: '变量类型',
      type: 'select',
      props: {
        placeholder: '请选择变量类型',
        options: Object.entries(variableTypes).map(([value, label]) => ({ label, value })),
        rules: [{ required: true, message: '请选择变量类型', trigger: ['blur', 'change'] }]
      }
    },
    { key: 'description', label: '变量描述', type: 'input', props: { placeholder: '请输入变量描述', type: 'textarea' } }
  ])

  const operationItems = [
    {
      icon: Setting,
      label: '值配置',
      color: 'primary',
      permission: 'configure:business:value:query',
      click: async (row: Business) => {
        currentBusiness.value = row
        valueForm.value = {}
        const res = await ListBusinessValue({ businessId: row.id })
        res.list.forEach((item) => {
          let val: any = item.value
          if (row.type === 'int') val = parseInt(item.value)
          else if (row.type === 'float') val = parseFloat(item.value)
          else if (row.type === 'bool') val = item.value === 'true'
          valueForm.value[item.envId] = val
        })
        valueVisible.value = true
      }
    },
    {
      icon: Edit,
      label: '修改',
      color: 'warning',
      permission: 'configure:business:update',
      click: (row: Business) => showDialog('edit', row)
    },
    {
      icon: Delete,
      label: '删除',
      color: 'danger',
      popConfirm: true,
      permission: 'configure:business:delete',
      click: async (row: Business) => {
        await DeleteBusiness({ id: row.id })
        refreshRemove()
      }
    }
  ]

  const { columns, columnChecks, data, loading, pagination, searchParams, getData, resetSearchParams, handleSizeChange, handleCurrentChange, refreshData, refreshCreate, refreshUpdate, refreshRemove } =
    useTable({
      core: {
        apiFn: ListBusiness,
        apiParams: { page: 1, pageSize: 10, serverId: 0 },
        columnsFactory: () => [
          { type: 'index', width: '60', label: '#' },
          { prop: 'keyword', label: '变量标识' },
          { prop: 'type', label: '变量类型', useSlot: true, slotName: 'type' },
          { prop: 'description', label: '变量描述' },
          { prop: 'createdAt', label: '创建时间', formatter: (row: Business) => formatTime(row.createdAt) },
          { prop: 'updatedAt', label: '更新时间', formatter: (row: Business) => formatTime(row.updatedAt) },
          { prop: 'operation', label: '操作', fixed: 'right', useSlot: true, slotName: 'operation' }
        ]
      }
    })

  const loadInitData = async () => {
    const [serverRes, envRes] = await Promise.all([
      import('@/api/configure/server/api').then(m => m.ListServer({ page: 1, pageSize: 100 })),
      ListEnv({ status: true })
    ])
    serverOptions.value = serverRes.list.map((s: any) => ({ label: s.name, value: s.id }))
    envs.value = envRes.list
  }
  loadInitData()

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value, serverId: searchForm.value.serverId || 0 })
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
    Object.assign(searchParams, { serverId: 0 })
  }

  const showDialog = (type: Form.DialogType, row?: Business) => {
    dialogType.value = type
    currentData.value = row ? { ...row } : { serverId: searchForm.value.serverId }
    nextTick(() => { dialogVisible.value = true })
  }

  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateBusiness(currentData.value as CreateBusinessRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateBusiness(currentData.value as UpdateBusinessRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleValueSubmit = async () => {
    const list = envs.value.map((env) => ({ envId: env.id, value: String(valueForm.value[env.id] ?? '') }))
    await UpdateBusinessValue({ businessId: currentBusiness.value.id, list })
    ElMessage.success('设置成功')
    valueVisible.value = false
  }
</script>
