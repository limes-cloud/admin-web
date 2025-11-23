<!-- 系统logo -->
<template>
  <div class="art-logo">
    <el-image :style="logoStyle" :src="$rurl(appStore.app?.logo as string)">
      <template #error>
        <img :style="logoStyle" src="@/assets/img/icon/logo.png" alt="logo" />
      </template>
    </el-image>
  </div>
</template>

<script setup lang="ts">
  import { useAppStore } from '@/store/modules/app'
  const appStore = useAppStore()
  defineOptions({ name: 'ArtLogo' })

  interface Props {
    /** logo 大小 */
    size?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 36
  })

  const logoStyle = computed(() => ({ width: `${props.size}px`, height: `${props.size}px` }))
</script>

<style lang="scss" scoped>
  .art-logo {
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
    }
  }
</style>
