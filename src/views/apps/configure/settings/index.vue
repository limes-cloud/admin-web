<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ElAlert
        class="configure-guide"
        type="primary"
        title="系统配置：选择环境后展示当前模板引用的业务变量，修改保存后立即重新渲染并同步生效。"
        :closable="false"
        show-icon
      />

      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          :loading="loading"
          :show-reset="false"
          @search="loadData"
        >
          <template #action>
            <ElButton v-permission="'configure:settings:update'" type="success" :loading="saving" @click="handleSave">
              保存并生效
            </ElButton>
          </template>
        </ArtSearchBar>
      </div>

      <div v-loading="loading" class="settings-form">
        <ElEmpty v-if="!items.length" description="当前应用没有可配置的业务变量（或未提交模板）" />
        <ElForm v-else label-position="top" size="default">
          <ElFormItem v-for="item in items" :key="item.keyword" class="settings-form__item">
            <template #label>
              <span class="settings-form__label">
                <span v-if="item.description" class="settings-form__desc">{{ item.description }}</span>
                <span class="settings-form__key">({{ item.keyword }})</span>
              </span>
            </template>

            <!-- 按类型渲染对应控件（与业务变量值配置共用） -->
            <VariableValueInput v-model="form[item.keyword]" :type="item.type" :extra="item.extra" />
          </ElFormItem>
        </ElForm>
      </div>

      <!-- 变更确认弹窗 -->
      <ElDialog v-model="confirmVisible" title="确认保存变更" width="760px" align-center>
        <ElEmpty v-if="!changedItems.length" description="没有变更" :image-size="60" />
        <ElTable v-else :data="changedItems" size="small" border>
          <ElTableColumn label="key" min-width="220">
            <template #default="{ row }">
              <span class="settings-form__desc">{{ row.desc || row.keyword }}</span>
              <span class="settings-form__key">({{ row.keyword }})</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="变更前" min-width="200">
            <template #default="{ row }">
              <span class="change-value" :title="row.oldValue">{{ row.oldValue }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="变更后" min-width="200">
            <template #default="{ row }">
              <span class="change-value change-value--new" :title="row.newValue">{{ row.newValue }}</span>
            </template>
          </ElTableColumn>
        </ElTable>
        <template #footer>
          <ElButton @click="confirmVisible = false">取消</ElButton>
          <ElButton v-permission="'configure:settings:update'" type="success" :loading="saving" @click="doSave">
            确认变更
          </ElButton>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { GetSettings, UpdateSettings } from '@/api/configure/settings/api'
  import { SettingsItem, BusinessExtra } from '@/api/configure/settings/type'
  import { ListEnv } from '@/api/configure/env/api'
  import { ListApp } from '@/api/manager/app/api'
  import { Env } from '@/api/configure/env/type'
  import { getAppKeyword } from '@/utils/app-context'
  import ArtSearchBar from '@/components/core/forms/art-search-bar/index.vue'
  import VariableValueInput from '../business/components/variable-value-input.vue'

  defineOptions({ name: 'ConfigureSettings' })

  const isManagerApp = getAppKeyword() === 'manager'

  const searchForm = ref<{ app?: string; envId?: number }>({ app: getAppKeyword(), envId: undefined })
  const envs = ref<Env[]>([])
  const appOptions = ref<{ label: string; value: string }[]>([])
  const items = ref<SettingsItem[]>([])
  const form = ref<Record<string, any>>({})
  const loading = ref(false)
  const saving = ref(false)

  // 搜索项：与其它 configure 页面一致（ArtSearchBar 栅格 1/4 自适应）
  const searchItems = computed(() => [
    {
      label: '所属应用',
      key: 'app',
      type: 'select',
      hidden: !isManagerApp,
      props: {
        placeholder: '请选择所属应用',
        clearable: true,
        filterable: true,
        options: appOptions.value
      }
    },
    {
      label: '所属环境',
      key: 'envId',
      type: 'select',
      props: {
        placeholder: '请选择环境',
        clearable: true,
        options: envs.value.map((item) => ({ label: `${item.name}（${item.keyword}）`, value: item.id }))
      }
    }
  ])

  // extraOf 解析渲染元数据（非法 JSON 回退空对象，不阻断渲染）
  const extraOf = (item: SettingsItem): BusinessExtra => {
    if (!item.extra) return {}
    try {
      return JSON.parse(item.extra) as BusinessExtra
    } catch {
      return {}
    }
  }

  // toFormValue 按类型把后端字符串转为前端控件值；未设置时回退 extra.default
  const toFormValue = (item: SettingsItem): any => {
    const value = item.value || extraOf(item).default
    if (!value) {
      return item.type === 'bool' ? false : item.type === 'array' ? [] : item.type === 'object' ? '' : undefined
    }
    switch (item.type) {
      case 'int':
      case 'float':
        return Number(value)
      case 'bool':
        return value === 'true'
      case 'array':
        try {
          return JSON.parse(value)
        } catch {
          return []
        }
      case 'object':
        // 对象类型使用 JSON 字符串编辑（后端按原始字符串校验）
        return value
      default:
        return value
    }
  }

  // toItemValue 按类型把前端控件值转为后端字符串
  const toItemValue = (item: SettingsItem, value: any): string => {
    if (value === undefined || value === null) return ''
    switch (item.type) {
      case 'int':
      case 'float':
        return String(value)
      case 'bool':
        return value ? 'true' : 'false'
      case 'array':
        return JSON.stringify(value)
      default:
        return String(value)
    }
  }

  const loadData = async () => {
    if (!searchForm.value.envId) return
    loading.value = true
    try {
      const res = await GetSettings({ app: searchForm.value.app || undefined, envId: searchForm.value.envId })
      items.value = res.items || []
      const next: Record<string, any> = {}
      items.value.forEach((item) => {
        next[item.keyword] = toFormValue(item)
      })
      form.value = next
    } finally {
      loading.value = false
    }
  }

  const confirmVisible = ref(false)
  const changedItems = ref<{ keyword: string; desc: string; oldValue: string; newValue: string }[]>([])

  // 展示值：空值提示占位；对象/数组一律序列化为字符串（防 [object Object]）
  const formatValue = (value: any): string => {
    if (value === undefined || value === null || value === '') return '（未设置）'
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value)
      } catch {
        return String(value)
      }
    }
    return String(value)
  }

  // 收集变更项：与加载时的原值对比（统一按字符串比较）
  const collectChanges = () => {
    changedItems.value = []
    items.value.forEach((item) => {
      const newValue = toItemValue(item, form.value[item.keyword])
      if (newValue !== item.value) {
        changedItems.value.push({
          keyword: item.keyword,
          desc: item.description || '',
          oldValue: formatValue(item.value),
          newValue: formatValue(newValue)
        })
      }
    })
  }

  // 点击保存：先提示变更，确认后提交
  const handleSave = async () => {
    if (!searchForm.value.envId) return
    collectChanges()
    if (!changedItems.value.length) {
      ElMessage.info('当前没有变更')
      return
    }
    confirmVisible.value = true
  }

  const doSave = async () => {
    if (!searchForm.value.envId) return
    saving.value = true
    try {
      await UpdateSettings({
        app: searchForm.value.app || undefined,
        envId: searchForm.value.envId,
        items: items.value.map((item) => ({
          keyword: item.keyword,
          value: toItemValue(item, form.value[item.keyword])
        }))
      })
      ElMessage.success('配置已保存，订阅方已同步生效')
      confirmVisible.value = false
      await loadData()
    } finally {
      saving.value = false
    }
  }

  const loadInitData = async () => {
    const [envRes, appRes] = await Promise.all([
      ListEnv({ status: true }),
      ListApp({ page: 1, pageSize: 50, status: true })
    ])
    envs.value = envRes.list
    appOptions.value = appRes.list.map((item) => ({
      label: `${item.name}（${item.keyword}）`,
      value: item.keyword
    }))
    if (envs.value.length) {
      searchForm.value.envId = envs.value[0].id
      await loadData()
    }
  }
  loadInitData()
</script>

<style scoped lang="scss">
  .configure-guide {
    margin-bottom: 12px;
  }

  // 配置项输入内容统一左对齐（ElInputNumber 默认居中）
  :deep(.el-input-number .el-input__inner) {
    text-align: left;
  }

  // 配置项控件最长 320px
  :deep(.el-form-item__content > *) {
    max-width: 320px;
  }

  .search {
    margin-bottom: 16px;
  }

  .settings-form {
    max-height: calc(100vh - 300px);
    overflow-y: auto;
    padding: 4px 15px;
    border-radius: 4px;
    background: #fafafa;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    min-height: 200px;

    &__item {
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }
    }

    &__label {
      display: inline-flex;
      align-items: baseline;
      gap: 6px;
      font-size: 14px;
      line-height: 1.6;
    }

    &__desc {
      color: var(--el-text-color-primary);
    }

    &__key {
      font-family: monospace;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .change-value {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    font-family: monospace;
    font-size: 12px;
    color: var(--el-text-color-regular);

    &--new {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
      padding: 0 4px;
      border-radius: 2px;
    }
  }
</style>
