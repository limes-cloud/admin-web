import cryptoJs from 'crypto-js'

import { CompleteUpload, GetUploadChunkSize, GetUploadPartURLs, PrepareUploadFile } from '@/api/resource/file/api'
import { PrepareUploadFileResponse } from '@/api/resource/file/type'

// 上传进度回调：percent 0~100
export type UploadProgress = (percent: number) => void

export interface UploadOptions {
  // 目标目录完整路径（如 /images/avatar；空 = 根目录）
  path?: string
  // 文件展示名（默认取 file.name）
  name?: string
  onProgress?: UploadProgress
}

export interface UploadResult {
  // 可读访问 URL（秒传 / 完成上传后返回）
  url: string
  // 对象 key（md5.ext），业务持久化只用 key
  key: string
}

/**
 * 计算浏览器端分片摘要（设计文档 06-upload §4.2）：
 *   md5 = MD5( hex(md5(part₁)) ‖ hex(md5(part₂)) ‖ … ‖ hex(md5(partₙ)) )
 * 单片（N=1）同样用该规则（对文件 md5 再取一次 md5），保证与分片路径身份一致。
 * 注：必须先用 GetUploadChunkSize 拿到服务端权威 chunkSize 后再计算（§4.3）。
 */
async function computeDigestOfDigests(file: File, chunkSize: number): Promise<string> {
  const count = Math.ceil(file.size / chunkSize) || 1
  const parts: string[] = []
  for (let i = 0; i < count; i += 1) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const bytes = await file.slice(start, end).arrayBuffer()
    parts.push(cryptoJs.MD5(cryptoJs.lib.WordArray.create(new Uint8Array(bytes))).toString())
  }
  // 拼接的是 hex 文本，不是二进制摘要
  return cryptoJs.MD5(parts.join('')).toString()
}

/** 提取小写扩展名（协议约束 ^[a-z0-9]*$） */
export function extractExt(name: string): string {
  const idx = name.lastIndexOf('.')
  if (idx < 0) return ''
  return name
    .slice(idx + 1)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * 按新契约上传文件：
 *   GetUploadChunkSize → 计算分片摘要 → PrepareUploadFile（秒传/召回）
 *   → GetUploadPartURLs 预签名地址 → PUT 直传厂商（带 Content-MD5）→ CompleteUpload
 */
export async function uploadFile(file: File, options: UploadOptions): Promise<UploadResult> {
  const onProgress = options.onProgress || (() => {})
  const size = String(file.size)

  if (file.size <= 0) {
    throw new Error('不允许上传空文件')
  }

  // 1. 取服务端权威分片大小（客户端切片与摘要计算都必须以它为准）
  onProgress(1)
  const { chunk_size } = await GetUploadChunkSize({ total_size: size })
  if (chunk_size <= 0) {
    throw new Error('获取分片大小失败')
  }

  // 2. 按片计算分片摘要的摘要
  onProgress(3)
  const md5 = await computeDigestOfDigests(file, chunk_size)

  // 3. 预上传：秒传判定 / 召回在飞会话（app 由服务端从 X-App-Key 解析）
  onProgress(5)
  const prep: PrepareUploadFileResponse = await PrepareUploadFile({
    path: options.path,
    name: options.name || file.name,
    ext: extractExt(file.name),
    md5,
    size
  })

  // 秒传命中
  if (prep.skipped) {
    onProgress(100)
    return { url: prep.url, key: prep.key }
  }
  if (!prep.upload_id) {
    throw new Error('预上传未返回 upload_id')
  }

  // 4. 补齐缺失分片（断点续传：只传 upload_chunks 里没有的片号）
  const missing: number[] = []
  for (let i = 1; i <= prep.chunk_count; i += 1) {
    if (!prep.upload_chunks?.includes(i)) {
      missing.push(i)
    }
  }
  const chunkSize = prep.chunk_size
  if (missing.length > 0) {
    const { urls } = await GetUploadPartURLs({ upload_id: prep.upload_id, part_numbers: missing })
    if (urls.length !== missing.length) {
      throw new Error('获取分片上传地址失败')
    }
    let done = 0
    for (const { part_number, url } of urls) {
      const start = (part_number - 1) * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      // 每片 md5 复用为 Content-MD5，让厂商在收片时拒绝传输损坏的分片（§4.3）
      const bytes = await chunk.arrayBuffer()
      const hash = cryptoJs.MD5(cryptoJs.lib.WordArray.create(new Uint8Array(bytes)))
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-MD5': hash.toString(cryptoJs.enc.Base64) },
        body: chunk
      })
      if (!res.ok) {
        throw new Error(`分片 ${part_number} 上传失败（${res.status}）`)
      }
      done += 1
      onProgress(5 + Math.round((done / missing.length) * 85))
    }
  }

  // 5. 完成分片上传（服务端合并 + 摘要核验）
  onProgress(95)
  const completed = await CompleteUpload({ upload_id: prep.upload_id })
  onProgress(100)
  return { url: completed.url, key: completed.key }
}
