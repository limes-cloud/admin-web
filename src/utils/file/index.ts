export const getFileSize = (size: number) => {
  if (!size) return ''
  const num = 1024.0 // byte
  if (size < num) return `${size}B`
  if (size < num ** 2) return `${(size / num).toFixed(2)}K` // kb
  if (size < num ** 3) return `${(size / num ** 2).toFixed(2)}M` // M
  if (size < num ** 4) return `${(size / num ** 3).toFixed(2)}G` // G
  return `${(size / num ** 4).toFixed(2)}T` // T
}
