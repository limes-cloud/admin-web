<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="resetSearchParams"
        />
      </div>

      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')"> 新增资源 </ElButton>
              <ElButton v-ripple :icon="Refresh" @click="loadCategories">刷新分类</ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #cover="{ row }">
            <ElImage
              v-if="row.cover"
              class="res-cover"
              :src="$rurl(row.cover)"
              fit="cover"
              :preview-src-list="[$rurl(row.cover)]"
              preview-teleported
            />
            <span v-else class="muted">无封面</span>
          </template>
          <template #title="{ row }">
            <div class="res-title">
              <b>{{ row.title }}</b>
              <small>{{ row.summary || '-' }}</small>
            </div>
          </template>
          <template #status="{ row }">
            <ElSwitch
              :model-value="row.status === 1"
              inline-prompt
              active-text="上架"
              inactive-text="下架"
              :before-change="handleToggleStatus(row)"
            />
          </template>
          <template #isBanner="{ row }">
            <ElTag :type="row.isBanner ? 'success' : 'info'" effect="light" size="small">
              {{ row.isBanner ? '是' : '否' }}
            </ElTag>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems(row)" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增资源' : '编辑资源'"
        class="resource-dialog"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="600px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="12"
          label-width="96px"
          @submit="handleSubmit"
          @cancel="dialogVisible = false"
        />
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Delete, Edit, HomeFilled, Plus, Refresh } from '@element-plus/icons-vue'

  import { useTable } from '@/composables/useTable'
  import {
    CreateResource,
    DeleteResource,
    ListResources,
    UpdateResource,
    UpdateResourceBanner,
    UpdateResourceStatus
  } from '@/api/psou/resource/api'
  import type { CreateResourceRequest, Resource, UpdateResourceRequest } from '@/api/psou/resource/type'
  import { GeneratePromptText } from '@/api/ai-agent/generate/api'
  import { loadingService } from '@/utils'
  import { formatTime } from '@/utils/time'
  import { useCategoryOptions } from '../useCategoryOptions'

  defineOptions({ name: 'PsouResource' })

  interface ResourceForm extends Partial<Resource> {
    tagsArray?: string[]
  }

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<ResourceForm>({})

  const { loadCategories, categoryMap, channelMap, categoryOptions } = useCategoryOptions()

  const currentCategoryLabel = computed(() => {
    const category = categoryMap.value.get(Number(currentData.value.categoryId))
    if (!category) return ''
    const channel = channelMap.value.get(category.parentId)?.name
    return channel ? `${channel} / ${category.name}` : category.name
  })

  const canGenerateMetadata = computed(() => !!currentData.value.title?.trim() && !!currentData.value.categoryId)
  const metadataTip = computed(() =>
    canGenerateMetadata.value ? 'AI 生成摘要、详情、标签和评分' : '请先填写资源标题并选择所属分类'
  )

  const handleGenerateMetadata = () => {
    const title = String(currentData.value.title || '').trim()
    const category = currentCategoryLabel.value
    if (!title || !category) {
      ElMessage.warning('请先填写资源标题并选择所属分类')
      return
    }

    loadingService.apply(async () => {
      const data = await GeneratePromptText(
        {
          prompt: 'psou-resource-metadata',
          variables: { title, category }
        },
        'psou'
      )
      const result = data.format || {}
      if (typeof result.title === 'string' && result.title.trim()) {
        currentData.value.title = result.title.trim()
      }
      const summary = typeof result.summary === 'string' ? result.summary.trim() : ''
      if (summary) currentData.value.summary = summary

      const description = typeof result.description === 'string' ? result.description.trim() : ''
      if (description) currentData.value.description = description

      const tags = Array.isArray(result.tags)
        ? result.tags.map((tag) => String(tag).replace(/^#+/, '').trim()).filter(Boolean)
        : []
      if (tags.length) currentData.value.tagsArray = tags

      const score = Number(result.score)
      const hasScore = Number.isFinite(score)
      if (hasScore) {
        currentData.value.score = Math.min(10, Math.max(0, Math.round(score * 10) / 10))
      }

      const confidence = Number(result.confidence)
      if (!summary || !description || !tags.length || !hasScore) {
        ElMessage.warning('生成结果不完整，请重试或手动补充')
      } else if (Number.isFinite(confidence) && confidence < 0.7) {
        ElMessage.warning('AI 置信度较低，请核对生成内容后再保存')
      } else {
        ElMessage.success('资源信息已生成，请核对后保存')
      }
    }, 'AI 正在生成资源信息，请稍等')
  }

  const statusOptions = [
    { label: '下架', value: 0 },
    { label: '上架', value: 1 }
  ]

  const searchForm = ref({
    keyword: undefined as string | undefined,
    categoryId: undefined as number | undefined,
    status: undefined as number | undefined,
    isBanner: undefined as boolean | undefined
  })

  const searchItems = computed(() => [
    {
      label: '资源标题',
      key: 'keyword',
      type: 'input',
      props: { placeholder: '请输入资源标题', clearable: true, maxlength: 255 }
    },
    {
      label: '所属分类',
      key: 'categoryId',
      type: 'select',
      props: {
        placeholder: '请选择二级分类',
        clearable: true,
        filterable: true,
        options: categoryOptions.value
      }
    },
    {
      label: '资源状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择资源状态',
        clearable: true,
        options: statusOptions
      }
    },
    {
      label: '是否横幅',
      key: 'isBanner',
      type: 'select',
      props: {
        placeholder: '请选择是否横幅',
        clearable: true,
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    }
  ])

  const formItems = computed(() => {
    return [
      {
        key: 'categoryId',
        span: 24,
        label: '所属分类',
        type: 'select',
        props: {
          placeholder: '请选择二级分类',
          filterable: true,
          options: categoryOptions.value,
          style: { width: '100%' },
          rules: [{ required: true, message: '请选择二级分类', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'title',
        span: 24,
        label: '资源标题',
        type: 'input',
        props: {
          placeholder: '请输入资源标题',
          maxlength: 255,
          rules: [{ required: true, message: '请输入资源标题', trigger: ['blur', 'change'] }]
        },
        suffix: {
          hidden: false,
          icon: 'iconsys-mofa',
          tip: metadataTip.value,
          style: { color: '#9a6ce6', opacity: canGenerateMetadata.value ? '1' : '0.45' },
          onclick: handleGenerateMetadata
        }
      },
      {
        key: 'cover',
        span: 24,
        label: '封面图片',
        type: 'upload',
        props: {
          class: 'resource-cover-upload',
          accept: 'image/*',
          directoryPath: 'psou/resource/cover',
          limit: 1,
          width: '100%',
          height: '266px',
          selectFromFile: true,
          cut: { enable: true, width: 640, height: 360 },
          rules: [{ required: true, message: '请上传封面图片', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'summary',
        span: 24,
        label: '资源摘要',
        type: 'input',
        props: {
          type: 'textarea',
          rows: 2,
          maxlength: 512,
          placeholder: '请输入一句话摘要',
          rules: [{ required: true, message: '请输入资源摘要', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'description',
        span: 24,
        label: '资源详情',
        type: 'input',
        props: {
          type: 'textarea',
          rows: 5,
          maxlength: 20000,
          placeholder: '请输入资源详情简介',
          rules: [{ required: true, message: '请输入资源详情', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'tagsArray',
        span: 24,
        label: '资源标签',
        type: 'inputtag',
        props: {
          placeholder: '输入标签后回车',
          maxlength: 64,
          rules: [
            {
              type: 'array',
              required: true,
              min: 1,
              message: '请至少添加一个资源标签',
              trigger: ['blur', 'change']
            }
          ]
        }
      },
      {
        key: 'score',
        label: '资源评分',
        type: 'number',
        props: {
          min: 0,
          max: 10,
          step: 0.1,
          precision: 1,
          align: 'left',
          controlsPosition: 'right',
          placeholder: '0.0 ~ 10.0',
          style: { width: '100%' },
          rules: [{ type: 'number', required: true, message: '请输入资源评分', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'weight',
        label: '排序权重',
        type: 'number',
        defaultValue: 0,
        props: {
          min: -999999,
          max: 999999,
          align: 'left',
          controlsPosition: 'right',
          style: { width: '100%' }
        }
      },
      {
        key: 'status',
        span: 24,
        label: '资源状态',
        type: 'select',
        // 新资源没有可用副本，只能先保存为下架
        hidden: dialogType.value === 'add',
        props: {
          options: statusOptions,
          rules: [{ required: true, message: '请选择资源状态', trigger: ['blur', 'change'] }]
        }
      }
    ]
  })

  const operationItems = (row: Resource) => {
    return [
      {
        icon: HomeFilled,
        label: row.isBanner ? '取消轮播' : '设为轮播',
        color: row.isBanner ? 'info' : 'success',
        popConfirm: true,
        popTitle: `确定${row.isBanner ? '取消' : '设为'}「${row.title}」轮播吗？`,
        click: (record: Resource) => handleToggleBanner(record)
      },
      {
        icon: Edit,
        label: '编辑资源',
        color: 'warning',
        click: (record: Resource) => showDialog('edit', record)
      },
      {
        icon: Delete,
        popConfirm: true,
        label: '删除资源',
        color: 'danger',
        click: async (record: Resource) => {
          await DeleteResource({ id: record.id })
          refreshRemove()
        }
      }
    ]
  }

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
    core: {
      apiFn: ListResources,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'cover',
          label: '封面图片',
          width: 110,
          useSlot: true,
          slotName: 'cover'
        },
        {
          prop: 'title',
          label: '资源标题',
          minWidth: 240,
          useSlot: true,
          slotName: 'title'
        },
        {
          prop: 'categoryId',
          label: '所属分类',
          minWidth: 160,
          formatter: (row: Resource) => {
            const category = categoryMap.value.get(row.categoryId)
            if (!category) return `#${row.categoryId}`
            const channel = channelMap.value.get(category.parentId)?.name
            return channel ? `${channel} / ${category.name}` : category.name
          }
        },
        {
          prop: 'score',
          label: '资源评分',
          width: 90,
          formatter: (row: Resource) => (row.score == null ? '-' : Number(row.score).toFixed(1))
        },
        {
          prop: 'status',
          label: '资源状态',
          width: 100,
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'isBanner',
          label: '是否横幅',
          width: 110,
          useSlot: true,
          slotName: 'isBanner'
        },
        {
          prop: 'viewCount',
          label: '浏览转存',
          width: 130,
          formatter: (row: Resource) => `${row.viewCount} / ${row.transferCount}`
        },
        {
          prop: 'weight',
          label: '排序权重',
          width: 100
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          width: 170,
          formatter: (row: Resource) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '更新时间',
          width: 170,
          formatter: (row: Resource) => formatTime(row.updatedAt)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 110,
          fixed: 'right',
          useSlot: true,
          slotName: 'operation'
        }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const parseTags = (raw?: string): string[] => {
    if (!raw) return []
    try {
      const tags = JSON.parse(raw)
      return Array.isArray(tags) ? tags.map((tag) => String(tag)) : []
    } catch {
      return []
    }
  }

  const showDialog = (type: Form.DialogType, row?: Resource) => {
    dialogType.value = type
    if (type === 'add') {
      currentData.value = {
        categoryId: categoryOptions.value[0]?.value,
        status: 0,
        weight: 0,
        tagsArray: []
      }
    } else if (row) {
      currentData.value = {
        ...row,
        score: row.score ?? undefined,
        tagsArray: parseTags(row.tags)
      }
    }
    dialogVisible.value = true
  }

  const buildPayload = () => {
    const item = currentData.value
    const score = typeof item.score === 'number' && Number.isFinite(item.score) ? item.score : undefined
    return {
      title: String(item.title || '').trim(),
      summary: String(item.summary || '').trim(),
      description: String(item.description || ''),
      categoryId: Number(item.categoryId),
      tags: JSON.stringify(item.tagsArray || []),
      ...(score === undefined ? {} : { score }),
      cover: String(item.cover || '').trim(),
      weight: Number(item.weight) || 0,
      status: Number(item.status) || 0
    }
  }

  const handleSubmit = async () => {
    const payload = buildPayload()
    if (dialogType.value === 'add') {
      await CreateResource(payload as CreateResourceRequest)
      ElMessage.success('创建成功，请继续添加网盘副本后再上架')
      refreshCreate()
    } else {
      await UpdateResource({ id: Number(currentData.value.id), ...payload } as UpdateResourceRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleToggleStatus = (row: Resource): (() => Promise<boolean>) => {
    return async () => {
      const next = row.status === 1 ? 0 : 1
      try {
        await ElMessageBox.confirm(`确定${next === 1 ? '上架' : '下架'}「${row.title}」吗？`, '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await UpdateResourceStatus({ id: row.id, status: next })
        ElMessage.success('修改成功')
        refreshData()
        return true
      } catch {
        return false
      }
    }
  }

  const handleToggleBanner = async (row: Resource) => {
    const next = !row.isBanner
    await UpdateResourceBanner({ id: row.id, isBanner: next })
    ElMessage.success(next ? '已设为轮播' : '已取消轮播')
    refreshData()
  }

  onMounted(loadCategories)
</script>

<style scoped>
  .res-cover {
    width: 84px;
    height: 48px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  :deep(.resource-cover-upload .el-upload-list--picture-card) {
    display: flex;
    width: 100%;
  }

  :global(.resource-dialog) {
    display: flex;
    flex-direction: column;
    height: 500px;
    overflow: hidden;
  }

  :global(.resource-dialog .el-dialog__body) {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .res-title {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .res-title b {
    overflow: hidden;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .res-title small {
    overflow: hidden;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .muted {
    color: var(--el-text-color-placeholder);
  }
</style>
