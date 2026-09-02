<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ElAlert
        class="configure-guide"
        type="primary"
        title="配置项用于按应用划分模板命名空间，选择应用后可新增配置项并进入模板配置。"
        :closable="false"
        show-icon
      />

      <div class="search">
        <ArtSearchBar
          ref="searchBarRef"
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="resetSearchParams"
        >
        </ArtSearchBar>
      </div>

      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="handleRefresh">
          <template #left>
            <ElSpace wrap>
              <ElButton
                v-permission="'configure:template:namespace:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                :disabled="!searchForm.app"
                @click="showDialog('add')"
              >
                新增配置项
              </ElButton>
            </ElSpace>
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
          <template #description="{ row }">
            {{ row.description || '-' }}
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增配置项' : '编辑配置项'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="520px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="24"
          :show-button="false"
          @cancel="dialogVisible = false"
          @submit="handleSubmit"
        ></ArtForm>
      </ElDialog>

      <ElDialog
        v-model="configureVisible"
        fullscreen
        destroy-on-close
        :title="configureTitle"
        :body-style="configureBodyStyle"
        @closed="activeNamespace = undefined"
      >
        <ConfigureEditor
          v-if="activeNamespace"
          :initial-app="activeNamespace.app"
          :initial-namespace="activeNamespace.namespace"
        />
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus, Edit, Delete, Setting } from '@element-plus/icons-vue'
  import { ListApp } from '@/api/manager/app/api'
  import {
    CreateTemplateNamespace,
    DeleteTemplateNamespace,
    ListTemplateNamespace,
    UpdateTemplateNamespace
  } from '@/api/configure/template/api'
  import {
    CreateTemplateNamespaceRequest,
    ListTemplateNamespaceRequest,
    TemplateNamespace,
    UpdateTemplateNamespaceRequest
  } from '@/api/configure/template/type'
  import { formatTime } from '@/utils/time'
  import ConfigureEditor from './configure/index.vue'

  defineOptions({ name: 'ConfigureTemplate' })

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<TemplateNamespace>>({})
  const configureVisible = ref(false)
  const activeNamespace = ref<TemplateNamespace>()
  const appOptions = ref<{ label: string; value: string }[]>([])
  const appNameMap = ref<Record<string, string>>({})
  const searchBarRef = ref()
  const searchForm = ref<{ app?: string; namespace?: string; name?: string }>({
    app: undefined,
    namespace: undefined,
    name: undefined
  })

  const configureBodyStyle = {
    height: 'calc(100vh - 56px)',
    padding: '12px',
    backgroundColor: 'var(--art-main-bg-color)'
  }

  const configureTitle = computed(() => {
    if (!activeNamespace.value) return '配置模板'
    const appName = appNameMap.value[activeNamespace.value.app] || activeNamespace.value.app
    return `${appName} / ${activeNamespace.value.name}`
  })

  const searchItems = computed(() => [
    {
      label: '所属应用',
      key: 'app',
      type: 'select',
      props: {
        placeholder: '请选择所属应用',
        clearable: true,
        filterable: true,
        remote: true,
        remoteMethod: loadApps,
        onChange: handleAppChange,
        options: appOptions.value
      }
    },
    {
      label: '配置项标识',
      key: 'namespace',
      type: 'input',
      props: { maxlength: '64', placeholder: '请输入配置项标识', clearable: true }
    },
    {
      label: '配置项名称',
      key: 'name',
      type: 'input',
      props: { maxlength: '64', placeholder: '请输入配置项名称', clearable: true }
    }
  ])

  const formItems = computed(() => [
    {
      key: 'name',
      label: '配置项名称',
      type: 'input',
      props: {
        placeholder: '请输入配置项名称',
        rules: [{ required: true, message: '请输入配置项名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'namespace',
      label: '配置项标识',
      type: 'input',
      props: {
        placeholder: '请输入配置项标识',
        rules: [{ required: true, message: '请输入配置项标识', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'sort',
      label: '排序',
      type: 'input-number',
      props: {
        min: 0,
        max: 999999,
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'description',
      label: '描述',
      type: 'input',
      props: { placeholder: '请输入描述', type: 'textarea' }
    }
  ])

  const toAppOptions = (list: Awaited<ReturnType<typeof ListApp>>['list']) => {
    list.forEach((item) => {
      appNameMap.value[item.keyword] = item.name
    })
    return list.map((item) => ({ label: `${item.name}（${item.keyword}）`, value: item.keyword }))
  }

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

  const listNamespaceTable = async (params: ListTemplateNamespaceRequest) => {
    if (!params.app) return { list: [], total: 0 }
    return ListTemplateNamespace(params)
  }

  const operationItems = [
    {
      icon: Setting,
      label: '配置模板',
      color: 'primary',
      permission: 'configure:template:query',
      click: (row: TemplateNamespace) => {
        activeNamespace.value = row
        configureVisible.value = true
      }
    },
    {
      icon: Edit,
      label: '修改配置项',
      color: 'warning',
      permission: 'configure:template:namespace:update',
      click: (row: TemplateNamespace) => showDialog('edit', row)
    },
    {
      icon: Delete,
      label: '删除配置项',
      color: 'danger',
      popConfirm: true,
      permission: 'configure:template:namespace:delete',
      click: async (row: TemplateNamespace) => {
        await DeleteTemplateNamespace({ id: row.id })
        ElMessage.success('删除成功')
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
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: listNamespaceTable,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      immediate: false,
      columnsFactory: () => [
        { type: 'index', width: '60', label: '#' },
        { prop: 'name', label: '配置项名称', minWidth: 160 },
        { prop: 'namespace', label: '配置项标识', minWidth: 160 },
        { prop: 'description', label: '描述', minWidth: 220, useSlot: true, slotName: 'description' },
        { prop: 'sort', label: '排序', width: 90 },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: TemplateNamespace) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: TemplateNamespace) => formatTime(row.updatedAt)
        },
        { prop: 'operation', label: '操作', width: 120, fixed: 'right', useSlot: true, slotName: 'operation' }
      ]
    }
  })

  const handleSearch = () => {
    if (!searchForm.value.app) {
      clearData()
      return
    }
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const handleAppChange = () => {
    handleSearch()
  }

  const handleRefresh = () => refreshData()

  const showDialog = (type: Form.DialogType, row?: TemplateNamespace) => {
    if (!searchForm.value.app) {
      ElMessage.error('请先选择应用')
      return
    }
    dialogType.value = type
    currentData.value = row ? { ...row } : { app: searchForm.value.app, sort: 0 }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleSubmit = async () => {
    const payload = {
      namespace: currentData.value.namespace?.trim(),
      name: currentData.value.name?.trim(),
      description: currentData.value.description?.trim(),
      sort: currentData.value.sort || 0
    }
    if (dialogType.value === 'add') {
      await CreateTemplateNamespace({ app: searchForm.value.app, ...payload } as CreateTemplateNamespaceRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateTemplateNamespace({ id: currentData.value.id, ...payload } as UpdateTemplateNamespaceRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  loadApps()
</script>

<style scoped>
  .configure-guide {
    margin-bottom: 12px;
  }
</style>
