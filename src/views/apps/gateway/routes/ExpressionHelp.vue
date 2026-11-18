<template>
  <ElDialog
    v-model="visible"
    class="expression-help-dialog"
    title="匹配表达式函数"
    width="760px"
    align-center
    destroy-on-close
  >
    <div class="help-syntax">
      <p>多个条件使用 <code>&amp;&amp;</code>、<code>||</code>、<code>!</code> 和括号组合，字符串必须使用双引号。</p>
      <code
        >req_header_value_contain("User-Agent", "spider", true) &amp;&amp; req_host_in("asou.fun", "www.asou.fun")</code
      >
    </div>

    <ElInput v-model="keyword" clearable :prefix-icon="Search" placeholder="搜索函数名或用途" />

    <ElScrollbar class="help-scrollbar" max-height="56vh">
      <div v-if="filteredGroups.length" class="help-groups">
        <section v-for="group in filteredGroups" :key="group.title" class="help-group">
          <h4>{{ group.title }}</h4>
          <div v-for="item in group.functions" :key="item.name" class="help-item">
            <code class="help-signature">{{ item.signature }}</code>
            <span>{{ item.description }}</span>
          </div>
        </section>
      </div>
      <div v-else class="help-empty">没有匹配的函数</div>
    </ElScrollbar>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { Search } from '@element-plus/icons-vue'
  import { EXPRESSION_FUNCTION_GROUPS } from './expression-meta'

  defineOptions({ name: 'ExpressionHelp' })

  const props = defineProps<{ modelValue: boolean }>()
  const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const keyword = ref('')

  const filteredGroups = computed(() => {
    const query = keyword.value.trim().toLowerCase()
    if (!query) return EXPRESSION_FUNCTION_GROUPS
    return EXPRESSION_FUNCTION_GROUPS.map((group) => ({
      ...group,
      functions: group.functions.filter((item) =>
        [item.name, item.signature, item.description].some((value) => value.toLowerCase().includes(query))
      )
    })).filter((group) => group.functions.length > 0)
  })
</script>

<style lang="scss" scoped>
  :global(.expression-help-dialog) {
    max-width: calc(100vw - 32px);
  }

  .help-syntax {
    padding: 10px 12px;
    margin-bottom: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;

    p {
      margin: 0 0 6px;
      font-size: 12px;
      line-height: 18px;
      color: var(--el-text-color-secondary);
    }

    code {
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 12px;
      line-height: 18px;
    }
  }

  .help-scrollbar {
    margin-top: 12px;
  }

  .help-groups {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-right: 8px;
  }

  .help-group {
    h4 {
      margin: 0 0 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .help-item {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
    gap: 12px;
    padding: 7px 10px;
    font-size: 12px;
    line-height: 18px;
    border-bottom: 1px solid var(--el-border-color-extra-light);

    span {
      color: var(--el-text-color-secondary);
    }
  }

  .help-signature {
    font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
    color: var(--el-color-primary);
    overflow-wrap: anywhere;
  }

  .help-empty {
    padding: 32px 0;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
</style>
