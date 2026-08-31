<template>
  <el-form
    ref="formRef"
    :model="formData"
    :label-position="schema.config.labelPosition"
    :label-width="schema.config.labelWidth"
    :size="schema.config.size"
    :disabled="schema.config.disabled || readonly"
  >
    <RenderNodes
      :nodes="schema.nodes"
      :form-data="formData"
      :readonly="readonly"
      :schema="schema"
    />
  </el-form>
</template>

<script lang="ts" setup>
  import { ref, provide, reactive, watch } from 'vue'
  import { FormSchema, FormNode } from '../../lib/types'
  import { defaultFormConfig } from '../../lib/data'
  import RenderNodes from './RenderNodes.vue'
  import type { FormInstance } from 'element-plus'

  const props = withDefaults(
    defineProps<{
      schema: FormSchema
      modelValue?: Record<string, any>
      readonly?: boolean
    }>(),
    { readonly: false }
  )

  const emit = defineEmits(['update:modelValue'])

  const formRef = ref<FormInstance>()
  const formData = reactive<Record<string, any>>({})

  // 初始化表单数据
  const initFormData = (nodes: FormNode[]) => {
    for (const node of nodes) {
      if (node.type === 'group' && node.field) {
        // group 节点初始化为空数组，不递归 children
        if (formData[node.field] === undefined) {
          formData[node.field] = []
        }
      } else {
        if (node.field) {
          if (formData[node.field] === undefined) {
            formData[node.field] = node.config.value !== undefined ? node.config.value : getDefaultValue(node.type)
          }
        }
        if (node.children) {
          initFormData(node.children)
        }
      }
    }
  }

  // 根据组件类型返回合适的空默认值
  const getDefaultValue = (type: string): any => {
    switch (type) {
      case 'checkbox':
      case 'cascader':
        return []
      case 'number':
      case 'slider':
      case 'rate':
        return 0
      case 'switch':
        return false
      default:
        return ''
    }
  }

  watch(
    () => props.schema.nodes,
    (nodes) => {
      initFormData(nodes)
    },
    { immediate: true }
  )

  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        Object.assign(formData, val)
      }
    },
    { immediate: true }
  )

  watch(
    formData,
    (val) => {
      emit('update:modelValue', { ...val })
    },
    { deep: true }
  )

  // 提供给子组件
  provide('formData', formData)
  provide('readonly', props.readonly)

  // 暴露方法
  const validate = async () => {
    return formRef.value?.validate()
  }

  const resetFields = () => {
    formRef.value?.resetFields()
  }

  const getValue = (field: string) => formData[field]
  const setValue = (field: string, value: any) => { formData[field] = value }
  const getFormData = () => ({ ...formData })
  const setFormData = (data: Record<string, any>) => { Object.assign(formData, data) }
  const validateField = (field: string) => formRef.value?.validateField(field)
  const clearValidate = (fields?: string[]) => formRef.value?.clearValidate(fields)
  const scrollToField = (field: string) => formRef.value?.scrollToField(field)

  // 子表单操作
  const getGroupData = (field: string) => formData[field]
  const addGroupItem = (field: string, data?: Record<string, any>) => {
    if (Array.isArray(formData[field])) {
      formData[field].push(data || {})
    }
  }
  const removeGroupItem = (field: string, index: number) => {
    if (Array.isArray(formData[field])) {
      formData[field].splice(index, 1)
    }
  }

  defineExpose({
    validate, resetFields, formData,
    getValue, setValue, getFormData, setFormData,
    validateField, clearValidate, scrollToField,
    getGroupData, addGroupItem, removeGroupItem
  })
</script>
