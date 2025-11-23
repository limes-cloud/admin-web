<template>
  <div class="art-full-height cuetom-table">
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
              <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')"> 新增文件 </ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #logo="{ row }">
            <template v-if="isImage(row.key)">
              <div class="image">
                <ElImage
                  :src="$rurl(row.key, 100, 100)"
                  :style="{
                    width: '100%',
                    height: '100%'
                  }"
                  fit="cover"
                  :preview-src-list="[$rurl(row.key)]"
                ></ElImage>
              </div>
            </template>
            <template v-else-if="isVideo(row.key)">
              <div class="video">
                <video :id="'video-' + row.id" preload="metadata">
                  <source :src="$rurl(row.key)" />
                </video>
                <div class="cover">
                  <ArtIcon value="iconsys-bofang" @click="openFile(row, 'video')" :size="28"></ArtIcon>
                </div>
              </div>
            </template>
            <template v-else-if="isAudio(row.key)">
              <div class="music">
                <ArtFileType :file="row.key"></ArtFileType>
                <div class="cover">
                  <ArtIcon value="iconsys-bofang" @click="openFile(row, 'audio')" :size="28"></ArtIcon>
                </div>
              </div>
            </template>
            <template v-else>
              <ArtFileType :file="row.key"></ArtFileType>
            </template>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row"></ArtOperation>
          </template>
        </ArtTable>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加文件' : '编辑文件'"
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

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="previewVisible"
        title="文件预览"
        :destroy-on-close="true"
        body-class="art-form-dialog preview-dialog"
        width="500px"
        align-center
      >
        <template v-if="currentData.type == 'audio'">
          <audio :src="$rurl(currentData.key as string)" controls> 您的浏览器不支持 audio 元素。 </audio>
        </template>
        <template v-if="currentData.type == 'video'">
          <div class="video-model">
            <video preload="metadata" controls>
              <source :src="$rurl(currentData.key as string)" />
            </video>
          </div>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<style lang="scss" scoped>
  .preview {
    background-color: #f2f2f2;
  }

  .video-model {
    height: 100%;

    video {
      max-height: 320px;
    }

    audio {
      max-height: 320px;
    }
  }

  .image,
  .video,
  .music {
    position: relative;
    width: 70px;
    height: 80px;
    overflow: hidden;
    border-radius: 4px;

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }

    .cover {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #fff;
      background: rgb(0 0 0 / 20%);
      border-radius: 4px;

      .bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .icon {
        z-index: 10;
      }
    }
  }
</style>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { CopyDocument, Download, Edit, Plus } from '@element-plus/icons-vue'
  import { DeleteFile, ListFile, UpdateFile } from '@/api/resource/file/api'
  import { File, UpdateFileRequest } from '@/api/resource/file/type'
  import { Delete } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { getFileSize } from '@/utils/file'
  import { durl, rurl } from '@/utils/resource/url'

  const props = defineProps<{ directoryId: number }>()

  defineOptions({ name: 'File' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<File>>({})
  const previewVisible = ref<boolean>(false)

  // 搜索表单
  const searchForm = ref({
    directoryId: props.directoryId,
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const isImage = (key: string) => {
    return key?.endsWith('.png') || key?.endsWith('.jpg') || key?.endsWith('.ico') || key?.endsWith('.jpeg')
  }

  const isVideo = (key: string) => {
    return (
      key?.endsWith('.mov') ||
      key?.endsWith('.avi') ||
      key?.endsWith('.mp4') ||
      key?.endsWith('.mkv') ||
      key?.endsWith('.webm')
    )
  }

  const isAudio = (key: string) => {
    return (
      key?.endsWith('.wav') ||
      key?.endsWith('.mp3') ||
      key?.endsWith('.aac') ||
      key?.endsWith('.flac') ||
      key?.endsWith('.m4a')
    )
  }

  const searchItems = [
    {
      label: '文件名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入文件名称',
      clearable: true
    }
  ]

  const openFile = (file: File, tp: string) => {
    currentData.value = file
    switch (tp) {
      case 'audio':
      case 'video':
      case 'image':
        currentData.value.type = tp
        previewVisible.value = true
        break
      default:
        ElMessage.error('暂不支持查看此类型的文件')
        break
    }
  }

  const formItems = computed(() => [
    {
      key: 'key',
      label: '上传文件',
      type: 'upload',
      hidden: dialogType.value === 'edit',
      props: {
        accept: '*',
        directoryId: props.directoryId,
        placeholder: '请输入文件名称',
        rules: [{ required: true, message: '请输入文件名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'name',
      label: '上传文件',
      type: 'input',
      hidden: dialogType.value === 'add',
      props: {
        directoryId: props.directoryId,
        placeholder: '请输入文件名称',
        rules: [{ required: true, message: '请输入文件名称', trigger: ['blur', 'change'] }]
      }
    }
  ])

  const operationItems = [
    {
      icon: CopyDocument,
      label: '复制链接',
      color: 'primary',
      click: async (record: File) => {
        await navigator.clipboard.writeText(rurl(record.key))
        ElMessage.success('复制成功')
      }
    },
    {
      icon: Download,
      label: '下载文件',
      color: 'primary',
      permission: 'resource:file:update',
      click: async (record: File) => {
        window.open(durl(record.key, record.name))
      }
    },
    {
      icon: Edit,
      label: '修改文件',
      color: 'warning',
      permission: 'resource:file:update',
      click: async (record: File) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除文件',
      color: 'danger',
      permission: 'resource:file:delete',
      click: async (record: File) => {
        await DeleteFile({ ids: [record.id] })
        ElMessage.success('删除成功')
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
      apiFn: ListFile,
      immediate: false,
      apiParams: {
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'logo',
          label: '#',
          slotName: 'logo',
          useSlot: true,
          cellClassName: 'test'
        },
        {
          prop: 'name',
          label: '文件名称'
        },
        {
          prop: 'size',
          label: '文件大小',
          formatter(row: File) {
            return getFileSize(row.size * 1000)
          }
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: File) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: File) => formatTime(row.updatedAt)
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
  const showDialog = (type: Form.DialogType, row?: File): void => {
    dialogType.value = type
    currentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    if (dialogType.value === 'add') {
      refreshCreate()
    } else {
      await UpdateFile({ ...currentData.value, directoryId: props.directoryId } as UpdateFileRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  watch(
    () => props.directoryId,
    async () => {
      if (props.directoryId === 0) return

      Object.assign(searchParams, {
        directoryId: props.directoryId,
        keyword: undefined,
        name: undefined,
        status: undefined
      })
      await getData()

      searchForm.value = {
        directoryId: props.directoryId
      } as any
    },
    { immediate: true }
  )
</script>
