<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ElAlert
        class="configure-guide"
        type="primary"
        title="业务变量用于维护某个服务自身的业务配置，只作用于当前选择的应用和环境。"
        :closable="false"
        show-icon
      />

      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="handleReset"
        />
      </div>
      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="handleRefresh">
          <template #left>
            <ElButton
              v-permission="'configure:business:add'"
              v-ripple
              type="primary"
              :icon="Plus"
              @click="showDialog('add')"
            >
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

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增变量' : '编辑变量'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="640px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="24"
          @cancel="dialogVisible = false"
          @submit="handleSubmit"
        >
          <template #extra="{ modelValue }">
            <BusinessExtraEditor v-model="modelValue.extra" :type="modelValue.type" />
          </template>
        </ArtForm>
      </ElDialog>

      <!-- 值配置抽屉 -->
      <ElDrawer v-model="valueVisible" title="变量值配置" size="420px" :destroy-on-close="true">
        <ElForm label-position="top">
          <ElFormItem v-for="env in envs" :key="env.id" :label="`${env.name}(${env.keyword})`">
            <VariableValueInput
              v-model="valueForm[env.id]"
              :type="currentBusiness.type"
              :extra="currentBusiness.extra"
            />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="valueVisible = false">取消</ElButton>
          <ElButton v-permission="'configure:business:value:update'" type="primary" @click="handleValueSubmit"
            >保存</ElButton
          >
        </template>
      </ElDrawer>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus, Edit, Delete, Setting } from '@element-plus/icons-vue'
  import {
    ListBusiness,
    CreateBusiness,
    UpdateBusiness,
    DeleteBusiness,
    ListBusinessValue,
    UpdateBusinessValue
  } from '@/api/configure/business/api'
  import { ListEnv } from '@/api/configure/env/api'
  import { ListApp } from '@/api/manager/app/api'
  import { Business, CreateBusinessRequest, UpdateBusinessRequest } from '@/api/configure/business/type'
  import { Env } from '@/api/configure/env/type'
  import { formatTime } from '@/utils/time'
  import { getAppKeyword } from '@/utils/app-context'
  import BusinessExtraEditor from './components/business-extra-editor.vue'
  import VariableValueInput from './components/variable-value-input.vue'

  defineOptions({ name: 'ConfigureBusiness' })

  const isManagerApp = getAppKeyword() === 'manager'

  const variableTypes: Record<string, string> = {
    int: '整数',
    float: '浮点数',
    string: '字符串',
    text: '长文本',
    bool: '布尔值',
    enum: '枚举',
    object: '对象',
    kv: '键值对',
    array: '数组'
  }

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Business>>({})
  const valueVisible = ref(false)
  const currentBusiness = ref<Business>({} as Business)
  const valueForm = ref<Record<number, any>>({})
  const envs = ref<Env[]>([])

  // 默认选中当前应用（AppKey），打开页面即查询；服务端对非 manager 仍强制 AppKey 兜底
  const searchForm = ref<{ keyword?: string; app?: string }>({ keyword: undefined, app: getAppKeyword() })

  const searchItems = computed(() => [
    {
      label: '所属应用',
      key: 'app',
      type: 'select',
      hidden: !isManagerApp,
      props: {
        placeholder: '请选择所属应用',
        clearable: true,
        filterable: true,
        remote: true,
        remoteMethod: loadApps,
        options: appOptions.value
      }
    },
    { label: '变量标识', key: 'keyword', type: 'input', props: { placeholder: '请输入变量标识', clearable: true } }
  ])

  const appOptions = ref<{ label: string; value: string }[]>([])

  const toAppOptions = (list: Awaited<ReturnType<typeof ListApp>>['list']) =>
    list.map((item) => ({ label: `${item.name}（${item.keyword}）`, value: item.keyword }))

  const loadApps = async (query?: string) => {
    const keyword = query?.trim()
    if (!keyword) {
      const res = await ListApp({ page: 1, pageSize: 50, status: true })
      appOptions.value = toAppOptions(res.list)
      return
    }

    const [nameRes, keywordRes] = await Promise.all([
      ListApp({ page: 1, pageSize: 50, status: true, name: keyword }),
      ListApp({ page: 1, pageSize: 50, status: true, keyword })
    ])
    const apps = [...nameRes.list, ...keywordRes.list]
    appOptions.value = toAppOptions(apps.filter((item, index) => apps.findIndex((app) => app.id === item.id) === index))
  }

  const formItems = computed(() => [
    {
      key: 'keyword',
      label: '变量标识',
      type: 'input',
      props: {
        placeholder: '请输入变量标识',
        rules: [{ required: true, message: '请输入变量标识', trigger: ['blur', 'change'] }]
      }
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
    {
      key: 'extra',
      label: '展示配置',
      type: 'custom'
    },
    {
      key: 'description',
      label: '变量描述',
      type: 'input',
      props: {
        placeholder: '请输入变量描述',
        type: 'textarea',
        rules: [{ required: true, message: '请输入变量描述', trigger: ['blur', 'change'] }]
      }
    }
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
          else if (row.type === 'array') {
            try {
              val = JSON.parse(item.value)
            } catch {
              val = []
            }
          }
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

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    getData,
    clearData,
    handleSizeChange,
    handleCurrentChange,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: ListBusiness,
      apiParams: { page: 1, pageSize: 10 },
      immediate: false,
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
    const envRes = await ListEnv({ status: true })
    await loadApps()
    envs.value = envRes.list
    // 进入页面即请求当前应用（AppKey）的业务变量
    queryBusiness()
  }
  loadInitData()

  const queryBusiness = () => {
    // app 不传时由服务端按 X-App-Key / AppKey 兜底，无需前端判断
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const handleSearch = () => {
    queryBusiness()
  }

  const handleReset = () => {
    searchForm.value = { keyword: undefined, app: getAppKeyword() }
    Object.assign(searchParams, { page: 1, pageSize: 10, keyword: undefined, app: getAppKeyword() })
    clearData()
    queryBusiness()
  }

  const handleRefresh = () => {
    queryBusiness()
  }

  const showDialog = (type: Form.DialogType, row?: Business) => {
    dialogType.value = type
    currentData.value = row ? { ...row } : { app: searchForm.value.app }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateBusiness(currentData.value as CreateBusinessRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      const { id, keyword, type, extra, description } = currentData.value
      await UpdateBusiness({ id, keyword, type, extra, description } as UpdateBusinessRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleValueSubmit = async () => {
    // array 类型序列化为 JSON 数组字符串，其余统一 String 转换
    const list = envs.value.map((env) => {
      const raw = valueForm.value[env.id]
      const value = currentBusiness.value.type === 'array' ? JSON.stringify(raw ?? []) : String(raw ?? '')
      return { envId: env.id, value }
    })
    if (list.some((item) => !item.value)) {
      ElMessage.error('请补全所有环境的变量值')
      return
    }
    await UpdateBusinessValue({ businessId: currentBusiness.value.id, list })
    ElMessage.success('设置成功')
    valueVisible.value = false
  }
</script>

<style scoped>
  .configure-guide {
    margin-bottom: 12px;
  }
</style>
