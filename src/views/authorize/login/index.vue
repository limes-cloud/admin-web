<template>
  <div class="login">
    <Background></Background>

    <div class="login-plan">
      <div class="login-header">
        <div class="login-title">{{ welcome }}，欢迎回来</div>
        <div class="login-subtitle">{{ appStore.app.description }}</div>
      </div>
      <div class="login-box">
        <div class="left-bg">
          <ThemeSvg :src="loginIcon" size="100%" />
        </div>
        <div class="login-wrap">
          <div class="password-back" v-if="oauthWay.action !== 'password'">
            <el-tag @click="handleCallbackPassword">
              <div class="password-back-text">
                <ArtIcon value="iconsys-zuo2"></ArtIcon>
                密码登陆
              </div>
            </el-tag>
          </div>

          <div class="form" v-if="oauthWay.action === 'password'">
            <PasswordLogin
              :data="loginData"
              @success="handleLogin"
              @info="handleFillInfo"
              @change-tenant="handleChangeTenant"
            />
          </div>
          <div class="form" v-if="oauthWay.action === 'captcha'">
            <CaptchaLogin
              type="email"
              :data="loginData"
              :oauther="currentOAuther"
              @bind="handleBind"
              @info="handleFillInfo"
              @success="handleLogin"
            />
          </div>
          <div class="footer" v-if="!appStore.app.private">
            <p>
              还没有账号？
              <RouterLink :to="{ name: 'Register' }">立即注册</RouterLink>
            </p>
          </div>

          <div class="other-login-box" v-if="oauthers.length">
            <el-divider content-position="center">其他登陆方式</el-divider>
            <div class="other-login">
              <template v-for="(item, index) in oauthers" :key="index">
                <div class="other-login-item" @click="handleGetOAuthWay(item)">
                  <ElImage class="login-item-logo" :src="$rurl(item.logo)" />
                  <span class="login-item-text"> {{ item.name }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import loginIcon from '@imgs/svg/login_icon.svg'
  import PasswordLogin from './action/password.vue'
  import CaptchaLogin from './action/captcha.vue'
  import { ElMessageBox } from 'element-plus'
  import { useStorage } from '@vueuse/core'
  import { ListOAuther, OAutherHandle } from '@/api/manager/authorize/api'
  import { OAuther, OAutherHandleReply } from '@/api/manager/authorize/type'
  import { useUserStore } from '@/store/modules/user'
  import { useAppStore } from '@/store/modules/app'
  import { ListAppTenant } from '@/api/manager/tenant/api'
  import Background from '@/views/authorize/background/index.vue'

  const appStore = useAppStore()
  const userStore = useUserStore()

  const router = useRouter()
  const { tenant, app } = router.currentRoute.value.query

  const tenantConfig = useStorage('login-tenant', {
    tenant: 'admin',
    app: 'manager'
  })

  // 如果存在租户和应用参数，则保存
  if (tenant && app) {
    tenantConfig.value.tenant = tenant as string
    tenantConfig.value.app = app as string
  }

  defineOptions({ name: 'Login' })

  const loginData = ref<any>({})
  let accountConfig: any = undefined

  const getTenants = async () => {
    const data = await ListAppTenant({ app: appStore.keyword })
    loginData.value.tenants = data.list
    loginData.value.selectTenant = appStore.app.setting?.tenant.mode == 'select'
  }
  getTenants()

  const handleChangeLoginType = () => {
    const key = 'login-config-' + tenantConfig.value.tenant
    accountConfig = useStorage(key, {
      rememberPassword: true,
      username: ''
    })
    Object.assign(loginData.value, { ...accountConfig.value, ...tenantConfig.value })
  }
  handleChangeLoginType()

  const oauthers = ref<OAuther[]>([])
  const handleGetOAuther = async () => {
    const data = await ListOAuther({ ...tenantConfig.value })
    oauthers.value = data.list
  }

  const handleBind = (uuid: string) => {
    ElMessageBox.confirm('当前邮箱未绑定账号，立即跳转绑定', '温馨提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      router.push({
        name: 'BindAccount',
        query: { uuid }
      })
    })
  }

  const handleFillInfo = (uuid: string) => {
    router.push({
      name: 'FillInfo',
      query: { uuid }
    })
  }

  const handleLogin = async (token: string, value: any) => {
    // 获取需要保存的字段
    const saveKeys = value.saveKeys
    const saveObject: any = {}
    saveKeys.forEach((key: string) => {
      saveObject[key] = value[key]
    })

    // 删除saveKeys字段
    delete value.saveKeys
    Object.assign(accountConfig.value, saveObject)

    // 登陆
    await userStore.login(token)
    router.push('/')
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

  const handleChangeTenant = (tenant: string) => {
    tenantConfig.value.tenant = tenant
  }

  // 三方授权相关
  const currentOAuther = ref<OAuther>({} as OAuther)
  // const currentOAutherLogin = ref<OAutherLoginRequest>()
  const captchaTypes = ['email']
  const oauthWay = ref<OAutherHandleReply>({ action: 'password' } as OAutherHandleReply)

  const handleCallbackPassword = () => {
    oauthWay.value = { action: 'password' } as OAutherHandleReply
  }
  const handleGetOAuthWay = async (oa: OAuther) => {
    const { type, keyword } = oa
    currentOAuther.value = oa

    // 特殊处理验证码登陆，点击获取验证码之后在处理
    if (captchaTypes.includes(type)) {
      oauthWay.value = { action: 'captcha', keyword } as OAutherHandleReply
      return
    }

    // 处理登陆
    const data = await OAutherHandle({ keyword, tenant: tenantConfig.value.tenant, app: appStore.keyword })

    // 跳转的情况下直接跳转
    if (data.action === 'jump') {
      window.location.href = data.value
    }

    oauthWay.value = data
    // currentOAutherLogin.value = {
    //   keyword: data.keyword,
    //   uuid: data.uuid,
    //   code: ''
    // }
  }

  onMounted(() => {
    if (tenantConfig.value.tenant) handleGetOAuther()

    getDate()
  })
</script>

<style lang="scss" scoped>
  @use './index';
</style>
