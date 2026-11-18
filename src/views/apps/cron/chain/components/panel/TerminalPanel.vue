<template>
  <div v-if="node" class="terminal-panel">
    <ElForm label-position="top" size="small">
      <ElFormItem label="名称" :error="fieldError('name')">
        <ElInput v-model="node.name" />
      </ElFormItem>

      <template v-if="node.type === 'start'">
        <ElDivider content-position="left">入参校验</ElDivider>
        <ElFormItem label="request.body 字段规则" :error="fieldError('request.body')">
          <FieldRuleEditor :model-value="node.request?.body" @update:model-value="setRequest('body', $event)" />
        </ElFormItem>
        <ElFormItem label="request.header 字段规则（仅 passHeaders 白名单透传）" :error="fieldError('request.header')">
          <FieldRuleEditor :model-value="node.request?.header" @update:model-value="setRequest('header', $event)" />
        </ElFormItem>
        <div class="tp-tip">发起运行时按这里的规则校验入参，下游节点通过 <code>${request.body.xxx}</code> 引用。</div>
      </template>

      <template v-else>
        <ElDivider content-position="left">返回</ElDivider>
        <ElFormItem label="返回体模板（response.body）" :error="fieldError('response.body')">
          <JsonInput
            :model-value="node.response?.body"
            :candidates="candidates"
            @update:model-value="setResponse('body', $event)"
          />
        </ElFormItem>
        <ElFormItem label="固定外层字段（response.defaultBody）" :error="fieldError('response.defaultBody')">
          <JsonInput
            :model-value="node.response?.defaultBody"
            :rows="2"
            placeholder='如 {"code":200,"msg":"success"}'
            @update:model-value="setResponse('defaultBody', $event)"
          />
        </ElFormItem>
        <div class="tp-tip">全部节点完成后按模板渲染运行输出；未执行分支的节点输出为 null。</div>
      </template>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useChainEditorStore } from '@/store/modules/chain-editor'
  import FieldRuleEditor from './FieldRuleEditor.vue'
  import JsonInput from './JsonInput.vue'
  import type { FieldRule, ResponseRule } from '../../types/dsl'
  import type { VariableCandidate } from '../../types/graph'
  import type { Issue } from '../../types/issue'

  // 开始 / 结束节点属性：开始编辑入参校验，结束编辑返回模板
  defineOptions({ name: 'TerminalPanel' })

  const props = withDefaults(defineProps<{ issues?: Issue[]; candidates?: VariableCandidate[] }>(), {
    issues: () => [],
    candidates: () => []
  })

  const store = useChainEditorStore()
  const node = computed(() => store.selectedNode)

  function fieldError(field: string): string {
    return props.issues.find((i) => i.field === field || i.field.startsWith(`${field}.`))?.message || ''
  }

  function setRequest(key: 'body' | 'header', v: Record<string, FieldRule> | undefined) {
    const n = node.value
    if (!n) return
    const req = { ...(n.request || {}) }
    if (v) req[key] = v
    else delete req[key]
    n.request = Object.keys(req).length ? req : undefined
  }

  function setResponse(key: keyof ResponseRule, v: any) {
    const n = node.value
    if (!n) return
    const resp: ResponseRule = { ...(n.response || {}) }
    if (v === undefined) delete resp[key]
    else resp[key] = v
    n.response = Object.keys(resp).length ? resp : undefined
  }
</script>

<style scoped lang="scss">
  .tp-tip {
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);

    code {
      padding: 0 3px;
      background: var(--el-fill-color);
      border-radius: 3px;
    }
  }
</style>
