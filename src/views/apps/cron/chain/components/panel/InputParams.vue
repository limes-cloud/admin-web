<template>
  <div class="input-params">
    <template v-if="!jsonMode">
      <div v-for="row in rows" :key="row.uid" class="ip-row">
        <ElInput
          :model-value="nameDrafts[row.uid] ?? row.name"
          :placeholder="nameLabel"
          class="ip-name"
          @update:model-value="(v: string) => (nameDrafts[row.uid] = v)"
          @change="(v: string) => commitName(row.uid, row.name, v)"
        />
        <TemplateInput
          :model-value="valueText(row.value)"
          :candidates="candidates"
          :placeholder="
            isInternal(row.name)
              ? '内部参数，值必填'
              : isFile(row.name)
                ? '文件地址：http(s) URL 或 data URI，可选变量'
                : valuePlaceholder
          "
          class="ip-value"
          :class="{ 'is-required': isInternal(row.name) && !valueText(row.value).trim() }"
          @update:model-value="setValue(row.name, $event)"
        />
        <!-- multipart 请求：标记该参数按文件上传（值为文件地址，执行时下载后作为文件提交） -->
        <ElTooltip v-if="allowFiles" content="按文件上传" placement="top">
          <ElCheckbox
            :model-value="isFile(row.name)"
            class="ip-file"
            @update:model-value="(v) => toggleFile(row.name, !!v)"
          >
            文件
          </ElCheckbox>
        </ElTooltip>
        <!-- 插件定义：内部参数的值由插件固定，使用插件的节点看不到也不能修改 -->
        <ElTooltip v-if="allowInternal" content="内部参数：使用插件的节点看不到、不能修改" placement="top">
          <ElCheckbox
            :model-value="isInternal(row.name)"
            class="ip-file"
            @update:model-value="(v) => toggleInternal(row.name, !!v)"
          >
            内部
          </ElCheckbox>
        </ElTooltip>
        <ElButton text type="danger" :icon="Delete" @click="remove(row.name)" />
      </div>
      <div class="ip-foot">
        <ElButton text type="primary" :icon="Plus" @click="add">添加{{ nameLabel }}</ElButton>
        <ElButton text type="primary" :icon="EditPen" @click="jsonMode = true">JSON 编辑</ElButton>
      </div>
    </template>
    <template v-else>
      <JsonInput
        :model-value="modelValue"
        :candidates="candidates"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <div class="ip-foot">
        <ElTooltip :disabled="isForm" content="入参不是扁平对象，不能用表单编辑">
          <span>
            <ElButton text type="primary" :icon="List" :disabled="!isForm" @click="jsonMode = false">表单编辑</ElButton>
          </span>
        </ElTooltip>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { Delete, EditPen, List, Plus } from '@element-plus/icons-vue'
  import JsonInput from './JsonInput.vue'
  import TemplateInput from './TemplateInput.vue'
  import type { VariableCandidate } from '../../types/graph'

  // 节点入参编辑：参数名 + 值（可直接输入，也可选择上游变量）；复杂结构切换到 JSON 编辑
  defineOptions({ name: 'InputParams' })

  const props = withDefaults(
    defineProps<{
      modelValue?: any
      candidates?: VariableCandidate[]
      /** 键的叫法（参数 / 字段），用于占位与按钮文案 */
      nameLabel?: string
      valuePlaceholder?: string
      /** 新增行的默认键名前缀 */
      keyPrefix?: string
      /** 值一律按字符串保存（请求头：后端为 map[string]string，不能出现数字、对象） */
      stringOnly?: boolean
      /** 允许把参数标记为文件（multipart 请求） */
      allowFiles?: boolean
      /** 按文件上传的参数名（v-model:files） */
      files?: string[]
      /** 允许把参数标记为内部参数（插件定义） */
      allowInternal?: boolean
      /** 内部参数名（v-model:internal） */
      internal?: string[]
    }>(),
    {
      modelValue: undefined,
      candidates: () => [],
      nameLabel: '参数',
      valuePlaceholder: '输入值，或点 + / 输入 ${ 选择变量',
      keyPrefix: 'param',
      stringOnly: false,
      allowFiles: false,
      files: undefined,
      allowInternal: false,
      internal: undefined
    }
  )

  const emit = defineEmits<{
    'update:modelValue': [value: any]
    'update:files': [value: string[] | undefined]
    'update:internal': [value: string[] | undefined]
  }>()

  // ---------- 文件参数 ----------

  function isFile(name: string): boolean {
    return !!props.files?.includes(name)
  }

  /** 为空时输出 undefined（导出时省略 files） */
  function outputFiles(list: string[]) {
    emit('update:files', list.length ? list : undefined)
  }

  function toggleFile(name: string, on: boolean) {
    const rest = (props.files || []).filter((f) => f !== name)
    outputFiles(on ? [...rest, name] : rest)
  }

  // ---------- 内部参数 ----------

  function isInternal(name: string): boolean {
    return !!props.internal?.includes(name)
  }

  /** 为空时输出 undefined（导出时省略 internal） */
  function outputInternal(list: string[]) {
    emit('update:internal', list.length ? list : undefined)
  }

  function toggleInternal(name: string, on: boolean) {
    const rest = (props.internal || []).filter((f) => f !== name)
    outputInternal(on ? [...rest, name] : rest)
  }

  /** 入参为空或普通对象时可用表单编辑 */
  const isForm = computed(() => {
    const v = props.modelValue
    return v === undefined || v === null || (typeof v === 'object' && !Array.isArray(v))
  })

  const jsonMode = ref(!isForm.value)

  const rows = computed(() =>
    Object.entries((isForm.value && props.modelValue) || {}).map(([name, value], i) => ({
      uid: `${i}:${name}`,
      name,
      value
    }))
  )

  /** 参数名输入草稿（行 uid → 文本）：失焦 / 回车时才改键，避免每个字符都重建行导致失焦 */
  const nameDrafts = reactive<Record<string, string>>({})

  function entries(): [string, any][] {
    return Object.entries((isForm.value && props.modelValue) || {})
  }

  /** 输出新对象；为空时输出 undefined（导出时省略） */
  function output(list: [string, any][]) {
    emit('update:modelValue', list.length ? Object.fromEntries(list) : undefined)
  }

  /** 值 → 输入框文本：非字符串常量按 JSON 显示 */
  function valueText(v: unknown): string {
    if (v === undefined || v === null) return ''
    return typeof v === 'string' ? v : JSON.stringify(v)
  }

  /** 输入框文本 → 值：含 ${变量} 或不是合法 JSON 时为字符串；数字、布尔、对象、数组按 JSON 解析 */
  function coerce(text: string): any {
    if (props.stringOnly || /\$\{[^}]+\}/.test(text)) return text
    const t = text.trim()
    if (!t || !/^(-?\d|true$|false$|null$|\[|\{)/.test(t)) return text
    try {
      return JSON.parse(t)
    } catch {
      return text
    }
  }

  function setValue(name: string, text: string) {
    output(entries().map(([k, v]) => (k === name ? [k, coerce(text)] : [k, v])))
  }

  function add() {
    const names = new Set(entries().map(([k]) => k))
    let i = 1
    while (names.has(`${props.keyPrefix}${i}`)) i++
    output([...entries(), [`${props.keyPrefix}${i}`, '']])
  }

  function remove(name: string) {
    output(entries().filter(([k]) => k !== name))
    if (isFile(name)) toggleFile(name, false)
    if (isInternal(name)) toggleInternal(name, false)
  }

  function commitName(uid: string, oldName: string, newName: string) {
    delete nameDrafts[uid]
    const n = newName.trim()
    if (!n || n === oldName) return
    if (entries().some(([k]) => k === n)) {
      ElMessage.warning(`参数 ${n} 已存在`)
      return
    }
    output(entries().map(([k, v]) => (k === oldName ? [n, v] : [k, v])))
    if (isFile(oldName)) outputFiles((props.files || []).map((f) => (f === oldName ? n : f)))
    if (isInternal(oldName)) outputInternal((props.internal || []).map((f) => (f === oldName ? n : f)))
  }
</script>

<style scoped lang="scss">
  .input-params {
    width: 100%;
  }

  .ip-row {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
  }

  .ip-name {
    flex-shrink: 0;
    width: 110px;
  }

  .ip-value {
    flex: 1;
    min-width: 0;
  }

  // 内部参数未填值：红框提示
  .ip-value.is-required :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-color-danger) inset;
  }

  .ip-file {
    flex-shrink: 0;
    margin-right: 0;
  }

  // 底部操作统一字号与样式（都是带图标的主色文字按钮）
  .ip-foot {
    display: flex;
    gap: 12px;
    align-items: center;

    .el-button {
      font-size: 12px;
    }

    .el-button + .el-button {
      margin-left: 0;
    }
  }
</style>
