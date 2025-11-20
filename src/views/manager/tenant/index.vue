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
                v-permission="'manager:tenant:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增租户</ElButton
              >
            </ElSpace>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #status="{ row }">
            <el-switch
              v-model="row.status"
              :disabled="!$hasPermission('manager:tenant:update')"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
              :before-change="handleUpdateStatus(row)"
            />
          </template>
          <template #logo="{ row }">
            <ElAvatar shape="square" :size="60" :src="$rurl(row.logo)"></ElAvatar>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>
      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加租户' : '编辑租户'"
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
  import { ElMessageBox } from 'element-plus'
  import { Edit, Menu, Plus } from '@element-plus/icons-vue'
  import { CreateTenant, DeleteTenant, GetTenant, ListTenant, UpdateTenant } from '@/api/manager/tenant/api'
  import { CreateTenantRequest, Tenant, UpdateTenantRequest } from '@/api/manager/tenant/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'Tenant' })

  const router = useRouter()

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Tenant>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '租户标识',
      key: 'keyword',
      type: 'input',
      props: { clearable: true, placeholder: '请输入租户标识', maxlength: '32' }
    },
    {
      label: '租户名称',
      key: 'name',
      type: 'input',
      props: { clearable: true, placeholder: '请输入租户名称', maxlength: '32' }
    },
    {
      label: '租户状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择租户状态',
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
      key: 'keyword',
      label: '租户标识',
      type: 'input',
      props: {
        placeholder: '请输入租户标识',
        disabled: dialogType.value === 'edit',
        rules: [
          { required: true, message: '请输入租户标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '租户标识格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
        ]
      }
    },
    {
      key: 'name',
      label: '租户名称',
      type: 'input',
      props: {
        placeholder: '请输入租户名称',
        rules: [{ required: true, message: '请输入租户名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'logo',
      label: '租户logo',
      type: 'upload',
      props: {
        rules: [{ required: true, message: '请上传租户logo', trigger: ['blur', 'change'] }],
        directoryPath: 'manager/tenant/logo'
      }
    },
    {
      key: 'description',
      label: '租户描述',
      type: 'input',
      span: 24,
      props: {
        placeholder: '请输入租户描述',
        rules: [{ required: true, message: '请输入租户描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    },
    {
      key: 'weight',
      label: '租户权重',
      type: 'number',
      defaultValue: 0,
      props: {
        placeholder: '请输入租户权重',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入租户描述', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.defaultUserPassword',
      label: '默认密码',
      type: 'input',
      divider: '用户配置',
      props: {
        placeholder: '请输入默认用户密码',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入租户默认用户密码', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.defaultUserNickname',
      label: '默认昵称',
      type: 'input',
      props: {
        placeholder: '请输入默认用户昵称',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入租户默认用户昵称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.defaultUserAvatar',
      label: '默认头像',
      type: 'upload',
      props: {
        placeholder: '请输入默认用户头像',
        rules: [{ required: true, message: '请上传租户默认用户头像', trigger: ['blur', 'change'] }],
        directoryPath: 'manager/tenant/logo'
      }
    }
  ])

  const operationItems = [
    {
      icon: 'iconsys-shezhi_3',
      label: '管理设置',
      color: 'primary',
      permission: 'manager:tenantadmin:query',
      click: (record: Tenant) => {
        router.push({
          name: 'TenantAdmin',
          query: {
            tenantId: record.id
          }
        })
      }
    },
    {
      icon: Menu,
      label: '套餐管理',
      color: 'primary',
      permission: 'manager:tenantapp:query',
      click: (record: Tenant) => {
        router.push({
          name: 'TenantApp',
          query: {
            tenantId: record.id
          }
        })
      }
    },
    {
      icon: Edit,
      label: '修改租户',
      color: 'warning',
      permission: 'manager:tenant:update',
      click: async (record: Tenant) => {
        // 查询详细租户信息
        const detail = await GetTenant({ id: record.id })
        showDialog('edit', detail)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除租户',
      color: 'danger',
      permission: 'manager:tenant:delete',
      click: async (record: Tenant) => {
        await DeleteTenant({ id: record.id })
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
      apiFn: ListTenant,
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
          label: '租户Logo',
          useSlot: true,
          slotName: 'logo'
        },
        {
          prop: 'keyword',
          label: '租户标识'
        },
        {
          prop: 'name',
          label: '租户名称'
        },
        {
          prop: 'status',
          label: '租户状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Tenant) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Tenant) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: Tenant): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = currentData.value
    if (dialogType.value === 'add') {
      await CreateTenant(value as CreateTenantRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateTenant(value as UpdateTenantRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: Tenant): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改租户状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateTenant({ id: item.id, status: !item.status })
            ElMessage.success('修改成功')
            refreshUpdate()
            resolve(true)
          })
          .catch(() => {
            resolve(false)
          })
      })
    }
  }
</script>
