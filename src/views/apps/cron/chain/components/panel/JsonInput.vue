<template>
  <div class="json-input">
    <TemplateInput
      v-if="candidates.length && !disabled"
      v-model="text"
      multiline
      :rows="rows"
      :candidates="candidates"
      :placeholder="placeholder"
      class="json-input__area"
    />
    <ElInput
      v-else
      v-model="text"
      type="textarea"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      class="json-input__area"
      @blur="onBlur"
    />
    <div v-if="error" class="json-input__error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import TemplateInput from './TemplateInput.vue'
  import type { VariableCandidate } from '../../types/graph'
  import { pretty } from '../../utils/format'

  defineOptions({ name: 'JsonInput' })

  const props = withDefaults(
    defineProps<{
      modelValue?: any
      rows?: number
      placeholder?: string
      disabled?: boolean
      /** 变量补全候选（模板 JSON） */
      candidates?: VariableCandidate[]
    }>(),
    { modelValue: undefined, rows: 4, placeholder: 'JSON，留空表示不配置', disabled: false, candidates: () => [] }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: any] }>()

  const text = ref(pretty(props.modelValue))
  const error = ref('')

  /**
   * 给字符串外的裸占位符补引号：{"data":${a.b}} → {"data":"${a.b}"}。
   * 整串只有一个占位符时后端保留原类型，所以补引号不会把数字、对象变成字符串
   */
  function quoteBarePlaceholders(t: string): string {
    let out = ''
    let inStr = false
    for (let i = 0; i < t.length; i++) {
      const ch = t[i]
      if (inStr) {
        out += ch
        if (ch === '\\') out += t[++i] ?? ''
        else if (ch === '"') inStr = false
        continue
      }
      if (ch === '"') {
        inStr = true
        out += ch
        continue
      }
      if (ch === '$' && t[i + 1] === '{') {
        const end = t.indexOf('}', i)
        if (end > 0) {
          out += JSON.stringify(t.slice(i, end + 1))
          i = end
          continue
        }
      }
      out += ch
    }
    return out
  }

  /** 解析模板 JSON：允许不加引号的 ${变量} */
  function parseTemplate(t: string): any {
    try {
      return JSON.parse(t)
    } catch (e) {
      const fixed = quoteBarePlaceholders(t)
      if (fixed === t) throw e
      return JSON.parse(fixed)
    }
  }

  // 外部值变化（撤销、切换节点）时同步文本；与当前文本等价时不覆盖用户输入格式
  watch(
    () => props.modelValue,
    (v) => {
      try {
        const cur = text.value.trim() ? parseTemplate(text.value) : undefined
        if (JSON.stringify(cur) === JSON.stringify(v)) return
      } catch {
        // 当前文本非法，直接用外部值覆盖
      }
      text.value = pretty(v)
      error.value = ''
    }
  )

  watch(text, (t) => {
    if (!t.trim()) {
      error.value = ''
      emit('update:modelValue', undefined)
      return
    }
    try {
      const v = parseTemplate(t)
      error.value = ''
      emit('update:modelValue', v)
    } catch (e) {
      error.value = `JSON 格式错误：${(e as Error).message}`
    }
  })

  function onBlur() {
    if (!error.value && text.value.trim()) text.value = pretty(parseTemplate(text.value))
  }
</script>

<style scoped lang="scss">
  .json-input {
    width: 100%;
  }

  .json-input__area :deep(textarea) {
    font-family: Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
  }

  .json-input__error {
    margin-top: 2px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-color-danger);
  }
</style>
