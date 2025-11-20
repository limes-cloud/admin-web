import { Field } from '@/api/manager/appfield/type'
import { FormItem } from '@/components/core/forms/art-form/index.vue'

const getFormItemByField = (field: Field, pre: string): FormItem => {
  const label = field.name
  const key = pre + '.' + field.keyword
  const type = field.type

  switch (type) {
    case 'bool':
      return {
        label: label,
        key: key,
        type: 'select',
        props: {
          placeholder: '请选择' + label,
          options: [
            { label: '是', value: 'true' },
            { label: '否', value: 'false' }
          ],
          clearable: true,
          rules: [{ required: true, message: '请选择' + label, trigger: ['blur', 'change'] }]
        }
      }
    case 'string':
      return {
        label: label,
        key: key,
        type: 'input',
        props: {
          placeholder: '请输入' + label,
          clearable: true,
          rules: [{ required: true, message: '请输入' + label, trigger: ['blur', 'change'] }]
        }
      }
    case 'number':
      return {
        label: label,
        key: key,
        type: 'input',
        props: {
          placeholder: '请输入' + label,
          clearable: true,
          rules: [
            { required: true, message: '请输入' + label, trigger: ['blur', 'change'] },
            { message: label + '格式错误', trigger: ['blur', 'change'], pattern: /^-?\d*\.?\d+$/ }
          ]
        }
      }
    case 'phone':
      return {
        label: label,
        key: key,
        type: 'input',
        props: {
          placeholder: '请输入' + label,
          clearable: true,
          rules: [
            { required: true, message: '请输入' + label, trigger: ['blur', 'change'] },
            { message: label + '格式错误', trigger: ['blur', 'change'], pattern: /^1[3456789]\d{9}$/ }
          ]
        }
      }
    case 'idcard':
      return {
        label: label,
        key: key,
        type: 'input',
        props: {
          placeholder: '请输入' + label,
          clearable: true,
          rules: [
            { required: true, message: '请输入' + label, trigger: ['blur', 'change'] },
            {
              message: label + '格式错误',
              trigger: ['blur', 'change'],
              pattern: /^([1-9]\d{5})(\d{4})(0[1-9]|1[0-2])([0-2][1-9]|[1-3]\d|4[0-6]|5[0-2])(\d{3})(\d|[Xx])$/
            }
          ]
        }
      }
    case 'gender':
      return {
        label: label,
        key: key,
        type: 'select',
        props: {
          placeholder: '请选择' + label,
          options: [
            { label: '男', value: 'M' },
            { label: '女', value: 'F' }
          ],
          clearable: true,
          rules: [{ required: true, message: '请选择' + label, trigger: ['blur', 'change'] }]
        }
      }
    case 'email':
      return {
        label: label,
        key: key,
        type: 'input',
        props: {
          placeholder: '请输入' + label,
          clearable: true,
          rules: [
            { required: true, message: '请输入' + label, trigger: ['blur', 'change'] },
            {
              message: label + '格式错误',
              trigger: ['blur', 'change'],
              pattern: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(.[a-zA-Z]{2,})+$/
            }
          ]
        }
      }
    case 'datetime':
      return {
        label: label,
        key: key,
        type: 'datetime',
        props: {
          placeholder: '请选择' + label,
          clearable: true,
          rules: [{ required: true, message: '请选择' + label, trigger: ['blur', 'change'] }]
        }
      }
    default:
      return {} as FormItem
  }
}

export const toFormItems = (fields: Field[]): FormItem[] => {
  const formItems: FormItem[] = []
  fields.forEach((field) => {
    const formItem = getFormItemByField(field, 'infos')
    if (Object.keys(formItem).length > 0) {
      formItems.push(formItem)
    }
  })
  return formItems
}
