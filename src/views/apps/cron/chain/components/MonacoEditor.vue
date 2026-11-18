<template>
  <div ref="el" class="chain-monaco" :style="{ height }"></div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue'
  import * as monaco from 'monaco-editor'
  import { useSettingStore } from '@/store/modules/setting'

  defineOptions({ name: 'ChainMonaco' })

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      language?: string
      readOnly?: boolean
      height?: string
      /** 对比模式：original 为左侧，modelValue 为右侧 */
      diff?: boolean
      original?: string
    }>(),
    {
      modelValue: '',
      language: 'javascript',
      readOnly: false,
      height: '400px',
      diff: false,
      original: ''
    }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

  const el = ref<HTMLDivElement>()
  const settingStore = useSettingStore()
  let editor: monaco.editor.IStandaloneCodeEditor | null = null
  let diffEditor: monaco.editor.IStandaloneDiffEditor | null = null

  const theme = () => (settingStore.isDark ? 'vs-dark' : 'vs')

  const baseOptions = (): monaco.editor.IEditorOptions => ({
    readOnly: props.readOnly,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    scrollBeyondLastLine: false
  })

  onMounted(() => {
    if (!el.value) return
    if (props.diff) {
      diffEditor = monaco.editor.createDiffEditor(el.value, {
        ...baseOptions(),
        readOnly: true,
        renderSideBySide: true,
        theme: theme()
      })
      diffEditor.setModel({
        original: monaco.editor.createModel(props.original, props.language),
        modified: monaco.editor.createModel(props.modelValue, props.language)
      })
      return
    }
    editor = monaco.editor.create(el.value, {
      ...baseOptions(),
      value: props.modelValue,
      language: props.language,
      theme: theme()
    })
    editor.onDidChangeModelContent(() => {
      const v = toRaw(editor)?.getValue() ?? ''
      if (v !== props.modelValue) emit('update:modelValue', v)
    })
  })

  watch(
    () => props.modelValue,
    (v) => {
      if (editor && toRaw(editor).getValue() !== v) toRaw(editor).setValue(v || '')
      if (diffEditor)
        toRaw(diffEditor)
          .getModel()
          ?.modified.setValue(v || '')
    }
  )

  watch(
    () => props.original,
    (v) => {
      if (diffEditor)
        toRaw(diffEditor)
          .getModel()
          ?.original.setValue(v || '')
    }
  )

  watch(
    () => settingStore.isDark,
    () => monaco.editor.setTheme(theme())
  )

  onBeforeUnmount(() => {
    if (diffEditor) {
      const m = diffEditor.getModel()
      diffEditor.dispose()
      m?.original.dispose()
      m?.modified.dispose()
    }
    editor?.dispose()
    editor = null
    diffEditor = null
  })
</script>

<style scoped lang="scss">
  .chain-monaco {
    width: 100%;
    overflow: hidden;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
  }
</style>
