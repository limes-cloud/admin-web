<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton
              type="primary"
              :icon="UploadFilled"
              :disabled="!directory || uploading"
              :loading="uploading"
              @click="onUpload"
            >
              上传文件
            </ElButton>
          </ElSpace>
          <input ref="fileInput" type="file" multiple hidden :accept="acceptAttr" @change="onFilesPicked" />
        </template>
      </ArtTableHeader>

    <ElEmpty v-if="!directory" description="请选择左侧目录" />

    <ArtTable
      v-else
      :loading="loading"
      :data="data"
      :columns="columns"
      :pagination="pagination"
      row-key="id"
      @pagination:size-change="handleSizeChange"
      @pagination:current-change="handleCurrentChange"
    >
      <template #preview="{ row }">
        <ElImage
          v-if="isImage(row.ext)"
          class="file-media"
          :src="row.url"
          fit="cover"
          :preview-src-list="[row.url]"
          preview-teleported
        />
        <div v-else-if="isVideo(row.ext)" class="file-media file-media--video">
          <video preload="metadata"><source :src="row.url" /></video>
          <div class="cover" @click="openPreview(row)">
            <ArtIcon value="iconsys-bofang" :size="22" />
          </div>
        </div>
        <div v-else-if="isAudio(row.ext)" class="file-media file-media--music" @click="openPreview(row)">
          <ArtFileType :file="fileKey(row)" />
          <div class="cover">
            <ArtIcon value="iconsys-bofang" :size="22" />
          </div>
        </div>
        <ArtFileType v-else class="file-media" :file="fileKey(row)" />
      </template>
      <template #operation="{ row }">
        <ArtOperation :list="operationItems" :data="row"></ArtOperation>
      </template>
    </ArtTable>

    <!-- 预览 -->
    <ElDialog v-model="previewVisible" title="预览" width="640px" align-center :destroy-on-close="true">
      <div class="file-preview">
        <ElImage v-if="previewType === 'image'" :src="previewUrl" fit="contain" class="file-preview__media" />
        <video v-else-if="previewType === 'video'" :src="previewUrl" controls class="file-preview__media"></video>
        <audio v-else-if="previewType === 'audio'" :src="previewUrl" controls></audio>
      </div>
    </ElDialog>

    <!-- 改名 / 移动 -->
    <ElDialog v-model="editVisible" title="重命名 / 移动" width="420px" align-center :destroy-on-close="true">
      <ElForm label-width="72px">
        <ElFormItem label="文件名">
          <ElInput v-model="editName" placeholder="请输入文件名" maxlength="255" />
        </ElFormItem>
        <ElFormItem label="所在目录">
          <ElSelect v-model="editDirId" filterable placeholder="请选择目录" style="width: 100%">
            <ElOption v-for="d in dirOptions" :key="d.id" :label="d.name || d.path" :value="d.id" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editVisible = false">取消</ElButton>
        <ElButton type="primary" @click="submitEdit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 上传进度 -->
    <ElDialog
      v-model="uploading"
      title="上传中"
      width="420px"
      align-center
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="upload-progress">
        <p class="upload-progress__name" :title="uploadName">{{ uploadName }}</p>
        <ElProgress :percentage="uploadPercent" :status="uploadPercent >= 100 ? 'success' : ''" />
        <p v-if="uploadTotal > 1" class="upload-progress__count">{{ uploadIndex }} / {{ uploadTotal }}</p>
      </div>
    </ElDialog>
    </ElCard>
  </div>
