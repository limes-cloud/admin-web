<template>
  <div class="art-full-height cuetom-table">
    <ElCard class="art-table-card" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-box">
        <ElInput v-model="searchForm.keyword" placeholder="请输入实体名称" @input="handleSearch" clearable />
        <ElButton
          v-permission="'manager:entity:add'"
          type="primary"
          class="btn-square"
          :icon="Plus"
          @click="showDialog('add')"
        ></ElButton>
        <ElButton
          v-permission="'manager:entity:load'"
          type="success"
          class="btn-square"
          :icon="Sort"
          @click="handleLoad"
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

    <ElDialog
      v-model="importVisible"
      title="导入数据预览"
      :destroy-on-close="true"
      body-class="import-dialog"
      width="620px"
      align-center
    >
      <div class="import-box cuetom-table">
        <div class="import-left">
          <ElTable :data="loadEntities" :show-header="false" :stripe="false" :row-class-name="importTableRowClassName">
            <el-table-column prop="name" label="Date" width="180">
              <template #default="{ row, $index }">
                <div class="dict-item">
                  <div class="item-content" @click="handleSelectEntity($index)">
                    <ElTooltip :content="row.database">
                      <span>{{ row.comment }}（{{ row.name }}）</span>
                    </ElTooltip>
                  </div>
                  <div @click="handleDeleteEntity($index)">
                    <ElIcon><Delete /></ElIcon>
                  </div>
                </div>
              </template>
            </el-table-column>
          </ElTable>
        </div>
        <div class="import-right">
          <ElTable :data="loadEntities[currentEntityIndex].fields" :show-header="false">
            <el-table-column prop="name">
              <template #default="{ row, $index }">
                <div class="dict-item">
                  <div class="item-content">
                    <ElSpace>
                      <ElInput v-model="row.name"></ElInput>
                      <ElInput v-model="row.comment"></ElInput>
                    </ElSpace>
                  </div>
                  <div @click="handleDeleteField($index)">
                    <ElIcon><Delete /></ElIcon>
                  </div>
                </div>
              </template>
            </el-table-column>
          </ElTable>
        </div>
      </div>

      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImport"> 确认 </el-button>
      </template>
    </ElDialog>
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
  import { ElInput, ElMessageBox } from 'element-plus'
  import { Edit, Plus, Sort, Delete } from '@element-plus/icons-vue'
  import {
    CreateEntity,
    DeleteEntity,
    ImportEntity,
    ListEntity,
    LoadEntity,
    UpdateEntity
  } from '@/api/manager/entity/api'
  import {
    CreateEntityRequest,
    Entity,
    LoadEntity as LoadEntityType,
    UpdateEntityRequest
  } from '@/api/manager/entity/type'
  import { GetApp } from '@/api/manager/app/api'

  const props = defineProps<{ appId: number }>()

  const emit = defineEmits<{ select: [data: any] }>()
  defineOptions({ name: 'Entity' })

  // 弹窗相关
  const importVisible = ref(false)
  const loadEntities = ref<LoadEntityType[]>([])
  const currentEntityIndex = ref(0)

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Entity>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined
  })

  const formItems = [
    {
      key: 'database',
      label: '数据库',
      type: 'input',
      props: {
        placeholder: '请输入数据库',
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
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListEntity,
      apiParams: {
        page: 1,
        pageSize: 10,
        appId: props.appId,
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
    const value = { ...currentData.value }
    if (dialogType.value === 'add') {
      await CreateEntity({ ...value, appId: props.appId } as CreateEntityRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateEntity(value as UpdateEntityRequest)
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

  const importTableRowClassName = (data: { row: any; rowIndex: number }) => {
    return data.rowIndex === currentEntityIndex.value ? 'active' : ''
  }

  const tableRowClassName = ({ row }: { row: any }) => {
    return row.id === currentSelectId.value ? 'active' : ''
  }

  const handleLoad = async () => {
    const confirm = () => {
      return new Promise<void>((reslove, reject) => {
        ElMessageBox.confirm(`您确认要载入应用实体数据么？载入不会影响增量数据，相同字段会同步更新`, '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            reslove()
          })
          .catch(() => {
            reject()
          })
      })
    }

    // 等待用户确定
    await confirm()

    // 获取当前app信息
    const data = await GetApp({ id: props.appId })

    const lf = await LoadEntity({ app: data.keyword })
    loadEntities.value = lf.list
    // setLoadEntityIndex(loadEntities.value)
    currentEntityIndex.value = 0

    importVisible.value = true
  }

  const handleSelectEntity = (index: number) => {
    currentEntityIndex.value = index
  }

  const handleDeleteField = (index: number) => {
    loadEntities.value[currentEntityIndex.value].fields.splice(index, 1)
  }

  const handleDeleteEntity = (index: number) => {
    loadEntities.value.splice(index, 1)
  }

  const handleImport = async () => {
    await ImportEntity({ list: loadEntities.value, appId: props.appId })
    ElMessage.success('导入成功')
    importVisible.value = false
  }
</script>
