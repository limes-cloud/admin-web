import { GetSampleApp } from '@/api/manager/app/api'
import { App } from '@/api/manager/app/type'
import { setWebIcon } from '@/router/utils/utils'
import { getAppKeyword, setAppKeyword } from '@/utils/app-context'
import { rurl } from '@/utils/resource/url'
import { defineStore } from 'pinia'
import { useSettingStore } from './setting'

export const useAppStore = defineStore('appStore', () => {
  const keyword = ref(getAppKeyword())

  const app = ref<Partial<App>>({})

  const initApp = async () => {
    // 应用标识与请求头 X-App-Key 保持一致
    setAppKeyword(keyword.value)

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

  // setKeyword 切换当前应用并重新加载应用信息
  const setKeyword = async (value?: string): Promise<void> => {
    const next = String(value || '').trim()
    if (!next || next === keyword.value) return
    keyword.value = next
    await initApp()
  }

  return {
    keyword,
    app,
    initApp,
    setKeyword
  }
})
