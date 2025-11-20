<template>
  <div class="art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      ref="searchBarRef"
      v-model="searchForm"
      :card="true"
      :items="searchItems"
      @search="handleSearch"
      @reset="resetSearchParams"
    >
    </ArtSearchBar>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton
              v-permission="'manager:dept:role:add'"
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
        <template #operation="{ row }">
          <ArtOperation :list="operationItems" :data="row"></ArtOperation>
        </template>
      </ArtTable>

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
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus } from '@element-plus/icons-vue'
  import { Delete } from '@element-plus/icons-vue'
  import { ListCurrentRole } from '@/api/manager/role/api'
  import { CreateDeptRole, DeleteDeptRole, ListDeptRole } from '@/api/manager/deptrole/api'
  import { CreateDeptRoleRequest, Role } from '@/api/manager/deptrole/type'

  defineOptions({ name: 'DeptRole' })

  const router = useRouter()
  const deptId = Number(router.currentRoute.value.query.deptId)

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)

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
    }
  ]

  const roles = ref<Role[]>([])
  ListCurrentRole().then((res) => {
    roles.value = res.list
  })

  const currentData = ref<Partial<CreateDeptRoleRequest>>({})
  const formItems = computed(() => [
    {
      key: 'roleId',
      label: '绑定角色',
      type: 'treeselect',
      props: {
        placeholder: '请选择绑定的角色',
        checkStrictly: true,
        data: roles.value,
        props: {
          value: 'id',
          label: 'name'
        },
        rules: [{ required: true, message: '请选择绑定的角色', trigger: ['blur', 'change'] }]
      }
    }
  ])

  const operationItems = [
    {
      icon: Delete,
      popConfirm: true,
      label: '删除角色',
      color: 'danger',
      permission: 'manager:dept:role:delete',
      click: async (record: Role) => {
        await DeleteDeptRole({ deptId: deptId, roleId: record.id })
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
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListDeptRole,
      apiParams: {
        page: 1,
        pageSize: 10,
        deptId: deptId,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          type: 'index',
          width: '60',
          label: '#'
        },
        {
          prop: 'keyword',
          label: '角色标识'
        },
        {
          prop: 'name',
          label: '角色名称'
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
  const showDialog = (type: Form.DialogType): void => {
    dialogType.value = type
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = currentData.value
    await CreateDeptRole({ ...value, deptId: deptId } as CreateDeptRoleRequest)
    ElMessage.success('创建成功')
    refreshCreate()
    dialogVisible.value = false
  }
</script>
