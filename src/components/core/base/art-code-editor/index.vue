<template>
  <ElDialog
    v-model="visible"
    class="custom-code-dialog"
    fullscreen
    title="代码编辑"
    :footer="false"
    :body-style="{ padding: 0 }"
  >
    <Code
      v-bind="$attrs"
      :style="{ width: '100%', height: 'calc(100vh - 70px)' }"
      :is-fullscreen="!visible"
      :show-fullscreen="false"
      @change-fullscreen="toggleFullScreen"
    ></Code>
  </ElDialog>
  <Code v-bind="$attrs" :is-fullscreen="visible" @change-fullscreen="toggleFullScreen"></Code>
</template>

<style lang="scss">
  .custom-code-dialog {
    .el-dialog__header {
      padding-bottom: 0 !important;
    }
  }
</style>

<script lang="ts" setup>
  import Code from './code.vue'

  const visible = ref(false)
  const toggle = ref(true)
  const toggleFullScreen = (val: boolean) => {
    if (!toggle.value) {
      return
    }
    toggle.value = false
    visible.value = val
    setTimeout(() => {
      toggle.value = true
    }, 10)
  }
</script>
