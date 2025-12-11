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
            <div class="form">
              <ArtForm
                v-model="currentData"
                :items="formItems"
                :span="24"
                @submit="submit"
                :show-cancel="false"
              ></ArtForm>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @use './index';
</style>

<script setup lang="ts">
  import { toFormItems } from '@/router/utils/field'
  import Background from '../background/index.vue'
  import { FormItem } from '@/components/core/forms/art-form/index.vue'
  import { FillInfo, ListFileInfo } from '@/api/manager/authorize/api'
  import { Field } from '@/api/manager/appfield/type'
  import { useUserStore } from '@/store/modules/user'

  const router = useRouter()
  const userStore = useUserStore()

  const { uuid } = router.currentRoute.value.query
  if (!uuid) {
    router.replace({ name: 'Exception500' })
  }

  const currentData = ref<Record<string, any>>({})

  const formItems = ref<FormItem[]>([])

  ListFileInfo({ uuid: String(uuid) }).then((res) => {
    formItems.value = toFormItems(res.list as unknown as Field[])

    // 初始化默认值
    res.list.forEach((item) => {
      if (item.value) {
        currentData.value[item.keyword] = item.value as any
      }
    })
  })

  const submit = async () => {
    FillInfo({
      uuid: String(uuid),
      infos: currentData.value['infos']
    })
      .then(async (res) => {
        ElMessage.success('信息补充成功')
        await userStore.login(res.token)
        router.push('/')
      })
      .catch((res) => {
        if (res.data.reason === 'LoginExpiredError') {
          router.replace({ name: 'Login' })
          return
        }
      })
  }
</script>
