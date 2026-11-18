<template>
  <div v-if="node" class="loop-panel">
    <ElForm label-position="top" size="small">
      <ElFormItem label="名称" :error="fieldError('name')">
        <ElInput v-model="node.name" />
      </ElFormItem>

      <ElFormItem label="循环模式">
        <ElSelect v-model="node.loop!.mode">
          <ElOption label="次数（count）" value="count" />
          <ElOption label="集合（each）" value="each" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem v-if="node.loop?.mode === 'count'" label="循环次数" :error="fieldError('loop.times')">
        <ElInputNumber v-model="node.loop!.times" :min="1" :max="1000" class="lp-full" />
      </ElFormItem>

      <template v-else>
        <ElFormItem label="遍历集合（items）" :error="fieldError('loop.items')">
          <TemplateInput v-model="node.loop!.items" :candidates="candidates" placeholder="${request.body.items}" />
        </ElFormItem>
        <ElFormItem label="迭代变量（itemVar）">
          <ElInput v-model="node.loop!.itemVar" placeholder="item" class="lp-full" />
        </ElFormItem>
      </template>

      <ElDivider content-position="left">输出</ElDivider>
      <ElFormItem label="输出名（outputName）">
        <ElInput v-model="node.outputName" class="lp-full" placeholder="挂载到变量池的键名，如 loopResult" />
      </ElFormItem>
      <ElFormItem v-if="node.outputName" label="输出映射（output）" :error="fieldError('output')">
        <TemplateInput
          v-model="node.output"
          :candidates="candidates"
          :placeholder="node.loop?.collect ? '每轮收集的值，如 ${detail}' : '如 ${processed}（循环体最后一轮）'"
        />
      </ElFormItem>
      <ElFormItem v-if="node.outputName" label="收集每轮">
        <ElSwitch v-model="node.loop!.collect" />
        <span class="lp-tip lp-inline">开启后输出为每轮组成的数组（需配输出映射）；关闭只保留最后一轮</span>
      </ElFormItem>

      <div class="lp-tip">
        循环体请<strong>双击循环节点</strong>进入子画布编辑（与主画布一致）；循环体内可引用
        <code>${loop.index}</code> 与迭代变量
      </div>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useChainEditorStore } from '@/store/modules/chain-editor'
  import TemplateInput from './TemplateInput.vue'
  import type { VariableCandidate } from '../../types/graph'
  import type { Issue } from '../../types/issue'

  defineOptions({ name: 'LoopPanel' })

  const props = withDefaults(defineProps<{ issues?: Issue[]; candidates?: VariableCandidate[] }>(), {
    issues: () => [],
    candidates: () => []
  })

  const store = useChainEditorStore()
  const node = computed(() => store.selectedNode)

  function fieldError(field: string): string {
    return props.issues.find((i) => i.field === field || i.field.startsWith(`${field}.`))?.message || ''
  }
</script>

<style scoped lang="scss">
  .loop-panel {
    :deep(.el-select),
    :deep(.el-input-number) {
      width: 100%;
    }
  }

  .lp-full {
    width: 100%;
  }

  .lp-tip {
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);

    &.lp-inline {
      margin-left: 8px;
    }

    code {
      padding: 0 3px;
      background: var(--el-fill-color);
      border-radius: 3px;
    }
  }
</style>
