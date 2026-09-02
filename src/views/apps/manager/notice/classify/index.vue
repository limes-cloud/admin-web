<template>
  <div>
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
      <ArtTableHeader
        v-model:columns="columnChecks"
        layout="search,refresh,size,columns,settings"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton
              v-permission="'manager:notice:classify:add'"
              v-ripple
              type="primary"
              :icon="Plus"
              @click="showDialog('add')"
              >新增分类</ElButton
            >
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable :loading="loading" :data="data" :columns="columns" row-key="id">
        <template #operation="{ row }">
          <ArtOperation :list="operationItems" :data="row"></ArtOperation>
        </template>
        <template #logo="{ row }">
          <ElAvatar shape="square" :size="60" :src="$rurl(row.logo)"></ElAvatar>
        </template>
      </ArtTable>
    </div>

    <!-- 新增/修改弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加分类' : '编辑分类'"
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
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import {
    CreateNoticeClassify,
    DeleteNoticeClassify,
    ListNoticeClassify,
    UpdateNoticeClassify
  } from '@/api/manager/notice/api'
  import { CreateNoticeClassifyRequest, NoticeClassify, UpdateNoticeClassifyRequest } from '@/api/manager/notice/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'NoticeClassify' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<NoticeClassify>>({})

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const searchItems = [
    {
      label: '分类名称',
      key: 'name',
      type: 'input',
      props: { maxlength: '32', placeholder: '请输入分类名称', clearable: true }
    }
  ]

  const formItems = computed(() => [
    {
      key: 'logo',
      label: '分类logo',
      type: 'upload',
      props: {
        rules: [{ required: true, message: '请上传分类logo', trigger: ['blur', 'change'] }],
        directoryPath: 'manager/notice/classify/logo',
        cut: {
          enable: true,
          width: 256,
          height: 256
        }
      }
    },
    {
      key: 'name',
      label: '分类名称',
      type: 'input',
      props: {
        placeholder: '请输入分类名称',
        rules: [{ required: true, message: '请输入分类名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'weight',
      label: '分类权重',
      type: 'number',
      defaultValue: 0,
      props: {
        placeholder: '请输入分类权重',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入分类权重', trigger: ['blur', 'change'] }]
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '修改分类',
      color: 'warning',
      permission: 'manager:notice:classify:update',
      click: async (record: NoticeClassify) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除分类',
      color: 'danger',
      permission: 'manager:notice:classify:delete',
      click: async (record: NoticeClassify) => {
        await DeleteNoticeClassify({ id: record.id })
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
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListNoticeClassify,
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
          label: '分类Logo',
          useSlot: true,
          slotName: 'logo'
        },
        {
          prop: 'name',
          label: '分类名称'
        },
        {
          prop: 'weight',
          label: '分类权重'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: NoticeClassify) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: NoticeClassify) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: NoticeClassify): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = currentData.value
    if (dialogType.value === 'add') {
      await CreateNoticeClassify(value as CreateNoticeClassifyRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateNoticeClassify(value as UpdateNoticeClassifyRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }
</script>
