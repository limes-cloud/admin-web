<template>
  <div class="art-full-height">
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
                v-permission="'manager:field:add'"
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
          :pagination="pagination"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #status="{ row }">
            <el-switch
              v-model="row.status"
              :disabled="!$hasPermission('manager:field:update')"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
              :before-change="handleUpdateStatus(row)"
            />
          </template>
          <template #required="{ row }">
            <el-switch
              v-model="row.required"
              :disabled="!$hasPermission('manager:field:update')"
              inline-prompt
              active-text="是"
              inactive-text="否"
              :before-change="handleUpdateRequired(row)"
            />
          </template>

          <template #unique="{ row }">
            <el-switch
              v-model="row.unique"
              :disabled="!$hasPermission('manager:field:update')"
              inline-prompt
              active-text="是"
              inactive-text="否"
              :before-change="handleUpdateUnique(row)"
            />
          </template>
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

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElMessageBox } from 'element-plus'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import { CreateField, DeleteField, ListField, ListFieldType, UpdateField } from '@/api/manager/field/api'
  import { CreateFieldRequest, Field, FieldType, UpdateFieldRequest } from '@/api/manager/field/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { ListCurrentDept } from '@/api/manager/dept/api'
  import { Dept } from '@/api/manager/dept/type'

  defineOptions({ name: 'Field' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Field>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '字段标识',
      key: 'keyword',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入字段标识', clearable: true }
    },
    {
      label: '字段名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入字段名称',
      clearable: true,
      props: { maxlength: '32', placeholder: '请输入字段名称', clearable: true }
    },
    {
      label: '字段状态',
      key: 'status',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '请选择字段状态',
        options: [
          { label: '正常', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ]

  const types = ref<FieldType[]>([])
  ListFieldType().then((res) => {
    types.value = res.list
  })

  const depts = ref<Dept[]>([])
  ListCurrentDept().then((res) => {
    depts.value = res.list
  })

  const formItems = computed(() => [
    {
      key: 'type',
      label: '字段类型',
      type: 'select',
      props: {
        placeholder: '请选择字段类型',
        options: types.value,
        rules: [{ required: true, message: '请选择字段类型', trigger: ['blur', 'change'] }],
        props: {
          label: 'name',
          value: 'type'
        }
      }
    },
    {
      key: 'keyword',
      label: '字段标识',
      type: 'input',
      props: {
        placeholder: '请输入字段标识',
        rules: [
          { required: true, message: '请输入字段标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '字段标识格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
        ]
      }
    },
    {
      key: 'name',
      label: '字段名称',
      type: 'input',
      props: {
        placeholder: '请输入字段名称',
        rules: [{ required: true, message: '请输入字段名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'required',
      label: '是否必填',
      type: 'select',
      props: {
        placeholder: '请选择是否必填',
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ],
        rules: [{ required: true, message: '请选择是否必填', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'unique',
      label: '值唯一性',
      type: 'select',
      props: {
        placeholder: '请选择是否值唯一性',
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ],
        rules: [{ required: true, message: '请选择值唯一性', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '字段描述',
      type: 'input',
      props: {
        placeholder: '请输入字段描述',
        rules: [{ required: true, message: '请输入字段描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改字段',
      color: 'warning',
      permission: 'manager:field:update',
      click: async (record: Field) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除字段',
      color: 'danger',
      permission: 'manager:field:delete',
      click: async (record: Field) => {
        await DeleteField({ id: record.id })
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
      apiFn: ListField,
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
          prop: 'type',
          label: '字段类型',
          formatter: (row: Field) => {
            const type = types.value.find((item) => item.type === row.type)
            return type?.name || row.type
          }
        },
        {
          prop: 'keyword',
          label: '字段标识'
        },
        {
          prop: 'name',
          label: '字段名称'
        },
        {
          prop: 'status',
          label: '字段状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'required',
          label: '必填状态',
          useSlot: true,
          slotName: 'required'
        },
        {
          prop: 'unique',
          label: '值唯一性',
          useSlot: true,
          slotName: 'unique'
        },
        {
          prop: 'description',
          label: '字段描述'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Field) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Field) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: Field): void => {
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
      await CreateField(value as CreateFieldRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateField(value as UpdateFieldRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: Field): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改字段状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateField({ id: item.id, status: !item.status })
            ElMessage.success('修改成功')
            refreshUpdate()
            resolve(true)
          })
          .catch(() => {
            resolve(false)
          })
      })
    }
  }

  const handleUpdateRequired = (item: Field): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改字段必填状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateField({ id: item.id, required: !item.required })
            ElMessage.success('修改成功')
            refreshUpdate()
            resolve(true)
          })
          .catch(() => {
            resolve(false)
          })
      })
    }
  }

  const handleUpdateUnique = (item: Field): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改字段唯一性值状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateField({ id: item.id, unique: !item.unique })
            ElMessage.success('修改成功')
            refreshUpdate()
            resolve(true)
          })
          .catch(() => {
            resolve(false)
          })
      })
    }
  }
</script>
