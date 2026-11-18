import { extractIconClasses } from '@/utils/constants/iconfont'

export interface GenerateIconPngOptions {
  /** 系统图标 class（iconsys-*）或 Iconify 图标名（mdi:*） */
  icon: string
  /** 图标底色 */
  backgroundColor: string
  /** 输出 PNG 边长 */
  size?: number
}

interface MdiIconData {
  body: string
  width?: number
  height?: number
  left?: number
  top?: number
}

interface PixelBounds {
  x: number
  y: number
  width: number
  height: number
}

const ICON_CONTENT_RATIO = 0.65
const ICON_SOURCE_RATIO = 0.88

function drawRoundedRect(ctx: CanvasRenderingContext2D, size: number, radius: number): void {
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.arcTo(size, 0, size, size, radius)
  ctx.arcTo(size, size, 0, size, radius)
  ctx.arcTo(0, size, 0, 0, radius)
  ctx.arcTo(0, 0, size, 0, radius)
  ctx.closePath()
}

function getIconfontChar(icon: string): string {
  const item = extractIconClasses().find((current) => current.className === icon)
  const match = item?.unicode?.match(/&#x([0-9a-f]+);?/i)
  if (!match) {
    throw new Error('未找到系统图标')
  }
  return String.fromCodePoint(Number.parseInt(match[1], 16))
}

async function drawIconfont(ctx: CanvasRenderingContext2D, icon: string, size: number): Promise<void> {
  const fontFamily = 'iconfont-sys'
  const fontSize = Math.round(size * 0.82)
  await document.fonts.load(`${fontSize}px "${fontFamily}"`)
  await document.fonts.ready
  ctx.fillStyle = '#fff'
  ctx.font = `${fontSize}px "${fontFamily}"`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(getIconfontChar(icon), size / 2, size / 2)
}

async function loadMdiIcon(name: string): Promise<MdiIconData> {
  const collection = await import('@iconify-json/mdi')
  const icon = collection.icons.icons[name]
  if (!icon) {
    throw new Error('未找到 MDI 图标')
  }
  return icon as MdiIconData
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图标 SVG 加载失败'))
    image.src = url
  })
}

async function drawMdiIcon(ctx: CanvasRenderingContext2D, icon: string, size: number): Promise<void> {
  const name = icon.slice('mdi:'.length)
  const collection = await import('@iconify-json/mdi')
  const data = await loadMdiIcon(name)
  const viewBoxWidth = data.width || collection.icons.width || 24
  const viewBoxHeight = data.height || collection.icons.height || 24
  const viewBoxLeft = data.left || 0
  const viewBoxTop = data.top || 0
  const body = data.body.replaceAll('currentColor', '#fff')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxLeft} ${viewBoxTop} ${viewBoxWidth} ${viewBoxHeight}">${body}</svg>`
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))

  try {
    const image = await loadImage(url)
    const iconSize = size * ICON_SOURCE_RATIO
    const ratio = viewBoxWidth / viewBoxHeight
    const drawWidth = ratio >= 1 ? iconSize : iconSize * ratio
    const drawHeight = ratio >= 1 ? iconSize / ratio : iconSize
    ctx.drawImage(image, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight)
  } finally {
    URL.revokeObjectURL(url)
  }
}

function getOpaqueBounds(canvas: HTMLCanvasElement): PixelBounds | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] <= 4) continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  if (maxX < minX || maxY < minY) return null
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
}

async function drawIconLayer(icon: string, size: number): Promise<HTMLCanvasElement> {
  const layer = document.createElement('canvas')
  layer.width = size
  layer.height = size
  const ctx = layer.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 不可用')
  }

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  if (icon.startsWith('mdi:')) {
    await drawMdiIcon(ctx, icon, size)
  } else if (icon.startsWith('iconsys-')) {
    await drawIconfont(ctx, icon, size)
  } else {
    throw new Error('不支持的图标类型')
  }

  return layer
}

function drawNormalizedIcon(ctx: CanvasRenderingContext2D, layer: HTMLCanvasElement, size: number): void {
  const bounds = getOpaqueBounds(layer)
  if (!bounds) {
    throw new Error('图标内容为空')
  }

  const targetSize = size * ICON_CONTENT_RATIO
  const scale = targetSize / Math.max(bounds.width, bounds.height)
  const drawWidth = bounds.width * scale
  const drawHeight = bounds.height * scale
  ctx.drawImage(
    layer,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    (size - drawWidth) / 2,
    (size - drawHeight) / 2,
    drawWidth,
    drawHeight
  )
}

/**
 * 把图标绘制为「品牌底色 + 白色图标」的透明圆角 PNG。
 * 小程序端不渲染 SVG 和 Iconify，统一使用生成后的图片。
 */
export async function generateIconPng(options: GenerateIconPngOptions): Promise<Blob> {
  const size = options.size || 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 不可用')
  }

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = options.backgroundColor
  drawRoundedRect(ctx, size, Math.round(size * 0.22))
  ctx.fill()

  const iconLayer = await drawIconLayer(options.icon, size)
  drawNormalizedIcon(ctx, iconLayer, size)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('PNG 生成失败'))
      }
    }, 'image/png')
  })
}
