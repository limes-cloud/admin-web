<template>
  <div class="art-full-height cuetom-table">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <!-- 搜索栏 -->
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
        <!-- 表格头部 -->
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton
                v-permission="'manager:entity:field:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增字段</ElButton
              >
            </ElSpace>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :show-pagination="false"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加字段' : '编辑字段'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="380px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="24"
          :show-button="false"
          @cancel="dialogVisible = false"
          @submit="handleSubmit"
        ></ArtForm>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import { CreateEntityField, DeleteEntityField, ListEntityField, UpdateEntityField } from '@/api/manager/entity/api'
  import { CreateEntityFieldRequest, EntityField, UpdateEntityFieldRequest } from '@/api/manager/entity/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  const props = defineProps<{ entityId: number; appId: number }>()

  defineOptions({ name: 'EntityField' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<EntityField>>({})

  // 搜索表单
  const searchForm = ref({
    entityId: props.entityId,
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '字段名称',
      key: 'name',
      type: 'input',
      props: {
        placeholder: '请输入字段名称',
        clearable: true
      }
    }
  ]

  const formItems = [
    {
      key: 'name',
      label: '字段名称',
      type: 'input',
      props: {
        placeholder: '请输入字段名称',
        rules: [
          { required: true, message: '请输入字段名称', trigger: ['blur', 'change'] },
          { type: 'string', message: '字段名称格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
        ]
      }
    },
    {
      key: 'comment',
      label: '字段备注',
      type: 'input',
      props: {
        placeholder: '请输入标识',
        rules: [{ required: true, message: '请输入标识', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'index',
      label: '字段排序',
      type: 'number',
      defaultField: 0,
      props: {
        placeholder: '请输入字段排序',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入字段排序', trigger: ['blur', 'change'] }]
      }
    }
  ]

  const operationItems = [
    {
      icon: Edit,
      label: '修改字段',
      color: 'warning',
      permission: 'manager:entity:field:update',
      click: async (record: EntityField) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除字段',
      color: 'danger',
      permission: 'manager:entity:field:delete',
      click: async (record: EntityField) => {
        await DeleteEntityField({ id: record.id })
        refreshRemove()
      }
    }
  ]

  const {
    columns,
    columnChecks,
    data,
    loading,
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
    // 核心配置
    core: {
      apiFn: ListEntityField,
      immediate: false,
      excludeParams: ['page', 'pageSize'],
      apiParams: {
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'name',
          label: '字段名称'
        },
        {
          prop: 'comment',
          label: '字段备注'
        },
        {
          prop: 'index',
          label: '字段排序'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: EntityField) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: EntityField) => formatTime(row.updatedAt)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          useSlot: true,
          slotName: 'operation'
        }
      ]
    }
  })

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: EntityField): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = { ...currentData.value }
    if (dialogType.value === 'add') {
      await CreateEntityField({ ...value, entityId: props.entityId } as CreateEntityFieldRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateEntityField({ ...value, entityId: props.entityId } as UpdateEntityFieldRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  watch(
    () => props.entityId,
    async () => {
      if (props.entityId === 0) return

      Object.assign(searchParams, {
        entityId: props.entityId,
        keyword: undefined,
        name: undefined,
        status: undefined
      })
      await getData()

      searchForm.value = {
        entityId: props.entityId
      } as any
    },
    { immediate: true }
  )
</script>
