<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtBack></ArtBack>

      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton
                v-permission="'manager:appform:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog"
                >分配表单</ElButton
              >
            </ElSpace>
          </template>
        </ArtTableHeader>

        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          row-key="id"
        >
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 分配表单弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        title="分配表单"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="420px"
        align-center
      >
        <ElForm :model="assignForm" label-width="80px">
          <ElFormItem label="选择表单">
            <ElSelect
              v-model="assignForm.formId"
              placeholder="请选择表单"
              filterable
              style="width: 100%"
            >
              <ElOptionGroup
                v-for="group in groupedForms"
                :key="group.scene"
                :label="group.sceneName"
              >
                <ElOption
                  v-for="f in group.forms"
                  :key="f.id"
                  :label="f.name"
                  :value="f.id"
                />
              </ElOptionGroup>
            </ElSelect>
          </ElFormItem>
        </ElForm>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus, Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { ListAppForm, CreateAppForm, DeleteAppForm } from '@/api/manager/appform/api'
  import { AppForm } from '@/api/manager/appform/type'
  import { ListUserForm } from '@/api/manager/userform/api'
  import { UserForm } from '@/api/manager/userform/type'
  import { ListFormScene } from '@/api/manager/formscene/api'
  import { FormScene } from '@/api/manager/formscene/type'

  defineOptions({ name: 'AppForm' })

  const router = useRouter()
  const appKeyword = router.currentRoute.value.query.app as string

  const dialogVisible = ref(false)
  const submitting = ref(false)
  const assignForm = ref<{ formId: number | undefined }>({ formId: undefined })

  // 场景列表
  const scenes = ref<FormScene[]>([])
  ListFormScene({ page: 1, pageSize: 100 }).then((res) => {
    scenes.value = res.list || []
  })

  // 所有已发布表单（用于分配选择）
  const allForms = ref<UserForm[]>([])
  ListUserForm({ page: 1, pageSize: 200, status: true }).then((res) => {
    allForms.value = res.list || []
  })

  // 按 scene 分组
  const groupedForms = computed(() => {
    const map = new Map<string, { scene: string; sceneName: string; forms: UserForm[] }>()
    for (const f of allForms.value) {
      if (!map.has(f.scene)) {
        const s = scenes.value.find((item) => item.keyword === f.scene)
        map.set(f.scene, { scene: f.scene, sceneName: s?.name || f.scene, forms: [] })
      }
      map.get(f.scene)!.forms.push(f)
    }
    return Array.from(map.values())
  })

  const operationItems = [
    {
      icon: Delete,
      popConfirm: true,
      label: '取消分配',
      color: 'danger',
      permission: 'manager:appform:delete',
      click: async (record: AppForm) => {
        await DeleteAppForm({ id: record.id })
        refreshRemove()
      }
    }
  ]

  const {
    columns,
    columnChecks,
    data,
    loading,
    getData,
    refreshData,
    refreshCreate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: ListAppForm,
      apiParams: {
        appKeyword: appKeyword
      },
      columnsFactory: () => [
        { type: 'index', width: '60', label: '#' },
        {
          prop: 'scene',
          label: '场景',
          formatter: (row: AppForm) => {
            const s = scenes.value.find((item) => item.keyword === row.scene)
            return s?.name || row.scene
          }
        },
        {
          prop: 'formId',
          label: '表单',
          formatter: (row: AppForm) => {
            const f = allForms.value.find((item) => item.id === row.formId)
            return f?.name || `#${row.formId}`
          }
        },
        {
          prop: 'createdAt',
          label: '分配时间',
          sortable: true,
          formatter: (row: AppForm) => formatTime(row.createdAt)
        },
        { prop: 'operation', label: '操作', width: 120, fixed: 'right', useSlot: true, slotName: 'operation' }
      ]
    }
  })

  const showDialog = () => {
    assignForm.value = { formId: undefined }
    dialogVisible.value = true
  }

  const handleSubmit = async () => {
    if (!assignForm.value.formId) {
      ElMessage.warning('请选择表单')
      return
    }
    submitting.value = true
    try {
      await CreateAppForm({
        appKeyword: appKeyword,
        formId: assignForm.value.formId
      })
      ElMessage.success('分配成功')
      refreshCreate()
      dialogVisible.value = false
    } finally {
      submitting.value = false
    }
  }
</script>
