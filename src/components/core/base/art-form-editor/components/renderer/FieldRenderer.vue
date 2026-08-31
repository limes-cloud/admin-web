<template>
  <el-form-item
    :label="node.label"
    :required="!readonly && computedRequired"
    :prop="node.field"
    :rules="readonly ? [] : computedRules"
    :class="node.config.customClass"
    :style="node.config.customStyle"
  >
    <!-- 阅读模式 -->
    <template v-if="readonly">
      <span v-if="['input', 'textarea', 'password'].includes(node.type)" class="readonly-text">
        {{ node.type === 'password' ? '••••••' : displayValue }}
      </span>
      <span v-else-if="node.type === 'number'" class="readonly-text">{{ displayValue }}</span>
      <span v-else-if="['radio', 'select'].includes(node.type)" class="readonly-text">
        {{ getOptionLabel(formData[node.field!]) }}
      </span>
      <span v-else-if="node.type === 'checkbox'" class="readonly-text">
        {{ getCheckboxLabels(formData[node.field!]) }}
      </span>
      <span v-else-if="node.type === 'switch'" class="readonly-text">
        {{ formData[node.field!] ? '是' : '否' }}
      </span>
      <span v-else-if="node.type === 'slider'" class="readonly-text">{{ displayValue }}</span>
      <span v-else-if="node.type === 'rate'" class="readonly-text">
        <el-rate :model-value="formData[node.field!]" disabled :max="node.config.max ?? 5" />
      </span>
      <span v-else-if="node.type === 'cascader'" class="readonly-text">
        {{ Array.isArray(formData[node.field!]) ? formData[node.field!].join(' / ') : displayValue }}
      </span>
      <span v-else-if="['time', 'date', 'datetime', 'datepicker'].includes(node.type)" class="readonly-text">
        {{ displayValue }}
      </span>
      <span v-else-if="node.type === 'daterange'" class="readonly-text">
        {{ Array.isArray(formData[node.field!]) ? formData[node.field!].join(' ~ ') : displayValue }}
      </span>
      <span v-else-if="node.type === 'colorpicker'" class="readonly-text">
        <span
          v-if="formData[node.field!]"
          class="color-preview"
          :style="{ backgroundColor: formData[node.field!] }"
        ></span>
        {{ displayValue }}
      </span>
      <span v-else-if="node.type === 'treeselect'" class="readonly-text">
        {{ displayValue }}
      </span>
      <span v-else-if="node.type === 'upload'" class="readonly-text">
        {{ displayValue || '未上传' }}
      </span>
      <span v-else class="readonly-text">{{ displayValue }}</span>
    </template>

    <!-- 编辑模式 -->
    <template v-else>
      <el-input
        v-if="node.type === 'input'"
        v-model="formData[node.field!]"
        :placeholder="node.config.placeholder"
        :maxlength="node.config.maxLength"
        :disabled="computedDisabled"
        clearable
      >
        <template v-if="node.config.prefix" #prepend>{{ node.config.prefix }}</template>
        <template v-if="node.config.suffix" #append>{{ node.config.suffix }}</template>
      </el-input>
      <el-input
        v-else-if="node.type === 'textarea'"
        v-model="formData[node.field!]"
        type="textarea"
        :placeholder="node.config.placeholder"
        :maxlength="node.config.maxLength"
        :disabled="computedDisabled"
      />
      <el-input-number
        v-else-if="node.type === 'number'"
        v-model="formData[node.field!]"
        :min="node.config.min"
        :max="node.config.max"
        :step="node.config.step"
        :disabled="computedDisabled"
      />
      <el-input
        v-else-if="node.type === 'password'"
        v-model="formData[node.field!]"
        type="password"
        show-password
        :placeholder="node.config.placeholder"
        :maxlength="node.config.maxLength"
        :disabled="computedDisabled"
        clearable
      >
        <template v-if="node.config.prefix" #prepend>{{ node.config.prefix }}</template>
        <template v-if="node.config.suffix" #append>{{ node.config.suffix }}</template>
      </el-input>
      <el-radio-group
        v-else-if="node.type === 'radio'"
        v-model="formData[node.field!]"
        :disabled="computedDisabled"
      >
        <el-radio v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</el-radio>
      </el-radio-group>
      <el-checkbox-group
        v-else-if="node.type === 'checkbox'"
        v-model="formData[node.field!]"
        :disabled="computedDisabled"
      >
        <el-checkbox v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</el-checkbox>
      </el-checkbox-group>
      <el-select
        v-else-if="node.type === 'select'"
        v-model="formData[node.field!]"
        :placeholder="node.config.placeholder"
        :disabled="computedDisabled"
        clearable
      >
        <el-option v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
      <el-time-picker
        v-else-if="node.type === 'time'"
        v-model="formData[node.field!]"
        :placeholder="node.config.placeholder"
        :disabled="computedDisabled"
      />
      <el-date-picker
        v-else-if="node.type === 'date'"
        v-model="formData[node.field!]"
        :placeholder="node.config.placeholder"
        :disabled="computedDisabled"
      />
      <el-date-picker
        v-else-if="node.type === 'datetime'"
        v-model="formData[node.field!]"
        type="datetime"
        :placeholder="node.config.placeholder"
        :disabled="computedDisabled"
      />
      <el-upload
        v-else-if="node.type === 'upload'"
        :disabled="computedDisabled"
        :limit="node.config.limit"
        action=""
      >
        <el-button size="small" type="primary" :disabled="computedDisabled">点击上传</el-button>
      </el-upload>
      <el-switch
        v-else-if="node.type === 'switch'"
        v-model="formData[node.field!]"
        :disabled="computedDisabled"
      />
      <el-slider
        v-else-if="node.type === 'slider'"
        v-model="formData[node.field!]"
        :min="node.config.min ?? 0"
        :max="node.config.max ?? 100"
        :step="node.config.step ?? 1"
        :disabled="computedDisabled"
      />
      <el-rate
        v-else-if="node.type === 'rate'"
        v-model="formData[node.field!]"
        :max="node.config.max ?? 5"
        :disabled="computedDisabled"
      />
      <el-cascader
        v-else-if="node.type === 'cascader'"
        v-model="formData[node.field!]"
        :options="(options as any)"
        :placeholder="node.config.placeholder"
        :disabled="computedDisabled"
        clearable
      />
      <!-- 日期/时间选择器（合并） -->
      <el-time-picker
        v-else-if="node.type === 'datepicker' && node.config.dateType === 'time'"
        v-model="formData[node.field!]"
        :placeholder="node.config.placeholder"
        :disabled="computedDisabled"
      />
      <el-date-picker
        v-else-if="node.type === 'datepicker'"
        v-model="formData[node.field!]"
        :type="(node.config.dateType || 'date') as any"
        :placeholder="node.config.placeholder"
        :disabled="computedDisabled"
      />
      <!-- 范围选择 -->
      <el-time-picker
        v-else-if="node.type === 'daterange' && node.config.rangeType === 'timerange'"
        v-model="formData[node.field!]"
        is-range
        :range-separator="node.config.rangeSeparator || '至'"
        :start-placeholder="node.config.startPlaceholder || '开始时间'"
        :end-placeholder="node.config.endPlaceholder || '结束时间'"
        :disabled="computedDisabled"
      />
      <el-date-picker
        v-else-if="node.type === 'daterange'"
        v-model="formData[node.field!]"
        :type="(node.config.rangeType || 'daterange') as any"
        :range-separator="node.config.rangeSeparator || '至'"
        :start-placeholder="node.config.startPlaceholder || '开始日期'"
        :end-placeholder="node.config.endPlaceholder || '结束日期'"
        :disabled="computedDisabled"
      />
      <!-- 颜色选择器 -->
      <el-color-picker
        v-else-if="node.type === 'colorpicker'"
        v-model="formData[node.field!]"
        :show-alpha="node.config.showAlpha"
        :color-format="node.config.colorFormat"
        :predefine="node.config.predefine"
        :disabled="computedDisabled"
      />
      <!-- 树选择 -->
      <el-tree-select
        v-else-if="node.type === 'treeselect'"
        v-model="formData[node.field!]"
        :data="node.config.optionSource === 'remote' ? options : node.config.treeData"
        :multiple="node.config.treeMultiple"
        :check-strictly="node.config.treeCheckStrictly"
        :show-checkbox="node.config.treeShowCheckbox"
        :filterable="node.config.treeFilterable"
        :placeholder="node.config.placeholder"
        :disabled="computedDisabled"
        clearable
      />
      <el-input
        v-else
        v-model="formData[node.field!]"
        :placeholder="node.config.placeholder"
        :disabled="computedDisabled"
        clearable
      />
    </template>

    <!-- 描述 -->
    <div v-if="node.config.description && !readonly" class="field-description">
      {{ node.config.description }}
    </div>
  </el-form-item>
