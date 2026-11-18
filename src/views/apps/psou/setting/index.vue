<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <template #header>
        <div class="setting-header">
          <div>
            <div class="setting-title">站点配置</div>
            <div class="setting-subtitle">配置项由后端统一下发，保存后立即生效</div>
          </div>
          <ElButton :loading="loading" @click="loadSettings">刷新</ElButton>
        </div>
      </template>

      <div class="setting-scroll">
        <ElSkeleton v-if="loading && fields.length === 0" :rows="6" animated />
        <ElEmpty v-else-if="fields.length === 0" description="暂无可配置项" />
        <ElForm v-else label-position="top">
          <div v-for="field in fields" :key="field.key" class="setting-field">
            <div class="setting-field__head">
              <div class="setting-field__meta">
                <span class="setting-field__name">{{ field.name }}</span>
                <code>{{ field.key }}</code>
                <ElTag v-if="isDirty(field)" size="small" type="warning" effect="plain">未保存</ElTag>
              </div>
              <ElButton
                v-ripple
                size="small"
                type="primary"
                :loading="savingKeys[field.key]"
                :disabled="!isDirty(field)"
                @click="saveField(field)"
              >
                保存
              </ElButton>
            </div>

            <div v-if="isSwitchWidget(field.widget)" class="setting-field__switch">
              <ElSwitch v-model="formValues[field.key].enabled" active-text="启用" inactive-text="禁用" />
            </div>

            <template v-if="showValueInput(field)">
              <div v-if="field.fileName" class="setting-field__file-name">
                <span class="setting-field__file-name-label">{{ field.fileNameLabel || '文件名' }}</span>
                <ElInput v-model="formValues[field.key].fileName" :placeholder="field.fileNamePlaceholder" />
              </div>
              <ArtTinymce
                v-if="field.widget === 'switch_richtext'"
                v-model="formValues[field.key].value"
                id="psou-site-announcement"
                :height="360"
                upload-path="/psou/announcement"
              />
              <ElInput
                v-else-if="isTextarea(field.widget)"
                v-model="formValues[field.key].value"
                type="textarea"
                :rows="field.rows > 0 ? field.rows : 6"
                :maxlength="field.maxLen > 0 ? field.maxLen : undefined"
                :placeholder="field.placeholder"
                resize="vertical"
                show-word-limit
              />
              <ElInput
                v-else
                v-model="formValues[field.key].value"
                :maxlength="field.maxLen > 0 ? field.maxLen : undefined"
                :placeholder="field.placeholder"
              />
            </template>

            <div v-if="field.description" class="setting-field__desc">{{ field.description }}</div>
          </div>
        </ElForm>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'

  import { ListSetting, BatchUpdateSettings } from '@/api/psou/setting/api'
  import type { SettingItem } from '@/api/psou/setting/type'
  import ArtTinymce from '@/components/core/base/art-tinymce/index.vue'

  defineOptions({ name: 'PsouSetting' })

  interface SettingValue {
    enabled: boolean
    value: string
    fileName: string
  }

  const fields = ref<SettingItem[]>([])
  const formValues = reactive<Record<string, SettingValue>>({})
  const savedValues = reactive<Record<string, SettingValue>>({})
  const savingKeys = reactive<Record<string, boolean>>({})
  const loading = ref(false)

  const isTextarea = (widget: string) => widget === 'textarea' || widget === 'switch_textarea'
  const isSwitchWidget = (widget: string) =>
    widget === 'switch' || widget === 'switch_textarea' || widget === 'switch_richtext'

  const showValueInput = (field: SettingItem) =>
    field.widget !== 'switch' && (!isSwitchWidget(field.widget) || Boolean(formValues[field.key]?.enabled))

  const hasSettingContent = (field: SettingItem, value: string) => {
    if (field.widget !== 'switch_richtext') return Boolean(value.trim())

    const doc = new DOMParser().parseFromString(value, 'text/html')
    return Boolean(doc.body.textContent?.trim()) || Boolean(doc.body.querySelector('img, video, iframe, audio, svg'))
  }

  const isDirty = (field: SettingItem) => {
    const current = formValues[field.key]
    const saved = savedValues[field.key]
    if (!current || !saved) return false
    return current.enabled !== saved.enabled || current.value !== saved.value || current.fileName !== saved.fileName
  }

  const loadSettings = async () => {
    loading.value = true
    try {
      const res = await ListSetting()
      fields.value = res.list || []
      Object.keys(formValues).forEach((key) => delete formValues[key])
      Object.keys(savedValues).forEach((key) => delete savedValues[key])
      fields.value.forEach((field) => {
        const value = {
          enabled: Boolean(field.enabled),
          value: field.value || '',
          fileName: field.fileName || ''
        }
        formValues[field.key] = { ...value }
        savedValues[field.key] = { ...value }
      })
    } finally {
      loading.value = false
    }
  }

  const saveField = async (field: SettingItem) => {
    const current = formValues[field.key] || { enabled: false, value: '', fileName: '' }
    if (
      isSwitchWidget(field.widget) &&
      field.widget !== 'switch' &&
      current.enabled &&
      !hasSettingContent(field, current.value)
    ) {
      ElMessage.error(`「${field.name}」开启时必须填写内容`)
      return
    }

    savingKeys[field.key] = true
    try {
      await BatchUpdateSettings({
        items: [
          {
            key: field.key,
            enabled: Boolean(current.enabled),
            value: current.value || '',
            fileName: current.fileName || ''
          }
        ]
      })
      savedValues[field.key] = {
        enabled: Boolean(current.enabled),
        value: current.value || '',
        fileName: current.fileName || ''
      }
      ElMessage.success(`「${field.name}」保存成功`)
    } finally {
      savingKeys[field.key] = false
    }
  }

  onMounted(loadSettings)
</script>

<style scoped>
  .setting-header {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;
  }

  .setting-scroll {
    flex: 1;
    min-height: 0;
    padding-right: 4px;
    overflow-y: auto;
  }

  .setting-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .setting-subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .setting-field {
    padding: 0 0 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .setting-field:last-child {
    padding-bottom: 0;
    margin-bottom: 0;
    border-bottom: 0;
  }

  .setting-field__head {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .setting-field__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: baseline;
    min-width: 0;
  }

  .setting-field__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .setting-field__head code {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .setting-field__switch {
    margin-bottom: 10px;
  }

  .setting-field__file-name {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }

  .setting-field__file-name-label {
    flex: none;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .setting-field__desc {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }
</style>
