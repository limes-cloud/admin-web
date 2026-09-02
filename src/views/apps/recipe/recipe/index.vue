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
                v-permission="'recipe:recipe:classify:query'"
                v-ripple
                type="success"
                :icon="Expand"
                @click="handleJumpClassify"
              >
                菜谱分类
              </ElButton>
              <ElButton
                v-permission="'recipe:recipe:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增菜谱</ElButton
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
        :title="dialogType === 'add' ? '添加菜谱' : '编辑菜谱'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="580px"
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
  import { CreateRecipe, DeleteRecipe, ListRecipe, ListRecipeClassify, UpdateRecipe } from '@/api/recipe/recipe/api'
  import { CreateRecipeRequest, Recipe, RecipeClassify, UpdateRecipeRequest } from '@/api/recipe/recipe/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { loadingService } from '@/utils'
  import { GeneratePromptImage, GeneratePromptText } from '@/api/ai-agent/generate/api'

  const router = useRouter()

  defineOptions({ name: 'Recipe' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Recipe>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const classifies = ref<RecipeClassify[]>([])
  const listClassify = (name?: string) => {
    ListRecipeClassify({ name: name }).then((res) => {
      classifies.value = res.list
    })
  }
  listClassify()

  const searchItems = computed(() => [
    {
      label: '菜谱分类',
      key: 'classifyId',
      type: 'treeselect',
      props: {
        placeholder: '请选择菜谱分类',
        data: classifies.value,
        rules: [{ required: true, message: '请选择菜谱分类', trigger: ['blur', 'change'] }],
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
      label: '菜谱名称',
      key: 'name',
      type: 'input',
      props: {
        placeholder: '请输入菜谱名称',
        clearable: true
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改菜谱',
      color: 'warning',
      permission: 'recipe:recipe:update',
      click: async (record: Recipe) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除菜谱',
      color: 'danger',
      permission: 'recipe:recipe:delete',
      click: async (record: Recipe) => {
        await DeleteRecipe({ id: record.id })
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
      apiFn: ListRecipe,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'name',
          label: '菜谱名称'
        },
        {
          prop: 'image',
          label: '菜谱图片',
          useSlot: true,
          slotName: 'image'
        },
        {
          prop: 'classify.name',
          label: '菜谱分组'
        },

        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Recipe) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Recipe) => formatTime(row.updatedAt)
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
    [
      {
        label: '菜谱分类',
        key: 'classifyId',
        type: 'treeselect',
        props: {
          placeholder: '请选择菜谱分类',
          data: classifies.value,
          rules: [{ required: true, message: '请选择菜谱分类', trigger: ['blur', 'change'] }],
          props: {
            label: 'name',
            value: 'id'
          },
          multiple: true,
          filterable: true,
          remote: true,
          remoteMethod: (query: string) => {
            listClassify(query.length > 0 ? query : undefined)
          }
        }
      },
      {
        key: 'name',
        label: '菜谱名称',
        type: 'input',
        props: {
          placeholder: '请输入菜谱名称',
          rules: [{ required: true, message: '请输入菜谱名称', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'description',
        label: '菜谱简介',
        type: 'input',
        props: {
          type: 'textarea',
          placeholder: '请输入菜谱简介',
          rules: [{ required: true, message: '请输入菜谱简介', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'imageArr',
        label: '菜谱图片',
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
            if (currentData.value.imageArr && currentData.value.imageArr.length >= 3) {
              ElMessage.error('最多只能选择3张图片')
              return
            }
            loadingService.apply(async () => {
              const data = await GeneratePromptImage({
                prompt: 'recipe-image',
                variables: {
                  query: currentData.value.name
                }
              })
              currentData.value.imageArr?.push(data.list[0])
            }, '正在生成中，请稍等')
          }
        },
        props: {
          multiple: true,
          cut: { enable: true },
          limit: 3,
          size: 120,
          placeholder: '请选择菜谱图片',
          accept: 'image',
          directoryPath: '/recipe/recipe/image',
          rules: [{ required: true, message: '请选择菜谱图片', trigger: ['blur', 'change'] }]
        }
      }
    ],
    [
      {
        key: 'name1',
        label: '菜谱名称',
        type: 'input',
        props: {
          placeholder: '请输入菜谱名称',
          rules: [{ required: true, message: '请输入菜谱名称', trigger: ['blur', 'change'] }]
        }
      }
    ]
  ])

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: Recipe): void => {
    dialogType.value = type
    currentData.value = row || {}
    if (row) {
      currentData.value.extraObject = JSON.parse(row.extra || '{}')

      // 初始化类型选项
      classifies.value.push({
        id: row.classify.id,
        name: row.classify.name
      } as RecipeClassify)
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
      await CreateRecipe(value as CreateRecipeRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateRecipe(value as UpdateRecipeRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleJumpClassify = () => {
    router.push({ name: 'RecipeClassify' })
  }
</script>
