export const rurl = (key: string, w?: number, h?: number) => {
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
  return `${VITE_API_URL}/resource/${key}${suffix}`
}

export const durl = (key: string, name?: string) => {
  const { VITE_API_URL } = import.meta.env
  return `${VITE_API_URL}/resource/${key}?download=true&saveName=${name}`
}
