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
              <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')"> 新增网盘副本 </ElButton>
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
          <template #resource="{ row }">
            <span :title="resourceLabel(row.resourceId)">{{ resourceLabel(row.resourceId) }}</span>
          </template>
          <template #platform="{ row }">
            <ElTag :type="platformMeta(row.platform).type" effect="plain">
              {{ platformMeta(row.platform).label }}
            </ElTag>
          </template>
          <template #shareUrl="{ row }">
            <ElLink
              v-if="isHttpUrl(row.shareUrl)"
              :href="row.shareUrl"
              target="_blank"
              rel="noopener noreferrer"
              type="primary"
            >
              打开分享
            </ElLink>
            <span v-else class="muted">{{ row.shareUrl || '-' }}</span>
          </template>
          <template #status="{ row }">
            <ElSwitch
              :model-value="row.status === 0"
              inline-prompt
              active-text="正常"
              inactive-text="失效"
              :before-change="handleToggleStatus(row)"
            />
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增网盘副本' : '编辑网盘副本'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="760px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="12"
          label-width="104px"
          @submit="handleSubmit"
          @cancel="dialogVisible = false"
        />
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Delete, Edit, Plus } from '@element-plus/icons-vue'

  import { useTable } from '@/composables/useTable'
  import { GetResource, ListResources } from '@/api/psou/resource/api'
  import type { Resource } from '@/api/psou/resource/type'
  import {
    CreateNetdisk,
    DeleteNetdisk,
    ListNetdisks,
    UpdateNetdisk,
    UpdateNetdiskStatus
  } from '@/api/psou/netdisk/api'
  import type { CreateNetdiskRequest, Netdisk, UpdateNetdiskRequest } from '@/api/psou/netdisk/type'
  import { getFileSize } from '@/utils/file'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'PsouNetdisk' })

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Netdisk>>({})

  const platformOptions = [
    { label: '夸克', value: 'quark' },
    { label: '百度', value: 'baidu' },
    { label: '迅雷', value: 'xunlei' }
  ]

  const platformMeta = (platform: string) => {
    switch (platform) {
      case 'baidu':
        return { label: '百度', type: 'primary' as const }
      case 'xunlei':
        return { label: '迅雷', type: 'warning' as const }
      case 'quark':
        return { label: '夸克', type: 'success' as const }
      default:
        return { label: platform || '-', type: 'info' as const }
    }
  }

  const resourceOptions = ref<{ label: string; value: number }[]>([])
  const resourceNameMap = ref(new Map<number, string>())

  const mergeResourceOptions = (list: Resource[]) => {
    const map = new Map(resourceOptions.value.map((item) => [item.value, item]))
    list.forEach((item) => {
      map.set(item.id, { label: item.title, value: item.id })
      resourceNameMap.value.set(item.id, item.title)
    })
    resourceOptions.value = Array.from(map.values())
  }

  const loadResourceOptions = async (keyword?: string) => {
    const res = await ListResources({
      page: 1,
      pageSize: 50,
      keyword: keyword || undefined
    })
    mergeResourceOptions(res.list)
  }

  const resolvingResourceIds = new Set<number>()
  const ensureResourceNames = async (ids: number[]) => {
    const pending = Array.from(new Set(ids)).filter(
      (id) => id > 0 && !resourceNameMap.value.has(id) && !resolvingResourceIds.has(id)
    )
    if (pending.length === 0) return
    await Promise.all(
      pending.map(async (id) => {
        resolvingResourceIds.add(id)
        try {
          const item = await GetResource({ id })
          mergeResourceOptions([item])
        } catch {
          // 资源已删除时保留 #id 占位，不阻断列表
        } finally {
          resolvingResourceIds.delete(id)
        }
      })
    )
  }

  const resourceLabel = (id: number) => {
    return resourceNameMap.value.get(id) || `#${id}`
  }

  const searchForm = ref({
    resourceId: undefined as number | undefined,
    platform: undefined as string | undefined,
    status: undefined as number | undefined
  })

  const searchItems = computed(() => [
    {
      label: '所属资源',
      key: 'resourceId',
      type: 'select',
      props: {
        placeholder: '输入资源标题搜索',
        clearable: true,
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => loadResourceOptions(query),
        options: resourceOptions.value
      }
    },
    {
      label: '网盘平台',
      key: 'platform',
      type: 'select',
      props: {
        placeholder: '请选择网盘平台',
        clearable: true,
        options: platformOptions
      }
    },
    {
      label: '副本状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择副本状态',
        clearable: true,
        options: [
          { label: '正常', value: 0 },
          { label: '失效', value: 1 }
        ]
      }
    }
  ])

  const formItems = computed(() => [
    {
      key: 'resourceId',
      label: '所属资源',
      type: 'select',
      props: {
        placeholder: '输入资源标题搜索',
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => loadResourceOptions(query),
        options: resourceOptions.value,
        disabled: dialogType.value === 'edit',
        rules: [{ required: true, message: '请选择所属资源', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'platform',
      label: '网盘平台',
      type: 'select',
      props: {
        options: platformOptions,
        rules: [{ required: true, message: '请选择网盘平台', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'shareUrl',
      span: 24,
      label: '分享链接',
      type: 'input',
      props: {
        placeholder: '请输入分享链接',
        maxlength: 512,
        rules: [{ required: true, message: '请输入分享链接', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'fromUrl',
      span: 24,
      label: '来源链接',
      type: 'input',
      props: {
        placeholder: '请输入来源链接',
        maxlength: 512
      }
    },
    {
      key: 'userId',
      label: '上传用户',
      type: 'number',
      defaultValue: 0,
      tip: '填写用户 ID，0 表示系统上传',
      props: {
        min: 0,
        align: 'left',
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'accountId',
      label: '网盘账号',
      type: 'number',
      defaultValue: 0,
      tip: '填写网盘账号 ID，0 表示未绑定',
      props: {
        min: 0,
        align: 'left',
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'fsId',
      label: '平台文件',
      type: 'input',
      tip: '网盘平台内的文件 ID，可留空',
      props: {
        placeholder: '可留空',
        maxlength: 128
      }
    },
    {
      key: 'size',
      label: '文件大小',
      type: 'number',
      defaultValue: 0,
      tip: '单位：字节',
      props: {
        min: 0,
        align: 'left',
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'formatText',
      label: '格式文本',
      type: 'input',
      props: {
        placeholder: '如 4K / MKV',
        maxlength: 64
      }
    },
    {
      key: 'folderCount',
      label: '文件夹数',
      type: 'number',
      defaultValue: 0,
      props: {
        min: 0,
        align: 'left',
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'fileCount',
      label: '文件数量',
      type: 'number',
      defaultValue: 0,
      props: {
        min: 0,
        align: 'left',
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'sort',
      label: '排序权重',
      type: 'number',
      defaultValue: 0,
      props: {
        min: -9999,
        max: 9999,
        align: 'left',
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'ext',
      label: '扩展配置',
      type: 'input',
      span: 24,
      props: {
        type: 'textarea',
        rows: 6,
        placeholder: '可选，格式为 JSON 对象'
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '编辑副本',
      color: 'warning',
      click: (record: Netdisk) => showDialog('edit', record)
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除副本',
      color: 'danger',
      click: async (record: Netdisk) => {
        await DeleteNetdisk({ id: record.id })
        refreshRemove()
      }
    }
  ]

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
      apiFn: ListNetdisks,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'resourceId',
          label: '所属资源',
          minWidth: 200,
          useSlot: true,
          slotName: 'resource'
        },
        {
          prop: 'platform',
          label: '网盘平台',
          width: 100,
          useSlot: true,
          slotName: 'platform'
        },
        {
          prop: 'shareUrl',
          label: '分享链接',
          minWidth: 170,
          useSlot: true,
          slotName: 'shareUrl'
        },
        {
          prop: 'size',
          label: '文件大小',
          width: 100,
          formatter: (row: Netdisk) => getFileSize(Number(row.size) || 0)
        },
        {
          prop: 'status',
          label: '副本状态',
          width: 110,
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'sort',
          label: '排序权重',
          width: 100
        },
        {
          prop: 'lastCheckedAt',
          label: '最近检测',
          width: 170,
          formatter: (row: Netdisk) => (row.lastCheckedAt ? formatTime(row.lastCheckedAt) : '-')
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          width: 170,
          formatter: (row: Netdisk) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '更新时间',
          width: 170,
          formatter: (row: Netdisk) => formatTime(row.updatedAt)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 110,
          fixed: 'right',
          useSlot: true,
          slotName: 'operation'
        }
      ]
    },
    hooks: {
      onSuccess: (list: unknown) => {
        void ensureResourceNames((list as Netdisk[]).map((item) => item.resourceId))
      }
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: Form.DialogType, row?: Netdisk) => {
    dialogType.value = type
    if (type === 'add') {
      currentData.value = {
        platform: 'quark',
        userId: 0,
        accountId: 0,
        size: 0,
        folderCount: 0,
        fileCount: 0,
        sort: 0
      }
    } else if (row) {
      if (!resourceOptions.value.some((item) => item.value === row.resourceId)) {
        resourceOptions.value.unshift({
          label: resourceLabel(row.resourceId),
          value: row.resourceId
        })
      }
      currentData.value = {
        ...row,
        userId: Number(row.userId) || 0,
        size: Number(row.size) || 0
      }
    }
    dialogVisible.value = true
  }

  const buildPayload = () => {
    const item = currentData.value
    const ext = String(item.ext || '').trim()
    if (ext) {
      let parsed: unknown
      try {
        parsed = JSON.parse(ext)
      } catch {
        ElMessage.error('扩展 JSON 格式不正确')
        return null
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        ElMessage.error('扩展 JSON 必须是对象')
        return null
      }
    }
    return {
      resourceId: Number(item.resourceId),
      platform: String(item.platform || ''),
      shareUrl: String(item.shareUrl || '').trim(),
      fromUrl: String(item.fromUrl || '').trim(),
      userId: Number(item.userId) || 0,
      accountId: Number(item.accountId) || 0,
      fsId: String(item.fsId || '').trim(),
      size: Number(item.size) || 0,
      formatText: String(item.formatText || '').trim(),
      folderCount: Number(item.folderCount) || 0,
      fileCount: Number(item.fileCount) || 0,
      sort: Number(item.sort) || 0,
      ext
    }
  }

  const handleSubmit = async () => {
    const payload = buildPayload()
    if (!payload) return
    if (dialogType.value === 'add') {
      await CreateNetdisk(payload as CreateNetdiskRequest)
      ElMessage.success('创建成功，副本初始为失效，请检测后标记正常')
      refreshCreate()
    } else {
      await UpdateNetdisk({ id: Number(currentData.value.id), ...payload } as UpdateNetdiskRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleToggleStatus = (row: Netdisk): (() => Promise<boolean>) => {
    return async () => {
      const next = row.status === 0 ? 1 : 0
      try {
        await ElMessageBox.confirm(
          `确定将「${resourceLabel(row.resourceId)} · ${platformMeta(row.platform).label}」标记为${next === 0 ? '正常' : '失效'}吗？`,
          '温馨提示',
          { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
        )
        await UpdateNetdiskStatus({ id: row.id, status: next })
        ElMessage.success('修改成功')
        refreshData()
        return true
      } catch {
        return false
      }
    }
  }

  const isHttpUrl = (url: string) => /^https?:\/\//i.test(url || '')

  onMounted(() => loadResourceOptions())
</script>

<style scoped>
  .muted {
    color: var(--el-text-color-placeholder);
  }
</style>
