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
                v-permission="'manager:role:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增角色</ElButton
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
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #status="{ row }">
            <el-switch
              v-model="row.status"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
              :before-change="handleUpdateStatus(row)"
            />
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加角色' : '编辑角色'"
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
    <Menu ref="menu"></Menu>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElMessageBox } from 'element-plus'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import { CreateRole, DeleteRole, ListCurrentRole, UpdateRole } from '@/api/manager/role/api'
  import { CreateRoleRequest, Role, UpdateRoleRequest } from '@/api/manager/role/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import Menu from './menu/index.vue'

  const router = useRouter()

  defineOptions({ name: 'Role' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Role>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '角色标识',
      key: 'keyword',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入角色标识', clearable: true }
    },
    {
      label: '角色名称',
      key: 'name',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入角色名称', clearable: true }
    },
    {
      label: '角色状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择角色状态',
        clearable: true,
        options: [
          { label: '正常', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ]

  const menu = useTemplateRef('menu')

  const operationItems = [
    {
      icon: 'iconsys-gengduo3',
      label: '菜单权限',
      color: 'primary',
      permission: 'manager:role:menu:query',
      click: async (record: Role) => {
        currentData.value = record
        menu.value?.show(record.id)
      }
    },
    {
      icon: 'iconsys-jifen_2',
      label: '数据权限',
      color: 'primary',
      permission: 'manager:role:entity:query',
      click: async (record: Role) => {
        router.push({ name: 'RoleEntity', query: { roleId: record.id } })
        // showDialog('add', { parent: record, parentId: record.id } as Role)
      }
    },
    {
      icon: Plus,
      label: '新建角色',
      color: 'primary',
      permission: 'manager:role:add',
      click: async (record: Role) => {
        showDialog('add', { parent: record, parentId: record.id } as Role)
      }
    },
    {
      icon: Edit,
      label: '修改角色',
      color: 'warning',
      permission: 'manager:role:update',
      click: async (record: Role) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除角色',
      color: 'danger',
      permission: 'manager:role:delete',
      click: async (record: Role) => {
        await DeleteRole({ id: record.id })
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
      apiFn: ListCurrentRole,
      apiParams: {
        ...searchForm.value
      },
      excludeParams: ['page', 'pageSize'],
      columnsFactory: () => [
        {
          prop: 'keyword',
          label: '角色标识'
        },
        {
          prop: 'name',
          label: '角色名称'
        },
        {
          prop: 'status',
          label: '角色状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'description',
          label: '角色描述'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Role) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Role) => formatTime(row.updatedAt)
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
      label: '上级角色',
      type: 'treeselect',
      props: {
        data: [{ id: 0, name: '顶级角色', children: data.value }],
        checkStrictly: true,
        props: {
          label: 'name',
          value: 'id'
        },
        rules: [{ required: true, message: '请选择上级角色', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'keyword',
      label: '角色标识',
      type: 'input',
      props: {
        placeholder: '请输入角色标识',
        disabled: dialogType.value === 'edit',
        rules: [
          { required: true, message: '请输入角色标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '角色标识格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
        ]
      }
    },
    {
      key: 'name',
      label: '角色名称',
      type: 'input',
      props: {
        placeholder: '请输入角色名称',
        rules: [{ required: true, message: '请输入角色名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '角色描述',
      type: 'input',
      props: {
        placeholder: '请输入角色描述',
        rules: [{ required: true, message: '请输入角色描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    }
  ])

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: Role): void => {
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
      await CreateRole(value as CreateRoleRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateRole(value as UpdateRoleRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: Role): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改角色状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateRole({ id: item.id, status: !item.status })
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
