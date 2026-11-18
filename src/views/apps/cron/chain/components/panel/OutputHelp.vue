<template>
  <ElDialog
    :model-value="modelValue"
    title="输出映射说明"
    width="760px"
    top="6vh"
    append-to-body
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="odh">
      <p>
        节点执行结果挂在 <code>{{ root }}</code> 上：{{ rootDesc }}。每行配置一个输出字段，值用
        <code>{{ refOf('...') }}</code> 从结果中取值，渲染结果就是节点输出，后续节点用
        <code>${输出名...}</code>
        引用。写成对象时，每个字段都会出现在后续节点的变量选择里。<b>留空 = 不关注输出，结果不写入变量池</b
        >（节点详情里仍能看到响应）。
      </p>
      <p class="odh-sub">{{ root === 'output' ? '示例返回值' : '示例响应' }}：</p>
      <pre class="odh-pre">{{ SAMPLE }}</pre>

      <ElTable :data="EXAMPLES" size="small" border>
        <ElTableColumn label="想要" width="150" prop="title" />
        <ElTableColumn label="输出映射（字段 → 值）">
          <template #default="{ row }">
            <pre class="odh-code">{{ row.mapping }}</pre>
          </template>
        </ElTableColumn>
        <ElTableColumn label="节点输出">
          <template #default="{ row }">
            <pre class="odh-code">{{ row.output }}</pre>
          </template>
        </ElTableColumn>
      </ElTable>

      <p class="odh-sub">取值规则</p>
      <ul class="odh-rules">
        <li
          >值只有一个占位符（如 <code>{{ refOf('data.list') }}</code
          >）保留原类型：数组还是数组、数字还是数字</li
        >
        <li
          >占位符与文字混写时结果是字符串，如 <code>用户 {{ refOf('data.user.name') }}</code></li
        >
        <li
          >路径不存在时值为 <code>null</code>；数组元素用下标，如 <code>{{ refOf('data.list.0') }}</code></li
        >
        <li
          >只能引用 <code>{{ refOf('') }}</code
          >，要用其他节点的数据请在后续节点里直接引用</li
        >
        <li>被动触发节点：映射结果放在输出的 <code>result</code> 下，触发数据在 <code>body</code> 下</li>
        <li
          >需要整体输出（不拆字段）时切到 JSON 编辑，写 <code>"{{ refOf('') }}"</code>；此时后续节点选不到下级字段</li
        >
      </ul>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  // 输出映射（output）配置说明弹窗：root 为执行结果的引用根（api response / 脚本 output）
  defineOptions({ name: 'OutputHelp' })

  const props = withDefaults(defineProps<{ modelValue: boolean; root?: string }>(), { root: 'response' })

  const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

  const SAMPLE = `{ "code": 0, "msg": "ok", "data": { "user": { "id": 9, "name": "tom" }, "list": [1, 2, 3] } }`

  const rootDesc = computed(() => (props.root === 'output' ? '脚本 handler 的返回值' : 'HTTP 响应体（JSON 自动解析）'))

  /** ${root.path} 引用写法 */
  function refOf(path: string): string {
    return '${' + props.root + (path ? '.' + path : '') + '}'
  }

  const EXAMPLES = computed(() => [
    {
      title: '挑字段并改名',
      mapping: `userId → ${refOf('data.user.id')}\nitems  → ${refOf('data.list')}`,
      output: '{ "userId": 9, "items": [1, 2, 3] }'
    },
    {
      title: '只要 data 里的用户',
      mapping: `user → ${refOf('data.user')}`,
      output: '{ "user": { "id": 9, "name": "tom" } }'
    },
    {
      title: '拼接字符串',
      mapping: `title → 用户 ${refOf('data.user.name')}`,
      output: '{ "title": "用户 tom" }'
    },
    {
      title: '结果是字符串（如 "ok"）',
      mapping: `text → ${refOf('')}`,
      output: '{ "text": "ok" }'
    }
  ])
</script>

<style scoped lang="scss">
  .odh {
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

  .odh-sub {
    margin-top: 12px !important;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .odh-pre,
  .odh-code {
    margin: 0;
    font-family: Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .odh-pre {
    padding: 6px 8px;
    margin-bottom: 12px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .odh-rules {
    padding-left: 18px;
    margin: 0;
  }
</style>
