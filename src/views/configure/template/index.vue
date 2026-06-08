<template>
  <div class="art-full-height">
    <ElCard shadow="never" style="height:100%">
      <div class="template-layout">
        <Left class="panel-left" :template="template" @select="handleSelectServer" @switch="refreshTemplate" />
        <Center class="panel-center" :template="template" :envs="envs" @submit="handleSubmit" @sync="handleSync" />
        <Right class="panel-right" :server-id="serverId" />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ListEnv } from '@/api/configure/env/api'
  import { CurrentTemplate, CreateTemplate } from '@/api/configure/template/api'
  import { SyncConfigure } from '@/api/configure/configure/api'
  import { Template } from '@/api/configure/template/type'
  import { Env } from '@/api/configure/env/type'
  import Left from './components/left.vue'
  import Center from './components/center.vue'
  import Right from './components/right.vue'

  defineOptions({ name: 'ConfigureTemplate' })

  const serverId = ref<number>()
  const template = ref<Template>()
  const envs = ref<Env[]>([])

  const loadEnvs = async () => {
    const res = await ListEnv()
    envs.value = res.list
  }
  loadEnvs()

  const refreshTemplate = async () => {
    if (!serverId.value) return
    try {
      template.value = await CurrentTemplate(serverId.value)
    } catch {
      template.value = { format: 'yaml', serverId: serverId.value } as Template
    }
  }

  const handleSelectServer = (id: number) => {
    serverId.value = id
    refreshTemplate()
  }

  const handleSubmit = async (form: { serverId: number; content: string; format: string; description: string }) => {
    await CreateTemplate(form)
    ElMessage.success('模板提交成功')
    refreshTemplate()
  }

  const handleSync = async (data: { serverId: number; envId: number; description: string }) => {
    await SyncConfigure(data)
    ElMessage.success('配置同步成功')
  }
</script>

<style scoped>
  .template-layout { display: flex; height: calc(100vh - 160px); gap: 12px; }
  .panel-left { width: 250px; flex-shrink: 0; border: 1px solid var(--el-border-color-lighter); border-radius: 4px; overflow-y: auto; }
  .panel-center { flex: 1; min-width: 0; border: 1px solid var(--el-border-color-lighter); border-radius: 4px; overflow: hidden; }
  .panel-right { width: 250px; flex-shrink: 0; border: 1px solid var(--el-border-color-lighter); border-radius: 4px; overflow: hidden; }
</style>
