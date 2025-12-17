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
          <template v-if="oauthWay.action !== 'password'">
            <div class="password-back">
              <ElTag @click="handleCallbackPassword">
                <div class="password-back-text">
                  <ArtIcon value="iconsys-zuo2"></ArtIcon>
                  密码登陆
                </div>
              </ElTag>
            </div>
          </template>

          <!-- 密码登陆 -->
          <template v-if="oauthWay.action === 'password'">
            <div class="form">
              <PasswordLogin
                :data="loginData"
                @success="handleLogin"
                @info="handleFillInfo"
                @change-tenant="handleChangeTenant"
              />
            </div>
          </template>

          <!-- 验证码登陆 -->
          <template v-if="oauthWay.action === 'captcha'">
            <div class="form">
              <CaptchaLogin
                type="email"
                :data="loginData"
                :oauther="currentOAuther"
                @bind="handleBind"
                @info="handleFillInfo"
                @success="handleLogin"
              />
            </div>
          </template>

          <template v-if="oauthWay.action === 'scan'">
            <div class="form">
              <QRCodeLogin
                :data="oauthWay"
                @bind="handleBind"
                @info="handleFillInfo"
                @success="handleLogin"
              ></QRCodeLogin>
            </div>
          </template>

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
  import Background from '@/views/authorize/background/index.vue'
  import PasswordLogin from './action/password.vue'
  import CaptchaLogin from './action/captcha.vue'
  import QRCodeLogin from './action/qrcode.vue'

  import { ElMessageBox } from 'element-plus'
  import { useStorage } from '@vueuse/core'
  import { ListOAuther, OAutherHandle, OAutherLogin, OAutherReport } from '@/api/manager/authorize/api'
  import { OAuther, OAutherHandleReply } from '@/api/manager/authorize/type'
  import { useUserStore } from '@/store/modules/user'
  import { useAppStore } from '@/store/modules/app'
  import { ListAppTenant } from '@/api/manager/tenant/api'
  import { getURLParameters } from '@/utils'

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
    loginData.value.selectTenant = appStore.app.selectTenant
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
    ElMessageBox.confirm('当前渠道未绑定账号，立即跳转绑定', '温馨提示', {
      showCancelButton: false,
      confirmButtonText: '确认',
      type: 'warning'
    }).then(async () => {
      router.push({
        name: 'BindAccount',
        query: { uuid }
      })
    })
  }

  const handleFillInfo = (uuid: string) => {
    ElMessageBox.confirm('当前账号存在信息未补全，为了更好体验请立即前往补充信息', '温馨提示', {
      showCancelButton: false,
      confirmButtonText: '确认',
      type: 'warning'
    }).then(async () => {
      router.push({
        name: 'FillInfo',
        query: { uuid }
      })
    })
  }

  const handleLogin = async (token: string, value: any) => {
    // 获取需要保存的字段
    const saveObject: any = {}

    if (value && value.saveKeys) {
      const saveKeys = value.saveKeys
      saveKeys.forEach((key: string) => {
        saveObject[key] = value[key]
      })
      // 删除saveKeys字段
      delete value.saveKeys
    }

    // 赋值
    Object.assign(accountConfig.value, saveObject)

    // 登陆
    await userStore.login(token)

    // 跳转到主页
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

  const captchaTypes = ['email']
  const oauthWay = ref<OAutherHandleReply>({ action: 'password' } as OAutherHandleReply)

  // 切换到密码登陆
  const handleCallbackPassword = () => {
    oauthWay.value = { action: 'password' } as OAutherHandleReply
  }

  // 处理三方授权
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
  }

  const handleInit = async (params: Record<string, any>) => {
    const getCode = async (keyword: string, query: Record<string, any>) => {
      return query[keyword] || ''
    }

    // 后续适配新的url在这里添加
    const getCustomValue = (query: Record<string, any>) => {
      return (query.state as string) || ''
    }

    // 获取自定义字段数据
    const state = getCustomValue(params)
    const [keyword, action, uuid, codeField] = state.split('.')
    // 数据格式错误则直接返回
    if (!keyword || !action || !uuid) return

    // 获取当前keyword对应的数据code
    const code = await getCode(codeField, params)
    if (!code.length) return

    // 如果之前是跳转，则直接进行登陆
    if (action === 'jump') {
      // 三方直接登陆
      const data = await OAutherLogin({ uuid, code })
      if (data.needBind) {
        handleBind(uuid)
        return
      }
      if (data.needInfo) {
        handleFillInfo(uuid)
        return
      }

      userStore.setToken(data.token as string)
      return
    }

    // 如果之前是扫码，则上报扫码信息
    if (action === 'scan') {
      OAutherReport({ uuid, code }).then(() => {
        router.push({
          name: 'Result',
          query: {
            type: 'success',
            title: '扫码成功',
            message: '请确认扫码结果'
          }
        })
      })
    }
  }

  const getParams = () => {
    const params = getURLParameters(window.location.href)
    const keys = Object.keys(params)
    keys.forEach((key) => {
      params[key] = decodeURIComponent(params[key])
      // 移除#后的数据
      params[key] = params[key].split('#')[0]
    })
    return params
  }

  // 定期刷新二维码，防止登陆失效
  const timer = ref()
  const initer = ref(true)
  watch(
    () => oauthWay.value,
    () => {
      if (oauthWay.value.action === 'scan') {
        if (initer.value) return
        initer.value = false
        timer.value = setInterval(async () => {
          const data = await OAutherHandle({
            keyword: oauthWay.value.keyword,
            tenant: tenantConfig.value.tenant,
            app: appStore.keyword
          })
          oauthWay.value = data
        }, 1000 * 180)
      } else {
        clearInterval(timer.value)
      }
    }
  )

  onMounted(() => {
    if (tenantConfig.value.tenant) handleGetOAuther()

    getDate()

    // 初始化回调
    handleInit(getParams())
  })
</script>

<style lang="scss" scoped>
  @use './index';
</style>
