<template>
  <div
    class="form-node"
    :class="{
      'form-node--active': activeId === node.id,
      'form-node--container': isContainer,
      'form-node--hidden': node.config.hidden
    }"
    @click.stop="emit('select', node)"
  >
    <!-- 拖拽手柄（始终显示） -->
    <div class="form-node__drag-handle">
      <el-icon><Rank /></el-icon>
    </div>
    <!-- 组件类型标签 -->
    <div class="form-node__type-tag">{{ typeName }}</div>

    <!-- 字段组件 -->
    <template v-if="isField">
      <div class="form-node__field">
        <el-form-item
          class="form-row"
          :required="node.config.required"
          :label="node.label"
        >
          <!-- input -->
          <el-input
            v-if="node.type === 'input'"
            v-model="formModel[node.field!]"
            :placeholder="node.config.placeholder"
            disabled
          />
          <!-- textarea -->
          <el-input
            v-else-if="node.type === 'textarea'"
            v-model="formModel[node.field!]"
            :placeholder="node.config.placeholder"
            type="textarea"
            disabled
          />
          <!-- number -->
          <el-input-number
            v-else-if="node.type === 'number'"
            v-model="formModel[node.field!]"
            :placeholder="node.config.placeholder"
            :min="node.config.min"
            :max="node.config.max"
            :step="node.config.step"
            disabled
          />
          <!-- password -->
          <el-input
            v-else-if="node.type === 'password'"
            v-model="formModel[node.field!]"
            type="password"
            :placeholder="node.config.placeholder"
            disabled
          />
          <!-- radio -->
          <el-radio-group v-else-if="node.type === 'radio'" v-model="formModel[node.field!]" disabled>
            <el-radio v-for="opt in node.config.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
          <!-- checkbox -->
          <el-checkbox-group v-else-if="node.type === 'checkbox'" v-model="formModel[node.field!]" disabled>
            <el-checkbox v-for="opt in node.config.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </el-checkbox>
          </el-checkbox-group>
          <!-- select -->
          <el-select v-else-if="node.type === 'select'" v-model="formModel[node.field!]" :placeholder="node.config.placeholder" disabled>
            <el-option v-for="opt in node.config.options" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
          <!-- time -->
          <el-time-picker v-else-if="node.type === 'time'" :placeholder="node.config.placeholder" disabled />
          <!-- date -->
          <el-date-picker v-else-if="node.type === 'date'" :placeholder="node.config.placeholder" disabled />
          <!-- datetime -->
          <el-date-picker v-else-if="node.type === 'datetime'" type="datetime" :placeholder="node.config.placeholder" disabled />
          <!-- upload -->
          <el-upload v-else-if="node.type === 'upload'" :disabled="true" action="">
            <el-button size="small" type="primary" disabled>点击上传</el-button>
          </el-upload>
          <!-- switch -->
          <el-switch v-else-if="node.type === 'switch'" :model-value="false" disabled />
          <!-- slider -->
          <el-slider v-else-if="node.type === 'slider'" :model-value="node.config.value ?? 0" :min="node.config.min ?? 0" :max="node.config.max ?? 100" disabled />
          <!-- rate -->
          <el-rate v-else-if="node.type === 'rate'" :model-value="node.config.value ?? 0" :max="node.config.max ?? 5" disabled />
          <!-- cascader -->
          <el-cascader v-else-if="node.type === 'cascader'" :placeholder="node.config.placeholder" :options="(node.config.options as any)" disabled clearable />
          <!-- fallback -->
          <el-input v-else v-model="formModel[node.field!]" :placeholder="node.config.placeholder" disabled />
        </el-form-item>
      </div>
      <!-- 隐藏标记 -->
      <div v-if="node.config.hidden" class="form-node__badge">隐藏</div>
      <!-- 删除按钮 - 绝对定位右下 -->
      <div class="form-node__actions">
        <el-button type="primary" size="small" :icon="CopyDocument" @click.stop="emit('copy', node.id)" />
        <el-popconfirm title="确认删除此组件？" @confirm="emit('delete', node.id)">
          <template #reference>
            <el-button type="danger" size="small" :icon="Delete" @click.stop />
          </template>
        </el-popconfirm>
      </div>
    </template>

    <!-- 容器组件 -->
    <template v-else-if="isContainer">
      <div class="form-node__container">
        <div class="form-node__container-header">
          <span class="form-node__container-title">{{ node.label || node.type }}</span>
        </div>

        <!-- row 容器 -->
        <template v-if="node.type === 'row'">
          <el-row :gutter="node.config.gutter || 20">
            <el-col v-for="col in node.children" :key="col.id" :span="col.config.span || 12">
              <div class="form-node__drop-zone" @click.stop="emit('select', col)">
                <VueDraggable
                  v-model="col.children!"
                  group="form-nodes"
                  handle=".form-node__drag-handle"
                  ghost-class="ghost"
                  :animation="200"
                  class="form-node__sortable-area"
                >
                  <template v-for="child in col.children" :key="child.id">
                    <FormNodeRenderer
                      :node="child"
                      :active-id="activeId"
                      :form-model="formModel"
                      @select="emit('select', $event)"
                      @delete="emit('delete', $event)"
                      @copy="emit('copy', $event)"
                    />
                  </template>
                </VueDraggable>
                <div v-if="!col.children?.length" class="form-node__placeholder">
                  拖入组件（span={{ col.config.span || 12 }}）
                </div>
              </div>
            </el-col>
          </el-row>
        </template>

        <!-- card 容器 -->
        <template v-else-if="node.type === 'card'">
          <el-card :shadow="node.props?.shadow || 'hover'" class="form-node__card">
            <template #header>
              <span>{{ node.label }}</span>
            </template>
            <div class="form-node__drop-zone">
              <VueDraggable
                v-model="node.children!"
                group="form-nodes"
                handle=".form-node__drag-handle"
                ghost-class="ghost"
                :animation="200"
                class="form-node__sortable-area"
              >
                <template v-for="child in node.children" :key="child.id">
                  <FormNodeRenderer
                    :node="child"
                    :active-id="activeId"
                    :form-model="formModel"
                    @select="emit('select', $event)"
                    @delete="emit('delete', $event)"
                    @copy="emit('copy', $event)"
                  />
                </template>
              </VueDraggable>
              <div v-if="!node.children?.length" class="form-node__placeholder">
                拖入组件
              </div>
            </div>
          </el-card>
        </template>

        <!-- tabs 容器 -->
        <template v-else-if="node.type === 'tabs'">
          <el-tabs :type="node.props?.type || 'card'">
            <el-tab-pane v-for="pane in node.children" :key="pane.id" :label="pane.label">
              <div class="form-node__drop-zone">
                <VueDraggable
                  v-model="pane.children!"
                  group="form-nodes"
                  handle=".form-node__drag-handle"
                  ghost-class="ghost"
                  :animation="200"
                  class="form-node__sortable-area"
                >
                  <template v-for="child in pane.children" :key="child.id">
                    <FormNodeRenderer
                      :node="child"
                      :active-id="activeId"
                      :form-model="formModel"
                      @select="emit('select', $event)"
                      @delete="emit('delete', $event)"
                      @copy="emit('copy', $event)"
                    />
                  </template>
                </VueDraggable>
                <div v-if="!pane.children?.length" class="form-node__placeholder">
                  拖入组件
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>

        <!-- collapse 容器 -->
        <template v-else-if="node.type === 'collapse'">
          <el-collapse :accordion="node.props?.accordion">
            <el-collapse-item v-for="item in node.children" :key="item.id" :title="item.label" :name="item.id">
              <div class="form-node__drop-zone">
                <VueDraggable
                  v-model="item.children!"
                  group="form-nodes"
                  handle=".form-node__drag-handle"
                  ghost-class="ghost"
                  :animation="200"
                  class="form-node__sortable-area"
                >
                  <template v-for="child in item.children" :key="child.id">
                    <FormNodeRenderer
                      :node="child"
                      :active-id="activeId"
                      :form-model="formModel"
                      @select="emit('select', $event)"
                      @delete="emit('delete', $event)"
                      @copy="emit('copy', $event)"
                    />
                  </template>
                </VueDraggable>
                <div v-if="!item.children?.length" class="form-node__placeholder">
                  拖入组件
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </template>

        <!-- inline 容器 -->
        <template v-else-if="node.type === 'inline'">
          <div class="form-node__inline" :style="{ gap: (node.config.gutter || 16) + 'px' }">
            <VueDraggable
              v-model="node.children!"
              group="form-nodes"
              handle=".form-node__drag-handle"
              ghost-class="ghost"
              :animation="200"
              class="form-node__inline-drag form-node__sortable-area"
            >
              <template v-for="child in node.children" :key="child.id">
                <FormNodeRenderer
                  :node="child"
                  :active-id="activeId"
                  :form-model="formModel"
                  @select="emit('select', $event)"
                  @delete="emit('delete', $event)"
                  @copy="emit('copy', $event)"
                />
              </template>
            </VueDraggable>
            <div v-if="!node.children?.length" class="form-node__placeholder">
              拖入组件（行内排列）
            </div>
          </div>
        </template>

        <!-- table 表格布局 -->
        <template v-else-if="node.type === 'table'">
          <div class="form-node__table">
            <div
              v-for="col in node.children"
              :key="col.id"
              class="form-node__table-col"
              :style="{ flex: col.config.span || 8 }"
              @click.stop="emit('select', col)"
            >
              <div class="form-node__table-col-header">{{ col.label }}</div>
              <div class="form-node__drop-zone">
                <VueDraggable
                  v-model="col.children!"
                  group="form-nodes"
                  handle=".form-node__drag-handle"
                  ghost-class="ghost"
                  :animation="200"
                  class="form-node__sortable-area"
                >
                  <template v-for="child in col.children" :key="child.id">
                    <FormNodeRenderer
                      :node="child"
                      :active-id="activeId"
                      :form-model="formModel"
                      @select="emit('select', $event)"
                      @delete="emit('delete', $event)"
                      @copy="emit('copy', $event)"
                    />
                  </template>
                </VueDraggable>
                <div v-if="!col.children?.length" class="form-node__placeholder">
                  拖入组件
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- box 盒子布局 -->
        <template v-else-if="node.type === 'box'">
          <div
            class="form-node__box"
            :style="{ gap: (node.config.gutter || 12) + 'px', flexDirection: node.config.direction === 'horizontal' ? 'row' : 'column' }"
          >
            <VueDraggable
              v-model="node.children!"
              group="form-nodes"
              handle=".form-node__drag-handle"
              ghost-class="ghost"
              :animation="200"
              class="form-node__sortable-area"
              :style="{ display: 'flex', flexDirection: node.config.direction === 'horizontal' ? 'row' : 'column', gap: (node.config.gutter || 12) + 'px' }"
            >
              <template v-for="child in node.children" :key="child.id">
                <FormNodeRenderer
                  :node="child"
                  :active-id="activeId"
                  :form-model="formModel"
                  @select="emit('select', $event)"
                  @delete="emit('delete', $event)"
                  @copy="emit('copy', $event)"
                />
              </template>
            </VueDraggable>
            <div v-if="!node.children?.length" class="form-node__placeholder">
              拖入组件
            </div>
          </div>
        </template>

        <!-- space 间距 -->
        <template v-else-if="node.type === 'space'">
          <div class="form-node__space" :style="{ height: (node.config.gutter || 20) + 'px' }">
            <span class="form-node__space-label">间距 {{ node.config.gutter || 20 }}px</span>
          </div>
        </template>

        <!-- descriptions 描述列表 -->
        <template v-else-if="node.type === 'descriptions'">
          <div class="form-node__descriptions" :style="{ gridTemplateColumns: `repeat(${node.props?.column || 2}, 1fr)` }">
            <div
              v-for="col in node.children"
              :key="col.id"
              class="form-node__descriptions-item"
              @click.stop="emit('select', col)"
            >
              <div class="form-node__descriptions-label">{{ col.label }}</div>
              <div class="form-node__drop-zone">
                <VueDraggable
                  v-model="col.children!"
                  group="form-nodes"
                  handle=".form-node__drag-handle"
                  ghost-class="ghost"
                  :animation="200"
                  class="form-node__sortable-area"
                >
                  <template v-for="child in col.children" :key="child.id">
                    <FormNodeRenderer
                      :node="child"
                      :active-id="activeId"
                      :form-model="formModel"
                      @select="emit('select', $event)"
                      @delete="emit('delete', $event)"
                      @copy="emit('copy', $event)"
                    />
                  </template>
                </VueDraggable>
                <div v-if="!col.children?.length" class="form-node__placeholder">
                  拖入组件
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- group 子表单 -->
        <template v-else-if="node.type === 'group'">
          <div class="form-node__group">
            <div class="form-node__drop-zone">
              <VueDraggable
                v-model="node.children!"
                :group="{ name: 'form-nodes', pull: true, put: groupPutCheck }"
                handle=".form-node__drag-handle"
                ghost-class="ghost"
                :animation="200"
                class="form-node__sortable-area"
              >
                <template v-for="child in node.children" :key="child.id">
                  <FormNodeRenderer
                    :node="child"
                    :active-id="activeId"
                    :form-model="formModel"
                    @select="emit('select', $event)"
                    @delete="emit('delete', $event)"
                    @copy="emit('copy', $event)"
                  />
                </template>
              </VueDraggable>
              <div v-if="!node.children?.length" class="form-node__placeholder">
                拖入模板字段（运行时将重复渲染）
              </div>
            </div>
          </div>
        </template>

        <!-- watermark 水印容器 -->
        <template v-else-if="node.type === 'watermark'">
          <div class="form-node__watermark">
            <div class="form-node__drop-zone">
              <VueDraggable
                v-model="node.children!"
                group="form-nodes"
                handle=".form-node__drag-handle"
                ghost-class="ghost"
                :animation="200"
                class="form-node__sortable-area"
              >
                <template v-for="child in node.children" :key="child.id">
                  <FormNodeRenderer
                    :node="child"
                    :active-id="activeId"
                    :form-model="formModel"
                    @select="emit('select', $event)"
                    @delete="emit('delete', $event)"
                    @copy="emit('copy', $event)"
                  />
                </template>
              </VueDraggable>
              <div v-if="!node.children?.length" class="form-node__placeholder">
                拖入组件（运行时此区域将显示水印）
              </div>
            </div>
          </div>
        </template>
      </div>
      <!-- 容器的复制/删除按钮（右下角） -->
      <div class="form-node__actions">
        <el-button type="primary" size="small" :icon="CopyDocument" @click.stop="emit('copy', node.id)" />
        <el-popconfirm title="确认删除此容器？" @confirm="emit('delete', node.id)">
          <template #reference>
            <el-button type="danger" size="small" :icon="Delete" @click.stop />
          </template>
        </el-popconfirm>
      </div>
    </template>

    <!-- 辅助组件 -->
    <template v-else>
      <div class="form-node__aide">
        <el-divider v-if="node.type === 'divider'" />
        <el-alert v-else-if="node.type === 'alert'" :title="node.label" :type="node.props?.type || 'info'" :closable="false" />
        <div v-else-if="node.type === 'text'" class="form-node__text">{{ node.config.description }}</div>
        <el-button
          v-else-if="node.type === 'button'"
          :type="node.config.buttonType || 'primary'"
          :size="node.config.buttonSize || 'default'"
          :plain="node.config.buttonPlain"
          :round="node.config.buttonRound"
        >{{ node.config.buttonText || '按钮' }}</el-button>
        <div v-else-if="node.type === 'html'" class="form-node__html" v-html="node.config.htmlContent" />
        <p v-else-if="node.type === 'paragraph'" class="form-node__paragraph" :style="{ textAlign: node.config.paragraphAlign || 'left' }">{{ node.config.paragraphContent }}</p>
        <el-tag
          v-else-if="node.type === 'tag'"
          :type="node.config.tagType || 'primary'"
          :effect="node.config.tagEffect || 'light'"
          :size="node.config.tagSize || 'default'"
          :round="node.config.tagRound"
        >{{ node.config.tagText || '标签' }}</el-tag>
        <el-link
          v-else-if="node.type === 'link'"
          :type="node.config.linkType || 'primary'"
          :underline="node.config.linkUnderline ?? true"
        >{{ node.config.linkText || '链接' }}</el-link>
        <span v-else-if="node.type === 'tooltip'" class="form-node__tooltip-trigger">
          <el-icon><ChatDotRound /></el-icon>
          {{ node.config.tooltipTriggerText || '悬停查看提示' }}
        </span>
      </div>
      <div v-if="activeId === node.id" class="form-node__actions">
        <el-button type="primary" size="small" :icon="CopyDocument" @click.stop="emit('copy', node.id)" />
        <el-popconfirm title="确认删除？" @confirm="emit('delete', node.id)">
          <template #reference>
            <el-button type="danger" size="small" :icon="Delete" @click.stop />
          </template>
        </el-popconfirm>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { VueDraggable } from 'vue-draggable-plus'
  import { FormNode, isFieldNode, isContainerNode } from '../lib/types'
  import { componentTypes } from '../lib/editor'
  import { Delete, Rank, CopyDocument, ChatDotRound } from '@element-plus/icons-vue'

  const props = defineProps<{
    node: FormNode
    activeId: string
    formModel: Record<string, any>
  }>()

  const emit = defineEmits<{
    select: [node: FormNode]
    delete: [id: string]
    copy: [id: string]
  }>()

  const isField = computed(() => isFieldNode(props.node))
  const isContainer = computed(() => isContainerNode(props.node))

  // group 不允许拖入另一个 group（防止无限嵌套）
  const groupPutCheck = (to: any, from: any, dragEl: any) => {
    // 尝试从 draggable context 中获取节点信息
    const dragNode = dragEl?.__draggable_context?.element
    if (dragNode?.type === 'group') return false
    // 检查 DOM 上的 type-tag 文本（兜底）
    const typeTag = dragEl?.querySelector?.('.form-node__type-tag')
    if (typeTag?.textContent?.trim() === '子表单') return false
    return true
  }

  // 组件类型中文名
  const typeName = computed(() => {
    const found = componentTypes.find((c) => c.value === props.node.type)
    return found?.name || props.node.type
  })
