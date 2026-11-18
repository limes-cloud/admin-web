import { GetSampleApp, InitApp } from '@/api/manager/app/api'
import { App } from '@/api/manager/app/type'
import { setWebIcon } from '@/router/utils/utils'
import { getAppKeyword, getCurrentDomain, getExplicitAppKeyword, setAppKeyword } from '@/utils/app-context'
import { rurl } from '@/utils/resource/url'
import { defineStore } from 'pinia'
import { useSettingStore } from './setting'

export const useAppStore = defineStore('appStore', () => {
  const keyword = ref(getAppKeyword())

  const app = ref<Partial<App>>({})

  // applyApp 写入当前应用并同步请求头使用的应用标识。
  const applyApp = (data: App) => {
    keyword.value = data.keyword || keyword.value
    setAppKeyword(keyword.value)
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

  // loadAppByKeyword 按显式应用标识加载应用信息。
  const loadAppByKeyword = async (value: string) => {
    const data = await GetSampleApp({ keyword: value })
    applyApp(data)
  }

  const initApp = async () => {
    const explicitKeyword = getExplicitAppKeyword()
    if (explicitKeyword) {
      await loadAppByKeyword(explicitKeyword)
      return
    }

    try {
      const data = await InitApp({ domain: getCurrentDomain() })
      applyApp(data)
    } catch {
      await loadAppByKeyword(keyword.value)
    }
  }

  // setKeyword 切换当前应用并重新加载应用信息
  const setKeyword = async (value?: string): Promise<void> => {
    const next = String(value || '').trim()
    if (!next || next === keyword.value) return
    keyword.value = next
    await loadAppByKeyword(next)
  }

  return {
    keyword,
    app,
    initApp,
    setKeyword
  }
})
