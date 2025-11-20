<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtBack></ArtBack>

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
                v-permission="'manager:appfield:add'"
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
          <template #required="{ row }">
            <el-switch
              v-model="row.required"
              :disabled="!$hasPermission('manager:appfield:update')"
              inline-prompt
              active-text="是"
              inactive-text="否"
              :before-change="handleUpdateRequired(row)"
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
          ref="form"
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
  import { Plus } from '@element-plus/icons-vue'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { ListField, ListFieldType } from '@/api/manager/field/api'
  import { CreateAppField, DeleteAppField, ListAppField, UpdateAppField } from '@/api/manager/appfield/api'
  import { CreateAppFieldRequest, AppField } from '@/api/manager/appfield/type'
  import { Field, FieldType } from '@/api/manager/field/type'
  import { ElMessageBox } from 'element-plus'

  defineOptions({ name: 'AppField' })

  const router = useRouter()
  const appId = Number(router.currentRoute.value.query.appId)

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<AppField>>({})

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
      props: { maxlength: '32', placeholder: '请输入字段名称', clearable: true }
    }
  ]

  const types = ref<FieldType[]>([])
  ListFieldType().then((res) => {
    types.value = res.list
  })

  const fields = ref<Field[]>([])
  ListField({ page: 1, pageSize: 10 }).then((res) => {
    fields.value = res.list
  })

  const formItems = computed(() => [
    {
      key: 'fieldId',
      label: '绑定字段',
      type: 'select',
      props: {
        placeholder: '请选择绑定的字段',
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length < 1) return
          ListField({ page: 1, pageSize: 10, name: query }).then((res) => {
            fields.value = res.list
          })
        },
        options: fields.value,
        props: {
          value: 'id',
          label: 'name'
        },
        rules: [{ required: true, message: '请选择绑定的字段', trigger: ['blur', 'change'] }]
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
    }
  ])

  const operationItems = [
    {
      icon: Delete,
      popConfirm: true,
      label: '删除字段',
      color: 'danger',
      permission: 'manager:appfield:delete',
      click: async (record: AppField) => {
        await DeleteAppField({ id: record.id })
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
      apiFn: ListAppField,
      apiParams: {
        page: 1,
        pageSize: 10,
        appId: appId,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          type: 'index',
          width: '60',
          label: '#'
        },
        {
          prop: 'field.type',
          label: '字段类型',
          formatter: (row: AppField) => {
            const type = types.value.find((item) => item.type === row.field.type)
            return type?.name || row.field.type
          }
        },
        {
          prop: 'field.keyword',
          label: '字段标识'
        },
        {
          prop: 'field.name',
          label: '字段名称'
        },
        {
          prop: 'required',
          label: '是否必填',
          useSlot: true,
          slotName: 'required'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: AppField) => formatTime(row.createdAt)
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
  const showDialog = (type: Form.DialogType, row?: AppField): void => {
    dialogType.value = type
    currentData.value = { appId: appId, ...row }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = { ...currentData.value }
    await CreateAppField(value as CreateAppFieldRequest)
    ElMessage.success('创建成功')
    refreshCreate()
    dialogVisible.value = false
  }

  const handleUpdateRequired = (item: AppField): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改字段必填状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateAppField({ id: item.id, required: !item.required })
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
