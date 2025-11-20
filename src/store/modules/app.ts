import { GetSystemSetting } from '@/api/manager/system/api'
import { GetSystemSettingReply } from '@/api/manager/system/type'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('appStore', () => {
  const setting = ref<Partial<GetSystemSettingReply>>({})

  const initSystemSetting = async () => {
    const data = await GetSystemSetting()
    setting.value = data
  }
  return {
    setting,
    initSystemSetting
  }
})