</template>
<!-- __SCRIPT__ -->
<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { CopyDocument, Download, Edit, Delete, UploadFilled } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import { getFileSize } from '@/utils/file'

  import { ListFile, UpdateUserFile, DeleteUserFile } from '@/api/resource/file/api'
  import { FileItem } from '@/api/resource/file/type'
  import { ListDirectory } from '@/api/resource/directory/api'
  import { DirectoryView } from '@/api/resource/directory/type'
  import { uploadFile } from '@/utils/resource/upload'

  defineOptions({ name: 'FilePane' })

  const props = defineProps<{ directory: DirectoryView | null; app: string }>()

  // 上传（走 utils/resource/upload：预签名分片直传 + 秒传/续传）
  const fileInput = ref<HTMLInputElement>()
  const uploading = ref(false)
  const uploadPercent = ref(0)
  const uploadName = ref('')
  const uploadIndex = ref(0)
  const uploadTotal = ref(0)

  // 目录 accept（* 或逗号分隔后缀）→ input accept 属性
  const acceptAttr = computed(() => {
    const a = props.directory?.accept
    if (!a || a === '*') return ''
    return a
      .split(',')
      .map((e) => '.' + e.trim().replace(/^\./, ''))
      .filter((e) => e !== '.')
      .join(',')
  })

  const onUpload = () => {
    if (!props.directory) return
    fileInput.value?.click()
  }

  const onFilesPicked = async (e: Event) => {
    const input = e.target as HTMLInputElement
    const files = Array.from(input.files || [])
    input.value = '' // 允许再次选择同名文件
    if (!files.length || !props.directory) return
    uploading.value = true
    uploadTotal.value = files.length
    try {
      for (let i = 0; i < files.length; i += 1) {
        uploadIndex.value = i + 1
        uploadName.value = files[i].name
        uploadPercent.value = 0
        await uploadFile(files[i], {
          app: props.app,
          path: props.directory.path,
          onProgress: (p) => {
            uploadPercent.value = p
          }
        })
      }
      ElMessage.success('上传完成')
      refreshData()
    } catch (err: any) {
      ElMessage.error(err?.message || '上传失败')
    } finally {
      uploading.value = false
    }
  }

  const isImage = (ext: string) => ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico'].includes(ext)
  const isVideo = (ext: string) => ['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(ext)
  const isAudio = (ext: string) => ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg'].includes(ext)
  // ArtFileType 按文件名后缀取图标
  const fileKey = (row: FileItem) => row.name || `file.${row.ext}`

  // 预览
  const previewVisible = ref(false)
  const previewType = ref<'image' | 'video' | 'audio' | ''>('')
  const previewUrl = ref('')
  const openPreview = (row: FileItem) => {
    if (isImage(row.ext)) previewType.value = 'image'
    else if (isVideo(row.ext)) previewType.value = 'video'
    else if (isAudio(row.ext)) previewType.value = 'audio'
    else {
      ElMessage.info('该类型暂不支持预览，可下载后查看')
      return
    }
    previewUrl.value = row.url
    previewVisible.value = true
  }

  // 改名 / 移动
  const dirOptions = ref<DirectoryView[]>([])
  const loadDirs = () => {
    ListDirectory({}, props.app).then((res) => {
      dirOptions.value = res.list || []
    })
  }
  const editVisible = ref(false)
  const editId = ref(0)
  const editName = ref('')
  const editDirId = ref<number>()
  const openEdit = (row: FileItem) => {
    editId.value = row.id
    editName.value = row.name
    editDirId.value = row.directory_id
    if (!dirOptions.value.length) loadDirs()
    editVisible.value = true
  }
  const submitEdit = async () => {
    if (!editName.value.trim()) {
      ElMessage.warning('请输入文件名')
      return
    }
    await UpdateUserFile(
      { id: editId.value, name: editName.value.trim(), directory_id: editDirId.value },
      props.app
    )
    ElMessage.success('修改成功')
    editVisible.value = false
    refreshData()
  }

  const operationItems = [
    {
      icon: CopyDocument,
      label: '复制链接',
      color: 'primary',
      click: async (row: FileItem) => {
        await navigator.clipboard.writeText(row.url)
        ElMessage.success('链接已复制')
      }
    },
    {
      icon: Download,
      label: '下载',
      color: 'primary',
      click: (row: FileItem) => window.open(row.url)
    },
    {
      icon: Edit,
      label: '编辑',
      color: 'warning',
      permission: 'resource:file:update',
      click: (row: FileItem) => openEdit(row)
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除',
      color: 'danger',
      permission: 'resource:file:delete',
      click: async (row: FileItem) => {
        await DeleteUserFile({ id: row.id }, props.app)
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
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshRemove
  } = useTable({
    core: {
      apiFn: (params: Parameters<typeof ListFile>[0]) => ListFile(params, props.app),
      immediate: false,
      paginationKey: { current: 'page', size: 'page_size' },
      apiParams: { directory_id: 0 },
      columnsFactory: () => [
        { prop: 'preview', label: '', width: 70, useSlot: true, slotName: 'preview' },
        { prop: 'name', label: '文件名', minWidth: 180 },
        { prop: 'ext', label: '类型', width: 90 },
        {
          prop: 'size',
          label: '大小',
          width: 110,
          formatter: (row: FileItem) => getFileSize(Number(row.size)) || '0B'
        },
        {
          prop: 'created_at',
          label: '上传时间',
          width: 170,
          formatter: (row: FileItem) => formatTime(row.created_at)
        },
        { prop: 'operation', label: '操作', width: 150, fixed: 'right', useSlot: true, slotName: 'operation' }
      ]
    }
  })

  // app / 目录切换 → 换 directory_id 重拉
  watch(
    () => [props.app, props.directory?.id] as const,
    ([app, id], previous) => {
      if (previous && app !== previous[0]) dirOptions.value = []
      Object.assign(searchParams, { directory_id: id || 0 })
      if (id) getData()
    },
    { immediate: true }
  )
</script>

<style scoped>
  .file-media {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    overflow: hidden;
    border-radius: 6px;
    background: var(--el-fill-color-light);
  }

  .file-media :deep(img),
  .file-media video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .file-media--video,
  .file-media--music {
    cursor: pointer;
  }

  .file-media .cover {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: rgb(0 0 0 / 25%);
  }

  .file-preview {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-preview__media {
    max-width: 100%;
    max-height: 60vh;
  }

  .upload-progress__name {
    margin: 0 0 10px;
    overflow: hidden;
    font-size: 13px;
    color: var(--el-text-color-regular);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .upload-progress__count {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: right;
  }
</style>
