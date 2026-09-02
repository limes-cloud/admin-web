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
                v-permission="'manager:oauther:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增授权</ElButton
              >
            </ElSpace>
          </template>
        </ArtTableHeader>

        <!-- 卡片列表 -->
        <div class="oauth-card-scroll">
          <ElEmpty v-if="!loading && !oautherList.length" description="暂无授权数据" />

          <div v-else v-loading="loading" class="oauth-grid">
            <article v-for="item in oautherList" :key="item.id" class="oauth-card">
              <div class="oauth-card__header">
                <div class="oauth-card__logo" :class="getLogoClass(item)">
                  <ElImage v-if="item.logo" :src="getResourceUrl(item.logo, 72, 72)" fit="cover">
                    <template #error>
                      <span class="oauth-card__logo-fallback">{{ getOAutherInitial(item) }}</span>
                    </template>
                  </ElImage>
                  <span v-else class="oauth-card__logo-fallback">{{ getOAutherInitial(item) }}</span>
                </div>

                <div class="oauth-card__title">
                  <h2>{{ item.name }}</h2>
                  <p>{{ item.description || '暂无授权描述' }}</p>
                </div>

                <ArtOperation :single="true" :list="operationItems" :data="item" :has-background="false">
                  <ElButton class="oauth-card__more" text :icon="MoreFilled" />
                </ArtOperation>
              </div>

              <dl class="oauth-card__meta">
                <div>
                  <dt>授权标识</dt>
                  <dd class="oauth-card__copy-field">
                    <span>{{ item.keyword }}</span>
                    <ElButton
                      class="oauth-card__inline-copy"
                      text
                      :icon="CopyDocument"
                      @click="handleCopyKeyword(item)"
                    />
                  </dd>
                </div>
                <div>
                  <dt>创建时间</dt>
                  <dd>{{ formatTime(item.createdAt) }}</dd>
                </div>
              </dl>

              <div class="oauth-card__secret">
                <div class="oauth-card__secret-title">
                  <span>授权信息</span>
                </div>
                <div>
                  <span>授权AK：</span>
                  <strong>{{ item.ak || '未配置' }}</strong>
                </div>
                <div class="oauth-card__secret-row">
                  <span>授权SK：</span>
                  <strong>{{ maskSecret(item.sk) }}</strong>
                  <ElButton class="oauth-card__inline-copy" text :icon="CopyDocument" @click="handleCopySk(item)" />
                </div>
              </div>

              <div class="oauth-card__footer">
                <ElSwitch
                  v-model="item.status"
                  :disabled="!$hasPermission('manager:oauther:update')"
                  inline-prompt
                  active-text="启用"
                  inactive-text="禁用"
                  :before-change="handleUpdateStatus(item)"
                />
                <ElTag type="primary" effect="light">{{ getTypeLabel(item.type) }}</ElTag>
              </div>
            </article>
          </div>
        </div>

        <div v-if="pagination.total > 0" class="oauth-pagination">
          <ElPagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="pagination.current"
            :page-size="pagination.size"
            :page-sizes="[10, 20, 30, 50, 100]"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加授权' : '编辑授权'"
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
  import { ElMessageBox } from 'element-plus'
  import { CopyDocument, Delete, Edit, MoreFilled, Plus } from '@element-plus/icons-vue'
  import { CreateOAuther, DeleteOAuther, ListOAuther, ListOAutherType, UpdateOAuther } from '@/api/manager/oauther/api'
  import { CreateOAutherRequest, OAuther, OAutherType, UpdateOAutherRequest } from '@/api/manager/oauther/type'
  import { formatTime } from '@/utils/time'
  import { rurl } from '@/utils/resource/url'

  defineOptions({ name: 'OAuther' })

  const { copy } = useClipboard()

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<OAuther>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '授权标识',
      key: 'keyword',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入授权标识', clearable: true }
    },
    {
      label: '授权名称',
      key: 'name',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入授权名称', clearable: true }
    },
    {
      label: '授权状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择授权状态',
        clearable: true,
        options: [
          { label: '正常', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ]

  const types = ref<OAutherType[]>([])
  ListOAutherType().then((res) => {
    types.value = res.list
  })

  const hasCallbackTypes = ['yiban', 'wx_service_account']
  const formItems = reactive([
    {
      key: 'logo',
      label: '授权logo',
      type: 'upload',
      props: {
        rules: [{ required: true, message: '请上传授权logo', trigger: ['blur', 'change'] }],
        directoryPath: 'manager/oauther/logo',
        cut: {
          enable: true,
          width: 256,
          height: 256
        }
      }
    },
    {
      key: 'keyword',
      label: '授权标识',
      type: 'input',
      props: {
        placeholder: '请输入授权标识',
        disabled: dialogType.value === 'edit',
        rules: [
          { required: true, message: '请输入授权标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '授权标识格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
        ]
      }
    },
    {
      key: 'name',
      label: '授权名称',
      type: 'input',
      props: {
        placeholder: '请输入授权名称',
        rules: [{ required: true, message: '请输入授权名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'type',
      label: '授权类型',
      type: 'select',
      props: {
        options: types,
        placeholder: '请选择授权类型',
        rules: [{ required: true, message: '请选择授权名称', trigger: ['blur', 'change'] }],
        props: {
          label: 'name',
          value: 'keyword'
        }
      }
    },
    {
      key: 'ak',
      label: '授权AK',
      type: 'input',
      props: {
        placeholder: '请输入授权AK',
        rules: [{ required: true, message: '请输入授权AK', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'sk',
      label: '授权SK',
      type: 'input',
      props: {
        placeholder: '请输入授权SK',
        rules: [{ required: true, message: '请输入授权SK', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '授权描述',
      type: 'input',
      props: {
        placeholder: '请输入授权描述',
        rules: [{ required: true, message: '请输入授权描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    },
    {
      key: 'setting.callback',
      label: '回调地址',
      type: 'input',
      hidden: !hasCallbackTypes.includes(currentData.value.type as string),
      props: {
        placeholder: '请输入回调地址',
        rules: [
          { required: true, message: '请输入回调地址', trigger: ['blur', 'change'] },
          { type: 'url', message: '回调地址格式错误' }
        ],
        type: 'input'
      }
    },
    {
      key: 'setting.email.host',
      label: '邮件服务',
      type: 'input',
      hidden: currentData.value.type !== 'email',
      props: {
        placeholder: '请输入邮件服务器',
        rules: [
          { required: true, message: '请输入邮件服务器', trigger: ['blur', 'change'] },
          { type: 'host', message: '邮件服务器格式错误' }
        ],
        type: 'input'
      }
    },
    {
      key: 'setting.email.port',
      label: '服务端口',
      type: 'number',
      hidden: currentData.value.type !== 'email',
      defaultValue: 25,
      props: {
        placeholder: '请输入邮件服务器端口',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入邮件服务器端口', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.email.from',
      label: '发送名称',
      type: 'input',
      hidden: currentData.value.type !== 'email',
      props: {
        placeholder: '请输入发送名称',
        rules: [{ required: true, message: '请输入发送名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.email.subject',
      label: '邮件主题',
      type: 'input',
      hidden: currentData.value.type !== 'email',
      props: {
        placeholder: '请输入邮件主题',
        rules: [{ required: true, message: '请输入邮件主题', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.email.template',
      label: '邮件模板',
      type: 'code',
      hidden: currentData.value.type !== 'email',
      props: {
        placeholder: '请输入邮件模板',
        lang: 'html',
        showFullscreen: true,
        style: { height: '200px', width: '100%' },
        rules: [{ required: true, message: '请输入邮件模板', trigger: ['blur', 'change'] }]
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改授权',
      color: 'warning',
      permission: 'manager:oauther:update',
      click: async (record: OAuther) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除授权',
      color: 'danger',
      permission: 'manager:oauther:delete',
      click: async (record: OAuther) => {
        await DeleteOAuther({ id: record.id })
        refreshRemove()
      }
    }
  ]

  const {
    columnChecks,
    data: tableData,
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
      apiFn: ListOAuther,
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
          label: '授权Logo',
          useSlot: true,
          slotName: 'logo'
        },
        {
          prop: 'keyword',
          label: '授权标识'
        },
        {
          prop: 'name',
          label: '授权名称'
        },
        {
          prop: 'status',
          label: '授权状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'description',
          label: '授权描述'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: OAuther) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: OAuther) => formatTime(row.updatedAt)
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

  const oautherList = computed(() => tableData.value as OAuther[])

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: OAuther): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateOAuther({ ...currentData.value } as CreateOAutherRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateOAuther({ ...currentData.value } as UpdateOAutherRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: OAuther): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改授权渠道状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateOAuther({ id: item.id, status: !item.status })
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

  const getResourceUrl = (key: string, width = 100, height = 100) => rurl(key, width, height)

  const getOAutherInitial = (item: OAuther) => (item.name || item.keyword || 'O').slice(0, 1).toUpperCase()

  const getTypeLabel = (type: string) =>
    types.value.find((item) => item.keyword === type)?.name || type || '第三方OAuth'

  const getLogoClass = (item: OAuther) => {
    const index = Math.abs(item.id || 0) % 6
    return `is-tone-${index}`
  }

  const maskSecret = (value?: string) => (value ? '*'.repeat(Math.min(Math.max(value.length, 8), 12)) : '未配置')

  const handleCopySk = async (item: OAuther) => {
    await copy(item.sk || '')
    ElMessage.success('复制成功')
  }

  const handleCopyKeyword = async (item: OAuther) => {
    await copy(item.keyword)
    ElMessage.success('复制成功')
  }
</script>

<style lang="scss" scoped>
  :deep(.table) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .oauth-card-scroll {
    flex: 1;
    min-height: 0;
    margin-top: 12px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .oauth-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .oauth-card {
    display: flex;
    flex-direction: column;
    padding: 18px;
    background: var(--art-main-bg-color);
    border: 1px solid var(--art-border-color);
    border-radius: 8px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      border-color: rgba(var(--art-primary), 0.45);
      box-shadow: var(--art-root-card-box-shadow);
    }

    &__header {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr) 32px;
      gap: 14px;
      align-items: flex-start;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--art-border-color);
    }

    &__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      overflow: hidden;
      font-size: 18px;
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

    &__logo-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
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
        margin: 2px 0 0;
        overflow: hidden;
        font-size: 13px;
        line-height: 19px;
        color: var(--art-gray-600);
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &__more,
    &__copy,
    &__inline-copy {
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
        outline: none !important;
      }
    }

    &__inline-copy {
      flex-shrink: 0;
      width: 22px !important;
      height: 22px !important;
      padding: 0 !important;
      font-size: 12px;
    }

    &__meta {
      display: grid;
      gap: 8px;
      margin: 14px 0 12px;

      div {
        display: grid;
        grid-template-columns: 86px minmax(0, 1fr);
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
        color: var(--art-gray-600);
      }

      dd {
        overflow: hidden;
        color: var(--art-gray-800);
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &__copy-field {
      display: flex;
      gap: 4px;
      align-items: center;

      span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &__secret {
      padding: 12px;
      font-size: 13px;
      line-height: 20px;
      color: var(--art-gray-800);
      background: rgba(var(--art-gray-200-rgb), 0.64);
      border-radius: 8px;

      strong {
        font-weight: 400;
        letter-spacing: 1px;
      }
    }

    &__secret-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }

    &__secret-row {
      display: flex;
      gap: 4px;
      align-items: center;

      strong {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 14px;
      margin-top: 14px;
    }
  }

  .oauth-pagination {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  @media (max-width: $device-notebook) {
    .oauth-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: $device-ipad-pro) {
    .oauth-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: $device-phone) {
    .oauth-grid {
      grid-template-columns: 1fr;
    }

    .oauth-card {
      padding: 16px;
    }
  }
</style>
