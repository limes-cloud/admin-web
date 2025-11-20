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
                v-permission="'manager:oauther:add'"
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
          <template #status="{ row }">
            <el-switch
              v-model="row.status"
              :disabled="!$hasPermission('manager:oauther:update')"
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
  import { CreateOAuther, DeleteOAuther, ListOAuther, ListOAutherType, UpdateOAuther } from '@/api/manager/oauther/api'
  import { CreateOAutherRequest, OAuther, OAutherType, UpdateOAutherRequest } from '@/api/manager/oauther/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'OAuther' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<OAuther>>({})

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
      props: { maxlength: '32', placeholder: '请输入授权标识', clearable: true }
    },
    {
      label: '授权名称',
      key: 'name',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入授权名称', clearable: true }
    },
    {
      label: '授权状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择授权状态',
        clearable: true,
        options: [
          { label: '正常', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ]

  const types = ref<OAutherType[]>([])
  ListOAutherType().then((res) => {
    types.value = res.list
  })

  const formItems = computed(() => [
    {
      key: 'logo',
      label: '授权logo',
      type: 'upload',
      props: {
        rules: [{ required: true, message: '请上传授权logo', trigger: ['blur', 'change'] }],
        directoryPath: 'manager/oauther/logo'
      }
    },
    {
      key: 'keyword',
      label: '授权标识',
      type: 'input',
      props: {
        placeholder: '请输入授权标识',
        disabled: dialogType.value === 'edit',
        rules: [
          { required: true, message: '请输入授权标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '授权标识格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
        ]
      }
    },
    {
      key: 'name',
      label: '授权名称',
      type: 'input',
      props: {
        placeholder: '请输入授权名称',
        rules: [{ required: true, message: '请输入授权名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'type',
      label: '授权类型',
      type: 'select',
      props: {
        options: types.value,
        placeholder: '请选择授权类型',
        rules: [{ required: true, message: '请选择授权名称', trigger: ['blur', 'change'] }],
        props: {
          label: 'name',
          value: 'keyword'
        }
      }
    },
    {
      key: 'ak',
      label: '授权AK',
      type: 'input',
      props: {
        placeholder: '请输入授权AK',
        rules: [{ required: true, message: '请输入授权AK', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'sk',
      label: '授权SK',
      type: 'input',
      props: {
        placeholder: '请输入授权SK',
        rules: [{ required: true, message: '请输入授权SK', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '授权描述',
      type: 'input',
      props: {
        placeholder: '请输入授权描述',
        rules: [{ required: true, message: '请输入授权描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    },
    {
      key: 'setting.callback',
      label: '回调地址',
      type: 'input',
      hidden: currentData.value.type == 'email',
      props: {
        placeholder: '请输入回调地址',
        rules: [
          { required: true, message: '请输入回调地址', trigger: ['blur', 'change'] },
          { type: 'url', message: '回调地址格式错误' }
        ],
        type: 'input'
      }
    },
    {
      key: 'setting.email.host',
      label: '邮件服务',
      type: 'input',
      hidden: currentData.value.type !== 'email',
      props: {
        placeholder: '请输入邮件服务器',
        rules: [
          { required: true, message: '请输入邮件服务器', trigger: ['blur', 'change'] },
          { type: 'host', message: '邮件服务器格式错误' }
        ],
        type: 'input'
      }
    },
    {
      key: 'setting.email.port',
      label: '服务端口',
      type: 'number',
      hidden: currentData.value.type !== 'email',
      defaultValue: 25,
      props: {
        placeholder: '请输入邮件服务器端口',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入邮件服务器端口', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.email.from',
      label: '发送名称',
      type: 'input',
      hidden: currentData.value.type !== 'email',
      props: {
        placeholder: '请输入发送名称',
        rules: [{ required: true, message: '请输入发送名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.email.subject',
      label: '邮件主题',
      type: 'input',
      hidden: currentData.value.type !== 'email',
      props: {
        placeholder: '请输入邮件主题',
        rules: [{ required: true, message: '请输入邮件主题', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.email.template',
      label: '邮件模板',
      type: 'code',
      hidden: currentData.value.type !== 'email',
      props: {
        placeholder: '请输入邮件模板',
        lang: 'html',
        showFullscreen: true,
        style: { height: '200px', width: '100%' },
        rules: [{ required: true, message: '请输入邮件模板', trigger: ['blur', 'change'] }]
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改授权',
      color: 'warning',
      permission: 'manager:oauther:update',
      click: async (record: OAuther) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除授权',
      color: 'danger',
      permission: 'manager:oauther:delete',
      click: async (record: OAuther) => {
        await DeleteOAuther({ id: record.id })
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
      apiFn: ListOAuther,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          type: 'index',
          width: '60',
          label: '#'
        },
        {
          prop: 'logo',
          label: '授权Logo',
          useSlot: true,
          slotName: 'logo'
        },
        {
          prop: 'keyword',
          label: '授权标识'
        },
        {
          prop: 'name',
          label: '授权名称'
        },
        {
          prop: 'status',
          label: '授权状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'description',
          label: '授权描述'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: OAuther) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: OAuther) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: OAuther): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateOAuther({ ...currentData.value } as CreateOAutherRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateOAuther({ ...currentData.value } as UpdateOAutherRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: OAuther): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改授权渠道状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateOAuther({ id: item.id, status: !item.status })
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
</script>
