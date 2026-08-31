<template>
  <div class="fill">
    <Background></Background>

    <div class="fill-body">
      <div class="fill-plan">
        <div class="fill-header">
          <div class="fill-title">资料补充</div>
          <div class="fill-subtitle">系统检测到您的信息存在缺失，为了更好的使用体验，请补充以下信息</div>
        </div>
        <div class="fill-box">
          <div class="fill-wrap">
            <div class="form" v-if="schema">
              <FormRenderer
                ref="rendererRef"
                :schema="schema"
                v-model="formData"
              />
              <div class="form-footer">
                <ElButton type="primary" :loading="submitting" @click="handleSubmit">提交</ElButton>
              </div>
            </div>
            <div v-else-if="loadError" class="form-error">
              <ElEmpty description="表单加载失败，请联系管理员" />
            </div>
            <div v-else class="form-loading">
              <ElSkeleton :rows="5" animated />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @use './index';

  .form-footer {
    margin-top: 24px;
    text-align: center;
  }

  .form-loading,
  .form-error {
    padding: 40px 0;
  }
</style>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import Background from '../background/index.vue'
  import FormRenderer from '@/components/core/base/art-form-editor/components/renderer/FormRenderer.vue'
  import { FormSchema } from '@/components/core/base/art-form-editor/lib/types'
  import { GetUserFormByApp } from '@/api/manager/userform/api'
  import { FillInfo, ListFileInfo } from '@/api/manager/authorize/api'
  import { useUserStore } from '@/store/modules/user'

  const router = useRouter()
  const userStore = useUserStore()

  const { uuid, app, scene } = router.currentRoute.value.query
  if (!uuid) {
    router.replace({ name: 'Exception500' })
  }

  const rendererRef = ref<InstanceType<typeof FormRenderer>>()
  const schema = ref<FormSchema | null>(null)
  const formData = ref<Record<string, any>>({})
  const submitting = ref(false)
  const loadError = ref(false)

  onMounted(async () => {
    try {
      // 通过 app + scene 获取表单 schema
      const appKeyword = String(app || '')
      const sceneStr = String(scene || 'fillinfo')

      if (appKeyword) {
        const res = await GetUserFormByApp({ appKeyword, scene: sceneStr })
        const parsed: FormSchema = JSON.parse(res.data.schema)
        schema.value = parsed
      } else {
        // 兼容旧逻辑：无 app 参数时使用 ListFileInfo
        loadError.value = true
      }

      // 加载已有用户数据进行回显
      if (uuid) {
        try {
          const infoRes = await ListFileInfo({ uuid: String(uuid) })
          if (infoRes.list) {
            const initData: Record<string, any> = {}
            infoRes.list.forEach((item) => {
              if (item.value) {
                initData[item.keyword] = item.value
              }
            })
            formData.value = initData
          }
        } catch {
          // 无已有数据时忽略
        }
      }
    } catch {
      loadError.value = true
    }
  })

  const handleSubmit = async () => {
    try {
      await rendererRef.value?.validate()
    } catch {
      ElMessage.warning('请完善表单信息')
      return
    }

    submitting.value = true
    try {
      const data = rendererRef.value?.getFormData() || formData.value
      const res = await FillInfo({
        uuid: String(uuid),
        infos: data
      })
      ElMessage.success('信息补充成功')
      await userStore.login(res.token)
      router.push('/')
    } catch (err: any) {
      if (err?.data?.reason === 'LoginExpiredError') {
        router.replace({ name: 'Login' })
      }
    } finally {
      submitting.value = false
    }
  }
</script>
