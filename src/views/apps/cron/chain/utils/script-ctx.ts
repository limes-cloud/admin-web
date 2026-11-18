// 脚本节点 ctx 函数：说明弹窗与 Monaco 补全共用这一份定义，与后端 chain/component_script.go 的 injectCtx 保持一致

import * as monaco from 'monaco-editor'
import type { ScriptCtxFn } from '../types/script'

export const SCRIPT_CTX_FNS: ScriptCtxFn[] = [
  {
    path: 'request',
    params: '(opts: ChainRequestOptions)',
    returns: 'ChainResponse',
    desc: '同步发起 HTTP 请求，返回 { status, header, body }',
    notes: [
      'method 默认 GET；timeout 单位秒，不填用节点超时',
      'body 为字符串按 text/plain 发送，为对象按 JSON 发送',
      '响应体是 JSON 时 body 自动解析为对象',
      '请求失败抛异常（按节点重试 / 忽略错误配置处理）'
    ],
    example: `const res = ctx.request({
  method: 'POST',
  url: 'https://api.example.com/order',
  header: { Authorization: 'Bearer xxx' },
  body: { id: input.id },
  timeout: 10
})
if (res.status !== 200) throw new Error('下单失败')
return res.body`
  },
  {
    path: 'data.load',
    params: '(path: string)',
    returns: 'any',
    desc: '按点分路径读取运行上下文，不存在返回 null',
    notes: ['根节点：request（开始节点入参）、run、trigger、各节点输出名；数组可用下标，如 list.0.id'],
    example: `const name = ctx.data.load('request.body.name')
const first = ctx.data.load('order.items.0')`
  },
  {
    path: 'redis.get',
    params: '(key: string)',
    returns: 'any',
    desc: '读取跨任务缓存，key 不存在返回 null',
    notes: [
      'key 自动加应用前缀 cron:chain:kv:{app}:，同一应用下的任务可共享，不能跨应用访问',
      '写入时是 JSON，读取时自动解析；非 JSON 内容按字符串返回'
    ],
    example: `const job = ctx.redis.get('job:' + input.jobId)
if (!job) throw new Error('任务状态不存在')`
  },
  {
    path: 'redis.set',
    params: '(key: string, value: any, ttl?: number)',
    returns: 'void',
    desc: '写入跨任务缓存，value 按 JSON 序列化',
    notes: [
      'ttl 单位秒；省略或传 0 时默认 7 天，不能为负数，最大 7 天',
      'value 序列化后不能超过 64KB；单次脚本最多调用 Redis 1000 次'
    ],
    example: `ctx.redis.set('job:' + input.jobId, {
  stage: 'parsed',
  resourceId: input.resourceId
}, 86400)`
  },
  {
    path: 'redis.setnx',
    params: '(key: string, value: any, ttl?: number)',
    returns: 'boolean',
    desc: 'key 不存在时写入，适合做幂等标记',
    notes: ['ttl 规则同 redis.set；key 已存在返回 false，不覆盖原值'],
    example: `const lockKey = 'order:' + input.orderId + ':lock'
if (!ctx.redis.setnx(lockKey, ctx.rid(), 600)) {
  return { skipped: true }
}`
  },
  {
    path: 'redis.del',
    params: '(key: string)',
    returns: 'number',
    desc: '删除跨任务缓存 key，返回删除数量',
    example: `ctx.redis.del('job:' + input.jobId)`
  },
  {
    path: 'redis.exists',
    params: '(key: string)',
    returns: 'boolean',
    desc: '判断跨任务缓存 key 是否存在',
    example: `if (ctx.redis.exists('job:' + input.jobId)) {
  ctx.log.info('任务已存在')
}`
  },
  {
    path: 'redis.incr',
    params: '(key: string, delta?: number, ttl?: number)',
    returns: 'number',
    desc: '原子自增，适合跨任务重试计数和限流',
    notes: [
      'delta 默认为 1；ttl 单位秒，省略或传 0 时默认 7 天，最大 7 天',
      'key 没有过期时间时补 ttl，已有过期时间保持不变'
    ],
    example: `const n = ctx.redis.incr('retry:' + input.jobId, 1, 86400)
if (n > 5) throw new Error('重试次数超过上限')`
  },
  {
    path: 'redis.expire',
    params: '(key: string, ttl: number)',
    returns: 'boolean',
    desc: '设置跨任务缓存 key 的过期时间，key 不存在返回 false',
    notes: ['ttl 单位秒；传 0 使用默认 7 天，不能为负数，最大 7 天'],
    example: `ctx.redis.expire('job:' + input.jobId, 3600)`
  },
  {
    path: 'redis.ttl',
    params: '(key: string)',
    returns: 'number',
    desc: '读取剩余过期时间（秒）',
    notes: ['返回 -1 表示没有过期时间（正常写入不会出现），-2 表示 key 不存在'],
    example: `const left = ctx.redis.ttl('job:' + input.jobId)`
  },
  {
    path: 'log.info',
    params: '(...args: any[])',
    returns: 'void',
    desc: '写节点日志（info），可传多个参数，对象转 JSON',
    example: `ctx.log.info('收到入参', input)`
  },
  {
    path: 'log.warn',
    params: '(...args: any[])',
    returns: 'void',
    desc: '写节点日志（warn）',
    example: `ctx.log.warn('库存偏低', stock)`
  },
  {
    path: 'log.error',
    params: '(...args: any[])',
    returns: 'void',
    desc: '写节点日志（error）',
    example: `ctx.log.error('调用失败', err.message)`
  },
  {
    path: 'response',
    params: '(value: any)',
    returns: 'void',
    desc: '提前把 value 作为本次运行的输出返回给同步调用方，脚本与后续节点继续执行',
    notes: ['只有第一次调用生效'],
    example: `ctx.response({ accepted: true })
// 之后的耗时处理不阻塞调用方`
  },
  {
    path: 'break',
    params: '(reason: string)',
    returns: 'never',
    desc: '立即结束脚本并中断整次运行（终态，不重试、不恢复，忽略错误也不生效）',
    notes: ['与 return 的区别：return 是节点成功、流程继续；break 是整条链立刻结束'],
    example: `if (input.stock <= 0) ctx.break('库存不足')`
  },
  {
    path: 'sleep',
    params: '(ms: number)',
    returns: 'void',
    desc: '暂停脚本 ms 毫秒，单次最多 10000（10 秒），超出抛异常',
    notes: [
      '计入节点单次超时；节点超时、运行作废或停机时立即结束',
      '等待期间占用执行名额，只用于请求间的短暂间隔；长时间等待请用被动触发节点或重试间隔'
    ],
    example: `for (const id of input.ids) {
  ctx.request({ method: 'POST', url: 'https://api.example.com/sync', body: { id } })
  ctx.sleep(200) // 控制调用频率
}`
  },
  {
    path: 'node',
    params: '()',
    returns: '{ id: string; name: string; type: string; retry: number }',
    desc: '当前节点信息：id、名称、类型、本轮已重试次数 retry',
    notes: ['可用于拼幂等键，或在重试时调整行为'],
    example: `const n = ctx.node()
const idemKey = ctx.rid() + ':' + n.id`
  },
  {
    path: 'rid',
    params: '()',
    returns: 'string',
    desc: '当前运行 ID',
    example: `ctx.log.info('运行', ctx.rid())`
  },
  {
    path: 'uuid',
    params: '()',
    returns: 'string',
    desc: '生成一个新的 UUID',
    example: `const requestId = ctx.uuid()`
  },
  {
    path: 'md5',
    params: '(s: string)',
    returns: 'string',
    desc: 'MD5，返回十六进制小写字符串',
    example: `const sign = ctx.md5(input.id + secret)`
  },
  {
    path: 'sha256',
    params: '(s: string)',
    returns: 'string',
    desc: 'SHA-256，返回十六进制小写字符串',
    example: `const digest = ctx.sha256(JSON.stringify(input))`
  },
  {
    path: 'hmac',
    params: "(algo: 'md5' | 'sha1' | 'sha256' | 'sha512', key: string, s: string, encoding?: 'hex' | 'base64')",
    returns: 'string',
    desc: 'HMAC 签名，输出 hex（默认）或 base64',
    notes: ['算法或编码不支持时抛异常'],
    example: `const ts = String(ctx.time.now())
const sign = ctx.hmac('sha256', secret, appKey + ts, 'base64')`
  },
  {
    path: 'time.now',
    params: '()',
    returns: 'number',
    desc: '当前时间，Unix 秒',
    example: `const ts = ctx.time.now()`
  },
  {
    path: 'time.format',
    params: '(ts: number, layout?: string)',
    returns: 'string',
    desc: 'Unix 秒按北京时间格式化，默认 YYYY-MM-DD HH:mm:ss',
    notes: ['占位符：YYYY YY MM DD HH mm ss SSS，其余字符原样输出'],
    example: `ctx.time.format(ctx.time.now())               // 2026-10-31 22:30:00
ctx.time.format(ctx.time.now(), 'YYYYMMDD')   // 20261031`
  },
  {
    path: 'time.parse',
    params: '(s: string, layout?: string)',
    returns: 'number',
    desc: '按北京时间把时间字符串解析为 Unix 秒，格式同 format',
    notes: ['格式不匹配时抛异常'],
    example: `const ts = ctx.time.parse('2026-10-31 08:00:00')`
  },
  {
    path: 'url.encode',
    params: '(s: string)',
    returns: 'string',
    desc: 'URL 查询参数编码（空格编码为 +）',
    example: `const q = 'keyword=' + ctx.url.encode(input.keyword)`
  },
  {
    path: 'url.decode',
    params: '(s: string)',
    returns: 'string',
    desc: 'URL 查询参数解码，格式错误抛异常',
    example: `const raw = ctx.url.decode('a+b%26c') // a b&c`
  },
  {
    path: 'url.query',
    params: '(obj: Record<string, any>)',
    returns: 'string',
    desc: '对象拼成查询串：key 按字母排序，数组展开为重复 key，null 跳过',
    notes: ['key 排序后可直接用于签名原文'],
    example: `const qs = ctx.url.query({ page: 1, tags: ['a', 'b'] }) // page=1&tags=a&tags=b
ctx.request({ url: 'https://api.example.com/list?' + qs })`
  },
  {
    path: 'base64.encode',
    params: '(s: string)',
    returns: 'string',
    desc: '标准 Base64 编码',
    example: `const token = ctx.base64.encode('user:pass')`
  },
  {
    path: 'base64.decode',
    params: '(s: string)',
    returns: 'string',
    desc: '标准 Base64 解码，格式错误抛异常',
    example: `const raw = ctx.base64.decode(input.payload)`
  },
  {
    root: 'console',
    path: 'log',
    params: '(...args: any[])',
    returns: 'void',
    desc: '同 ctx.log.info，写节点日志',
    example: `console.log('结果', res.body)`
  },
  {
    root: 'console',
    path: 'info',
    params: '(...args: any[])',
    returns: 'void',
    desc: '同 ctx.log.info',
    example: `console.info('开始处理')`
  },
  {
    root: 'console',
    path: 'warn',
    params: '(...args: any[])',
    returns: 'void',
    desc: '同 ctx.log.warn',
    example: `console.warn('重试中')`
  },
  {
    root: 'console',
    path: 'error',
    params: '(...args: any[])',
    returns: 'void',
    desc: '同 ctx.log.error',
    example: `console.error('失败', err.message)`
  }
]

