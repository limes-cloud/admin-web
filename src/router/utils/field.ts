import { Field } from '@/api/manager/field/type'
import { FormItem } from '@/components/core/forms/art-form/index.vue'

const getFormItemByField = (field: Field, pre: string, required = true): FormItem => {
  const label = field.name
  const key = pre + '.' + field.keyword
  const type = field.type
  const config = field.config || {}
  const rule = config.rule
  const ruleType = rule?.type || ''
  const placeholder = config.placeholder || '请输入' + label

  // 构造必填规则
  const requiredRule = required
    ? { required: true, message: '请输入' + label, trigger: ['blur', 'change'] }
    : undefined
  const requiredSelectRule = required
    ? { required: true, message: '请选择' + label, trigger: ['blur', 'change'] }
    : undefined
  const requiredUploadRule = required
    ? { required: true, message: '请上传' + label, trigger: ['blur', 'change'] }
    : undefined

  // 内置正则映射表
  const builtinPatterns: Record<string, RegExp> = {
    phone: /^1[3-9]\d{9}$/,
    email: /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/,
    idcard: /^([1-9]\d{5})(\d{4})(0[1-9]|1[0-2])([0-2][1-9]|[1-3]\d|4[0-6]|5[0-2])(\d{3})(\d|[Xx])$/,
    url: /^https?:\/\/(([a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,})(:\d{1,5})?(\/[^\s]*)?$/,
    chinese: /^[一-龥]+$/,
    number: /^\d+$/,
    alphanum: /^[a-zA-Z0-9]+$/
  }

  // 规则类型对应的默认提示名
  const ruleNames: Record<string, string> = {
    phone: '手机号',
    email: '邮箱',
    idcard: '身份证号',
    url: '网址',
    chinese: '纯中文',
    number: '纯数字',
    alphanum: '字母数字',
    regex: '正确格式'
  }

  // 先按校验规则类型处理
  if (ruleType && ruleType !== '') {
    let pattern: RegExp | undefined
    if (builtinPatterns[ruleType]) {
      pattern = builtinPatterns[ruleType]
    } else if (ruleType === 'regex' && rule?.pattern) {
      pattern = new RegExp(rule.pattern)
    }

    if (pattern) {
      return {
        label, key, type: 'input',
        props: {
          placeholder, clearable: true, maxlength: config.maxLength,
          rules: [
            requiredRule,
            { message: rule?.message || '请输入' + (ruleNames[ruleType] || label), trigger: ['blur', 'change'], pattern }
          ].filter(Boolean)
        }
      }
    }
  }

  // 密码强度正则映射
  const passwordPatterns: Record<string, RegExp> = {
    weak: /.{6,}/, // 仅长度>=6
    medium: /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/, // 字母+数字，>=8
    strong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=]).{8,}$/ // 大小写+数字+特殊字符，>=8
  }
  const passwordMessages: Record<string, string> = {
    weak: '密码长度至少6位',
    medium: '密码需包含字母和数字，至少8位',
    strong: '密码需包含大小写字母、数字和特殊字符，至少8位'
  }

  // 无特殊校验规则，按组件类型生成 FormItem
  switch (type) {
    case 'input':
    case 'textarea':
      return {
        label, key, type: type === 'textarea' ? 'textarea' : 'input',
        props: {
          placeholder, clearable: true, maxlength: config.maxLength,
          rules: [requiredRule].filter(Boolean)
        }
      }
    case 'password': {
      const strength = rule?.type || ''
      const pwdPattern = passwordPatterns[strength]
      const pwdRule = pwdPattern
        ? { message: rule?.message || passwordMessages[strength], trigger: ['blur', 'change'], pattern: pwdPattern }
        : undefined
      return {
        label, key, type: 'password',
        props: {
          placeholder, clearable: true, maxlength: config.maxLength,
          rules: [requiredRule, pwdRule].filter(Boolean)
        }
      }
    }
    case 'number':
      return {
        label, key, type: 'inputNumber',
        props: {
          placeholder,
          min: config.min,
          max: config.max,
          step: config.step,
          rules: [requiredRule].filter(Boolean)
        }
      }
    case 'radio':
      return {
        label, key, type: 'radioGroup',
        props: {
          options: (config.options || []).map((v) => ({ label: v.label, value: v.value })),
          rules: [requiredSelectRule].filter(Boolean)
        }
      }
    case 'checkbox':
      return {
        label, key, type: 'checkboxGroup',
        props: {
          options: (config.options || []).map((v) => ({ label: v.label, value: v.value })),
          rules: [requiredSelectRule].filter(Boolean)
        }
      }
    case 'select':
      return {
        label, key, type: 'select',
        props: {
          placeholder, allowClear: true,
          options: (config.options || []).map((v) => ({ label: v.label, value: v.value })),
          rules: [requiredSelectRule].filter(Boolean)
        }
      }
    case 'time':
      return {
        label, key, type: 'timePicker',
        props: {
          placeholder,
          rules: [requiredSelectRule].filter(Boolean)
        }
      }
    case 'date':
      return {
        label, key, type: 'datePicker',
        props: {
          placeholder,
          rules: [requiredSelectRule].filter(Boolean)
        }
      }
    case 'datetime':
      return {
        label, key, type: 'datePicker',
        props: {
          placeholder, showTime: true,
          rules: [requiredSelectRule].filter(Boolean)
        }
      }
    case 'upload':
      return {
        label, key, type: 'upload',
        props: {
          limit: config.limit || 1,
          accept: config.filetype === 'image' ? 'image/*' : config.filetype === 'video' ? 'video/*' : '*',
          rules: [requiredUploadRule].filter(Boolean)
        }
      }
    default:
      return {
        label, key, type: 'input',
        props: {
          placeholder, clearable: true,
          rules: [requiredRule].filter(Boolean)
        }
      }
  }
}

export const toFormItems = (fields: Field[], pre = 'extra', defaultRequired = true): FormItem[] => {
  return fields.map((field) => {
    return getFormItemByField(field, pre, defaultRequired)
  })
}

export { getFormItemByField }
