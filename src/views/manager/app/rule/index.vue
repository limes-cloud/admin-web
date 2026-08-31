<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtBack></ArtBack>

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
                v-permission="'manager:entityrule:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增规则</ElButton
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
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
              :before-change="handleUpdateStatus(row)"
            />
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加规则' : '编辑规则'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="480px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="24"
          :show-button="false"
          @cancel="dialogVisible = false"
          @submit="handleSubmit"
        ></ArtForm>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElMessageBox } from 'element-plus'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import {
    CreateEntityRule,
    DeleteEntityRule,
    ListEntity,
    ListEntityField,
    ListEntityRule,
    UpdateEntityRule
  } from '@/api/manager/entity/api'
  import {
    CreateEntityRuleRequest,
    Entity,
    EntityField,
    EntityRule,
    UpdateEntityRuleRequest
  } from '@/api/manager/entity/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  const router = useRouter()
  const app = router.currentRoute.value.query.app as string

  defineOptions({ name: 'EntityRule' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<EntityRule>>({})

  const formEntities = ref<Entity[]>([])
  const formFields = ref<EntityField[]>([])

  const handleListEntity = (query?: string) => {
    ListEntity({ page: 1, pageSize: 10, app, name: query }).then((res) => {
      res.list.forEach((item, ind) => {
        res.list[ind].comment = item.comment + `（${item.name}）`
      })
      formEntities.value = res.list
    })
  }
  handleListEntity()

  const handleListField = (id: number) => {
    ListEntityField({ entityId: id }).then((res) => {
      res.list.forEach((item, ind) => {
        res.list[ind].comment = item.comment + `（${item.name}）`
      })
      formFields.value = res.list
    })
  }

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = computed(() => [
    {
      key: 'entityId',
      label: '所属实体',
      type: 'select',
      props: {
        options: formEntities.value,
        clearable: true,
        placeholder: '请选择所属实体',
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            handleListEntity(query)
          } else {
            handleListEntity()
          }
        },
        props: {
          value: 'id',
          label: 'comment'
        }
      }
    },
    {
      label: '规则名称',
      key: 'name',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入规则名称', clearable: true }
    }
  ])

  const formItems = computed(() => [
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
            handleListEntity(query)
          } else {
            handleListEntity()
          }
        },
        onChange: (id: number) => {
          handleListField(id)
        },
        options: formEntities.value,
        props: {
          value: 'id',
          label: 'comment'
        },
        rules: [{ required: true, message: '请输入规则标识', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'name',
      label: '规则名称',
      type: 'input',
      props: {
        placeholder: '请输入规则名称',
        rules: [{ required: true, message: '请输入规则名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '规则描述',
      type: 'input',
      props: {
        placeholder: '请输入规则描述',
        rules: [{ required: true, message: '请输入规则描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    },
    {
      key: 'expression',
      label: '规则配置',
      type: 'sqlbuilder',
      props: {
        placeholder: '请输入规则配置',
        fields: formFields.value
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改规则',
      color: 'warning',
      permission: 'manager:entityrule:update',
      click: async (record: EntityRule) => {
        await handleListField(record.entityId)
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除规则',
      color: 'danger',
      permission: 'manager:entityrule:delete',
      click: async (record: EntityRule) => {
        await DeleteEntityRule({ id: record.id })
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
      apiFn: ListEntityRule,
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
          prop: 'name',
          label: '规则名称'
        },
        {
          prop: 'status',
          label: '规则状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'description',
          label: '规则描述'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: EntityRule) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: EntityRule) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: EntityRule): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateEntityRule(currentData.value as CreateEntityRuleRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateEntityRule(currentData.value as UpdateEntityRuleRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: EntityRule): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改规则状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateEntityRule({ id: item.id, status: !item.status })
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
