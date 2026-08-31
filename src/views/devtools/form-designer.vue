<template>
  <div class="form-designer-page">
    <div class="page-header">
      <h3>表单设计器</h3>
      <div class="page-actions">
        <el-button :icon="RefreshLeft" :disabled="!canUndo" @click="handleUndo" title="撤销 (Ctrl+Z)" />
        <el-button :icon="RefreshRight" :disabled="!canRedo" @click="handleRedo" title="重做 (Ctrl+Shift+Z)" />
        <el-popconfirm title="确认清空所有组件？" @confirm="handleClear">
          <template #reference>
            <el-button :disabled="!hasNodes">清空</el-button>
          </template>
        </el-popconfirm>
        <el-button :icon="Setting" @click="configVisible = true">表单配置</el-button>
        <el-button @click="handleImportJSON">导入 JSON</el-button>
        <el-button @click="handleExportJSON">导出 JSON</el-button>
        <el-button type="primary" @click="handlePreview">预览</el-button>
      </div>
    </div>

    <div class="page-body">
      <ArtFormEditor
        :form-mode="false"
        :default-nodes="[]"
        :form-config="formConfig"
        ref="editorRef"
      />
    </div>

    <!-- 预览弹窗 -->
    <ElDialog v-model="previewVisible" title="表单预览" width="700px" align-center destroy-on-close>
      <div class="preview-toolbar">
        <el-switch v-model="previewReadonly" active-text="阅读模式" inactive-text="编辑模式" />
      </div>
      <FormRenderer
        v-if="previewSchema"
        :schema="previewSchema"
        v-model="previewData"
        :readonly="previewReadonly"
      />
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </ElDialog>

    <!-- JSON 弹窗 -->
    <ElDialog v-model="jsonVisible" title="Schema JSON" width="600px" align-center>
      <el-input v-model="jsonContent" type="textarea" :rows="20" :readonly="jsonReadonly" />
      <template #footer>
        <el-button v-if="!jsonReadonly" type="primary" @click="handleConfirmImport">确认导入</el-button>
        <el-button v-if="jsonReadonly" @click="handleCopyJSON">复制</el-button>
        <el-button @click="jsonVisible = false">关闭</el-button>
      </template>
    </ElDialog>

    <!-- 表单配置弹窗 -->
    <ElDialog v-model="configVisible" title="表单配置" width="460px" align-center>
      <el-form :model="formConfig" label-width="90px" label-position="left">
        <el-form-item label="标签位置">
          <el-select v-model="formConfig.labelPosition">
            <el-option label="左对齐" value="left" />
            <el-option label="右对齐" value="right" />
            <el-option label="顶部" value="top" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签宽度">
          <el-input v-model="formConfig.labelWidth" placeholder="auto" />
        </el-form-item>
        <el-form-item label="组件尺寸">
          <el-select v-model="formConfig.size">
            <el-option label="大" value="large" />
            <el-option label="默认" value="default" />
            <el-option label="小" value="small" />
          </el-select>
        </el-form-item>
        <el-form-item label="栅格间距">
          <el-input-number v-model="formConfig.gutter" :min="0" :max="48" />
        </el-form-item>
        <el-form-item label="全局禁用">
          <el-switch v-model="formConfig.disabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configVisible = false">关闭</el-button>
      </template>
    </ElDialog>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import ArtFormEditor from '@/components/core/base/art-form-editor/index.vue'
  import { FormRenderer } from '@/components/core/base/art-form-editor/components/renderer'
  import { FormSchema, FormConfig } from '@/components/core/base/art-form-editor/lib/types'
  import { defaultFormConfig } from '@/components/core/base/art-form-editor/lib/data'
  import { ElMessage } from 'element-plus'
  import { RefreshLeft, RefreshRight, Setting } from '@element-plus/icons-vue'

  const editorRef = ref<InstanceType<typeof ArtFormEditor>>()
  const previewVisible = ref(false)
  const previewReadonly = ref(false)
  const previewSchema = ref<FormSchema>()
  const previewData = ref<Record<string, any>>({})
  const jsonVisible = ref(false)
  const jsonContent = ref('')
  const jsonReadonly = ref(true)
  const configVisible = ref(false)
  const formConfig = ref<FormConfig>(defaultFormConfig())

  const hasNodes = computed(() => (editorRef.value?.getNodes()?.length || 0) > 0)
  const canUndo = computed(() => editorRef.value?.canUndo ?? false)
  const canRedo = computed(() => editorRef.value?.canRedo ?? false)

  const handleUndo = () => editorRef.value?.undo()
  const handleRedo = () => editorRef.value?.redo()

  const getSchema = (): FormSchema => {
    const nodes = editorRef.value?.getNodes() || []
    return {
      config: formConfig.value,
      nodes
    }
  }

  const handlePreview = () => {
    previewSchema.value = getSchema()
    previewData.value = {}
    previewReadonly.value = false
    previewVisible.value = true
  }

  const handleExportJSON = () => {
    const schema = getSchema()
    jsonContent.value = JSON.stringify(schema, null, 2)
    jsonReadonly.value = true
    jsonVisible.value = true
  }

  const handleImportJSON = () => {
    jsonContent.value = ''
    jsonReadonly.value = false
    jsonVisible.value = true
  }

  const handleConfirmImport = () => {
    try {
      const schema = JSON.parse(jsonContent.value) as FormSchema
      if (!schema.nodes || !Array.isArray(schema.nodes)) {
        ElMessage.error('JSON 格式不正确，缺少 nodes 数组')
        return
      }
      editorRef.value?.setNodes(schema.nodes)
      // 恢复表单配置
      if (schema.config) {
        Object.assign(formConfig.value, schema.config)
      }
      jsonVisible.value = false
      ElMessage.success('导入成功')
    } catch {
      ElMessage.error('JSON 解析失败，请检查格式')
    }
  }

  const handleClear = () => {
    editorRef.value?.setNodes([])
    ElMessage.success('已清空')
  }

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent.value)
      ElMessage.success('已复制到剪贴板')
    } catch {
      ElMessage.warning('复制失败，请手动复制')
    }
  }

  // 键盘快捷键
  const handleKeydown = (e: KeyboardEvent) => {
    // 忽略在输入框/textarea 中的按键
    const tag = (e.target as HTMLElement).tagName
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return

    const isMeta = e.ctrlKey || e.metaKey

    // Ctrl+Z / Cmd+Z → 撤销
    if (isMeta && !e.shiftKey && e.key === 'z') {
      e.preventDefault()
      handleUndo()
      return
    }

    // Ctrl+Shift+Z / Cmd+Shift+Z → 重做
    if (isMeta && e.shiftKey && e.key === 'z') {
      e.preventDefault()
      handleRedo()
      return
    }

    // Ctrl+Y / Cmd+Y → 重做（备选）
    if (isMeta && e.key === 'y') {
      e.preventDefault()
      handleRedo()
      return
    }

    // Delete / Backspace → 删除选中组件
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      editorRef.value?.deleteActive?.()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
</script>

<style lang="scss" scoped>
  .form-designer-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 16px;
    overflow: hidden;
    background: #f5f5f5;
    box-sizing: border-box;

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }
    }

    .page-body {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      border-radius: 4px;
    }
  }

  .preview-toolbar {
    margin-bottom: 16px;
  }
</style>
