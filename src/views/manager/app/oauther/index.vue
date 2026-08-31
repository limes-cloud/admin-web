<template>
  <div class="art-full-height">
    <!-- 搜索栏 -->

    <ElCard class="art-table-card" shadow="never">
      <ArtBack></ArtBack>

      <div class="search">
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
                v-permission="'manager:appoauther:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增授权</ElButton
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
          <template #logo="{ row }">
            <ElAvatar shape="square" :size="60" :src="$rurl(row.oauther.logo)"></ElAvatar>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加授权' : '编辑授权'"
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
  import { computed } from 'vue'
  import { useTable } from '@/composables/useTable'
  import { Plus } from '@element-plus/icons-vue'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { arrayToMap } from '@/utils/constants/transform'
  import { ListOAuther, ListOAutherType } from '@/api/manager/oauther/api'
  import { CreateAppOAuther, DeleteAppOAuther, ListAppOAuther } from '@/api/manager/appoauther/api'
  import { CreateAppOAutherRequest, AppOAuther } from '@/api/manager/appoauther/type'
  import { OAuther } from '@/api/manager/oauther/type'

  defineOptions({ name: 'AppOAuther' })

  const router = useRouter()
  const app = router.currentRoute.value.query.app as string

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<AppOAuther>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '授权标识',
      key: 'keyword',
      type: 'input',
      placeholder: '请输入授权标识',
      clearable: true
    },
    {
      label: '授权名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入授权名称',
      clearable: true,
      props: { maxlength: '32' }
    }
  ]

  const types = ref({})
  ListOAutherType().then((res) => {
    types.value = arrayToMap(res.list, 'keyword')
  })

  const oauthers = ref<OAuther[]>([])
  ListOAuther({ page: 1, pageSize: 10 }).then((res) => {
    oauthers.value = res.list
  })

  const formItems = computed(() => [
    {
      key: 'oautherId',
      label: '绑定授权',
      type: 'select',
      props: {
        placeholder: '请选择绑定的授权渠道',
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length < 1) return
          ListOAuther({ page: 1, pageSize: 10, name: query }).then((res) => {
            oauthers.value = res.list
          })
        },
        options: oauthers.value,
        props: {
          value: 'id',
          label: 'name'
        },
        rules: [{ required: true, message: '请输入授权标识', trigger: ['blur', 'change'] }]
      }
    }
  ])

  const operationItems = [
    {
      icon: Delete,
      popConfirm: true,
      label: '删除授权',
      color: 'danger',
      permission: 'manager:appoauther:delete',
      click: async (record: AppOAuther) => {
        await DeleteAppOAuther({ id: record.id })
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
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListAppOAuther,
      apiParams: {
        page: 1,
        pageSize: 10,
        app: app,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          type: 'index',
          width: '60',
          label: '#'
        },
        {
          prop: 'oauther.name',
          label: '授权类型'
        },
        {
          prop: 'oauther.logo',
          label: '授权Logo',
          useSlot: true,
          slotName: 'logo'
        },
        {
          prop: 'oauther.keyword',
          label: '授权标识'
        },
        {
          prop: 'oauther.name',
          label: '授权名称'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: AppOAuther) => formatTime(row.createdAt)
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
  const showDialog = (type: Form.DialogType, row?: AppOAuther): void => {
    dialogType.value = type
    currentData.value = { app: app, ...row }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    await CreateAppOAuther(currentData.value as CreateAppOAutherRequest)
    ElMessage.success('创建成功')
    refreshCreate()
    dialogVisible.value = false
  }
</script>
