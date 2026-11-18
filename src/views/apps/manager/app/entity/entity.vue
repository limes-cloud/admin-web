<template>
  <div class="art-full-height cuetom-table">
    <ElCard class="art-table-card" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-box">
        <ElInput v-model="searchForm.keyword" placeholder="请输入实体名称" @input="handleSearch" clearable />
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
              <ElTooltip :content="row.database">
                <span>{{ row.comment }}（{{ row.name }}）</span>
              </ElTooltip>
            </div>
            <div>
              <ArtOperation :single="true" :list="operationItems" :data="row">
                <i class="iconfont-sys" v-html="'&#xe6df;'"></i>
              </ArtOperation>
            </div>
          </div>
        </template>
      </ArtTable>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加实体' : '编辑实体'"
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
          @cancel="dialogVisible = false"
          @submit="handleSubmit"
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

    :deep(tr.el-table__row--striped td.el-table__cell) {
      background: none;
    }

    :deep(.active .el-table__cell) {
      color: var(--el-color-primary);
      background: var(--el-fill-color-light) !important;
      border-radius: 4px;
    }

    :deep(td.el-table__cell:hover) {
      background: var(--el-fill-color-light) !important;
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

  :deep(.import-dialog) {
    height: calc(100vh - 400px);
    padding: 0 0 15px !important;
  }

  .import-box {
    display: flex;
    flex-direction: row;
    height: 100%;
    overflow: hidden;

    .import-left,
    .import-right {
      overflow-y: scroll;
    }

    .import-right {
      flex: 1;
    }
  }
</style>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElInput } from 'element-plus'
  import { Edit, Delete } from '@element-plus/icons-vue'
  import { DeleteEntity, ListEntity, UpdateEntity } from '@/api/manager/entity/api'
  import { Entity, UpdateEntityRequest } from '@/api/manager/entity/type'

  const props = defineProps<{ app: string }>()

  const emit = defineEmits<{ select: [data: any] }>()
  defineOptions({ name: 'Entity' })

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Entity>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined
  })

  const formItems = computed(() => {
    const isEdit = dialogType.value === 'edit'
    return [
      {
        key: 'database',
        label: '数据库',
        type: 'input',
        props: {
          placeholder: '请输入数据库',
          disabled: isEdit,
          rules: [
            { required: true, message: '请输入数据库', trigger: ['blur', 'change'] },
            { type: 'string', message: '数据库格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
          ]
        }
      },
      {
        key: 'name',
        label: '实体名称',
        type: 'input',
        props: {
          placeholder: '请输入实体名称',
          disabled: isEdit,
          rules: [{ required: true, message: '请输入实体名称', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'comment',
        label: '实体描述',
        type: 'input',
        props: {
          placeholder: '请输入实体描述',
          rules: [{ required: true, message: '请输入实体描述', trigger: ['blur', 'change'] }],
          type: 'textarea'
        }
      }
    ]
  })

  const operationItems = [
    {
      icon: Edit,
      label: '修改实体',
      color: 'warning',
      permission: 'manager:entity:update',
      click: async (record: Entity) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除实体',
      color: 'danger',
      permission: 'manager:entity:delete',
      click: async (record: Entity) => {
        await DeleteEntity({ id: record.id })
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
    refreshUpdate,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListEntity,
      apiParams: {
        page: 1,
        pageSize: 10,
        app: props.app,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'keyword',
          label: '实体标识',
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
  const showDialog = (type: Form.DialogType, row?: Entity): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    await UpdateEntity(currentData.value as UpdateEntityRequest)
    ElMessage.success('修改成功')
    refreshUpdate()
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
