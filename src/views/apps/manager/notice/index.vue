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
                v-permission="'manager:notice:classify:query'"
                v-ripple
                type="success"
                :icon="Expand"
                @click="showClassify"
              >
                类型管理
              </ElButton>
              <ElButton
                v-permission="'manager:notice:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
              >
                新增通知
              </ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          row-key="id"
          :pagination="pagination"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #status="{ row }">
            <el-switch
              v-model="row.status"
              :disabled="!$hasPermission('manager:notice:update')"
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
        :title="dialogType === 'add' ? '添加通知' : '编辑通知'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="620px"
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

      <!-- 类型弹窗 -->
      <ElDialog
        v-model="classifyVisible"
        title="类型管理"
        :destroy-on-close="true"
        body-class="art-form-dialog classify-dialog"
        width="620px"
        align-center
      >
        <Classify></Classify>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElMessageBox } from 'element-plus'
  import { Edit, Plus, Expand } from '@element-plus/icons-vue'
  import {
    CreateNotice,
    DeleteNotice,
    GetNotice,
    ListNotice,
    ListNoticeClassify,
    UpdateNotice
  } from '@/api/manager/notice/api'
  import { CreateNoticeRequest, Notice, NoticeClassify, UpdateNoticeRequest } from '@/api/manager/notice/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import Classify from './classify/index.vue'
  import { App } from '@/api/manager/app/type'
  import { ListApp } from '@/api/manager/app/api'

  defineOptions({ name: 'Notice' })

  // 弹窗相关
  const classifyVisible = ref(false)
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Notice>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const classifies = ref<NoticeClassify[]>([])
  ListNoticeClassify().then((res) => {
    classifies.value = res.list
  })

  const apps = ref<App[]>([])
  const getApps = (query?: string) => {
    ListApp({ page: 1, pageSize: 10, name: query, type: 'app' }).then((res) => {
      apps.value = res.list
    })
  }
  getApps()

  const operationItems = [
    {
      icon: Edit,
      label: '修改通知',
      color: 'warning',
      permission: 'manager:notice:update',
      click: async (record: Notice) => {
        const res = await GetNotice({ id: record.id })
        showDialog('edit', res)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除通知',
      color: 'danger',
      permission: 'manager:notice:delete',
      click: async (record: Notice) => {
        await DeleteNotice({ id: record.id })
        refreshRemove()
      }
    }
  ]

  const searchItems = reactive([
    {
      key: 'app',
      label: '所属应用',
      type: 'select',
      props: {
        placeholder: '请选择所属应用',
        clearable: true,
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getApps(query)
          } else {
            getApps()
          }
        },
        options: apps,
        props: {
          label: 'name',
          value: 'id'
        },
        rules: [{ required: true, message: '请选择所属应用', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'classifyId',
      label: '通知类型',
      type: 'select',
      props: {
        placeholder: '请输入通知类型',
        options: classifies,
        rules: [{ required: true, message: '请输入通知名称', trigger: ['blur', 'change'] }],
        props: {
          label: 'name',
          value: 'id'
        }
      }
    },
    {
      label: '通知标题',
      key: 'title',
      type: 'input',
      placeholder: '请输入通知标题',
      clearable: true,
      props: { maxlength: '255', placeholder: '请输入通知标题', clearable: true }
    },
    {
      label: '通知状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择通知状态',
        clearable: true,
        options: [
          { label: '正常', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ])

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
      apiFn: ListNotice,
      apiParams: {
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'title',
          label: '通知标题'
        },
        {
          prop: 'app.name',
          label: '所属应用'
        },
        {
          prop: 'classify.name',
          label: '通知类型'
        },
        {
          prop: 'unit',
          label: '发布单位'
        },
        {
          prop: 'status',
          label: '通知状态',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Notice) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Notice) => formatTime(row.updatedAt)
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
      key: 'app',
      label: '所属应用',
      type: 'select',
      props: {
        placeholder: '请选择所属应用',
        clearable: true,
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getApps(query)
          } else {
            getApps()
          }
        },
        options: apps,
        props: {
          label: 'name',
          value: 'id'
        },
        rules: [{ required: true, message: '请选择所属应用', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'classifyId',
      label: '通知类型',
      type: 'select',
      props: {
        placeholder: '请输入通知类型',
        options: classifies,
        rules: [{ required: true, message: '请输入通知名称', trigger: ['blur', 'change'] }],
        props: {
          label: 'name',
          value: 'id'
        }
      }
    },
    {
      key: 'title',
      label: '通知名称',
      type: 'input',
      props: {
        placeholder: '请输入通知名称',
        rules: [{ required: true, message: '请输入通知名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'description',
      label: '通知描述',
      type: 'input',
      props: {
        placeholder: '请输入通知描述',
        rules: [{ required: true, message: '请输入通知描述', trigger: ['blur', 'change'] }],
        type: 'textarea'
      }
    },
    {
      key: 'unit',
      label: '发布单位',
      type: 'input',
      props: {
        placeholder: '请输入发布单位',
        rules: [{ required: true, message: '请输入发布单位', trigger: ['blur', 'change'] }]
      }
    },
    {
      label: '是否置顶',
      key: 'isTop',
      type: 'select',
      props: {
        placeholder: '请选择是否置顶',
        clearable: true,
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    },
    {
      key: 'content',
      label: '通知内容',
      type: 'rich',
      props: {
        placeholder: '请输入通知内容',
        rules: [{ required: true, message: '请输入通知内容', trigger: ['blur', 'change'] }]
      }
    }
  ])

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: Notice): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateNotice(currentData.value as CreateNoticeRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateNotice(currentData.value as UpdateNoticeRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: Notice): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改通知状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateNotice({ id: item.id, status: !item.status })
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

  const showClassify = () => {
    classifyVisible.value = true
  }
</script>

<style lang="scss" scoped>
  :deep(.classify-dialog) {
    min-height: 300px;
  }

  :deep(.classify-dialog .el-table__empty-block) {
    min-height: 200px;
  }
</style>
