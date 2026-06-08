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
                v-permission="'ai-agent:secret:group:query'"
                v-ripple
                type="success"
                :icon="Expand"
                @click="handleJumpGroup"
              >
                分组管理
              </ElButton>
              <ElButton
                v-permission="'ai-agent:secret:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增密钥</ElButton
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
              :disabled="!$hasPermission('ai-agent:secret:update')"
              inline-prompt
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
        :title="dialogType === 'add' ? '添加密钥' : '编辑密钥'"
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
  import { ElMessageBox } from 'element-plus'
  import { Edit, Plus, Expand } from '@element-plus/icons-vue'
  import { CreateSecret, DeleteSecret, ListSecret, ListSecretGroup, UpdateSecret } from '@/api/ai-agent/secret/api'
  import { CreateSecretRequest, Secret, SecretGroup, UpdateSecretRequest } from '@/api/ai-agent/secret/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  const router = useRouter()

  defineOptions({ name: 'Secret' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Secret>>({})

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
  listGroup()

  const searchItems = reactive([
    {
      label: '密钥分组',
      key: 'groupId',
      type: 'select',
      props: {
        placeholder: '请输入密钥分组',
        options: groups,
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
      label: '密钥状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择密钥状态',
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
      label: '修改密钥',
      color: 'warning',
      permission: 'ai-agent:secret:update',
      click: async (record: Secret) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除密钥',
      color: 'danger',
      permission: 'ai-agent:secret:delete',
      click: async (record: Secret) => {
        await DeleteSecret({ id: record.id })
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
      apiFn: ListSecret,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'name',
          label: '密钥名称'
        },
        {
          prop: 'group.name',
          label: '密钥分组'
        },
        {
          prop: 'status',
          label: '密钥状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Secret) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Secret) => formatTime(row.updatedAt)
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

  const formItems = reactive([
    {
      key: 'groupId',
      label: '密钥分组',
      type: 'select',
      props: {
        placeholder: '请选择密钥分组',
        options: groups,
        rules: [{ required: true, message: '请选择密钥名称', trigger: ['blur', 'change'] }],
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
      key: 'name',
      label: '密钥名称',
      type: 'input',
      props: {
        placeholder: '请输入密钥名称',
        rules: [{ required: true, message: '请输入密钥名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'token',
      label: '密钥Token',
      type: 'input',
      props: {
        placeholder: '请输入密钥Token',
        rules: [{ required: true, message: '请输入密钥Token', trigger: ['blur', 'change'] }]
      }
    }
  ])

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: Secret): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateSecret(currentData.value as CreateSecretRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateSecret(currentData.value as UpdateSecretRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: Secret): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改密钥状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateSecret({ id: item.id, status: !item.status })
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

  const handleJumpGroup = () => {
    router.push({ name: 'AIAgentSecretGroup' })
  }
</script>
