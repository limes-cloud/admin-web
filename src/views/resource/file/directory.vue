<template>
  <div class="art-full-height cuetom-table">
    <ElCard class="art-table-card" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-box">
        <ElInput v-model="searchForm.name" placeholder="请输入目录名称" @input="handleSearch" clearable />
        <ElButton
          v-permission="'resource:directory:add'"
          type="primary"
          class="btn-square"
          :icon="Plus"
          @click="showDialog('add')"
        >
        </ElButton>
      </div>

      <!-- 表格 -->
      <ArtTable
        :show-header="false"
        :loading="loading"
        :data="data"
        :columns="columns"
        :row-class-name="tableRowClassName"
        row-key="id"
      >
        <template #keyword="{ row }">
          <div class="dict-item">
            <div class="item-content" @click="handleSelect(row)">
              <img class="item-icon" src="@/assets/img/icon/directory.png" mode="scaleToFill" />
              <span> {{ row.name }}</span>
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
        :title="dialogType === 'add' ? '添加目录' : '编辑目录'"
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
          label-position="top"
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

    :deep(.cell) {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: center;
    }
  }

  .dict-item {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    .item-content {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: flex-start;

      .item-icon {
        width: 24px;
        height: 24px;
        margin-right: 6px;
      }
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
  import { Edit, Plus, Delete } from '@element-plus/icons-vue'
  import { CreateDirectory, DeleteDirectory, ListDirectory, UpdateDirectory } from '@/api/resource/directory/api'
  import { CreateDirectoryRequest, Directory, UpdateDirectoryRequest } from '@/api/resource/directory/type'
  import { isArray } from 'lodash'

  const emit = defineEmits<{ select: [data: any] }>()
  defineOptions({ name: 'Directory' })

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Directory>>({})

  // 搜索表单
  const searchForm = ref({
    name: undefined
  })

  const formItems = [
    {
      key: 'name',
      label: '目录名称',
      type: 'input',
      props: {
        placeholder: '请输入目录名称',
        rules: [{ required: true, message: '请输入目录名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'accept',
      label: '允许格式',
      type: 'inputtag',
      tip: '允许上传的文件格式后缀（回车添加多个）',
      props: {
        placeholder: '请输入允许格式',
        rules: [{ required: true, message: '请输入允许格式', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'maxSize',
      label: '最大阈值',
      type: 'number',
      tip: '允许上传的文件最大大小（单位：MB）',
      props: {
        placeholder: '请允许最大阈值',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入请允许最大阈值', trigger: ['blur', 'change'] }]
      }
    }
  ]

  const operationItems = [
    {
      icon: Edit,
      label: '修改目录',
      color: 'warning',
      permission: 'resource:directory:update',
      click: async (record: Directory) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除目录',
      color: 'danger',
      permission: 'resource:directory:delete',
      click: async (record: Directory) => {
        await DeleteDirectory({ id: record.id })
        refreshRemove()
      }
    }
  ]

  const {
    columns,
    data,
    loading,
    searchParams,
    getData,
    resetSearchParams,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListDirectory,
      apiParams: {
        ...searchForm.value
      },
      excludeParams: ['page', 'pageSize'],
      columnsFactory: () => [
        {
          prop: 'keyword',
          label: '目录标识',
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
    if (!searchForm.value.name) {
      searchForm.value.name = undefined
      resetSearchParams()
    }
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: Directory): void => {
    dialogType.value = type
    currentData.value = row || {}
    if (!isArray(currentData.value.accept)) {
      currentData.value.accept = (currentData.value.accept as string).split(',')
    }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = { ...currentData.value }
    if (isArray(value.accept)) {
      value.accept = (value.accept as string[]).join(',')
    }
    if (dialogType.value === 'add') {
      await CreateDirectory(value as CreateDirectoryRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateDirectory(value as UpdateDirectoryRequest)
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
