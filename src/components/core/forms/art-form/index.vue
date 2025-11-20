<!-- 表单组件 -->
<!-- 支持常用表单组件、自定义组件、插槽、校验、隐藏表单项 -->
<!-- 写法同 ElementPlus 官方文档组件，把属性写在 props 里面就可以了 -->
<template>
  <div class="art-form">
    <div class="art-form-body">
      <ElForm
        ref="formRef"
        :model="modelValue"
        :label-position="labelPosition"
        :label-width="labelWidth"
        v-bind="{ ...$attrs }"
      >
        <ElRow class="form-row" :gutter="gutter">
          <ElCol
            v-for="item in visibleFormItems"
            :key="item.key"
            :xs="getColSpan(item.span, 'xs')"
            :sm="getColSpan(item.span, 'sm')"
            :md="getColSpan(item.span, 'md')"
            :lg="getColSpan(item.span, 'lg')"
            :xl="getColSpan(item.span, 'xl')"
          >
            <el-divider v-if="item.divider" content-position="left">{{ item.divider }}</el-divider>
            <ElFormItem
              :prop="item.key"
              :label-width="item.label ? item.labelWidth || labelWidth : undefined"
              :rules="item.props?.rules"
            >
              <template #label>
                <div class="label">
                  <span>{{ item.label }}</span>
                  <el-tooltip effect="dark" :content="item.tip" placement="top">
                    <span class="icon" v-if="item.tip">
                      <ArtIcon value="iconsys-fankui" :size="16"></ArtIcon>
                    </span>
                  </el-tooltip>
                </div>
              </template>

              <slot :name="item.key" :item="item" :modelValue="modelValue">
                <component
                  :is="getComponent(item)"
                  v-model="getNestedValue(modelValue, item.key).value"
                  v-bind="getProps(item)"
                  :props="getProps(item).props"
                >
                  <!-- 下拉选择 -->
                  <template v-if="item.type === 'select' && getProps(item)?.options">
                    <ElOption
                      v-for="option in getProps(item).options"
                      :key="option[item.props?.props?.value || 'value']"
                      :label="option[item.props?.props?.label || 'label']"
                      :value="option[item.props?.props?.value || 'value']"
                    >
                    </ElOption>
                  </template>

                  <!-- 复选框组 -->
                  <template v-if="item.type === 'checkboxgroup' && getProps(item)?.options">
                    <ElCheckbox v-for="option in getProps(item).options" v-bind="option" :key="option.value" />
                  </template>

                  <!-- 单选框组 -->
                  <template v-if="item.type === 'radiogroup' && getProps(item)?.options">
                    <ElRadio v-for="option in getProps(item).options" v-bind="option" :key="option.value" />
                  </template>

                  <!-- 动态插槽支持 -->
                  <template v-for="(slotFn, slotName) in getSlots(item)" :key="slotName" #[slotName]>
                    <component :is="slotFn" />
                  </template>
                </component>
              </slot>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>
    <div class="art-form-footer">
      <ElButton v-if="showCancel" class="cancel-button" @click="handleCancel" v-ripple> 取消 </ElButton>
      <ElButton
        v-if="showSubmit"
        type="primary"
        class="submit-button"
        @click="handleSubmit"
        v-ripple
        :disabled="disabledSubmit"
      >
        确定
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Component } from 'vue'
  import { computed } from 'vue'
  import {
    ElCascader,
    ElCheckbox,
    ElCheckboxGroup,
    ElDatePicker,
    ElInput,
    ElInputTag,
    ElInputNumber,
    ElRadioGroup,
    ElRate,
    ElSelect,
    ElSlider,
    ElSwitch,
    ElTimePicker,
    ElTimeSelect,
    ElTreeSelect,
    type FormInstance
  } from 'element-plus'
  import { calculateResponsiveSpan, type ResponsiveBreakpoint } from '@/utils/form/responsive'

  defineOptions({ name: 'ArtForm' })

  import ArtUpload from '@/components/core/forms/art-upload/index.vue'
  import ArtIconSelector from '@/components/core/base/art-icon-selector/index.vue'
  import SQLConditionBuilder from '@/components/core/base/art-sql-builder/index.vue'
  import CodeEdit from '@/components/core/base/art-code-editor/index.vue'
  import ArtTinymce from '@/components/core/base/art-tinymce/index.vue'
  import ArtFormEditor from '@/components/core/base/art-form-editor/index.vue'

  const componentMap = {
    input: ElInput, // 输入框
    inputtag: ElInputTag, // 标签输入框
    number: ElInputNumber, // 数字输入框
    select: ElSelect, // 选择器
    switch: ElSwitch, // 开关
    checkbox: ElCheckbox, // 复选框
    checkboxgroup: ElCheckboxGroup, // 复选框组
    radiogroup: ElRadioGroup, // 单选框组
    date: ElDatePicker, // 日期选择器
    daterange: ElDatePicker, // 日期范围选择器
    datetime: ElDatePicker, // 日期时间选择器
    datetimerange: ElDatePicker, // 日期时间范围选择器
    rate: ElRate, // 评分
    slider: ElSlider, // 滑块
    cascader: ElCascader, // 级联选择器
    timepicker: ElTimePicker, // 时间选择器
    timeselect: ElTimeSelect, // 时间选择
    treeselect: ElTreeSelect, // 树选择器
    icon: ArtIconSelector, // 图标选择
    upload: ArtUpload, // 上传
    sqlbuilder: SQLConditionBuilder, // SQL 条件构建器
    code: CodeEdit, // 代码编辑器
    rich: ArtTinymce, // 富文本编辑器
    form: ArtFormEditor // 表单编辑器
  }

  const formInstance = useTemplateRef<FormInstance>('formRef')

  // 表单项配置
  export interface FormItem {
    /** 表单项的唯一标识 */
    key: string
    /** 表单项的提示信息 */
    tip?: string
    /** 表单项的标签文本 */
    label: string
    /** 表单项标签的宽度，会覆盖 Form 的 labelWidth */
    labelWidth?: string | number
    /** 表单项类型，支持预定义的组件类型 */
    type?: keyof typeof componentMap | string
    /** 自定义渲染函数或组件，用于渲染自定义组件（优先级高于 type） */
    render?: (() => VNode) | Component
    /** 是否隐藏该表单项 */
    hidden?: boolean
    /** 表单项占据的列宽，基于24格栅格系统 */
    span?: number
    /** 选项数据，用于 select、checkbox-group、radio-group 等 */
    options?: Record<string, any>
    /** 传递给表单项组件的属性 */
    props?: Record<string, any>
    /** 表单项的插槽配置 */
    slots?: Record<string, (() => any) | undefined>
    /** 表单项的占位符文本 */
    placeholder?: string
    /** 分割线文本 */
    divider?: string
    /** 默认值 */
    defaultValue?: any
    /** 输出格式化 */
    // outformat?: (value: any) => any
    // /** 更多属性配置请参考 ElementPlus 官方文档 */
  }

  // 表单配置
  interface FormProps {
    /** 表单数据 */
    items: FormItem[]
    /** 每列的宽度（基于 24 格布局） */
    span?: number
    /** 表单控件间隙 */
    gutter?: number
    /** 表单域标签的位置 */
    labelPosition?: 'left' | 'right' | 'top'
    /** 文字宽度 */
    labelWidth?: string | number
    /** 按钮靠左对齐限制（表单项小于等于该值时） */
    buttonLeftLimit?: number
    /** 是否显示重置按钮 */
    showCancel?: boolean
    /** 是否显示提交按钮 */
    showSubmit?: boolean
    /** 是否禁用提交按钮 */
    disabledSubmit?: boolean
  }

  const props = withDefaults(defineProps<FormProps>(), {
    items: () => [],
    span: 6,
    gutter: 12,
    labelPosition: 'right',
    labelWidth: 'auto',
    buttonLeftLimit: 2,
    showCancel: true,
    showSubmit: true,
    disabledSubmit: false
  })

  interface FormEmits {
    cancel: []
    submit: []
  }

  const emit = defineEmits<FormEmits>()

  const modelValue = defineModel<Record<string, any>>({ default: {} })

  const rootProps = ['label', 'labelWidth', 'key', 'type', 'hidden', 'span', 'slots']

  const getProps = (item: FormItem) => {
    if (item.props) return item.props
    const props = { ...item }
    rootProps.forEach((key) => delete (props as Record<string, any>)[key])
    return props
  }

  // 获取嵌套对象值（支持多层路径和默认值）
  const getNestedValue = (obj: Record<string, any>, path: string) => {
    const keys = path.split('.')
    let current = obj
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    const lastKey = keys[keys.length - 1]
    return {
      get value() {
        return current[lastKey]
      },
      set value(newVal) {
        current[lastKey] = newVal
      }
    }
  }

  const getSlots = (item: FormItem) => {
    if (!item.slots) return {}
    const validSlots: Record<string, () => any> = {}
    Object.entries(item.slots).forEach(([key, slotFn]) => {
      if (slotFn) {
        validSlots[key] = slotFn
      }
    })
    return validSlots
  }

  // 组件
  const getComponent = (item: FormItem) => {
    // 优先使用 render 函数或组件渲染自定义组件
    if (item.render) {
      return item.render
    }
    // 使用 type 获取预定义组件
    const { type } = item
    return componentMap[type as keyof typeof componentMap] || componentMap['input']
  }

  /**
   * 获取列宽 span 值
   * 根据屏幕尺寸智能降级，避免小屏幕上表单项被压缩过小
   */
  const getColSpan = (itemSpan: number | undefined, breakpoint: ResponsiveBreakpoint): number => {
    return calculateResponsiveSpan(itemSpan, span.value, breakpoint)
  }

  /**
   * 可见的表单项
   */
  const visibleFormItems = computed(() => {
    return props.items.filter((item) => !item.hidden)
  })

  /**
   * 处理提交事件
   */
  const handleSubmit = async () => {
    const res = await formInstance.value?.validate()
    if (!res) {
      return
    }
    emit('submit')
  }

  const handleCancel = () => {
    emit('cancel')
  }

  defineExpose({
    ref: formInstance,
    validate: (...args: any[]) => formInstance.value?.validate(...args),
    cancel: handleCancel
  })

  // 设置默认值
  watch(
    () => props.items,
    (items) => {
      items.forEach((item) => {
        if (item.defaultValue !== undefined) {
          const { value } = getNestedValue(modelValue.value, item.key)
          if (value === undefined || value === null) {
            getNestedValue(modelValue.value, item.key).value = item.defaultValue
          }
        }
      })
    },
    { immediate: true }
  )

  // 解构 props 以便在模板中直接使用
  const { span, gutter, labelPosition, labelWidth } = toRefs(props)
