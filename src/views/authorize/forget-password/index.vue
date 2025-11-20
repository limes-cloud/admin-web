<template>
  <div class="login register">
    <LoginLeftView></LoginLeftView>
    <div class="right-wrap">
      <AuthTopBar />
      <div class="header">
        <ArtLogo class="icon" />
        <h1>{{ appStore.setting.title }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('forgetPassword.title') }}</h3>
          <p class="sub-title">{{ $t('forgetPassword.subTitle') }}</p>
          <div class="input-wrap">
            <span class="input-label" v-if="showInputLabel">账号</span>
            <ElInput :placeholder="$t('forgetPassword.placeholder')" v-model.trim="username" />
          </div>

          <div style="margin-top: 15px">
            <ElButton class="login-btn" type="primary" @click="register" :loading="loading" v-ripple>
              {{ $t('forgetPassword.submitBtnText') }}
            </ElButton>
          </div>

          <div style="margin-top: 15px">
            <ElButton class="back-btn" plain @click="toLogin">
              {{ $t('forgetPassword.backBtnText') }}
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useAppStore } from '@/store/modules/app'

  defineOptions({ name: 'ForgetPassword' })

  const router = useRouter()
  const showInputLabel = ref(false)

  const appStore = useAppStore()

  const username = ref('')
  const loading = ref(false)

  const register = async () => {}

  const toLogin = () => {
    router.push({ name: 'Login' })
  }
</script>

<style lang="scss" scoped>
  @use '../login/index';
</style>
