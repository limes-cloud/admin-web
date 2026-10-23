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
            <ElSpace wrap>
              <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')"> 新增账号 </ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #name="{ row }">
            <div class="account-cell">
              <b>{{ row.name }}</b>
              <small>{{ row.defaultDir || '未设置默认目录' }}</small>
            </div>
          </template>
          <template #platform="{ row }">
            <ElTag :type="platformMeta(row.platform).type" effect="plain">
              {{ platformMeta(row.platform).label }}
            </ElTag>
          </template>
          <template #status="{ row }">
            <ElTag :type="accountStatus(row.status).type" effect="light" size="small">
              {{ accountStatus(row.status).label }}
            </ElTag>
          </template>
          <template #storage="{ row }">
            <span v-if="row.storageTotal > 0">
              {{ getFileSize(row.storageUsed) || '0B' }} / {{ getFileSize(row.storageTotal) }}
            </span>
            <span v-else class="muted">未探测</span>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems(row)" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增账号' : '编辑账号'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="680px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="12"
          label-width="110px"
          @submit="handleSubmit"
          @cancel="dialogVisible = false"
        />
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Delete, Edit, Plus, Refresh } from '@element-plus/icons-vue'

  import { useTable } from '@/composables/useTable'
  import { CheckAccount, CreateAccount, DeleteAccount, ListAccounts, UpdateAccount } from '@/api/psou/account/api'
  import type { Account, AccountExt, CreateAccountRequest, UpdateAccountRequest } from '@/api/psou/account/type'
  import { getFileSize } from '@/utils/file'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'PsouAccount' })

  type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Account>>({})
  const checkingAccountId = ref<number | null>(null)

  const platformOptions = [
    { label: '百度网盘', value: 'baidu' },
    { label: '夸克网盘', value: 'quark' }
  ]

  const platformLabels: Record<string, string> = {
    baidu: '百度网盘',
    quark: '夸克网盘',
    xunlei: '迅雷网盘'
  }

  const statusOptions = [
    { label: '正常', value: 1 },
    { label: '停用', value: 0 },
    { label: '失效', value: -1 }
  ]

  const platformMeta = (platform: string): { label: string; type: TagType } => {
    const typeMap: Record<string, TagType> = {
      baidu: 'primary',
      quark: 'success',
      xunlei: 'info'
    }
    return {
      label: platformLabels[platform] || platform || '未知',
      type: typeMap[platform] || 'info'
    }
  }

  const accountStatus = (status: number): { label: string; type: TagType } => {
    const map: Record<number, { label: string; type: TagType }> = {
      1: { label: '正常', type: 'success' },
      0: { label: '停用', type: 'info' },
      [-1]: { label: '失效', type: 'danger' }
    }
    return map[status] ?? { label: '未知', type: 'info' }
  }

  const parseExt = (raw?: string): AccountExt => {
    if (!raw) return {}
    try {
      const ext = JSON.parse(raw)
      return ext && typeof ext === 'object' && !Array.isArray(ext) ? ext : {}
    } catch {
      return {}
    }
  }

  const searchForm = ref({
    platform: undefined as string | undefined,
    status: undefined as number | undefined
  })

  const searchItems = computed(() => [
    {
      label: '平台类型',
      key: 'platform',
      type: 'select',
      props: {
        placeholder: '请选择平台类型',
        clearable: true,
        options: platformOptions
      }
    },
    {
      label: '账号状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择账号状态',
        clearable: true,
        options: statusOptions
      }
    }
  ])

  const formItems = computed(() => [
    {
      key: 'name',
      label: '账号名称',
      type: 'input',
      props: {
        placeholder: dialogType.value === 'add' ? '留空自动获取平台昵称' : '请输入账号名称或备注名',
        maxlength: 128,
        rules: [
          {
            required: dialogType.value === 'edit',
            message: '请输入账号名称',
            trigger: ['blur', 'change']
          }
        ]
      }
    },
    {
      key: 'platform',
      label: '平台类型',
      type: 'select',
      props: {
        placeholder: '请选择平台类型',
        options: platformOptions,
        disabled: dialogType.value === 'edit',
        rules: [{ required: true, message: '请选择平台类型', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'cookie',
      span: 24,
      label: '登录态 Cookie',
      type: 'input',
      props: {
        type: 'textarea',
        rows: 4,
        maxlength: 8192,
        placeholder: '请输入账号 Cookie',
        rules: [{ required: true, message: '请输入账号 Cookie', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'defaultDir',
      label: '默认目录',
      type: 'input',
      props: {
        placeholder: '百度填写目录路径，夸克填写顶层目录名',
        maxlength: 255
      }
    },
    {
      key: 'priority',
      label: '调度优先级',
      type: 'number',
      defaultValue: 0,
      tip: '数值越大越优先',
      props: {
        min: -999999,
        max: 999999,
        align: 'left',
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'status',
      label: '账号状态',
      type: 'select',
      hidden: dialogType.value === 'add',
      props: {
        placeholder: '请选择账号状态',
        options: statusOptions,
        rules: [{ required: true, message: '请选择账号状态', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'remark',
      span: 24,
      label: '备注',
      type: 'input',
      props: {
        type: 'textarea',
        rows: 2,
        maxlength: 255,
        placeholder: '账号来源、限制说明等'
      }
    }
  ])

  const operationItems = (row: Account) => {
    const checking = checkingAccountId.value === row.id
    return [
      {
        icon: Refresh,
        label: checking ? '检测中...' : '健康检查',
        color: 'primary',
        disabled: checking,
        click: (record: Account) => handleCheck(record)
      },
      {
        icon: Edit,
        label: '编辑账号',
        color: 'warning',
        click: (record: Account) => showDialog('edit', record)
      },
      {
        icon: Delete,
        popConfirm: true,
        label: '删除账号',
        color: 'danger',
        click: async (record: Account) => {
          await DeleteAccount({ accountId: record.id })
          ElMessage.success('删除成功')
          refreshRemove()
        }
      }
    ]
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    searchParams,
    pagination,
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
      apiFn: ListAccounts,
      apiParams: {
        page: 1,
        pageSize: 10,
        orderBy: 'priority',
        order: 'desc',
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'name',
          label: '账号名称',
          minWidth: 190,
          useSlot: true,
          slotName: 'name'
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 180,
          showOverflowTooltip: true,
          formatter: (row: Account) => row.remark || '-'
        },
        {
          prop: 'platform',
          label: '平台类型',
          width: 110,
          useSlot: true,
          slotName: 'platform'
        },
        {
          prop: 'status',
          label: '账号状态',
          width: 100,
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'storage',
          label: '存储用量',
          width: 180,
          useSlot: true,
          slotName: 'storage'
        },
        {
          prop: 'priority',
          label: '优先级',
          width: 90
        },
        {
          prop: 'lastCheckAt',
          label: '最近检测',
          width: 170,
          formatter: (row: Account) => {
            const lastCheckAt = parseExt(row.ext).lastCheckAt
            return lastCheckAt ? formatTime(lastCheckAt) : '-'
          }
        },
        {
          prop: 'updatedAt',
          label: '更新时间',
          width: 170,
          formatter: (row: Account) => formatTime(row.updatedAt)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 150,
          fixed: 'right',
          useSlot: true,
          slotName: 'operation'
        }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: Form.DialogType, row?: Account) => {
    dialogType.value = type
    currentData.value =
      type === 'add'
        ? {
            platform: 'baidu',
            name: '',
            cookie: '',
            defaultDir: '',
            priority: 0,
            remark: ''
          }
        : { ...(row as Account) }
    if (type === 'edit') {
      currentData.value.status = Number(currentData.value.status ?? 1)
    }
    dialogVisible.value = true
  }

  const buildPayload = () => {
    const item = currentData.value
    return {
      platform: String(item.platform || ''),
      name: String(item.name || '').trim(),
      cookie: String(item.cookie || '').trim(),
      defaultDir: String(item.defaultDir || '').trim(),
      priority: Number(item.priority) || 0,
      remark: String(item.remark || '').trim()
    }
  }

  const handleSubmit = async () => {
    const payload = buildPayload()
    if (dialogType.value === 'add') {
      await CreateAccount(payload as CreateAccountRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateAccount({
        accountId: Number(currentData.value.id),
        name: payload.name,
        cookie: payload.cookie,
        defaultDir: payload.defaultDir,
        status: Number(currentData.value.status ?? 1),
        priority: payload.priority,
        remark: payload.remark
      } as UpdateAccountRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleCheck = async (row: Account) => {
    if (checkingAccountId.value !== null) return
    checkingAccountId.value = row.id
    try {
      await CheckAccount({ accountId: row.id })
      ElMessage.success('检测完成')
      refreshData()
    } finally {
      checkingAccountId.value = null
    }
  }
</script>

<style scoped>
  .account-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .account-cell small {
    overflow: hidden;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .muted {
    color: var(--el-text-color-placeholder);
  }
</style>
