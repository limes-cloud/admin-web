<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')">新增部门</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        row-key="id"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #logo="{ row }">
          <ElAvatar shape="square" :size="60" :src="$rurl(row.dept.logo)"></ElAvatar>
        </template>
        <template #main="{ row }">
          <el-tag v-if="row.main" type="primary">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
        <template #operation="{ row }">
          <ArtOperation :list="operationItems" :data="row"></ArtOperation>
        </template>
      </ArtTable>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加部门' : '编辑部门'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="420px"
        align-center
      >
        <ArtForm
          v-model="currentData"
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
  import { Edit, Plus } from '@element-plus/icons-vue'
  import { CreateUserDept, DeleteUserDept, ListUserDept, UpdateUserDept } from '@/api/manager/userdept/api'
  import { CreateUserDeptRequest, UpdateUserDeptRequest, UserDept } from '@/api/manager/userdept/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { Job } from '@/api/manager/job/type'
  import { ListJob } from '@/api/manager/job/api'
  import { Dept } from '@/api/manager/dept/type'
  import { ListCurrentDept } from '@/api/manager/dept/api'

  defineOptions({ name: 'UserDept' })

  const router = useRouter()
  const curUserId = Number(router.currentRoute.value.query.userId)

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<UserDept>>({})

  const depts = ref<Dept[]>([])
  ListCurrentDept().then((res) => {
    depts.value = res.list
  })

  const jobs = ref<Job[]>([])
  const getJobs = (query?: string) => {
    ListJob({ page: 1, pageSize: 10, name: query }).then((res) => {
      jobs.value = res.list
    })
  }
  getJobs()

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const formItems = computed(() => [
    {
      key: 'deptId',
      label: '所属部门',
      type: 'treeselect',
      placeholder: '请选择所属部门',
      clearable: true,
      props: {
        rules: [{ required: true, message: '请选择所属部门', trigger: ['blur', 'change'] }],
        data: depts,
        checkStrictly: true,
        props: {
          label: 'name',
          value: 'id'
        }
      }
    },
    {
      key: 'jobId',
      label: '所属职位',
      type: 'select',
      placeholder: '请选择所属职位',
      clearable: true,
      props: {
        rules: [{ required: true, message: '请选择所属职位', trigger: ['blur', 'change'] }],
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getJobs(query)
          } else {
            getJobs()
          }
        },
        options: jobs,
        props: {
          label: 'name',
          value: 'id'
        }
      }
    },
    {
      key: 'main',
      label: '主要部门',
      type: 'select',
      props: {
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ],
        rules: [{ required: true, message: '请选择是否主要部门', trigger: ['blur', 'change'] }]
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改信息',
      color: 'warning',
      permission: 'manager:user:dept:update',
      click: async (record: UserDept) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除信息',
      color: 'danger',
      permission: 'manager:user:dept:delete',
      click: async (record: UserDept) => {
        await DeleteUserDept({ id: record.id })
        refreshRemove()
      }
    }
  ]

  const {
    columns,
    columnChecks,
    data,
    loading,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListUserDept,
      apiParams: {
        ...searchForm.value,
        userId: curUserId
      },
      columnsFactory: () => [
        {
          prop: 'dept.name',
          label: '所属部门'
        },
        {
          prop: 'logo',
          label: '部门Logo',
          useSlot: true,
          slotName: 'logo'
        },
        {
          prop: 'job.name',
          label: '所属职位'
        },
        {
          prop: 'main',
          label: '是否主要部门',
          useSlot: true,
          slotName: 'main'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: UserDept) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: UserDept) => formatTime(row.updatedAt)
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

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: UserDept): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateUserDept({ ...currentData.value, userId: curUserId } as CreateUserDeptRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateUserDept({ ...currentData.value, userId: curUserId } as UpdateUserDeptRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }
</script>
