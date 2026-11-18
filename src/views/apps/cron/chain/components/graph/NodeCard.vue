<template>
  <div
    class="node-card"
    :class="[stateClass, { 'is-selected': selected, 'has-error': hasError, 'has-warning': !hasError && hasWarn }]"
    :style="{ '--node-color': color }"
    @dblclick.stop="emit('dblclick')"
  >
    <div class="node-card__head">
      <span class="node-card__logo"><slot name="icon" /></span>
      <span class="node-card__title" :title="title">{{ title }}</span>
      <slot name="extra" />
    </div>
    <div v-if="$slots.default" class="node-card__body"><slot /></div>
    <div v-if="$slots.status" class="node-card__status" title="查看执行详情" @click.stop="emit('statusClick')">
      <slot name="status" />
      <ElIcon class="node-card__status-more"><ArrowRight /></ElIcon>
    </div>
    <span v-if="issueCount" class="node-card__badge" :title="issueTitle">{{ issueCount }}</span>
    <slot name="ports" />
  </div>
</template>

<script setup lang="ts">
  import { ArrowRight } from '@element-plus/icons-vue'

  // 节点卡片外壳（参考 Coze 节点）：彩色图标 + 标题栏，下方为"标签 | 内容"两列字段区
  defineOptions({ name: 'NodeCard' })

  withDefaults(
    defineProps<{
      title: string
      /** 图标底色 */
      color: string
      selected?: boolean
      hasError?: boolean
      hasWarn?: boolean
      issueCount?: number
      issueTitle?: string
      /** 运行态样式类，如 st-success */
      stateClass?: string
    }>(),
    { selected: false, hasError: false, hasWarn: false, issueCount: 0, issueTitle: '', stateClass: '' }
  )

  const emit = defineEmits<{ statusClick: []; dblclick: [] }>()
</script>

<style scoped lang="scss">
  .node-card {
    position: relative;
    box-sizing: border-box;
    width: 360px;
    font-size: 12px;
    color: var(--el-text-color-primary);
    background: var(--el-bg-color);
    border: 1px solid rgb(6 7 9 / 12%);
    border-radius: 8px;
    box-shadow:
      0 2px 6px 0 rgb(0 0 0 / 4%),
      0 4px 12px 0 rgb(0 0 0 / 2%);
    transition:
      border-color 0.15s,
      box-shadow 0.15s;

    &:hover {
      box-shadow:
        0 4px 10px 0 rgb(0 0 0 / 8%),
        0 8px 20px 0 rgb(0 0 0 / 4%);
    }

    &.is-selected {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 1px var(--el-color-primary);
    }

    &.has-warning {
      border-color: var(--el-color-warning);
    }

    &.has-error {
      border-color: var(--el-color-danger);
      box-shadow: 0 0 0 1px var(--el-color-danger);
    }

    &.st-running,
    &.st-ready {
      border-color: var(--el-color-primary);
    }

    &.st-waiting {
      border-color: var(--el-color-warning);
    }

    &.st-success,
    &.st-ignored {
      border-color: var(--el-color-success);
    }

    &.st-fail {
      border-color: var(--el-color-danger);
    }

    &.st-skipped,
    &.st-canceled {
      opacity: 0.55;
    }

    &.st-bypassed {
      border-color: var(--el-color-info);
      opacity: 0.72;
    }
  }

  // 标题栏顶部带一层节点主题色的淡渐变（参考 Coze）
  .node-card__head {
    box-sizing: border-box;
    display: flex;
    gap: 8px;
    align-items: center;
    height: 48px;
    padding: 0 12px;
    background: linear-gradient(180deg, color-mix(in srgb, var(--node-color) 9%, transparent), transparent);
    border-radius: 8px 8px 0 0;
  }

  .node-card__logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 15px;
    color: #fff;
    background: var(--node-color);
    border-radius: 6px;
  }

  .node-card__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .node-card__body {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 6px 8px;
    align-items: center;
    padding: 0 12px 12px;
  }

  .node-card__status {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: var(--el-fill-color-lighter);
    border-top: 1px solid var(--el-border-color-lighter);
    border-radius: 0 0 8px 8px;

    &:hover {
      background: var(--el-fill-color);

      .node-card__status-more {
        color: var(--el-color-primary);
      }
    }
  }

  // 状态条右侧箭头：提示可点击查看执行详情
  .node-card__status-more {
    flex-shrink: 0;
    margin-left: auto;
    color: var(--el-text-color-placeholder);
  }

  // 前面有耗时时，耗时已靠右，箭头紧跟其后
  .cn-cost + .node-card__status-more {
    margin-left: 0;
  }

  .node-card__badge {
    position: absolute;
    top: -8px;
    right: -8px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    font-size: 11px;
    line-height: 16px;
    color: #fff;
    text-align: center;
    background: var(--el-color-danger);
    border-radius: 8px;
  }
</style>

<style lang="scss">
  // 卡片字段区的公共元素：由各节点组件放进默认插槽（插槽内容不受上面 scoped 样式作用）
  .node-card {
    // 底部状态条耗时：靠右、等宽数字
    .cn-cost {
      flex-shrink: 0;
      margin-left: auto;
      font-variant-numeric: tabular-nums;
      color: var(--el-text-color-secondary);
    }

    // 底部状态条文字（运行态）
    .cn-state {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.is-success {
        color: var(--el-color-success);
      }

      &.is-fail {
        color: var(--el-color-danger);
      }

      &.is-running,
      &.is-ready {
        color: var(--el-color-primary);
      }
    }

    .nc-label {
      font-weight: 500;
      line-height: 16px;
      color: var(--el-text-color-secondary);
      text-align: right;
      white-space: nowrap;
    }

    .nc-value {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      min-width: 0;
    }

    .nc-tag {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      max-width: 100%;
      height: 22px;
      padding: 0 6px;
      overflow: hidden;
      font-weight: 500;
      color: var(--el-text-color-primary);
      white-space: nowrap;
      background: var(--el-fill-color);
      border-radius: 4px;

      > span {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      > em {
        flex-shrink: 0;
        font-style: normal;
        font-weight: 400;
        color: var(--el-text-color-secondary);
      }
    }

    .nc-empty {
      line-height: 22px;
      color: var(--el-text-color-placeholder);
    }

    .nc-chip {
      flex-shrink: 0;
      height: 18px;
      padding: 0 6px;
      font-size: 11px;
      line-height: 18px;
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
      border-radius: 4px;

      &.is-success {
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
      }
    }
  }
</style>
