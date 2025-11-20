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
                v-permission="'manager:user:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
              >
                新增用户
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
            <el-tooltip effect="dark" :content="row.status ? '用户已启用' : row.reason" placement="top-start">
              <el-switch
                v-model="row.status"
                inline-prompt
                active-text="启用"
                inactive-text="禁用"
                :before-change="handleUpdateStatus(row)"
              />
            </el-tooltip>
          </template>
          <template #avatar="{ row }">
            <ElAvatar shape="square" :size="60" :src="$rurl(row.avatar)"></ElAvatar>
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
        :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
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

      <!-- 禁用弹窗 -->
      <ElDialog
        v-model="offlineVisible"
        title="用户下线"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="420px"
        align-center
      >
        <ElSpace direction="vertical" :size="30">
          <el-alert
            title="选择的应用当前会话会立即失效，但是用户依然可以重新登陆使用，如果要完全下线用户建议先禁用用户，在执行下线操作"
            type="info"
            show-icon
            :closable="false"
          />
          <ArtForm
            v-model="offlineData"
            :items="offlineFormItems"
            :span="24"
            :show-button="true"
            @submit="handleUserOffline"
          ></ArtForm>
        </ElSpace>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElMessageBox } from 'element-plus'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import {
    CreateUser,
    DeleteUser,
    GetUser,
    ListUser,
    OfflineUser,
    ResetPassword,
    UpdateUser
  } from '@/api/manager/user/api'
  import { CreateUserRequest, User, UpdateUserRequest, OfflineUserRequest } from '@/api/manager/user/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { ListRequiredField } from '@/api/manager/field/api'
  import { toFormItems } from '@/router/utils/field'
  import { FormItem } from '@/components/core/forms/art-form/index.vue'
  import { Dept } from '@/api/manager/dept/type'
  import { ListCurrentDept } from '@/api/manager/dept/api'
  import { Job } from '@/api/manager/job/type'
  import { ListJob } from '@/api/manager/job/api'
  import { App } from '@/api/manager/app/type'
  import { ListApp } from '@/api/manager/app/api'

  defineOptions({ name: 'User' })

  const router = useRouter()

  const offlineVisible = ref(false)
  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<User>>({})
  const offlineData = ref<Partial<OfflineUserRequest>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

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

  const apps = ref<App[]>([])
  const getApps = (query?: string) => {
    ListApp({ page: 1, pageSize: 10, name: query }).then((res) => {
      apps.value = res.list
    })
  }
  getApps()

  const searchItems = [
    {
      label: '用户账户',
      key: 'username',
      type: 'input',
      props: {
        placeholder: '请输入用户账户',
        clearable: true
      }
    },
    {
      label: '用户状态',
      key: 'status',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '请选择用户状态',
        options: [
          { label: '正常', value: true },
          { label: '禁用', value: false }
        ]
      }
    },
    {
      key: 'appId',
      label: '所属应用',
      type: 'select',
      props: {
        placeholder: '请选择所属应用',
        clearable: true,
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getApps(query)
          } else {
            getApps()
          }
        },
        options: apps.value,
        props: {
          label: 'name',
          value: 'id'
        }
      }
    },
    {
      key: 'deptId',
      label: '所属部门',
      type: 'treeselect',
      placeholder: '请选择所属部门',
      clearable: true,
      props: {
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
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getJobs(query)
          } else {
            getJobs()
          }
        },
        options: jobs.value,
        props: {
          label: 'name',
          value: 'id'
        }
      }
    }
  ]

  const offlineFormItems = computed(() => [
    {
      key: 'appIds',
      label: '下线应用',
      type: 'select',
      placeholder: '请选择下线应用',
      clearable: true,
      props: {
        rules: [{ required: true, message: '请选择下线应用', trigger: ['blur', 'change'] }],
        multiple: true,
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getApps(query)
          } else {
            getApps()
          }
        },
        options: apps.value,
        props: {
          label: 'name',
          value: 'id'
        }
      }
    }
  ])

  const formItems = ref<FormItem[]>([
    {
      key: 'avatar',
      label: '用户头像',
      type: 'upload',
      props: {
        rules: [{ required: true, message: '请上传用户头像', trigger: ['blur', 'change'] }],
        directoryPath: 'manager/user/avatar'
      }
    },
    {
      key: 'username',
      label: '用户账户',
      type: 'input',
      props: {
        placeholder: '请输入用户账户',
        disabled: dialogType.value === 'edit',
        rules: [
          { required: true, message: '请输用户账户', trigger: ['blur', 'change'] },
          { type: 'string', message: '用户账户格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ },
          { type: 'string', message: '账户最少6位数', min: 6 }
        ]
      }
    },
    {
      key: 'nickname',
      label: '用户昵称',
      type: 'input',
      props: {
        placeholder: '请输入用户昵称',
        disabled: dialogType.value === 'edit',
        rules: [{ required: true, message: '请输入用户昵称', trigger: ['blur', 'change'] }]
      }
    }
  ])

  const operationItems = [
    {
      icon: 'iconsys-fenxiao',
      label: '部门分配',
      color: 'primary',
      permission: 'manager:user:dept:query',
      click: async (record: User) => {
        router.push({ name: 'UserDept', query: { userId: record.id } })
      }
    },

    {
      icon: Edit,
      label: '修改用户',
      color: 'warning',
      permission: 'manager:user:update',
      click: async (record: User) => {
        const data = await GetUser({ id: record.id })
        showDialog('edit', { ...data })
      }
    },
    {
      icon: 'iconsys-tuichudenglu',
      label: '用户下线',
      color: 'danger',
      permission: 'manager:user:offline',
      click: async (record: User) => {
        currentData.value = record
        offlineVisible.value = true
      }
    },
    {
      icon: 'iconsys-shuaxin12',
      label: '重置密码',
      color: 'danger',
      permission: 'manager:user:update',
      click: async (record: User) => {
        handleResetPassword(record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除用户',
      color: 'danger',
      permission: 'manager:user:delete',
      click: async (record: User) => {
        await DeleteUser({ id: record.id })
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
      apiFn: ListUser,
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
          prop: 'avatar',
          label: '用户Logo',
          useSlot: true,
          slotName: 'avatar'
        },
        {
          prop: 'username',
          label: '用户账户'
        },
        {
          prop: 'nickname',
          label: '用户昵称'
        },
        {
          prop: 'status',
          label: '用户状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: User) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: User) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: User): void => {
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
      await CreateUser(value as CreateUserRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateUser(value as UpdateUserRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: User): (() => Promise<boolean>) => {
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
              await UpdateUser({ id: item.id, status: !item.status, reason: value })
              ElMessage.success('禁用成功')
              refreshUpdate()
              resolve(true)
            })
            .catch(() => {
              resolve(false)
            })
        } else {
          ElMessageBox.confirm('您确定修改用户状态？', '温馨提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(async () => {
              await UpdateUser({ id: item.id, status: !item.status, reason: '' })
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

  const handleResetPassword = (item: User) => {
    return new Promise((resolve) => {
      ElMessageBox.confirm('您确定重置用户密码？', '温馨提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          await ResetPassword({ id: item.id })
          ElMessage.success('重置成功')
          refreshUpdate()
          resolve(true)
        })
        .catch(() => {
          resolve(false)
        })
    })
  }

  const handleUserOffline = async () => {
    await OfflineUser({ appIds: offlineData.value.appIds as number[], userId: currentData.value.id as number })
    ElMessage.success('下线成功')
    offlineVisible.value = false
  }

  ListRequiredField().then((res) => {
    const items = toFormItems(res.list)
    formItems.value = formItems.value.concat(items)
  })
</script>
