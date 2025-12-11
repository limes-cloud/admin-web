import { GetSampleApp } from '@/api/manager/app/api'
import { App } from '@/api/manager/app/type'
import { setWebIcon } from '@/router/utils/utils'
import { rurl } from '@/utils/resource/url'
import { defineStore } from 'pinia'
import { useSettingStore } from './setting'

export const useAppStore = defineStore('appStore', () => {
  const keyword = ref('manager')

  const app = ref<Partial<App>>({})

  const initApp = async () => {
    // 获取应用信息
    const data = await GetSampleApp({ keyword: keyword.value })

    Object.assign(app.value, {
      id: data.id,
      name: data.showName,
      logo: data.logo,
      keyword: data.keyword,
      description: data.description,
      copyright: data.setting?.web?.copyright,
      watermark: data.setting?.web?.watermark
    })

    // 设置水印
    useSettingStore().setWatermarkVisible(!!app.value.watermark)

    // 设置网站图标
    setWebIcon(rurl(data.favicon))
  }

  return {
    keyword,
    app,
    initApp
  }
})
