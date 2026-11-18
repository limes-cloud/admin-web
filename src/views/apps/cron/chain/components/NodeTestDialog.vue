<template>
  <ElDialog
    :model-value="modelValue"
    :title="`测试节点：${node?.name || node?.id || ''}`"
    width="720px"
    :close-on-click-modal="false"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @open="onOpen"
  >
    <div class="ntd">
      <div class="ntd-tip">只执行当前节点一次（含重试），不创建运行记录，结果不写入变量池。</div>
      <div class="ntd-title">{{
        definition ? '请求参数（使用插件的节点填写的值，默认为插件预设值）' : '节点引用的变量'
      }}</div>
      <div v-if="!paths.length" class="ntd-empty">
        {{ definition ? '插件没有请求参数，无需填写' : '节点未引用流程变量，无需填写' }}
      </div>
      <div v-for="p in paths" :key="p" class="ntd-var">
        <code class="ntd-var__path" :title="p">{{ definition ? p : '${' + p + '}' }}</code>
        <ElTag v-if="internal.includes(p)" size="small" type="info">内部</ElTag>
        <ElInput v-model="values[p]" placeholder="值；数字、布尔、对象按 JSON 填写，其余按字符串" />
      </div>

      <template v-if="result">
        <div class="ntd-title">执行结果</div>
        <ElAlert
          v-for="(is, i) in result.issues || []"
          :key="i"
          :type="is.level === 'error' ? 'error' : 'warning'"
          :title="is.field ? `${is.field}：${is.message}` : is.message"
          :closable="false"
          class="ntd-issue"
        />
        <ElDescriptions v-if="result.status" :column="3" size="small" border>
          <ElDescriptionsItem label="状态">
            <ElTag size="small" :type="statusOf(result.status).type">{{ statusOf(result.status).label }}</ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="耗时">{{ result.costMs }} ms</ElDescriptionsItem>
          <ElDescriptionsItem label="重试次数">{{ result.retry }}</ElDescriptionsItem>
          <ElDescriptionsItem v-if="result.errorCode" label="错误" :span="3">
            <span class="ntd-error">{{ result.errorCode }}{{ result.errorMsg ? `：${result.errorMsg}` : '' }}</span>
          </ElDescriptionsItem>
        </ElDescriptions>
        <template v-if="result.status">
          <NodeRunDetail
            :request="result.request"
            :response="result.response"
            :output="result.output"
            :logs="result.logs"
          />
          <template v-if="result.respond !== undefined">
            <div class="ntd-title">提前返回数据（ctx.response）</div>
            <pre class="ntd-pre">{{ pretty(result.respond) || 'null' }}</pre>
          </template>
        </template>
      </template>
    </div>
    <template #footer>
      <ElButton @click="emit('update:modelValue', false)">关闭</ElButton>
      <ElButton v-permission="permission" type="primary" :loading="running" @click="run">
        {{ result ? '重新执行' : '执行' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { TestChainNode, TestChainNodeVersion } from '@/api/cron/chain/api'
  import type { TestChainNodeReply } from '@/api/cron/chain/type'
  import NodeRunDetail from './NodeRunDetail.vue'
  import type { Node } from '../types/dsl'
  import { NODE_STATUS, RUN_STATUS } from '../utils/constants'
  import { pretty } from '../utils/format'
  import { buildTestVars, parseTestValue, testVarPaths } from '../utils/node-test'

  // 单节点测试：填写节点引用的变量（插件定义填写请求参数的值），执行一次节点并展示请求、输出与日志
  defineOptions({ name: 'NodeTestDialog' })

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      node?: Node
      /** 插件定义：插件只能引用 run.*，测试时填写的是请求参数（input）各项的值 */
      definition?: boolean
      /** 插件定义的内部参数（标记展示） */
      internal?: string[]
      permission?: string
    }>(),
    { node: undefined, definition: false, internal: () => [], permission: 'cron:chain:debug-run' }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

  /** 同一会话内按节点 id 记住填写过的值，重复测试不用再填 */
  const lastValues = new Map<string, Record<string, string>>()

  const paths = ref<string[]>([])
  const values = ref<Record<string, string>>({})
  const running = ref(false)
  const result = ref<TestChainNodeReply>()

  /** 插件请求参数（input 为对象时的各项） */
  function pluginInput(): Record<string, any> {
    const input = props.node?.input
    return input && typeof input === 'object' && !Array.isArray(input) ? input : {}
  }

  /** 参数默认值的输入框文本：字符串原样，其余按 JSON */
  const toText = (v: unknown) => (typeof v === 'string' ? v : v === undefined ? '' : JSON.stringify(v))

  function onOpen() {
    result.value = undefined
    if (!props.node) return
    const last = lastValues.get(props.node.id) || {}
    if (props.definition) {
      const input = pluginInput()
      paths.value = Object.keys(input)
      values.value = Object.fromEntries(paths.value.map((p) => [p, last[p] ?? toText(input[p])]))
      return
    }
    paths.value = testVarPaths(props.node)
    values.value = Object.fromEntries(paths.value.map((p) => [p, last[p] ?? '']))
  }

  /** 插件定义：用填写的值替换请求参数；流程节点：填写的值组成变量池 */
  function payload(n: Node) {
    if (!props.definition) return { node: JSON.stringify(n), vars: buildTestVars(values.value) }
    if (!paths.value.length) return { node: JSON.stringify(n) }
    const input = Object.fromEntries(paths.value.map((p) => [p, parseTestValue(values.value[p] ?? '')]))
    return { node: JSON.stringify({ ...n, input }) }
  }

  function statusOf(s: string) {
    return NODE_STATUS[s as keyof typeof NODE_STATUS] || RUN_STATUS[s as keyof typeof RUN_STATUS] || { label: s }
  }

  async function run() {
    if (!props.node) return
    lastValues.set(props.node.id, { ...values.value })
    running.value = true
    try {
      const api = props.definition ? TestChainNodeVersion : TestChainNode
      result.value = await api(payload(props.node))
    } finally {
      running.value = false
    }
  }
</script>

<style scoped lang="scss">
  .ntd-tip,
  .ntd-empty {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .ntd-title {
    margin: 14px 0 6px;
    font-size: 13px;
    font-weight: 500;
  }

  .ntd-var {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
  }

  .ntd-var__path {
    flex: 0 0 220px;
    overflow: hidden;
    font-family: Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ntd-issue {
    margin-bottom: 6px;
  }

  .ntd-error {
    color: var(--el-color-danger);
  }

  .ntd-pre {
    max-height: 240px;
    padding: 8px;
    margin: 0;
    overflow: auto;
    font-size: 12px;
    word-break: break-all;
    white-space: pre-wrap;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }
</style>
