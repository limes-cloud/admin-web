<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtBack></ArtBack>
      <!-- 搜索栏 -->
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
        <!-- 表格头部 -->
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton
                v-permission="'manager:tenantapp:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
              >
                新增套餐
              </ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>
        <!-- 表格 -->
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #logo="{ row }">
            <ElAvatar shape="square" :size="60" :src="$rurl(row.app.logo)"></ElAvatar>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加应用' : '编辑应用'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="420px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="24"
          :show-button="false"
          @submit="handleSubmit"
          @cancel="dialogVisible = false"
        ></ArtForm>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import {
    CreateTenantApp,
    DeleteTenantApp,
    GetTenantApp,
    ListTenantApp,
    UpdateTenantApp
  } from '@/api/manager/tenantapp/api'
  import { CreateTenantAppRequest, TenantApp, UpdateTenantAppRequest } from '@/api/manager/tenantapp/type'
  import { Delete } from '@element-plus/icons-vue'
  import { ElTag } from 'element-plus'
  import { formatTime, parseTime } from '@/utils/time'
  import { ListApp } from '@/api/manager/app/api'
  import { App } from '@/api/manager/app/type'
  import { ListMenu } from '@/api/manager/menu/api'
  import { Menu } from '@/api/manager/menu/type'

  defineOptions({ name: 'TenantApp' })
  const router = useRouter()
  const tenantId = Number(router.currentRoute.value.query.tenantId)
  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<TenantApp>>({})
  console.log(router.currentRoute.value)
  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined
  })

  const searchItems = [
    {
      label: '应用标识',
      key: 'appKeyword',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入应用标识', clearable: true }
    },
    {
      label: '应用名称',
      key: 'appName',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入应用名称', clearable: true }
    }
  ]

  const apps = ref<App[]>([])

  const searchApp = async (query?: string) => {
    const data = await ListApp({ page: 1, pageSize: 10, name: query })
    apps.value = data.list
  }
  searchApp()

  const menus = ref<Menu[]>([])
  const getMenus = async (appId: number) => {
    const data = await ListMenu({ appId: appId })

    // 递归去除菜单中type=BA的节点,返回新的节点树
    const removeBase = (list: Menu[]) => {
      return list
        .map((item) => {
          if (item.type === 'BA') {
            return null
          }
          item.children = removeBase(item.children || [])
          return item
        })
        .filter((item) => {
          return item !== null
        })
    }

    // 递归去除菜单中type=G的节点且无children数据,返回新的节点树
    const removeEmptyGroup = (list: Menu[]) => {
      return list
        .map((item) => {
          if (item.type === 'G' && !item.children?.length) {
            return null
          }
          item.children = removeEmptyGroup(item.children || [])
          return item
        })
        .filter((item) => {
          return item !== null
        })
    }

    let list = removeBase(data.list)
    list = removeEmptyGroup(list)
    menus.value = list
  }

  const formItems = computed(() => [
    {
      key: 'appId',
      label: '开通应用',
      type: 'select',
      props: {
        placeholder: '请选择开通应用',
        options: apps.value,
        props: {
          label: 'name',
          value: 'id'
        },
        onChange: async (id: number) => {
          await getMenus(id)
        },
        rules: [{ required: true, message: '请选择开通应用', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'expiredAt',
      label: '到期时间',
      type: 'date',
      props: {
        placeholder: '请选择到期时间',
        valueFormat: 'X',
        style: { width: '100%' },
        rules: [{ required: true, message: '请选择到期时间', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.enableNotice',
      label: '到期提醒',
      type: 'select',
      defaultValue: false,
      props: {
        placeholder: '请选择是否开启到期提醒',
        options: [
          { label: '开启', value: true },
          { label: '关闭', value: false }
        ],
        style: { width: '100%' },
        rules: [{ required: true, message: '请选择是否开启到期提醒', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.noticeEmail',
      label: '通知邮箱',
      type: 'input',
      hidden: !currentData.value.setting?.enableNotice,
      props: {
        placeholder: '请输入通知邮箱',
        rules: [
          { required: true, message: '请输入通知邮箱', trigger: ['blur', 'change'] },
          { type: 'email', message: '邮箱格式错误', trigger: ['blur', 'change'] }
        ]
      }
    },
    {
      key: 'menuIds',
      label: '应用菜单',
      type: 'treeselect',
      props: {
        placeholder: '请选择应用菜单',
        data: menus.value,
        showCheckbox: true,
        multiple: true,
        nodeKey: 'id',
        currentNodeKey: 'id',
        collapseTags: true,
        defaultCheckedKeys: currentData.value.menuIds || [],
        props: {
          label: 'title',
          value: 'id'
        },
        rules: [{ required: true, message: '请选择应用菜单', trigger: ['blur', 'change'] }]
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改套餐',
      color: 'warning',
      permission: 'manager:tenantapp:update',
      click: async (record: TenantApp) => {
        // 查询详细应用信息
        const detail = await GetTenantApp({ tenantId: record.tenantId, appId: record.appId })
        await getMenus(record.appId)
        showDialog('edit', detail)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除套餐',
      color: 'danger',
      permission: 'manager:tenantapp:delete',
      click: async (record: TenantApp) => {
        await DeleteTenantApp({ id: record.id })
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
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListTenantApp,
      apiParams: {
        page: 1,
        pageSize: 10,
        tenantId: tenantId,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          type: 'index',
          width: '60',
          label: '#'
        },
        {
          prop: 'logo',
          label: '应用Logo',
          useSlot: true,
          slotName: 'logo'
        },
        {
          prop: 'app.keyword',
          label: '应用标识'
        },
        {
          prop: 'app.name',
          label: '应用名称'
        },
        {
          prop: 'expiredAt',
          label: '过期时间',
          formatter: (row: TenantApp) => parseTime(row.expiredAt, '{y}-{m}-{d}')
        },
        {
          prop: 'setting.enableNotice',
          label: '到期提醒',
          formatter: (row: TenantApp) =>
            h(ElTag, { type: row.setting?.enableNotice ? 'success' : 'info' }, () =>
              row.setting?.enableNotice ? '开启' : '关闭'
            )
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: TenantApp) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: TenantApp) => formatTime(row.updatedAt)
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
    }
  })

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = async (type: Form.DialogType, row?: TenantApp) => {
    dialogType.value = type
    currentData.value = row || { tenantId: tenantId }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = { ...currentData.value }
    value.expiredAt = Number(value.expiredAt)
    if (dialogType.value === 'add') {
      await CreateTenantApp(value as CreateTenantAppRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateTenantApp(value as UpdateTenantAppRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }
</script>