</template>

<!-- SCRIPT_PLACEHOLDER -->
<script lang="ts" setup>
  import { computed, ref, watch, onMounted } from 'vue'
  import { FormNode, FormSchema, OptionItem, RemoteConfig } from '../../lib/types'
  import { evaluateRelations } from '../../lib/relation'
  import { evaluateExpression, extractDependencies } from '../../lib/computed'

  const props = defineProps<{
    node: FormNode
    formData: Record<string, any>
    readonly: boolean
    schema: FormSchema
  }>()

  // 选项（支持远程加载）
  const options = ref<OptionItem[]>(props.node.config.options || [])
  const remoteLoading = ref(false)

  // 防抖工具
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const debounce = (fn: () => void, delay: number) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(fn, delay)
  }

  // URL 模板替换：{{field}} → formData[field]
  const resolveTemplate = (tpl: string): string => {
    return tpl.replace(/\{\{(\w+)\}\}/g, (_, field) => {
      const val = props.formData[field]
      return val !== undefined && val !== null ? String(val) : ''
    })
  }

  const loadRemoteOptions = async (config: RemoteConfig) => {
    try {
      remoteLoading.value = true
      // 通过后端代理接口请求远程数据，避免跨域和凭证暴露
      const proxyUrl = '/manager/api/form/remote-options'
      const body: Record<string, any> = {
        url: resolveTemplate(config.url),
        method: config.method || 'GET',
        dataPath: config.dataPath || '',
        labelField: config.labelField || 'label',
        valueField: config.valueField || 'value',
        headers: config.headers || {},
        params: config.params ? resolveTemplate(config.params) : ''
      }
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      const items = json.items || json.data?.items || []
      if (!Array.isArray(items)) return
      options.value = items.map((item: any) => ({
        label: item.label,
        value: item.value
      }))
    } catch (e) {
      console.warn('[FormRenderer] 远程选项加载失败:', e)
    } finally {
      remoteLoading.value = false
    }
  }

  onMounted(() => {
    if (props.node.config.optionSource === 'remote' && props.node.config.remoteConfig?.url) {
      loadRemoteOptions(props.node.config.remoteConfig)
    }
  })

  // 监听依赖字段变化，debounce 重新加载远程选项
  watch(
    () => {
      const config = props.node.config.remoteConfig
      if (!config?.dependsOn?.length) return null
      return config.dependsOn.map((field) => props.formData[field])
    },
    (newVal, oldVal) => {
      if (!newVal || !props.node.config.remoteConfig?.url) return
      if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
      const delay = props.node.config.remoteConfig.debounce ?? 300
      debounce(() => loadRemoteOptions(props.node.config.remoteConfig!), delay)
    },
    { deep: true }
  )

  watch(
    () => props.node.config.options,
    (val) => {
      if (props.node.config.optionSource !== 'remote') {
        options.value = val || []
      }
    }
  )

  // 联动计算（多条件）
  const relationResult = computed(() => evaluateRelations(props.node, props.formData))
  const computedDisabled = computed(() => relationResult.value.disabled)
  const computedRequired = computed(() => relationResult.value.required)

  // 联动赋值
  watch(
    () => relationResult.value.value,
    (newVal) => {
      if (newVal !== undefined && props.formData[props.node.field!] !== newVal) {
        props.formData[props.node.field!] = newVal
      }
    }
  )

  // 计算属性
  if (props.node.config.computed?.enabled && props.node.config.computed.expression) {
    const deps = props.node.config.computed.dependencies
      || extractDependencies(props.node.config.computed.expression)

    watch(
      () => deps.map((d) => props.formData[d]),
      () => {
        const result = evaluateExpression(props.node.config.computed!.expression, props.formData)
        if (result !== undefined) {
          props.formData[props.node.field!] = result
        }
      },
      { immediate: true }
    )
  }

  // 校验规则
  const RULE_PATTERNS: Record<string, string> = {
    phone: '^1[3-9]\\d{9}$',
    email: '^[\\w.-]+@[\\w.-]+\\.\\w+$',
    idcard: '^\\d{17}[\\dXx]$',
    url: '^https?://',
    chinese: '^[\\u4e00-\\u9fa5]+$',
    number: '^\\d+(\\.\\d+)?$',
    alphanum: '^[a-zA-Z0-9]+$'
  }

  const computedRules = computed(() => {
    const rules: any[] = []

    if (computedRequired.value) {
      rules.push({
        required: true,
        message: `${props.node.label || '此字段'}不能为空`,
        trigger: ['blur', 'change']
      })
    }

    const rule = props.node.config.rule
    if (rule && rule.value) {
      const pattern = rule.value === 'regex' ? rule.pattern : RULE_PATTERNS[rule.value]
      if (pattern) {
        rules.push({
          pattern: new RegExp(pattern),
          message: rule.message || `${props.node.label || '此字段'}格式不正确`,
          trigger: 'blur'
        })
      }
    }

    if (props.node.config.minLength) {
      rules.push({ min: props.node.config.minLength, message: `最少输入${props.node.config.minLength}个字符`, trigger: 'blur' })
    }
    if (props.node.config.maxLength) {
      rules.push({ max: props.node.config.maxLength, message: `最多输入${props.node.config.maxLength}个字符`, trigger: 'blur' })
    }

    return rules
  })

  // 显示值
  const displayValue = computed(() => {
    const val = props.formData[props.node.field!]
    if (val === undefined || val === null || val === '') return '-'
    return String(val)
  })

  const getOptionLabel = (val: any): string => {
    const opt = options.value.find((o) => o.value === val)
    return opt ? opt.label : (val ?? '-')
  }

  const getCheckboxLabels = (val: any): string => {
    if (!Array.isArray(val) || val.length === 0) return '-'
    return val.map((v) => {
      const opt = options.value.find((o) => o.value === v)
      return opt ? opt.label : v
    }).join('、')
  }
</script>

<style lang="scss" scoped>
  .readonly-text {
    color: #606266;
  }

  .color-preview {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 4px;
    vertical-align: middle;
    border: 1px solid #dcdfe6;
    border-radius: 2px;
  }

  .field-description {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
</style>