/** 函数所属全局对象 */
function rootOf(f: ScriptCtxFn): string {
  return f.root || 'ctx'
}

/** 函数签名，如 ctx.md5(s: string): string */
export function ctxSignature(f: ScriptCtxFn): string {
  return `${rootOf(f)}.${f.path}${f.params}: ${f.returns}`
}

/** 补全条目的说明（Markdown）：签名 + 说明 + 注意事项 + 示例 */
function docOf(f: ScriptCtxFn): monaco.IMarkdownString {
  const notes = f.notes?.length ? '\n\n' + f.notes.map((n) => `- ${n}`).join('\n') : ''
  return { value: `${f.desc}${notes}\n\n\`\`\`js\n${f.example}\n\`\`\`` }
}

/** 光标前的访问路径：ctx. → {ctx, ''}，ctx.base64. → {ctx, 'base64'}，console. → {console, ''}；不匹配返回 null */
function ctxPrefix(model: monaco.editor.ITextModel, position: monaco.Position): { root: string; group: string } | null {
  const line = model.getValueInRange({
    startLineNumber: position.lineNumber,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column
  })
  const m = /(?:^|[^\w$.])(ctx|console)\.(?:(\w+)\.)?\w*$/.exec(line)
  if (!m) return null
  return { root: m[1], group: m[2] || '' }
}

