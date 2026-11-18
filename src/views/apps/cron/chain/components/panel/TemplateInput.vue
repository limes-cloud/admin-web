<template>
  <div class="template-input">
    <ElPopover
      :visible="open"
      placement="bottom-start"
      :width="320"
      :show-arrow="false"
      popper-class="template-input__popper"
    >
      <template #reference>
        <ElInput
          ref="inputRef"
          :model-value="modelValue"
          :type="multiline ? 'textarea' : 'text'"
          :rows="multiline ? rows : undefined"
          :placeholder="placeholder"
          @update:model-value="onInput"
          @keydown="onKeydown"
          @blur="onBlur"
        >
          <template v-if="!multiline && candidates.length" #suffix>
            <ElTooltip content="插入变量" placement="top">
              <ElIcon class="template-input__btn" @mousedown.prevent="openAll"><Plus /></ElIcon>
            </ElTooltip>
          </template>
        </ElInput>
      </template>
      <div class="template-input__list">
        <div v-if="!filtered.length" class="template-input__empty">没有可用变量</div>
        <div
          v-for="(c, i) in filtered"
          :key="c.path"
          class="template-input__item"
          :class="{ 'is-active': i === active }"
          @mousedown.prevent="pick(c)"
        >
          <span class="template-input__path">{{ c.path }}</span>
          <span class="template-input__group"> {{ c.group }}<template v-if="c.maybeNull"> · 可能为空</template> </span>
        </div>
      </div>
    </ElPopover>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import type { VariableCandidate } from '../../types/graph'

  defineOptions({ name: 'TemplateInput' })

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      candidates?: VariableCandidate[]
      placeholder?: string
      multiline?: boolean
      /** 变量路径模式（分支条件左值）：插入裸路径，不包 ${} */
      expression?: boolean
      rows?: number
    }>(),
    { modelValue: '', candidates: () => [], placeholder: '', multiline: false, expression: false, rows: 3 }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

  const inputRef = ref()
  const open = ref(false)
  const keyword = ref('')
  const active = ref(0)
  /** 弹出时 { 所在位置；-1 = 由按钮打开，插入到光标处 */
  let braceAt = -1

  const filtered = computed(() => {
    const k = keyword.value.toLowerCase()
    const list = k ? props.candidates.filter((c) => c.path.toLowerCase().includes(k)) : props.candidates
    return list.slice(0, 50)
  })

  function textarea(): HTMLInputElement | HTMLTextAreaElement | undefined {
    return inputRef.value?.input || inputRef.value?.textarea
  }

  function onInput(v: string) {
    emit('update:modelValue', v)
    const el = textarea()
    const pos = el?.selectionStart ?? v.length
    if (!props.candidates.length) return
    // 光标前最近的 ${ 未闭合时，以其后的文本为过滤关键字
    const before = v.slice(0, pos)
    const at = before.lastIndexOf('${')
    if (at >= 0 && !before.slice(at).includes('}') && /^[\w.]*$/.test(before.slice(at + 2))) {
      braceAt = at
      keyword.value = before.slice(at + 2)
      active.value = 0
      open.value = true
    } else if (braceAt >= 0) {
      close()
    }
  }

  function openAll() {
    braceAt = -1
    keyword.value = ''
    active.value = 0
    open.value = true
    textarea()?.focus()
  }

  function close() {
    open.value = false
    braceAt = -1
  }

  function onBlur() {
    setTimeout(close, 150)
  }

  function onKeydown(e: Event | KeyboardEvent) {
    if (!open.value || !('key' in e)) return
    if (e.key === 'ArrowDown') {
      active.value = Math.min(active.value + 1, filtered.value.length - 1)
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      active.value = Math.max(active.value - 1, 0)
      e.preventDefault()
    } else if (e.key === 'Enter' && filtered.value[active.value]) {
      pick(filtered.value[active.value])
      e.preventDefault()
    } else if (e.key === 'Escape') {
      close()
    }
  }

  function pick(c: VariableCandidate) {
    const v = props.modelValue || ''
    const el = textarea()
    const pos = el?.selectionStart ?? v.length
    const token = props.expression ? c.path : `\${${c.path}}`
    let next: string
    let caret: number
    if (braceAt >= 0) {
      // 替换 ${ 到光标之间的内容（表达式模式的 token 不带 ${}，即去掉用户输入的 ${）
      next = v.slice(0, braceAt) + token + v.slice(pos)
      caret = braceAt + token.length
    } else {
      next = v.slice(0, pos) + token + v.slice(pos)
      caret = pos + token.length
    }
    emit('update:modelValue', next)
    close()
    requestAnimationFrame(() => {
      const t = textarea()
      t?.focus()
      t?.setSelectionRange(caret, caret)
    })
  }
</script>

<style scoped lang="scss">
  .template-input {
    width: 100%;
  }

  .template-input__btn {
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .template-input__list {
    max-height: 260px;
    margin: -6px;
    overflow-y: auto;
  }

  .template-input__empty {
    padding: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .template-input__item {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;

    &.is-active,
    &:hover {
      background: var(--el-fill-color-light);
    }
  }

  .template-input__path {
    overflow: hidden;
    font-family: Menlo, Monaco, Consolas, monospace;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .template-input__group {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
  }
</style>
