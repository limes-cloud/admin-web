export interface GetSystemSettingReply {
  name: string
  title: string
  description: string
  copyright: string
  logo: string
  tab: boolean //是否开启标签
  watermark: string // 水印
  i18n: boolean // 是否开启多语言
}
