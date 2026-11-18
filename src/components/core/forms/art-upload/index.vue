<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<template>
  <div class="upload" :class="{ 'hide-upload': uploadedFileList.length >= limit }" style="width: 100%">
    <ElUpload
      ref="uploadRef"
      v-model:file-list="uploadedFileList"
      :limit="limit"
      :multiple="multiple"
      :accept="accept"
      :list-type="assertListType()"
      :show-upload-button="true"
      :show-file-list="true"
      :auto-upload="autoUpload && !cut"
      :draggable="draggable"
      :http-request="customRequest"
      @change="uploadChange"
      @remove="handleRemove"
      @preview="handlePreview"
    >
      <div class="upload-card-box">
        <template v-if="$slots.icon">
          <slot name="icon"></slot>
        </template>
        <div v-else class="upload-card" :class="shape">
          <ElIcon v-if="accept == 'image/*'" class="icon"><Camera /></ElIcon>
          <ElIcon v-else><Plus /></ElIcon>
          <span v-if="text" class="text">{{ text }}</span>
        </div>
        <!-- <div class="option-file" @click.stop.prevent="handleOptionFile">
          <ArtIcon value="iconsys-shanchuwenjian"></ArtIcon>
        </div> -->
      </div>
    </ElUpload>

    <!-- 从文件管理选择：上传卡片右上角角标（已有文件时仍保留） -->
    <div v-if="selectFromFile" class="file-select" title="从文件管理选择" @click.stop="openFileSelect">
      <ElIcon><FolderOpened /></ElIcon>
    </div>

    <ElDialog
      v-model="fileVisible"
      title="从文件管理选择"
      class="art-upload-file-dialog"
      width="920px"
      align-center
      :destroy-on-close="true"
      @opened="layoutFileTable"
      @closed="resetFilePicker"
    >
      <div class="file-picker">
        <div class="file-picker__aside">
          <div class="file-picker__aside-title">目录</div>
          <ElScrollbar v-loading="directoryLoading" class="file-picker__tree">
            <ElEmpty v-if="!directoryLoading && !directoryData.length" description="暂无目录" :image-size="52" />
            <ElTree
              v-else
              ref="directoryTreeRef"
              :data="directoryTree"
              node-key="id"
              :props="{ label: 'label', children: 'children' }"
              :current-node-key="selectedDirectoryId"
              :expand-on-click-node="false"
              default-expand-all
              highlight-current
              @node-click="handleDirectorySelect"
            >
              <template #default="{ data }">
                <div class="file-directory" :title="data.raw?.path || '全部文件'">
                  <ElIcon><Folder /></ElIcon>
                  <span class="file-directory__name">{{ data.label }}</span>
                </div>
              </template>
            </ElTree>
          </ElScrollbar>
        </div>
        <div class="file-picker__main">
          <div class="file-picker__path" :title="selectedDirectoryPath || '全部文件'">
            当前目录：{{ selectedDirectoryPath || '全部文件' }}
            <span v-if="directoryHint" class="file-picker__hint">{{ directoryHint }}</span>
          </div>
          <ElTable
            ref="fileTableRef"
            v-loading="fileLoading"
            :data="fileData"
            row-key="id"
            height="360"
            table-layout="fixed"
            @row-dblclick="chooseFile"
          >
            <ElTableColumn label="文件" min-width="220">
              <template #default="{ row }">
                <div class="file-cell">
                  <ElImage v-if="isImageExt(row.ext)" class="file-thumb" :src="row.url" fit="cover" />
                  <div v-else class="file-thumb"
                    ><ElIcon><Document /></ElIcon
                  ></div>
                  <span class="file-cell__name" :title="row.name">{{ row.name }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn
              label="大小"
              width="90"
              :formatter="(row: FileItem) => getFileSize(Number(row.size)) || '0B'"
            />
            <ElTableColumn label="上传时间" width="160" :formatter="(row: FileItem) => formatTime(row.created_at)" />
            <ElTableColumn label="操作" width="64">
              <template #default="{ row }">
                <ElButton link type="primary" @click="chooseFile(row)">选择</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
          <div class="file-select-pager">
            <ElPagination
              v-model:current-page="filePage"
              :page-size="filePageSize"
              :total="fileTotal"
              layout="prev, pager, next, total"
              @current-change="loadFiles"
            />
          </div>
        </div>
      </div>
    </ElDialog>

    <el-image-viewer v-if="showPreview" show-progress :url-list="[previewSrc]" @close="showPreview = false">
    </el-image-viewer>

    <ElDialog
      v-model="cutVisible"
      :destroy-on-close="true"
      class="art-upload-crop-dialog"
      modal-class="cut-dialog"
      title="图片裁剪"
      width="720px"
      align-center
    >
      <div class="cutter">
        <Cutter
          :img-url="cutFile?.url"
          :cut-width="cut?.width"
          :cut-height="cut?.height"
          :box-width="cut?.boxWidth || 680"
          :box-height="cut?.boxHeight"
          @success="handleCutter"
        ></Cutter>
      </div>
    </ElDialog>
    <!-- 
    <ElDialog v-model="optionVisible" :fullscreen="true" :destroy-on-close="true" title="图片裁剪" align-center>
      <div class="cutter">
        <File></File>
      </div>
    </ElDialog> -->
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, ref } from 'vue'
  import { UploadFiles, UploadFile as UploadFileItem, type UploadRawFile } from 'element-plus'
  import { Plus, Camera, FolderOpened, Folder, Document } from '@element-plus/icons-vue'
  import { UploadRequestOptions, UploadProgressEvent } from 'element-plus/es/components/upload/src/upload'
  import { rurl } from '@/utils/resource/url'
  import { uploadFile } from '@/utils/resource/upload'
  import { imageToIco } from '@/utils/resource/image-to-ico'
  import { isPortraitImage } from '@/utils/resource/image'
  import { getFileSize } from '@/utils/file'
  import { formatTime } from '@/utils/time'
  import { ListFile, ListUserFile } from '@/api/resource/file/api'
  import type { FileItem } from '@/api/resource/file/type'
  import { ListDirectory } from '@/api/resource/directory/api'
  import type { DirectoryView } from '@/api/resource/directory/type'

  defineOptions({ name: 'ArtUpload' })

  const emit = defineEmits(['change', 'update:modelValue'])
  type ListType = 'picture' | 'text' | 'picture-card'
  interface UploadProps {
    modelValue?: string | string[]
    elFormMode?: boolean
    draggable?: boolean
    multiple?: boolean
    shape?: string
    size?: number
    text?: string
    files?: any[]
    limit?: number
    listType?: string
    accept?: string
    directoryId?: number
    directoryPath?: string
    height?: string
    width?: string
    fileSize?: number
    rename?: string
    store?: string
    autoUpload?: boolean
    /** 上传前将图片转为 ICO（favicon 用；非 .ico 文件生效，Canvas 128x128 打包） */
    convertToIco?: boolean
    /** 是否显示"从文件选择"：默认从资源中心文件管理里挑已有文件回填（无需重新上传） */
    selectFromFile?: boolean
    cut?: {
      enable: boolean
      width: number
      height: number
      boxWidth?: number
      boxHeight?: number
    }
  }

  const props = withDefaults(defineProps<UploadProps>(), {
    elFormMode: false,
    draggable: false,
    multiple: false,
    shape: 'square',
    size: 100,
    text: '点击上传',
    files: () => [],
    limit: 1,
    listType: 'picture-card',
    accept: 'image/*',
    autoUpload: true,
    selectFromFile: true
  })

  const showPreview = ref(false)
  const previewSrc = ref('')

  const uploadRef = ref()
  const uploadedFileList = ref<UploadFileItem[]>([])
  const domwidth = ref(`${props.size}px`)
  const domheight = ref(`${props.size}px`)
  const dommargin = ref('8px')

  const cutVisible = ref(false)
  const cutFile = ref<UploadFileItem>({} as UploadFileItem)

  // const uploadedFileList = computed({
  //   get() {
  //     if (!props.modelValue) {
  //       return []
  //     }
  //     if (Array.isArray(props.modelValue)) {
  //       return props.modelValue.map(
  //         (item: string) =>
  //           ({
  //             name: item,
  //             url: rurl(item),
  //             status: 'success',
  //             response: {
  //               key: item
  //             }
  //           }) as UploadFileItem
  //       )
  //     } else {
  //       return [
  //         {
  //           name: props.modelValue,
  //           url: rurl(props.modelValue as string),
  //           status: 'success'
  //         } as UploadFileItem
  //       ]
  //     }
  //   },
  //   set() {}
  // })

  watch(
    () => props.modelValue,
    (val) => {
      if (!val) {
        uploadedFileList.value = []
        return
      }
      if (Array.isArray(val)) {
        const keys = val.join(',')
        const oriKeys = uploadedFileList.value.map((item: any) => {
          return item.response?.key
        })

        if (keys === oriKeys.join(',')) return

        const data = val.map(
          (item: string) =>
            ({
              name: item,
              url: rurl(item),
              status: 'success',
              response: {
                key: item
              }
            }) as UploadFileItem
        )
        uploadedFileList.value = data
      } else {
        uploadedFileList.value = [
          {
            name: val,
            url: rurl(val),
            status: 'success'
          } as UploadFileItem
        ]
      }
    },
    { immediate: true, deep: true }
  )

  if (props.width) {
    domwidth.value = props.width
  }

  if (props.height) {
    domheight.value = props.height
  }

  if (props.limit === 1) {
    dommargin.value = '0px !important'
  }

  const assertListType = (): ListType => {
    return props.listType as ListType
  }

  const GetUploadList = (): UploadFileItem[] => {
    return uploadedFileList.value
  }

  const Upload = (): UploadFileItem[] => {
    return uploadRef.value.submit()
  }

  const WaitUploadSuccess = () => {
    const isSuccess = () => {
      let success = true
      let error = false
      uploadedFileList.value.forEach((file: UploadFileItem) => {
        if (file.status !== 'success') success = false
        if (file.status === 'fail') error = true
      })
      return {
        success,
        error
      }
    }
    return new Promise<void>((resolve, reject) => {
      const timer = setInterval(() => {
        const res = isSuccess()
        if (res.success) {
          clearInterval(timer)
          resolve()
        }
        if (res.error) {
          clearInterval(timer)
          reject()
        }
      }, 1000)
    })
  }

  defineExpose({ GetUploadList, Upload, WaitUploadSuccess })

  // init 组件初始化
  props.files.forEach((item: any) => {
    uploadedFileList.value.push({
      url: item.url,
      name: item.name,
      response: {
        src: item.url,
        sha: item.sha
      }
    } as UploadFileItem)
  })

  const handleCutter = (blob: any) => {
    const filename = cutFile.value.name
    const file = new File([blob], filename, {
      type: blob.type,
      lastModified: Date.now()
    })

    // 特殊方式解决，直接替换raw 不会触发change事件
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    cutFile.value.raw.cutFile = file
    cutVisible.value = false

    Upload()
  }

  // 上传修改触发
  const uploadChange = async (item: UploadFileItem, list: UploadFiles) => {
    if (item.status === 'ready' && props.cut) {
      const raw = item.raw as File | undefined
      if (raw && (await isPortraitImage(raw))) {
        if (item.status !== 'ready') return
        await nextTick()
        uploadRef.value?.submit()
        return
      }
      cutVisible.value = true
      cutFile.value = item
    }

    if (item.status !== 'success') return

    const res: any[] = []
    list.forEach((ite: UploadFileItem) => {
      if (ite.status === 'success') res.push(ite.response)
    })

    const resp = item.response as any
    if (!resp?.key) return
    if (props.limit === 1) {
      emit('update:modelValue', resp.key)
    } else {
      const keys = res.map((ite) => ite?.key)
      emit('update:modelValue', keys)
    }
    emit('change', res)
  }

  const customRequest = async (options: UploadRequestOptions): Promise<unknown> => {
    const { onProgress, file } = options
    let orifile = file

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (file.cutFile) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      orifile = file.cutFile
    }

    if (props.fileSize && (file.size as number) / 1024 > props.fileSize) {
      return Promise.reject('超过文件大小限制')
    }
    try {
      onProgress({ percent: 0 } as UploadProgressEvent)

      // favicon 场景：非 .ico 图片先转成 ICO 再走上传（新上传契约：取片大小 → 分片摘要 → 预上传 → 预签名直传 → 完成）
      if (props.convertToIco && !file.name.toLowerCase().endsWith('.ico')) {
        const icoName = (props.rename || file.name.replace(/\.[^.]+$/, '')) + '.ico'
        const ico = await imageToIco(file, 128)
        const converted = new File([ico], icoName, { type: 'image/x-icon' }) as UploadRawFile
        converted.uid = file.uid // 保留原始 uid，避免上传组件按文件身份重复触发
        orifile = converted
      }
      const result = await uploadFile(orifile, {
        path: props.directoryPath,
        name: props.rename ? renameFileName(props.rename, file.name) : file.name,
        onProgress: (percent) => onProgress({ percent: Math.min(99, percent) } as UploadProgressEvent)
      })
      onProgress({ percent: 100 } as UploadProgressEvent)
      return result
    } catch (error) {
      return Promise.reject('文件上传失败' + (error || ''))
    }
  }

  // 重命名：保留扩展名，替换主名
  const renameFileName = (rename: string, name: string): string => {
    const idx = name.lastIndexOf('.')
    return idx > 0 ? rename + name.slice(idx) : rename
  }

  const handlePreview = (file: UploadFileItem) => {
    previewSrc.value = file.url || ''
    showPreview.value = true
  }

  const handleRemove = (_: UploadFileItem, list: UploadFiles) => {
    const res: UploadFileItem[] = []
    list.forEach((ite: UploadFileItem) => {
      if (ite.status === 'success') res.push(ite)
    })

    if (props.limit === 1) {
      emit('update:modelValue', undefined)
    } else {
      emit(
        'update:modelValue',
        res.map((ite: UploadFileItem) => (ite.response as { key?: string })?.key)
      )
    }

    emit('change', res)
  }

  // ===== 从文件管理选择 =====
  const fileVisible = ref(false)
  const fileData = ref<FileItem[]>([])
  const fileLoading = ref(false)
  const filePage = ref(1)
  const filePageSize = 20
  const fileTotal = ref(0)
  const fileTableRef = ref()

  // 图片后缀（列表出缩略图；其余显示文件图标）
  const isImageExt = (ext: string) => ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg'].includes(ext)

  // 目录树：0 表示「全部文件」（当前用户全部文件），其余为资源目录 id
  const ALL_FILES_ID = 0
  const directoryLoading = ref(false)
  const directoryData = ref<DirectoryView[]>([])
  const directoryHint = ref('')
  const directoryTreeRef = ref()
  const selectedDirectoryId = ref<number>(ALL_FILES_ID)
  const selectedDirectoryPath = ref('')

  interface DirectoryTreeNode {
    id: number
    label: string
    raw?: DirectoryView
    children: DirectoryTreeNode[]
  }

  const parentPathOf = (path: string) => {
    const normalized = path.replace(/\/+$/, '')
    const index = normalized.lastIndexOf('/')
    return index > 0 ? normalized.slice(0, index) : ''
  }

  const normalizeDirectoryPath = (path?: string) => {
    const value = (path || '').trim().replace(/^\/+|\/+$/g, '')
    return value ? `/${value}` : ''
  }

  // 平铺目录按 path 组装为树；父目录缺失时该节点作为根
  const directoryTree = computed<DirectoryTreeNode[]>(() => {
    const allNode: DirectoryTreeNode = { id: ALL_FILES_ID, label: '全部文件', children: [] }
    const byPath: Record<string, DirectoryTreeNode> = {}
    directoryData.value.forEach((directory) => {
      const path = normalizeDirectoryPath(directory.path)
      if (!path) return
      byPath[path] = {
        id: directory.id,
        label: directory.name || path.split('/').filter(Boolean).pop() || path,
        raw: directory,
        children: []
      }
    })

    const roots: DirectoryTreeNode[] = []
    Object.entries(byPath).forEach(([path, node]) => {
      const parent = byPath[parentPathOf(path)]
      if (parent) parent.children.push(node)
      else roots.push(node)
    })
    return [allNode, ...roots]
  })

  const resetFilePicker = () => {
    filePage.value = 1
    fileData.value = []
    fileTotal.value = 0
    directoryData.value = []
    directoryHint.value = ''
    selectedDirectoryId.value = ALL_FILES_ID
    selectedDirectoryPath.value = ''
    directoryTreeRef.value?.setCurrentKey(ALL_FILES_ID)
  }

  const openFileSelect = async () => {
    resetFilePicker()
    fileVisible.value = true
    await loadDirectories()
    if (!fileVisible.value) return
    await loadFiles()
  }

  const loadDirectories = async () => {
    directoryLoading.value = true
    try {
      const res = await ListDirectory({})
      directoryData.value = res.list || []

      const wantedPath = normalizeDirectoryPath(props.directoryPath)
      const wantedId = props.directoryId
      const matched =
        (wantedId && directoryData.value.find((directory) => directory.id === wantedId)) ||
        (wantedPath && directoryData.value.find((directory) => normalizeDirectoryPath(directory.path) === wantedPath))

      if (matched) {
        selectedDirectoryId.value = matched.id
        selectedDirectoryPath.value = normalizeDirectoryPath(matched.path)
        directoryHint.value = ''
      } else {
        selectedDirectoryId.value = ALL_FILES_ID
        selectedDirectoryPath.value = ''
        directoryHint.value = wantedPath ? '（当前上传目录尚未创建，已显示全部文件）' : ''
      }

      await nextTick()
      directoryTreeRef.value?.setCurrentKey(selectedDirectoryId.value)
    } catch (e: any) {
      directoryData.value = []
      selectedDirectoryId.value = ALL_FILES_ID
      selectedDirectoryPath.value = ''
      directoryHint.value = '（目录加载失败，已显示全部文件）'
      ElMessage.error(e?.message || '获取目录列表失败')
    } finally {
      directoryLoading.value = false
    }
  }

  const layoutFileTable = async () => {
    await nextTick()
    fileTableRef.value?.doLayout()
  }

  let fileRequestId = 0
  const loadFiles = async () => {
    const requestId = ++fileRequestId
    fileLoading.value = true
    try {
      const directoryId = selectedDirectoryId.value
      const res = directoryId
        ? await ListFile({ directory_id: directoryId, page: filePage.value, page_size: filePageSize })
        : await ListUserFile({ page: filePage.value, page_size: filePageSize })
      if (requestId !== fileRequestId) return
      fileData.value = res.list || []
      fileTotal.value = res.total || 0
      layoutFileTable()
    } catch (e: any) {
      if (requestId !== fileRequestId) return
      ElMessage.error(e?.message || '获取文件列表失败')
    } finally {
      if (requestId === fileRequestId) fileLoading.value = false
    }
  }

  const handleDirectorySelect = (node: DirectoryTreeNode) => {
    selectedDirectoryId.value = node.id
    selectedDirectoryPath.value = node.raw ? normalizeDirectoryPath(node.raw.path) : ''
    directoryHint.value = ''
    filePage.value = 1
    loadFiles()
  }

  const chooseFile = (row: FileItem) => {
    const current = props.modelValue
    if (props.limit === 1 || !props.multiple) {
      emit('update:modelValue', row.key)
      emit('change', [{ key: row.key }])
      fileVisible.value = false
      return
    }

    const keys = (Array.isArray(current) ? current : current ? [current] : []).filter(Boolean)
    if (!keys.includes(row.key) && keys.length >= props.limit) {
      ElMessage.warning(`最多选择 ${props.limit} 个文件`)
      return
    }

    const nextKeys = keys.includes(row.key) ? keys : [...keys, row.key]
    emit('update:modelValue', nextKeys)
    emit(
      'change',
      nextKeys.map((key) => ({ key }))
    )
    fileVisible.value = false
  }

  // const optionVisible = ref(false)
  // const handleOptionFile = () => {
  //   optionVisible.value = true
  // }
