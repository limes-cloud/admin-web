<template>
  <ElForm class="form-box" ref="formRef" :model="formData" :rules="rules" @keyup.enter="handleSubmit">
    <ElFormItem prop="username">
      <ElInput placeholder="请输入用户账户/电话/邮箱" v-model.trim="formData.username" />
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

    <div class="forget-password">
      <ElCheckbox v-model="formData.rememberPassword">记住密码</ElCheckbox>
      <RouterLink :to="{ name: 'ForgetPassword' }">忘记密码</RouterLink>
    </div>

    <div style="margin-top: 30px">
      <ElButton class="login-btn" type="primary" @click="handleSubmit" :loading="loading" v-ripple> 登陆 </ElButton>
    </div>
  </ElForm>
</template>

<style lang="scss" scoped>
  .form-box {
    box-sizing: border-box;

    :deep(.el-input-group__append) {
      padding: 0;
    }

    .input-wrap {
      .input-label {
        display: block;
        padding-bottom: 8px;
        font-size: 15px;
        font-weight: 500;
        color: var(--art-text-gray-800);
      }
    }

    .account-select :deep(.el-select__wrapper),
    .el-input,
    .login-btn {
      height: 36px !important;
    }

    .forget-password {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 14px;
      color: var(--art-text-gray-500);

      a {
        color: var(--main-color);
        text-decoration: none;
      }
    }

    .login-btn {
      width: 100%;
      height: 36px !important;
      color: #fff;
      border: 0;
    }

    .back-btn {
      width: 100%;
      height: 36px !important;
    }
  }
</style>

<script setup lang="ts">
  import { FormRules } from 'element-plus'
  import { LoginRequest } from '@/api/manager/authorize/type'
  import { GetImageCaptcha, Login } from '@/api/manager/authorize/api'

  const saveKeys = ['username', 'password', 'rememberPassword']
  const props = defineProps<{
    data: {
      tenant: string
      app: string
      username: string
      password: string
      rememberPassword: boolean
    }
  }>()

  const formRef = useTemplateRef('formRef')

  const formData = reactive<Partial<LoginRequest & { rememberPassword: boolean }>>({ ...props.data })

  const rules = computed<FormRules>(() => ({
    username: [
      { required: true, message: '请输用户账户', trigger: ['blur', 'change'] },
      {
        type: 'string',
        message: '用户账户格式错误',
        validator: (rule: any, value: any, callback: any) => {
          // 判断是否是手机号
          const isPhone = /^1[3456789]\d{9}$/.test(value)
          // 判断是否为账户
          const isAccount = /^[a-zA-Z0-9_-]{6,16}$/.test(value)

          // 判断是否为邮箱
          const isEmail = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/.test(value)

          if (!isPhone && !isAccount && !isEmail) {
            callback(new Error('用户账户格式错误'))
          } else {
            callback()
          }
        }
      },
      { type: 'string', message: '账户最少6位数', min: 6 }
    ],
    password: [{ required: true, message: '请输入用户密码', trigger: ['blur', 'change'] }],
    captcha: [{ required: true, message: '请输入验证码', trigger: ['blur', 'change'] }]
  }))

  const loading = ref(false)

  const emits = defineEmits(['success'])

  const timeInter: any = ref(null)
  const captchaBase64 = ref('')

  const fetchCaptcha = async () => {
    // 清除定时器
    clearInterval(timeInter.value)
    // 请求验证码
    const data = await GetImageCaptcha({ scene: 'login' })
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

    Login({ ...formData } as LoginRequest)
      .then((res) => {
        emits('success', res.token, { ...formData, saveKeys })
        ElMessage.success('登录成功')
      })
      .catch(() => {
        loading.value = false
        fetchCaptcha()
      })
  }
</script>
