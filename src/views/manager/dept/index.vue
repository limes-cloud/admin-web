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
                v-permission="'manager:dept:classify:query'"
                v-ripple
                type="success"
                :icon="Expand"
                @click="handleJumpClassify"
                >类型管理</ElButton
              >
              <ElButton
                v-permission="'manager:dept:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增部门</ElButton
              >
            </ElSpace>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :show-pagination="false"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #status="{ row }">
            <el-switch
              v-model="row.status"
              :disabled="!$hasPermission('manager:dept:update')"
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
        :title="dialogType === 'add' ? '添加部门' : '编辑部门'"
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
  import { ElMessageBox } from 'element-plus'
  import { Edit, Plus, Expand } from '@element-plus/icons-vue'
  import { CreateDept, DeleteDept, ListDept, ListDeptClassify, UpdateDept } from '@/api/manager/dept/api'
  import { CreateDeptRequest, Dept, DeptClassify, UpdateDeptRequest } from '@/api/manager/dept/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  const router = useRouter()

  defineOptions({ name: 'Dept' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Dept>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '部门标识',
      key: 'keyword',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入部门标识', clearable: true }
    },
    {
      label: '部门名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入部门名称',
      clearable: true,
      props: { maxlength: '32', placeholder: '请输入部门标识', clearable: true }
    },
    {
      label: '部门状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择部门状态',
        clearable: true,
        options: [
          { label: '正常', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ]

  const types = ref<DeptClassify[]>([])
  ListDeptClassify({ page: 1, pageSize: 10 }).then((res) => {
    types.value = res.list
  })

  const operationItems = [
    {
      icon: 'iconsys-tuandui_2',
      label: '角色绑定',
      color: 'primary',
      permission: 'manager:dept:role:query',
      click: async (record: Dept) => {
        router.push({
          name: 'DeptRole',
          query: {
            deptId: record.id
          }
        })
      }
    },
    {
      icon: Plus,
      label: '新建部门',
      color: 'primary',
      permission: 'manager:dept:add',
      click: async (record: Dept) => {
        showDialog('add', { parent: record, parentId: record.id } as Dept)
      }
    },
    {
      icon: Edit,
      label: '修改部门',
      color: 'warning',
      permission: 'manager:dept:update',
      click: async (record: Dept) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除部门',
      color: 'danger',
      permission: 'manager:dept:delete',
      click: async (record: Dept) => {
        await DeleteDept({ id: record.id })
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
      apiFn: ListDept,
      apiParams: {
        ...searchForm.value
      },
      excludeParams: ['page', 'pageSize'],
      columnsFactory: () => [
        {
          prop: 'keyword',
          label: '部门标识'
        },
        {
          prop: 'name',
          label: '部门名称'
        },
        {
          prop: 'classify.name',
          label: '部门类型'
        },
        {
          prop: 'logo',
          label: '部门Logo',
          useSlot: true,
          slotName: 'logo'
        },
        {
          prop: 'status',
          label: '部门状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'description',
          label: '部门描述'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Dept) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Dept) => formatTime(row.updatedAt)
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

  const formItems = computed(() => [
    {
      key: 'logo',
      label: '部门logo',
      type: 'upload',
      props: {
        rules: [{ required: true, message: '请上传部门logo', trigger: ['blur', 'change'] }],
        directoryPath: 'manager/dept/logo'
      }
    },
    {
      key: 'parentId',
      label: '上级部门',
      type: 'treeselect',
      props: {
        data: [{ id: 0, name: '顶级部门', children: data.value }],
        checkStrictly: true,
        props: {
          label: 'name',
          value: 'id'
        },
        rules: [{ required: true, message: '请选择上级部门', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'classifyId',
      label: '部门类型',
      type: 'select',
      props: {
        placeholder: '请输入部门类型',
        options: types.value,
        rules: [{ required: true, message: '请输入部门名称', trigger: ['blur', 'change'] }],
        props: {
          label: 'name',
          value: 'id'
        }
      }
    },
    {
      key: 'keyword',
      label: '部门标识',
      type: 'input',
      props: {
        placeholder: '请输入部门标识',
        disabled: dialogType.value === 'edit',
        rules: [
          { required: true, message: '请输入部门标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '部门标识格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ }
        ]
      }
    },
    {
      key: 'name',
      label: '部门名称',
      type: 'input',
      props: {
        placeholder: '请输入部门名称',
        rules: [{ required: true, message: '请输入部门名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '部门描述',
      type: 'input',
      props: {
        placeholder: '请输入部门描述',
        rules: [{ required: true, message: '请输入部门描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    }
  ])

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: Dept): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateDept(currentData.value as CreateDeptRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateDept(currentData.value as UpdateDeptRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: Dept): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改部门状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateDept({ id: item.id, status: !item.status })
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

  const handleJumpClassify = () => {
    router.push({ name: 'DeptClassify' })
  }
</script>
