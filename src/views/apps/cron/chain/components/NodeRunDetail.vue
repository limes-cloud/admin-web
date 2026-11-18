<template>
  <div class="nrd-detail">
    <div class="nrd-title">请求参数</div>
    <pre class="nrd-pre">{{ pretty(request) || '-' }}</pre>
    <div class="nrd-title">原始输出</div>
    <pre class="nrd-pre">{{ pretty(response) || '-' }}</pre>
    <div class="nrd-title">最终输出</div>
    <pre class="nrd-pre">{{ pretty(output) || 'null' }}</pre>
    <div class="nrd-title">日志</div>
    <div v-if="logList.length" class="nrd-logs">
      <div v-for="(l, i) in logList" :key="i" class="nrd-log" :class="`is-${l.level}`">
        <span class="nrd-log__time">{{ logTime(l.time) }}</span>
        <span class="nrd-log__level">{{ l.level }}</span>
        <span class="nrd-log__msg">{{ l.msg }}</span>
      </div>
    </div>
    <div v-else class="nrd-empty">无日志</div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { pretty } from '../utils/format'

  // 节点一次执行的请求参数 / 原始输出 / 最终输出 / 日志（运行详情与单节点测试共用）
  defineOptions({ name: 'NodeRunDetail' })

  const props = defineProps<{ request?: any; response?: any; output?: any; logs?: string }>()

  /** 日志：JSON 字符串数组 [{level,msg,time}] */
  const logList = computed<{ level: string; msg: string; time?: number }[]>(() => {
    const raw = props.logs
    if (!raw) return []
    try {
      const v = JSON.parse(raw)
      return Array.isArray(v) ? v : []
    } catch {
      return [{ level: 'info', msg: raw }]
    }
  })

  /** 脚本日志时间为毫秒 */
  function logTime(ms?: number): string {
    if (!ms) return ''
    const d = new Date(ms)
    const p = (n: number, w = 2) => String(n).padStart(w, '0')
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`
  }
</script>

<style scoped lang="scss">
  .nrd-title {
    margin: 14px 0 6px;
    font-size: 13px;
    font-weight: 500;
  }

  .nrd-pre {
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

  .nrd-logs {
    max-height: 240px;
    padding: 6px 8px;
    overflow: auto;
    font-family: Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .nrd-log {
    display: flex;
    gap: 8px;

    &.is-error .nrd-log__level,
    &.is-error .nrd-log__msg {
      color: var(--el-color-danger);
    }

    &.is-warn .nrd-log__level {
      color: var(--el-color-warning);
    }
  }

  .nrd-log__time,
  .nrd-log__level {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
  }

  .nrd-log__msg {
    word-break: break-all;
    white-space: pre-wrap;
  }

  .nrd-empty {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
