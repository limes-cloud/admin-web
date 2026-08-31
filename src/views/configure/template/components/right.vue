<template>
  <div class="template-right">
    <div class="section-title">可用变量</div>
    <div class="search-bar">
      <ElInput
        v-model="query.keyword"
        placeholder="请输入变量名称"
        clearable
        class="search-input"
        @keyup.enter="search"
      />
      <ElButton class="search-button" type="primary" :icon="Search" @click="search" />
    </div>
    <ElSegmented v-model="variableType" class="variable-switch" :options="variableTypeOptions" @change="search" />

    <div class="field-list">
      <template v-if="variableType === 'business'">
        <div v-for="item in businessList" :key="item.id" class="var-item">
          <div class="var-row">
            <span class="var-label">字段</span>
            <ElTag class="copy-tag" type="primary" size="small" @click="copyVal(item.keyword)"
              >{{ item.keyword }} <ElIcon><CopyDocument /></ElIcon
            ></ElTag>
          </div>
          <div class="var-row"
            ><span class="var-label">说明</span><span class="var-desc">{{ item.description }}</span></div
          >
        </div>
        <ElEmpty v-if="!businessList.length" :image-size="60" description="暂无可用字段" />
      </template>
      <template v-else>
        <div v-for="item in resourceList" :key="item.id" class="var-item">
          <div class="var-row"
            ><span class="var-label">字段</span
            ><span style="color: var(--el-color-primary)">{{ item.keyword }}</span></div
          >
          <div class="var-row"
            ><span class="var-label">说明</span><span class="var-desc">{{ item.description }}</span></div
          >
          <ElDivider style="margin: 6px 0" />
          <ElTag
            v-for="field in item.fields.split(',')"
            :key="field"
            class="copy-tag"
            type="primary"
            size="small"
            style="margin: 2px"
            @click="copyVal(`${item.keyword}.${field}`)"
          >
            {{ item.keyword }}.{{ field }} <ElIcon><CopyDocument /></ElIcon>
          </ElTag>
        </div>
        <ElEmpty v-if="!resourceList.length" :image-size="60" description="暂无可用字段" />
      </template>
    </div>

    <ElPagination
      v-if="total > 0"
      :total="total"
      :current-page="query.page"
      :page-size="query.pageSize"
      layout="total, prev, pager, next"
      small
      @current-change="
        (p) => {
          query.page = p
          fetchData()
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
  import { Search, CopyDocument } from '@element-plus/icons-vue'
  import { useClipboard } from '@vueuse/core'
  import { ListBusiness } from '@/api/configure/business/api'
  import { ListResource } from '@/api/configure/resource/api'
  import { Business } from '@/api/configure/business/type'
  import { Resource } from '@/api/configure/resource/type'

  const props = defineProps<{ app?: string }>()
  const { copy } = useClipboard()

  const variableType = ref('business')
  const variableTypeOptions = [
    { label: '业务变量', value: 'business' },
    { label: '资源变量', value: 'resource' }
  ]
  const total = ref(0)
  const businessList = ref<Business[]>([])
  const resourceList = ref<Resource[]>([])
  const query = ref({ page: 1, pageSize: 10, keyword: '' })

  const fetchData = async () => {
    if (!props.app) return
    if (variableType.value === 'business') {
      const res = await ListBusiness({ ...query.value, app: props.app })
      businessList.value = res.list
      total.value = res.total
    } else {
      const res = await ListResource({ ...query.value, app: props.app })
      resourceList.value = res.list
      total.value = res.total
    }
  }

  const search = () => {
    query.value.page = 1
    fetchData()
  }

  const copyVal = (key: string) => {
    copy(`\${${key}}`)
    ElMessage.success('已复制')
  }

  watch(
    () => props.app,
    (val) => {
      if (val) fetchData()
    }
  )
</script>

<style scoped>
  .template-right {
    display: flex;
    flex-direction: column;
    padding: 10px;
  }
  .section-title {
    position: relative;
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 10px;
    padding-left: 12px;

    &::before {
      position: absolute;
      left: 0;
      top: 50%;
      width: 4px;
      height: 14px;
      content: '';
      background-color: var(--el-color-primary);
      border-radius: 4px;
      transform: translateY(-50%);
    }
  }
  .search-bar {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }
  .search-input {
    flex: 1;
    min-width: 0;
  }
  .search-button {
    width: 34px;
    min-width: 34px;
    height: 34px;
    padding: 0;
    flex-shrink: 0;
  }
  .variable-switch {
    width: 100%;
    margin-bottom: 8px;

    :deep(.el-segmented__group) {
      width: 100%;
    }

    :deep(.el-segmented__item) {
      flex: 1;
      min-width: 0;
    }

    :deep(.el-segmented__item-label) {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .field-list {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 8px;
  }
  .field-list::-webkit-scrollbar {
    display: none;
  }
  .var-item {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 8px;
    font-size: 12px;
  }
  .var-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .var-label {
    color: var(--el-text-color-secondary);
    font-weight: 600;
    width: 28px;
    flex-shrink: 0;
  }
  .var-desc {
    color: var(--el-text-color-placeholder);
    font-size: 11px;
  }
  .copy-tag {
    cursor: pointer;
  }
</style>
