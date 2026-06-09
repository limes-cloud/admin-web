<template>
  <div class="art-full-height">
    <ElCard class="env-page-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="resetSearchParams"
        />
      </div>

      <div class="env-toolbar">
        <ElButton v-permission="'configure:env:add'" v-ripple type="primary" :icon="Plus" @click="showDialog('add')">
          新增环境
        </ElButton>
        <ElButton :icon="Refresh" :loading="loading" @click="refreshData">刷新</ElButton>
      </div>

      <div v-loading="loading" class="env-content">
        <div v-if="envList.length" class="env-grid">
          <div v-for="item in envList" :key="item.id" class="env-card">
            <div class="env-card__header">
              <div class="env-card__identity">
                <div class="env-card__icon">{{ item.name?.slice(0, 1) || item.keyword?.slice(0, 1) || 'E' }}</div>
                <div class="env-card__title">
                  <div class="env-card__name">{{ item.name }}</div>
                  <ElTag type="info" size="small">{{ item.keyword }}</ElTag>
                </div>
              </div>
              <ArtOperation :single="true" :list="operationItems" :data="item">
                <span class="env-card__more">
                  <ElIcon><MoreFilled /></ElIcon>
                </span>
              </ArtOperation>
            </div>

            <div class="env-card__desc">
              {{ item.description || '暂无环境描述' }}
            </div>

            <div class="env-card__meta">
              <div>
                <span>创建</span>
                <strong>{{ formatTime(item.createdAt) }}</strong>
              </div>
              <div>
                <span>更新</span>
                <strong>{{ formatTime(item.updatedAt) }}</strong>
              </div>
            </div>

            <div class="env-card__footer">
              <div class="env-card__status">
                <span :class="['env-card__dot', { 'is-active': item.status }]"></span>
                <span>{{ item.status ? '启用中' : '已禁用' }}</span>
              </div>
              <el-switch
                v-model="item.status"
                :disabled="!$hasPermission('configure:env:update')"
                inline-prompt
                active-text="启用"
                inactive-text="禁用"
                :before-change="handleUpdateStatus(item)"
              />
            </div>
          </div>
        </div>

        <ElEmpty v-else description="暂无环境数据" />
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
</script>

<style scoped lang="scss">
  .env-page-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    margin-top: 0;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }
  }

  .env-toolbar {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    margin: 12px 0 16px;
  }

  .env-content {
    flex: 1;
    min-height: 280px;
    overflow-y: auto;
  }

  .env-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding-bottom: 2px;
  }

  .env-card {
    display: flex;
    flex-direction: column;
    min-height: 210px;
    padding: 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 8px 24px rgb(0 0 0 / 6%);
    }
  }

  .env-card__header,
  .env-card__identity,
  .env-card__footer,
  .env-card__status {
    display: flex;
    align-items: center;
  }

  .env-card__header,
  .env-card__footer {
    justify-content: space-between;
  }

  .env-card__identity {
    min-width: 0;
    gap: 10px;
  }

  .env-card__icon {
    display: flex;
    flex: 0 0 48px;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-color-primary);
    text-transform: uppercase;
    background: var(--el-color-primary-light-9);
    border-radius: 8px;
  }

  .env-card__title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    flex: 1;
    min-width: 0;
    min-height: 48px;
    gap: 6px;
  }

  .env-card__name {
    overflow: hidden;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .env-card__title :deep(.el-tag) {
    font-size: 12px;
  }

  .env-card__more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 14px;
    color: var(--el-color-primary);
    cursor: pointer;
    border-radius: 6px;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }

  .env-card__desc {
    display: -webkit-box;
    min-height: 42px;
    margin: 16px 0;
    overflow: hidden;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .env-card__meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 12px;
    margin-top: auto;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;

    div {
      min-width: 0;
    }

    span,
    strong {
      display: block;
    }

    span {
      margin-bottom: 4px;
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }

    strong {
      overflow: hidden;
      font-size: 12px;
      font-weight: 500;
      color: var(--el-text-color-regular);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .env-card__footer {
    min-height: 32px;
    padding-top: 14px;
    margin-top: 14px;
    border-top: 1px solid var(--el-border-color-lighter);

    :deep(.el-switch) {
      flex-shrink: 0;
    }
  }

  .env-card__status {
    gap: 6px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .env-card__dot {
    width: 8px;
    height: 8px;
    background: var(--el-color-danger);
    border-radius: 50%;

    &.is-active {
      background: var(--el-color-success);
    }
  }

  .env-pagination {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    padding-top: 18px;
  }

  @media (width <= 768px) {
    .env-toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .env-grid {
      grid-template-columns: 1fr;
    }

    .env-pagination {
      justify-content: center;
      overflow-x: auto;
    }
  }
</style>
