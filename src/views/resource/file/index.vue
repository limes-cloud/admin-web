<template>
  <div class="container">
    <Directory class="left" @select="handleSelect"></Directory>
    <!-- <File class="right" :entity-id="entityId" /> -->
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
  // import File from './file.vue'
  import Directory from './directory.vue'
  import { Entity as EntityType } from '@/api/manager/entity/type'

  const entityId = ref(0)
  const handleSelect = (row: EntityType) => {
    entityId.value = row.id
  }
</script>
