<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="resetSearchParams"
        />
      </div>

      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')"> 新增分类 </ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :show-pagination="false"
          row-key="id"
          default-expand-all
        >
          <template #icon="{ row }">
            <ArtIcon v-if="row.icon && (mdiReady || !row.icon.startsWith('mdi:'))" :value="row.icon" :size="20" />
            <span v-else class="muted">-</span>
          </template>
          <template #status="{ row }">
            <ElSwitch
              :model-value="row.status === 1"
              inline-prompt
              active-text="展示"
              inactive-text="隐藏"
              :disabled="row.isHome"
              :before-change="handleUpdateStatus(row)"
            />
          </template>
          <template #isHome="{ row }">
            <ElTag v-if="row.parentId === 0" :type="row.isHome ? 'success' : 'info'" effect="light" size="small">
              {{ row.isHome ? '是' : '否' }}
            </ElTag>
            <span v-else class="muted">-</span>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems(row)" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? (parentPresetId ? '新增子分类' : '新增分类') : '编辑分类'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="500px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="24"
          @submit="handleSubmit"
          @cancel="dialogVisible = false"
        />
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Delete, Edit, HomeFilled, Plus } from '@element-plus/icons-vue'

  import { useTable } from '@/composables/useTable'
  import { CreateCategory, DeleteCategory, ListCategories, UpdateCategory } from '@/api/psou/category/api'
  import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/api/psou/category/type'
  import { formatTime } from '@/utils/time'
  import { loadMdiIcons } from '@/utils/iconify'
  import { useCategoryOptions } from '../useCategoryOptions'

  defineOptions({ name: 'PsouCategory' })

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const mdiReady = ref(false)
  const currentData = ref<Partial<Category>>({})
  // 从一级分类行内新增子分类时，记录预设的上级分类
  const parentPresetId = ref<number | undefined>(undefined)
  const { loadCategories } = useCategoryOptions()

  const searchForm = ref({
    name: undefined as string | undefined,
    status: undefined as number | undefined
  })

  const searchItems = computed(() => [
    {
      label: '分类名称',
      key: 'name',
      type: 'input',
      props: {
        placeholder: '请输入分类名称',
        clearable: true,
        maxlength: 64
      }
    },
    {
      label: '展示状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择展示状态',
        clearable: true,
        options: [
          { label: '展示', value: 1 },
          { label: '隐藏', value: 0 }
        ]
      }
    }
  ])

  const formItems = computed(() => [
    {
      key: 'name',
      label: '分类名称',
      type: 'input',
      props: {
        placeholder: '请输入分类名称',
        maxlength: 64,
        rules: [{ required: true, message: '请输入分类名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'icon',
      label: '分类图标',
      type: 'icon',
      props: {
        width: '100% !important',
        enableIconify: true,
        placeholder: '请选择分类图标',
        rules: [{ required: true, message: '请选择分类图标', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'sort',
      label: '排序权重',
      type: 'number',
      defaultValue: 0,
      props: {
        min: -9999,
        max: 9999,
        align: 'left',
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'status',
      label: '展示状态',
      type: 'select',
      props: {
        options: [
          { label: '展示', value: 1 },
          { label: '隐藏', value: 0, disabled: Boolean(currentData.value.isHome) }
        ],
        rules: [{ required: true, message: '请选择展示状态', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'isHome',
      label: '是否首页',
      type: 'switch',
      // 只有一级分类可以设为首页，二级分类不展示该字段
      hidden: Number(currentData.value.parentId) !== 0,
      defaultValue: false,
      tip: Number(currentData.value.status) !== 1 ? '隐藏分类不能设为首页' : '',
      props: {
        activeText: '是',
        inactiveText: '否',
        activeValue: true,
        inactiveValue: false,
        disabled: Number(currentData.value.status) !== 1
      }
    }
  ])

  const operationItems = (row: Category) => {
    return [
      // 只有一级分类可以继续新增二级分类
      ...(row.parentId === 0
        ? [
            {
              icon: Plus,
              label: '新增子分类',
              color: 'primary',
              click: (record: Category) => showDialog('add', undefined, record.id)
            },
            {
              icon: HomeFilled,
              label: row.isHome ? '取消首页' : '设为首页',
              color: row.isHome ? 'info' : 'success',
              disabled: row.status !== 1,
              popConfirm: true,
              popTitle: `确定${row.isHome ? '取消' : '设为'}「${row.name}」首页吗？`,
              click: (record: Category) => handleUpdateHome(record)
            }
          ]
        : []),
      {
        icon: Edit,
        label: '编辑分类',
        color: 'warning',
        click: (record: Category) => showDialog('edit', record)
      },
      // 首页分类不允许删除
      ...(!row.isHome
        ? [
            {
              icon: Delete,
              popConfirm: true,
              label: '删除分类',
              color: 'danger',
              click: async (record: Category) => {
                await DeleteCategory({ id: record.id })
                await loadCategories()
                refreshRemove()
              }
            }
          ]
        : [])
    ]
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    searchParams,
    getData,
    resetSearchParams,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: ListCategories,
      apiParams: { ...searchForm.value },
      excludeParams: ['page', 'pageSize'],
      columnsFactory: () => [
        {
          prop: 'name',
          label: '分类名称',
          minWidth: 180
        },
        {
          prop: 'icon',
          label: '分类图标',
          width: 100,
          useSlot: true,
          slotName: 'icon'
        },
        {
          prop: 'sort',
          label: '排序权重',
          width: 100
        },
        {
          prop: 'status',
          label: '展示状态',
          width: 110,
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          width: 170,
          formatter: (row: Category) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '更新时间',
          width: 170,
          formatter: (row: Category) => formatTime(row.updatedAt)
        },
        {
          prop: 'isHome',
          label: '是否首页',
          width: 110,
          useSlot: true,
          slotName: 'isHome'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 110,
          fixed: 'right',
          useSlot: true,
          slotName: 'operation'
        }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: Form.DialogType, row?: Category, parentId?: number) => {
    dialogType.value = type
    parentPresetId.value = parentId
    currentData.value =
      type === 'add'
        ? { parentId: parentId ?? 0, name: '', icon: '', sort: 0, status: 1, isHome: false }
        : { ...(row as Category) }
    dialogVisible.value = true
  }

  const toPayload = (patch: Partial<Category> = {}) => {
    const item = { ...currentData.value, ...patch }
    const parentId = Number(item.parentId) || 0
    return {
      parentId,
      name: String(item.name || '').trim(),
      icon: String(item.icon || '').trim(),
      sort: Number(item.sort) || 0,
      status: Number(item.status) || 0,
      isHome: parentId === 0 ? Boolean(item.isHome) : false
    }
  }

  const handleSubmit = async () => {
    const payload = toPayload()
    if (dialogType.value === 'add') {
      await CreateCategory(payload as CreateCategoryRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateCategory({ id: Number(currentData.value.id), ...payload } as UpdateCategoryRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    await loadCategories()
    dialogVisible.value = false
  }

  const handleUpdateStatus = (row: Category): (() => Promise<boolean>) => {
    return async () => {
      const nextStatus = row.status === 1 ? 0 : 1
      try {
        await ElMessageBox.confirm(`确定将「${row.name}」${nextStatus === 1 ? '展示' : '隐藏'}吗？`, '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await UpdateCategory(toUpdatePayload(row, { status: nextStatus }))
        ElMessage.success('修改成功')
        refreshData()
        return true
      } catch {
        return false
      }
    }
  }

  const handleUpdateHome = async (row: Category) => {
    const nextIsHome = !row.isHome
    await UpdateCategory(toUpdatePayload(row, { isHome: nextIsHome }))
    ElMessage.success(nextIsHome ? '已设为首页' : '已取消首页')
    await loadCategories()
    refreshData()
  }

  const toUpdatePayload = (row: Category, patch: Partial<Category> = {}) => {
    const item = { ...row, ...patch }
    return {
      id: item.id,
      parentId: item.parentId,
      name: item.name,
      icon: item.icon,
      sort: item.sort,
      status: item.status,
      isHome: item.parentId === 0 ? Boolean(item.isHome) : false
    } as UpdateCategoryRequest
  }

  // 列表出现 mdi 图标时再加载图标库，避免无谓的大文件下载
  watch(
    () => data.value,
    (list) => {
      if (mdiReady.value) return
      if ((list as Category[]).some((item) => item.icon?.startsWith('mdi:'))) {
        loadMdiIcons()
          .then(() => (mdiReady.value = true))
          .catch(() => {})
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    void loadCategories()
  })
</script>

<style scoped>
  .muted {
    color: var(--el-text-color-placeholder);
  }
</style>
