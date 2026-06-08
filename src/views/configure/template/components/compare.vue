<template>
  <ElTable :data="data" border :max-height="400" style="width:100%">
    <ElTableColumn label="变更类型" width="100">
      <template #default="{ row }">
        <ElTag v-if="row.type === 'add'" type="primary">增加字段</ElTag>
        <ElTag v-else-if="row.type === 'del'" type="danger">删除字段</ElTag>
        <ElTag v-else-if="row.type === 'update'" type="warning">修改字段</ElTag>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="key" label="变更字段" width="120" />
    <ElTableColumn label="变更前值">
      <template #default="{ row }">
        <ElInput type="textarea" :model-value="row.old" readonly :rows="2" />
      </template>
    </ElTableColumn>
    <ElTableColumn label="变更后值">
      <template #default="{ row }">
        <ElInput type="textarea" :model-value="row.cur" readonly :rows="2" />
      </template>
    </ElTableColumn>
  </ElTable>
</template>

<script setup lang="ts">
  import { CompareTemplateInfo } from '@/api/configure/template/type'

  defineProps<{ data: CompareTemplateInfo[] }>()
</script>
