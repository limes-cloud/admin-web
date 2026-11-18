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
    const fileName = props.file?.trim().toLowerCase() || ''
    const dotIndex = fileName.lastIndexOf('.')
    if (dotIndex < 0 || dotIndex === fileName.length - 1) return other
    return name(fileName.slice(dotIndex + 1))
  }

  const name = (tp: string) => {
    switch (tp) {
      case 'pdf':
      case 'pdfx':
        return pdf

      case 'xls':
      case 'xlsx':
      case 'xlsm':
      case 'csv':
      case 'tsv':
        return xls

      case 'ppt':
      case 'pptx':
      case 'pps':
      case 'ppsx':
        return ppt

      case 'doc':
      case 'docx':
      case 'rtf':
      case 'odt':
        return doc

      case 'wav':
      case 'mp3':
      case 'aac':
      case 'flac':
      case 'm4a':
      case 'ogg':
      case 'opus':
      case 'wma':
        return audio

      case 'yaml':
      case 'yml':
      case 'conf':
      case 'toml':
      case 'ini':
      case 'env':
      case 'xml':
      case 'json':
        return conf

      case 'dir':
        return dir

      case 'mov':
      case 'avi':
      case 'mp4':
      case 'mkv':
      case 'webm':
      case 'm4v':
      case 'ogv':
      case 'flv':
      case 'wmv':
        return video

      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'ico':
      case 'gif':
      case 'webp':
      case 'bmp':
      case 'svg':
      case 'avif':
      case 'tif':
      case 'tiff':
      case 'heic':
        return image

      case 'txt':
      case 'md':
      case 'markdown':
      case 'log':
      case 'srt':
      case 'ass':
      case 'vtt':
        return txt

      case 'html':
      case 'htm':
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'vue':
      case 'css':
      case 'scss':
      case 'less':
      case 'sql':
      case 'php':
      case 'java':
      case 'go':
      case 'py':
      case 'rb':
      case 'rs':
      case 'c':
      case 'h':
      case 'cpp':
      case 'cs':
      case 'sh':
      case 'bash':
      case 'zsh':
        return web

      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
      case 'tgz':
      case 'bz2':
      case 'tbz2':
      case 'xz':
      case 'txz':
      case 'zipx':
        return zip

      default:
        return other
    }
  }
</script>
