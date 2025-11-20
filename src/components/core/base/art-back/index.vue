<template>
  <!-- 先不加back -->
  <div></div>
  <!-- <div class="back">
    <div class="back-btn" @click="goto">
      <el-icon size="18"><Back /></el-icon>
      <span class="back-btn-title">返回</span>
    </div>
  </div> -->
</template>

<script setup lang="ts">
  // import { Back } from '@element-plus/icons-vue'
  // const router = useRouter()

  // defineOptions({ name: 'ArtBackToTop' })

  // const goto = () => {
  //   router.back()
  // }
</script>

<style lang="scss" scoped>
  .back {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: auto;
    margin-bottom: 15px;

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 10px;
      color: var(--el-color-info);
      cursor: pointer;
      background-color: var(--el-fill-color-light);
      border-radius: 4px;

      &:hover {
        color: var(--el-color-primary);
      }

      &-title {
        margin-left: 5px;
        font-size: 14px;
      }
    }
  }
</style>
