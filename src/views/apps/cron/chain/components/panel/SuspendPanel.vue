<template>
  <div v-if="node" class="np-suspend">
    <ElDivider content-position="left">挂起策略（延迟重跑）</ElDivider>
    <ElFormItem :error="fieldError('suspend')">
      <ElCheckbox :model-value="!!policy" @update:model-value="(value) => toggleSuspend(value === true)">
        启用挂起策略（重试耗尽后延迟重跑当前节点）
      </ElCheckbox>
    </ElFormItem>

    <div class="np-suspend__form" :class="{ 'is-disabled': !policy }">
      <ElAlert type="info" :closable="false" class="np-suspend__alert">
        节点重试耗尽并命中下方条件后，运行进入“挂起”，已完成的节点和输出保留。延迟到期后只重跑当前节点；再次失败会继续挂起，
        最长等待从首次挂起开始累计。挂起优先于“失败时忽略错误”。
      </ElAlert>

      <ElFormItem label="错误类型" :error="fieldError('suspend.errors')">
        <ElSelect v-model="config.errors" multiple collapse-tags collapse-tags-tooltip placeholder="选择错误类型">
          <ElOption v-for="e in ERROR_NAMES" :key="e" :label="e" :value="e" />
        </ElSelect>
        <div class="np-suspend__tip">错误类型与挂起条件同时满足才会挂起；至少配置其中一项。</div>
      </ElFormItem>

      <ElFormItem label="挂起条件" :error="fieldError('suspend.condition')">
        <div class="np-suspend__control">
          <TemplateInput
            v-model="config.condition"
            :candidates="errorCandidates"
            placeholder='如 ${error.body.reason} == "AccountLimitedError"'
          />
          <ElTooltip content="挂起条件说明" placement="top">
            <ElButton class="np-suspend__help" text :icon="QuestionFilled" @click="helpVisible = true" />
          </ElTooltip>
        </div>
      </ElFormItem>

      <ElRow :gutter="8">
        <ElCol :span="12">
          <ElFormItem label="延迟时间（秒）" :error="fieldError('suspend.delay')">
            <ElInputNumber v-model="config.delay" :min="1" :max="86400" placeholder="300" controls-position="right" />
            <div class="np-suspend__tip">300 = 5 分钟；留空使用默认 300 秒。</div>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="最长等待（秒，≤30 天）" :error="fieldError('suspend.maxWait')">
            <ElInputNumber
              v-model="config.maxWait"
              :min="1"
              :max="2592000"
              placeholder="604800"
              controls-position="right"
            />
            <div class="np-suspend__tip">604800 = 7 天；从首次挂起开始累计。</div>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <div class="np-suspend__tip">
        最长等待到期后：节点开启“失败时忽略错误并继续”则按兜底输出继续，否则运行失败。
      </div>
    </div>

    <RetryConditionHelp v-model="helpVisible" mode="suspend" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import { useChainEditorStore } from '@/store/modules/chain-editor'
  import RetryConditionHelp from './RetryConditionHelp.vue'
  import TemplateInput from './TemplateInput.vue'
  import type { Node, SuspendPolicy } from '../../types/dsl'
  import type { VariableCandidate } from '../../types/graph'
  import type { Issue } from '../../types/issue'
  import { ERROR_NAMES } from '../../utils/constants'

  defineOptions({ name: 'SuspendPanel' })

  const props = withDefaults(
    defineProps<{
      issues?: Issue[]
      /** 编辑指定节点（插件定义）；不传 = 编辑器中选中的节点 */
      target?: Node
    }>(),
    { issues: () => [], target: undefined }
  )

  const errorCandidates: VariableCandidate[] = [
    { path: 'error.type', group: '错误' },
    { path: 'error.status', group: '错误' },
    { path: 'error.message', group: '错误' },
    { path: 'error.body', group: '错误' }
  ]

  const helpVisible = ref(false)
  const store = useChainEditorStore()
  const node = computed(() => props.target ?? store.selectedNode)
  const policy = computed(() => node.value?.suspend)
  const draft = ref<SuspendPolicy>(defaultSuspend())
  const config = computed(() => policy.value || draft.value)

  function defaultSuspend(): SuspendPolicy {
    return {
      errors: ['Chain.RateLimited'],
      delay: 300,
      maxWait: 604800
    }
  }

  function clonePolicy(value: SuspendPolicy): SuspendPolicy {
    return JSON.parse(JSON.stringify(value)) as SuspendPolicy
  }

  function toggleSuspend(on: boolean) {
    if (!node.value) return
    if (!on) {
      if (policy.value) draft.value = clonePolicy(policy.value)
      delete node.value.suspend
      return
    }
    node.value.suspend = clonePolicy(draft.value)
  }

  function fieldError(field: string): string {
    return props.issues.find((i) => i.field === field || i.field.startsWith(`${field}.`))?.message || ''
  }
</script>

<style scoped lang="scss">
  .np-suspend {
    width: 100%;
  }

  .np-suspend__form {
    transition: opacity 0.15s;

    &.is-disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  }

  .np-suspend__alert {
    margin-bottom: 12px;
    font-size: 12px;
    line-height: 1.6;
  }

  .np-suspend__control {
    display: flex;
    gap: 4px;
    align-items: center;
    width: 100%;

    > :first-child {
      flex: 1;
      min-width: 0;
    }
  }

  .np-suspend__help {
    flex: 0 0 auto;
    padding: 0 4px;
  }

  .np-suspend__tip {
    margin-top: 2px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-text-color-secondary);
  }
</style>
