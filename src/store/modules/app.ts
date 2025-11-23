import { GetSampleApp } from '@/api/manager/app/api'
import { App } from '@/api/manager/app/type'
import { GetSystemSetting } from '@/api/manager/system/api'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('appStore', () => {
  const keyword = ref('manager')

  const app = ref<Partial<App>>({})

  const initApp = async () => {
    // 获取应用信息
    const data = await GetSampleApp({ keyword: keyword.value })
    app.value = data

    // 如果直接登陆管理后台，则使用默认的名称，否则获取
    const setting = await GetSystemSetting()
    if (keyword.value === 'manager') {
      Object.assign(app.value, {
        name: setting.title,
        logo: setting.logo,
        keyword: 'manager',
        description: setting.description,
        copyright: setting.copyright
      })
    }

    // 初始化系统设置
  }

  return {
    keyword,
    app,
    initApp
  }
})
