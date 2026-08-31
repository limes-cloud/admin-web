<template>
  <div class="form-box" ref="formBoxRef" @click="handleCancel">
    <div class="form">
      <el-form
        :model="formModel"
        :label-position="formConfig?.labelPosition || 'right'"
        :label-width="formConfig?.labelWidth || 'auto'"
        :size="formConfig?.size || 'default'"
        :disabled="formConfig?.disabled || false"
      >
        <!-- 递归渲染节点树 -->
        <VueDraggable
          v-model="nodes"
          :group="{ name: 'form-nodes', pull: true, put: true }"
          handle=".form-node__drag-handle"
          ghost-class="ghost"
          :animation="200"
          class="form-drag-zone"
          @add="handleAdd"
        >
          <template v-for="node in nodes" :key="node.id">
            <FormNodeRenderer
              :node="node"
              :active-id="activeId"
              :form-model="formModel"
              @select="handleSelect"
              @delete="handleDelete"
              @copy="handleCopy"
            />
          </template>
        </VueDraggable>
      </el-form>
      <!-- 空状态用绝对定位覆盖，pointer-events: none 不阻挡拖放 -->
      <div v-if="!nodes || nodes.length === 0" class="form-empty">
        <span>从左侧拖入或点击组件</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { VueDraggable } from 'vue-draggable-plus'
  import { FormNode, FormConfig } from '../lib/types'
  import { removeNodeById, findNodeById, cloneNode, findParentAndIndex } from '../lib/editor'
  import FormNodeRenderer from './FormNodeRenderer.vue'
  import { ref } from 'vue'

  export interface AnyObject {
    [key: string]: any
  }

  defineProps<{
    formConfig?: FormConfig
  }>()

  // 直接使用 defineModel 让 VueDraggable 可以直接修改数组
  const nodes = defineModel<FormNode[]>('list', { required: true })
  const emit = defineEmits(['choose', 'cancel'])

  const activeId = ref('')
  const formModel = ref<AnyObject>({})
  const formBoxRef = ref<HTMLElement>()

  const handleAdd = (evt: any) => {
    // 检查鼠标释放位置是否在设计区内
    const originalEvent = evt.originalEvent as MouseEvent | TouchEvent | undefined
    if (!originalEvent || !formBoxRef.value) return

    let clientX: number, clientY: number
    if ('touches' in originalEvent) {
      const touch = originalEvent.changedTouches?.[0]
      if (!touch) return
      clientX = touch.clientX
      clientY = touch.clientY
    } else {
      clientX = originalEvent.clientX
      clientY = originalEvent.clientY
    }

    const rect = formBoxRef.value.getBoundingClientRect()
    const inside =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom

    if (!inside && nodes.value) {
      // 鼠标释放不在设计区，撤销这次添加
      const newIndex = evt.newIndex as number
      if (typeof newIndex === 'number' && newIndex >= 0) {
        nodes.value.splice(newIndex, 1)
      }
    }
  }

  const handleCancel = () => {
    activeId.value = ''
    emit('cancel')
  }

  const handleSelect = (node: FormNode) => {
    activeId.value = node.id
    emit('choose', node)
  }

  const handleDelete = (id: string) => {
    if (!nodes.value) return
    removeNodeById(nodes.value, id)
    if (activeId.value === id) {
      activeId.value = ''
    }
  }

  const handleCopy = (id: string) => {
    if (!nodes.value) return
    const source = findNodeById(nodes.value, id)
    if (!source) return
    const copy = cloneNode(source)
    // 在源节点的同级位置（父容器内）插入副本
    const location = findParentAndIndex(nodes.value, id)
    if (location) {
      location.parent.splice(location.index + 1, 0, copy)
    } else {
      nodes.value.push(copy)
    }
  }
</script>

<style lang="scss" scoped>
  .form-box {
    position: relative;
    box-sizing: border-box;
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 20px 15px;
    background: #fff;
    border: 1px solid #f2f2fe;
    border-radius: 4px;

    .form {
      position: relative;
      width: 100%;
      height: 100%;
      overflow-y: auto;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .form-empty {
      position: absolute;
      top: 50%;
      left: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: #bbb;
      pointer-events: none;
      transform: translate(-50%, -50%);
    }
  }

  .form-drag-zone {
    min-height: 100%;
    padding-bottom: 80px;
  }

  :deep(.ghost) {
    opacity: 0.5;
    background: #f0f0ff;
  }
</style>
