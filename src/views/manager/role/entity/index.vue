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
                v-permission="'manager:role:entity:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
              >
                新增数据权限
              </ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>
      </div>
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
        <template #operation="{ row }">
          <ArtOperation :list="operationItems" :data="row"></ArtOperation>
        </template>
      </ArtTable>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加数据权限' : '编辑数据权限'"
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
    <Menu ref="menu"></Menu>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { ListApp } from '@/api/manager/app/api'
  import { App } from '@/api/manager/app/type'
  import { ListEntity, ListEntityField, ListEntityRule } from '@/api/manager/entity/api'
  import { Entity, EntityField, EntityRule } from '@/api/manager/entity/type'
  import { DeleteRoleEntity, ListRoleEntity, CreateRoleEntity, UpdateRoleEntity } from '@/api/manager/roleentity/api'
  import { RoleEntity, CreateRoleEntityRequest, UpdateRoleEntityRequest } from '@/api/manager/roleentity/type'
  import { Dept } from '@/api/manager/dept/type'
  import { ListCurrentDept } from '@/api/manager/dept/api'
  import Menu from '../menu/index.vue'

  const router = useRouter()

  defineOptions({ name: 'RoleEntity' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<RoleEntity>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '数据权限名称',
      key: 'name',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入数据权限名称', clearable: true }
    }
  ]

  const curAppId = ref(0)
  const curEntityId = ref(0)
  const curRoleId = Number(router.currentRoute.value.query.roleId)

  const depts = ref<Dept[]>([])
  ListCurrentDept().then((res) => {
    depts.value = res.list
  })

  const apps = ref<App[]>([])
  const getApps = async (name?: string) => {
    const data = await ListApp({ page: 1, pageSize: 10, name })
    apps.value = data.list
  }

  const entities = ref<Entity[]>([])
  const getEntities = (query?: string) => {
    ListEntity({ page: 1, pageSize: 10, appId: curAppId.value, name: query }).then((res) => {
      res.list.forEach((item, ind) => {
        res.list[ind].comment = item.comment + `（${item.name}）`
      })
      entities.value = res.list
    })
  }

  const fields = ref<EntityField[]>([])
  const getFields = () => {
    ListEntityField({ entityId: curEntityId.value }).then((res) => {
      res.list.forEach((item, ind) => {
        res.list[ind].comment = item.comment + `（${item.name}）`
      })
      fields.value = res.list
    })
  }

  const rules = ref<EntityRule[]>([])
  const getRules = (query?: string) => {
    ListEntityRule({ page: 1, pageSize: 10, entityId: curEntityId.value, name: query }).then((res) => {
      rules.value = res.list
    })
  }

  const actions = [
    { label: '创建', value: 'create' },
    { label: '读取', value: 'read' },
    { label: '修改', value: 'update' },
    { label: '删除', value: 'delete' }
  ]

  const scopes = [
    { label: '所有部门', value: 'ALL' },
    { label: '当前部门', value: 'CUR' },
    { label: '当前及下级部门', value: 'CUR_DOWN' },
    { label: '下级部门', value: 'DOWN' },
    { label: '指定部门', value: 'CUSTOM' },
    { label: '仅自己', value: 'SELF' },
    { label: '无部门限制', value: 'NONE' }
  ]

  const formItems = computed(() => [
    {
      key: 'appId',
      label: '所属应用',
      type: 'select',
      hidden: dialogType.value === 'edit',
      props: {
        placeholder: '请选择所属应用',
        disabled: dialogType.value === 'edit',
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getApps(query)
          } else {
            getApps()
          }
        },
        onChange: async (id: number) => {
          curAppId.value = id
          await getEntities()
        },
        options: apps.value,
        props: {
          value: 'id',
          label: 'name'
        },
        rules: [{ required: true, message: '请选择所属应用', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'entityId',
      label: '所属实体',
      type: 'select',
      props: {
        placeholder: '请选择所属实体',
        disabled: dialogType.value === 'edit',
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getEntities(query)
          } else {
            getEntities()
          }
        },
        onChange: (id: number) => {
          curEntityId.value = id
          getFields()
          getRules()
        },
        options: dialogType.value == 'edit' ? [{ ...currentData.value.entity }] : entities.value,
        props: {
          value: 'id',
          label: 'comment'
        },
        rules: [{ required: true, message: '请输入规则标识', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'action',
      label: '操作类型',
      type: 'select',
      placeholder: '请输入操作类型',
      props: {
        options: actions,
        rules: [{ required: true, message: '请输入操作类型', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'scope',
      label: '权限范围',
      type: 'select',
      placeholder: '请选择权限范围',
      props: {
        options: scopes,
        rules: [{ required: true, message: '请选择权限范围', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'depts',
      label: '部门权限',
      type: 'treeselect',
      placeholder: '请选择部门权限',
      hidden: currentData.value.scope !== 'CUSTOM',
      props: {
        data: depts.value,
        checkStrictly: true,
        showCheckbox: true,
        multiple: true,
        nodeKey: 'id',
        currentNodeKey: 'id',
        collapseTags: true,
        defaultCheckedKeys: currentData.value.depts,
        props: {
          label: 'name',
          value: 'id'
        }
      }
    },
    {
      key: 'fields',
      label: '字段权限',
      type: 'select',
      placeholder: '请选择字段权限',
      props: {
        options: fields.value,
        multiple: true,
        props: {
          label: 'comment',
          value: 'id'
        }
      }
    },
    {
      key: 'rules',
      label: '数据规则',
      type: 'select',
      placeholder: '请选择数据规则',
      props: {
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getRules(query)
          } else {
            getRules()
          }
        },
        options: rules.value,
        multiple: true,
        props: {
          label: 'name',
          value: 'id'
        }
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改数据权限',
      color: 'warning',
      permission: 'manager:role:entity:update',
      click: async (record: RoleEntity) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除数据权限',
      color: 'danger',
      permission: 'manager:roleentity:delete',
      click: async (record: RoleEntity) => {
        await DeleteRoleEntity({ id: record.id })
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
      apiFn: ListRoleEntity,
      apiParams: {
        page: 1,
        pageSize: 10,
        roleId: curRoleId,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'entity.comment',
          label: '实体标识'
        },
        {
          prop: 'entity.comment',
          label: '实体名称'
        },
        {
          prop: 'action',
          label: '操作类型',
          formatter: (row: RoleEntity) => {
            return actions.find((item) => item.value === row.action)?.label || ''
          }
        },
        {
          prop: 'scope',
          label: '权限范围',
          formatter: (row: RoleEntity) => {
            return scopes.find((item) => item.value === row.scope)?.label || ''
          }
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: RoleEntity) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: RoleEntity) => formatTime(row.updatedAt)
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
  const showDialog = async (type: Form.DialogType, row?: RoleEntity) => {
    dialogType.value = type
    const value = { ...row }

    if (row) {
      curEntityId.value = row.entityId
      await getFields()
      await getRules()
    }

    currentData.value = value || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value: any = { ...currentData.value, roleId: curRoleId }
    if (dialogType.value === 'add') {
      await CreateRoleEntity(value as CreateRoleEntityRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateRoleEntity(value as UpdateRoleEntityRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }
</script>
