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
                v-permission="'ai-agent:model:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增模型</ElButton
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
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加模型' : '编辑模型'"
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

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import { CreateModel, DeleteModel, ListModel, ListModelType, UpdateModel } from '@/api/ai-agent/model/api'
  import { CreateModelRequest, Model, UpdateModelRequest } from '@/api/ai-agent/model/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { ListSecretGroup } from '@/api/ai-agent/secret/api'
  import { SecretGroup } from '@/api/ai-agent/secret/type'

  defineOptions({ name: 'Model' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Model>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const groups = ref<SecretGroup[]>([])
  const listGroup = (name?: string) => {
    ListSecretGroup({ page: 1, pageSize: 10, name: name }).then((res) => {
      groups.value = res.list
    })
  }

  const types = ref<{ value: string; label: string }[]>([])
  const typeLabels: Record<string, string> = {
    embedding: '向量模型',
    chat: '聊天模型',
    image: '图片模型',
    video: '视频模型'
  }
  const getTypes = () => {
    ListModelType().then((res) => {
      types.value = res.list.map((type) => ({ value: type, label: typeLabels[type] }))
    })
  }
  getTypes()

  const searchItems = computed(() => [
    {
      label: '密钥分组',
      key: 'secretGroupId',
      type: 'select',
      props: {
        placeholder: '请输入密钥分组',
        options: groups.value,
        rules: [{ required: true, message: '请选择密钥分组', trigger: ['blur', 'change'] }],
        props: {
          label: 'name',
          value: 'id'
        },
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          listGroup(query.length > 0 ? query : undefined)
        }
      }
    },
    {
      label: '模型类型',
      key: 'type',
      type: 'select',
      props: {
        placeholder: '请输入模型类型',
        options: types.value,
        rules: [{ required: true, message: '请选择模型类型', trigger: ['blur', 'change'] }]
      }
    },
    {
      label: '模型状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择模型状态',
        clearable: true,
        options: [
          { label: '正常', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改模型',
      color: 'warning',
      permission: 'ai-agent:model:update',
      click: async (record: Model) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除模型',
      color: 'danger',
      permission: 'ai-agent:model:delete',
      click: async (record: Model) => {
        await DeleteModel({ id: record.id })
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
    pagination,
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
      apiFn: ListModel,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'uuid',
          label: '模型标识'
        },
        {
          prop: 'keyword',
          label: '模型名称'
        },
        {
          prop: 'secretGroup.name',
          label: '密钥分组'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Model) => formatTime(row.createdAt)
        },
        {
          prop: 'description',
          label: '模型描述'
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Model) => formatTime(row.updatedAt)
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

  const formItems = computed(() => [
    {
      label: '使用密钥',
      key: 'secretGroupId',
      type: 'select',
      props: {
        placeholder: '请选择的使用密钥',
        options: groups.value,
        rules: [{ required: true, message: '请选择的使用密钥', trigger: ['blur', 'change'] }],
        props: {
          label: 'name',
          value: 'id'
        },
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          listGroup(query.length > 0 ? query : undefined)
        }
      }
    },
    {
      key: 'type',
      label: '模型类型',
      type: 'select',
      props: {
        placeholder: '请选择模型分组',
        options: types.value,
        rules: [{ required: true, message: '请选择模型类型', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'uuid',
      label: '模型标识',
      type: 'input',
      suffixTip: '业务方调用时使用的标识',
      props: {
        placeholder: '请输入模型标识',
        rules: [
          { required: true, message: '请输入模型标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '模型标识格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_-]*$/ }
        ]
      }
    },
    {
      key: 'keyword',
      label: '模型名称',
      type: 'input',
      props: {
        placeholder: '请输入模型名称',
        rules: [{ required: true, message: '请输入模型名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '模型描述',
      type: 'input',
      props: {
        placeholder: '请输入模型描述',
        rules: [{ required: true, message: '请输入模型描述', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'extraObject.supportJson',
      label: '支持Json',
      type: 'select',
      hidden: currentData.value.type !== 'chat',
      suffixTip: '会对本身不支持JSON格式化的模型注入提示词，使得模型可以支持JSON格式化。',
      props: {
        placeholder: '请选择是否支持Json',
        rules: [{ required: false, message: '请选择是否支持Json', trigger: ['blur', 'change'] }],
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    },
    {
      key: 'extraObject.supportTool',
      label: '支持工具',
      type: 'select',
      hidden: currentData.value.type !== 'chat',
      props: {
        placeholder: '请选择是否支持工具',
        rules: [{ required: false, message: '请选择是否支持工具', trigger: ['blur', 'change'] }],
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    }
  ])

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: Model): void => {
    dialogType.value = type
    currentData.value = row || {}
    if (row) {
      groups.value.push(row?.secretGroup as SecretGroup)
    }
    try {
      currentData.value.extraObject = JSON.parse(row?.extra || '{}')
    } catch {
      currentData.value.extraObject = {}
    }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = { ...currentData.value }
    value.extra = JSON.stringify(value.extraObject || {})
    if (dialogType.value === 'add') {
      await CreateModel(value as CreateModelRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateModel(value as UpdateModelRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }
</script>
