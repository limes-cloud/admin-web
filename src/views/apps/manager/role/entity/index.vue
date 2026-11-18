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
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加数据权限' : '编辑数据权限'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="560px"
        align-center
      >
        <!-- 包裹层：避免 ArtForm 与矩阵在 .art-form-dialog 的 flex 行内互相挤压 -->
        <div class="role-entity-dialog-body">
          <!-- 隐藏 ArtForm 自带按钮，底部统一放确定/取消 -->
          <ArtForm
            ref="formRef"
            v-model="currentData"
            :items="formItems"
            :span="24"
            :show-submit="false"
            :show-cancel="false"
          ></ArtForm>

          <!-- 批量操作权限矩阵（add 模式）：选中应用和实体后展示，每个操作独立配置权限 -->
          <div v-if="dialogType === 'add' && curApp && curEntityId" class="action-matrix">
            <div class="matrix-title">操作权限配置（每个操作各自独立）</div>
            <div v-for="row in actionRows" :key="row.value" class="matrix-row">
              <ElCheckbox v-model="row.enabled" class="matrix-action">{{ row.label }}</ElCheckbox>
              <ElSelect v-model="row.scope" size="small" class="matrix-scope" placeholder="权限范围">
                <ElOption v-for="s in scopes" :key="s.value" :label="s.label" :value="s.value" />
              </ElSelect>
              <ElTreeSelect
                v-if="row.scope === 'CUSTOM'"
                v-model="row.depts"
                class="matrix-depts"
                :data="depts"
                :props="{ label: 'name', value: 'id' }"
                check-strictly
                show-checkbox
                multiple
                collapse-tags
              />
              <ElSelect v-model="row.rules" multiple size="small" class="matrix-rules" placeholder="数据规则">
                <ElOption v-for="r in rules" :key="r.id" :label="r.name" :value="r.id" />
              </ElSelect>
            </div>
          </div>

          <!-- 底部操作按钮：位于矩阵下方 -->
          <div class="role-entity-footer">
            <ElButton v-ripple @click="dialogVisible = false">取消</ElButton>
            <ElButton v-ripple type="primary" @click="handleDialogSubmit">确定</ElButton>
          </div>
        </div>
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
  import { ListEntity, ListEntityRule } from '@/api/manager/entity/api'
  import { Entity, EntityRule } from '@/api/manager/entity/type'
  import { DeleteRoleEntity, ListRoleEntity, CreateRoleEntity, UpdateRoleEntity } from '@/api/manager/roleentity/api'
  import { RoleEntity, CreateRoleEntityRequest, UpdateRoleEntityRequest } from '@/api/manager/roleentity/type'
  import { Dept } from '@/api/manager/dept/type'
  import { ListDept } from '@/api/manager/dept/api'
  import { getAppKeyword } from '@/utils/app-context'
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

  // 当前选中应用的 keyword 标识，作为实体列表查询条件（后端 app 字段按 keyword 匹配）
  const curApp = ref((router.currentRoute.value.query.app as string) || '')
  const curEntityId = ref(0)
  const curRoleId = Number(router.currentRoute.value.query.roleId)

  const depts = ref<Dept[]>([])
  const getDepts = (app?: string) => {
    ListDept({ app: app || curApp.value || getAppKeyword() }).then((res) => {
      depts.value = res.list
    })
  }
  getDepts()

  const apps = ref<App[]>([])
  const getApps = async (name?: string) => {
    const data = await ListApp({ page: 1, pageSize: 10, name })
    apps.value = data.list
  }

  const entities = ref<Entity[]>([])
  const getEntities = (query?: string) => {
    ListEntity({ page: 1, pageSize: 10, app: curApp.value, name: query }).then((res) => {
      res.list.forEach((item, ind) => {
        res.list[ind].comment = item.comment + `（${item.name}）`
      })
      entities.value = res.list
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

  // 批量添加：每个操作一行的独立权限配置
  interface ActionRow {
    value: string
    label: string
    enabled: boolean
    scope: string
    depts: number[]
    rules: number[]
  }
  const actionRows = ref<ActionRow[]>([])
  const resetActionRows = () => {
    actionRows.value = actions.map((a) => ({
      value: a.value,
      label: a.label,
      enabled: true,
      scope: 'ALL',
      depts: [],
      rules: []
    }))
  }

  const formItems = computed(() => [
    {
      key: 'app',
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
        /**
         * 应用选择变更后刷新实体列表。
         * 后端 entity / roleentity 协议的 app 字段是应用 keyword 字符串（max_len 64），因此下拉取 keyword 而不是主键 id。
         * @param keyword 选中应用的 keyword 标识
         */
        onChange: async (keyword: string) => {
          curApp.value = keyword
          // 切换应用后清空已选实体，避免旧实体的权限配置残留
          curEntityId.value = 0
          currentData.value.entityId = undefined
          getDepts(keyword)
          await getEntities()
          Object.assign(searchParams, { app: keyword })
          getData()
        },
        options: apps.value,
        props: {
          value: 'keyword',
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
      hidden: dialogType.value === 'add',
      placeholder: '请输入操作类型',
      props: {
        options: actions,
        // 编辑时禁止修改操作类型（后端更新接口不收 action 字段，创建后不可变）
        disabled: true,
        rules: [{ required: true, message: '请输入操作类型', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'scope',
      label: '权限范围',
      type: 'select',
      hidden: dialogType.value === 'add',
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
      hidden: dialogType.value === 'add' || currentData.value.scope !== 'CUSTOM',
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
      key: 'rules',
      label: '数据规则',
      type: 'select',
      hidden: dialogType.value === 'add',
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
      permission: 'manager:role:entity:delete',
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
        app: curApp.value,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'entity.name',
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
    if (type === 'add') {
      resetActionRows()
      // 新增时重置实体选择，未选实体前矩阵不展示
      curEntityId.value = 0
    }
    const value = { ...row }

    if (row) {
      curEntityId.value = row.entityId
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
      // 批量：只提交启用的操作，每个操作独立权限
      value.items = actionRows.value
        .filter((r) => r.enabled)
        .map((r) => ({ action: r.value, scope: r.scope, depts: r.depts, rules: r.rules }))
      await CreateRoleEntity(value as CreateRoleEntityRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      // 编辑时操作类型不可变，不随请求下发
      delete value.action
      await UpdateRoleEntity(value as UpdateRoleEntityRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  // 底部确定：先通过 ArtForm 暴露的 validate 校验表单，通过后再提交
  const formRef = ref<{ validate: (...args: any[]) => Promise<any> }>()

  const handleDialogSubmit = async () => {
    try {
      const res = await formRef.value?.validate()
      if (res) {
        await handleSubmit()
      }
    } catch {
      // 校验失败：保持弹窗不关闭
    }
  }
</script>

<style scoped>
/* 作为 .art-form-dialog（flex 行）的唯一子元素，占满整行；内部走块级文档流 */
.role-entity-dialog-body {
  flex: 0 0 100%;
  width: 100%;
  min-width: 0;
}

.role-entity-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: 10px 0 0;
}

.action-matrix {
  flex-basis: 100%;
  width: 100%;
  margin-top: 12px;
  border-top: 1px dashed var(--el-border-color-lighter);
  padding-top: 10px;
}
.matrix-title {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}
.matrix-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.matrix-row .el-tree-select,
.matrix-row .el-select {
  max-width: 100%;
}
.matrix-action {
  width: 72px;
  flex-shrink: 0;
}
.matrix-scope {
  width: 140px;
  flex-shrink: 0;
}
.matrix-depts {
  flex: 1;
  min-width: 180px;
}
.matrix-rules {
  flex: 1;
  min-width: 160px;
}
</style>