/** ctx. / console. 补全：列出一级函数与分组（base64 / log / time …），分组后再列成员 */
function provideCompletion(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): monaco.languages.CompletionList {
  const at = ctxPrefix(model, position)
  if (at === null) return { suggestions: [] }
  const prefix = at.group
  const fns = SCRIPT_CTX_FNS.filter((f) => rootOf(f) === at.root)
  const word = model.getWordUntilPosition(position)
  const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)
  const { CompletionItemKind, CompletionItemInsertTextRule } = monaco.languages
  const suggestions: monaco.languages.CompletionItem[] = []
  const groups = new Set<string>()
  for (const f of fns) {
    const [head, name] = f.path.split('.')
    if (prefix) {
      if (head !== prefix || !name) continue
    } else if (name) {
      if (groups.has(head)) continue
      groups.add(head)
      const members = fns.filter((x) => x.path.startsWith(head + '.'))
      suggestions.push({
        label: head,
        kind: CompletionItemKind.Module,
        detail: members.map((x) => x.path.split('.')[1]).join(' / '),
        documentation: { value: members.map((x) => `- \`${ctxSignature(x)}\` ${x.desc}`).join('\n') },
        insertText: head + '.',
        command: { id: 'editor.action.triggerSuggest', title: '' },
        range
      })
      continue
    }
    const fn = name || head
    const noArgs = f.params === '()'
    suggestions.push({
      label: { label: fn, detail: f.params, description: f.returns },
      kind: CompletionItemKind.Function,
      detail: ctxSignature(f),
      documentation: docOf(f),
      insertText: noArgs ? `${fn}()` : `${fn}($0)`,
      insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
      command: noArgs ? undefined : { id: 'editor.action.triggerParameterHints', title: '' },
      range
    })
  }
  return { suggestions }
}

