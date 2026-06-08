<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')">新增轮播图</ElButton>
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
            inline-prompt
            active-text="启用"
            inactive-text="禁用"
            :before-change="handleUpdateStatus(row)"
          />
        </template>
        <template #image="{ row }">
          <ElImage :style="{ width: '180px', height: '100px' }" :src="$rurl(row.key, 360, 200)"></ElImage>
        </template>
        <template #operation="{ row }">
          <ArtOperation :list="operationItems" :data="row"></ArtOperation>
        </template>
      </ArtTable>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加轮播图' : '编辑轮播图'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="480px"
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
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElMessageBox } from 'element-plus'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import { CreateBanner, DeleteBanner, ListBanner, UpdateBanner } from '@/api/recipe/banner/api'
  import { CreateBannerRequest, Banner, UpdateBannerRequest } from '@/api/recipe/banner/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'Banner' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Banner>>({})

  const formItems = [
    {
      key: 'key',
      label: '轮播图片',
      type: 'upload',
      props: {
        rules: [{ required: true, message: '请上传轮播图', trigger: ['blur', 'change'] }],
        directoryPath: 'recipe/banner',
        width: 360,
        height: 200,
        cut: { enable: true }
      }
    },
    {
      key: 'title',
      label: '轮播标题',
      type: 'input',
      props: {
        placeholder: '请输入轮播标题',
        rules: [{ required: true, message: '请输入轮播标题', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'path',
      label: '跳转路径',
      type: 'input',
      props: {
        placeholder: '请输入跳转路径',
        rules: [{ required: true, message: '请输入跳转路径', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'weight',
      label: '轮播权重',
      type: 'number',
      defaultValue: 0,
      props: {
        placeholder: '请输入轮播权重',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入轮播描述', trigger: ['blur', 'change'] }]
      }
    }
  ]

  const operationItems = [
    {
      icon: Edit,
      label: '修改轮播图',
      color: 'warning',
      permission: 'recipe:banner:update',
      click: async (record: Banner) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除轮播图',
      color: 'danger',
      permission: 'recipe:banner:delete',
      click: async (record: Banner) => {
        await DeleteBanner({ id: record.id })
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
      apiFn: ListBanner,
      columnsFactory: () => [
        {
          prop: 'title',
          label: '轮播标题'
        },
        {
          prop: 'image',
          label: '轮播图片',
          useSlot: true,
          slotName: 'image'
        },
        {
          prop: 'status',
          label: '轮播状态',
          useSlot: true,
          slotName: 'status'
        },

        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: Banner) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: Banner) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: Banner): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      await CreateBanner(currentData.value as CreateBannerRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateBanner(currentData.value as UpdateBannerRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleUpdateStatus = (item: Banner): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改轮播图状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateBanner({ id: item.id, status: !item.status })
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
