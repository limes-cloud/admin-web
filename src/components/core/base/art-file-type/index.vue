<template>
  <el-image v-if="getSrc()" :src="getSrc()" :style="{ height: '100%', width: '100%' }"></el-image>
</template>

<script lang="ts" setup>
  import pdf from '@/assets/img/type/pdf.png'
  import xls from '@/assets/img/type/xls.png'
  import ppt from '@/assets/img/type/ppt.png'
  import doc from '@/assets/img/type/doc.png'
  import audio from '@/assets/img/type/audio.png'
  import conf from '@/assets/img/type/conf.png'
  import dir from '@/assets/img/type/dir.png'
  import video from '@/assets/img/type/video.png'
  import image from '@/assets/img/type/image.png'
  import txt from '@/assets/img/type/txt.png'
  import web from '@/assets/img/type/web.png'
  import zip from '@/assets/img/type/zip.png'
  import other from '@/assets/img/type/other.png'

  defineOptions({ name: 'Logo' })

  const props = defineProps({
    file: String
  })

  const getSrc = () => {
    // 获取文件后缀
    const arr = props.file?.split('.')
    if (!arr || arr.length < 2) return other
    return name(arr[arr.length - 1])
  }

  const name = (tp: string) => {
    switch (tp) {
      case 'pdf':
      case 'pdfx':
        return pdf

      case 'xls':
      case 'xlsx':
        return xls

      case 'ppt':
      case 'pptx':
        return ppt

      case 'doc':
      case 'docx':
        return doc

      case 'wav':
      case 'mp3':
      case 'aac':
        return audio

      case 'yaml':
      case 'conf':
      case 'yam':
        return conf

      case 'dir':
        return dir

      case 'mov':
      case 'avi':
      case 'mp4':
        return video

      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'ico':
        return image

      case 'txt':
        return txt

      case 'html':
      case 'js':
        return web

      case 'zip':
      case 'rar':
      case '7z':
        return zip

      default:
        return other
    }
  }
</script>
