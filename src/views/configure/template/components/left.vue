<template>
  <div class="template-left">
    <div class="section-title">服务信息</div>
    <ElSelect v-model="serverId" placeholder="请选择服务" filterable clearable style="width:100%" @change="handleChange">
      <ElOption v-for="s in servers" :key="s.id" :label="s.name" :value="s.id" />
    </ElSelect>

    <template v-if="currentServer">
      <div class="info-row"><span class="label">服务名称</span><span class="value">{{ currentServer.name }}</span></div>
      <div class="info-row"><span class="label">服务标识</span><span class="value">{{ currentServer.keyword }}</span></div>
    </template>

    <template v-if="serverId">
      <div class="section-title" style="margin-top:16px">模板信息</div>
      <template v-if="template?.id">
        <div class="info-row">
          <span class="label">当前版本</span>
          <span class="value">
            {{ template.version.substring(0, 12) }}
            <ElLink v-permission="'configure:template:history'" type="primary" style="margin-left:6px" @click="handleShowHistory">切换</ElLink>
          </span>
        </div>
        <div class="info-row"><span class="label">创建时间</span><span class="value">{{ formatTime(template.createdAt) }}</span></div>
        <div class="info-row"><span class="label">版本描述</span><span class="value">{{ template.description || '暂无描述' }}</span></div>
      </template>
      <ElEmpty v-else description="暂无配置数据" :image-size="60" />
    </template>
    <ElEmpty v-else description="请先选择服务" :image-size="60" />

    <!-- 版本历史弹窗 -->
    <ElDialog v-model="historyVisible" title="切换配置" width="860px" :destroy-on-close="true">
      <div style="display:flex;height:500px">
        <div style="width:240px;overflow-y:auto;border-right:1px solid var(--el-border-color)">
          <div
            v-for="item in templateList"
            :key="item.id"
            class="history-item"
            :class="{ active: curTempId === item.id }"
            @click="handleSelectVersion(item)"
          >
            <div>版本：{{ item.version.substring(0, 12) }}<ElTag v-if="template?.id === item.id" size="small" type="primary" style="margin-left:4px">使用中</ElTag></div>
            <div class="history-desc">{{ item.description }}</div>
            <div class="history-time">{{ formatTime(item.createdAt) }}</div>
            <ElLink type="primary" @click.stop="showCompare(item)">查看变更</ElLink>
          </div>
        </div>
        <div style="flex:1;overflow:hidden">
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
  import { ListServer } from '@/api/configure/server/api'
  import { GetTemplate, ListTemplate, SwitchTemplate } from '@/api/configure/template/api'
  import { Template, CompareTemplateInfo } from '@/api/configure/template/type'
  import { formatTime } from '@/utils/time'
  import ArtCodeEditor from '@/components/core/base/art-code-editor/index.vue'
  import Compare from './compare.vue'

  interface ServerItem { id: number; name: string; keyword: string }

  const props = defineProps<{ template?: Template }>()
  const emit = defineEmits<{ select: [id: number]; switch: [] }>()

  const serverId = ref<number>()
  const servers = ref<ServerItem[]>([])
  const currentServer = computed(() => servers.value.find(s => s.id === serverId.value))

  const historyVisible = ref(false)
  const templateList = ref<Template[]>([])
  const curTempId = ref<number>()
  const previewContent = ref('')
  const compareVisible = ref(false)
  const compareData = ref<CompareTemplateInfo[]>([])

  const loadServers = async () => {
    const res = await ListServer({ page: 1, pageSize: 100, status: true })
    servers.value = res.list
  }
  loadServers()

  const handleChange = (val: number) => emit('select', val)

  const handleShowHistory = async () => {
    const res = await ListTemplate({ page: 1, pageSize: 20, serverId: serverId.value! })
    if (!res.list.length) { ElMessage.error('暂无历史模板'); return }
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
    await SwitchTemplate({ serverId: serverId.value!, id: curTempId.value! })
    ElMessage.success('模板切换成功')
    historyVisible.value = false
    emit('switch')
  }

  const showCompare = (item: Template) => {
    if (!item.compare) { ElMessage.error('无变更信息'); return }
    compareData.value = JSON.parse(item.compare)
    compareVisible.value = true
  }
</script>

<style scoped>
  .template-left { padding: 10px; }
  .section-title { font-weight: 700; font-size: 14px; margin-bottom: 12px; padding-left: 8px; border-left: 4px solid var(--el-color-primary); }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
  .info-row .label { color: var(--el-text-color-secondary); font-weight: 600; width: 56px; flex-shrink: 0; }
  .info-row .value { color: var(--el-text-color-regular); }
  .history-item { padding: 10px 12px; cursor: pointer; border-bottom: 1px solid var(--el-border-color-lighter); font-size: 12px; }
  .history-item.active, .history-item:hover { background: var(--el-color-primary-light-9); }
  .history-desc { color: var(--el-text-color-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 4px 0; }
  .history-time { color: var(--el-text-color-placeholder); margin-bottom: 4px; }
</style>
