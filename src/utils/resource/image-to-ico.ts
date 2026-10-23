/**
 * 普通图片转 ICO（favicon 用）：
 * 浏览器无法直接编码 .ico，但 ICO 容器内嵌 PNG 是合法格式（Vista+ 全支持），
 * 所以用 Canvas 绘制目标尺寸 PNG 后按 ICO 容器（ICONDIR + ICONDIRENTRY + PNG 数据）打包。
 */

/**
 * 将图片文件转为 ICO Blob（默认 128x128）
 * @param file 源图片（png/jpg 等浏览器可解码的格式）
 * @param size 目标边长（1~256；256 在 ICO 头中用 0 表示）
 */
export async function imageToIco(file: Blob, size = 128): Promise<Blob> {
  const bitmap = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('canvas 2d context unavailable')
  }
  ctx.imageSmoothingQuality = 'high'
  // 8px 圆角裁剪（应用图标统一圆角，圆角外为透明）
  const radius = Math.min(8, size / 2)
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.arcTo(size, 0, size, size, radius)
  ctx.arcTo(size, size, 0, size, radius)
  ctx.arcTo(0, size, 0, 0, radius)
  ctx.arcTo(0, 0, size, 0, radius)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(bitmap, 0, 0, size, size)

  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('png convert failed'))), 'image/png')
  })
  const png = new Uint8Array(await pngBlob.arrayBuffer())

  // ICONDIR(6) + ICONDIRENTRY(16) + PNG 数据
  const buf = new ArrayBuffer(22 + png.length)
  const dv = new DataView(buf)
  const bytes = new Uint8Array(buf)

  dv.setUint16(0, 0, true) // reserved，恒 0
  dv.setUint16(2, 1, true) // type：1 = icon
  dv.setUint16(4, 1, true) // count：单图
  dv.setUint8(6, size === 256 ? 0 : size) // width（256 用 0 表示）
  dv.setUint8(7, size === 256 ? 0 : size) // height
  dv.setUint8(8, 0) // colorCount，0 = 不指定
  dv.setUint8(9, 0) // reserved
  dv.setUint16(10, 1, true) // planes
  dv.setUint16(12, 32, true) // bpp
  dv.setUint32(14, png.length, true) // 图像数据大小
  dv.setUint32(18, 22, true) // 图像数据偏移
  bytes.set(png, 22)

  return new Blob([bytes], { type: 'image/x-icon' })
}
