<template>
  <ElDialog
    :model-value="modelValue"
    title="脚本可用函数"
    width="820px"
    top="6vh"
    append-to-body
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="sch-intro">
      脚本必须定义 <code>function handler(ctx, input)</code>：<code>input</code> 是节点入参，返回值成为节点输出；
      <code>throw</code> 视为节点失败（按重试 / 忽略错误配置处理）。编辑器里输入 <code>ctx.</code> 或
      <code>console.</code> 会自动提示；时间均为 Unix 秒、北京时间。
    </div>
    <div class="sch-redis">
      <div class="sch-redis__title">Redis 跨任务缓存</div>
      <div>脚本可以通过 <code>ctx.redis</code> 在多次运行、多个任务之间共享状态。</div>
      <ul>
        <li>
          key 自动拼接当前应用前缀 <code>cron:chain:kv:{app}:</code>，同一应用下的任务可共享，不同应用互相隔离。
        </li>
        <li>
          所有写入都必须带过期时间：<code>ttl</code> 单位为秒，省略或传 <code>0</code> 时默认 7 天，最大 7 天；
          负数或超过 7 天会报错。
        </li>
        <li>
          value 按 JSON 存取，读取不存在的 key 返回 <code>null</code>；单次脚本最多调用 Redis 1000 次，value 最大 64KB。
        </li>
      </ul>
      <pre class="sch-example">{{ REDIS_EXAMPLE }}</pre>
    </div>
    <ElTable :data="SCRIPT_CTX_FNS" size="small" border max-height="64vh">
      <ElTableColumn label="函数" width="260">
        <template #default="{ row }">
          <code class="sch-sign">{{ row.root || 'ctx' }}.{{ row.path }}{{ row.params }}</code>
          <div class="sch-returns">返回 {{ row.returns }}</div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="说明" min-width="220">
        <template #default="{ row }">
          <div>{{ row.desc }}</div>
          <ul v-if="row.notes?.length" class="sch-notes">
            <li v-for="n in row.notes" :key="n">{{ n }}</li>
          </ul>
        </template>
      </ElTableColumn>
      <ElTableColumn label="示例" min-width="260">
        <template #default="{ row }">
          <pre class="sch-example">{{ row.example }}</pre>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElDialog>
</template>

<script setup lang="ts">
  import { SCRIPT_CTX_FNS } from '../../utils/script-ctx'

  const REDIS_EXAMPLE = `// 任务 A：保存中间状态
ctx.redis.set('job:' + input.jobId, {
  stage: 'parsed',
  resourceId: input.resourceId
}, 86400)

// 任务 B：读取状态，并用原子自增做重试计数
const state = ctx.redis.get('job:' + input.jobId)
const retry = ctx.redis.incr('retry:' + input.jobId, 1, 86400)
if (retry > 5) throw new Error('重试次数超过上限')`

  // 脚本 ctx 函数说明弹窗
  defineOptions({ name: 'ScriptCtxHelp' })

  defineProps<{ modelValue: boolean }>()

  const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<style scoped lang="scss">
  .sch-intro {
    margin-bottom: 12px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
  }

  .sch-redis {
    padding: 10px 12px;
    margin-bottom: 12px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-light);
    border-left: 3px solid var(--el-color-primary);
    border-radius: 4px;

    ul {
      padding-left: 16px;
      margin: 4px 0;
    }

    .sch-example {
      margin-top: 6px;
      background: var(--el-bg-color);
    }
  }

  .sch-redis__title {
    margin-bottom: 4px;
    font-weight: 600;
  }

  code {
    padding: 0 4px;
    font-family: Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    background: var(--el-fill-color);
    border-radius: 3px;
  }

  .sch-sign {
    padding: 0;
    word-break: break-all;
    background: none;
  }

  .sch-returns {
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .sch-notes {
    padding-left: 16px;
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .sch-example {
    padding: 6px 8px;
    margin: 0;
    overflow-x: auto;
    font-family: Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    line-height: 1.5;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }
</style>
