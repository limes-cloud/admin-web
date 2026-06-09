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

        <!-- 卡片列表 -->
        <div class="app-card-scroll">
          <ElEmpty v-if="!loading && !appList.length" description="暂无应用" />

          <div v-else v-loading="loading" class="app-grid">
            <article v-for="item in appList" :key="item.id" class="app-card">
              <div class="app-card__top">
                <div class="app-card__logo" :class="getLogoClass(item)">
                  <ElImage v-if="item.logo" :src="getResourceUrl(item.logo, 72, 72)" fit="cover">
                    <template #error>
                      <span class="app-card__logo-fallback">{{ getAppInitial(item) }}</span>
                    </template>
                  </ElImage>
                  <span v-else>{{ getAppInitial(item) }}</span>
                </div>

                <div class="app-card__title">
                  <h2>{{ item.showName || item.name }}</h2>
                  <p>{{ item.description || item.comment || '暂无描述' }}</p>
                </div>

                <ArtOperation :single="true" :list="operationItems" :data="item" :has-background="false">
                  <ElButton class="app-card__more" text :icon="MoreFilled" />
                </ArtOperation>
              </div>

              <dl class="app-card__meta">
                <div>
                  <dt>应用标识</dt>
                  <dd>{{ item.keyword }}</dd>
                </div>
                <div>
                  <dt>应用名称</dt>
                  <dd>{{ item.name }}</dd>
                </div>
                <div>
                  <dt>创建时间</dt>
                  <dd>{{ formatCardTime(item.createdAt) }}</dd>
                </div>
              </dl>

              <div class="app-card__footer">
                <ElTooltip
                  effect="dark"
                  :content="item.status ? '已启用' : item.reason || '已禁用'"
                  placement="top-start"
                >
                  <ElSwitch
                    v-model="item.status"
                    :disabled="!$hasPermission('manager:app:update')"
                    inline-prompt
                    active-text="启用"
                    inactive-text="禁用"
                    :before-change="handleUpdateStatus(item)"
                  />
                </ElTooltip>

                <ElTag :type="item.type === 'base' ? 'warning' : 'primary'" effect="light">
                  {{ getAppTypeLabel(item.type) }}
                </ElTag>
              </div>
            </article>
          </div>
        </div>

        <div v-if="pagination.total > 0" class="app-pagination">
          <ElPagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="pagination.current"
            :page-size="pagination.size"
            :page-sizes="[8, 10, 20, 30, 50]"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加应用' : '编辑应用'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="480px"
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
  import { Delete, Edit, Fold, MoreFilled, Plus } from '@element-plus/icons-vue'
  import { CreateApp, DeleteApp, GetApp, ListApp, UpdateApp } from '@/api/manager/app/api'
  import { CreateAppRequest, App, UpdateAppRequest } from '@/api/manager/app/type'
  import { formatTime, parseTime } from '@/utils/time'
  import { rurl } from '@/utils/resource/url'

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
          { type: 'string', message: '应用标识格式错误', pattern: /^[a-zA-Z_-][a-zA-Z0-9_-]*$/ }
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
      key: 'showName',
      label: '展示名称',
      type: 'input',
      props: {
        placeholder: '请输入展示名称',
        rules: [{ required: true, message: '请输入展示名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'logo',
      label: '应用logo',
      type: 'upload',
      props: {
        accept: 'image/*',
        rules: [{ required: true, message: '请上传应用logo', trigger: ['blur', 'change'] }],
        directoryPath: 'manager/app/logo',
        cut: {
          enable: true,
          width: 256,
          height: 256
        }
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
          { label: '允许', value: false },
          { label: '禁止', value: true }
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
      key: 'setting.web.copyright',
      label: '版权信息',
      type: 'input',
      divider: '站点配置',
      hidden: currentData.value.type === 'base',
      tip: '显示在登录页和首页底部的版权信息，不输入则不显示',
      props: {
        placeholder: '请输入版权信息'
      }
    },
    {
      key: 'setting.web.watermark',
      label: '水印信息',
      type: 'input',
      hidden: currentData.value.type === 'base',
      tip: '显示在登录页和首页底部的水印信息，不输入则不显示',
      props: {
        placeholder: '请输入水印信息'
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

  const table = useTable({
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
          label: '应用Logo'
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
          label: '应用状态'
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
          fixed: 'right'
        }
      ]
    },
    hooks: {
      resetFormCallback: () => {
        searchForm.value = {
          keyword: undefined,
          name: undefined,
          status: undefined
        }
      }
    }
  })

  const {
    data: tableData,
    columnChecks,
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
  } = table

  const appList = computed(() => tableData.value as App[])

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

  const getResourceUrl = (key: string, width = 100, height = 100) => rurl(key, width, height)

  const getAppInitial = (item: App) => (item.showName || item.name || item.keyword || 'A').slice(0, 1).toUpperCase()

  const getAppTypeLabel = (type: string) => appTypes.find((item) => item.value === type)?.label || '标准应用'

  const getLogoClass = (item: App) => {
    const index = Math.abs(item.id || 0) % 6
    return `is-tone-${index}`
  }

  const formatCardTime = (time: number) => parseTime(time, '{y}-{m}-{d}') || formatTime(time)
</script>

<style lang="scss" scoped>
  :deep(.table) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .app-card-scroll {
    flex: 1;
    min-height: 0;
    margin-top: 12px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .app-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .app-card {
    display: flex;
    flex-direction: column;
    min-height: 216px;
    padding: 18px;
    background: var(--art-main-bg-color);
    border: 1px solid var(--art-border-color);
    border-radius: 8px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;

    &:hover {
      box-shadow: var(--art-root-card-box-shadow);
    }

    &__top {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr) 32px;
      gap: 14px;
      align-items: flex-start;
    }

    &__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      overflow: hidden;
      font-size: 14px;
      font-weight: 700;
      color: rgb(var(--art-primary));
      background: rgb(var(--art-bg-primary));
      border-radius: 8px;

      :deep(.el-image) {
        width: 100%;
        height: 100%;
      }

      :deep(.el-image__error) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: inherit;
        font-size: inherit;
        background: transparent;
      }

      &.is-tone-1 {
        color: rgb(var(--art-success));
        background: rgb(var(--art-bg-success));
      }

      &.is-tone-2 {
        color: rgb(var(--art-warning));
        background: rgb(var(--art-bg-warning));
      }

      &.is-tone-3 {
        color: rgb(var(--art-secondary));
        background: rgb(var(--art-bg-secondary));
      }

      &.is-tone-4 {
        color: rgb(var(--art-error));
        background: rgb(var(--art-bg-error));
      }

      &.is-tone-5 {
        color: rgb(var(--art-info));
        background: rgb(var(--art-bg-info));
      }
    }

    &__title {
      min-width: 0;

      h2 {
        margin: 0;
        overflow: hidden;
        font-size: 14px;
        font-weight: 700;
        line-height: 22px;
        color: var(--art-gray-900);
        text-overflow: ellipsis;
        white-space: nowrap;
        letter-spacing: 0;
      }

      p {
        display: -webkit-box;
        margin: 2px 0 0;
        overflow: hidden;
        font-size: 13px;
        font-weight: 400;
        line-height: 19px;
        color: var(--art-gray-600);
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    &__more {
      --el-button-border-color: transparent;
      --el-button-bg-color: transparent;
      --el-button-hover-border-color: transparent;
      --el-button-hover-bg-color: rgba(var(--art-gray-200-rgb), 0.72);
      --el-button-active-border-color: transparent;
      --el-button-active-bg-color: rgba(var(--art-gray-200-rgb), 0.72);

      width: 32px !important;
      height: 32px !important;
      color: var(--art-gray-500);
      border-color: transparent !important;
      border-radius: 6px;
      box-shadow: none !important;

      &:hover,
      &:focus,
      &:focus-visible,
      &:active {
        color: var(--art-gray-500);
        border-color: transparent !important;
        box-shadow: none !important;
        outline: none;
      }

      &:focus-visible {
        outline: none !important;
      }

      &:hover,
      &:active {
        background: rgba(var(--art-gray-200-rgb), 0.72) !important;
      }

      :deep(span) {
        outline: none !important;
        box-shadow: none !important;
      }
    }

    &__logo-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-size: 18px;
      font-weight: 700;
    }

    &__meta {
      display: grid;
      gap: 8px;
      padding: 14px 0;
      margin: 14px 0 0;

      div {
        display: grid;
        grid-template-columns: 74px minmax(0, 1fr);
        gap: 8px;
        align-items: center;
      }

      dt,
      dd {
        min-width: 0;
        margin: 0;
        font-size: 13px;
        line-height: 19px;
      }

      dt {
        color: var(--art-gray-500);
      }

      dd {
        overflow: hidden;
        font-weight: 400;
        color: var(--art-gray-700);
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 14px;
      margin-top: auto;
      border-top: 1px solid var(--art-border-color);
    }
  }

  @media (max-width: $device-notebook) {
    .app-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: $device-ipad-pro) {
    .app-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: $device-phone) {
    .app-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .app-card {
      padding: 16px;

      &__top {
        grid-template-columns: 48px minmax(0, 1fr) 32px;
        gap: 12px;
      }

      &__logo {
        width: 48px;
        height: 48px;
      }
    }
  }

  .app-pagination {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
</style>
