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
                v-permission="'manager:dictionary:value:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
              >
                新增字典值
              </ElButton>
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
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
              :before-change="handleUpdateStatus(row)"
            />
          </template>
          <template #logo="{ row }">
            <ElAvatar shape="square" :size="60" :src="$rurl(row.logo)"></ElAvatar>
          </template>
          <template #favicon="{ row }">
            <ElAvatar shape="square" :size="60" :src="$rurl(row.favicon)"></ElAvatar>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加字典值' : '编辑字典值'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="420px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="24"
          @submit="handleSubmit"
          @cancel="dialogVisible = false"
        ></ArtForm>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElMessageBox } from 'element-plus'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import {
    CreateDictionaryValue,
    DeleteDictionaryValue,
    ListDictionaryValue,
    UpdateDictionaryValue
  } from '@/api/manager/dictionary/api'
  import {
    CreateDictionaryValueRequest,
    DictionaryValue,
    UpdateDictionaryValueRequest
  } from '@/api/manager/dictionary/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  const props = defineProps<{ dictionaryId: number; type: string }>()

  defineOptions({ name: 'DictionaryValue' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<DictionaryValue>>({})

  // 搜索表单
  const searchForm = ref({
    dictionaryId: props.dictionaryId,
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '标识',
      key: 'keyword',
      type: 'input',
      placeholder: '请输入标识',
      hidden: props.type == 'tree',
      props: { maxlength: '32', placeholder: '请输入标识', clearable: true }
    },
    {
      label: '名称',
      key: 'name',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入名称', clearable: true }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '正常', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ]

  const formItems = computed(() => [
    {
      key: 'label',
      label: '标签',
      type: 'input',
      props: {
        placeholder: '请输入标签',
        rules: [
          { required: true, message: '请输入标签', trigger: ['blur', 'change'] },
          { type: 'string', message: '标签格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
        ]
      }
    },
    {
      key: 'value',
      label: '标识',
      type: 'input',
      props: {
        placeholder: '请输入标识',
        rules: [{ required: true, message: '请输入标识', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'type',
      label: '类型',
      type: 'input',
      props: {
        placeholder: '请输入类型',
        rules: [{ required: true, message: '请输入类型', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '描述',
      type: 'input',
      props: {
        placeholder: '请输入描述',
        rules: [{ required: true, message: '请输入描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    },
    {
      key: 'extra',
      label: '扩展',
      type: 'input',
      props: {
        placeholder: '请输入扩展',
        rules: [{ required: true, message: '请输入扩展', trigger: ['blur', 'change'] }],
        type: 'input'
      }
    },
    {
      key: 'weight',
      label: '权重',
      type: 'number',
      defaultValue: 0,
      props: {
        placeholder: '请输入权重',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入权重', trigger: ['blur', 'change'] }]
      }
    }
  ])

  const operationItems = [
    {
      icon: Plus,
      label: '新建字典值',
      color: 'primary',
      permission: 'manager:dictionary:value:add',
      click: async (record: DictionaryValue) => {
        showDialog('add', { parentId: record.id } as DictionaryValue)
      }
    },
    {
      icon: Edit,
      label: '修改字典值',
      color: 'warning',
      permission: 'manager:dictionary:value:update',
      click: async (record: DictionaryValue) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除字典值',
      color: 'danger',
      permission: 'manager:dictionary:delete',
      click: async (record: DictionaryValue) => {
        await DeleteDictionaryValue({ id: record.id })
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
      apiFn: ListDictionaryValue,
      immediate: false,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'label',
          label: '标签'
        },
        {
          prop: 'value',
          label: '标识'
        },
        {
          prop: 'type',
          label: '类型'
        },
        {
          prop: 'weight',
          label: '权重'
        },
        {
          prop: 'status',
          label: '状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'description',
          label: '描述'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: DictionaryValue) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: DictionaryValue) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: DictionaryValue): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateDictionaryValue({
        ...currentData.value,
        dictionaryId: props.dictionaryId
      } as CreateDictionaryValueRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateDictionaryValue({
        ...currentData.value,
        dictionaryId: props.dictionaryId
      } as UpdateDictionaryValueRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: DictionaryValue): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改字典值状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateDictionaryValue({ ...item, status: !item.status })
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

  watch(
    () => props.dictionaryId,
    async () => {
      if (props.dictionaryId === 0) return

      Object.assign(searchParams, {
        dictionaryId: props.dictionaryId,
        keyword: undefined,
        name: undefined,
        status: undefined
      })
      await getData()

      searchForm.value = {
        dictionaryId: props.dictionaryId
      } as any
    },
    { immediate: true }
  )
</script>
