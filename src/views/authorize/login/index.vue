<template>
  <div class="login">
    <Background></Background>

    <div class="login-plan">
      <div class="login-header">
        <div class="login-title">欢迎回来，用户登陆</div>
        <div class="login-subtitle">{{ appStore.app.description }}</div>
      </div>
      <div class="login-box">
        <div class="left-bg">
          <ThemeSvg :src="loginIcon" size="100%" />
        </div>
        <div class="login-wrap">
          <el-tabs v-model="loginType" class="login-tabs" @tab-change="handleChangeLoginType">
            <el-tab-pane label="密码登陆" name="username">
              <template #label>
                <div class="tab-item">
                  <ElImage style="width: 18px; height: 18px" :src="PasswordImage" />
                  <span style="margin-left: 5px">密码登陆</span>
                </div>
              </template>
              <div class="form" v-if="loginType === 'username'">
                <PasswordLogin :data="loginData" @success="handleLogin" />
              </div>
            </el-tab-pane>
            <el-tab-pane v-if="emailOAuther" label="邮箱登陆" name="email">
              <template #label>
                <div class="tab-item">
                  <ElImage style="width: 18px; height: 18px" :src="$rurl(emailOAuther.logo)" />
                  <span style="margin-left: 5px">邮箱登陆</span>
                </div>
              </template>
              <div class="form" v-if="loginType === 'email'">
                <CaptchaLogin type="email" :data="loginData" :oauther="emailOAuther" />
              </div>
            </el-tab-pane>
            <el-tab-pane v-if="phoneOAuther" label="手机登陆" name="phone">
              <template #label>
                <div class="tab-item">
                  <ElImage style="width: 18px; height: 18px" :src="$rurl(phoneOAuther.logo)" />
                  <span style="margin-left: 5px">手机登陆</span>
                </div>
              </template>
              <div class="form">
                <CaptchaLogin type="phone" :data="loginData" :oauther="phoneOAuther" />
              </div>
            </el-tab-pane>
          </el-tabs>
          <div class="footer" v-if="!appStore.app.private">
            <p>
              还没有账号？
              <RouterLink :to="{ name: 'Register' }">立即注册</RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import PasswordImage from '@/assets/img/icon/password.png'
  import loginIcon from '@imgs/svg/login_icon.svg'
  import PasswordLogin from './action/password.vue'
  import CaptchaLogin from './action/captcha.vue'
  import { useStorage } from '@vueuse/core'
  import { ListOAuther } from '@/api/manager/authorize/api'
  import { OAuther } from '@/api/manager/authorize/type'
  import { useUserStore } from '@/store/modules/user'
  import Background from '@/views/authorize/background/index.vue'
  import { useAppStore } from '@/store/modules/app'
  import { ListAppTenant } from '@/api/manager/tenant/api'

  const appStore = useAppStore()

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

  console.log('tenantConfig', tenantConfig.value, tenant, app)

  //  从缓存中读取，没有则跳转到错误页面
  // if (!tenantConfig.value.tenant || !tenantConfig.value.app) {
  //   router.replace({ name: 'Exception500' })
  // }

  defineOptions({ name: 'Login' })

  const loginType = ref('username')
  const loginData = ref<any>({})

  let accountConfig: any = undefined

  const getTenants = async () => {
    const data = await ListAppTenant({ app: appStore.keyword })
    loginData.value.tenants = data.list
    loginData.value.selectTenant = appStore.app.setting?.tenant.mode == 'select'
  }
  getTenants()

  const handleChangeLoginType = () => {
    const key = 'login-config-' + tenantConfig.value.tenant + '-' + loginType.value
    accountConfig = useStorage(key, {
      rememberPassword: true,
      username: ''
    })
    Object.assign(loginData.value, { ...accountConfig.value, ...tenantConfig.value })
  }
  handleChangeLoginType()

  const channels = ref<OAuther[]>([])
  const emailOAuther = ref<OAuther>()
  const phoneOAuther = ref<OAuther>()

  ListOAuther({ ...tenantConfig.value }).then((res: any) => {
    const list: OAuther[] = []
    res.list.forEach((item: OAuther) => {
      if (item.type === 'email') {
        emailOAuther.value = item
        return
      }
      if (item.type === 'phone') {
        phoneOAuther.value = item
        return
      }
      list.push(item)
    })
    channels.value = list
  })

  const handleLogin = async (token: string, value: any) => {
    console.log(token)

    // 获取需要保存的字段
    const saveKeys = value.saveKeys
    const saveObject: any = {}
    saveKeys.forEach((key: string) => {
      saveObject[key] = value[key]
    })

    // 删除saveKeys字段
    delete value.saveKeys
    Object.assign(accountConfig.value, saveObject)

    const userStore = useUserStore()

    await userStore.login(token)
    // userStore.setToken(token, token)
    // const userInfo = await fetchGetUserInfo()
    // userStore.setUserInfo(userInfo)
    // userStore.setLoginStatus(true)
    router.push('/')
  }
</script>

<style lang="scss" scoped>
  @use './index';
</style>
