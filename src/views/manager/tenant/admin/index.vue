<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton
              v-permission="'manager:tenantadmin:add'"
              v-ripple
              type="primary"
              :icon="Plus"
              @click="showDialog('add')"
              >新增管理</ElButton
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
        <template #avatar="{ row }">
          <ElAvatar shape="square" :size="60" :src="$rurl(row.avatar)"></ElAvatar>
        </template>
        <template #operation="{ row }">
          <ArtOperation :list="operationItems" :data="row"></ArtOperation>
        </template>
      </ArtTable>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加管理' : '编辑管理'"
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
  import { Plus } from '@element-plus/icons-vue'
  import {
    CreateTenantAdmin,
    DeleteTenantAdmin,
    ListTenantAdmin,
    UpdateTenantAdmin
  } from '@/api/manager/tenantadmin/api'
  import { CreateTenantAdminRequest, UpdateTenantAdminRequest } from '@/api/manager/tenantadmin/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { User } from '@/api/manager/user/type'
  import { ListUser } from '@/api/manager/user/api'

  defineOptions({ name: 'TenantAdmin' })

  const router = useRouter()
  const curTenantId = Number(router.currentRoute.value.query.tenantId)

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)

  const users = ref<User[]>([])
  const getUsers = (query?: string) => {
    ListUser({ page: 1, pageSize: 10, username: query }).then((res) => {
      const list = res.list
      list.forEach((item, index) => {
        list[index].username = item.username + ' (' + item.nickname + ')'
      })
      users.value = list
    })
  }
  getUsers()

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const currentData = ref<Partial<CreateTenantAdminRequest>>({})
  const formItems = computed(() => [
    {
      key: 'userId',
      label: '选择人员',
      type: 'select',
      placeholder: '请选择人员',
      clearable: true,
      props: {
        rules: [{ required: true, message: '请选择人员', trigger: ['blur', 'change'] }],
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getUsers(query)
          } else {
            getUsers()
          }
        },
        options: users.value,
        props: {
          label: 'username',
          value: 'id'
        }
      }
    }
  ])

  const operationItems = [
    {
      icon: Delete,
      popConfirm: true,
      label: '删除信息',
      color: 'danger',
      permission: 'manager:tenantadmin:delete',
      click: async (record: any) => {
        await DeleteTenantAdmin({ tenantId: curTenantId, userId: record.id })
        refreshRemove()
      }
    }
  ]

  const {
    columns,
    columnChecks,
    data,
    loading,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListTenantAdmin,
      apiParams: {
        ...searchForm.value,
        tenantId: curTenantId
      },
      columnsFactory: () => [
        {
          prop: 'avatar',
          label: '用户头像',
          useSlot: true,
          slotName: 'avatar'
        },
        {
          prop: 'username',
          label: '用户账号'
        },
        {
          prop: 'nickname',
          label: '用户昵称'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: any) => formatTime(row.createdAt)
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

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType): void => {
    dialogType.value = type
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = currentData.value
    if (dialogType.value === 'add') {
      await CreateTenantAdmin({ ...value, tenantId: curTenantId } as CreateTenantAdminRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateTenantAdmin({ ...value, tenantId: curTenantId } as UpdateTenantAdminRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }
</script>
