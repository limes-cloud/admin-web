<template>
  <ElDialog
    :model-value="modelValue"
    fullscreen
    :show-close="false"
    :close-on-press-escape="false"
    :before-close="onBeforeClose"
    destroy-on-close
    append-to-body
    class="chain-editor-dialog"
    @update:model-value="emit('update:modelValue', $event)"
    @opened="editorRef?.refreshCanvas()"
  >
    <ChainEditor
      v-if="modelValue && chainId"
      ref="editorRef"
      :chain-id="chainId"
      :version-id="versionId"
      @close="emit('update:modelValue', false)"
      @saved="emit('saved')"
    />
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import ChainEditor from './ChainEditor.vue'

  // 全屏编辑弹窗：从列表 / 版本页打开，关闭前由编辑器确认未保存修改
  defineOptions({ name: 'ChainEditorDialog' })

  defineProps<{
    modelValue: boolean
    chainId: number
    /** 以指定版本为底编辑；不传 = 当前生效版本 */
    versionId?: number
  }>()

  const emit = defineEmits<{
    'update:modelValue': [visible: boolean]
    /** 保存了新版本（列表刷新生效版本等信息） */
    saved: []
  }>()

  const editorRef = ref<InstanceType<typeof ChainEditor>>()

  /** 弹窗关闭（遮罩等）统一走编辑器的未保存确认 */
  function onBeforeClose() {
    editorRef.value?.requestClose()
  }
</script>

<style lang="scss">
  // 关闭全局的缩放入场动画：画布在缩放过程中测量端口位置会算错（getBoundingClientRect 含祖先 transform），
  // 导致连线端点偏离节点端口
  .dialog-fade-enter-active .el-dialog.chain-editor-dialog.is-fullscreen,
  .dialog-fade-leave-active .el-dialog.chain-editor-dialog.is-fullscreen {
    animation: none;
  }

  // 全屏弹窗去掉标题栏与内边距，内容区铺满（全屏无圆角由全局 el-ui.scss 处理）
  .chain-editor-dialog.el-dialog {
    display: flex;
    flex-direction: column;
    padding: 0;

    > .el-dialog__header {
      display: none;
    }

    > .el-dialog__body {
      flex: 1;
      min-height: 0;
      padding: 0;
    }
  }
</style>
