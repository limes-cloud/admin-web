<template>
  <div class="container">
    <Entity class="left" :app-id="appId" @select="handleSelect"></Entity>
    <Field class="right" :app-id="appId" :entity-id="entityId" />
  </div>
</template>

<style lang="scss" scoped>
  .container {
    display: flex;
    flex-direction: row;
    height: 100%;

    .left {
      flex: 0 0 240px; /* 防止伸展 */ /* 防止收缩 */
      width: 260px;
      margin-right: 15px;
    }

    .right {
      width: calc(100% - 255px);
    }
  }
</style>

<script setup lang="ts">
  import Field from './field.vue'
  import Entity from './entity.vue'
  import { Entity as EntityType } from '@/api/manager/entity/type'

  const router = useRouter()
  const appId = Number(router.currentRoute.value.query.appId)

  const entityId = ref(0)
  const handleSelect = (row: EntityType) => {
    entityId.value = row.id
  }
</script>
