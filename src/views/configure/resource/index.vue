<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar v-model="searchForm" :card="false" :items="searchItems" @search="handleSearch" @reset="resetSearchParams" />
      </div>
      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElButton v-permission="'configure:resource:add'" v-ripple type="primary" :icon="Plus" @click="showDialog('add')">
              新增变量
            </ElButton>
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
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增变量' : '编辑变量'" :destroy-on-close="true" body-class="art-form-dialog" width="520px" align-center>
        <ElForm ref="formRef" :model="currentData" label-position="top">
          <ElFormItem label="变量标识" prop="keyword" :rules="[{ required: true, message: '请输入变量标识', trigger: ['blur', 'change'] }]">
            <ElInput v-model="currentData.keyword" :disabled="dialogType === 'edit'" placeholder="请输入变量标识" clearable />
          </ElFormItem>
          <ElFormItem label="变量标签" prop="tag" :rules="[{ required: true, message: '请输入变量标签', trigger: ['blur', 'change'] }]">
            <ElInput v-model="currentData.tag" placeholder="请输入变量标签" clearable />
          </ElFormItem>
          <ElFormItem label="变量字段" prop="fieldList" :rules="[{ required: true, message: '请输入变量字段', trigger: ['blur', 'change'] }]">
            <ElSelect v-model="currentData.fieldList" multiple allow-create filterable placeholder="输入字段名后回车" style="width:100%" />
          </ElFormItem>
          <ElFormItem label="变量类型" prop="private" :rules="[{ required: true, message: '请选择变量类型', trigger: ['blur', 'change'] }]">
            <ElRadioGroup v-model="currentData.private">
              <ElRadio :value="true">私有变量</ElRadio>
              <ElRadio :value="false">公共变量</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem v-if="currentData.private" label="所属服务" prop="serverIds" :rules="[{ required: true, message: '请选择所属服务', trigger: ['blur', 'change'] }]">
            <ElSelect v-model="currentData.serverIds" multiple placeholder="请选择所属服务" style="width:100%" :options="serverOptions" />
          </ElFormItem>
          <ElFormItem label="变量描述">
            <ElInput v-model="currentData.description" type="textarea" placeholder="请输入变量描述" />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <!-- 值配置抽屉 -->
      <ElDrawer v-model="valueVisible" title="资源值配置" size="480px" :destroy-on-close="true">
        <ElForm label-position="top">
          <ElFormItem v-for="env in envs" :key="env.id" :label="`${env.name}(${env.keyword})`">
            <ArtCodeEditor v-model="valueForm[env.id]" :style="{ width: '100%', height: '150px' }" />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="valueVisible = false">取消</ElButton>
          <ElButton v-permission="'configure:resource:value:update'" type="primary" @click="handleValueSubmit">保存</ElButton>
        </template>
      </ElDrawer>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus, Edit, Delete, Setting } from '@element-plus/icons-vue'
  import { ListResource, CreateResource, UpdateResource, DeleteResource, GetResource, ListResourceValue, UpdateResourceValue } from '@/api/configure/resource/api'
  import { ListServer } from '@/api/configure/server/api'
  import { ListEnv } from '@/api/configure/env/api'
  import { Resource, CreateResourceRequest, UpdateResourceRequest } from '@/api/configure/resource/type'
  import { Env } from '@/api/configure/env/type'
  import { formatTime } from '@/utils/time'
  import ArtCodeEditor from '@/components/core/base/art-code-editor/index.vue'

  defineOptions({ name: 'ConfigureResource' })

  type FormData = (Partial<CreateResourceRequest> | Partial<UpdateResourceRequest>) & { fieldList?: string[] }

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<FormData>({})
  const formRef = ref()
  const valueVisible = ref(false)
  const currentResourceId = ref(0)
  const valueForm = ref<Record<number, string>>({})
  const envs = ref<Env[]>([])
  const serverOptions = ref<{ label: string; value: number }[]>([])

  const searchForm = ref({ keyword: undefined, tag: undefined, serverId: undefined })

  const searchItems = computed(() => [
    { label: '变量标识', key: 'keyword', type: 'input', props: { placeholder: '请输入变量标识', clearable: true } },
    { label: '变量标签', key: 'tag', type: 'input', props: { placeholder: '请输入变量标签', clearable: true } },
    {
      label: '所属服务',
      key: 'serverId',
      type: 'select',
      props: { placeholder: '请选择所属服务', clearable: true, options: serverOptions.value }
    }
  ])

  const operationItems = [
    {
      icon: Setting,
      label: '值配置',
      color: 'primary',
      permission: 'configure:resource:value:query',
      click: async (row: Resource) => {
        currentResourceId.value = row.id
        valueForm.value = {}
        const res = await ListResourceValue({ resourceId: row.id })
        res.list.forEach((item) => { valueForm.value[item.envId] = item.value })
        valueVisible.value = true
      }
    },
    {
      icon: Edit,
      label: '修改',
      color: 'warning',
      permission: 'configure:resource:update',
      click: async (row: Resource) => {
        const detail = await GetResource({ id: row.id })
        const serverIds = detail.servers?.map((s) => s.id) || []
        currentData.value = { ...detail, fieldList: detail.fields?.split(',') || [], serverIds }
        dialogType.value = 'edit'
        nextTick(() => { dialogVisible.value = true })
      }
    },
    {
      icon: Delete,
      label: '删除',
      color: 'danger',
      popConfirm: true,
      permission: 'configure:resource:delete',
      click: async (row: Resource) => {
        await DeleteResource({ id: row.id })
        refreshRemove()
      }
    }
  ]

  const { columns, columnChecks, data, loading, pagination, searchParams, getData, resetSearchParams, handleSizeChange, handleCurrentChange, refreshData, refreshCreate, refreshUpdate, refreshRemove } =
    useTable({
      core: {
        apiFn: ListResource,
        apiParams: { page: 1, pageSize: 10, ...searchForm.value },
        columnsFactory: () => [
          { type: 'index', width: '60', label: '#' },
          { prop: 'keyword', label: '变量标识' },
          { prop: 'fields', label: '变量字段' },
          { prop: 'tag', label: '变量标签' },
          { prop: 'createdAt', label: '创建时间', formatter: (row: Resource) => formatTime(row.createdAt) },
          { prop: 'updatedAt', label: '更新时间', formatter: (row: Resource) => formatTime(row.updatedAt) },
          { prop: 'operation', label: '操作', fixed: 'right', useSlot: true, slotName: 'operation' }
        ]
      }
    })

  const loadInitData = async () => {
    const [serverRes, envRes] = await Promise.all([
      ListServer({ page: 1, pageSize: 100 }),
      ListEnv({ status: true })
    ])
    serverOptions.value = serverRes.list.map((s: any) => ({ label: s.name, value: s.id }))
    envs.value = envRes.list
  }
  loadInitData()

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: Form.DialogType) => {
    dialogType.value = type
    currentData.value = {}
    nextTick(() => { dialogVisible.value = true })
  }

  const handleSubmit = async () => {
    await formRef.value?.validate()
    const payload = { ...currentData.value, fields: currentData.value.fieldList?.join(',') || '' }
    delete (payload as any).fieldList
    if (dialogType.value === 'add') {
      await CreateResource(payload as CreateResourceRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateResource(payload as UpdateResourceRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleValueSubmit = async () => {
    const list = envs.value.map((env) => ({ envId: env.id, value: valueForm.value[env.id] || '' }))
    await UpdateResourceValue({ resourceId: currentResourceId.value, list })
    ElMessage.success('设置成功')
    valueVisible.value = false
  }
</script>
