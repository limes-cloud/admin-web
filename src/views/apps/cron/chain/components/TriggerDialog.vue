<template>
  <ElDialog
    :model-value="modelValue"
    title="手动触发"
    width="560px"
    :close-on-click-modal="false"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @open="onOpen"
  >
    <ElDescriptions :column="1" size="small" border class="td-info">
      <ElDescriptionsItem label="运行 ID">{{ rid }}</ElDescriptionsItem>
      <ElDescriptionsItem label="节点">{{ nodeName || nid }}（{{ nid }}）</ElDescriptionsItem>
      <ElDescriptionsItem label="事务号 trx">{{ trx }}</ElDescriptionsItem>
    </ElDescriptions>

    <ElForm label-position="top" size="small">
      <template v-if="useForm">
        <ElFormItem
          v-for="f in fields"
          :key="f.name"
          :label="`${f.name}（${f.rule.type || 'any'}）`"
          :required="!!f.rule.required"
        >
          <ElSwitch v-if="f.rule.type === 'boolean'" v-model="form[f.name]" />
          <ElInputNumber
            v-else-if="f.rule.type === 'number' || f.rule.type === 'integer'"
            v-model="form[f.name]"
            :min="f.rule.min"
            :max="f.rule.max"
            :step="f.rule.type === 'integer' ? 1 : 0.1"
            controls-position="right"
          />
          <ElSelect v-else-if="f.rule.enum?.length" v-model="form[f.name]" clearable>
            <ElOption v-for="v in f.rule.enum" :key="String(v)" :label="String(v)" :value="v" />
          </ElSelect>
          <ElInput v-else-if="f.rule.type === 'string'" v-model="form[f.name]" />
          <JsonInput v-else v-model="form[f.name]" :rows="3" />
        </ElFormItem>
        <ElLink type="primary" :underline="false" @click="switchToJson">改用 JSON 编辑</ElLink>
      </template>
      <ElFormItem v-else label="触发数据（body，JSON 对象）" :error="jsonError">
        <ElInput v-model="jsonText" type="textarea" :rows="8" class="mono" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="emit('update:modelValue', false)">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="submit">触发</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { TriggerChainRunNode } from '@/api/cron/chain/api'
  import { HttpError } from '@/utils/http/error'
  import JsonInput from './panel/JsonInput.vue'
  import type { FieldRule } from '../types/dsl'
  import { pretty, uuid } from '../utils/format'
  import { sampleObject } from '../utils/sample'

  defineOptions({ name: 'TriggerDialog' })

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      rid: string
      nid: string
      nodeName?: string
      bodyRule?: Record<string, FieldRule>
    }>(),
    { nodeName: '', bodyRule: undefined }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: boolean]; done: [] }>()

  const trx = ref('')
  const loading = ref(false)
  const form = ref<Record<string, any>>({})
  const jsonText = ref('{}')
  const jsonError = ref('')
  const forceJson = ref(false)

  const fields = computed(() =>
    Object.entries(props.bodyRule || {}).map(([name, rule]) => ({ name, rule: rule || {} }))
  )
  const useForm = computed(() => fields.value.length > 0 && !forceJson.value)

  /** 打开弹窗时生成一次 trx，弹窗内重试复用 */
  function onOpen() {
    trx.value = uuid()
    forceJson.value = false
    form.value = sampleObject(props.bodyRule)
    jsonText.value = pretty(form.value)
    jsonError.value = ''
  }

  function switchToJson() {
    jsonText.value = pretty(form.value)
    forceJson.value = true
  }

  function collect(): Record<string, any> | null {
    if (useForm.value) {
      const missing = fields.value.filter(
        (f) => f.rule.required && (form.value[f.name] === undefined || form.value[f.name] === '')
      )
      if (missing.length) {
        ElMessage.warning(`请填写必填字段：${missing.map((f) => f.name).join('、')}`)
        return null
      }
      return { ...form.value }
    }
    try {
      const v = jsonText.value.trim() ? JSON.parse(jsonText.value) : {}
      if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('触发数据必须是 JSON 对象')
      jsonError.value = ''
      return v
    } catch (e) {
      jsonError.value = (e as Error).message
      return null
    }
  }

  async function submit() {
    const body = collect()
    if (!body) return
    loading.value = true
    try {
      await TriggerChainRunNode({ rid: props.rid, nid: props.nid, trx: trx.value, body })
      ElMessage.success('已触发')
      emit('update:modelValue', false)
      emit('done')
    } catch (e) {
      if (e instanceof HttpError && e.reason === 'ChainTriggerError') {
        ElMessage.error('该节点已被触发或已失效')
        emit('update:modelValue', false)
        emit('done')
      } else {
        ElMessage.error((e as Error)?.message || '触发失败')
      }
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .td-info {
    margin-bottom: 12px;
  }

  .mono :deep(textarea) {
    font-family: Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
  }

  :deep(.el-input-number),
  :deep(.el-select) {
    width: 100%;
  }
</style>
