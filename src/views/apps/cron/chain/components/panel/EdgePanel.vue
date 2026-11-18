<template>
  <div v-if="edge" class="edge-panel">
    <ElForm label-position="top" size="small">
      <ElFormItem label="连线">
        <div class="ep-path">{{ sourceName }} → {{ targetName }}</div>
      </ElFormItem>
      <ElFormItem v-if="edge.sourcePort" label="分支">
        <div class="ep-path">{{ port }}</div>
      </ElFormItem>
      <div class="ep-tip">连线不带条件。需要按数据走不同路径时，在中间加一个分支器节点。</div>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useChainEditorStore } from '@/store/modules/chain-editor'
  import { portLabel } from '../../utils/branch'

  defineOptions({ name: 'EdgePanel' })

  const store = useChainEditorStore()
  const edge = computed(() => store.selectedEdge)

  const source = computed(() => store.rule.nodes.find((n) => n.id === edge.value?.source))
  const target = computed(() => store.rule.nodes.find((n) => n.id === edge.value?.target))
  const sourceName = computed(() => source.value?.name || edge.value?.source)
  const targetName = computed(() => target.value?.name || edge.value?.target)
  const port = computed(() => portLabel(source.value?.branches, edge.value?.sourcePort))
</script>

<style scoped lang="scss">
  .ep-path {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .ep-tip {
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }
</style>
