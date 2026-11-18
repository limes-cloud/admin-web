<template>
  <div class="category-icon-builder">
    <div v-if="statusIconUrl" class="icon-status">
      <ElImage class="icon-status__image" :src="statusIconUrl" fit="cover" />
      <span class="icon-status__label">{{ statusLabel }}</span>
      <ElTooltip content="移除图标" placement="top">
        <ElButton class="remove-button" link type="danger" :icon="Delete" aria-label="移除图标" @click="clear" />
      </ElTooltip>
    </div>

    <div class="builder-main">
      <div class="preview" :style="{ backgroundColor }">
        <img v-if="displayPreview" class="preview-image" :src="displayPreview" alt="" />
        <span v-else class="preview-placeholder">图标</span>
      </div>

      <div class="controls">
        <ArtIconSelector v-model="sourceIcon" width="100%" enable-iconify placeholder="选择系统图标或 MDI 图标" />
        <div class="color-row">
          <ElColorPicker v-model="backgroundColor" :predefine="PRESET_COLORS" color-format="hex" />
          <ElButton
            class="generate-button"
            type="primary"
            :loading="generating"
            :disabled="!sourceIcon"
            @click="generate"
          >
            生成并上传
          </ElButton>
        </div>
      </div>
    </div>

    <div class="hint"> 选择图标和底色后生成 256×256 PNG；圆角外透明，图标固定为白色。 </div>
  </div>
</template>

<script setup lang="ts">
  import { ElButton, ElColorPicker, ElImage, ElMessage } from 'element-plus'
  import { Delete } from '@element-plus/icons-vue'
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import ArtIconSelector from '@/components/core/base/art-icon-selector/index.vue'
  import { generateIconPng } from '@/utils/resource/icon-image'
  import { rurl } from '@/utils/resource/url'
  import { uploadFile } from '@/utils/resource/upload'

  defineOptions({ name: 'CategoryIconBuilder' })

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      iconColor?: string
      uploadPath?: string
    }>(),
    {
      modelValue: '',
      iconColor: '',
      uploadPath: 'psou/category/icon'
    }
  )

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    'update:iconColor': [value: string]
  }>()

  const PRESET_COLORS = [
    '#dc2626',
    '#ea580c',
    '#d97706',
    '#ca8a04',
    '#65a30d',
    '#16a34a',
    '#059669',
    '#0d9488',
    '#0891b2',
    '#0284c7',
    '#2563eb',
    '#4f46e5',
    '#7c3aed',
    '#9333ea',
    '#c026d3',
    '#db2777',
    '#e11d48',
    '#57534e',
    '#475569',
    '#111827'
  ]
  const sourceIcon = ref('')
  const backgroundColor = ref(normalizeColor(props.iconColor))
  const generating = ref(false)
  const uploadedUrl = ref('')
  const draftPreviewUrl = ref('')
  const existingIconUrl = ref(rurl(props.modelValue))

  const displayPreview = computed(() => draftPreviewUrl.value || uploadedUrl.value)
  const statusIconUrl = computed(() => uploadedUrl.value || existingIconUrl.value)
  const statusLabel = computed(() => (uploadedUrl.value ? '已生成图标' : '当前图标'))
  let previewRequest = 0

  function normalizeColor(value?: string): string {
    return /^#[\da-f]{6}$/i.test(value?.trim() || '') ? value!.trim() : PRESET_COLORS[0]
  }

  watch(
    () => props.iconColor,
    (value) => {
      const color = normalizeColor(value)
      if (color !== backgroundColor.value) backgroundColor.value = color
    }
  )

  watch(backgroundColor, (value) => {
    emit('update:iconColor', value)
  })

  watch([sourceIcon, backgroundColor], async ([icon, color]) => {
    const request = ++previewRequest
    if (!icon) {
      replaceDraftPreview()
      return
    }

    try {
      const blob = await generateIconPng({ icon, backgroundColor: color, size: 128 })
      const url = URL.createObjectURL(blob)
      if (request !== previewRequest) {
        URL.revokeObjectURL(url)
        return
      }
      replaceDraftPreview(url)
    } catch {
      if (request === previewRequest) replaceDraftPreview()
    }
  })

  function replaceDraftPreview(url = ''): void {
    if (draftPreviewUrl.value) URL.revokeObjectURL(draftPreviewUrl.value)
    draftPreviewUrl.value = url
  }

  async function generate(): Promise<void> {
    if (!sourceIcon.value || generating.value) return
    generating.value = true
    try {
      const blob = await generateIconPng({
        icon: sourceIcon.value,
        backgroundColor: backgroundColor.value,
        size: 256
      })
      const file = new File([blob], `category-icon-${Date.now()}.png`, { type: 'image/png' })
      const result = await uploadFile(file, {
        path: props.uploadPath,
        name: file.name
      })
      uploadedUrl.value = rurl(result.key)
      emit('update:modelValue', result.key)
      ElMessage.success('图标已生成')
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '图标生成失败')
    } finally {
      generating.value = false
    }
  }

  function clear(): void {
    sourceIcon.value = ''
    uploadedUrl.value = ''
    existingIconUrl.value = ''
    emit('update:modelValue', '')
  }

  onBeforeUnmount(() => {
    previewRequest += 1
    replaceDraftPreview()
  })
</script>

<style scoped lang="scss">
  .category-icon-builder {
    width: 100%;
  }

  .icon-status {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 12px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .icon-status__image {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border-radius: 9px;
  }

  .icon-status__label {
    flex: 1;
  }

  .builder-main {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .preview {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    color: #fff;
    border-radius: 16px;
  }

  .preview-placeholder {
    font-size: 12px;
    color: rgb(255 255 255 / 72%);
  }

  .preview-image {
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }

  .controls {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  .color-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .generate-button {
    margin-left: auto;
  }

  .remove-button {
    padding: 0;
    font-size: 18px;
  }

  .hint {
    margin-top: 8px;
    color: var(--el-text-color-placeholder);
    font-size: 12px;
    line-height: 20px;
  }
</style>