/** 悬停在 ctx.xxx / console.xxx 上显示签名与说明 */
function provideHover(model: monaco.editor.ITextModel, position: monaco.Position): monaco.languages.Hover | null {
  const word = model.getWordAtPosition(position)
  if (!word) return null
  const line = model.getLineContent(position.lineNumber)
  const m = /(?:^|[^\w$.])(ctx|console)\.((?:\w+\.)?\w+)$/.exec(line.slice(0, word.endColumn - 1))
  if (!m) return null
  const f = SCRIPT_CTX_FNS.find((x) => rootOf(x) === m[1] && x.path === m[2])
  if (!f) return null
  return {
    range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
    contents: [{ value: '```ts\n' + ctxSignature(f) + '\n```' }, docOf(f)]
  }
}

let registered = false

/**
 * 注册脚本编辑支持（只注册一次）：输入 ctx. / console. 补全函数、悬停显示说明。
 * handler(ctx, input) 的 ctx 是普通参数，类型推断不到，所以按文本匹配 ctx. 自己提供补全，不依赖注释声明类型；
 * 库只保留 ES 标准，去掉脚本沙箱里不存在的 DOM（window、fetch 等）
 */
export function registerScriptLib() {
  if (registered) return
  registered = true
  const js = monaco.languages.typescript.javascriptDefaults
  js.setCompilerOptions({
    ...js.getCompilerOptions(),
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    lib: ['es2020'],
    allowNonTsExtensions: true,
    allowJs: true
  })
  monaco.languages.registerCompletionItemProvider('javascript', {
    triggerCharacters: ['.'],
    provideCompletionItems: provideCompletion
  })
  monaco.languages.registerHoverProvider('javascript', { provideHover })
}
