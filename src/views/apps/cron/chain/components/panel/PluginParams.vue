<template>
  <div v-if="node" class="plugin-params">
    <div class="tp-head">
      <span v-if="tpl?.icon" class="tp-icon" :style="{ background: tpl.iconBg || 'var(--el-color-primary)' }">
        <ArtIcon :value="tpl.icon" :size="13" />
      </span>
      <span class="tp-name">{{ tpl?.name || node.plugin }}</span>
      <ElTag size="small" type="info">{{ node.plugin }} v{{ node.pluginVersion }}</ElTag>
      <ElTag v-if="canUpgrade" size="small" type="warning" effect="plain" class="tp-upgrade" @click="upgrade">
        升级到 v{{ tpl?.currentVersionNo }}
      </ElTag>
    </div>
    <div v-if="!tpl" class="tp-tip is-warn">插件未启用或不存在，保存时会报错</div>
    <div v-if="fieldError('plugin') || fieldError('pluginVersion')" class="tp-tip is-error">
      {{ fieldError('plugin') || fieldError('pluginVersion') }}
    </div>

    <div v-if="loading" class="tp-tip">正在加载插件定义…</div>
    <div v-else-if="!spec" class="tp-tip is-error">取不到插件 {{ node.plugin }} v{{ node.pluginVersion }} 的定义</div>
    <template v-else>
      <!-- 插件节点 = 提前配好的节点：只能修改请求参数的值，其余配置与输出由插件决定 -->
      <ElFormItem label="请求参数（input）" :error="fieldError('input')">
        <div v-if="!paramRows.length" class="tp-tip">该插件没有请求参数</div>
        <div v-for="p in paramRows" :key="p.name" class="tp-row">
          <span class="tp-key" :title="p.name">{{ p.name }}</span>
          <TemplateInput
            :model-value="paramText(p.name)"
            :candidates="candidates"
            :placeholder="p.isFile ? '文件地址：http(s) URL 或 data URI' : '使用插件默认值'"
            class="tp-value"
            @update:model-value="setParam(p.name, $event)"
          />
          <ElTag v-if="p.isFile" size="small" type="info">文件</ElTag>
        </div>
        <div v-for="k in unknownParams" :key="k" class="tp-unknown">
          <span>参数 {{ k }} {{ internal.includes(k) ? '是插件内部参数，不能修改' : '不在当前插件版本中' }}</span>
          <ElButton size="small" text type="danger" @click="removeParam(k)">移除</ElButton>
        </div>
      </ElFormItem>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useChainEditorStore } from '@/store/modules/chain-editor'
  import TemplateInput from './TemplateInput.vue'
  import type { VariableCandidate } from '../../types/graph'
  import type { Issue } from '../../types/issue'

  defineOptions({ name: 'PluginParams' })

  const props = withDefaults(defineProps<{ issues?: Issue[]; candidates?: VariableCandidate[] }>(), {
    issues: () => [],
    candidates: () => []
  })

  // 编辑对象取自编辑器 store：直接修改选中插件节点上的参数值（node.input 只存改过的参数）
  const store = useChainEditorStore()
  const node = computed(() => store.selectedNode)
  const tpl = computed(() => store.pluginOf(node.value?.plugin))
  const spec = computed(() => (node.value ? store.specOf(node.value) : undefined))
  const loading = ref(false)

  // 节点或版本变化时确保 spec 已加载
  watch(
    () => [node.value?.plugin, node.value?.pluginVersion] as const,
    async ([kw, ver]) => {
      if (!kw || !ver) return
      loading.value = true
      try {
        await store.ensureSpec(kw, ver)
      } finally {
        loading.value = false
      }
    },
    { immediate: true }
  )

  const canUpgrade = computed(
    () => !!tpl.value?.currentVersionNo && (node.value?.pluginVersion || 0) < tpl.value.currentVersionNo
  )

  /** 插件定义的请求参数（spec.config.input 的顶层字段） */
  const defaults = computed<Record<string, any>>(() => {
    const v = spec.value?.config?.input
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
  })

  /** 内部参数由插件固定，节点上不展示 */
  const internal = computed<string[]>(() => spec.value?.internal || [])

  const paramRows = computed(() => {
    const files: string[] = spec.value?.config?.files || []
    return Object.keys(defaults.value)
      .filter((name) => !internal.value.includes(name))
      .map((name) => ({ name, isFile: files.includes(name) }))
  })

  /** 节点上改过、但当前插件版本里已没有（或已改为内部参数）的参数（升级后可能出现） */
  const unknownParams = computed(() =>
    Object.keys(overrides.value).filter((k) => !(k in defaults.value) || internal.value.includes(k))
  )

  /** 节点上改过的参数值 */
  const overrides = computed<Record<string, any>>(() => {
    const v = node.value?.input
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
  })

  function fieldError(field: string): string {
    return props.issues.find((i) => i.field === field || i.field.startsWith(`${field}.`))?.message || ''
  }

  /** 参数值 → 输入框文本：节点改过的值优先，否则显示插件默认值；非字符串按 JSON 显示 */
  function paramText(name: string): string {
    const v = name in overrides.value ? overrides.value[name] : defaults.value[name]
    if (v === undefined || v === null) return ''
    return typeof v === 'string' ? v : JSON.stringify(v)
  }

  /** 输入框文本 → 值：含占位符或非 JSON 时为字符串；与插件默认值相同时不保存覆盖 */
  function coerce(text: string): any {
    if (/\$\{[^}]+\}/.test(text)) return text
    const t = text.trim()
    if (!t || !/^(-?\d|true$|false$|null$|\[|\{)/.test(t)) return text
    try {
      return JSON.parse(t)
    } catch {
      return text
    }
  }

  function setParam(name: string, text: string) {
    const n = node.value
    if (!n) return
    const next = { ...overrides.value }
    const v = coerce(text)
    if (JSON.stringify(v) === JSON.stringify(defaults.value[name])) delete next[name]
    else next[name] = v
    n.input = Object.keys(next).length ? next : undefined
  }

  function removeParam(name: string) {
    const n = node.value
    if (!n) return
    const next = { ...overrides.value }
    delete next[name]
    n.input = Object.keys(next).length ? next : undefined
  }

  function upgrade() {
    if (node.value) store.upgradePlugin(node.value.id)
  }
</script>

<style scoped lang="scss">
  .plugin-params {
    margin-bottom: 8px;
  }

  .tp-head {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 8px;
  }

  .tp-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: #fff;
    border-radius: 5px;
  }

  .tp-upgrade {
    margin-left: auto;
    cursor: pointer;
  }

  .tp-name {
    font-weight: 500;
  }

  .tp-type {
    color: var(--el-text-color-secondary);
  }

  .tp-tip {
    margin-bottom: 8px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);

    &.is-warn {
      color: var(--el-color-warning);
    }

    &.is-error {
      color: var(--el-color-danger);
    }

    code {
      padding: 0 3px;
      margin-right: 4px;
      background: var(--el-fill-color);
      border-radius: 3px;
    }
  }

  .tp-row {
    display: flex;
    gap: 6px;
    align-items: center;
    width: 100%;
    margin-bottom: 6px;
  }

  .tp-key {
    flex-shrink: 0;
    width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tp-value {
    flex: 1;
    min-width: 0;
  }

  .tp-unknown {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--el-color-danger);
  }
</style>
