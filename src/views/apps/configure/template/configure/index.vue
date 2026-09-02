<template>
  <div class="template-page">
    <div class="template-layout">
      <Left
        class="panel-left"
        :template="template"
        :initial-app="props.initialApp"
        :initial-namespace="props.initialNamespace"
        @switch="refreshTemplate"
      />
      <Center class="panel-center" :template="template" :envs="envs" @submit="handleSubmit" @sync="handleSync" />
      <Right class="panel-right" :app="app" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ListEnv } from '@/api/configure/env/api'
  import { CurrentTemplate, CreateTemplate } from '@/api/configure/template/api'
  import { SyncConfigure } from '@/api/configure/configure/api'
  import { Template } from '@/api/configure/template/type'
  import { Env } from '@/api/configure/env/type'
  import { isHttpError, showError } from '@/utils/http/error'
  import Left from '../components/left.vue'
  import Center from '../components/center.vue'
  import Right from '../components/right.vue'

  defineOptions({ name: 'ConfigureTemplateEditor' })

  const props = defineProps<{ initialApp?: string; initialNamespace?: string }>()

  const app = ref<string>()
  const namespace = ref<string>()
  const template = ref<Template>()
  const envs = ref<Env[]>([])

  const loadEnvs = async () => {
    const res = await ListEnv()
    envs.value = res.list
  }
  loadEnvs()

  const refreshTemplate = async () => {
    if (!app.value || !namespace.value) {
      template.value = undefined
      return
    }
    try {
      template.value = await CurrentTemplate(app.value, namespace.value, false)
    } catch (error: unknown) {
      if (isHttpError(error) && error.reason === 'ServerNotExistTemplateError') {
        template.value = { format: 'yaml', app: app.value, namespace: namespace.value } as Template
        return
      }
      if (isHttpError(error)) {
        showError(error)
      }
      template.value = undefined
    }
  }

  const handleSubmit = async (form: {
    app: string
    namespace: string
    content: string
    format: string
    description: string
  }) => {
    await CreateTemplate(form)
    ElMessage.success('模板提交成功')
    refreshTemplate()
  }

  const handleSync = async (data: { app: string; envId: number; description: string }) => {
    await SyncConfigure(data)
    ElMessage.success('配置同步成功')
  }

  watch(
    () => [props.initialApp, props.initialNamespace],
    ([nextApp, nextNamespace]) => {
      app.value = nextApp
      namespace.value = nextNamespace
      refreshTemplate()
    },
    { immediate: true }
  )
</script>

<style scoped>
  .template-page {
    min-height: 0;
  }

  .template-layout {
    display: flex;
    height: calc(100vh - 80px);
    gap: 15px;
  }
  .panel-left {
    width: 250px;
    flex-shrink: 0;
    background-color: var(--el-bg-color);
    border: 1px solid var(--art-card-border);
    border-radius: calc(var(--custom-radius) / 2 + 2px);
    overflow-y: auto;
  }
  .panel-center {
    flex: 1;
    min-width: 0;
    background-color: var(--el-bg-color);
    border: 1px solid var(--art-card-border);
    border-radius: calc(var(--custom-radius) / 2 + 2px);
    overflow: hidden;
  }
  .panel-right {
    width: 250px;
    flex-shrink: 0;
    background-color: var(--el-bg-color);
    border: 1px solid var(--art-card-border);
    border-radius: calc(var(--custom-radius) / 2 + 2px);
    overflow: hidden;
  }
</style>
