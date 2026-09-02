<template>
  <div class="container">
    <Dictionary class="left" @select="handleSelect"></Dictionary>
    <Value class="right" :dictionary-id="dictionaryId" :type="dictionaryType"></Value>
  </div>
</template>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: row;
    height: 100%;

    .left {
      flex: 0 0 240px; /* 防止伸展 */ /* 防止收缩 */
      width: 240px;
      margin-right: 15px;

      .art-table-card {
        margin-top: 0;
      }
    }

    .right {
      width: calc(100% - 255px);

      .art-table-card {
        margin-top: 0;
      }
    }
  }
</style>

<script setup lang="ts">
  import { Dictionary as DictionaryType } from '@/api/manager/dictionary/type'
  import Value from './value.vue'
  import Dictionary from './dictionary.vue'

  const dictionaryId = ref(0)
  const dictionaryType = ref('')
  const handleSelect = (row: DictionaryType) => {
    dictionaryId.value = row.id
    dictionaryType.value = row.type
  }
</script>
