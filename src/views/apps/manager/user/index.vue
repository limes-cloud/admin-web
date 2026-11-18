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

      <!-- 用户应用管理 -->
      <ElDrawer
        v-model="appManageVisible"
        :title="`应用管理${appManageUser?.nickname ? ` · ${appManageUser.nickname}` : ''}`"
        size="660px"
        :destroy-on-close="true"
      >
        <div v-loading="appManageLoading" class="app-manage">
          <div class="app-manage__summary">
            <div>
              <div class="app-manage__account">{{ appManageUser?.nickname || appManageUser?.username }}</div>
              <div class="app-manage__username">{{ appManageUser?.username }}</div>
            </div>
            <div class="app-manage__summary-actions">
              <ElTag type="primary" effect="light">已开通 {{ appManageList.length }} 个应用</ElTag>
              <ElButton type="primary" plain :icon="Plus" @click="openAppPicker">开通应用</ElButton>
            </div>
          </div>

          <ElInput v-model="appManageKeyword" clearable placeholder="搜索应用名称或标识">
            <template #prefix>
              <ElIcon><Search /></ElIcon>
            </template>
          </ElInput>

          <div class="app-manage__list">
            <div
              v-for="item in filteredAppManageList"
              :key="item.id"
              class="app-manage__item"
              :class="{ 'is-denied': isAppDenied(item) }"
            >
              <div class="app-manage__main">
                <ElAvatar shape="square" :size="44" :src="$rurl(item.logo)">
                  {{ item.name.slice(0, 1) }}
                </ElAvatar>
                <div class="app-manage__content">
                  <div class="app-manage__title">
                    <span class="app-manage__name">{{ item.name }}</span>
                    <ElTag v-if="!item.status" size="small" type="info">已停用</ElTag>
                    <ElTag v-else-if="!item.loginable" size="small" type="info">不支持登录</ElTag>
                    <ElTag v-else-if="isAppDenied(item)" size="small" type="danger">禁止登录</ElTag>
                    <ElTag v-else size="small" type="success">正常</ElTag>
                  </div>
                  <div class="app-manage__keyword">{{ item.keyword }}</div>
                  <div class="app-manage__meta">
                    <span>最近登录：{{ item.loggedAt ? formatTime(item.loggedAt) : '暂无' }}</span>
                    <span>开通于：{{ item.authorizedAt ? parseTime(item.authorizedAt) : '暂无' }}</span>
                    <span>会话至：{{ item.expiredAt ? parseTime(item.expiredAt) : '暂无' }}</span>
                  </div>
                </div>
              </div>
              <div class="app-manage__actions">
                <ArtOperation :single="true" :list="appOperationItems(item)" :data="item" />
              </div>
            </div>
          </div>

          <ElEmpty
            v-if="!appManageLoading && !filteredAppManageList.length"
            :description="appManageKeyword ? '没有匹配的应用' : '该用户暂未开通应用'"
          >
            <ElButton type="primary" plain :icon="Plus" @click="openAppPicker">开通应用</ElButton>
          </ElEmpty>
        </div>
      </ElDrawer>

      <ElDialog v-model="appPickerVisible" title="开通应用" width="520px" align-center destroy-on-close>
        <ElInput v-model="appPickerKeyword" clearable placeholder="搜索应用名称或标识">
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </ElInput>

        <div v-loading="appPickerLoading" class="app-picker">
          <ElCheckboxGroup v-model="selectedNewApps" class="app-picker__group">
            <ElCheckbox
              v-for="item in filteredCandidateApps"
              :key="item.id"
              :value="item.keyword"
              class="app-picker__item"
            >
              <div class="app-picker__content">
                <ElAvatar shape="square" :size="36" :src="$rurl(item.logo)">
                  {{ item.name.slice(0, 1) }}
                </ElAvatar>
                <div>
                  <div class="app-picker__name">{{ item.name }}</div>
                  <div class="app-picker__keyword">{{ item.keyword }}</div>
                </div>
              </div>
            </ElCheckbox>
          </ElCheckboxGroup>
          <ElEmpty
            v-if="!appPickerLoading && !filteredCandidateApps.length"
            description="没有可开通的应用"
            :image-size="72"
          />
        </div>

        <template #footer>
          <ElButton @click="appPickerVisible = false">取消</ElButton>
          <ElButton
            type="primary"
            :loading="appPickerSaving"
            :disabled="!selectedNewApps.length"
            @click="handleOpenApps"
          >
            开通{{ selectedNewApps.length ? ` ${selectedNewApps.length} 个应用` : '' }}
          </ElButton>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElMessageBox } from 'element-plus'
  import { Delete, Edit, Lock, Plus, Search, SwitchButton, Unlock } from '@element-plus/icons-vue'
  import {
    CreateUser,
    DeleteUser,
    GetUser,
    GetUserApps,
    ListUser,
    OfflineUser,
    ResetPassword,
    UpdateUser,
    UpdateUserApps
  } from '@/api/manager/user/api'
  import {
    CreateUserRequest,
    User,
    UserApp as UserAppItem,
    UpdateUserRequest,
    OfflineUserRequest
  } from '@/api/manager/user/type'
  import { formatTime, parseTime } from '@/utils/time'
  import { ListField } from '@/api/manager/field/api'
  import { toFormItems } from '@/router/utils/field'
  import { FormItem } from '@/components/core/forms/art-form/index.vue'
  import { Dept } from '@/api/manager/dept/type'
  import { ListDept } from '@/api/manager/dept/api'
  import { Job } from '@/api/manager/job/type'
  import { ListJob } from '@/api/manager/job/api'
  import { App } from '@/api/manager/app/type'
  import { ListApp } from '@/api/manager/app/api'
  import { getAppKeyword } from '@/utils/app-context'

  defineOptions({ name: 'User' })

  const router = useRouter()

  const offlineVisible = ref(false)
  const appManageVisible = ref(false)
  const appManageLoading = ref(false)
  const appManageKeyword = ref('')
  const appManageUser = ref<User>()
  const appManageList = ref<UserAppItem[]>([])
  const appManageActionLoading = ref<Record<string, Partial<Record<AppAction, boolean>>>>({})
  const appPickerVisible = ref(false)
  const appPickerLoading = ref(false)
  const appPickerSaving = ref(false)
  const appPickerKeyword = ref('')
  const appPickerList = ref<App[]>([])
  const selectedNewApps = ref<string[]>([])
  const isManagerApp = getAppKeyword() === 'manager'
  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<User> & { app?: string }>({})
  const offlineData = ref<Partial<OfflineUserRequest>>({})

  // 搜索表单
  const searchForm = ref({
    app: getAppKeyword(),
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const depts = ref<Dept[]>([])
  const orgApp = ref(getAppKeyword())
  const getDepts = (app: string) => {
    orgApp.value = app
    ListDept({ app }).then((res) => {
      depts.value = res.list
    })
  }
  getDepts(orgApp.value)

  const jobs = ref<Job[]>([])
  const getJobs = (query?: string) => {
    ListJob({ page: 1, pageSize: 50, name: query, app: orgApp.value }).then((res) => {
      jobs.value = res.list
    })
  }
  getJobs()

  const apps = ref<App[]>([])
  const getApps = (query?: string) => {
    ListApp({ page: 1, pageSize: 10, status: true, query }).then((res) => {
      apps.value = res.list
    })
  }
  getApps()

  const formApps = ref<App[]>([])
  const getFormApps = (query?: string) => {
    ListApp({ page: 1, pageSize: 10, status: true, query }).then((res) => {
      formApps.value = res.list
    })
  }
  getFormApps()

  const searchItems = reactive([
    {
      key: 'app',
      label: '所属应用',
      type: 'select',
      hidden: !isManagerApp,
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
        options: apps,
        props: {
          label: 'name',
          value: 'keyword'
        },
        onChange: (app: string) => {
          getDepts(app || getAppKeyword())
          getJobs()
        }
      }
    },
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
  ])

  const offlineFormItems = computed(() => [
    {
      key: 'apps',
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
          value: 'keyword'
        }
      }
    }
  ])

  const dynamicFormItems = ref<FormItem[]>([])

  const formItems = computed<FormItem[]>(() => {
    const items: FormItem[] = []
    if (dialogType.value === 'add' && isManagerApp) {
      items.push({
        key: 'app',
        label: '所属应用',
        type: 'select',
        props: {
          rules: [{ required: true, message: '请选择所属应用', trigger: ['blur', 'change'] }],
          filterable: true,
          remote: true,
          remoteMethod: (query: string) => getFormApps(query),
          placeholder: '请选择所属应用',
          options: formApps.value,
          props: {
            label: 'name',
            value: 'keyword'
          },
          onChange: (value: string) => {
            getDepts(value)
            getJobs()
          }
        }
      })
    }
    items.push(
      {
        key: 'avatar',
        label: '用户头像',
        type: 'upload',
        props: {
          rules: [{ required: true, message: '请上传用户头像', trigger: ['blur', 'change'] }],
          directoryPath: 'manager/user/avatar',
          cut: {
            enable: true,
            width: 256,
            height: 256
          }
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
    )
    return items.concat(dynamicFormItems.value)
  })

  const filteredAppManageList = computed(() => {
    const keyword = appManageKeyword.value.trim().toLowerCase()
    if (!keyword) return appManageList.value
    return appManageList.value.filter((item) => {
      return item.name.toLowerCase().includes(keyword) || item.keyword.toLowerCase().includes(keyword)
    })
  })

  const isAppDenied = (item: UserAppItem): boolean => {
    return item.denied
  }

  const filteredCandidateApps = computed(() => {
    const keyword = appPickerKeyword.value.trim().toLowerCase()
    if (!keyword) return appPickerList.value
    return appPickerList.value.filter((item) => {
      return item.name.toLowerCase().includes(keyword) || item.keyword.toLowerCase().includes(keyword)
    })
  })

  type AppAction = 'deny' | 'offline' | 'revoke'

  const isAppActionLoading = (item: UserAppItem, action: AppAction): boolean => {
    return Boolean(appManageActionLoading.value[item.keyword]?.[action])
  }

  const setAppActionLoading = (item: UserAppItem, action: AppAction, loading: boolean): void => {
    appManageActionLoading.value = {
      ...appManageActionLoading.value,
      [item.keyword]: {
        ...appManageActionLoading.value[item.keyword],
        [action]: loading
      }
    }
  }

  const appOperationItems = (item: UserAppItem) => {
    const denyLoading = isAppActionLoading(item, 'deny')
    const offlineLoading = isAppActionLoading(item, 'offline')
    const revokeLoading = isAppActionLoading(item, 'revoke')
    return [
      {
        icon: item.denied ? Unlock : Lock,
        label: denyLoading ? (item.denied ? '恢复中...' : '禁止中...') : item.denied ? '恢复登录' : '禁止登录',
        color: item.denied ? 'success' : 'danger',
        disabled: denyLoading || !item.status || !item.loginable,
        click: () => handleToggleAppDenied(item)
      },
      {
        icon: SwitchButton,
        label: offlineLoading ? '下线中...' : '用户下线',
        color: 'warning',
        disabled: offlineLoading || !item.status || !item.loginable,
        click: () => handleOfflineApp(item)
      },
      {
        icon: Delete,
        label: revokeLoading ? '取消中...' : '取消开通',
        color: 'danger',
        disabled: revokeLoading,
        click: () => handleRevokeApp(item)
      }
    ]
  }

  const operationItems = [
    {
      icon: 'iconsys-fenxiao',
      label: '部门分配',
      color: 'primary',
      permission: 'manager:user:dept:query',
      click: async (record: User) => {
        router.push({
          name: 'UserDept',
          query: { userId: record.id, app: searchForm.value.app || getAppKeyword() }
        })
      }
    },
    ...(isManagerApp
      ? [
          {
            icon: 'iconsys-guanli',
            label: '应用管理',
            color: 'primary',
            permission: 'manager:user:apps:update',
            click: async (record: User) => {
              await openAppManage(record)
            }
          }
        ]
      : []),

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
        offlineData.value = { apps: [searchForm.value.app || getAppKeyword()] }
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
    const defaultApp = searchForm.value.app || getAppKeyword()
    currentData.value = type === 'add' ? { app: defaultApp } : row || {}
    getDepts((type === 'add' ? defaultApp : row?.app) || defaultApp)
    getJobs()
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const refreshAppManageList = async (): Promise<void> => {
    if (!appManageUser.value) return
    const res = await GetUserApps({ userId: appManageUser.value.id })
    appManageList.value = res.list.filter((item) => item.authorized)
  }

  const buildAppAccess = (target: string, include: boolean, deny: boolean) => {
    const apps = new Set<string>()
    const deniedApps = new Set<string>()
    for (const item of appManageList.value) {
      if (item.keyword === target) continue
      if (item.denied) deniedApps.add(item.keyword)
      else apps.add(item.keyword)
    }
    if (include) apps.add(target)
    if (deny) deniedApps.add(target)
    return { apps: [...apps], deniedApps: [...deniedApps] }
  }

  const saveAppAccess = async (apps: string[], deniedApps: string[]): Promise<void> => {
    if (!appManageUser.value) return
    await UpdateUserApps({
      userId: appManageUser.value.id,
      apps: [...new Set(apps)].sort(),
      deniedApps: [...new Set(deniedApps)].sort()
    })
    await refreshAppManageList()
  }

  const confirmAppAction = async (message: string, title: string, confirmButtonText: string): Promise<boolean> => {
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText,
        cancelButtonText: '取消',
        type: 'warning'
      })
      return true
    } catch {
      return false
    }
  }

  const handleToggleAppDenied = async (item: UserAppItem): Promise<void> => {
    if (!item.denied) {
      const confirmed = await confirmAppAction(
        `禁止登录后，该用户在「${item.name}」的当前会话会立即失效，是否继续？`,
        '禁止登录',
        '确认禁止'
      )
      if (!confirmed) return
    }
    setAppActionLoading(item, 'deny', true)
    try {
      const access = item.denied ? buildAppAccess(item.keyword, true, false) : buildAppAccess(item.keyword, false, true)
      await saveAppAccess(access.apps, access.deniedApps)
      ElMessage.success(item.denied ? '已恢复登录' : '已禁止登录')
    } finally {
      setAppActionLoading(item, 'deny', false)
    }
  }

  const handleOfflineApp = async (item: UserAppItem): Promise<void> => {
    if (!appManageUser.value) return
    const confirmed = await confirmAppAction(`确认让该用户在「${item.name}」下线？`, '用户下线', '确认下线')
    if (!confirmed) return
    setAppActionLoading(item, 'offline', true)
    try {
      await OfflineUser({ userId: appManageUser.value.id, apps: [item.keyword] })
      await refreshAppManageList()
      ElMessage.success('下线成功')
    } finally {
      setAppActionLoading(item, 'offline', false)
    }
  }

  const handleRevokeApp = async (item: UserAppItem): Promise<void> => {
    const confirmed = await confirmAppAction(
      `取消开通后，该用户将无法再访问「${item.name}」，当前会话也会失效，是否继续？`,
      '取消开通应用',
      '确认取消'
    )
    if (!confirmed) return
    setAppActionLoading(item, 'revoke', true)
    try {
      const access = buildAppAccess(item.keyword, false, false)
      await saveAppAccess(access.apps, access.deniedApps)
      ElMessage.success('已取消开通')
    } finally {
      setAppActionLoading(item, 'revoke', false)
    }
  }

  const openAppPicker = async (): Promise<void> => {
    appPickerKeyword.value = ''
    selectedNewApps.value = []
    appPickerVisible.value = true
    appPickerLoading.value = true
    try {
      const res = await ListApp({ page: 1, pageSize: 200, status: true })
      const authorized = new Set(appManageList.value.map((item) => item.keyword))
      appPickerList.value = res.list.filter((item) => item.loginable && !authorized.has(item.keyword))
    } finally {
      appPickerLoading.value = false
    }
  }

  const handleOpenApps = async (): Promise<void> => {
    if (!selectedNewApps.value.length) return
    appPickerSaving.value = true
    try {
      const apps = new Set(appManageList.value.filter((item) => !item.denied).map((item) => item.keyword))
      for (const keyword of selectedNewApps.value) apps.add(keyword)
      const deniedApps = appManageList.value.filter((item) => item.denied).map((item) => item.keyword)
      await saveAppAccess([...apps], deniedApps)
      appPickerVisible.value = false
      ElMessage.success('应用开通成功')
    } finally {
      appPickerSaving.value = false
    }
  }

  // 打开用户应用管理
  const openAppManage = async (user: User): Promise<void> => {
    appManageUser.value = user
    appManageKeyword.value = ''
    appManageList.value = []
    appManageActionLoading.value = {}
    appManageVisible.value = true
    appManageLoading.value = true
    try {
      await refreshAppManageList()
    } finally {
      appManageLoading.value = false
    }
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = currentData.value
    if (dialogType.value === 'add') {
      await CreateUser({
        ...value,
        app: isManagerApp ? value.app : getAppKeyword()
      } as CreateUserRequest)
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
      ElMessageBox.confirm('您确定将密码重置为当前应用的默认登录密码？', '温馨提示', {
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
    await OfflineUser({ apps: offlineData.value.apps as string[], userId: currentData.value.id as number })
    ElMessage.success('下线成功')
    offlineVisible.value = false
  }

  ListField({ page: 1, pageSize: 50, status: true }).then((res) => {
    dynamicFormItems.value = toFormItems(res.list)
  })
</script>

<style scoped lang="scss">
  .app-manage {
    min-height: 240px;
  }

  .app-manage__summary {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    margin-bottom: 16px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
  }

  .app-manage__account {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .app-manage__username {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .app-manage__summary-actions {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
  }

  .app-manage__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 16px;
  }

  .app-manage__item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    transition:
      border-color 0.2s,
      background-color 0.2s;

    &.is-denied {
      background: var(--el-color-danger-light-9);
      border-color: var(--el-color-danger-light-7);
    }
  }

  .app-manage__main {
    display: flex;
    flex: 1;
    gap: 12px;
    min-width: 0;
  }

  .app-manage__content {
    flex: 1;
    min-width: 0;
  }

  .app-manage__title {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .app-manage__name {
    overflow: hidden;
    font-weight: 500;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .app-manage__keyword {
    margin-top: 3px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .app-manage__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .app-manage__actions {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
  }

  .app-picker {
    min-height: 180px;
    max-height: 400px;
    margin-top: 16px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .app-picker__group {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .app-picker__item {
    width: 100%;
    height: auto;
    padding: 10px 12px;
    margin: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: 0;
    }

    &:hover {
      background: var(--el-fill-color-light);
    }

    :deep(.el-checkbox__label) {
      flex: 1;
      min-width: 0;
    }
  }

  .app-picker__content {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .app-picker__name {
    color: var(--el-text-color-primary);
  }

  .app-picker__keyword {
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
