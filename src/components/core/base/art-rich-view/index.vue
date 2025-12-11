<template>
  <div class="rich-box">
    <div v-html="value"></div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ArtRichView' })

  // 使用 withDefaults 定义 props
  withDefaults(
    defineProps<{
      value?: string
    }>(),
    {
      value: ''
    }
  )
</script>

<style lang="scss" scoped>
  .rich-box * {
    all: revert; /* 恢复到浏览器默认样式 */
  }

  .rich-box {
    all: initial;
    width: 100%;
    padding: 0 15px;
    overflow: scroll;
    font-size: 14px;
    background-color: var(--el-bg-color-page);
  }
</style>
