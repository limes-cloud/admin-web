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
                v-permission="'ai-agent:secret:group:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增分组</ElButton
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
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加分组' : '编辑分组'"
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
  import { Edit, Plus } from '@element-plus/icons-vue'
  import {
    CreateSecretGroup,
    DeleteSecretGroup,
    ListSecretGroup,
    ListSupplier,
    UpdateSecretGroup
  } from '@/api/ai-agent/secret/api'
  import { CreateSecretGroupRequest, SecretGroup, UpdateSecretGroupRequest } from '@/api/ai-agent/secret/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'SecretGroup' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<SecretGroup>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const suppliers = ref<{ label: string; value: string }[]>([])
  ListSupplier().then((res) => {
    suppliers.value = res.list.map((item) => ({ label: item, value: item }))
  })

  const searchItems = [
    {
      label: '分组名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入分组名称',
      clearable: true,
      props: { maxlength: '32' }
    }
  ]

  const formItems = reactive([
    {
      label: '所属厂商',
      key: 'supplier',
      type: 'select',
      props: {
        placeholder: '请输入所属厂商',
        options: suppliers,
        rules: [{ required: true, message: '请选择所属厂商', trigger: ['blur', 'change'] }],
        props: {
          label: 'label',
          value: 'value'
        }
      }
    },
    {
      key: 'name',
      label: '分组名称',
      type: 'input',
      placeholder: '请输入分组名称',
      props: {
        rules: [{ required: true, message: '请输入分组名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'host',
      label: '请求地址',
      type: 'input',
      placeholder: '请输入请求地址',
      props: {
        rules: [
          { required: true, message: '请输入请求地址', trigger: ['blur', 'change'] },
          { type: 'url', message: '请输入有效的请求地址', trigger: ['blur', 'change'] }
        ]
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改分组',
      color: 'warning',
      permission: 'ai-agent:secret:update',
      click: async (record: SecretGroup) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除分组',
      color: 'danger',
      permission: 'ai-agent:secret:delete',
      click: async (record: SecretGroup) => {
        await DeleteSecretGroup({ id: record.id })
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
      apiFn: ListSecretGroup,
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
          prop: 'supplier',
          label: '所属厂商'
        },
        {
          prop: 'name',
          label: '分组名称'
        },
        {
          prop: 'host',
          label: '请求地址'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: SecretGroup) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: SecretGroup) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: SecretGroup): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = { ...currentData.value }
    if (dialogType.value === 'add') {
      await CreateSecretGroup(value as CreateSecretGroupRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateSecretGroup(value as UpdateSecretGroupRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }
</script>
