/** 脚本 ctx 上的一个函数（说明弹窗与编辑器补全共用） */
export interface ScriptCtxFn {
  /** 所属全局对象：ctx（默认）或 console */
  root?: 'ctx' | 'console'
  /** 对象下的路径，如 request、base64.encode */
  path: string
  /** TypeScript 参数列表，如 (s: string) */
  params: string
  /** 返回值类型 */
  returns: string
  /** 一句话说明 */
  desc: string
  /** 补充说明（弹窗展示） */
  notes?: string[]
  /** 示例代码 */
  example: string
}
