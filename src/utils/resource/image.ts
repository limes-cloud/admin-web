// isPortraitImage 判断图片是否为竖图（高度大于宽度）；加载失败时返回 false。
export const isPortraitImage = (source: Blob | string) =>
  new Promise<boolean>((resolve) => {
    const objectURL = typeof source === 'string' ? '' : URL.createObjectURL(source)
    const image = new Image()
    const finish = (portrait: boolean) => {
      if (objectURL) URL.revokeObjectURL(objectURL)
      resolve(portrait)
    }
    image.onload = () => finish(image.naturalHeight > image.naturalWidth)
    image.onerror = () => finish(false)
    image.src = typeof source === 'string' ? source : objectURL
  })
