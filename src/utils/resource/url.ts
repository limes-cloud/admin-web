export const rurl = (key: string, w?: number, h?: number) => {
  if (!key) {
    return ''
  }
  if (key.startsWith('http')) {
    return key
  }
  const { VITE_API_URL } = import.meta.env
  if (!w) {
    w = 100
  }
  if (!h) {
    h = 100
  }
  const suffix = `?width=${w}&height=${h}&mode=fill`
  return `${VITE_API_URL}/resource/redirect/${key}${suffix}`
}

export const durl = (key: string, name?: string) => {
  const { VITE_API_URL } = import.meta.env
  let url = `${VITE_API_URL}/resource/api/file/download?key=${key}`
  if (name) url += `&saveName=${name}`
  return url
}
