<!-- 图片裁剪组件 github: https://github.com/acccccccb/vue-img-cutter/tree/master -->
<template>
  <div class="cutter-container">
    <div class="cutter-component" :class="{ 'has-preview': showPreview }">
      <ImgCutter
        ref="imgCutterModal"
        @cutDown="cutDownImg"
        @onPrintImg="cutterPrintImg"
        @onImageLoadComplete="handleImageLoadComplete"
        @onImageLoadError="handleImageLoadError"
        @onClearAll="handleClearAll"
        v-bind="cutterProps"
        class="img-cutter"
      >
        <template #choose>
          <div></div>
          <!-- <ElButton type="primary" plain v-ripple>选择图片</ElButton> -->
        </template>
        <template #cancel>
          <div></div>

          <!-- <ElButton type="danger" plain v-ripple>清除</ElButton> -->
        </template>
        <template #confirm>
          <ElButton type="primary" style="margin-left: 10px">确定</ElButton>
        </template>
      </ImgCutter>
    </div>
  </div>
</template>

<script setup lang="ts">
  import ImgCutter from 'vue-img-cutter'

  defineOptions({ name: 'ArtCutterImg' })

  interface CutterProps {
    // 基础配置
    /** 是否模态框 */
    isModal?: boolean
    /** 是否显示工具栏 */
    tool?: boolean
    /** 工具栏背景色 */
    toolBgc?: string
    /** 标题 */
    title?: string
    /** 预览标题 */
    previewTitle?: string
    /** 是否显示预览 */
    showPreview?: boolean

    // 尺寸相关
    /** 容器宽度 */
    boxWidth?: number
    /** 容器高度 */
    boxHeight?: number
    /** 裁剪宽度 */
    cutWidth?: number
    /** 裁剪高度 */
    cutHeight?: number
    /** 是否允许大小调整 */
    sizeChange?: boolean

    // 移动和缩放
    /** 是否允许移动 */
    moveAble?: boolean
    /** 是否允许图片移动 */
    imgMove?: boolean
    /** 是否允许缩放 */
    scaleAble?: boolean
    /** 是否允许裁剪框超出底图 */
    toolBoxOverflow?: boolean

    // 图片相关
    /** 是否显示原始图片 */
    originalGraph?: boolean
    /** 是否允许跨域 */
    crossOrigin?: boolean
    /** 文件类型 */
    fileType?: 'png' | 'jpeg' | 'webp'
    /** 质量 */
    quality?: number

    // 水印
    /** 水印文本 */
    watermarkText?: string
    /** 水印字体大小 */
    watermarkFontSize?: number
    /** 水印颜色 */
    watermarkColor?: string

    // 其他功能
    /** 是否保存裁剪位置 */
    saveCutPosition?: boolean
    /** 是否预览模式 */
    previewMode?: boolean

    // 输入图片
    imgUrl?: string
  }

  interface CutterResult {
    fileName: string
    file: File
    blob: Blob
    dataURL: string
  }

  interface CutterInstance {
    drawImg: {
      img?: HTMLImageElement
      x: number
      y: number
      width: number
      height: number
    }
    toolBox: { x: number; y: number; width: number; height: number }
    scaleImg: { rate: number }
    scaleAble: boolean
    scaleImgWheel: (event: Event) => void
    printImg: () => void
    handleOpen: (image: { name: string; src: string }) => void
    $refs: { toolBox?: HTMLElement }
  }

  const props = withDefaults(defineProps<CutterProps>(), {
    // 基础配置默认值
    isModal: false,
    tool: false,
    toolBgc: '#fff',
    title: '',
    previewTitle: '',
    showPreview: false,

    // 尺寸相关默认值
    boxWidth: 700,
    boxHeight: 458,
    cutWidth: 256,
    cutHeight: 256,
    sizeChange: false,

    // 移动和缩放默认值
    moveAble: true,
    imgMove: false,
    scaleAble: true,

    // 图片相关默认值
    originalGraph: true,
    crossOrigin: true,
    fileType: 'png',
    quality: 0.9,

    // 水印默认值
    watermarkText: '',
    watermarkFontSize: 20,
    watermarkColor: '#ffffff',

    // 其他功能默认值
    saveCutPosition: true,
    previewMode: false
  })

  const emit = defineEmits(['success', 'error', 'imageLoadComplete', 'imageLoadError'])

  const temImgPath = ref('')
  const imgCutterModal = ref<CutterInstance>()

  // 计算属性：整合所有ImgCutter的props
  const cutterProps = computed(() => ({
    ...props,
    WatermarkText: props.watermarkText,
    WatermarkFontSize: props.watermarkFontSize,
    WatermarkColor: props.watermarkColor
  }))

  // 图片预加载
  function preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
  }

  // 初始化裁剪器
  async function initImgCutter() {
    if (props.imgUrl) {
      try {
        await preloadImage(props.imgUrl)
        imgCutterModal.value?.handleOpen({
          name: '封面图片',
          src: props.imgUrl
        })
      } catch (error) {
        emit('error', error)
        console.error('图片加载失败:', error)
      }
    }
  }

  function wheelScale(event: WheelEvent): number {
    const legacyEvent = event as WheelEvent & { wheelDelta?: number; detail?: number }
    if (typeof legacyEvent.wheelDelta === 'number') {
      return -(legacyEvent.wheelDelta / 40)
    }
    if (typeof legacyEvent.detail === 'number' && legacyEvent.detail !== 0) {
      return legacyEvent.detail
    }
    return event.deltaY / 40
  }

  function handleCenterZoom(event: Event) {
    const instance = imgCutterModal.value
    if (!instance?.drawImg.img || instance.scaleAble !== true) {
      event.preventDefault()
      return
    }

    const scale = wheelScale(event as WheelEvent)
    const aspectRatio = Number(instance.scaleImg.rate)
    if (!Number.isFinite(scale) || scale === 0 || !Number.isFinite(aspectRatio) || aspectRatio <= 0) {
      event.preventDefault()
      return
    }

    const { drawImg, toolBox } = instance
    const minWidth = Math.max(50, toolBox.width, toolBox.height * aspectRatio)
    const nextWidth = Math.max(minWidth, drawImg.width - scale * 9)
    if (Math.abs(nextWidth - drawImg.width) < 0.01) {
      event.preventDefault()
      return
    }

    const ratio = nextWidth / drawImg.width
    const centerX = toolBox.x + toolBox.width / 2
    const centerY = toolBox.y + toolBox.height / 2
    const nextHeight = nextWidth / aspectRatio

    drawImg.x = centerX - (centerX - drawImg.x) * ratio
    drawImg.y = centerY - (centerY - drawImg.y) * ratio
    drawImg.width = nextWidth
    drawImg.height = nextHeight
    drawImg.x = Math.min(toolBox.x, Math.max(toolBox.x + toolBox.width - nextWidth, drawImg.x))
    drawImg.y = Math.min(toolBox.y, Math.max(toolBox.y + toolBox.height - nextHeight, drawImg.y))

    instance.printImg()
    event.preventDefault()
    event.stopPropagation()
  }

  function bindCenterZoom() {
    const instance = imgCutterModal.value
    const toolBox = instance?.$refs.toolBox
    if (!toolBox) return

    const wheelHost = toolBox as HTMLElement & { onmousewheel: ((event: Event) => void) | null }
    toolBox.removeEventListener('DOMMouseScroll', instance.scaleImgWheel)
    toolBox.addEventListener('DOMMouseScroll', handleCenterZoom)
    wheelHost.onmousewheel = handleCenterZoom
  }

  // 生命周期钩子
  onMounted(() => {
    if (props.imgUrl) {
      temImgPath.value = props.imgUrl
      initImgCutter()
    }
  })

  // 监听图片URL变化
  watch(
    () => props.imgUrl,
    (newVal) => {
      if (newVal) {
        temImgPath.value = newVal
        initImgCutter()
      }
    }
  )

  // 实时预览
  function cutterPrintImg(result: { dataURL: string }) {
    temImgPath.value = result.dataURL
  }

  // 裁剪完成
  function cutDownImg(result: CutterResult) {
    emit('success', result.blob)
  }

  // 图片加载完成
  function handleImageLoadComplete(result: any) {
    emit('imageLoadComplete', result)
    setTimeout(bindCenterZoom, 0)
  }

  // 图片加载失败
  function handleImageLoadError(error: any) {
    emit('error', error)
    emit('imageLoadError', error)
  }

  // 清除所有
  function handleClearAll() {
    temImgPath.value = ''
  }
