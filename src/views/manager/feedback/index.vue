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
              <ElButton v-ripple type="success" :icon="Expand" @click="handleJumpClassify">类型管理</ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          row-key="id"
          :pagination="pagination"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #user="{ row }">
            <div>{{ row.user?.nickname }}（{{ row.user?.username }}）</div>
          </template>
          <template #status="{ row }">
            <ElTag :type="statusText[row.status].type">{{ statusText[row.status].label }}</ElTag>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        title="处理问题"
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

      <ElDialog
        v-model="moreVisible"
        title="问题详情"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="620px"
        align-center
      >
        <ElSpace class="space" direction="vertical" size="small" alignment="center">
          <ElDescriptions title="基础信息" :column="3" border>
            <ElDescriptionsItem :span="1" label="问题分类">{{ currentData?.classify?.name }}</ElDescriptionsItem>
            <ElDescriptionsItem :span="1" label="所属应用">{{ currentData?.app?.name }}</ElDescriptionsItem>
            <ElDescriptionsItem :span="1" label="反馈用户">
              {{ currentData?.user?.nickname + '(' + currentData?.user?.username + ')' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem :span="1" label="联系方法">
              {{ currentData?.contact ? currentData?.contact : '暂无' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem :span="1" label="使用渠道">
              {{ getPlatformName(currentData?.platform) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem :span="1" label="应用版本">{{ currentData?.version }}</ElDescriptionsItem>
          </ElDescriptions>
          <div class="hr-line"></div>

          <ElDescriptions title="设备信息" :column="3" border>
            <ElDescriptionsItem :span="1" label="浏览器">
              {{ currentData?.deviceInfo?.browserName + '（' + currentData?.deviceInfo?.browserVersion + '）' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem :span="1" label="设备类型">
              {{ currentData?.deviceInfo?.deviceType }}
            </ElDescriptionsItem>
            <ElDescriptionsItem :span="1" label="操作系统">
              {{ currentData?.deviceInfo?.platform + '（' + currentData?.deviceInfo?.system + '）' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem :span="1" label="屏幕信息">
              {{ currentData?.deviceInfo?.screenWidth + ' x ' + currentData?.deviceInfo?.screenHeight }}（
              {{ currentData?.deviceInfo?.orientation == 'portrait' ? '竖屏' : '横屏' }}）
            </ElDescriptionsItem>
            <ElDescriptionsItem :span="2" label="用户代理">{{ currentData?.deviceInfo?.userAgent }}</ElDescriptionsItem>
          </ElDescriptions>
          <div class="hr-line"></div>

          <ElDescriptions title="反馈信息" :column="1" border>
            <ElDescriptionsItem :span="2" label="反馈标题">{{ currentData?.title }}</ElDescriptionsItem>
            <ElDescriptionsItem :span="2" label="反馈标题">{{ currentData?.title }}</ElDescriptionsItem>
            <ElDescriptionsItem :span="2" label="反馈内容">{{ currentData?.content }}</ElDescriptionsItem>
            <ElDescriptionsItem :span="2" label="反馈截图">
              <ElSpace>
                <template v-for="(url, index) in currentData?.imageUrls" :key="index">
                  <ElImage width="100" :src="$rurl(url, 100, 100)" :preview-src-list="[$rurl(url)]" />
                </template>
              </ElSpace>
              <ElEmpty v-if="!currentData?.imageUrls?.length" :image-size="48" description="未上传截图" />
            </ElDescriptionsItem>
            <ElDescriptionsItem :span="2" label="反馈时间">{{ formatTime(currentData?.createdAt) }}</ElDescriptionsItem>
            <ElDescriptionsItem :span="2" label="处理进度">
              <ElTag :type="statusText[currentData?.status as string].type">
                {{ statusText[currentData?.status as string].label }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem :span="2" label="处理结果">{{ currentData?.processedResult }}</ElDescriptionsItem>
          </ElDescriptions>
        </ElSpace>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useTable } from '@/composables/useTable'
  import { Edit, Expand, More } from '@element-plus/icons-vue'
  import { DeleteFeedback, ListFeedback, ListFeedbackClassify, UpdateFeedback } from '@/api/manager/feedback/api'
  import { Feedback, FeedbackClassify, UpdateFeedbackRequest } from '@/api/manager/feedback/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { App } from '@/api/manager/app/type'
  import { ListApp } from '@/api/manager/app/api'

  const router = useRouter()

  defineOptions({ name: 'Feedback' })

  // 弹窗相关
  const moreVisible = ref(false)
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Feedback>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const statusText: any = {
    untreated: {
      label: '未处理',
      type: 'info'
    },
    processing: {
      label: '处理中',
      type: 'warning'
    },
    processed: {
      label: '已完成',
      type: 'success'
    }
  }

  const classifies = ref<FeedbackClassify[]>([])
  const getClassifies = (query?: string) => {
    ListFeedbackClassify({ page: 1, pageSize: 10, name: query }).then((res) => {
      classifies.value = res.list
    })
  }
  getClassifies()

  const apps = ref<App[]>([])
  const getApps = (query?: string) => {
    ListApp({ page: 1, pageSize: 10, name: query }).then((res) => {
      apps.value = res.list
    })
  }
  getApps()

  const searchItems = reactive([
    {
      key: 'app',
      label: '所属应用',
      type: 'select',
      props: {
        placeholder: '请选择所属应用',
        clearable: true,
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getApps(query)
          } else {
            getApps()
          }
        },
        options: apps,
        props: {
          label: 'name',
          value: 'id'
        }
      }
    },
    {
      label: '反馈状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择反馈状态',
        clearable: true,
        options: [
          { label: '未处理', value: 'untreated' },
          { label: '处理中', value: 'processing' },
          { label: '已完成', value: 'processed' }
        ]
      }
    }
  ])

  const types = ref<FeedbackClassify[]>([])
  ListFeedbackClassify({ page: 1, pageSize: 10 }).then((res) => {
    types.value = res.list
  })

  const getPlatformName = (p?: string) => {
    if (!p) return ''
    if (p === 'h5' || p === 'web') {
      return '浏览器'
    }
    if (p === 'pc-h5') {
      return 'PC端浏览器'
    }
    return '未知'
  }

  const operationItems = [
    {
      icon: More,
      label: '详细信息',
      color: 'primary',
      click: async (record: Feedback) => {
        showMore(record)
      }
    },
    {
      icon: Edit,
      label: '问题处理',
      color: 'warning',
      permission: 'manager:feedback:update',
      click: async (record: Feedback) => {
        showDialog(record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除反馈',
      color: 'danger',
      permission: 'manager:feedback:delete',
      click: async (record: Feedback) => {
        await DeleteFeedback({ id: record.id })
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
    refreshUpdate,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListFeedback,
      apiParams: {
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'app.name',
          label: '应用名称'
        },
        {
          prop: 'user',
          label: '反馈用户',
          useSlot: true,
          slotName: 'user'
        },
        {
          prop: 'title',
          label: '反馈标题'
        },
        {
          prop: 'status',
          label: '反馈状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Feedback) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Feedback) => formatTime(row.updatedAt)
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
      key: 'status',
      label: '反馈状态',
      type: 'select',
      props: {
        options: [
          { label: '未处理', value: 'untreated' },
          { label: '处理中', value: 'processing' },
          { label: '已完成', value: 'processed' }
        ],
        placeholder: '请选择反馈状态',
        rules: [{ required: true, message: '请选择反馈状态', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'processedResult',
      label: '处理结果',
      type: 'input',
      props: {
        placeholder: '请输入处理结果',
        type: 'textarea'
      }
    }
  ])

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (row?: Feedback): void => {
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const showMore = (row: Feedback): void => {
    console.log(row)
    currentData.value = row || {}
    try {
      currentData.value.deviceInfo = JSON.parse(row.device as string)
    } catch {
      currentData.value.deviceInfo = {}
    }

    try {
      currentData.value.imageUrls = JSON.parse(row.images as string)
    } catch {
      currentData.value.imageUrls = []
    }

    console.log(currentData.value)
    nextTick(() => {
      moreVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    await UpdateFeedback(currentData.value as UpdateFeedbackRequest)
    ElMessage.success('修改成功')
    refreshUpdate()
    dialogVisible.value = false
  }

  const handleJumpClassify = () => {
    router.push({ name: 'FeedbackClassify' })
  }
</script>

<style lang="scss" scoped>
  :deep(.space .el-space__item) {
    width: 100%;
  }

  :deep(.space .el-descriptions__label) {
    white-space: nowrap;
  }

  .hr-line {
    height: 15px;
  }
</style>
