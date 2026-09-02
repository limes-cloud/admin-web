<template>
  <div class="template-center">
    <div class="actions">
      <ElButton
        v-permission="'configure:template:preview'"
        type="success"
        :disabled="!canOperate"
        @click="handlePreview"
        >生成预览</ElButton
      >
      <ElButton
        v-permission="'configure:template:add'"
        type="primary"
        :disabled="!canOperate"
        @click="handleCompare"
        >提交模板</ElButton
      >
      <ElButton
        v-permission="'configure:configure:sync'"
        type="warning"
        :disabled="!canOperate"
        @click="handleSync"
        >同步配置</ElButton
      >
    </div>
    <div class="editor-wrap">
      <ArtCodeEditor
        v-model="content"
        :lang="format"
        :show-switch-lang="true"
        :style="{ width: '100%', height: '100%' }"
        @change-lang="(v) => (format = v)"
      />
    </div>

    <!-- 选环境弹窗 -->
    <ElDialog v-model="envVisible" :title="`请选择${envTitle}环境`" width="400px" align-center>
      <ElSelect v-model="selectedEnvId" placeholder="请选择环境" style="width: 100%">
        <ElOption v-for="env in envs" :key="env.id" :label="env.name" :value="env.id" />
      </ElSelect>
      <template #footer>
        <ElButton @click="envVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleEnvConfirm">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 预览内容弹窗 -->
    <ElDialog v-model="previewVisible" title="配置详情" width="860px" :destroy-on-close="true">
      <ArtCodeEditor :model-value="previewContent" :style="{ width: '100%', height: '500px' }" />
      <template #footer>
        <ElButton @click="previewVisible = false">关闭</ElButton>
      </template>
    </ElDialog>

    <!-- diff 确认弹窗 -->
    <ElDialog v-model="compareVisible" title="变更详情" width="860px" :destroy-on-close="true">
      <Compare :data="compareData" />
      <template #footer>
        <ElButton @click="compareVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleConfirmChange">确认变更</ElButton>
      </template>
    </ElDialog>

    <!-- 变更描述弹窗 -->
    <ElDialog v-model="descVisible" title="变更描述" width="400px" align-center>
      <ElInput v-model="description" placeholder="请简要概述本次提交的修改" />
      <template #footer>
        <ElButton @click="descVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleDescConfirm">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ParseTemplate, CompareTemplate } from '@/api/configure/template/api'
  import { CompareConfigure } from '@/api/configure/configure/api'
  import { Template, CompareTemplateInfo } from '@/api/configure/template/type'
  import { Env } from '@/api/configure/env/type'
  import ArtCodeEditor from '@/components/core/base/art-code-editor/index.vue'
  import Compare from './compare.vue'

  const SUBMIT = 'submit'
  const SYNC = 'sync'

  const props = defineProps<{ template?: Template; envs?: Env[] }>()
  const emit = defineEmits<{
    submit: [data: { app: string; namespace: string; content: string; format: string; description: string }]
    sync: [data: { app: string; envId: number; description: string }]
  }>()

  const content = ref('')
  const format = ref('yaml')

  const envVisible = ref(false)
  const envTitle = ref('')
  const selectedEnvId = ref<number>()
  const operator = ref('')

  const previewVisible = ref(false)
  const previewContent = ref('')

  const compareVisible = ref(false)
  const compareData = ref<CompareTemplateInfo[]>([])

  const descVisible = ref(false)
  const description = ref('')

  const canOperate = computed(() => !!props.template?.app && !!props.template?.namespace)

  watch(
    () => props.template,
    (val) => {
      if (!val) {
        content.value = ''
        format.value = 'yaml'
        return
      }
      content.value = val.content || ''
      format.value = val.format || 'yaml'
    },
    { immediate: true }
  )

  const handlePreview = () => {
    operator.value = ''
    envTitle.value = '预览'
    selectedEnvId.value = undefined
    envVisible.value = true
  }

  const handleSync = () => {
    operator.value = SYNC
    envTitle.value = '同步'
    selectedEnvId.value = undefined
    envVisible.value = true
  }

  const handleEnvConfirm = async () => {
    if (!props.template?.app) {
      ElMessage.error('请先选择应用')
      return
    }
    if (!props.template?.namespace) {
      ElMessage.error('请先选择或输入配置项')
      return
    }
    if (!selectedEnvId.value) {
      ElMessage.error('请选择环境')
      return
    }
    envVisible.value = false
    if (!operator.value) {
      const res = await ParseTemplate({
        content: content.value,
        format: format.value,
        envId: selectedEnvId.value,
        app: props.template!.app,
        namespace: props.template!.namespace
      })
      previewContent.value = formatJsonContent(res.content)
      previewVisible.value = true
    } else if (operator.value === SYNC) {
      const res = await CompareConfigure({ app: props.template!.app, envId: selectedEnvId.value })
      if (!res.list.length) {
        ElMessage.error('配置不存在变更')
        return
      }
      compareData.value = res.list
      compareVisible.value = true
    }
  }

  const handleCompare = async () => {
    if (!props.template?.app) {
      ElMessage.error('请先选择应用')
      return
    }
    if (!props.template?.namespace) {
      ElMessage.error('请先选择或输入配置项')
      return
    }
    if (!props.template?.id) {
      operator.value = SUBMIT
      description.value = '初始化提交'
      descVisible.value = true
      return
    }
    const res = await CompareTemplate({ id: props.template.id, content: content.value, format: format.value })
    if (!res.list.length) {
      ElMessage.error('模板不存在变更')
      return
    }
    operator.value = SUBMIT
    compareData.value = res.list
    compareVisible.value = true
  }

  const handleConfirmChange = () => {
    compareVisible.value = false
    description.value = ''
    descVisible.value = true
  }

  const handleDescConfirm = async () => {
    if (!props.template?.app) {
      ElMessage.error('请先选择应用')
      return
    }
    if (!props.template?.namespace) {
      ElMessage.error('请先选择或输入配置项')
      return
    }
    if (!description.value) {
      ElMessage.error('请填写变更描述')
      return
    }
    descVisible.value = false
    if (operator.value === SUBMIT) {
      const finalContent = formatJsonContent(content.value, true)
      if (!finalContent) return
      emit('submit', {
        app: props.template!.app,
        namespace: props.template!.namespace,
        content: finalContent,
        format: format.value,
        description: description.value
      })
    } else if (operator.value === SYNC) {
      emit('sync', { app: props.template!.app, envId: selectedEnvId.value!, description: description.value })
    }
  }

  const formatJsonContent = (value: string, compact = false) => {
    if (format.value !== 'json') return value
    try {
      return JSON.stringify(JSON.parse(value), null, compact ? undefined : 2)
    } catch {
      ElMessage.error('JSON 格式不正确')
      return ''
    }
  }
</script>

<style scoped>
  .template-center {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
  }
  .actions {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    flex-shrink: 0;
  }
  .editor-wrap {
    flex: 1;
    overflow: hidden;
  }
</style>
