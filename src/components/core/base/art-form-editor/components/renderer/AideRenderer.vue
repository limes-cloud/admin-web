<template>
  <el-divider v-if="node.type === 'divider'" />
  <el-alert
    v-else-if="node.type === 'alert'"
    :title="node.label"
    :description="node.config.description"
    :type="node.props?.type || 'info'"
    :closable="node.props?.closable ?? false"
    show-icon
    class="aide-alert"
  />
  <div v-else-if="node.type === 'text'" class="aide-text">
    {{ node.config.description }}
  </div>
  <el-button
    v-else-if="node.type === 'button'"
    :type="node.config.buttonType || 'primary'"
    :size="node.config.buttonSize || 'default'"
    :plain="node.config.buttonPlain"
    :round="node.config.buttonRound"
  >{{ node.config.buttonText || '按钮' }}</el-button>
  <div v-else-if="node.type === 'html'" class="aide-html" v-html="node.config.htmlContent" />
  <p
    v-else-if="node.type === 'paragraph'"
    class="aide-paragraph"
    :style="{ textAlign: node.config.paragraphAlign || 'left' }"
  >{{ node.config.paragraphContent }}</p>
  <el-tag
    v-else-if="node.type === 'tag'"
    :type="node.config.tagType || 'primary'"
    :effect="node.config.tagEffect || 'light'"
    :size="node.config.tagSize || 'default'"
    :round="node.config.tagRound"
    :closable="node.config.tagClosable"
  >{{ node.config.tagText || '标签' }}</el-tag>
  <el-link
    v-else-if="node.type === 'link'"
    :type="node.config.linkType || 'primary'"
    :underline="node.config.linkUnderline ?? true"
    :href="node.config.linkHref"
    :target="node.config.linkTarget || '_blank'"
  >{{ node.config.linkText || '链接' }}</el-link>
  <el-tooltip
    v-else-if="node.type === 'tooltip'"
    :content="node.config.tooltipContent || '提示文字'"
    :placement="(node.config.tooltipPlacement as any) || 'top'"
  >
    <span class="aide-tooltip-trigger">{{ node.config.tooltipTriggerText || '悬停查看提示' }}</span>
  </el-tooltip>
</template>

<script lang="ts" setup>
  import { FormNode } from '../../lib/types'

  defineProps<{
    node: FormNode
  }>()
</script>

<style lang="scss" scoped>
  .aide-alert {
    margin-bottom: 16px;
  }

  .aide-text {
    margin-bottom: 12px;
    font-size: 14px;
    color: #606266;
  }

  .aide-html {
    margin-bottom: 12px;
  }

  .aide-paragraph {
    margin: 0 0 12px;
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
  }

  .aide-tooltip-trigger {
    color: var(--el-color-primary);
    cursor: pointer;
    border-bottom: 1px dashed var(--el-color-primary);
  }
</style>
