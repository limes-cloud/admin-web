<template>
  <div class="script-code">
    <ArtCodeEditor
      :model-value="modelValue || SCRIPT_TEMPLATE"
      lang="javascript"
      show-fullscreen
      :read-only="readonly"
      :style="{ width: '100%', height: '320px' }"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <div class="script-code__tip">
      <span>输入 <code>ctx.</code> 提示可用函数，<code>ctx.redis</code> 支持跨任务缓存</span>
      <ElButton link type="primary" :icon="QuestionFilled" @click="helpVisible = true">函数说明</ElButton>
    </div>
    <ScriptCtxHelp v-model="helpVisible" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import ArtCodeEditor from '@/components/core/base/art-code-editor/index.vue'
  import ScriptCtxHelp from './ScriptCtxHelp.vue'
  import { SCRIPT_TEMPLATE } from '../../utils/constants'
  import { registerScriptLib } from '../../utils/script-ctx'

  // 节点内脚本编辑器：复用公共代码编辑器（JavaScript，自带右上角全屏切换）；代码为空时以 handler 模板初始化
  defineOptions({ name: 'ScriptCode' })

  const props = defineProps<{ modelValue?: string; readonly?: boolean }>()

  const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

  const helpVisible = ref(false)

  // ctx 类型声明先于编辑器创建注册，打开即有补全
  registerScriptLib()

  onMounted(() => {
    if (!props.modelValue?.trim()) emit('update:modelValue', SCRIPT_TEMPLATE)
  })
</script>

<style scoped lang="scss">
  .script-code {
    width: 100%;
  }

  .script-code__tip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 12px;
    line-height: 20px;
    color: var(--el-text-color-secondary);

    code {
      padding: 0 3px;
      font-family: Menlo, Monaco, Consolas, monospace;
      background: var(--el-fill-color);
      border-radius: 3px;
    }

    .el-button {
      font-size: 12px;
    }
  }
</style>
