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
                v-permission="'ai-agent:prompt:classify:query'"
                v-ripple
                type="success"
                :icon="Expand"
                @click="handleJumpClassify"
              >
                分组管理
              </ElButton>
              <ElButton
                v-permission="'ai-agent:prompt:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增提示词</ElButton
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
              :disabled="!$hasPermission('ai-agent:prompt:update')"
              inline-prompt
              :inactive-value="0"
              :active-value="1"
              active-text="启用"
              inactive-text="禁用"
              :before-change="handleUpdateStatus(row)"
            />
          </template>
          <template #logo="{ row }">
            <ElAvatar shape="square" :size="60" :src="$rurl(row.logo)"></ElAvatar>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加提示词' : '编辑提示词'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="600px"
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
  import { ElMessageBox } from 'element-plus'
  import { Edit, Plus, Expand } from '@element-plus/icons-vue'
  import { CreatePrompt, DeletePrompt, ListPrompt, ListPromptClassify, UpdatePrompt } from '@/api/ai-agent/prompt/api'
  import { CreatePromptRequest, Prompt, PromptClassify, UpdatePromptRequest } from '@/api/ai-agent/prompt/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { ListModel } from '@/api/ai-agent/model/api'
  import { Model } from '@/api/ai-agent/model/type'

  const router = useRouter()

  defineOptions({ name: 'Prompt' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Prompt>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const classifies = ref<PromptClassify[]>([])
  const listClassify = (name?: string) => {
    ListPromptClassify({ page: 1, pageSize: 10, name: name }).then((res) => {
      classifies.value = res.list
    })
  }
  listClassify()

  const currentModel = ref<Model>({} as Model)
  const models = ref<Model[]>([])
  const listModel = (name?: string) => {
    ListModel({ page: 1, pageSize: 10, name: name }).then((res) => {
      const list: Model[] = []
      res.list.forEach((model) => {
        list.push({
          id: model.id,
          name: model.keyword + '（' + model.description + '）',
          type: model.type
        } as Model)
      })
      models.value = list
    })
  }

  const searchItems = reactive([
    {
      label: '分类',
      key: 'classifyId',
      type: 'select',
      props: {
        placeholder: '请输入所属分类',
        options: classifies,
        rules: [{ required: true, message: '请选择所属分类', trigger: ['blur', 'change'] }],
        props: {
          label: 'name',
          value: 'id'
        },
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          listClassify(query.length > 0 ? query : undefined)
        }
      }
    },
    {
      label: '模型',
      key: 'modelId',
      type: 'select',
      props: {
        placeholder: '请输入所属模型',
        options: models,
        rules: [{ required: true, message: '请选择所属模型', trigger: ['blur', 'change'] }],
        props: {
          label: 'name',
          value: 'id'
        },
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          listModel(query.length > 0 ? query : undefined)
        }
      }
    },
    {
      label: '标题',
      key: 'title',
      type: 'input',
      props: {
        placeholder: '请输入提示词标题',
        clearable: true
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改提示词',
      color: 'warning',
      permission: 'ai-agent:prompt:update',
      click: async (record: Prompt) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除提示词',
      color: 'danger',
      permission: 'ai-agent:prompt:delete',
      click: async (record: Prompt) => {
        await DeletePrompt({ id: record.id })
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
      apiFn: ListPrompt,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'uuid',
          label: '提示词标识'
        },
        {
          prop: 'title',
          label: '提示词标题'
        },
        {
          prop: 'classify.name',
          label: '提示词分组'
        },
        {
          prop: 'status',
          label: '提示词状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Prompt) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Prompt) => formatTime(row.updatedAt)
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
      key: 'classifyId',
      label: '提示词分类',
      type: 'select',
      span: 12,
      props: {
        placeholder: '请选择所属分类',
        options: classifies.value,
        rules: [{ required: true, message: '请选择所属分类', trigger: ['blur', 'change'] }],
        props: {
          label: 'name',
          value: 'id'
        },
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          listClassify(query.length > 0 ? query : undefined)
        }
      }
    },
    {
      key: 'modelId',
      label: '提示词模型',
      type: 'select',
      span: 12,
      props: {
        placeholder: '请选择所属模型',
        rules: [{ required: true, message: '请选择所属模型', trigger: ['blur', 'change'] }],
        options: models.value,
        props: {
          label: 'name',
          value: 'id'
        },
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          listModel(query.length > 0 ? query : undefined)
        },
        onChange: (id: number) => {
          currentModel.value = models.value.find((item) => item.id === id) as Model
        }
      }
    },
    {
      key: 'uuid',
      label: '提示词标识',
      type: 'input',
      props: {
        placeholder: '请输入提示词标识',
        disabled: dialogType.value === 'edit',
        rules: [
          { required: true, message: '请输入提示词标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '提示词标识格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_-]*$/ }
        ]
      }
    },
    {
      key: 'title',
      label: '提示词标题',
      type: 'input',
      props: {
        placeholder: '请输入提示词标题',
        rules: [{ required: true, message: '请输入提示词标题', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '提示词描述',
      type: 'input',
      props: {
        type: 'textarea',
        placeholder: '请输入描述信息',
        rules: [{ required: true, message: '请输入描述信息', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'system',
      label: '提示词人设',
      type: 'code',
      props: {
        showFullscreen: true,
        style: {
          width: '100%',
          height: '200px'
        },
        lang: 'markdown',
        placeholder: '请输入描述信息',
        rules: [{ required: false, message: '请输入描述信息', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'prompt',
      label: '提示词模板',
      type: 'code',
      props: {
        showFullscreen: true,
        style: {
          width: '100%',
          height: '200px'
        },
        lang: 'markdown',
        placeholder: '请输入提示词',
        rules: [{ required: true, message: '请输入提示词', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'extraObject.topP',
      label: '多样性',
      type: 'slider',
      tip: '影响输出文本的多样性，取值越大，生成文本的多样性越强。建议该参数和temperature只设置1个。0:不设置',
      span: 12,
      hidden: currentModel.value.type !== 'chat',
      defaultValue: 0,
      props: {
        rules: [{ required: true, message: '请选择是否使用JSON格式化输出', trigger: ['blur', 'change'] }],
        step: 0.1,
        max: 1,
        min: 0,
        showStops: true
      }
    },
    {
      key: 'extraObject.temperature',
      label: '温度',
      type: 'slider',
      tip: '较高的数值会使输出更加随机，而较低的数值会使其更加集中和确定。建议该参数和top_p只设置1个。0:不设置',
      span: 12,
      hidden: currentModel.value.type !== 'chat',
      defaultValue: 0,
      props: {
        rules: [{ required: true, message: '请选择是否使用JSON格式化输出', trigger: ['blur', 'change'] }],
        step: 0.1,
        max: 1,
        min: 0,
        showStops: true
      }
    },
    {
      key: 'extraObject.size',
      label: '图片尺寸',
      type: 'input',
      tip: '图片尺寸（1024x1024）',
      span: 12,
      hidden: currentModel.value.type !== 'image',
      defaultValue: '1024x1024',
      props: {
        rules: [
          {
            required: true,
            message: '请输入图片尺寸（1024x1024）,最小尺寸512，最大尺寸2048',
            trigger: ['blur', 'change']
          }
        ],
        step: 0.1,
        max: 1,
        min: 0,
        showStops: true
      }
    },
    {
      key: 'extraObject.path',
      label: '存储路径',
      type: 'input',
      tip: '资源中心存储路径',
      span: 12,
      hidden: currentModel.value.type !== 'image',
      defaultValue: '/ai-agent/prompt/image',
      props: {
        rules: [{ required: true, message: '请输入资源存储路径', trigger: ['blur', 'change'] }],
        step: 0.1,
        max: 1,
        min: 0,
        showStops: true
      }
    },
    {
      key: 'extraObject.store',
      label: '存储设施',
      type: 'input',
      tip: '资源中心存储设施',
      span: 12,
      hidden: currentModel.value.type !== 'image',
      defaultValue: 'local',
      props: {
        rules: [{ required: true, message: '请输入资源存储设施', trigger: ['blur', 'change'] }],
        step: 0.1,
        max: 1,
        min: 0,
        showStops: true
      }
    },
    {
      key: 'extraObject.formatJson',
      label: '格式化输出',
      type: 'select',
      tip: '内容以JSON格式输出',
      hidden: currentModel.value.type !== 'chat',
      props: {
        placeholder: '请选择是否使用JSON格式化输出',
        rules: [{ required: true, message: '请选择是否使用JSON格式化输出', trigger: ['blur', 'change'] }],
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    },
    {
      key: 'extraObject.outputSchema',
      label: '输出schema',
      type: 'code',
      hidden: !currentData.value.extraObject.formatJson,
      props: {
        showFullscreen: true,
        style: {
          width: '100%',
          height: '200px'
        },
        placeholder: '请输入输出schema',
        rules: [{ required: true, message: '请输入输出schema', trigger: ['blur', 'change'] }]
      }
    }
  ])

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: Prompt): void => {
    dialogType.value = type
    currentData.value = row || {}
    if (row) {
      currentData.value.extraObject = JSON.parse(row.extra || '{}')

      // 初始化模型选项
      models.value.push({
        id: row.model.id,
        name: row.model.keyword + '（' + row.model.description + '）',
        type: row.model.type
      } as Model)

      // 初始化类型选项
      classifies.value.push({
        id: row.classify.id,
        name: row.classify.name
      } as PromptClassify)
    } else {
      currentData.value.extraObject = {}
    }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = { ...currentData.value }
    value.extra = JSON.stringify(currentData.value.extraObject)
    if (dialogType.value === 'add') {
      await CreatePrompt(value as CreatePromptRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdatePrompt(value as UpdatePromptRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: Prompt): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改提示词状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdatePrompt({ id: item.id, status: item.status ? 0 : 1 } as UpdatePromptRequest)
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

  const handleJumpClassify = () => {
    router.push({ name: 'AIAgentPromptClassify' })
  }
</script>
