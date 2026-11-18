<template>
  <div class="business-extra-editor">
    <!-- enum / array：枚举选项 -->
    <div v-if="isEnumOrArray" class="business-extra-editor__options">
      <div class="business-extra-editor__label">可选值（下拉/多选选项）</div>
      <div v-for="(opt, index) in data.options || []" :key="index" class="business-extra-editor__option-row">
        <ElInput v-model="opt.value" placeholder="值（如 on）" class="business-extra-editor__option-value" />
        <ElInput v-model="opt.label" placeholder="展示文案（可空）" class="business-extra-editor__option-label" />
        <ElButton :icon="Delete" text type="danger" @click="removeOption(index)" />
      </div>
      <ElButton :icon="Plus" text type="primary" @click="addOption">添加选项</ElButton>
    </div>

    <div class="business-extra-editor__form">
      <ElForm label-position="top" class="business-extra-editor__grid" :class="{ 'is-single': isSingleColumn }">
        <!-- int / float：数值范围与单位 -->
        <ElFormItem v-if="isNumber" label="最小值">
          <ElInputNumber v-model="data.min" :controls="false" placeholder="不限" style="width: 100%" />
        </ElFormItem>
        <ElFormItem v-if="isNumber" label="最大值">
          <ElInputNumber v-model="data.max" :controls="false" placeholder="不限" style="width: 100%" />
        </ElFormItem>
        <ElFormItem v-if="isNumber" label="单位">
          <ElInput v-model="data.unit" placeholder="如 MB、s" style="width: 100%" />
        </ElFormItem>
        <ElFormItem v-if="type === 'text'" label="显示行数">
          <ElInputNumber v-model="data.rows" :min="1" :max="20" :controls="false" style="width: 100%" />
        </ElFormItem>
        <ElFormItem v-if="type === 'string' || type === 'text'" label="最大长度">
          <ElInputNumber v-model="data.maxLength" :min="1" :controls="false" placeholder="不限制" style="width: 100%" />
        </ElFormItem>

        <ElFormItem label="占位提示">
          <ElInput v-model="data.placeholder" placeholder="输入框占位文案" style="width: 100%" />
        </ElFormItem>
        <ElFormItem label="默认值">
          <ElSelect v-if="type === 'bool'" v-model="data.default" allow-create filterable placeholder="未设置" style="width: 100%">
            <ElOption label="true" value="true" />
            <ElOption label="false" value="false" />
          </ElSelect>
          <ElInput v-else v-model="data.default" placeholder="未设置时展示（与值同格式）" style="width: 100%" />
        </ElFormItem>
      </ElForm>
    </div>

    <div class="business-extra-editor__hint">
      这些配置会应用到「系统配置」页面的控件展示；未填写项保持默认行为。
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Delete, Plus } from '@element-plus/icons-vue'
  import { BusinessExtra } from '@/api/configure/business/type'

  const props = defineProps<{ modelValue?: string; type?: string }>()
  const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

  const data = ref<BusinessExtra>({})

  const isEnumOrArray = computed(() => props.type === 'enum' || props.type === 'array')
  const isNumber = computed(() => props.type === 'int' || props.type === 'float')
  // enum/array 有 options 表格占满宽，其余字段单列
  const isSingleColumn = computed(() => isEnumOrArray.value)

  // 外部值变化时加载（打开弹窗、外部重置）；与当前编辑值一致则忽略（避免回写循环）
  watch(
    () => props.modelValue,
    (value) => {
      if (JSON.stringify(cleanExtra(data.value)) === (value || '')) return
      data.value = parseExtra(value)
    },
    { immediate: true }
  )

  // 切换变量类型时，清理不适配当前类型的专属字段（防止 enum→int 后 options 残留）
  watch(
    () => props.type,
    () => {
      const next = { ...data.value }
      if (!isEnumOrArray.value) delete next.options
      if (!isNumber.value) {
        delete next.min
        delete next.max
        delete next.unit
      }
      if (props.type !== 'text') delete next.rows
      if (props.type !== 'string' && props.type !== 'text') delete next.maxLength
      data.value = next
    }
  )

  // 内部编辑统一清理空值后序列化回父组件
  watch(
    data,
    () => {
      emit('update:modelValue', JSON.stringify(cleanExtra(data.value)))
    },
    { deep: true }
  )

  const parseExtra = (value?: string): BusinessExtra => {
    if (!value) return {}
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? {} : parsed
    } catch {
      return {}
    }
  }

  const cleanExtra = (extra: BusinessExtra): Record<string, any> => {
    const result: Record<string, any> = {}
    for (const key of ['options', 'min', 'max', 'unit', 'placeholder', 'default', 'required', 'rows', 'maxLength'] as const) {
      const value = extra[key]
      if (value === undefined || value === null || value === '' || value === false) continue
      if (key === 'options' && (!Array.isArray(value) || value.length === 0)) continue
      if ((key === 'min' || key === 'max' || key === 'rows' || key === 'maxLength') && typeof value === 'number' && isNaN(value)) continue
      result[key] = value
    }
    return result
  }

  const addOption = () => {
    if (!data.value.options) data.value.options = []
    data.value.options.push({ value: '', label: '' })
  }

  const removeOption = (index: number) => {
    data.value.options?.splice(index, 1)
  }
</script>

<style scoped lang="scss">
  .business-extra-editor {
    width: 100%;

    // 内容区撑满弹窗剩余宽度（ArtForm label 水平布局下默认未铺满）
    :deep(.el-form-item__content) {
      flex: 1;
    }

    &__options {
      margin-bottom: 8px;
    }

    &__label {
      margin-bottom: 6px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &__option-row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }

    &__option-value {
      width: 160px;
    }

    &__option-label {
      flex: 1;
    }

    &__form {
      width: 100%;
      margin-bottom: 4px;
    }

    &__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 16px;
      row-gap: 4px;

      &.is-single {
        grid-template-columns: 1fr;
      }
    }

    &__hint {
      margin-top: 8px;
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }

    // 统一输入控件内容左对齐（ElInputNumber 默认居中）
    :deep(.el-input-number .el-input__inner) {
      text-align: left;
    }

    // 去除 label 与输入框之间的间距（label-position=top 时更紧凑）
    :deep(.el-form-item__label) {
      margin-bottom: 0;
    }
  }
</style>