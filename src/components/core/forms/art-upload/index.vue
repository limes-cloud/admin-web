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
        <!-- 从文件管理选择：上传卡片右上角角标（点击不触发上传） -->
        <div v-if="selectFromFile" class="file-select" title="从文件管理选择" @click.stop="openFileSelect">
          <ElIcon><FolderOpened /></ElIcon>
        </div>
        <!-- <div class="option-file" @click.stop.prevent="handleOptionFile">
          <ArtIcon value="iconsys-shanchuwenjian"></ArtIcon>
        </div> -->
      </div>
    </ElUpload>

    <ElDialog
      v-model="fileVisible"
      title="从文件管理选择"
      width="700px"
      align-center
      :destroy-on-close="true"
      @closed="filePage = 1"
    >
      <ElTable v-loading="fileLoading" :data="fileData" row-key="id" height="360" @row-dblclick="chooseFile">
        <ElTableColumn label="预览" width="72">
          <template #default="{ row }">
            <ElImage v-if="isImageExt(row.ext)" class="file-thumb" :src="row.url" fit="cover" />
            <div v-else class="file-thumb"
              ><ElIcon><Document /></ElIcon
            ></div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="name" label="文件名" min-width="200" show-overflow-tooltip />
        <ElTableColumn label="大小" width="100" :formatter="(row: FileItem) => getFileSize(Number(row.size)) || '0B'" />
        <ElTableColumn label="上传时间" width="160" :formatter="(row: FileItem) => formatTime(row.created_at)" />
        <ElTableColumn label="操作" width="80" fixed="right">
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
    </ElDialog>

    <el-image-viewer v-if="showPreview" show-progress :url-list="[previewSrc]" @close="showPreview = false">
    </el-image-viewer>

    <ElDialog
      v-model="cutVisible"
      :fullscreen="true"
      :destroy-on-close="true"
      modal-class="cut-dialog"
      title="图片裁剪"
      align-center
    >
      <div class="cutter">
        <Cutter
          :img-url="cutFile?.url"
          :cut-width="cut?.width"
          :cut-height="cut?.height"
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
  import { ref } from 'vue'
  import { UploadFiles, UploadFile as UploadFileItem, type UploadRawFile } from 'element-plus'
  import { Plus, Camera, FolderOpened, Document } from '@element-plus/icons-vue'
  import { UploadRequestOptions, UploadProgressEvent } from 'element-plus/es/components/upload/src/upload'
  import { rurl } from '@/utils/resource/url'
  import { uploadFile } from '@/utils/resource/upload'
  import { imageToIco } from '@/utils/resource/image-to-ico'
  import { getFileSize } from '@/utils/file'
  import { formatTime } from '@/utils/time'
  import { ListUserFile } from '@/api/resource/file/api'
  import type { FileItem } from '@/api/resource/file/type'

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
    /** 开启后显示"从文件选择"：从资源中心文件管理里挑已有文件回填（无需重新上传） */
    selectFromFile?: boolean
    cut?: {
      enable: boolean
      width: number
      height: number
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
    selectFromFile: false
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
  const uploadChange = (item: UploadFileItem, list: UploadFiles) => {
    if (item.status === 'ready' && props.cut) {
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

  // 图片后缀（列表出缩略图；其余显示文件图标）
  const isImageExt = (ext: string) => ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg'].includes(ext)

  const openFileSelect = () => {
    fileVisible.value = true
    loadFiles()
  }

  const loadFiles = async () => {
    fileLoading.value = true
    try {
      const res = await ListUserFile({ page: filePage.value, page_size: filePageSize })
      fileData.value = res.list || []
      fileTotal.value = res.total || 0
    } catch (e: any) {
      ElMessage.error(e?.message || '获取文件列表失败')
    } finally {
      fileLoading.value = false
    }
  }

  const chooseFile = (row: FileItem) => {
    emit('update:modelValue', row.key)
    emit('change', [{ key: row.key }])
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

  :deep(.cut-dialog .el-dialog) {
    background: rgb(0 0 0 / 10%) !important;
  }

  .cutter {
    display: flex;
    justify-content: center;
    width: 100vw;
    height: 100%;
  }

  .upload {
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
    right: 0;
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

  .file-thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    overflow: hidden;
    font-size: 20px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  .file-select-pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }
</style>
