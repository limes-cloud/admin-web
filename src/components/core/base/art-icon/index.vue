<!-- 图标选择器 -->
<template>
  <i
    v-if="icon.type === IconTypeEnum.CLASS_NAME"
    :class="`iconfont-sys ${value}`"
    v-bind="$attrs"
    :style="{ fontSize: size + 'px' }"
  ></i>
  <i
    v-if="icon.type === IconTypeEnum.UNICODE"
    class="iconfont-sys"
    v-html="value"
    v-bind="$attrs"
    :style="{ fontSize: size + 'px' }"
  ></i>
  <el-image
    v-if="icon.type === 'url'"
    class="image-icon"
    :style="{ width: size + 'px', height: size + 'px' }"
    :src="value"
  ></el-image>
  <el-image
    v-if="icon.type === 'key'"
    class="image-icon"
    :style="{ width: size + 'px', height: size + 'px' }"
    :src="objectKeyUrl"
  ></el-image>
  <ArtSvgIcon v-if="icon.type === 'svg'" :icon="value" :style="`width: ${size}px; height: ${size}px`"></ArtSvgIcon>
  <ElIcon v-if="icon.type === 'component'" v-bind="$attrs">
    <component :is="value" />
  </ElIcon>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  import { IconTypeEnum } from '@/enums/appEnum'
  import { rurl } from '@/utils/resource/url'

  defineOptions({ name: 'ArtIcon' })

  // 对象 key（资源服务 md5.ext 形态，如 app.logo）→ 经 object-by-key 展示
  const OBJECT_KEY_PATTERN = /^[a-f0-9]{32}\.[a-z0-9]+$/

  const objectKeyUrl = computed(() => rurl(props.value))

  // 使用 withDefaults 定义 props
  const props = withDefaults(
    defineProps<{
      value: string | any
      size?: number
    }>(),
    {
      value: '',
      size: 18
    }
  )

  const icon = ref<{
    type: string
  }>({
    type: ''
  })

  watch(
    () => props.value,
    () => {
      if (typeof props.value === 'string') {
        // 判断是不是url
        if (props.value.startsWith('http')) {
          icon.value.type = 'url'
        } else if (props.value.startsWith('&#x')) {
          icon.value.type = IconTypeEnum.UNICODE
        } else if (props.value.startsWith('iconsys')) {
          icon.value.type = IconTypeEnum.CLASS_NAME
        } else if (OBJECT_KEY_PATTERN.test(props.value)) {
          icon.value.type = 'key'
        } else if (props.value.startsWith('/')) {
          // 相对资源地址（rurl 在无 API base 时的产物，如 /resource/api/file/object-by-key?key=...）
          icon.value.type = 'url'
        } else {
          icon.value.type = 'svg'
        }
      } else {
        icon.value.type = 'component'
      }
    },
    { immediate: true }
  )
</script>
