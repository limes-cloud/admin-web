<template>
  <ElDialog
    :model-value="modelValue"
    :title="title"
    width="760px"
    top="6vh"
    append-to-body
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="rch">
      <p>
        {{ action }}条件使用与成功判定相同的表达式语法，变量写成 <code>${...}</code>。条件为空时只按错误类型匹配；
        填写后需要与错误类型<b>同时满足</b>，条件结果为 <code>true</code> 才会{{ action }}。
      </p>

      <p class="rch-sub">可用变量</p>
      <ElTable :data="VARIABLES" size="small" border>
        <ElTableColumn label="变量" width="180">
          <template #default="{ row }">
            <code>{{ row.name }}</code>
          </template>
        </ElTableColumn>
        <ElTableColumn label="说明" prop="desc" />
      </ElTable>

      <p class="rch-sub">error.body 字段</p>
      <ElAlert type="info" :closable="false" show-icon>
        <code>error.body</code> 没有固定字段，它就是接口返回的响应体。JSON
        响应会解析成对象，字段名和层级完全由接口决定； 响应不是 JSON 时，<code>error.body</code> 是字符串。
      </ElAlert>
      <ElTable :data="BODY_FIELDS" size="small" border class="rch-body-fields">
        <ElTableColumn label="常见字段" width="180">
          <template #default="{ row }">
            <code>{{ row.name }}</code>
          </template>
        </ElTableColumn>
        <ElTableColumn label="说明" prop="desc" />
      </ElTable>
      <ul class="rch-rules">
        <li>实际有哪些字段，以对应接口的响应为准；可以在节点运行详情的响应记录里查看。</li>
        <li>嵌套字段直接继续写路径，例如 <code>${error.body.data.status}</code>。</li>
        <li>字段不存在时值为 <code>null</code>，条件不会命中。</li>
      </ul>

      <p class="rch-sub">示例</p>
      <ElTable :data="EXAMPLES" size="small" border>
        <ElTableColumn label="场景" width="150" prop="title" />
        <ElTableColumn :label="`${action}条件`">
          <template #default="{ row }">
            <pre class="rch-code">{{ row.condition }}</pre>
          </template>
        </ElTableColumn>
      </ElTable>

      <p class="rch-sub">匹配规则</p>
      <ul class="rch-rules">
        <li>错误类型和{{ action }}条件同时满足；{{ matchRule }}</li>
        <li
          >可使用
          <code>==</code
          >、<code>!=</code>、<code>&gt;</code>、<code>&gt;=</code>、<code>&lt;</code>、<code>&lt;=</code>、<code>&amp;&amp;</code>、<code>||</code>。</li
        >
        <li>字符串包含判断写成 <code>${error.message} contains "文本"</code>，区分大小写。</li>
        <li
          ><code>error.body</code> 是解析后的响应体：HTTP 4xx/5xx 或 <code>Chain.Business</code> 时通常可读取 JSON
          字段。</li
        >
        <li><code>Chain.Business</code> 表示 HTTP 成功，但节点的“成功判定（responseCondition）”结果为 false。</li>
      </ul>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  defineOptions({ name: 'RetryConditionHelp' })

  const props = withDefaults(defineProps<{ modelValue: boolean; mode?: 'retry' | 'suspend' }>(), {
    mode: 'retry'
  })

  const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

  const VARIABLES = [
    { name: '${error.type}', desc: '错误类型，例如 Chain.Timeout、Chain.Http5xx、Chain.Business' },
    { name: '${error.status}', desc: 'HTTP 状态码；没有 HTTP 响应时为 0' },
    { name: '${error.message}', desc: '错误信息。HTTP 错误包含状态码和响应体，业务错误为渲染后的 errorMsg' },
    { name: '${error.body}', desc: '解析后的响应体，JSON 响应可直接读取字段，例如 ${error.body.reason}' }
  ]

  const title = computed(() => (props.mode === 'suspend' ? '挂起条件说明' : '重试条件说明'))
  const action = computed(() => (props.mode === 'suspend' ? '挂起' : '重试'))
  const matchRule = computed(() =>
    props.mode === 'suspend'
      ? '命中后运行进入挂起，延迟到期后重新运行当前节点。'
      : '多个重试策略按从上到下的顺序匹配第一个命中的策略。'
  )

  const RETRY_EXAMPLES = [
    { title: '指定状态码', condition: '${error.status} == 503' },
    { title: '4xx 全部重试', condition: '${error.status} >= 400 && ${error.status} < 500' },
    { title: '错误信息包含', condition: '${error.message} contains "账号限流"' },
    { title: '响应体原因', condition: '${error.body.reason} == "SearchEgressBlockedError"' },
    { title: '响应体业务码', condition: '${error.body.code} == 41030' },
    { title: '多种错误类型', condition: '${error.type} == "Chain.Timeout" || ${error.type} == "Chain.Network"' }
  ]

  const SUSPEND_EXAMPLES = [
    { title: '账号限流', condition: '${error.type} == "Chain.RateLimited"' },
    { title: '账号暂停', condition: '${error.body.reason} == "AccountLimitedError"' },
    { title: '错误信息包含', condition: '${error.message} contains "账号限流"' },
    { title: '指定状态码', condition: '${error.status} == 429' },
    { title: '响应体业务码', condition: '${error.body.code} == 41030' }
  ]

  const EXAMPLES = computed(() => (props.mode === 'suspend' ? SUSPEND_EXAMPLES : RETRY_EXAMPLES))

  const BODY_FIELDS = [
    { name: 'code', desc: '常见于业务错误码，例如 41030；不是所有接口都有' },
    { name: 'reason', desc: '常见于稳定的错误原因，例如 AccountLimitedError' },
    { name: 'message / msg', desc: '错误文案，具体字段名由接口决定' },
    { name: 'data', desc: '业务错误附带的详细数据，通常是对象或数组' },
    { name: 'metadata', desc: '扩展信息，例如任务、账号或上下文字段' }
  ]
</script>

<style scoped lang="scss">
  .rch {
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-regular);

    p {
      margin: 0 0 8px;
    }

    code {
      padding: 0 4px;
      font-family: Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      background: var(--el-fill-color);
      border-radius: 3px;
    }
  }

  .rch-sub {
    margin-top: 14px !important;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .rch-code {
    margin: 0;
    font-family: Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .rch-rules {
    padding-left: 18px;
    margin: 0;
  }

  .rch-body-fields {
    margin-top: 8px;
  }
</style>
