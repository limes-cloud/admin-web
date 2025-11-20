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
              <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')">新增绑定角色</ElButton>
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
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加绑定角色' : '编辑绑定角色'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="420px"
        align-center
      >
        <ArtForm
          v-model="formData"
          :items="formItems"
          :span="24"
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
  import { CreateJobRole, DeleteJobRole, ListJobRole } from '@/api/manager/jobrole/api'
  import { CreateJobRoleRequest, Role } from '@/api/manager/jobrole/type'

  defineOptions({ name: 'JobRole' })

  const router = useRouter()
  const jobId = Number(router.currentRoute.value.query.jobId)

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
      placeholder: '请输入角色标识',
      clearable: true
    },
    {
      label: '角色名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入角色名称',
      clearable: true,
      props: { maxlength: '32' }
    }
  ]

  const roles = ref<Role[]>([])
  ListCurrentRole().then((res) => {
    roles.value = res.list
  })

  const formData = ref({})
  const formItems = computed(() => [
    {
      key: 'roleId',
      label: '绑定角色',
      type: 'treeselect',
      placeholder: '请选择绑定的角色',
      props: {
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
      permission: 'manager:job:role:delete',
      click: async (record: Role) => {
        await DeleteJobRole({ jobId: jobId, roleId: record.id })
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
      apiFn: ListJobRole,
      apiParams: {
        page: 1,
        pageSize: 10,
        jobId: jobId,
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
    await CreateJobRole({ ...formData.value, jobId: jobId } as CreateJobRoleRequest)
    ElMessage.success('创建成功')
    refreshCreate()
    dialogVisible.value = false
  }
</script>
