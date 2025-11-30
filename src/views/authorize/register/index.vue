<template>
  <div class="register">
    <Background></Background>

    <div class="register-plan">
      <div class="register-header">
        <div class="register-title">{{ welcome }}，欢迎加入</div>
        <div class="register-subtitle">{{ appStore.app.description }}</div>
      </div>
      <div class="register-box">
        <div class="left-bg">
          <ThemeSvg :src="registerIcon" size="100%" />
        </div>
        <div class="register-wrap">
          <div class="form">
            <ElForm class="form-box" ref="formRef" :model="formData" :rules="rules" @keyup.enter="handleSubmit">
              <ElFormItem prop="username">
                <ElInput placeholder="请输入用户账户" v-model.trim="formData.username" />
              </ElFormItem>
              <ElFormItem prop="password">
                <ElInput
                  v-model.trim="formData.password"
                  placeholder="请输入用户密码"
                  type="password"
                  radius="8px"
                  autocomplete="off"
                  show-password
                />
              </ElFormItem>

              <ElFormItem prop="captcha">
                <ElInput placeholder="请输入验证码" v-model.trim="formData.captcha">
                  <template #append>
                    <img v-if="captchaBase64" width="100" height="34" :src="captchaBase64" @click="fetchCaptcha()" />
                  </template>
                </ElInput>
              </ElFormItem>

              <div style="margin-top: 30px">
                <ElButton class="register-btn" type="primary" @click="handleSubmit" :loading="loading" v-ripple>
                  注册
                </ElButton>
              </div>
            </ElForm>
          </div>

          <div class="footer">
            <p>
              已有账号？
              <RouterLink :to="{ name: 'Login' }">立即登录</RouterLink>
            </p>
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
  import registerIcon from '@imgs/svg/login_icon.svg'
  import { FormRules } from 'element-plus'
  import { RegisterReply, RegisterRequest } from '@/api/manager/authorize/type'
  import { GetImageCaptcha, Register } from '@/api/manager/authorize/api'

  import Background from '../background/index.vue'
  import { useAppStore } from '@/store/modules/app'
  import { useUserStore } from '@/store/modules/user'

  const router = useRouter()
  const appStore = useAppStore()
  const userStore = useUserStore()

  const tenantConfig = useStorage('login-tenant', {
    tenant: '',
    app: ''
  })

  //  从缓存中读取，没有则跳转到错误页面
  if (!tenantConfig.value.tenant || !tenantConfig.value.app) {
    router.replace({ name: 'Exception500' })
  }

  const formRef = useTemplateRef('formRef')
  const formData = reactive<Partial<RegisterRequest & { rememberPassword: boolean }>>({ ...tenantConfig.value })

  const rules = computed<FormRules>(() => ({
    username: [
      { required: true, message: '请输用户账户', trigger: ['blur', 'change'] },
      {
        type: 'string',
        message: '用户账户格式错误',
        pattern: /^[a-zA-Z0-9_-]{6,16}$/
      },
      { type: 'string', message: '账户最少6位数', min: 6 }
    ],
    password: [
      { required: true, message: '请输入用户密码', trigger: ['blur', 'change'] },
      { min: 8, message: '密码最少8位数', trigger: ['blur', 'change'] }
    ],
    captcha: [{ required: true, message: '请输入验证码', trigger: ['blur', 'change'] }]
  }))

  const loading = ref(false)
  const timeInter: any = ref(null)
  const captchaBase64 = ref('')

  const fetchCaptcha = async () => {
    // 清除定时器
    clearInterval(timeInter.value)
    // 请求验证码
    const data = await GetImageCaptcha({ scene: 'register' })
    formData.captchaId = data.uuid
    captchaBase64.value = data.captcha
    if (!data.expire) {
      ElMessage.error('验证码配置错误')
      return
    }
    // 定时刷新
    timeInter.value = setInterval(() => {
      fetchCaptcha()
    }, data.expire * 1000)
  }

  fetchCaptcha()

  // 登录
  const handleSubmit = async () => {
    const valid = await formRef.value?.validate()
    if (!valid) return
    loading.value = true

    Register({ ...formData } as RegisterRequest)
      .then(async (res: RegisterReply) => {
        ElMessage.success('注册成功')
        await userStore.login(res.token)
        router.push('/')
      })
      .catch(() => {
        loading.value = false
        fetchCaptcha()
      })
  }

  const welcome = ref('')
  const getDate = () => {
    const h = new Date().getHours()
    if (h >= 6 && h < 9) welcome.value = '早上好'
    else if (h >= 9 && h < 11) welcome.value = '上午好'
    else if (h >= 11 && h < 13) welcome.value = '中午好'
    else if (h >= 13 && h < 18) welcome.value = '下午好'
    else if (h >= 18 && h < 24) welcome.value = '晚上好'
    else welcome.value = '夜已深'
  }

  onMounted(() => {
    getDate()
  })
</script>