</script>

<style lang="scss" scoped>
  .form-node {
    position: relative;
    margin-bottom: 12px;
    cursor: default;
    border: 1px dashed #d9d9d9;
    border-radius: 2px;
    transition: all 0.2s;

    &:hover {
      border-color: #409eff;
      border-style: solid;
    }

    &--active {
      border-color: #409eff !important;
      border-style: solid !important;
    }

    &--hidden {
      opacity: 0.6;
    }

    &__drag-handle {
      position: absolute;
      top: -1px;
      left: -1px;
      z-index: 10;
      display: none;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      color: #fff;
      cursor: grab;
      background: #409eff;
      border-radius: 2px 0 2px 0;
      font-size: 14px;

      .form-node--active > &,
      .form-node:hover > & {
        display: flex;
      }

      &:active {
        cursor: grabbing;
      }
    }

    &__type-tag {
      position: absolute;
      top: -1px;
      left: 26px;
      z-index: 10;
      display: none;
      padding: 0 6px;
      font-size: 11px;
      line-height: 18px;
      color: #fff;
      background: #409eff;
      border-radius: 0 0 4px 0;
      white-space: nowrap;

      .form-node--active > &,
      .form-node:hover > & {
        display: block;
      }
    }

    &__field {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      pointer-events: none;

      .el-form-item {
        flex: 1;
        margin-bottom: 0 !important;
      }
    }

    &__badge {
      position: absolute;
      top: -8px;
      right: 40px;
      padding: 0 6px;
      font-size: 11px;
      color: #f56c6c;
      background: #fef0f0;
      border-radius: 2px;
    }

    &__actions {
      position: absolute;
      right: -1px;
      bottom: -19px;
      z-index: 10;
      display: none;
      gap: 0;
      align-items: center;

      .form-node--active > &,
      .form-node:hover > & {
        display: flex;
      }

      :deep(.el-button) {
        width: 18px !important;
        height: 18px !important;
        min-width: 18px;
        min-height: 18px;
        margin: 0 !important;
        padding: 2px !important;
        font-size: 11px;
        border-radius: 0 !important;
        border: none !important;

        &:first-child {
          border-radius: 0 0 0 3px !important;
        }

        &:last-child {
          border-radius: 0 0 3px 0 !important;
        }
      }
    }

    &__container {
      padding: 8px;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;

      &-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      &-title {
        font-size: 13px;
        font-weight: 600;
        color: #666;
      }
    }

    &__drop-zone {
      min-height: 80px;
      padding: 8px;
      border: 1px dashed #e0e0e0;
      border-radius: 4px;
      position: relative;
    }

    &__sortable-area {
      min-height: 60px;
    }

    &__placeholder {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #bbb;
      pointer-events: none;
    }

    &__card {
      :deep(.el-card__body) {
        padding: 12px;
      }
    }

    &__inline {
      display: flex;
      flex-wrap: wrap;
      min-height: 60px;
      padding: 4px;
      border: 1px dashed #e0e0e0;
      border-radius: 4px;
    }

    &__inline-drag {
      display: flex;
      flex-wrap: wrap;
      gap: inherit;
      width: 100%;
    }

    &__table {
      display: flex;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;

      .form-node__table-col {
        flex: 1;
        min-height: 80px;
        border-right: 1px solid #e0e0e0;

        &:last-child {
          border-right: none;
        }
      }

      .form-node__table-col-header {
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 600;
        color: #666;
        background: #fafafa;
        border-bottom: 1px solid #e0e0e0;
      }

      .form-node__drop-zone {
        border: none;
        border-radius: 0;
        min-height: 60px;
      }
    }

    &__box {
      display: flex;
      flex-direction: column;
      min-height: 60px;
      padding: 8px;
      border: 1px dashed #e0e0e0;
      border-radius: 4px;
      position: relative;
    }

    &__space {
      display: flex;
      align-items: center;
      justify-content: center;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 4px,
        #f0f0f0 4px,
        #f0f0f0 8px
      );
      border: 1px dashed #d9d9d9;
      border-radius: 4px;

      .form-node__space-label {
        padding: 0 8px;
        font-size: 11px;
        color: #999;
        background: #fff;
        border-radius: 2px;
      }
    }

    &__descriptions {
      display: grid;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;

      .form-node__descriptions-item {
        border-right: 1px solid #e0e0e0;
        border-bottom: 1px solid #e0e0e0;

        &:nth-child(2n) {
          border-right: none;
        }

        &:nth-last-child(-n+2) {
          border-bottom: none;
        }
      }

      .form-node__descriptions-label {
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 600;
        color: #666;
        background: #fafafa;
        border-bottom: 1px solid #e0e0e0;
      }

      .form-node__drop-zone {
        border: none;
        border-radius: 0;
        min-height: 50px;
      }
    }

    &__group {
      padding: 8px;

      .form-node__group-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 12px;
      }

      .form-node__group-field {
        color: #909399;
        font-family: monospace;
      }
    }

    &__aide {
      position: relative;
      padding: 4px 10px;
    }

    &__text {
      padding: 8px;
      font-size: 13px;
      color: #666;
    }

    &__html {
      padding: 8px;
      font-size: 13px;
    }

    &__paragraph {
      margin: 0;
      padding: 8px;
      font-size: 13px;
      color: #666;
      line-height: 1.6;
    }

    &__tooltip-trigger {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      font-size: 13px;
      color: var(--el-color-primary);
      border-bottom: 1px dashed var(--el-color-primary);
    }

    &__watermark {
      padding: 8px;
    }
  }

  :deep(.ghost) {
    opacity: 0.5;
    background: #f0f0ff;
  }
</style>
