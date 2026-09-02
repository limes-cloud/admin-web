<template>
  <div class="art-full-height cuetom-table">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          ref="searchBarRef"
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="resetSearchParams"
        />
      </div>
      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" />
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #status="{ row }">
            <ElTag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</ElTag>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Delete, Download } from '@element-plus/icons-vue'
  import { DeleteExport, ListExport } from '@/api/resource/export/api'
  import { Export } from '@/api/resource/export/type'
  import { formatTime } from '@/utils/time'
  import { getFileSize } from '@/utils/file'
  import { durl } from '@/utils/resource/url'

  defineOptions({ name: 'ExportManager' })

  const searchForm = ref({ name: undefined })

  const searchItems = [
    { label: '任务名称', key: 'name', type: 'input', placeholder: '请输入任务名称', clearable: true }
  ]

  const statusLabel = (status: string) => {
    const map: Record<string, string> = { PROGRESS: '处理中', COMPLETED: '已完成' }
    return map[status] ?? status
  }

  const statusTagType = (status: string) => {
    const map: Record<string, string> = { PROGRESS: 'warning', COMPLETED: 'success' }
    return (map[status] ?? '') as any
  }

  const operationItems = [
    {
      icon: Download,
      label: '下载',
      color: 'primary',
      click: (record: Export) => {
        if (record.status === 'COMPLETED' && record.key) window.open(durl(record.key, record.name))
        else ElMessage.warning('文件尚未生成')
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除',
      color: 'danger',
      permission: 'resource:export:delete',
      click: async (record: Export) => {
        await DeleteExport({ id: record.id })
        ElMessage.success('删除成功')
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
    refreshRemove
  } = useTable({
    core: {
      apiFn: ListExport,
      apiParams: { ...searchForm.value },
      columnsFactory: () => [
        { prop: 'name', label: '任务名称' },
        {
          prop: 'size',
          label: '文件大小',
          formatter: (row: Export) => getFileSize(row.size * 1000)
        },
        { prop: 'status', label: '状态', useSlot: true, slotName: 'status' },
        {
          prop: 'expiredAt',
          label: '过期时间',
          formatter: (row: Export) => formatTime(row.expiredAt)
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Export) => formatTime(row.createdAt)
        },
        { prop: 'operation', label: '操作', width: 100, fixed: 'right', useSlot: true, slotName: 'operation' }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }
</script>
