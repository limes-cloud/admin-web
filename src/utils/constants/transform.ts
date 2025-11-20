// 实现函数将任意数组转为map,key为指定的key
export function arrayToMap(array: any[], key: string) {
  const map = new Map()
  array.forEach((item) => {
    if (item && typeof item === 'object' && key in item) {
      map.set(item[key], item)
    }
  })
  return map
}
