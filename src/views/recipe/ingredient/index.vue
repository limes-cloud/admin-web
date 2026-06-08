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
                v-permission="'recipe:ingredient:classify:query'"
                v-ripple
                type="success"
                :icon="Expand"
                @click="handleJumpClassify"
              >
                食材分类
              </ElButton>
              <ElButton
                v-permission="'recipe:ingredient:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增食材</ElButton
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
          <template #image="{ row }">
            <ElImage shape="square" :size="60" :src="$rurl(row.image, 100, 100)"></ElImage>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加食材' : '编辑食材'"
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
  import { Edit, Plus, Expand } from '@element-plus/icons-vue'
  import {
    CreateIngredient,
    DeleteIngredient,
    ListIngredient,
    ListIngredientClassify,
    UpdateIngredient
  } from '@/api/recipe/ingredient/api'
  import {
    CreateIngredientRequest,
    Ingredient,
    IngredientClassify,
    UpdateIngredientRequest
  } from '@/api/recipe/ingredient/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { loadingService } from '@/utils'
  import { GeneratePromptImage, GeneratePromptText } from '@/api/ai-agent/generate/api'

  const router = useRouter()

  defineOptions({ name: 'Ingredient' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Ingredient>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const classifies = ref<IngredientClassify[]>([])
  const listClassify = (name?: string) => {
    ListIngredientClassify({ page: 1, pageSize: 10, name: name }).then((res) => {
      classifies.value = res.list
    })
  }
  listClassify()

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
      label: '标题',
      key: 'title',
      type: 'input',
      props: {
        placeholder: '请输入食材标题',
        clearable: true
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改食材',
      color: 'warning',
      permission: 'recipe:ingredient:update',
      click: async (record: Ingredient) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除食材',
      color: 'danger',
      permission: 'recipe:ingredient:delete',
      click: async (record: Ingredient) => {
        await DeleteIngredient({ id: record.id })
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
      apiFn: ListIngredient,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'name',
          label: '食材名称'
        },
        {
          prop: 'image',
          label: '食材图片',
          useSlot: true,
          slotName: 'image'
        },
        {
          prop: 'classify.name',
          label: '食材分组'
        },

        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Ingredient) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Ingredient) => formatTime(row.updatedAt)
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
      label: '食材分类',
      type: 'select',
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
      key: 'name',
      label: '食材名称',
      type: 'input',
      props: {
        placeholder: '请输入食材名称',
        rules: [{ required: true, message: '请输入食材名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'image',
      label: '食材图片',
      type: 'upload',
      suffix: {
        hidden: !currentData.value.name,
        icon: 'iconsys-mofa',
        tip: 'AI自动生成图片',
        style: {
          color: '#9a6ce6'
        },
        // 生产图片
        onclick: () => {
          loadingService.apply(async () => {
            const data = await GeneratePromptImage({
              prompt: 'recipe-ingredient-image',
              variables: {
                query: currentData.value.name
              }
            })
            currentData.value.image = data.list[0]
          }, '正在生成中，请稍等')
        }
      },
      props: {
        multiple: false,
        cut: { enable: true },
        limit: 1,
        size: 180,
        placeholder: '请选择食材图片',
        accept: 'image',
        directoryPath: '/recipe/ingredient/image'
      }
    },
    {
      key: 'extraObject.summary',
      label: '食材简介',
      type: 'input',
      suffix: {
        hidden: !currentData.value.name,
        icon: 'iconsys-mofa',
        tip: 'AI自动生成简介内容',
        style: {
          color: '#9a6ce6'
        },
        // 生产图片
        onclick: () => {
          loadingService.apply(async () => {
            const data = await GeneratePromptText({
              prompt: 'recipe-ingredient',
              variables: {
                query: currentData.value.name
              }
            })
            currentData.value.extraObject = data.format
          }, '正在生成中，请稍等')
        }
      },
      props: {
        type: 'textarea',
        placeholder: '请输入食材简介',
        rules: [{ required: true, message: '请输入食材简介', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'extraObject.benefit',
      label: '食材功效',
      type: 'input',
      props: {
        type: 'textarea',
        placeholder: '请输入食材功效',
        rules: [{ required: true, message: '请输入食材功效', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'extraObject.tip',
      label: '注意事项',
      type: 'input',
      props: {
        type: 'textarea',
        placeholder: '请输入注意事项',
        rules: [{ required: true, message: '请输入注意事项', trigger: ['blur', 'change'] }]
      }
    }
  ])

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: Ingredient): void => {
    dialogType.value = type
    currentData.value = row || {}
    if (row) {
      currentData.value.extraObject = JSON.parse(row.extra || '{}')

      // 初始化类型选项
      classifies.value.push({
        id: row.classify.id,
        name: row.classify.name
      } as IngredientClassify)
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
      await CreateIngredient(value as CreateIngredientRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateIngredient(value as UpdateIngredientRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleJumpClassify = () => {
    router.push({ name: 'RecipeIngredientClassify' })
  }
</script>
