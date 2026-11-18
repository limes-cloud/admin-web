<template>
  <template v-for="f in fields" :key="f.label">
    <span class="nc-label">{{ f.label }}</span>
    <span class="nc-value">
      <span v-for="(t, i) in f.tags" :key="i" class="nc-tag" :title="t.sub ? `${t.text}（${t.sub}）` : t.text">
        <em v-if="t.sub && t.subFirst">{{ t.sub }}</em>
        <span>{{ t.text }}</span>
        <em v-if="t.sub && !t.subFirst">{{ t.sub }}</em>
      </span>
      <span v-if="!f.tags.length" class="nc-empty">{{ f.empty || '-' }}</span>
    </span>
  </template>
</template>

<script setup lang="ts">
  import type { NodeField } from '../../utils/node-fields'

  // 卡片字段行：放在 NodeCard 默认插槽内，按"标签 | 标签列表"两列排列
  defineOptions({ name: 'NodeFields' })

  defineProps<{ fields: NodeField[] }>()
</script>
