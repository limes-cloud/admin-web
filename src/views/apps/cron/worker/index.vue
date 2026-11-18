<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
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
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElButton
              v-permission="'cron:worker_group:query'"
              :icon="Expand"
              @click="router.push({ name: 'CronWorkerGroup' })"
            >
              分组管理
            </ElButton>
            <ElButton v-permission="'cron:worker:add'" v-ripple type="primary" :icon="Plus" @click="showDialog('add')">
              新增节点
            </ElButton>
          </template>
        </ArtTableHeader>

        <!-- 节点卡片列表 -->
        <div class="worker-card-scroll">
          <ElEmpty v-if="!loading && !data.length" description="暂无节点" />
          <div v-else v-loading="loading" class="worker-grid">
            <article v-for="item in (data as Worker[])" :key="item.id" class="worker-card">
              <div class="worker-card__header">
                <div class="worker-card__logo">
                  <ElIcon><Cpu /></ElIcon>
                </div>
                <div class="worker-card__title">
                  <h3>{{ item.name }}</h3>
                  <p>{{ item.ip }}</p>
                </div>
                <ArtOperation :single="true" :list="operationItems" :data="item" :has-background="false">
                  <ElButton class="worker-card__more" text :icon="MoreFilled" />
                </ArtOperation>
              </div>

              <dl class="worker-card__meta">
                <div>
                  <dt>所属分组</dt>
                  <dd>{{ item.group?.name || '未分组' }}</dd>
                </div>
                <div>
                  <dt>可用应用</dt>
                  <dd>
                    <template v-if="item.apps && item.apps.length">
                      <ElTag v-for="app in item.apps" :key="app" class="app-tag" size="small" effect="plain">
                        {{ app }}
                      </ElTag>
                    </template>
                    <span v-else>全部应用</span>
                  </dd>
                </div>
                <div>
                  <dt>节点描述</dt>
                  <dd>{{ item.description || '暂无描述' }}</dd>
                </div>
                <div>
                  <dt>最后在线</dt>
                  <dd>
                    <ElTooltip v-if="item.lastError" :content="'最近错误：' + item.lastError">
                      <span>{{ item.lastHeartbeat ? formatTime(item.lastHeartbeat) : '从未在线' }}</span>
                    </ElTooltip>
                    <span v-else>{{ item.lastHeartbeat ? formatTime(item.lastHeartbeat) : '从未在线' }}</span>
                  </dd>
                </div>
                <div>
                  <dt>检测时间</dt>
                  <dd>{{ item.lastCheckAt ? formatTime(item.lastCheckAt) : '未检测' }}</dd>
                </div>
              </dl>

              <div class="worker-card__footer">
                <ElTag :type="isOnline(item) ? 'success' : 'info'" size="small">
                  {{ isOnline(item) ? '在线' : '离线' }}
                </ElTag>
                <ElSwitch
                  v-model="item.status"
                  :disabled="!$hasPermission('cron:worker:update')"
                  inline-prompt
                  active-text="启用"
                  inactive-text="禁用"
                  :before-change="handleUpdateStatus(item)"
                />
              </div>
            </article>
          </div>
        </div>

        <div v-if="pagination.total > 0" class="worker-pagination">
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

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增节点' : '编辑节点'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="520px"
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
  import { useRouter } from 'vue-router'
  import { Plus, Edit, Delete, Expand, MoreFilled, Cpu } from '@element-plus/icons-vue'
  import { ListApp } from '@/api/manager/app/api'
  import type { App } from '@/api/manager/app/type'
  import {
    ListWorker,
    CreateWorker,
    UpdateWorker,
    UpdateWorkerStatus,
    DeleteWorker,
    ListWorkerGroup
  } from '@/api/cron/worker/api'
  import { Worker, CreateWorkerRequest, UpdateWorkerRequest } from '@/api/cron/worker/type'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'CronWorker' })

  const router = useRouter()

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Worker>>({})
  const groupOptions = ref<{ label: string; value: number }[]>([])
  const appOptions = ref<{ label: string; value: string }[]>([])

  const searchForm = ref({ name: undefined, ip: undefined, groupId: undefined, status: undefined })
  const searchItems = computed(() => [
    { label: '节点名称', key: 'name', type: 'input', props: { placeholder: '请输入节点名称', clearable: true } },
    { label: '节点IP', key: 'ip', type: 'input', props: { placeholder: '请输入节点IP', clearable: true } },
    {
      label: '所属分组',
      key: 'groupId',
      type: 'select',
      props: { placeholder: '请选择分组', clearable: true, options: groupOptions.value }
    },
    {
      label: '节点状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '在线', value: true },
          { label: '离线', value: false }
        ]
      }
    }
  ])

  const formItems = computed(() => [
    {
      key: 'name',
      label: '节点名称',
      type: 'input',
      props: {
        placeholder: '请输入节点名称',
        rules: [{ required: true, message: '请输入节点名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'ip',
      label: '节点IP',
      type: 'input',
      props: {
        placeholder: '请输入节点IP',
        disabled: dialogType.value === 'edit' && currentData.value.status,
        rules: [{ required: true, message: '请输入节点IP', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'groupId',
      label: '所属分组',
      type: 'select',
      props: {
        placeholder: '请选择所属分组',
        options: groupOptions.value,
        rules: [{ required: true, message: '请选择所属分组', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'ak',
      label: 'Access Key',
      type: 'input',
      props: {
        placeholder: '请输入AK',
        disabled: dialogType.value === 'edit' && currentData.value.status,
        rules: [{ required: true, message: '请输入AK', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'sk',
      label: 'Secret Key',
      type: 'input',
      props: {
        placeholder: '请输入SK',
        disabled: dialogType.value === 'edit' && currentData.value.status,
        rules: [{ required: true, message: '请输入SK', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'apps',
      label: '可用应用',
      type: 'select',
      props: {
        placeholder: '选择可用的标准应用（可多选；留空 = 所有应用可用）',
        clearable: true,
        multiple: true,
        options: appOptions.value
      }
    },
    { key: 'description', label: '节点描述', type: 'input', props: { placeholder: '请输入节点描述', type: 'textarea' } }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改',
      color: 'warning',
      permission: 'cron:worker:update',
      click: (row: Worker) => showDialog('edit', row)
    },
    {
      icon: Delete,
      label: '删除',
      color: 'danger',
      popConfirm: true,
      permission: 'cron:worker:delete',
      click: async (row: Worker) => {
        await DeleteWorker({ id: row.id })
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
    core: {
      apiFn: ListWorker,
      apiParams: { page: 1, pageSize: 12, ...searchForm.value },
      columnsFactory: () => [
        { type: 'index', width: '60', label: '#' },
        { prop: 'name', label: '节点名称' },
        { prop: 'ip', label: '节点IP' }
      ]
    }
  })

  // 在线判定：last_heartbeat 在 90s 窗口内（与后端选机条件一致）
  const isOnline = (row: Worker) => !!row.lastHeartbeat && Date.now() / 1000 - row.lastHeartbeat < 90

  // 加载标准应用（type=app）供"可用应用"选择：业务应用才可被授权使用节点
  const loadApps = async () => {
    const res = await ListApp({ page: 1, pageSize: 50 })
    appOptions.value = (res.list || [])
      .filter((a: App) => a.type === 'app')
      .map((a: App) => ({ label: a.name, value: a.keyword }))
  }
  loadApps()

  const loadGroups = async () => {
    const res = await ListWorkerGroup({ page: 1, pageSize: 50 })
    groupOptions.value = res.list.map((g) => ({ label: g.name, value: g.id }))
  }
  loadGroups()

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: Form.DialogType, row?: Worker) => {
    dialogType.value = type
    currentData.value = row ? { ...row } : {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateWorker(currentData.value as CreateWorkerRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateWorker(currentData.value as UpdateWorkerRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (row: Worker): (() => Promise<boolean>) => {
    return () =>
      new Promise((resolve) => {
        ElMessageBox.confirm(`确认要${row.status ? '下线' : '上线'}此节点？`, '提示', { type: 'warning' })
          .then(async () => {
            await UpdateWorkerStatus({ id: row.id, status: !row.status })
            ElMessage.success('操作成功')
            refreshUpdate()
            resolve(true)
          })
          .catch(() => resolve(false))
      })
  }
</script>

<style lang="scss" scoped>
  :deep(.table) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .worker-card-scroll {
    flex: 1;
    min-height: 0;
    margin-top: 12px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .worker-grid {
    display: grid;
    /* 自适应列数：每卡最小 300px，宽屏多列 / 窄屏自动降列，避免卡片过窄 */
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 14px;
  }

  .worker-card {
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
      align-items: center; /* 名称/IP 与头像垂直居中 */
      padding-bottom: 14px;
      border-bottom: 1px solid var(--art-border-color);
    }

    &__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      font-size: 22px;
      color: rgb(var(--art-primary));
      background: rgb(var(--art-bg-primary));
      border-radius: 8px;
    }

    &__title {
      min-width: 0;

      h3 {
        margin: 0 0 4px;
        overflow: hidden;
        font-size: 15px;
        font-weight: 600;
        color: var(--art-text-1);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      p {
        margin: 0;
        font-size: 12px;
        color: var(--art-text-3);
      }
    }

    &__more {
      padding: 4px;
    }

    &__meta {
      display: grid;
      margin: 0;
      padding: 14px 0;
      font-size: 12px;
      border-bottom: 1px solid var(--art-border-color);

      > div {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 22px;

        & + div {
          margin-top: 8px;
        }
      }

      dt {
        flex-shrink: 0;
        width: 56px;
        color: var(--art-text-3);
      }

      dd {
        flex: 1;
        margin: 0;
        color: var(--art-text-1);
        word-break: break-all;
      }
    }

    &__footer {
      display: flex;
      align-items: center;
      justify-content: space-between; /* 左状态、右开关 */
      padding-top: 12px;
    }
  }

  .app-tag {
    margin-right: 4px;

    &:last-child {
      margin-right: 0;
    }
  }

  .worker-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }
</style>