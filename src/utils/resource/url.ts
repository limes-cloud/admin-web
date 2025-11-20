export const rurl = (key: string, w?: number, h?: number) => {
  if (!w) {
    w = 100
  }
  if (!h) {
    h = 100
  }
  const suffix = `?width=${w}&height=${h}&mode=fill`
  return `http://127.0.0.1:7080/resource/${key}${suffix}`

  // return `${import.meta.env.VITE_API_URL}/resource/api/${key}${suffix}`
}
