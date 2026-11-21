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
          <template #autoRegister="{ row }">
            <ElTag v-if="row.autoRegister" type="success">开启</ElTag>
            <ElTag v-else type="info">关闭</ElTag>
          </template>
          <template #forceBind="{ row }">
            <ElTag v-if="row.forceBind" type="warning">开启</ElTag>
            <ElTag v-else type="info">关闭</ElTag>
          </template>
          <template #isPrimary="{ row }">
            <ElTag v-if="row.isPrimary" type="primary">主登录</ElTag>
            <span v-else>-</span>
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
  import { Delete, Edit } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { arrayToMap } from '@/utils/constants/transform'
  import { ListOAuther, ListOAutherType } from '@/api/manager/oauther/api'
  import { CreateAppOAuther, DeleteAppOAuther, ListAppOAuther, UpdateAppOAuther } from '@/api/manager/appoauther/api'
  import { CreateAppOAutherRequest, AppOAuther } from '@/api/manager/appoauther/type'
  import { OAuther, OAutherType } from '@/api/manager/oauther/type'

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

  const types = ref<Map<string, OAutherType>>(new Map())
  ListOAutherType().then((res) => {
    types.value = arrayToMap(res.list, 'keyword')
  })

  // 当前选中渠道的类型（新增时按选中的渠道，编辑时按已绑定渠道）
  const currentType = computed(() => {
    if (currentData.value.oauther?.type) return currentData.value.oauther.type
    return oauthers.value.find((item) => item.id === currentData.value.oautherId)?.type
  })
  // 自动注册能力由渠道实现决定，服务端经类型列表返回
  const supportAutoRegister = computed(() => {
    const tp = currentType.value
    return !!tp && !!types.value.get(tp)?.autoRegister
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
        disabled: dialogType.value === 'edit',
        rules: [{ required: true, message: '请输入授权标识', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'autoRegister',
      label: '自动注册',
      type: 'switch',
      hidden: !supportAutoRegister.value,
      tip: '渠道身份未绑定账号时自动创建用户并授权当前应用，不受应用「允许注册」限制'
    },
    {
      key: 'forceBind',
      label: '强制绑定',
      type: 'switch',
      hidden: !supportAutoRegister.value,
      tip: '渠道身份未绑定、但已存在同名账号时，直接绑定该账号，无需输入密码确认；关闭时需用户输入密码绑定'
    },
    {
      key: 'isPrimary',
      label: '主登录渠道',
      type: 'switch',
      tip: '登录页优先使用该渠道登录，不展示账号密码表单；每个应用最多一个'
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改授权',
      color: 'warning',
      permission: 'manager:appoauther:update',
      click: (record: AppOAuther) => showDialog('edit', record)
    },
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
    refreshUpdate,
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
          prop: 'autoRegister',
          label: '自动注册',
          useSlot: true,
          slotName: 'autoRegister'
        },
        {
          prop: 'forceBind',
          label: '强制绑定',
          useSlot: true,
          slotName: 'forceBind'
        },
        {
          prop: 'isPrimary',
          label: '主登录渠道',
          useSlot: true,
          slotName: 'isPrimary'
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
    currentData.value = row ? { ...row } : { app: app, autoRegister: false, isPrimary: false, forceBind: false }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const autoRegister = supportAutoRegister.value && !!currentData.value.autoRegister
    const forceBind = supportAutoRegister.value && !!currentData.value.forceBind
    if (dialogType.value === 'add') {
      await CreateAppOAuther({ ...currentData.value, autoRegister, forceBind } as CreateAppOAutherRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateAppOAuther({
        id: currentData.value.id as number,
        autoRegister,
        forceBind,
        isPrimary: !!currentData.value.isPrimary
      })
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }
</script>
