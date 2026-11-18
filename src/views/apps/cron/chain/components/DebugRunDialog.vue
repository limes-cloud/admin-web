<template>
  <ElDialog
    :model-value="modelValue"
    title="测试执行"
    width="640px"
    :close-on-click-modal="false"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @open="onOpen"
    @closed="onClosed"
  >
    <ElForm label-position="top" size="small">
      <ElFormItem v-if="!live" label="调用方式">
        <ElRadioGroup v-model="mode">
          <ElRadio value="sync">同步（等待结果）</ElRadio>
          <ElRadio value="async">异步（立即返回）</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="入参（request.body）" :error="inputError">
        <div v-if="hasFields" class="dr-form">
          <div class="dr-form__head">
            <span>支持粘贴 request.body 或完整请求 JSON 自动填充表单</span>
            <ElPopover v-model:visible="pasteVisible" placement="bottom-end" :width="520" trigger="click">
              <template #reference>
                <ElButton link type="primary" size="small" :icon="DocumentCopy" @click="resetJSONPaste">
                  粘贴 JSON
                </ElButton>
              </template>
              <div class="dr-paste">
                <ElInput
                  v-model="pasteText"
                  type="textarea"
                  :rows="10"
                  resize="vertical"
                  placeholder='粘贴 JSON，例如：{ "body": { "url": "https://example.com" }, "method": "POST" }'
                  @input="pasteError = ''"
                />
                <div v-if="pasteError" class="dr-paste__error">{{ pasteError }}</div>
                <div class="dr-paste__actions">
                  <ElButton size="small" @click="pasteVisible = false">取消</ElButton>
                  <ElButton size="small" type="primary" @click="applyJSONPaste">解析并填充</ElButton>
                </div>
              </div>
            </ElPopover>
          </div>
          <FieldRuleForm v-model="formValues" :rules="bodyRule!" :errors="fieldErrors" />
        </div>
        <div v-else class="dr-empty">开始节点未声明入参，无需填写</div>
      </ElFormItem>
      <div class="dr-tip">
        事务号 trx：<code>{{ trx }}</code
        >（本次弹窗内重复提交复用，避免重复建运行）。{{
          props.getRule !== undefined
            ? '运行编辑器当前内容（无需保存或发布）。'
            : '当前生效版本参与运行，未保存的修改不生效。'
        }}
      </div>
    </ElForm>

    <template v-if="result">
      <ElDivider content-position="left">运行结果</ElDivider>
      <ElDescriptions :column="2" size="small" border>
        <ElDescriptionsItem label="运行 ID">{{ result.rid }}</ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <ElTag :type="RUN_STATUS[result.status]?.type" size="small">{{
            RUN_STATUS[result.status]?.label || result.status
          }}</ElTag>
          <ElTag v-if="result.duplicated" type="info" size="small" class="ml">命中已有运行</ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem v-if="result.errorCode || result.errorMsg" label="错误" :span="2">
          {{ result.errorCode }} {{ result.errorMsg }}
        </ElDescriptionsItem>
        <ElDescriptionsItem v-if="result.pendingTriggers?.length" label="待触发节点" :span="2">
          {{ result.pendingTriggers.map((p) => p.nid).join('、') }}
        </ElDescriptionsItem>
      </ElDescriptions>
      <pre class="dr-output">{{ pretty(result.output) || 'null' }}</pre>
    </template>

    <template #footer>
      <ElButton @click="emit('update:modelValue', false)">关闭</ElButton>
      <ElButton v-if="result" @click="openDetail">运行详情</ElButton>
      <ElButton type="primary" :loading="loading" @click="submit">运行</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { DocumentCopy } from '@element-plus/icons-vue'
  import { DebugRunChain } from '@/api/cron/chain/api'
  import type { RunChainReply } from '@/api/cron/chain/type'
  import type { FieldRule } from '../types/dsl'
  import { RUN_STATUS, RUN_TERMINAL } from '../utils/constants'
  import { pretty, uuid } from '../utils/format'
  import { buildFieldValues } from '../utils/sample'
  import FieldRuleForm from './FieldRuleForm.vue'

  defineOptions({ name: 'DebugRunDialog' })

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      keyword: string
      bodyRule?: Record<string, FieldRule>
      /** 取试运行规则（编辑器当前内容）；不传 = 运行生效版本 */
      getRule?: () => string
      /** 实时回显：异步发起后立即关闭弹窗，由外部（编辑器画布）轮询展示节点状态 */
      live?: boolean
    }>(),
    { bodyRule: undefined, getRule: undefined, live: false }
  )

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    /** 已发起运行（live 时） */
    started: [rid: string]
  }>()

  const router = useRouter()

  const mode = ref<'sync' | 'async'>('sync')
  const inputError = ref('')
  const pasteVisible = ref(false)
  const pasteText = ref('')
  const pasteError = ref('')
  const trx = ref('')
  const loading = ref(false)
  const result = ref<RunChainReply | null>(null)

  // 入参按开始节点的入参校验（request.body）渲染：未填的字段不传，必填字段检查
  const hasFields = computed(() => !!props.bodyRule && Object.keys(props.bodyRule).length > 0)
  const formValues = ref<Record<string, any>>({})
  const fieldErrors = ref<Record<string, string>>({})

  /** 打开时生成一次 trx，清空入参 */
  function onOpen() {
    trx.value = uuid()
    formValues.value = {}
    fieldErrors.value = {}
    inputError.value = ''
    resetJSONPaste()
    pasteVisible.value = false
    result.value = null
  }

  /** 取入参：必填与格式检查；不通过返回 null */
  function collectInput(): Record<string, any> | null {
    if (!hasFields.value) return {}
    const errors: Record<string, string> = {}
    const v = buildFieldValues(props.bodyRule!, formValues.value, errors)
    fieldErrors.value = errors
    inputError.value = Object.keys(errors).length ? '请检查标红的字段' : ''
    return Object.keys(errors).length ? null : v
  }

  function resetJSONPaste() {
    pasteText.value = ''
    pasteError.value = ''
  }

  /** 粘贴 JSON 后按开始节点的字段规则回填到表单 */
  function applyJSONPaste() {
    pasteError.value = ''
    const text = pasteText.value.trim()
    if (!text) {
      pasteError.value = '请输入 JSON'
      return
    }
    let source: Record<string, any>
    try {
      source = JSON.parse(text)
    } catch (error) {
      pasteError.value = `JSON 格式错误：${(error as Error).message}`
      return
    }
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      pasteError.value = 'JSON 必须是对象'
      return
    }
    const body = requestBodyFromJSON(props.bodyRule || {}, source)
    const filled = formValuesFromJSON(props.bodyRule || {}, body)
    formValues.value = mergeFormValues(formValues.value, filled.values)
    fieldErrors.value = {}
    inputError.value = ''
    pasteVisible.value = false
    resetJSONPaste()
    if (filled.ignored.length) {
      ElMessage.warning(`未声明字段已忽略：${filled.ignored.join('、')}`)
    } else if (!Object.keys(filled.values).length) {
      ElMessage.warning('JSON 中没有匹配到可填充字段')
    }
  }

  /** 完整请求 JSON 取外层 body；直接粘贴 request.body 时原样使用 */
  function requestBodyFromJSON(rules: Record<string, FieldRule>, source: Record<string, any>): Record<string, any> {
    const body = source.body
    if (!isPlainRecord(body)) return source
    const directMatches = Object.keys(rules).filter((key) => Object.prototype.hasOwnProperty.call(source, key)).length
    const hasEnvelopeMarker = ['method', 'url'].some((key) => Object.prototype.hasOwnProperty.call(source, key))
    return directMatches === 0 || hasEnvelopeMarker ? body : source
  }

  function isPlainRecord(value: any): value is Record<string, any> {
    return !!value && typeof value === 'object' && !Array.isArray(value)
  }

  /** 粘贴数据只覆盖出现的字段，保留已有嵌套对象里的其他字段 */
  function mergeFormValues(current: Record<string, any>, patch: Record<string, any>): Record<string, any> {
    const merged: Record<string, any> = { ...current }
    for (const [key, value] of Object.entries(patch)) {
      merged[key] = isPlainRecord(merged[key]) && isPlainRecord(value) ? mergeFormValues(merged[key], value) : value
    }
    return merged
  }

  /** JSON 值 → 表单原始值：复杂字段转成 JSON 文本，嵌套对象递归转换 */
  function formValuesFromJSON(
    rules: Record<string, FieldRule>,
    source: Record<string, any>,
    prefix = ''
  ): { values: Record<string, any>; ignored: string[] } {
    const values: Record<string, any> = {}
    const ignored: string[] = []
    for (const [key, rule] of Object.entries(rules)) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) continue
      const value = source[key]
      if (value === undefined || value === null) continue
      const path = prefix ? `${prefix}.${key}` : key
      if (rule.type === 'object' && rule.fields) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const nested = formValuesFromJSON(rule.fields, value, path)
          values[key] = nested.values
          ignored.push(...nested.ignored)
        } else {
          values[key] = JSON.stringify(value)
        }
        continue
      }
      if (rule.type === 'string') {
        values[key] = String(value)
      } else if (rule.type === 'number' || rule.type === 'integer') {
        // ElInputNumber 期望 number；粘贴 JSON 时兼容 "14" 这种字符串数字。
        const text = typeof value === 'string' ? value.trim() : ''
        const numeric = typeof value === 'number' ? value : text === '' ? NaN : Number(text)
        values[key] = Number.isFinite(numeric) ? numeric : value
      } else if (rule.type === 'array' || rule.type === 'object' || rule.type === 'any') {
        values[key] = JSON.stringify(value)
      } else {
        values[key] = value
      }
    }
    for (const key of Object.keys(source)) {
      if (!rules[key]) ignored.push(prefix ? `${prefix}.${key}` : key)
    }
    return { values, ignored }
  }

  /** 关闭后 trx 作废 */
  function onClosed() {
    trx.value = ''
    result.value = null
  }

  async function submit() {
    const input = collectInput()
    if (!input) return
    loading.value = true
    try {
      const res = await DebugRunChain({
        keyword: props.keyword,
        input,
        mode: props.live ? 'async' : mode.value,
        trx: trx.value,
        rule: props.getRule?.()
      })
      if (props.live) {
        emit('started', res.rid)
        emit('update:modelValue', false)
        return
      }
      result.value = res
      // 运行未结束（含待触发节点）时跳转运行详情
      if (!RUN_TERMINAL.includes(res.status) && mode.value === 'sync') {
        ElMessage.info('运行尚未结束，已打开运行详情')
        openDetail()
      }
    } finally {
      loading.value = false
    }
  }

  function openDetail() {
    if (!result.value?.rid) return
    emit('update:modelValue', false)
    router.push({ path: '/cron/chain/run-detail', query: { rid: result.value.rid } })
  }
</script>

<style scoped lang="scss">
  .dr-empty {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .dr-form {
    width: 100%;
  }

  .dr-form__head {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .dr-paste {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .dr-paste :deep(textarea) {
    font-family: Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
  }

  .dr-paste__actions {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
  }

  .dr-paste__error {
    font-size: 12px;
    color: var(--el-color-danger);
  }

  .dr-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);

    code {
      padding: 0 3px;
      background: var(--el-fill-color);
      border-radius: 3px;
    }
  }

  .dr-output {
    max-height: 240px;
    padding: 8px;
    margin: 8px 0 0;
    overflow: auto;
    font-size: 12px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .ml {
    margin-left: 6px;
  }
</style>
