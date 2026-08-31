<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ElAlert
        class="env-guide"
        type="primary"
        title="环境用于区分开发、测试、生产等不同配置值，环境标识作为接口调用和配置同步的唯一标识，建议使用稳定的英文小写命名。"
        :closable="false"
        show-icon
      />

      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="resetSearchParams"
        />
      </div>

      <div class="table">
        <ArtTableHeader :loading="loading" layout="refresh,fullscreen" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton
                v-permission="'configure:env:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
              >
                新增环境
              </ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <div class="env-card-scroll">
          <ElEmpty v-if="!loading && !envList.length" description="暂无环境数据" />

          <div v-else v-loading="loading" class="env-grid">
            <article v-for="item in envList" :key="item.id" class="env-card">
              <div class="env-card__header">
                <div class="env-card__icon" :class="getIconClass(item)">{{ getEnvInitial(item) }}</div>

                <div class="env-card__title">
                  <h2>{{ item.name }}</h2>
                  <p>{{ item.description || '暂无环境描述' }}</p>
                </div>

                <ArtOperation :single="true" :list="operationItems" :data="item" :has-background="false">
                  <ElButton class="env-card__more" text :icon="MoreFilled" />
                </ArtOperation>
              </div>

              <dl class="env-card__meta">
                <div>
                  <dt>环境标识</dt>
                  <dd>{{ item.keyword }}</dd>
                </div>
                <div>
                  <dt>创建时间</dt>
                  <dd>{{ formatTime(item.createdAt) }}</dd>
                </div>
                <div>
                  <dt>更新时间</dt>
                  <dd>{{ formatTime(item.updatedAt) }}</dd>
                </div>
              </dl>

              <div class="env-card__footer">
                <el-switch
                  v-model="item.status"
                  :disabled="!$hasPermission('configure:env:update')"
                  inline-prompt
                  active-text="启用"
                  inactive-text="禁用"
                  :before-change="handleUpdateStatus(item)"
                />
                <ElTag :type="item.status ? 'success' : 'info'" effect="light">
                  {{ item.status ? '启用中' : '已禁用' }}
                </ElTag>
              </div>
            </article>
          </div>
        </div>

        <div v-if="pagination.total > 0" class="env-pagination">
          <ElPagination
            background
            :total="pagination.total"
            :page-size="pagination.size"
            :current-page="pagination.current"
            :page-sizes="[10, 20, 30, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增环境' : '编辑环境'"
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
        />
      </ElDialog>

      <ElDialog v-model="tokenVisible" title="环境密钥" width="480px" align-center>
        <ElInput v-model="currentToken" readonly>
          <template #append>
            <ElButton @click="handleCopyToken">复制</ElButton>
          </template>
        </ElInput>
        <template #footer>
          <ElButton @click="tokenVisible = false">关闭</ElButton>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus, Edit, Delete, Key, Refresh, MoreFilled } from '@element-plus/icons-vue'
  import { ListEnv, CreateEnv, UpdateEnv, DeleteEnv, GetEnvToken, ResetEnvToken } from '@/api/configure/env/api'
  import { Env, CreateEnvRequest, UpdateEnvRequest } from '@/api/configure/env/type'
  import { formatTime } from '@/utils/time'
  import { useClipboard } from '@vueuse/core'

  defineOptions({ name: 'ConfigureEnv' })

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Env>>({})
  const tokenVisible = ref(false)
  const currentToken = ref('')

  const { copy } = useClipboard()

  const searchForm = ref({ keyword: undefined, name: undefined, status: undefined })

  const searchItems = [
    { label: '环境标识', key: 'keyword', type: 'input', props: { placeholder: '请输入环境标识', clearable: true } },
    { label: '环境名称', key: 'name', type: 'input', props: { placeholder: '请输入环境名称', clearable: true } },
    {
      label: '环境状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择环境状态',
        clearable: true,
        options: [
          { label: '启用', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ]

  const formItems = [
    {
      key: 'name',
      label: '环境名称',
      type: 'input',
      props: {
        placeholder: '请输入环境名称',
        rules: [{ required: true, message: '请输入环境名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'keyword',
      label: '环境标识',
      type: 'input',
      props: {
        placeholder: '请输入环境标识',
        rules: [{ required: true, message: '请输入环境标识', trigger: ['blur', 'change'] }]
      }
    },
    { key: 'description', label: '环境描述', type: 'input', props: { placeholder: '请输入环境描述', type: 'textarea' } }
  ]

  const operationItems = [
    {
      icon: Key,
      label: '获取密钥',
      color: 'primary',
      permission: 'configure:env:token:query',
      click: async (row: Env) => {
        const res = await GetEnvToken(row.id)
        currentToken.value = res.token
        tokenVisible.value = true
      }
    },
    {
      icon: Refresh,
      label: '重置密钥',
      color: 'warning',
      permission: 'configure:env:token:reset',
      click: async (row: Env) => {
        await ElMessageBox.confirm('确认要重置此环境的密钥？重置后旧密钥将立即失效。', '提示', { type: 'warning' })
        const res = await ResetEnvToken(row.id)
        currentToken.value = res.token
        tokenVisible.value = true
        ElMessage.success('重置成功')
      }
    },
    {
      icon: Edit,
      label: '修改',
      color: 'warning',
      permission: 'configure:env:update',
      click: (row: Env) => showDialog('edit', row)
    },
    {
      icon: Delete,
      label: '删除',
      color: 'danger',
      popConfirm: true,
      permission: 'configure:env:delete',
      click: async (row: Env) => {
        await DeleteEnv({ id: row.id })
        refreshRemove()
      }
    }
  ]

  const {
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
    core: {
      apiFn: ListEnv,
      apiParams: { page: 1, pageSize: 10, ...searchForm.value }
    }
  })

  const envList = computed(() => data.value as Env[])

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: Form.DialogType, row?: Env) => {
    dialogType.value = type
    currentData.value = row ? { ...row } : {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateEnv(currentData.value as CreateEnvRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateEnv(currentData.value as UpdateEnvRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (row: Env): (() => Promise<boolean>) => {
    return () =>
      new Promise((resolve) => {
        ElMessageBox.confirm(`确认要${row.status ? '禁用' : '启用'}此环境？`, '提示', { type: 'warning' })
          .then(async () => {
            await UpdateEnv({ id: row.id, status: !row.status })
            ElMessage.success('操作成功')
            refreshUpdate()
            resolve(true)
          })
          .catch(() => resolve(false))
      })
  }

  const handleCopyToken = () => {
    copy(currentToken.value)
    ElMessage.success('复制成功')
  }

  const getEnvInitial = (item: Env) => (item.name || item.keyword || 'E').slice(0, 1).toUpperCase()

  const getIconClass = (item: Env) => {
    const index = Math.abs(item.id || 0) % 6
    return `is-tone-${index}`
  }
</script>

<style scoped lang="scss">
  :deep(.table) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .env-guide {
    margin-bottom: 12px;
  }

  .env-card-scroll {
    flex: 1;
    min-height: 0;
    margin-top: 12px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .env-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .env-card {
    display: flex;
    flex-direction: column;
    min-height: 216px;
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
    }

    &__icon {
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
        outline: none !important;
      }
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

      :deep(.el-switch) {
        flex-shrink: 0;
      }
    }
  }

  .env-pagination {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  @media (max-width: $device-notebook) {
    .env-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: $device-ipad-pro) {
    .env-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: $device-phone) {
    .env-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .env-card {
      padding: 16px;

      &__header {
        grid-template-columns: 48px minmax(0, 1fr) 32px;
        gap: 12px;
      }

      &__icon {
        width: 48px;
        height: 48px;
      }
    }
  }
</style>
