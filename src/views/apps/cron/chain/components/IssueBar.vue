<template>
  <div class="issue-bar" :class="{ 'is-collapsed': collapsed }">
    <div class="ib-head" @click="collapsed = !collapsed">
      <ElIcon><component :is="collapsed ? ArrowUp : ArrowDown" /></ElIcon>
      <span>问题列表</span>
      <ElTag v-if="errorCount" type="danger" size="small">错误 {{ errorCount }}</ElTag>
      <ElTag v-if="warnCount" type="warning" size="small">警告 {{ warnCount }}</ElTag>
      <ElTag v-if="!issues.length" type="success" size="small">无问题</ElTag>
      <span v-if="validating" class="ib-loading"
        ><ElIcon class="is-loading"><Loading /></ElIcon> 校验中</span
      >
    </div>
    <div v-show="!collapsed" class="ib-list">
      <div v-for="(i, idx) in sorted" :key="idx" class="ib-item" :class="`is-${i.level}`" @click="emit('locate', i)">
        <ElIcon><component :is="i.level === 'error' ? CircleCloseFilled : WarningFilled" /></ElIcon>
        <span class="ib-target">{{ targetLabel(i) }}</span>
        <span v-if="i.field" class="ib-field">{{ i.field }}</span>
        <span class="ib-msg">{{ i.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ArrowDown, ArrowUp, CircleCloseFilled, Loading, WarningFilled } from '@element-plus/icons-vue'
  import type { Node } from '../types/dsl'
  import type { Issue } from '../types/issue'

  defineOptions({ name: 'IssueBar' })

  const props = withDefaults(defineProps<{ issues: Issue[]; nodes?: Node[]; validating?: boolean }>(), {
    nodes: () => [],
    validating: false
  })

  const emit = defineEmits<{ locate: [issue: Issue] }>()

  const collapsed = ref(false)

  const errorCount = computed(() => props.issues.filter((i) => i.level === 'error').length)
  const warnCount = computed(() => props.issues.length - errorCount.value)
  const sorted = computed(() =>
    [...props.issues].sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1))
  )

  function targetLabel(i: Issue): string {
    if (i.target === 'rule') return '链'
    if (i.target === 'edge') return `连线 ${i.id.slice(0, 8)}`
    const n = props.nodes.find((x) => x.id === i.id)
    return `节点 ${n?.name || i.id}`
  }
</script>

<style scoped lang="scss">
  .issue-bar {
    display: flex;
    flex-direction: column;
    max-height: 180px;
    background: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-light);

    &.is-collapsed {
      max-height: 34px;
    }
  }

  .ib-head {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    height: 34px;
    padding: 0 12px;
    font-size: 13px;
    cursor: pointer;
  }

  .ib-loading {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .ib-list {
    flex: 1;
    overflow-y: auto;
  }

  .ib-item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 4px 12px;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &.is-error .el-icon {
      color: var(--el-color-danger);
    }

    &.is-warning .el-icon {
      color: var(--el-color-warning);
    }
  }

  .ib-target {
    flex-shrink: 0;
    font-weight: 500;
  }

  .ib-field {
    flex-shrink: 0;
    font-family: Menlo, Monaco, Consolas, monospace;
    color: var(--el-text-color-secondary);
  }

  .ib-msg {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
