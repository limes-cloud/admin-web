<template>
  <div class="art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      ref="searchBarRef"
      v-model="searchForm"
      :card="true"
      :items="searchItems"
      @search="handleSearch"
      @reset="resetSearchParams"
    >
    </ArtSearchBar>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')">新增分类</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
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

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加分类' : '编辑分类'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="420px"
        align-center
      >
        <ArtForm
          ref="form"
          :items="formItems"
          :span="24"
          :show-button="false"
          :value="currentData"
          @submit="handleSubmit"
        ></ArtForm>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit"> 确认 </el-button>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import { CreateDeptClassify, DeleteDeptClassify, ListDeptClassify, UpdateDeptClassify } from '@/api/manager/dept/api'
  import { CreateDeptClassifyRequest, DeptClassify, UpdateDeptClassifyRequest } from '@/api/manager/dept/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'DeptClassify' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<DeptClassify>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '分类名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入分类名称',
      clearable: true,
      props: { maxlength: '32' }
    }
  ]

  const form = useTemplateRef('form')
  const formItems = [
    {
      key: 'name',
      label: '分类名称',
      type: 'input',
      placeholder: '请输入分类名称',
      props: {
        rules: [{ required: true, message: '请输入分类名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '分类描述',
      type: 'input',
      placeholder: '请输入分类描述',
      props: {
        rules: [{ required: true, message: '请输入分类描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    },
    {
      key: 'weight',
      label: '租户权重',
      type: 'number',
      placeholder: '请输入租户权重',
      props: {
        defaultValue: 0,
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入租户描述', trigger: ['blur', 'change'] }]
      }
    }
  ]

  const operationItems = [
    {
      icon: Edit,
      label: '修改分类',
      color: 'warning',
      permission: 'manager:dept:update',
      click: async (record: DeptClassify) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除分类',
      color: 'danger',
      permission: 'manager:dept:delete',
      click: async (record: DeptClassify) => {
        await DeleteDeptClassify({ id: record.id })
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
      apiFn: ListDeptClassify,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          type: 'index',
          width: '60',
          label: '#'
        },
        {
          prop: 'name',
          label: '分类名称'
        },
        {
          prop: 'description',
          label: '分类描述'
        },
        {
          prop: 'weight',
          label: '分类权重'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: DeptClassify) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: DeptClassify) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: DeptClassify): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const res = await form.value?.validate()
    if (!res) {
      return
    }
    const value = form.value?.getValue()
    if (dialogType.value === 'add') {
      await CreateDeptClassify(value as CreateDeptClassifyRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateDeptClassify(value as UpdateDeptClassifyRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }
</script>
