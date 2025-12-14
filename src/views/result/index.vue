<template>
  <ArtResultPage
    :type="tip.type == 'success' ? 'success' : 'fail'"
    :title="(tip.title as string) || '系统提示'"
    :message="(tip.message as string) || '操作成功！'"
    :iconCode="tip.type == 'success' ? '&#xe617;' : '&#xe665;'"
  >
    <!-- <template #content>
      <p>已提交申请，等待部门审核。</p>
    </template> -->
  </ArtResultPage>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ResultSuccess' })

  const route = useRoute()

  const params = route.query

  const tip = ref({ ...params })
</script>
