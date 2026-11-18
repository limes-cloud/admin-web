<template>
  <ElDrawer
    :model-value="modelValue"
    :title="`节点详情：${nodeName || nid}`"
    size="560px"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @open="load"
  >
    <div v-loading="loading" class="nrd">
      <div v-if="canTrigger" class="nrd-actions">
        <ElButton v-permission="'cron:chain_run:trigger'" type="warning" :icon="Pointer" @click="emit('trigger')">
          手动触发
        </ElButton>
      </div>
      <ElEmpty v-if="!loading && !row && !isStart" description="节点尚未开始执行" />
      <template v-if="isStart">
        <ElDescriptions :column="2" size="small" border>
          <ElDescriptionsItem label="节点 ID">{{ nid }}</ElDescriptionsItem>
          <ElDescriptionsItem label="类型">控制节点（开始）</ElDescriptionsItem>
        </ElDescriptions>
        <div class="nrd-title">请求参数</div>
        <pre class="nrd-pre">{{ pretty(runInput) || '无入参' }}</pre>
        <div class="nrd-tip">开始节点不单独执行；此处展示本次运行的入参。</div>
      </template>
      <template v-else-if="row">
        <ElDescriptions :column="2" size="small" border>
          <ElDescriptionsItem label="节点 ID">{{ row.nid }}</ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <ElTag size="small" :type="NODE_STATUS[row.status]?.type">{{
              NODE_STATUS[row.status]?.label || row.status
            }}</ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="类型"
            >{{ row.mode === 'trigger' ? '被动触发' : '自动执行' }} · {{ row.type }}</ElDescriptionsItem
          >
          <ElDescriptionsItem label="执行序号">{{ row.execId }}</ElDescriptionsItem>
          <ElDescriptionsItem label="重试次数">{{ row.retry }}</ElDescriptionsItem>
          <ElDescriptionsItem label="耗时">{{ row.costMs }} ms</ElDescriptionsItem>
          <ElDescriptionsItem label="开始时间">{{ formatTs(row.startedAt) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="结束时间">{{ formatTs(row.finishedAt) }}</ElDescriptionsItem>
          <ElDescriptionsItem v-if="row.executor" label="执行实例">{{ row.executor }}</ElDescriptionsItem>
          <ElDescriptionsItem v-if="row.error" label="错误" :span="2">
            <span class="nrd-error">{{ row.error }}</span>
          </ElDescriptionsItem>
        </ElDescriptions>

        <template v-if="row.mode === 'trigger'">
          <div class="nrd-title">触发数据</div>
          <ElDescriptions :column="2" size="small" border>
            <ElDescriptionsItem label="触发方">{{ row.caller || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="触发时间">{{ formatTs(row.triggeredAt) }}</ElDescriptionsItem>
            <ElDescriptionsItem label="截止时间">{{ formatTs(row.deadlineAt) }}</ElDescriptionsItem>
            <ElDescriptionsItem label="trx">{{ row.trx || '-' }}</ElDescriptionsItem>
          </ElDescriptions>
          <pre class="nrd-pre">{{ pretty(row.body) || '尚未触发' }}</pre>
        </template>

        <NodeRunDetail :request="row.request" :response="row.response" :output="row.output" :logs="row.logs" />
        <div class="nrd-tip">只展示最近一次执行；历史轮次请在日志平台按 run_id 查询。</div>
      </template>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Pointer } from '@element-plus/icons-vue'
  import { ListChainRunNode } from '@/api/cron/chain/api'
  import type { ChainRunNode } from '@/api/cron/chain/type'
  import { NODE_STATUS } from '../utils/constants'
  import { formatTs, pretty } from '../utils/format'
  import NodeRunDetail from './NodeRunDetail.vue'

  defineOptions({ name: 'NodeRunDrawer' })

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      rid: string
      nid: string
      nodeName?: string
      nodeType?: string
      runInput?: any
      canTrigger?: boolean
    }>(),
    { nodeName: '', nodeType: '', runInput: undefined, canTrigger: false }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: boolean]; trigger: [] }>()

  const loading = ref(false)
  const row = ref<ChainRunNode | null>(null)
  const isStart = computed(() => props.nodeType === 'start')

  async function load() {
    loading.value = true
    row.value = null
    try {
      const res = await ListChainRunNode({ rid: props.rid, nid: props.nid })
      const list = res?.list || []
      // 取最近一次执行（执行序号最大）
      row.value = list.reduce<ChainRunNode | null>((a, b) => (!a || b.execId >= a.execId ? b : a), null)
    } finally {
      loading.value = false
    }
  }

  defineExpose({ reload: load })
</script>

<style scoped lang="scss">
  .nrd-actions {
    margin-bottom: 12px;
  }

  .nrd-title {
    margin: 14px 0 6px;
    font-size: 13px;
    font-weight: 500;
  }

  .nrd-pre {
    max-height: 240px;
    padding: 8px;
    margin: 0;
    overflow: auto;
    font-size: 12px;
    word-break: break-all;
    white-space: pre-wrap;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .nrd-error {
    color: var(--el-color-danger);
  }

  .nrd-tip {
    margin-top: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