</script>

<style lang="scss" scoped>
  .img-cutter {
    overflow: hidden;
  }

  .cutter-container {
    display: flex;
    flex-flow: row wrap;

    :deep(.i-dialog-footer) {
      position: relative;
      top: -5px;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-end;
    }

    .title {
      padding-bottom: 10px;
      font-size: 18px;
      font-weight: 500;
    }

    .cutter-component {
      &.has-preview {
        margin-right: 30px;
      }
    }

    .preview-container {
      .preview-box {
        background-color: var(--art-active-color) !important;

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .download-btn {
        display: block;
        margin: 20px auto;
      }
    }

    :deep(.toolBoxControl) {
      z-index: 100;
    }

    :deep(.dockMain) {
      right: 0;
      bottom: -40px;
      left: 0;
      z-index: 10;
      padding: 0;
      background-color: transparent !important;
      opacity: 1;
    }

    :deep(.copyright) {
      display: none !important;
    }

    :deep(.dockBtn) {
      height: 26px;
      padding: 0 10px;
      font-size: 12px;
      line-height: 26px;
      color: var(--el-color-primary) !important;
      background-color: var(--el-color-primary-light-9) !important;
      border: 1px solid var(--el-color-primary-light-4) !important;
    }

    :deep(.dockBtnScrollBar) {
      margin: 0 10px 0 6px;
      background-color: var(--el-color-primary-light-1);
    }

    :deep(.scrollBarControl) {
      border-color: var(--el-color-primary);
    }

    :deep(.closeIcon) {
      line-height: 15px !important;
    }
  }

  .dark {
    .cutter-container {
      :deep(.toolBox) {
        border: transparent;
      }

      :deep(.dialogMain) {
        background-color: transparent !important;
      }

      :deep(.i-dialog-footer) {
        .btn {
          background-color: var(--el-color-primary) !important;
          border: transparent;
        }
      }
    }
  }
</style>
