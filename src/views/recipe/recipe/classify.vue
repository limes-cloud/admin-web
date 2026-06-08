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
                v-permission="'recipe:recipe:classify:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增分类</ElButton
              >
            </ElSpace>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #logo="{ row }">
            <el-image style="width: 60px; height: 60px" :src="$rurl(row.logo)" fit="fill" />
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

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
  import {
    CreateRecipeClassify,
    DeleteRecipeClassify,
    ListRecipeClassify,
    UpdateRecipeClassify
  } from '@/api/recipe/recipe/api'
  import { CreateRecipeClassifyRequest, RecipeClassify, UpdateRecipeClassifyRequest } from '@/api/recipe/recipe/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { loadingService } from '@/utils/ui/loading'
  import { GeneratePromptImage } from '@/api/ai-agent/generate/api'

  defineOptions({ name: 'RecipeClassify' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<RecipeClassify>>({})

  // 搜索表单
  const searchForm = ref({
    name: undefined
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

  const formItems = computed(() => [
    {
      key: 'parentId',
      label: '上级分类',
      type: 'treeselect',
      placeholder: '请选择上级分类',
      props: {
        placeholder: '请选择上级分类',
        data: [{ id: 0, name: '顶级菜单', children: data.value }],
        checkStrictly: true,
        rules: [{ required: true, message: '请选择上级分类', trigger: ['blur', 'change'] }],
        props: {
          label: 'name',
          value: 'id'
        }
      }
    },
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
      key: 'logo',
      label: '分类图标',
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
              prompt: 'recipe-logo',
              variables: {
                query: currentData.value.name
              }
            })
            currentData.value.logo = data.list[0]
          }, '正在生成中，请稍等')
        }
      },
      props: {
        multiple: false,
        cut: { enable: true },
        limit: 1,
        size: 120,
        placeholder: '请选择分类图标',
        accept: 'image',
        directoryPath: '/recipe/recipe/logo'
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改分类',
      color: 'warning',
      permission: 'recipe:recipe:update',
      click: async (record: RecipeClassify) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除分类',
      color: 'danger',
      permission: 'recipe:recipe:delete',
      click: async (record: RecipeClassify) => {
        await DeleteRecipeClassify({ id: record.id })
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
      apiFn: ListRecipeClassify,
      apiParams: {
        ...searchForm.value
      },
      excludeParams: ['page', 'pageSize'],
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
          prop: 'logo',
          label: '分类图标',
          slotName: 'logo',
          useSlot: true
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: RecipeClassify) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: RecipeClassify) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: RecipeClassify): void => {
    dialogType.value = type
    currentData.value = { ...row }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = { ...currentData.value }
    if (dialogType.value === 'add') {
      await CreateRecipeClassify(value as CreateRecipeClassifyRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateRecipeClassify(value as UpdateRecipeClassifyRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }
</script>
