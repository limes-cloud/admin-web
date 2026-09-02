<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtBack></ArtBack>

      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton
                v-permission="'manager:formscene:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog()"
                >新增场景</ElButton
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
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/编辑弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增场景' : '编辑场景'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="420px"
        align-center
      >
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px" style="width: 100%">
          <ElFormItem label="标识" prop="keyword">
            <ElInput
              v-model="formData.keyword"
              placeholder="请输入场景标识（如 register）"
              maxlength="64"
              :disabled="dialogType === 'edit'"
            />
          </ElFormItem>
          <ElFormItem label="名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入场景名称" maxlength="128" />
          </ElFormItem>
          <ElFormItem label="描述">
            <ElInput v-model="formData.description" placeholder="场景描述（选填）" type="textarea" :rows="2" />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="saving" @click="handleSubmit">确定</ElButton>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { FormInstance } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import { Plus, Edit, Delete } from '@element-plus/icons-vue'
  import { ListFormScene, CreateFormScene, UpdateFormScene, DeleteFormScene } from '@/api/manager/formscene/api'
  import { FormScene } from '@/api/manager/formscene/type'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'FormSceneList' })

  // ==================== 弹窗状态 ====================
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const saving = ref(false)
  const formRef = ref<FormInstance>()
  const formData = ref({ keyword: '', name: '', description: '' })
  const currentId = ref<number>()

  const formRules = {
    keyword: [{ required: true, message: '请输入场景标识', trigger: 'blur' }],
    name: [{ required: true, message: '请输入场景名称', trigger: 'blur' }]
  }

  const showDialog = (row?: FormScene) => {
    if (row) {
      dialogType.value = 'edit'
      currentId.value = row.id
      formData.value = { keyword: row.keyword, name: row.name, description: row.description || '' }
    } else {
      dialogType.value = 'add'
      currentId.value = undefined
      formData.value = { keyword: '', name: '', description: '' }
    }
    dialogVisible.value = true
  }

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    saving.value = true
    try {
      if (dialogType.value === 'add') {
        await CreateFormScene({
          keyword: formData.value.keyword,
          name: formData.value.name,
          description: formData.value.description || undefined
        })
        ElMessage.success('创建成功')
        refreshCreate()
      } else {
        await UpdateFormScene({
          id: currentId.value!,
          name: formData.value.name,
          description: formData.value.description || undefined
        })
        ElMessage.success('更新成功')
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
      permission: 'manager:formscene:update',
      click: (record: FormScene) => showDialog(record)
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除',
      color: 'danger',
      permission: 'manager:formscene:delete',
      click: async (record: FormScene) => {
        await DeleteFormScene({ id: record.id })
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
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: ListFormScene,
      apiParams: {
        page: 1,
        pageSize: 10
      },
      columnsFactory: () => [
        { type: 'index', width: '60', label: '#' },
        { prop: 'keyword', label: '场景标识' },
        { prop: 'name', label: '场景名称' },
        { prop: 'description', label: '描述' },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: FormScene) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '更新时间',
          sortable: true,
          formatter: (row: FormScene) => formatTime(row.updatedAt)
        },
        { prop: 'operation', label: '操作', width: 150, fixed: 'right', useSlot: true, slotName: 'operation' }
      ]
    }
  })
</script>
