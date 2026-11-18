<template>
  <div class="http-config">
    <ElRow :gutter="12">
      <ElCol :span="12">
        <ElFormItem label="请求地址" required>
          <ElInput v-model="form.url" placeholder="http://127.0.0.1:8080/api" clearable />
        </ElFormItem>
      </ElCol>
      <ElCol :span="12">
        <ElFormItem label="请求方式">
          <ElSelect v-model="form.method" style="width: 100%">
            <ElOption v-for="m in httpMethods" :key="m" :label="m" :value="m" />
          </ElSelect>
        </ElFormItem>
      </ElCol>
    </ElRow>
    <ElRow :gutter="12">
      <ElCol :span="12">
        <ElFormItem label="Query 参数">
          <KvEditor v-model="form.params" value-placeholder="参数值" />
        </ElFormItem>
      </ElCol>
      <ElCol :span="12">
        <ElFormItem label="请求头">
          <KvEditor v-model="form.header" value-placeholder="Header 值" />
        </ElFormItem>
      </ElCol>
    </ElRow>
    <ElFormItem label="请求体">
      <div class="http-body">
        <ElRadioGroup v-model="bodyMode" size="small" class="http-body__mode">
          <ElRadioButton value="string">字符串</ElRadioButton>
          <ElRadioButton value="json">JSON</ElRadioButton>
        </ElRadioGroup>
        <ElInput
          v-if="bodyMode === 'string'"
          v-model="form.body"
          type="textarea"
          :rows="3"
          placeholder="原始字符串请求体（可为空）"
        />
        <ElInput v-else v-model="bodyJsonText" type="textarea" :rows="5" placeholder='{"key": "value"}' />
      </div>
    </ElFormItem>
  </div>
</template>

<script setup lang="ts">
  import KvEditor from './KvEditor.vue'

  interface HttpForm {
    url: string
    method: string
    params: Record<string, any>
    header: Record<string, any>
    body: string
    bodyJson: Record<string, any>
  }

  const props = defineProps<{ modelValue?: string }>()

  // 支持的请求方式，与后端 resty 执行器对齐
  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

  // 从 execValue JSON 初始化表单；空值 / 历史脏数据回退默认
  const init = (): { form: HttpForm; bodyMode: 'string' | 'json'; bodyJsonText: string } => {
    let obj: any = {}
    try {
      obj = JSON.parse(props.modelValue || '{}')
    } catch {
      // 非 JSON（如旧数据），使用默认值
    }
    const hasJsonBody = obj.bodyJson && Object.keys(obj.bodyJson).length > 0
    return {
      form: {
        url: obj.url || '',
        method: obj.method || 'GET',
        params: obj.params || {},
        header: obj.header || {},
        body: obj.body || '',
        bodyJson: obj.bodyJson || {}
      },
      bodyMode: hasJsonBody ? 'json' : 'string',
      bodyJsonText: hasJsonBody ? JSON.stringify(obj.bodyJson, null, 2) : ''
    }
  }

  const initState = init()
  const form = reactive(initState.form)
  const bodyMode = ref<'string' | 'json'>(initState.bodyMode)
  const bodyJsonText = ref(initState.bodyJsonText)

  // validate 供父表单提交前校验，返回 { ok, msg }
  const validate = (): { ok: boolean; msg?: string } => {
    if (!form.url.trim()) {
      return { ok: false, msg: '请输入请求地址' }
    }
    if (bodyMode.value === 'json' && bodyJsonText.value.trim()) {
      let obj: any
      try {
        obj = JSON.parse(bodyJsonText.value)
      } catch {
        return { ok: false, msg: '请求体 JSON 格式错误' }
      }
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return { ok: false, msg: '请求体 JSON 需为对象' }
      }
    }
    return { ok: true }
  }

  // getValue 将表单序列化为后端约定的 execValue JSON
  const getValue = (): string => {
    const payload: any = {
      url: form.url,
      method: form.method || 'GET',
      params: form.params,
      header: form.header
    }
    if (bodyMode.value === 'json') {
      payload.body = ''
      payload.bodyJson = bodyJsonText.value.trim() ? JSON.parse(bodyJsonText.value) : {}
    } else {
      payload.body = form.body
      payload.bodyJson = {}
    }
    return JSON.stringify(payload, null, 2)
  }

  defineExpose({ validate, getValue })
</script>

<style scoped>
  .http-body {
    width: 100%;
  }

  .http-body__mode {
    margin-bottom: 8px;
  }
</style>
