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
  import cryptoJs from 'crypto-js'

  import { PrepareUploadFile, UploadChunkFile } from '@/api/resource/file/api'
  import { PrepareUploadFileReply } from '@/api/resource/file/type'
  import { UploadFiles, UploadFile as UploadFileItem } from 'element-plus'
  import { Plus, Camera } from '@element-plus/icons-vue'
  import { UploadRequestOptions, UploadProgressEvent } from 'element-plus/es/components/upload/src/upload'
  import { rurl } from '@/utils/resource/url'
  // import FileEle from '@/views/resource/file/index.vue'

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
    autoUpload: true
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

  const readBinary = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onload = (e: ProgressEvent<FileReader>): void => {
        resolve(e.target?.result)
      }
      fileReader.onerror = (error) => {
        reject(error)
      }
      fileReader.readAsArrayBuffer(file)
    })
  }

  const getPrepareUploadReq = async (data: any, file: File) => {
    const wordArray = cryptoJs.lib.WordArray.create(data)
    const hash = cryptoJs.MD5(wordArray).toString()
    let { name } = file
    if (props.rename) {
      const arr = file.name.split('.')
      const ext = arr[arr.length - 1]
      name = props.rename + ext
    }
    return {
      directoryId: props.directoryId,
      directoryPath: props.directoryPath,
      name,
      sha: hash,
      size: Math.ceil(file.size / 1024),
      store: props.store
    }
  }

  const handleUpload = async (info: PrepareUploadFileReply, binary: ArrayBuffer, options: UploadRequestOptions) => {
    return new Promise((resolve, reject) => {
      const { onProgress } = options
      const count = info.chunkCount as number
      const size = (info.chunkSize as number) * 1024
      const pArrr: Promise<any>[] = []
      const uploaed = info.uploadChunks
      if (count <= 1) {
        const formData = new FormData()
        formData.append('data', new Blob([binary]))
        formData.append('uploadId', info.uploadId as string)
        formData.append('index', String(1))
        pArrr.push(UploadChunkFile(formData))
      } else {
        for (let i = 0; i < count; i += 1) {
          if (uploaed && uploaed.includes(i + 1)) continue
          let data: ArrayBuffer = new ArrayBuffer(0)
          if ((i + 1) * size > binary.byteLength) {
            data = binary.slice(i * size, binary.byteLength)
          } else {
            data = binary.slice(i * size, (i + 1) * size)
          }

          const formData = new FormData()
          formData.append('data', new Blob([data]))
          formData.append('uploadId', info.uploadId as string)
          formData.append('index', String(i + 1))
          pArrr.push(UploadChunkFile(formData))
        }
      }
      pArrr.forEach((fn: Promise<any>, index: number) => {
        fn.then((res) => {
          onProgress({ percent: Math.ceil((index + 1) / pArrr.length) } as UploadProgressEvent)
          if ((index + 1) / pArrr.length) {
            resolve(res)
          }
        }).catch((res) => {
          reject(res)
        })
      })
    })
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
      // onError(new UploadAjaxError('超过文件大小限制', 400, 'POST', ''))
      return Promise.reject('超过文件大小限制')
    }
    try {
      onProgress({ percent: 0 } as UploadProgressEvent)
      // 获取文件二进制数据
      const binary = (await readBinary(orifile)) as ArrayBuffer

      // 进行预上传
      const params = await getPrepareUploadReq(binary, file)
      const data = await PrepareUploadFile(params)
      // 触发秒传
      if (data.uploaded) {
        onProgress({ percent: 100 } as UploadProgressEvent)
        return data
      }
      // 处理上传逻辑
      const resp = await handleUpload(data, binary, options)
      return resp
    } catch (error) {
      // onError(new UploadAjaxError('文件上传失败' + error || '', 400, 'POST', ''))
      return Promise.reject('文件上传失败' + error || '')
    }
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
</style>
