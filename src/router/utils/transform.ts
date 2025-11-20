export function transformTreeData(data: any[], labelKey: string, valueKey: string): any[] {
  return data.map((item) => {
    const newItem: Record<string, any> = {
      label: item[labelKey],
      value: item[valueKey]
    }
    if (item.children && Array.isArray(item.children)) {
      newItem.children = transformTreeData(item.children, labelKey, valueKey)
    }
    return newItem
  })
}