</script>

<style lang="scss" scoped>
  .art-form {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .art-form-footer {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    padding: 10px 0 0;
  }

  .art-form-body {
    &::-webkit-scrollbar {
      display: none;
    }

    flex: 1;
    overflow: hidden scroll;

    .label {
      display: flex;

      .icon {
        margin-left: 4px;
        color: var(--el-text-color-secondary) !important;
      }
    }

    .form-row {
      display: flex;
      flex-wrap: wrap;
    }

    .action-column {
      flex: 1;
      max-width: 100%;

      .action-buttons-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end !important;
        margin-bottom: 12px;
      }

      .form-buttons {
        display: flex;
        gap: 8px;
      }

      .filter-toggle {
        display: flex;
        align-items: center;
        margin-left: 10px;
        line-height: 32px;
        color: var(--main-color);
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover {
          color: var(--ElColor-primary);
        }

        span {
          font-size: 14px;
          user-select: none;
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          margin-left: 4px;
          font-size: 14px;
          transition: transform 0.2s ease;
        }
      }
    }
  }

  // 响应式优化
  @media (width <= 768px) {
    .art-form {
      /* padding: 16px 16px 0; */

      .action-column {
        .action-buttons-wrapper {
          flex-direction: column;
          gap: 8px;
          align-items: stretch;

          .form-buttons {
            justify-content: center;
          }

          .filter-toggle {
            justify-content: center;
            margin-left: 0;
          }
        }
      }
    }
  }
</style>
