<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
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
                v-permission="'manager:app:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
              >
                新增应用
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
          <template #status="{ row }">
            <el-tooltip effect="dark" :content="row.status ? '已启用' : row.reason" placement="top-start">
              <el-switch
                v-model="row.status"
                :disabled="!$hasPermission('manager:app:update')"
                inline-prompt
                active-text="启用"
                inactive-text="禁用"
                :before-change="handleUpdateStatus(row)"
              />
            </el-tooltip>
          </template>
          <template #logo="{ row }">
            <ElAvatar shape="square" :size="60" :src="$rurl(row.logo)"></ElAvatar>
          </template>
          <template #favicon="{ row }">
            <ElAvatar shape="square" :size="60" :src="$rurl(row.favicon)"></ElAvatar>
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
          @cancel="dialogVisible = false"
          @submit="handleSubmit"
        ></ArtForm>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElMessageBox } from 'element-plus'
  import { Edit, Fold, Plus } from '@element-plus/icons-vue'
  import { CreateApp, DeleteApp, GetApp, ListApp, UpdateApp } from '@/api/manager/app/api'
  import { CreateAppRequest, App, UpdateAppRequest } from '@/api/manager/app/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  const router = useRouter()

  defineOptions({ name: 'App' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<App>>({})

  const appTypes = [
    { label: '基础设施', value: 'base' },
    { label: '标准应用', value: 'app' }
  ]

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '应用标识',
      key: 'keyword',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入应用标识', clearable: true }
    },
    {
      label: '应用名称',
      key: 'name',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入应用名称', clearable: true }
    },
    {
      label: '应用状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择应用状态',
        clearable: true,
        options: [
          { label: '正常', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ]

  const formItems = computed(() => [
    {
      key: 'type',
      label: '应用类型',
      type: 'select',
      props: {
        placeholder: '请选择应用类型',
        options: appTypes,
        rules: [{ required: true, message: '请选择应用类型', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'keyword',
      label: '应用标识',
      type: 'input',
      props: {
        placeholder: '请输入应用标识',
        disabled: dialogType.value === 'edit',
        rules: [
          { required: true, message: '请输入应用标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '应用标识格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
        ]
      }
    },
    {
      key: 'name',
      label: '应用名称',
      type: 'input',
      props: {
        placeholder: '请输入应用名称',
        rules: [{ required: true, message: '请输入应用名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'logo',
      label: '应用logo',
      type: 'upload',
      props: {
        accept: 'image/*',
        rules: [{ required: true, message: '请上传应用logo', trigger: ['blur', 'change'] }],
        directoryPath: 'manager/app/logo'
      }
    },
    {
      key: 'favicon',
      label: '应用图标',
      type: 'upload',
      hidden: currentData.value.type === 'base',
      props: {
        accept: '.ico',
        rules: [{ required: true, message: '请上传应用图标', trigger: ['blur', 'change'] }],
        directoryPath: 'manager/app/logo'
      }
    },
    {
      key: 'secret',
      label: '应用密钥',
      type: 'input',
      hidden: currentData.value.type === 'base',
      props: {
        placeholder: '请输入应用密钥',
        rules: [{ required: true, message: '请输入应用密钥', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'private',
      label: '允许注册',
      type: 'select',
      placeholder: '请选择是否允许注册',
      hidden: currentData.value.type === 'base',
      props: {
        rules: [{ required: true, message: '请选择是否允许注册', trigger: ['blur', 'change'] }],
        options: [
          { label: '允许', value: true },
          { label: '禁止', value: false }
        ]
      }
    },
    {
      key: 'description',
      label: '应用描述',
      type: 'input',
      props: {
        placeholder: '请输入应用描述',
        rules: [{ required: true, message: '请输入应用描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    },
    {
      key: 'comment',
      label: '应用备注',
      type: 'input',
      props: {
        placeholder: '请输入应用备注',
        rules: [{ required: true, message: '请输入应用备注', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    },
    {
      key: 'setting.tenant.mode',
      label: '租户模式',
      type: 'select',
      divider: '租户配置',
      hidden: currentData.value.type === 'base',
      tip: '应用于登陆界面的租户项，输入则需要用户主动输入，选择则会提供选择项',
      props: {
        placeholder: '请选择租户模式',
        options: [
          { label: '输入', value: 'input' },
          { label: '选择', value: 'select' }
        ],
        rules: [{ required: true, message: '请输入授权密钥', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.jwt.secret',
      label: '授权密钥',
      type: 'input',
      divider: '授权配置',
      hidden: currentData.value.type === 'base',
      props: {
        placeholder: '请输入授权密钥 ',
        rules: [{ required: true, message: '请输入授权密钥', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.jwt.expire',
      label: '过期时间',
      type: 'number',
      hidden: currentData.value.type === 'base',
      defaultValue: 3600,
      props: {
        placeholder: '请输入过期时间(秒)',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入过期时间(秒)', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.jwt.renewal',
      label: '续期时间',
      type: 'number',
      hidden: currentData.value.type === 'base',
      defaultValue: 3600,
      props: {
        placeholder: '请输入续期时间(秒)',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入续期时间(秒)', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.jwt.uniqueDevice',
      label: '唯一设备',
      type: 'select',
      hidden: currentData.value.type === 'base',
      props: {
        placeholder: '请选择是否开启唯一设备',
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ],
        rules: [{ required: true, message: '请选择是否开启唯一设备', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.jwt.uniquePlatform',
      label: '唯一平台',
      type: 'select',
      hidden: currentData.value.type === 'base',
      props: {
        placeholder: '请选择是否开启唯一平台',
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ],
        rules: [{ required: true, message: '请选择是否开启唯一平台', trigger: ['blur', 'change'] }]
      }
    }
  ])

  const operationItems = [
    {
      icon: 'iconsys-ziyuan1',
      label: '实体管理',
      color: 'primary',
      permission: 'manager:entity:query',
      click: async (record: App) => {
        router.push({
          name: 'Entity',
          query: {
            appId: record.id
          }
        })
      }
    },
    {
      icon: 'iconsys-shaixuan',
      label: '规则管理',
      color: 'primary',
      permission: 'manager:entityrule:query',
      click: async (record: App) => {
        router.push({
          name: 'EntityRule',
          query: {
            appId: record.id
          }
        })
      }
    },
    {
      icon: 'iconsys-jilu',
      label: '字段管理',
      color: 'primary',
      permission: 'manager:appfield:query',
      click: async (record: App) => {
        router.push({
          name: 'AppField',
          query: {
            appId: record.id
          }
        })
      }
    },
    {
      icon: 'iconsys-anquan_2',
      label: '授权管理',
      color: 'primary',
      permission: 'manager:appoauther:query',
      click: async (record: App) => {
        router.push({
          name: 'AppOAuther',
          query: {
            appId: record.id
          }
        })
      }
    },
    {
      icon: Fold,
      label: '菜单管理',
      color: 'primary',
      permission: 'manager:menu:query',
      click: async (record: App) => {
        router.push({
          name: 'Menu',
          query: {
            appId: record.id
          }
        })
      }
    },
    {
      icon: Edit,
      label: '修改应用',
      color: 'warning',
      permission: 'manager:app:update',
      click: async (record: App) => {
        // 查询详细应用信息
        const detail = await GetApp({ id: record.id })
        showDialog('edit', detail)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除应用',
      color: 'danger',
      permission: 'manager:app:delete',
      click: async (record: App) => {
        await DeleteApp({ id: record.id })
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
      apiFn: ListApp,
      apiParams: {
        page: 1,
        pageSize: 10,
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
          prop: 'keyword',
          label: '应用标识'
        },
        {
          prop: 'name',
          label: '应用名称'
        },
        {
          prop: 'status',
          label: '应用状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'comment',
          label: '应用备注'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: App) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: App) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: App): void => {
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
      await CreateApp(value as CreateAppRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateApp(value as UpdateAppRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: App): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        if (item.status) {
          ElMessageBox.prompt('请输入禁用原因', '温馨提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValidator: (value) => value.length > 5,
            inputErrorMessage: '原因不能少于5个字符'
          })
            .then(async ({ value }) => {
              await UpdateApp({ id: item.id, status: !item.status, reason: value })
              ElMessage.success('禁用成功')
              refreshUpdate()
              resolve(true)
            })
            .catch(() => {
              resolve(false)
            })
        } else {
          ElMessageBox.confirm('您确定修改应用状态？', '温馨提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(async () => {
              await UpdateApp({ id: item.id, status: !item.status, reason: '' })
              ElMessage.success('启用成功')
              refreshUpdate()
              resolve(true)
            })
            .catch(() => {
              resolve(false)
            })
        }
      })
    }
  }
</script>
