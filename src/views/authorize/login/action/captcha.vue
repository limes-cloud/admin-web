<template>
  <ElForm class="form-box" ref="formRef" :model="formData" :rules="rules" @keyup.enter="handleSubmit">
    <ElFormItem prop="tenant">
      <ElInput v-if="!data.selectTenant" v-model.trim="formData.tenant" placeholder="请输入租户标识" />
      <ElSelect
        v-else
        v-model.trim="formData.tenant"
        placeholder="请选择所属租户"
        :options="data.tenants"
        :props="{ label: 'name', value: 'keyword' }"
      >
      </ElSelect>
    </ElFormItem>

    <ElFormItem prop="username">
      <ElInput :placeholder="'请输入用户' + typeText" v-model.trim="formData.username" />
    </ElFormItem>

    <ElFormItem prop="captcha">
      <div class="captcha-box">
        <ElInput
          class="captcha-input"
          v-model.trim="formData.captcha"
          :style="{ width: '100%' }"
          placeholder="请输入验证码"
        >
        </ElInput>
        <ElButton class="captcha-btn" @click="handleSendCaptcha" v-ripple :disabled="disableReSend">
          {{ capBtnText }}
        </ElButton>
      </div>
    </ElFormItem>

    <div class="forget-password">
      <ElCheckbox v-model="formData.rememberPassword">记住密码</ElCheckbox>
    </div>

    <div style="margin-top: 10px">
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

    .captcha-box {
      display: flex;
      justify-content: space-between;
      width: 100%;

      .captcha-input {
        flex: 1;
        margin-right: 10px;
      }

      .captcha-btn {
        width: 100px;
        height: 36px !important;
      }
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
  import { OAuther } from '@/api/manager/authorize/type'
  import { OAutherHandle, OAutherLogin } from '@/api/manager/authorize/api'
  import { Tenant } from '@/api/manager/tenant/type'

  const saveKeys = ['username', 'rememberPassword']
  const props = defineProps<{
    data: {
      tenant: string
      app: string
      username: string
      rememberPassword: boolean
      selectTenant: boolean
      tenants: Tenant[]
    }
    oauther: OAuther
  }>()

  const typeText = computed(() => {
    if (props.oauther.type === 'phone') {
      return '手机号'
    } else {
      return '邮箱'
    }
  })

  const formRef = useTemplateRef('formRef')

  const formData = reactive<
    Partial<{
      tenant: string
      username: string
      captcha: string
      captchaId: string
      rememberPassword: boolean
    }>
  >({ ...props.data })

  const rules = computed<FormRules>(() => ({
    username: [
      { required: true, message: '请输' + typeText.value, trigger: ['blur', 'change'] },
      {
        type: 'string',
        message: typeText.value + '格式错误',
        validator: (rule: any, value: any, callback: any) => {
          if (props.oauther.type === 'phone') {
            const isPhone = /^1[3456789]\d{9}$/.test(value)
            if (!isPhone) {
              callback(new Error(typeText.value + '格式错误'))
            } else {
              callback()
            }
          } else {
            const isEmail = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/.test(value)
            if (!isEmail) {
              callback(new Error(typeText.value + '格式错误'))
            } else {
              callback()
            }
          }
        }
      }
    ],
    captcha: [{ required: true, message: '请输入验证码', trigger: ['blur', 'change'] }]
  }))

  const loading = ref(false)

  const emits = defineEmits(['submit'])

  // 获取验证码倒计时
  const disableReSend = ref(false)
  const capBtnText = ref('获取验证码')

  const countdown = (time: number) => {
    const timeInter: any = ref(null)
    disableReSend.value = true
    timeInter.value = setInterval(() => {
      capBtnText.value = `${time}秒后重发`
      time -= 1
      if (time <= 0) {
        clearInterval(timeInter.value)
        disableReSend.value = false
        capBtnText.value = '获取验证码'
      }
    }, 1000)
  }

  const handleSendCaptcha = async () => {
    const valid = await formRef.value?.validateField('username')
    if (!valid) return

    const data = await OAutherHandle({ ...props.data, keyword: props.oauther.keyword, account: formData.username })
    ElMessage.success('验证码发送成功，请注意查收')
    formData.captchaId = data.uuid
    countdown(Number(data.value) || 60)
  }

  // 登录
  const handleSubmit = async () => {
    const valid = await formRef.value?.validate()
    if (!valid) return
    loading.value = true

    console.log(formData.captchaId)

    if (!formData.captchaId) {
      ElMessage.error('验证码未获取成功，请刷新重试')
      loading.value = false
      return
    }

    OAutherLogin({
      keyword: props.oauther.keyword,
      uuid: formData.captchaId,
      code: formData.captcha as string,
      account: formData.username
    })
      .then(() => {
        ElMessage.success('登录成功')
      })
      .finally(() => {
        loading.value = false
      })

    emits('submit', { ...formData, saveKeys })
  }
</script>
