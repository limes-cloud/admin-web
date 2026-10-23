<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="loadSettings"
          @reset="resetSearch"
        />
      </div>

      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="loadSettings">
          <template #left>
            <ElSpace wrap>
              <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')"> 新增配置 </ElButton>
              <ElButton v-ripple type="success" :icon="EditPen" @click="openBatch"> 批量编辑值 </ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <ArtTable :loading="loading" :data="settings" :columns="columns" :show-pagination="false" row-key="id">
          <template #type="{ row }">
            <ElTag :type="typeMeta(row.type).tag" effect="plain">{{ typeMeta(row.type).label }}</ElTag>
          </template>
          <template #value="{ row }">
            <code class="value-preview" :title="row.value">{{ previewValue(row.value) }}</code>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增配置' : '编辑配置'"
        :destroy-on-close="true"
        width="720px"
        align-center
      >
        <ElForm ref="formRef" :model="settingForm" :rules="rules" label-width="92px">
          <ElRow :gutter="12">
            <ElCol :span="12">
              <ElFormItem label="配置键名" prop="keyword">
                <ElInput
                  v-model="settingForm.keyword"
                  :disabled="dialogType === 'edit'"
                  placeholder="如 site.name"
                  maxlength="64"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="配置名称" prop="name">
                <ElInput v-model="settingForm.name" placeholder="表单标签" maxlength="64" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="控件类型" prop="type">
                <ElSelect v-model="settingForm.type" style="width: 100%" @change="handleTypeChange">
                  <ElOption v-for="item in settingTypes" :key="item.value" :label="item.label" :value="item.value" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="排序权重">
                <ElInputNumber
                  v-model="settingForm.sort"
                  :min="-9999"
                  :max="9999"
                  align="left"
                  controls-position="right"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="24">
              <ElFormItem label="配置取值">
                <SettingValueInput v-model="settingForm.value" :type="settingForm.type" :extra="settingForm.extra" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="24">
              <ElFormItem label="控件扩展" prop="extra">
                <ElInput
                  v-model="settingForm.extra"
                  type="textarea"
                  :rows="5"
                  placeholder='JSON 对象，如 {"options":[{"label":"A","value":"a"}],"required":true}'
                />
              </ElFormItem>
            </ElCol>
            <ElCol :span="24">
              <ElFormItem label="配置说明">
                <ElInput
                  v-model="settingForm.description"
                  type="textarea"
                  :rows="2"
                  maxlength="255"
                  placeholder="表单帮助文案"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
        <template #footer>
          <ElButton v-ripple @click="dialogVisible = false">取消</ElButton>
          <ElButton v-ripple type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <ElDrawer v-model="batchVisible" title="批量编辑配置值" size="580px" :destroy-on-close="true">
        <ElEmpty v-if="batchSettings.length === 0" description="暂无可编辑配置" />
        <div v-else class="batch-list">
          <div v-for="item in batchSettings" :key="item.id" class="batch-item">
            <div class="batch-head">
              <div>
                <b>{{ item.name }}</b>
                <code>{{ item.keyword }}</code>
              </div>
              <ElTag :type="typeMeta(item.type).tag" effect="plain">{{ typeMeta(item.type).label }}</ElTag>
            </div>
            <SettingValueInput v-model="batchValues[item.id]" :type="item.type" :extra="item.extra" />
            <div v-if="item.description" class="batch-desc">{{ item.description }}</div>
          </div>
        </div>
        <template #footer>
          <ElButton v-ripple @click="batchVisible = false">取消</ElButton>
          <ElButton v-ripple type="primary" :loading="batchSaving" @click="saveBatch"> 保存全部 </ElButton>
        </template>
      </ElDrawer>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { Delete, Edit, EditPen, Plus } from '@element-plus/icons-vue'

  import {
    BatchUpdateSettings,
    CreateSetting,
    DeleteSetting,
    ListSettings,
    UpdateSetting
  } from '@/api/psou/setting/api'
  import type { CreateSettingRequest, Setting, UpdateSettingRequest } from '@/api/psou/setting/type'
  import { useTableColumns } from '@/composables/useTableColumns'
  import { formatTime } from '@/utils/time'
  import SettingValueInput from './components/SettingValueInput.vue'

  defineOptions({ name: 'PsouSetting' })

  const settingTypes = [
    { label: '单行文本', value: 'string', tag: 'primary' as const },
    { label: '多行文本', value: 'text', tag: 'primary' as const },
    { label: '整数', value: 'int', tag: 'success' as const },
    { label: '小数', value: 'float', tag: 'success' as const },
    { label: '开关', value: 'bool', tag: 'warning' as const },
    { label: '下拉单选', value: 'enum', tag: 'warning' as const },
    { label: '多选', value: 'array', tag: 'info' as const },
    { label: '图片', value: 'image', tag: 'danger' as const },
    { label: 'JSON 对象', value: 'object', tag: 'info' as const },
    { label: '键值对', value: 'kv', tag: 'info' as const }
  ]

  const typeMeta = (type: string) => {
    return settingTypes.find((item) => item.value === type) || { label: type || '-', tag: 'info' as const }
  }

  const settings = ref<Setting[]>([])
  const loading = ref(false)
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const submitting = ref(false)
  const formRef = ref<FormInstance>()
  interface SettingForm {
    id?: number
    keyword: string
    name: string
    type: string
    value: string
    extra: string
    description: string
    sort: number
  }

  const settingForm = ref<SettingForm>({
    keyword: '',
    name: '',
    type: 'string',
    value: '',
    extra: '',
    description: '',
    sort: 0
  })

  const batchVisible = ref(false)
  const batchSaving = ref(false)
  const batchValues = ref<Record<number, string>>({})
  const batchSettings = ref<Setting[]>([])

  const searchForm = ref({
    keyword: '',
    name: '',
    type: ''
  })

  const searchItems = computed(() => [
    {
      label: '配置键名',
      key: 'keyword',
      type: 'input',
      props: { placeholder: '请输入配置键名', clearable: true, maxlength: 64 }
    },
    {
      label: '配置名称',
      key: 'name',
      type: 'input',
      props: { placeholder: '请输入配置名称', clearable: true, maxlength: 64 }
    },
    {
      label: '控件类型',
      key: 'type',
      type: 'select',
      props: {
        placeholder: '请选择控件类型',
        clearable: true,
        options: settingTypes.map(({ label, value }) => ({ label, value }))
      }
    }
  ])

  const { columns, columnChecks } = useTableColumns<Setting>(() => [
    {
      prop: 'keyword',
      label: '配置键名',
      minWidth: 150
    },
    {
      prop: 'name',
      label: '配置名称',
      minWidth: 150
    },
    {
      prop: 'type',
      label: '控件类型',
      width: 110,
      useSlot: true,
      slotName: 'type'
    },
    {
      prop: 'value',
      label: '配置取值',
      minWidth: 220,
      useSlot: true,
      slotName: 'value'
    },
    {
      prop: 'sort',
      label: '排序权重',
      width: 100
    },
    {
      prop: 'description',
      label: '配置说明',
      minWidth: 180,
      showOverflowTooltip: true
    },
    {
      prop: 'createdAt',
      label: '创建时间',
      width: 170,
      formatter: (row: Setting) => formatTime(row.createdAt)
    },
    {
      prop: 'updatedAt',
      label: '更新时间',
      width: 170,
      formatter: (row: Setting) => formatTime(row.updatedAt)
    },
    {
      prop: 'operation',
      label: '操作',
      width: 110,
      fixed: 'right',
      useSlot: true,
      slotName: 'operation'
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '编辑配置',
      color: 'warning',
      click: (record: Setting) => showDialog('edit', record)
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除配置',
      color: 'danger',
      click: async (record: Setting) => {
        await DeleteSetting({ id: record.id })
        await loadSettings()
      }
    }
  ]

  const validateExtra = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (!value || !value.trim()) {
      callback()
      return
    }
    try {
      const parsed = JSON.parse(value)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        callback(new Error('控件扩展必须是 JSON 对象'))
        return
      }
      callback()
    } catch {
      callback(new Error('控件扩展 JSON 格式不正确'))
    }
  }

  const rules: FormRules = {
    keyword: [{ required: true, message: '请输入配置键名', trigger: ['blur', 'change'] }],
    name: [{ required: true, message: '请输入配置名称', trigger: ['blur', 'change'] }],
    type: [{ required: true, message: '请选择控件类型', trigger: ['blur', 'change'] }],
    extra: [{ validator: validateExtra, trigger: ['blur', 'change'] }]
  }

  const loadSettings = async () => {
    loading.value = true
    try {
      const res = await ListSettings({
        keyword: searchForm.value.keyword || undefined,
        name: searchForm.value.name || undefined,
        type: searchForm.value.type || undefined
      })
      settings.value = res.list
    } finally {
      loading.value = false
    }
  }

  const resetSearch = () => {
    searchForm.value = { keyword: '', name: '', type: '' }
    loadSettings()
  }

  const previewValue = (value: string) => {
    if (!value) return '-'
    return value.length > 80 ? `${value.slice(0, 80)}…` : value
  }

  const showDialog = (type: Form.DialogType, row?: Setting) => {
    dialogType.value = type
    settingForm.value =
      type === 'add'
        ? { keyword: '', name: '', type: 'string', value: '', extra: '', description: '', sort: 0 }
        : {
            id: row?.id,
            keyword: row?.keyword || '',
            name: row?.name || '',
            type: row?.type || 'string',
            value: row?.value || '',
            extra: row?.extra || '',
            description: row?.description || '',
            sort: row?.sort || 0
          }
    dialogVisible.value = true
  }

  const handleTypeChange = () => {
    settingForm.value.value = ''
  }

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
    } catch {
      return
    }
    submitting.value = true
    try {
      const payload = {
        name: String(settingForm.value.name || '').trim(),
        type: String(settingForm.value.type || 'string'),
        value: String(settingForm.value.value || ''),
        extra: String(settingForm.value.extra || '').trim(),
        description: String(settingForm.value.description || '').trim(),
        sort: Number(settingForm.value.sort) || 0
      }
      if (dialogType.value === 'add') {
        await CreateSetting({
          keyword: String(settingForm.value.keyword || '').trim(),
          ...payload
        } as CreateSettingRequest)
        ElMessage.success('创建成功')
      } else {
        await UpdateSetting({
          id: Number(settingForm.value.id),
          ...payload
        } as UpdateSettingRequest)
        ElMessage.success('修改成功')
      }
      dialogVisible.value = false
      await loadSettings()
    } finally {
      submitting.value = false
    }
  }

  const openBatch = async () => {
    const res = await ListSettings()
    batchSettings.value = res.list
    const values: Record<number, string> = {}
    res.list.forEach((item) => {
      values[item.id] = item.value || ''
    })
    batchValues.value = values
    batchVisible.value = true
  }

  const saveBatch = async () => {
    if (batchSettings.value.length === 0) {
      batchVisible.value = false
      return
    }
    const items: { id: number; value: string }[] = []
    for (const item of batchSettings.value) {
      const value = batchValues.value[item.id] ?? ''
      if ((item.type === 'object' || item.type === 'kv') && value.trim()) {
        try {
          const parsed = JSON.parse(value)
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            ElMessage.error(`「${item.name}」必须是 JSON 对象`)
            return
          }
        } catch {
          ElMessage.error(`「${item.name}」JSON 格式不正确`)
          return
        }
      }
      items.push({ id: item.id, value })
    }
    batchSaving.value = true
    try {
      await BatchUpdateSettings({ items })
      ElMessage.success('保存成功')
      batchVisible.value = false
      await loadSettings()
    } finally {
      batchSaving.value = false
    }
  }

  onMounted(loadSettings)
</script>

<style scoped>
  .value-preview {
    display: inline-block;
    max-width: 100%;
    padding: 2px 6px;
    overflow: hidden;
    font-family: var(--el-font-family-mono);
    font-size: 12px;
    color: var(--el-text-color-regular);
    text-overflow: ellipsis;
    white-space: nowrap;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .batch-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .batch-item {
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .batch-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .batch-head > div {
    display: flex;
    gap: 8px;
    align-items: baseline;
    min-width: 0;
  }

  .batch-head code {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .batch-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }
</style>
