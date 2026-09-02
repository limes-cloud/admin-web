<template>
  <div class="template-left">
    <div class="section-title">应用信息</div>

    <template v-if="currentApp">
      <div class="info-row"
        ><span class="label">应用名称</span><span class="value">{{ currentApp.name }}</span></div
      >
      <div class="info-row"
        ><span class="label">应用标识</span><span class="value">{{ currentApp.keyword }}</span></div
      >
      <div class="info-row"
        ><span class="label">配置项</span><span class="value">{{ namespace || '未选择' }}</span></div
      >
    </template>

    <template v-if="app">
      <div class="section-title" style="margin-top: 16px">模板信息</div>
      <template v-if="template?.id">
        <div class="info-row">
          <span class="label">当前版本</span>
          <span class="value">
            {{ template.version.substring(0, 12) }}
            <ElLink
              v-permission="'configure:template:history'"
              type="primary"
              style="margin-left: 6px"
              @click="handleShowHistory"
              >切换</ElLink
            >
          </span>
        </div>
        <div class="info-row"
          ><span class="label">创建时间</span><span class="value">{{ formatTime(template.createdAt) }}</span></div
        >
        <div class="info-row"
          ><span class="label">版本描述</span><span class="value">{{ template.description || '暂无描述' }}</span></div
        >
      </template>
      <ElEmpty v-else description="暂无配置数据" :image-size="60" />
    </template>
    <ElEmpty v-else description="请先选择应用" :image-size="60" />

    <!-- 版本历史弹窗 -->
    <ElDialog v-model="historyVisible" title="切换配置" width="860px" :destroy-on-close="true">
      <div style="display: flex; height: 500px">
        <div style="width: 240px; overflow-y: auto; border-right: 1px solid var(--el-border-color)">
          <div
            v-for="item in templateList"
            :key="item.id"
            class="history-item"
            :class="{ active: curTempId === item.id }"
            @click="handleSelectVersion(item)"
          >
            <div
              >版本：{{ item.version.substring(0, 12)
              }}<ElTag v-if="template?.id === item.id" size="small" type="primary" style="margin-left: 4px"
                >使用中</ElTag
              ></div
            >
            <div class="history-desc">{{ item.description }}</div>
            <div class="history-time">{{ formatTime(item.createdAt) }}</div>
            <ElLink type="primary" @click.stop="showCompare(item)">查看变更</ElLink>
          </div>
        </div>
        <div style="flex: 1; overflow: hidden">
          <ArtCodeEditor v-model="previewContent" :style="{ width: '100%', height: '500px' }" />
        </div>
      </div>
      <template #footer>
        <ElButton @click="historyVisible = false">取消</ElButton>
        <ElButton type="primary" :disabled="curTempId === template?.id" @click="handleSwitch">确认切换</ElButton>
      </template>
    </ElDialog>

    <!-- diff 弹窗 -->
    <ElDialog v-model="compareVisible" title="变更详情" width="860px">
      <Compare :data="compareData" />
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ListApp } from '@/api/manager/app/api'
  import { App } from '@/api/manager/app/type'
  import { GetTemplate, ListTemplate, SwitchTemplate } from '@/api/configure/template/api'
  import { Template, CompareTemplateInfo } from '@/api/configure/template/type'
  import { formatTime } from '@/utils/time'
  import ArtCodeEditor from '@/components/core/base/art-code-editor/index.vue'
  import Compare from './compare.vue'

  const props = defineProps<{ template?: Template; initialApp?: string; initialNamespace?: string }>()
  const emit = defineEmits<{ switch: [] }>()

  const app = ref<string>()
  const namespace = ref<string>()
  const apps = ref<App[]>([])
  const selectedApp = ref<App>()
  const currentApp = computed(() => selectedApp.value || apps.value.find((item) => item.keyword === app.value))

  const historyVisible = ref(false)
  const templateList = ref<Template[]>([])
  const curTempId = ref<number>()
  const previewContent = ref('')
  const compareVisible = ref(false)
  const compareData = ref<CompareTemplateInfo[]>([])

  const loadApps = async (query?: string) => {
    const keyword = query?.trim()
    if (!keyword) {
      const res = await ListApp({ page: 1, pageSize: 50, status: true })
      apps.value = res.list
      return
    }

    const [nameRes, keywordRes] = await Promise.all([
      ListApp({ page: 1, pageSize: 50, status: true, name: keyword }),
      ListApp({ page: 1, pageSize: 50, status: true, keyword })
    ])
    const list = [...nameRes.list, ...keywordRes.list]
    apps.value = list.filter((item, index) => list.findIndex((app) => app.id === item.id) === index)
  }
  loadApps()

  watch(
    () => [props.initialApp, props.initialNamespace],
    ([nextApp, nextNamespace]) => {
      if (!nextApp) return
      app.value = nextApp
      namespace.value = nextNamespace
      selectedApp.value = apps.value.find((item) => item.keyword === nextApp)
    },
    { immediate: true }
  )

  watch(apps, () => {
    if (!app.value || selectedApp.value) return
    selectedApp.value = apps.value.find((item) => item.keyword === app.value)
  })

  const handleShowHistory = async () => {
    if (!app.value) {
      ElMessage.error('请先选择应用')
      return
    }
    if (!namespace.value) {
      ElMessage.error('请先选择或输入配置项')
      return
    }
    const res = await ListTemplate({ page: 1, pageSize: 20, app: app.value!, namespace: namespace.value })
    if (!res.list.length) {
      ElMessage.error('暂无历史模板')
      return
    }
    templateList.value = res.list
    curTempId.value = props.template?.id
    const first = await GetTemplate(res.list[0].id)
    previewContent.value = first.content
    historyVisible.value = true
  }

  const handleSelectVersion = async (item: Template) => {
    curTempId.value = item.id
    const detail = await GetTemplate(item.id)
    previewContent.value = detail.content
  }

  const handleSwitch = async () => {
    if (!app.value) {
      ElMessage.error('请先选择应用')
      return
    }
    if (!namespace.value) {
      ElMessage.error('请先选择或输入配置项')
      return
    }
    if (!curTempId.value) {
      ElMessage.error('请选择要切换的模板')
      return
    }
    await SwitchTemplate({ app: app.value, namespace: namespace.value, id: curTempId.value })
    ElMessage.success('模板切换成功')
    historyVisible.value = false
    emit('switch')
  }

  const showCompare = (item: Template) => {
    if (!item.compare) {
      ElMessage.error('无变更信息')
      return
    }
    compareData.value = JSON.parse(item.compare)
    compareVisible.value = true
  }
</script>

<style scoped>
  .template-left {
    padding: 10px;
  }
  .section-title {
    position: relative;
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 12px;
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
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
  }
  .info-row .label {
    color: var(--el-text-color-secondary);
    font-weight: 600;
    width: 56px;
    flex-shrink: 0;
  }
  .info-row .value {
    color: var(--el-text-color-regular);
  }
  .history-item {
    padding: 10px 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--el-border-color-lighter);
    font-size: 12px;
  }
  .history-item.active,
  .history-item:hover {
    background: var(--el-color-primary-light-9);
  }
  .history-desc {
    color: var(--el-text-color-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 4px 0;
  }
  .history-time {
    color: var(--el-text-color-placeholder);
    margin-bottom: 4px;
  }
</style>
