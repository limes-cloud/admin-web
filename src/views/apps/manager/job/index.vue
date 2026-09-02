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
                v-permission="'manager:job:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
              >
                新增职位
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
            <el-switch
              v-model="row.status"
              :disabled="!$hasPermission('manager:job:update')"
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
        :title="dialogType === 'add' ? '添加职位' : '编辑职位'"
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
  import { Edit, Plus } from '@element-plus/icons-vue'
  import { CreateJob, DeleteJob, ListJob, UpdateJob } from '@/api/manager/job/api'
  import { CreateJobRequest, Job, UpdateJobRequest } from '@/api/manager/job/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  const router = useRouter()
  defineOptions({ name: 'Job' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Job>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '职位标识',
      key: 'keyword',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入职位标识', clearable: true }
    },
    {
      label: '职位名称',
      key: 'name',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入职位名称', clearable: true }
    },
    {
      label: '职位状态',
      key: 'status',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '请选择职位状态',
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
      label: '职位标识',
      type: 'input',
      props: {
        placeholder: '请输入职位标识',
        disabled: dialogType.value === 'edit',
        rules: [
          { required: true, message: '请输入职位标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '职位标识格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
        ]
      }
    },
    {
      key: 'name',
      label: '职位名称',
      type: 'input',
      props: {
        placeholder: '请输入职位名称',
        rules: [{ required: true, message: '请输入职位名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '职位描述',
      type: 'input',
      props: {
        placeholder: '请输入职位描述',
        rules: [{ required: true, message: '请输入职位描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    }
  ])

  const operationItems = [
    {
      icon: 'iconsys-tuandui_2',
      label: '角色绑定',
      color: 'primary',
      permission: 'manager:job:role:query',
      click: async (record: Job) => {
        router.push({
          name: 'JobRole',
          query: {
            jobId: record.id
          }
        })
      }
    },
    {
      icon: Edit,
      label: '修改职位',
      color: 'warning',
      permission: 'manager:job:update',
      click: async (record: Job) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除职位',
      color: 'danger',
      permission: 'manager:job:delete',
      click: async (record: Job) => {
        await DeleteJob({ id: record.id })
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
      apiFn: ListJob,
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
          prop: 'keyword',
          label: '职位标识'
        },
        {
          prop: 'name',
          label: '职位名称'
        },
        {
          prop: 'status',
          label: '职位状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'description',
          label: '职位描述'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Job) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Job) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: Job): void => {
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
      await CreateJob(value as CreateJobRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateJob(value as UpdateJobRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: Job): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改职位状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateJob({ id: item.id, status: !item.status })
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
