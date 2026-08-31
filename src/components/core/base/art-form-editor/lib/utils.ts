/**
 * 公共工具函数
 */
import { Guid } from 'guid-typescript'

/** 生成短 UUID（8 字符） */
export const uuid = (): string => {
  const ustr = Guid.create().toString().replace(/-/g, '')
  return ustr.substring(0, 8)
}
