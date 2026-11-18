<template>
  <div class="chain-edit-page art-full-height">
    <ChainEditor
      :key="`${chainId}-${versionId || 0}`"
      :chain-id="chainId"
      :version-id="versionId"
      @close="router.push({ path: '/cron/chain' })"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import ChainEditor from './components/ChainEditor.vue'

  // 编辑页（直接访问 /cron/chain/edit?id=&version= 时使用）；列表与版本页改为全屏弹窗编辑
  defineOptions({ name: 'CronChainEdit' })

  const route = useRoute()
  const router = useRouter()

  const chainId = computed(() => Number(route.query.id) || 0)
  const versionId = computed(() => Number(route.query.version) || undefined)
</script>

<style scoped lang="scss">
  .chain-edit-page {
    overflow: hidden;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
  }
</style>
