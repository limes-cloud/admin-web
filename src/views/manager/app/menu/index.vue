<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtBack></ArtBack>

      <div class="search">
        <!-- 搜索栏 -->
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
                v-permission="'manager:menu:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
              >
                新增菜单
              </ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :stripe="false"
          :show-pagination="false"
          row-key="id"
        >
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加菜单' : '编辑菜单'"
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
        ></ArtForm>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import { CreateMenu, DeleteMenu, ListMenu, UpdateMenu } from '@/api/manager/menu/api'
  import { CreateMenuRequest, Menu, UpdateMenuRequest } from '@/api/manager/menu/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { arrayToMap } from '@/utils/constants/transform'
  import { ElTag } from 'element-plus/es'

  defineOptions({ name: 'UMenu' })

  const router = useRouter()
  const app = router.currentRoute.value.query.app as string

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Menu>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  // 菜单类型
  const menuTypes = [
    {
      label: '菜单',
      value: 'M',
      color: 'primary'
    },
    {
      label: '接口',
      value: 'A',
      color: 'warning'
    },
    {
      label: '接口组',
      value: 'G',
      color: 'success'
    },
    {
      label: '基础接口',
      value: 'BA',
      color: 'info'
    }
  ]
  const menuTypeMaps = arrayToMap(menuTypes, 'value')

  const searchItems = [
    {
      label: '菜单标识',
      key: 'keyword',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入菜单标识', clearable: true }
    },
    {
      label: '菜单名称',
      key: 'title',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入菜单名称', clearable: true }
    }
  ]

  // 表格相关
  const {
    columns,
    columnChecks,
    data,
    loading,
    searchParams,
    getData,
    resetSearchParams,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListMenu,
      apiParams: {
        app: app,
        ...searchForm.value
      },
      excludeParams: ['page', 'pageSize'],
      columnsFactory: () => [
        {
          prop: 'title',
          label: '菜单名称'
        },
        {
          prop: 'type',
          label: '菜单类型',
          formatter: (row: Menu) => {
            return h(ElTag, { type: menuTypeMaps.get(row.type)?.color }, () => {
              if (row.type == 'A' || row.type == 'BA') {
                return menuTypeMaps.get(row.type)?.label + ' | ' + row.method
              }
              return menuTypeMaps.get(row.type)?.label
            })
          }
        },
        {
          prop: 'path',
          label: '菜单路由',
          formatter: (row: Menu) => {
            return row.type === 'M' ? row.path : row.api
          }
        },
        {
          prop: 'permission',
          label: '权限标识'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Menu) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Menu) => formatTime(row.updatedAt)
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

  const formItems = computed(() => [
    {
      key: 'parentId',
      label: '上级菜单',
      type: 'treeselect',
      props: {
        placeholder: '请选择上级菜单',
        checkStrictly: true,
        rules: [{ required: true, message: '请选择上级菜单', trigger: ['blur', 'change'] }],
        data: [{ title: '顶级菜单', id: 0, children: data.value }],
        props: { value: 'id', label: 'title' }
      }
    },
    {
      key: 'title',
      label: '菜单名称',
      type: 'input',
      props: {
        placeholder: '请输入菜单名称',
        rules: [{ required: true, message: '请输入菜单名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'weight',
      label: '菜单权重',
      type: 'number',
      props: {
        placeholder: '请输入菜单权重',
        defaultValue: 0,
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入菜单权重', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'type',
      label: '菜单类型',
      type: 'select',
      props: {
        placeholder: '请选择菜单类型',
        checkStrictly: true,
        rules: [{ required: true, message: '请选择菜单类型', trigger: ['blur', 'change'] }],
        options: menuTypes
      }
    },
    {
      key: 'keyword',
      label: '菜单标识',
      type: 'input',
      hidden: currentData.value.type !== 'M',
      props: {
        placeholder: '请输入菜单标识',
        rules: [
          { required: true, message: '请输入菜单标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '菜单标识格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
        ]
      }
    },
    {
      key: 'icon',
      label: '菜单图标',
      type: 'icon',
      hidden: currentData.value.type !== 'M',
      props: {
        rules: [{ required: true, message: '请选择图标LOGO', trigger: ['blur', 'change'] }],
        width: '100% !important'
      }
    },
    {
      key: 'path',
      label: '菜单路由',
      type: 'input',
      hidden: currentData.value.type !== 'M',
      props: {
        placeholder: '请输入菜单路由',
        rules: [{ required: true, message: '请输入菜单路由', trigger: ['blur', 'change'] }]
      }
    },
    // {
    //   key: '_type',
    //   label: '菜单类型',
    //   type: 'select',
    //   placeholder: '请输入菜单类型',
    //   hidden: currentData.value.type !== 'M',
    //   props: {
    //     options: [
    //       { label: '组件', value: 1 },
    //       { label: '外链', value: 2 },
    //       { label: '重定向', value: 3 }
    //     ],
    //     rules: [{ required: true, message: '请输入菜单路由', trigger: ['blur', 'change'] }]
    //   }
    // },
    {
      key: 'component',
      label: '组件路径',
      type: 'input',
      hidden: currentData.value.type !== 'M',
      props: {
        placeholder: '请输入组件路径'
      }
    },
    {
      key: 'redirect',
      label: '重定向',
      type: 'input',
      hidden: currentData.value.type !== 'M',
      props: {
        placeholder: '请输入重定向地址'
      }
    },
    {
      key: 'url',
      label: '外部链接',
      type: 'input',
      hidden: currentData.value.type !== 'M',
      props: {
        placeholder: '请输入外部链接地址'
      }
    },
    {
      key: 'isIframe',
      label: '是否内嵌',
      type: 'radiogroup',
      hidden: currentData.value.type !== 'M',
      props: {
        defaultValue: false,
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    },
    {
      key: 'isHidden',
      label: '是否隐藏',
      type: 'radiogroup',
      hidden: currentData.value.type !== 'M',
      props: {
        defaultValue: false,
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    },
    {
      key: 'isCache',
      label: '是否缓存',
      type: 'radiogroup',
      hidden: currentData.value.type !== 'M',
      props: {
        defaultValue: false,
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    },
    {
      key: 'isAffix',
      label: '是否标签',
      type: 'radiogroup',
      hidden: currentData.value.type !== 'M',
      props: {
        defaultValue: false,
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    },
    {
      key: 'isHome',
      label: '是否首页',
      type: 'radiogroup',
      hidden: currentData.value.type !== 'M',
      props: {
        defaultValue: false,
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    },
    {
      key: 'method',
      label: '请求方法',
      type: 'radiogroup',
      hidden: currentData.value.type !== 'A' && currentData.value.type !== 'BA',
      props: {
        rules: [{ required: true, message: '请选择请求方法', trigger: ['blur', 'change'] }],
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' }
        ]
      }
    },
    {
      key: 'api',
      label: '接口路径',
      type: 'input',
      hidden: currentData.value.type !== 'A' && currentData.value.type !== 'BA',
      props: {
        rules: [{ required: true, message: '请输入接口路径', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'permission',
      label: '权限指令',
      type: 'input',
      hidden: currentData.value.type !== 'A' && currentData.value.type !== 'G',
      props: {}
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改菜单',
      color: 'warning',
      permission: 'manager:menu:update',
      click: async (record: Menu) => {
        const value = { ...record }
        value.children = []
        // 查询详细菜单信息
        showDialog('edit', value)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除菜单',
      color: 'danger',
      permission: 'manager:menu:delete',
      click: async (record: Menu) => {
        await DeleteMenu({ id: record.id })
        refreshRemove()
      }
    }
  ]

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: Menu): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = { ...currentData.value }
    if (dialogType.value === 'add') {
      await CreateMenu({ ...value, app } as CreateMenuRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateMenu({ ...value, app } as UpdateMenuRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }
</script>
