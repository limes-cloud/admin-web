<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
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
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton
                v-permission="'manager:field:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增字段</ElButton
              >
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
          <template #status="{ row }">
            <el-switch
              v-model="row.status"
              :disabled="!$hasPermission('manager:field:update')"
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
        :title="dialogType === 'add' ? '添加字段' : '编辑字段'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="480px"
        align-center
      >
        <ArtFormEditor :single="true" :single-node="editNode" />
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElMessageBox } from 'element-plus'
  import { Delete, Edit, Plus } from '@element-plus/icons-vue'
  import { CreateField, DeleteField, ListField, UpdateField } from '@/api/manager/field/api'
  import { CreateFieldRequest, Field, FieldConfig, FieldOption, UpdateFieldRequest } from '@/api/manager/field/type'
  import { formatTime } from '@/utils/time'
  import { componentTypes } from '@/components/core/base/art-form-editor/lib/editor'
  import { defaultComponentRule } from '@/components/core/base/art-form-editor/lib/data'
  import { FormNode, NodeConfig, ComponentRule } from '@/components/core/base/art-form-editor/lib/types'
  import { uuid } from '@/components/core/base/art-form-editor/lib/utils'
  import ArtFormEditor from '@/components/core/base/art-form-editor/index.vue'

  defineOptions({ name: 'Field' })

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentFieldId = ref<number | undefined>(undefined)
  const currentFieldStatus = ref<boolean | undefined>(undefined)
  const currentFieldDescription = ref<string>('')

  // 编辑用的 FormNode 对象
  const editNode = ref<FormNode>({
    id: uuid(),
    type: 'input',
    field: '',
    label: '',
    config: {
      required: true,
      hidden: false,
      value: '',
      placeholder: '请输入'
    }
  })

  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    type: undefined,
    status: undefined
  })

  // --- 格式转换 ---
  // FieldConfig → NodeConfig
  const toNodeConfig = (fc: FieldConfig | undefined): NodeConfig => {
    const config: NodeConfig = {
      required: true,
      hidden: false,
      value: fc?.defaultValue || '',
      placeholder: fc?.placeholder || '请输入'
    }
    if (fc?.maxLength) config.maxLength = fc.maxLength
    if (fc?.minLength) config.minLength = fc.minLength
    if (fc?.min !== undefined) config.min = fc.min
    if (fc?.max !== undefined) config.max = fc.max
    if (fc?.step !== undefined) config.step = fc.step
    if (fc?.filetype) config.filetype = fc.filetype
    if (fc?.limit) config.limit = fc.limit
    if (fc?.options && fc.options.length > 0) {
      config.options = fc.options.map((o) => (typeof o === 'string' ? { label: o, value: o } : { label: o.label || o.value, value: o.value }))
      config.optionSource = 'static'
    }
    if (fc?.rule) {
      const ruleObj: ComponentRule = { label: getRuleName(fc.rule.type), value: fc.rule.type }
      if (fc.rule.message) ruleObj.message = fc.rule.message
      if (fc.rule.pattern) ruleObj.pattern = fc.rule.pattern
      config.rule = ruleObj
    }
    return config
  }

  // NodeConfig → FieldConfig
  const toFieldConfig = (node: FormNode): FieldConfig => {
    const cc = node.config
    const fc: FieldConfig = {}
    if (cc.placeholder) fc.placeholder = cc.placeholder
    if (cc.value) fc.defaultValue = String(cc.value)
    if (cc.maxLength) fc.maxLength = cc.maxLength
    if (cc.minLength) fc.minLength = cc.minLength
    if (cc.min !== undefined) fc.min = cc.min
    if (cc.max !== undefined) fc.max = cc.max
    if (cc.step !== undefined) fc.step = cc.step
    if (cc.filetype) fc.filetype = cc.filetype
    if (cc.limit) fc.limit = cc.limit
    if (cc.options && cc.options.length > 0) {
      fc.options = cc.options.map((o): FieldOption => ({ label: o.label, value: o.value }))
    }
    if (cc.rule && cc.rule.value) {
      fc.rule = { type: cc.rule.value }
      if (cc.rule.message) fc.rule.message = cc.rule.message
      if (cc.rule.pattern) fc.rule.pattern = cc.rule.pattern
    }
    return fc
  }

  const getRuleName = (type: string): string => {
    const found = defaultComponentRule.find((r) => r.value === type)
    return found ? found.label : type
  }

  const searchItems = computed(() => [
    {
      label: '字段标识',
      key: 'keyword',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入字段标识', clearable: true }
    },
    {
      label: '字段名称',
      key: 'name',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入字段名称', clearable: true }
    },
    {
      label: '组件类型',
      key: 'type',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '请选择组件类型',
        options: componentTypes,
        props: { label: 'name', value: 'value' }
      }
    },
    {
      label: '字段状态',
      key: 'status',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '请选择字段状态',
        options: [
          { label: '启用', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改字段',
      color: 'warning',
      permission: 'manager:field:update',
      click: async (record: Field) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除字段',
      color: 'danger',
      permission: 'manager:field:delete',
      click: async (record: Field) => {
        await DeleteField({ id: record.id })
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
    core: {
      apiFn: ListField,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: '60', label: '#' },
        {
          prop: 'type',
          label: '组件类型',
          formatter: (row: Field) => {
            const t = componentTypes.find((item) => item.value === row.type)
            return t?.name || row.type
          }
        },
        { prop: 'keyword', label: '字段标识' },
        { prop: 'name', label: '字段名称' },
        { prop: 'status', label: '状态', useSlot: true, slotName: 'status' },
        { prop: 'description', label: '描述' },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Field) => formatTime(row.createdAt)
        },
        { prop: 'operation', label: '操作', width: 120, fixed: 'right', useSlot: true, slotName: 'operation' }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: Form.DialogType, row?: Field): void => {
    dialogType.value = type
    if (type === 'edit' && row) {
      currentFieldId.value = row.id
      currentFieldStatus.value = row.status
      currentFieldDescription.value = row.description || ''
      const config = toNodeConfig(row.config)
      editNode.value = {
        id: uuid(),
        type: row.type,
        field: row.keyword,
        label: row.name,
        config
      }
    } else {
      currentFieldId.value = undefined
      currentFieldStatus.value = undefined
      currentFieldDescription.value = ''
      editNode.value = {
        id: uuid(),
        type: 'input',
        field: '',
        label: '',
        config: {
          required: true,
          hidden: false,
          value: '',
          placeholder: '请输入'
        }
      }
    }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleSubmit = async () => {
    const node = editNode.value
    const fieldConfig = toFieldConfig(node)

    if (dialogType.value === 'add') {
      await CreateField({
        keyword: node.field || '',
        type: node.type,
        name: node.label || '',
        config: fieldConfig,
        description: currentFieldDescription.value || undefined
      } as CreateFieldRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateField({
        id: currentFieldId.value!,
        keyword: node.field || '',
        type: node.type,
        name: node.label || '',
        config: fieldConfig,
        status: currentFieldStatus.value,
        description: currentFieldDescription.value || undefined
      } as UpdateFieldRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: Field): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改字段状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateField({ id: item.id, status: !item.status })
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
