<template>
  <!-- single 模式：仅展示 Tool 面板 -->
  <div v-if="single" class="form-edit-single">
    <Tool :node="singleNode" :nodes="singleNode ? [singleNode] : []" :single="true" />
  </div>

  <!-- 非 single + inline 模式 -->
  <div v-else-if="!formMode" class="form-edit">
    <Components @create="handleCreateComponent" />
    <Form v-model:list="nodes" :form-config="props.formConfig" @choose="handleChoose" @cancel="handleCancel"></Form>
    <Tool :node="curNode" :nodes="nodes" />
  </div>

  <!-- 非 single + dialog 模式 -->
  <div v-else class="model-form-item">
    <div class="select" @click="handleClick" :class="[{ 'is-disabled': disabled }]">
      <div class="select-text" v-if="nodes.length > 0">
        <el-icon><Operation></Operation></el-icon>
        <span style="margin-left: 5px">已配置</span>
      </div>
      <div v-else class="select-placeholder">{{ placeholder }}</div>
      <div class="arrow">
        <i class="iconfont-sys arrow-icon">&#xe709;</i>
        <i class="iconfont-sys clear-icon" @click.stop="clearComponent">&#xe83a;</i>
      </div>
    </div>
  </div>

  <ElDialog
    v-if="!single"
    v-model="dialogVisible"
    title="表单配置"
    body-class="scroll-dialog-footer"
    align-center
    :width="width"
    :fullscreen="fullscreen"
    :destroy-on-close="true"
  >
    <div class="form-edit" :class="!fullscreen ? 'form-edit-mini' : ''">
      <Components @create="handleCreateComponent" />
      <Form v-model:list="nodes" @choose="handleChoose"></Form>
      <Tool :node="curNode" :nodes="nodes" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import Components from './components/components.vue'
  import Form from './components/form.vue'
  import Tool from './components/tool.vue'
  import { FormNode, FormConfig } from './lib/types'
  import { defaultFormConfig } from './lib/data'
  import { removeNodeById } from './lib/editor'
  import { useHistory } from './lib/useHistory'
  import { Operation } from '@element-plus/icons-vue'

  const emit = defineEmits(['update:modelValue', 'update:singleNode'])
  const props = withDefaults(
    defineProps<{
      modelValue?: FormNode[]
      placeholder?: string
      fullscreen?: boolean
      width?: string
      disabled?: boolean
      formMode?: boolean
      defaultNodes?: FormNode[]
      single?: boolean
      singleNode?: FormNode
      formConfig?: FormConfig
    }>(),
    {
      width: '600px',
      fullscreen: true,
      formMode: true,
      disabled: false,
      defaultNodes: () => [],
      single: false
    }
  )

  const dialogVisible = ref(false)

  // 内部使用 FormNode 树
  const nodes = ref<FormNode[]>([])
  const curNode = ref<FormNode>()
  const showToolEdit = ref(false)
  const formConfig = ref<FormConfig>(defaultFormConfig())

  // 历史记录
  const { canUndo, canRedo, undo, redo } = useHistory(nodes)

  // 初始化
  if (props.defaultNodes && props.defaultNodes.length > 0) {
    nodes.value = props.defaultNodes
  }
  watch(
    () => props.modelValue,
    (val) => {
      if (val) nodes.value = val
    }
  )

  const handleClick = () => {
    dialogVisible.value = true
  }

  const clearComponent = () => {
    nodes.value = []
  }

  const handleCreateComponent = (val: FormNode) => {
    nodes.value.push(val)
  }

  const handleChoose = (node: FormNode) => {
    curNode.value = node
    showToolEdit.value = true
  }

  const handleCancel = () => {
    curNode.value = undefined
    showToolEdit.value = false
  }

  const getNodes = () => {
    return nodes.value
  }

  const setNodes = (newNodes: FormNode[]) => {
    nodes.value = newNodes
    curNode.value = undefined
  }

  const deleteActive = () => {
    if (!curNode.value) return
    removeNodeById(nodes.value, curNode.value.id)
    curNode.value = undefined
  }

  const handleSubmit = () => {
    dialogVisible.value = false
    emit('update:modelValue', nodes.value)
  }

  defineExpose({ getNodes, setNodes, deleteActive, canUndo, canRedo, undo, redo })
</script>

<style lang="scss" scoped>
  .form-edit-single {
    width: 100%;
  }

  .form-edit {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    gap: 8px;
    justify-content: space-between;
    height: 100%;
    overflow: hidden;
    font-size: 14px;
  }

  .model-form-item {
    width: 100%;
  }

  .select {
    .select-text {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--art-text-gray);
    }

    .select-placeholder {
      color: var(--el-text-color-placeholder);
    }

    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--el-component-custom-height);
    padding: 0 15px;
    cursor: pointer;
    border: 1px solid var(--art-border-dashed-color);
    border-radius: calc(var(--custom-radius) / 3 + 2px) !important;
    transition: border 0.3s;

    @media (width <= 500px) {
      width: 100% !important;
    }

    &.large {
      height: 40px;
    }

    &.small {
      height: 24px;
    }

    &:hover:not(.is-disabled).has-icon {
      .arrow-icon {
        display: none;
      }

      .clear-icon {
        display: block !important;
      }
    }

    &:hover {
      border-color: var(--art-text-gray-400);
    }

    .icon {
      display: flex;
      align-items: center;
      width: 20px;
      color: var(--art-gray-700);

      i {
        display: block;
        margin: 0 auto;
        font-size: 16px;
      }
    }

    .text {
      display: flex;
      display: inline-block;
      align-items: center;
      width: 50%;
      font-size: 14px;
      color: var(--art-gray-600);

      @include ellipsis();

      @media (width <= 500px) {
        display: none;
      }
    }

    .arrow {
      display: flex;
      align-items: center;
      height: calc(100% - 2px);

      i {
        font-size: 13px;
        color: var(--art-gray-600);
      }

      .clear-icon {
        display: none;
      }
    }

    &.is-disabled {
      cursor: not-allowed;
      background-color: var(--el-disabled-bg-color);
      border-color: var(--el-border-color-lighter);

      .icon,
      .text,
      .arrow {
        color: var(--el-text-color-placeholder);
      }

      &:hover {
        border-color: var(--el-border-color-lighter);
      }
    }
  }
</style>

