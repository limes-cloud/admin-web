<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="handleResetSearch"
        />
      </div>

      <div class="table">
        <ArtTableHeader :loading="loading" @refresh="loadTransfers" />

        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #sk="{ row }">
            <div v-if="row.sk" class="mono-cell">
              <code :title="row.sk">{{ maskSK(row.sk) }}</code>
              <ElButton text :icon="CopyDocument" @click="copyText(row.sk, 'SK 已复制')" />
            </div>
            <span v-else class="muted">-</span>
          </template>

          <template #keyword="{ row }">{{ row.keyword || '-' }}</template>

          <template #transferId="{ row }">
            <div v-if="row.transferId" class="mono-cell">
              <code :title="row.transferId">{{ row.transferId }}</code>
              <ElButton text :icon="CopyDocument" @click="copyText(row.transferId, '转存 ID 已复制')" />
            </div>
            <span v-else class="muted">-</span>
          </template>

          <template #accountId="{ row }">{{ row.accountId || '-' }}</template>

          <template #status="{ row }">
            <ElTag :type="transferStatusType(row.status)" effect="light" size="small">{{ row.statusText }}</ElTag>
          </template>

          <template #failReason="{ row }">
            <span v-if="row.failReason" :title="row.failReason">{{ row.failReason }}</span>
            <span v-else class="muted">-</span>
          </template>

          <template #expiresAt="{ row }">{{ row.expiresAt ? formatTime(row.expiresAt) : '-' }}</template>

          <template #createdAt="{ row }">{{ formatTime(row.createdAt) }}</template>
        </ArtTable>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { CopyDocument } from '@element-plus/icons-vue'

  import { ListHermesTransfer } from '@/api/psou/hermes/api'
  import type { HermesTransfer } from '@/api/psou/hermes/type'
  import type { ColumnOption } from '@/types/component'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'PsouHermesTransfer' })

  const loading = ref(false)
  const data = ref<HermesTransfer[]>([])
  const page = ref(1)
  const pageSize = ref(20)
  const total = ref(0)

  const searchForm = ref({ sk: '' })

  const searchItems = computed(() => [
    {
      label: 'SK',
      key: 'sk',
      type: 'input',
      props: { placeholder: '输入完整 SK，留空查看全部', clearable: true, maxlength: 32 }
    }
  ])

  const columns: ColumnOption<HermesTransfer>[] = [
    { prop: 'id', label: '#', width: 80 },
    { prop: 'sk', label: 'SK', minWidth: 200, useSlot: true, slotName: 'sk' },
    { prop: 'keyword', label: '关键词', minWidth: 140, useSlot: true, slotName: 'keyword' },
    { prop: 'transferId', label: '转存 ID', minWidth: 180, useSlot: true, slotName: 'transferId' },
    { prop: 'accountId', label: '账号', width: 90, useSlot: true, slotName: 'accountId' },
    { prop: 'status', label: '状态', width: 110, useSlot: true, slotName: 'status' },
    { prop: 'failReason', label: '失败原因', minWidth: 160, useSlot: true, slotName: 'failReason' },
    { prop: 'expiresAt', label: '结果有效期', width: 170, useSlot: true, slotName: 'expiresAt' },
    { prop: 'createdAt', label: '创建时间', width: 170, useSlot: true, slotName: 'createdAt' }
  ]

  const pagination = computed(() => ({ current: page.value, size: pageSize.value, total: total.value }))

  const loadTransfers = async () => {
    loading.value = true
    try {
      const reply = await ListHermesTransfer({
        sk: searchForm.value.sk.trim() || undefined,
        page: page.value,
        pageSize: pageSize.value
      })
      data.value = Array.isArray(reply.list) ? reply.list : []
      total.value = Number(reply.total) || 0
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    page.value = 1
    loadTransfers()
  }

  const handleResetSearch = () => {
    searchForm.value.sk = ''
    page.value = 1
    loadTransfers()
  }

  const handleSizeChange = (size: number) => {
    pageSize.value = size
    page.value = 1
    loadTransfers()
  }

  const handleCurrentChange = (current: number) => {
    page.value = current
    loadTransfers()
  }

  const maskSK = (value: string) => {
    if (value.length <= 18) return value
    return `${value.slice(0, 8)}••••••${value.slice(-6)}`
  }

  // 与后端 HermesTransferStatus 一致：0 转存中，1 已分享，4 失败，其余为放弃/已清理。
  const transferStatusType = (status: number) => {
    if (status === 1) return 'success'
    if (status === 0) return 'warning'
    if (status === 4) return 'danger'
    return 'info'
  }

  const copyText = async (value: string, successMessage = '已复制') => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const input = document.createElement('textarea')
      input.value = value
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    ElMessage.success(successMessage)
  }

  onMounted(loadTransfers)
</script>

<style scoped lang="scss">
  .mono-cell {
    display: flex;
    gap: 4px;
    align-items: center;
    min-width: 0;
  }

  .mono-cell code {
    padding: 3px 7px;
    overflow: hidden;
    font-family: var(--el-font-family-mono, ui-monospace, 'SFMono-Regular', Menlo, monospace);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: var(--el-fill-color-light);
    border-radius: 5px;
  }

  .muted {
    color: var(--el-text-color-placeholder);
  }
</style>
