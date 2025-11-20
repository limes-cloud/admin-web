<template>
  <div class="form-edit" v-if="!formMode">
    <Components @create="handleCreateComponent" />
    <Form :list="components" @choose="handleChoose"></Form>
    <Tool :component="curComponent" :show-edit="showToolEdit" />
  </div>

  <div v-else class="model-form-item">
    <div class="select" @click="handleClick" :class="[{ 'is-disabled': disabled }]">
      <div class="select-text" v-if="components.length > 0">
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
      <Form :list="components" @choose="handleChoose"></Form>
      <Tool :component="curComponent" :show-edit="showToolEdit" />
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
  import { ref } from 'vue'
  import Components from './components/components.vue'
  import Form from './components/form.vue'
  import Tool from './components/tool.vue'
  import { Component } from './lib/types'
  import { Operation } from '@element-plus/icons-vue'

  const emit = defineEmits(['update:modelValue'])
  const props = withDefaults(
    defineProps<{
      modelValue: Component[] | undefined
      placeholder?: string
      fullscreen?: boolean
      width?: string
      disabled?: boolean
      formMode?: boolean
      defaultComponents?: Component[]
    }>(),
    {
      width: '600px',
      fullscreen: true,
      formMode: true,
      disabled: false,
      defaultComponents: () => []
    }
  )

  const dialogVisible = ref(false)

  const components = ref<Component[]>([])
  const curComponent = ref<Component>()
  const showToolEdit = ref(false)

  if (props.defaultComponents) {
    components.value = [...props.defaultComponents]
  }
  watch(
    () => props.modelValue,
    (val) => {
      if (val) components.value = [...val]
    }
  )

  const handleClick = () => {
    dialogVisible.value = true
  }

  const clearComponent = () => {
    components.value = []
  }

  const handleCreateComponent = (val: Component) => {
    components.value.push(val)
  }

  const handleChoose = (com: Component) => {
    curComponent.value = com
    showToolEdit.value = true
  }

  const getComponents = () => {
    return components.value
  }

  const handleSubmit = () => {
    dialogVisible.value = false
    emit('update:modelValue', components.value)
  }

  defineExpose({ getComponents })
</script>

<style lang="scss" scoped>
  .form-edit {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    gap: 1;
    justify-content: space-between;
    height: calc(100% - 60px);
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
