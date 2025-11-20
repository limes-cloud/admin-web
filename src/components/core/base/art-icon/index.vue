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
  <ArtSvgIcon v-if="icon.type === 'svg'" :icon="value"></ArtSvgIcon>
  <ElIcon v-if="icon.type === 'component'" v-bind="$attrs">
    <component :is="value" />
  </ElIcon>
</template>

<script setup lang="ts">
  import { IconTypeEnum } from '@/enums/appEnum'

  defineOptions({ name: 'ArtIcon' })

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
