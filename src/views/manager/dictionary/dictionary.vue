<template>
  <div class="art-full-height cuetom-table">
    <ElCard class="art-table-card" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-box">
        <ElInput v-model="searchForm.keyword" placeholder="请输入标识" @input="handleSearch" clearable />
        <ElButton
          v-permission="'manager:dictionary:add'"
          type="primary"
          class="btn-square"
          :icon="Plus"
          @click="showDialog('add')"
        ></ElButton>
      </div>

      <!-- 表格 -->
      <ArtTable
        :show-header="false"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        :paginationOptions="{
          layout: 'prev, pager, next'
        }"
        :row-class-name="tableRowClassName"
        row-key="id"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #keyword="{ row }">
          <div class="dict-item">
            <div class="item-content" @click="handleSelect(row)">
              <ElTooltip :content="row.description">
                <span>{{ row.keyword }}（{{ row.name }}）</span>
              </ElTooltip>
            </div>
            <div>
              <ArtOperation :list="operationItems" :data="row">
                <i class="iconfont-sys" v-html="'&#xe6df;'"></i>
              </ArtOperation>
            </div>
          </div>
        </template>
      </ArtTable>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加字典' : '编辑字典'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="420px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="24"
          :show-button="false"
          @submit="handleSubmit"
          @cancel="dialogVisible = false"
        ></ArtForm>
      </ElDialog>
    </ElCard>
  </div>
</template>
<style lang="scss" scoped>
  .search-box {
    display: flex;
    justify-content: space-between;

    .btn-square {
      margin-left: 6px;
    }
  }

  .cuetom-table {
    :deep(.el-table__row) {
      margin-bottom: 5px;
    }

    :deep(.active .el-table__cell) {
      color: var(--el-color-primary);
      background: var(--el-fill-color-light) !important;
      border-radius: 4px;
    }

    :deep(td.el-table__cell) {
      background: none !important;
    }

    :deep(.el-table__cell) {
      border: none !important;
    }
  }

  .dict-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    .item-content {
      flex: 1;
    }
  }
</style>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElInput } from 'element-plus'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import { CreateDictionary, DeleteDictionary, ListDictionary, UpdateDictionary } from '@/api/manager/dictionary/api'
  import { CreateDictionaryRequest, Dictionary, UpdateDictionaryRequest } from '@/api/manager/dictionary/type'
  import { Delete } from '@element-plus/icons-vue'

  const emit = defineEmits<{ select: [data: any] }>()
  defineOptions({ name: 'Dictionary' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Dictionary>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined
  })

  const formItems = computed(() => [
    {
      key: 'type',
      label: '字典类型',
      type: 'select',
      props: {
        placeholder: '请选择字典类型',
        options: [
          { label: '树状字典', value: 'tree' },
          { label: '列表字典', value: 'list' }
        ],
        rules: [{ required: true, message: '请选择字典类型', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'keyword',
      label: '字典标识',
      type: 'input',
      props: {
        placeholder: '请输入字典标识',
        disabled: dialogType.value === 'edit',
        rules: [
          { required: true, message: '请输入字典标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '字典标识格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
        ]
      }
    },
    {
      key: 'name',
      label: '字典名称',
      type: 'input',
      props: {
        placeholder: '请输入字典名称',
        rules: [{ required: true, message: '请输入字典名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '字典描述',
      type: 'input',
      props: {
        placeholder: '请输入字典描述',
        rules: [{ required: true, message: '请输入字典描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改字典',
      color: 'warning',
      permission: 'manager:dictionary:update',
      click: async (record: Dictionary) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除字典',
      color: 'danger',
      permission: 'manager:dictionary:delete',
      click: async (record: Dictionary) => {
        await DeleteDictionary({ id: record.id })
        refreshRemove()
      }
    }
  ]

  const {
    columns,
    data,
    loading,
    pagination,
    searchParams,
    getData,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListDictionary,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'keyword',
          label: '字典标识',
          useSlot: true,
          slotName: 'keyword'
        }
      ]
    },
    hooks: {
      onSuccess: (list: any[]) => {
        if (list.length > 0) {
          currentSelectId.value = list[0].id
          emit('select', list[0])
        }
      }
    }
  })

  // 搜索处理
  const handleSearch = () => {
    if (!searchForm.value.keyword) {
      searchForm.value.keyword = undefined
      resetSearchParams()
    }
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: Dictionary): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = currentData.value
    if (dialogType.value === 'add') {
      await CreateDictionary(value as CreateDictionaryRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateDictionary(value as UpdateDictionaryRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const currentSelectId = ref(0)
  const handleSelect = (row: any) => {
    if (row.id === currentSelectId.value) {
      return
    }
    currentSelectId.value = row.id
    emit('select', row)
  }

  const tableRowClassName = ({ row }: { row: any }) => {
    return row.id === currentSelectId.value ? 'active' : ''
  }
</script>
