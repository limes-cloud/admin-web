<template>
  <div class="art-full-height">
    <ElCard class="server-page-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="resetSearchParams"
        />
      </div>

      <div class="server-toolbar">
        <ElButton v-permission="'configure:server:add'" v-ripple type="primary" :icon="Plus" @click="showDialog('add')">
          新增服务
        </ElButton>
        <ElButton :icon="Refresh" :loading="loading" @click="refreshData">刷新</ElButton>
      </div>

      <div class="server-overview">
        <div class="server-overview__main">
          <span>服务配置</span>
          <strong>{{ pagination.total }}</strong>
          <em>统一维护业务服务标识、启用状态和基础描述。</em>
        </div>
        <div class="server-overview__stats">
          <div>
            <span>当前页启用</span>
            <strong>{{ activeServerCount }}</strong>
          </div>
          <div>
            <span>当前页禁用</span>
            <strong>{{ inactiveServerCount }}</strong>
          </div>
        </div>
      </div>

      <div v-loading="loading" class="server-content">
        <div v-if="serverList.length" class="server-grid">
          <div
            v-for="item in serverList"
            :key="item.id"
            class="server-banner-card"
            :class="{ 'is-disabled': !item.status }"
          >
            <div class="server-banner-card__top">
              <ElTag type="info" size="small">{{ item.keyword }}</ElTag>
              <ElTag :type="item.status ? 'success' : 'info'" size="small">
                {{ item.status ? '启用' : '禁用' }}
              </ElTag>
            </div>

            <ArtCardBanner
              height="286px"
              :title="item.name"
              :description="item.description || '暂无服务描述'"
              :button="{
                show: $hasPermission('configure:server:update'),
                text: '编辑',
                color: 'var(--main-color)',
                textColor: '#fff'
              }"
              :cancel-button="{
                show: $hasPermission('configure:server:delete'),
                text: '删除',
                color: 'var(--el-fill-color-light)',
                textColor: 'var(--el-color-danger)'
              }"
              @click="showDialog('edit', item)"
              @cancel="handleDeleteServer(item)"
            />

            <div class="server-banner-card__footer">
              <div class="server-banner-card__status">
                <span :class="['server-banner-card__dot', { 'is-active': item.status }]"></span>
                <span>{{ item.status ? '启用中' : '已禁用' }}</span>
              </div>
              <el-switch
                v-model="item.status"
                :disabled="!$hasPermission('configure:server:update')"
                inline-prompt
                active-text="启用"
                inactive-text="禁用"
                :before-change="handleUpdateStatus(item)"
              />
            </div>

            <div class="server-banner-card__meta">
              <span>创建 {{ formatTime(item.createdAt) }}</span>
              <span>更新 {{ formatTime(item.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <ElEmpty v-else description="暂无服务数据" />
      </div>

      <div v-if="pagination.total > 0" class="server-pagination">
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
        :title="dialogType === 'add' ? '新增服务' : '编辑服务'"
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
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus, Refresh } from '@element-plus/icons-vue'
  import { ListServer, CreateServer, UpdateServer, DeleteServer } from '@/api/configure/server/api'
  import { Server, CreateServerRequest, UpdateServerRequest } from '@/api/configure/server/type'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'ConfigureServer' })

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Server>>({})

  const searchForm = ref({ keyword: undefined, name: undefined, status: undefined })

  const searchItems = [
    { label: '服务标识', key: 'keyword', type: 'input', props: { placeholder: '请输入服务标识', clearable: true } },
    { label: '服务名称', key: 'name', type: 'input', props: { placeholder: '请输入服务名称', clearable: true } },
    {
      label: '服务状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择服务状态',
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
      label: '服务名称',
      type: 'input',
      props: {
        placeholder: '请输入服务名称',
        rules: [{ required: true, message: '请输入服务名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'keyword',
      label: '服务标识',
      type: 'input',
      props: {
        placeholder: '请输入服务标识',
        rules: [{ required: true, message: '请输入服务标识', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '服务描述',
      type: 'input',
      props: {
        placeholder: '请输入服务描述',
        type: 'textarea',
        rules: [{ required: true, message: '请输入服务描述', trigger: ['blur', 'change'] }]
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
      apiFn: ListServer,
      apiParams: { page: 1, pageSize: 10, ...searchForm.value }
    }
  })

  const serverList = computed(() => data.value as Server[])
  const activeServerCount = computed(() => serverList.value.filter((item) => item.status).length)
  const inactiveServerCount = computed(() => serverList.value.length - activeServerCount.value)

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: Form.DialogType, row?: Server) => {
    dialogType.value = type
    currentData.value = row ? { ...row } : {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateServer(currentData.value as CreateServerRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateServer(currentData.value as UpdateServerRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleDeleteServer = async (row: Server) => {
    await ElMessageBox.confirm('确认要删除此服务？', '温馨提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await DeleteServer({ id: row.id })
    refreshRemove()
  }

  const handleUpdateStatus = (row: Server): (() => Promise<boolean>) => {
    return () =>
      new Promise((resolve) => {
        ElMessageBox.confirm(`确认要${row.status ? '禁用' : '启用'}此服务？`, '提示', { type: 'warning' })
          .then(async () => {
            await UpdateServer({ id: row.id, status: !row.status })
            ElMessage.success('操作成功')
            refreshUpdate()
            resolve(true)
          })
          .catch(() => resolve(false))
      })
  }
</script>

<style scoped lang="scss">
  .server-page-card {
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

  .server-toolbar {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    margin: 12px 0 14px;
  }

  .server-overview {
    display: flex;
    gap: 16px;
    align-items: stretch;
    justify-content: space-between;
    padding: 16px;
    margin-bottom: 16px;
    overflow: hidden;
    background:
      linear-gradient(135deg, var(--el-color-primary-light-9), rgb(255 255 255 / 0%)), var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .server-overview__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;

    span {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    strong {
      margin: 4px 0;
      font-size: 28px;
      line-height: 1.1;
      color: var(--el-text-color-primary);
    }

    em {
      overflow: hidden;
      font-size: 13px;
      font-style: normal;
      color: var(--el-text-color-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .server-overview__stats {
    display: grid;
    grid-template-columns: repeat(2, 96px);
    gap: 10px;

    div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 10px 12px;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
    }

    span {
      margin-bottom: 4px;
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }

    strong {
      font-size: 20px;
      line-height: 1;
      color: var(--el-text-color-primary);
    }
  }

  .server-content {
    flex: 1;
    min-height: 280px;
    overflow-y: auto;
  }

  .server-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding-bottom: 2px;
  }

  .server-banner-card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 378px;
    transition: opacity 0.2s ease;

    &.is-disabled :deep(.card-banner) {
      opacity: 0.72;
    }
  }

  .server-banner-card__top {
    position: absolute;
    top: 12px;
    right: 12px;
    left: 12px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    pointer-events: none;
  }

  .server-banner-card__top :deep(.el-tag) {
    height: 22px;
    font-size: 12px;
    pointer-events: auto;
  }

  .server-banner-card__top :deep(.el-tag:first-child) {
    max-width: 44%;
    overflow: hidden;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .server-banner-card__footer {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    min-height: 48px;
    padding: 10px 14px;
    margin-top: -1px;
    background: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-lighter);
    border-right: 1px solid var(--art-card-border);
    border-bottom: 1px solid var(--art-card-border);
    border-left: 1px solid var(--art-card-border);
    border-radius: 0 0 8px 8px;

    :deep(.el-switch) {
      flex-shrink: 0;
    }
  }

  .server-banner-card__status {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .server-banner-card__dot {
    width: 8px;
    height: 8px;
    background: var(--el-color-danger);
    border-radius: 50%;

    &.is-active {
      background: var(--el-color-success);
    }
  }

  .server-banner-card__meta {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    justify-content: space-between;
    padding: 8px 14px 0;
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-placeholder);

    span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .server-banner-card :deep(.card-banner) {
    min-height: 0;
    border-radius: 8px 8px 0 0 !important;
  }

  .server-banner-card :deep(.banner-content) {
    gap: 12px;
    height: 100%;
    padding: 20px 12px 0;
  }

  .server-banner-card :deep(.banner-icon) {
    width: 116px;
  }

  .server-banner-card :deep(.banner-title) {
    margin-bottom: 6px;
    font-size: 16px;
  }

  .server-banner-card :deep(.banner-description) {
    display: -webkit-box;
    min-height: 40px;
    overflow: hidden;
    line-height: 1.5;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .server-banner-card :deep(.banner-button) {
    height: 32px;
    line-height: 32px;
  }

  .server-pagination {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    padding-top: 18px;
  }

  @media (width <= 768px) {
    .server-toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .server-overview {
      flex-direction: column;
    }

    .server-overview__main em {
      white-space: normal;
    }

    .server-overview__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .server-grid {
      grid-template-columns: 1fr;
    }

    .server-pagination {
      justify-content: center;
      overflow-x: auto;
    }
  }
</style>
