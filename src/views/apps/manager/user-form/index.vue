<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          ref="searchBarRef"
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="resetSearchParams"
        >
        </ArtSearchBar>
      </div>

      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton
                v-permission="'manager:userform:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增表单</ElButton
              >
              <ElButton
                v-permission="'manager:formscene:query'"
                v-ripple
                :icon="Setting"
                @click="router.push({ name: 'FormScene' })"
                >场景管理</ElButton
              >
            </ElSpace>
          </template>
        </ArtTableHeader>

        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #status="{ row }">
            <el-tag :type="row.status ? 'success' : 'info'" size="small">
              {{ row.status ? '已发布' : '草稿' }}
            </el-tag>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/编辑弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增表单' : '编辑表单'"
        :destroy-on-close="true"
        width="480px"
        align-center
      >
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="70px">
          <ElFormItem label="场景" prop="scene">
            <ElSelect v-model="formData.scene" placeholder="请选择场景" style="width: 100%">
              <ElOption v-for="s in scenes" :key="s.keyword" :label="s.name" :value="s.keyword" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入表单名称" maxlength="64" />
          </ElFormItem>
          <ElFormItem label="配置" prop="nodes" required>
            <div class="form-config-row">
              <ElTag :type="formNodes.length > 0 ? 'success' : 'info'">
                {{ formNodes.length > 0 ? `已配置 (${formNodes.length}项)` : '未配置' }}
              </ElTag>
              <ElButton type="primary" link @click="openEditorDialog">点击配置</ElButton>
            </div>
          </ElFormItem>
          <ElFormItem label="描述">
            <ElInput v-model="formData.description" placeholder="表单描述（选填）" type="textarea" :rows="2" />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="saving" @click="handleSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <!-- 全屏表单编辑器弹窗 -->
      <ElDialog v-model="editorDialogVisible" fullscreen :destroy-on-close="true" class="editor-fullscreen-dialog">
        <template #header>
          <div class="editor-dialog-header">
            <span class="editor-dialog-title">表单配置</span>
            <div class="editor-dialog-actions">
              <ElButton
                size="small"
                :icon="RefreshLeft"
                :disabled="!canUndo"
                title="撤销 (Ctrl+Z)"
                @click="handleUndo"
              />
              <ElButton
                size="small"
                :icon="RefreshRight"
                :disabled="!canRedo"
                title="重做 (Ctrl+Shift+Z)"
                @click="handleRedo"
              />
              <ElPopconfirm title="确认清空所有组件？" @confirm="handleClear">
                <template #reference>
                  <ElButton size="small" :disabled="!hasEditingNodes">清空</ElButton>
                </template>
              </ElPopconfirm>
              <ElButton size="small" :icon="Setting" @click="configVisible = true">表单配置</ElButton>
              <ElButton size="small" @click="handleImportJSON">导入 JSON</ElButton>
              <ElButton size="small" @click="handleExportJSON">导出 JSON</ElButton>
              <ElDivider direction="vertical" />
              <ElButton size="small" @click="handlePreview">预览</ElButton>
              <ElButton size="small" type="primary" @click="confirmEditorNodes">确认</ElButton>
            </div>
          </div>
        </template>
        <div class="design-editor-fullscreen">
          <ArtFormEditor
            ref="editorRef"
            :form-mode="false"
            :default-nodes="editingNodes"
            :form-config="editingConfig"
          />
        </div>
      </ElDialog>

      <!-- 预览弹窗 -->
      <ElDialog v-model="previewVisible" title="表单预览" width="700px" align-center destroy-on-close>
        <div class="preview-toolbar">
          <ElSwitch v-model="previewReadonly" active-text="阅读模式" inactive-text="编辑模式" />
        </div>
        <FormRenderer v-if="previewSchema" :schema="previewSchema" v-model="previewData" :readonly="previewReadonly" />
        <template #footer>
          <ElButton @click="previewVisible = false">关闭</ElButton>
        </template>
      </ElDialog>

      <!-- JSON 弹窗 -->
      <ElDialog v-model="jsonVisible" title="Schema JSON" width="600px" align-center>
        <ElInput v-model="jsonContent" type="textarea" :rows="20" :readonly="jsonReadonly" />
        <template #footer>
          <ElButton v-if="!jsonReadonly" type="primary" @click="handleConfirmImport">确认导入</ElButton>
          <ElButton v-if="jsonReadonly" @click="handleCopyJSON">复制</ElButton>
          <ElButton @click="jsonVisible = false">关闭</ElButton>
        </template>
      </ElDialog>

      <!-- 表单配置弹窗 -->
      <ElDialog v-model="configVisible" title="表单配置" width="460px" align-center>
        <ElForm :model="editingConfig" label-width="90px" label-position="left">
          <ElFormItem label="标签位置">
            <ElSelect v-model="editingConfig.labelPosition">
              <ElOption label="左对齐" value="left" />
              <ElOption label="右对齐" value="right" />
              <ElOption label="顶部" value="top" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="标签宽度">
            <ElInput v-model="editingConfig.labelWidth" placeholder="auto" />
          </ElFormItem>
          <ElFormItem label="组件尺寸">
            <ElSelect v-model="editingConfig.size">
              <ElOption label="大" value="large" />
              <ElOption label="默认" value="default" />
              <ElOption label="小" value="small" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="栅格间距">
            <ElInputNumber v-model="editingConfig.gutter" :min="0" :max="48" />
          </ElFormItem>
          <ElFormItem label="全局禁用">
            <ElSwitch v-model="editingConfig.disabled" />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="configVisible = false">关闭</ElButton>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, nextTick } from 'vue'
  import type { FormInstance } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Delete, Edit, Plus, Promotion, Setting, RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
  import ArtFormEditor from '@/components/core/base/art-form-editor/index.vue'
  import { FormRenderer } from '@/components/core/base/art-form-editor/components/renderer'
  import { FormNode, FormSchema, FormConfig } from '@/components/core/base/art-form-editor/lib/types'
  import { defaultFormConfig } from '@/components/core/base/art-form-editor/lib/data'
  import {
    GetUserForm,
    CreateUserForm,
    UpdateUserForm,
    DeleteUserForm,
    ListUserForm,
    PublishUserForm
  } from '@/api/manager/userform/api'
  import { UserForm } from '@/api/manager/userform/type'
  import { ListFormScene } from '@/api/manager/formscene/api'
  import { FormScene } from '@/api/manager/formscene/type'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'UserFormList' })

  const router = useRouter()

  // ==================== 搜索 ====================
  const searchForm = ref({
    scene: undefined,
    name: undefined,
    status: undefined
  })

  // 场景列表
  const scenes = ref<FormScene[]>([])
  const loadScenes = () => {
    ListFormScene({ page: 1, pageSize: 100 }).then((res) => {
      scenes.value = res.list || []
    })
  }
  loadScenes()

  const searchItems = computed(() => [
    {
      label: '场景',
      key: 'scene',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '请选择场景',
        options: scenes.value,
        props: { label: 'name', value: 'keyword' }
      }
    },
    {
      label: '表单名称',
      key: 'name',
      type: 'input',
      props: { maxlength: '64', placeholder: '请输入表单名称', clearable: true }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '请选择状态',
        options: [
          { label: '已发布', value: true },
          { label: '草稿', value: false }
        ]
      }
    }
  ])

  // ==================== 弹窗状态 ====================
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const editorDialogVisible = ref(false)
  const saving = ref(false)
  const currentFormId = ref<number>()

  const formData = ref({ scene: '', name: '', description: '', nodes: [] as any[] })
  const formNodes = ref<FormNode[]>([])
  const formConfig = ref<FormConfig>(defaultFormConfig())
  const editingNodes = ref<FormNode[]>([])
  const editingConfig = ref<FormConfig>(defaultFormConfig())

  // 编辑器工具栏状态
  const previewVisible = ref(false)
  const previewReadonly = ref(false)
  const previewSchema = ref<FormSchema>()
  const previewData = ref<Record<string, any>>({})
  const jsonVisible = ref(false)
  const jsonContent = ref('')
  const jsonReadonly = ref(true)
  const configVisible = ref(false)

  const formRef = ref<FormInstance>()
  const editorRef = ref<InstanceType<typeof ArtFormEditor>>()

  const formRules = {
    scene: [{ required: true, message: '请选择场景', trigger: 'change' }],
    name: [{ required: true, message: '请输入表单名称', trigger: 'blur' }],
    nodes: [
      {
        validator: (_rule: any, _value: any, callback: any) => {
          if (formNodes.value.length === 0) {
            callback(new Error('请配置表单'))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ]
  }

  // ==================== 弹窗操作 ====================
  const showDialog = async (type: 'add' | 'edit', row?: UserForm) => {
    dialogType.value = type
    if (type === 'edit' && row) {
      currentFormId.value = row.id
      const res = await GetUserForm({ id: row.id })
      const uf = res.data
      formData.value.scene = uf.scene
      formData.value.name = uf.name
      formData.value.description = uf.description || ''
      try {
        const schema: FormSchema = JSON.parse(uf.schema)
        formNodes.value = schema.nodes || []
        formConfig.value = { ...defaultFormConfig(), ...(schema.config || {}) }
      } catch {
        formNodes.value = []
        formConfig.value = defaultFormConfig()
      }
    } else {
      currentFormId.value = undefined
      formData.value = { scene: '', name: '', description: '', nodes: [] }
      formNodes.value = []
      formConfig.value = defaultFormConfig()
    }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 打开全屏编辑器
  const openEditorDialog = () => {
    editingNodes.value = JSON.parse(JSON.stringify(formNodes.value))
    editingConfig.value = { ...defaultFormConfig(), ...formConfig.value }
    editorDialogVisible.value = true
  }

  // 编辑器确认
  const confirmEditorNodes = () => {
    const nodes = editorRef.value?.getNodes() || []
    formNodes.value = nodes
    formData.value.nodes = nodes as any[]
    formConfig.value = { ...editingConfig.value }
    formRef.value?.validateField('nodes')
    editorDialogVisible.value = false
  }

  // ==================== 编辑器工具栏 ====================
  const hasEditingNodes = computed(() => (editorRef.value?.getNodes()?.length || 0) > 0)
  const canUndo = computed(() => editorRef.value?.canUndo ?? false)
  const canRedo = computed(() => editorRef.value?.canRedo ?? false)

  const handleUndo = () => editorRef.value?.undo()
  const handleRedo = () => editorRef.value?.redo()

  const getEditorSchema = (): FormSchema => ({
    config: editingConfig.value,
    nodes: editorRef.value?.getNodes() || []
  })

  const handlePreview = () => {
    previewSchema.value = getEditorSchema()
    previewData.value = {}
    previewReadonly.value = false
    previewVisible.value = true
  }

  const handleExportJSON = () => {
    jsonContent.value = JSON.stringify(getEditorSchema(), null, 2)
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
      if (schema.config) {
        Object.assign(editingConfig.value, schema.config)
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

  // 提交
  const handleSubmit = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    const schema: FormSchema = {
      config: formConfig.value,
      nodes: formNodes.value
    }
    const schemaJson = JSON.stringify(schema)

    saving.value = true
    try {
      if (dialogType.value === 'add') {
        await CreateUserForm({
          scene: formData.value.scene,
          name: formData.value.name,
          description: formData.value.description || undefined,
          schema: schemaJson
        })
        ElMessage.success('创建成功')
        refreshCreate()
      } else {
        await UpdateUserForm({
          id: currentFormId.value!,
          scene: formData.value.scene,
          name: formData.value.name,
          description: formData.value.description || undefined,
          schema: schemaJson
        })
        ElMessage.success('保存成功')
        refreshUpdate()
      }
      dialogVisible.value = false
    } finally {
      saving.value = false
    }
  }

  // ==================== 表格操作 ====================
  const operationItems = [
    {
      icon: Edit,
      label: '编辑',
      color: 'warning',
      permission: 'manager:userform:update',
      click: (record: UserForm) => showDialog('edit', record)
    },
    {
      icon: Promotion,
      label: '发布',
      color: 'success',
      permission: 'manager:userform:publish',
      show: (record: UserForm) => !record.status,
      click: async (record: UserForm) => {
        await ElMessageBox.confirm('确定要发布该表单吗？发布后运行时将使用新版本。', '确认发布', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await PublishUserForm({ id: record.id })
        ElMessage.success('发布成功')
        refreshUpdate()
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除',
      color: 'danger',
      permission: 'manager:userform:delete',
      click: async (record: UserForm) => {
        await DeleteUserForm({ id: record.id })
        refreshRemove()
      }
    }
  ]

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    getData,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: ListUserForm,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: '60', label: '#' },
        {
          prop: 'scene',
          label: '场景',
          formatter: (row: UserForm) => {
            const s = scenes.value.find((item) => item.keyword === row.scene)
            return s?.name || row.scene
          }
        },
        { prop: 'name', label: '表单名称' },
        { prop: 'version', label: '版本', width: 80 },
        { prop: 'status', label: '状态', width: 100, useSlot: true, slotName: 'status' },
        { prop: 'description', label: '描述' },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: UserForm) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '更新时间',
          sortable: true,
          formatter: (row: UserForm) => formatTime(row.updatedAt)
        },
        { prop: 'operation', label: '操作', width: 180, fixed: 'right', useSlot: true, slotName: 'operation' }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }
</script>

<style lang="scss" scoped>
  .form-config-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 32px;
    padding: 0 11px;
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-fill-color-blank);
  }

  .design-editor-fullscreen {
    height: 100%;
    overflow: hidden;
  }

  .editor-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .editor-dialog-title {
      font-size: 16px;
      font-weight: 600;
    }

    .editor-dialog-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: 24px;
    }
  }

  .preview-toolbar {
    margin-bottom: 16px;
  }
</style>

<style lang="scss">
  .editor-fullscreen-dialog {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 0;

    .el-dialog__header {
      flex-shrink: 0;
      margin-right: 0;
    }

    .el-dialog__body {
      flex: 1;
      min-height: 0;
      padding: 0;
      overflow: hidden;
    }
  }
</style>