</script>

<style scoped lang="scss">
  .upload-card-box {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .option-file {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 25px;
    height: 25px;
    background: var(--el-fill-color-light);
  }

  :global(.art-upload-crop-dialog) {
    max-width: calc(100vw - 48px);
  }

  :global(.art-upload-file-dialog) {
    max-width: calc(100vw - 32px);
  }

  .cutter {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .upload {
    position: relative;

    :deep(.el-icon) {
      font-size: 14px !important;
    }

    :deep(.el-upload-list__item-status-label) {
      display: none;
    }

    :deep(.el-upload--picture-card) {
      width: v-bind(domwidth) !important;
      height: v-bind(domheight) !important;
      background-color: none !important;
      border: none !important;
    }

    :deep(.el-icon--close-tip) {
      display: none !important;
    }

    :deep(.el-upload-list--picture-card .el-upload-list__item) {
      width: v-bind(domwidth) !important;
      height: v-bind(domheight) !important;
      border-radius: 4px !important;
    }

    :deep(.el-upload-list--picture-card .el-upload-list__item-thumbnail) {
      object-fit: cover !important;
    }
  }

  .hide-upload {
    :deep(.el-upload) {
      display: none;
    }

    :deep(.el-upload-list) {
      margin-top: 0;
    }

    :deep(.el-upload-list--text > .el-upload-list__item) {
      background-color: var(--el-fill-color-light);
    }
  }

  .upload-card {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: v-bind(domwidth);
    height: v-bind(domheight);
    background-color: var(--el-fill-color-light);
    border-radius: 4px;

    .text {
      height: 12px;
      font-size: 12px;
      color: var(--el-color-info);
    }

    .icon {
      top: 0;
      font-size: 22px;
      font-weight: normal;
      line-height: 22px;
      color: var(--el-color-info);
    }

    &:hover {
      background-color: var(--el-fill-color);
    }
  }

  .circle {
    border-radius: 50%;
  }

  .square {
    border-radius: 4px;
  }

  .file-select {
    position: absolute;
    top: 0;
    left: calc(v-bind(domwidth) - 18px);
    z-index: 10;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 12px;
    color: #fff;
    cursor: pointer;
    background: var(--el-color-primary);
    border-radius: 50%;
    box-shadow: 0 1px 4px rgb(0 0 0 / 20%);

    &:hover {
      opacity: 0.85;
    }
  }

  .file-cell {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .file-cell__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-thumb {
    display: flex;
    flex: 0 0 36px;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    overflow: hidden;
    font-size: 18px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  .file-picker {
    display: flex;
    gap: 16px;
    min-height: 400px;
  }

  .file-picker__main {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .file-picker__path {
    margin-bottom: 10px;
    overflow: hidden;
    font-size: 13px;
    color: var(--el-text-color-regular);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-picker__hint {
    margin-left: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .file-picker__aside {
    display: flex;
    flex: 0 0 220px;
    flex-direction: column;
    min-width: 0;
    padding-right: 14px;
    border-right: 1px solid var(--el-border-color-lighter);
  }

  .file-picker__aside-title {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .file-picker__tree {
    height: 396px;
  }

  .file-directory {
    display: flex;
    gap: 6px;
    align-items: center;
    min-width: 0;
  }

  .file-directory__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-select-pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }
</style>
