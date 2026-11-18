import { computed, ref } from 'vue'

import { ListCategory } from '@/api/psou/category/api'
import type { Category } from '@/api/psou/category/type'

// 分类选项：资源/网盘等页面共用，分类总量小，一次拉全量
export function useCategoryOptions() {
  const categories = ref<Category[]>([])
  const loaded = ref(false)

  // 接口返回树形结构，选项和映射统一使用拍平后的列表
  const flattenCategories = (list: Category[]): Category[] =>
    list.flatMap((item) => [item, ...flattenCategories(item.children || [])])

  const loadCategories = async () => {
    const res = await ListCategory()
    categories.value = flattenCategories(res.list)
    loaded.value = true
    return categories.value
  }

  const categoryMap = computed(() => {
    const map = new Map<number, Category>()
    categories.value.forEach((item) => map.set(item.id, item))
    return map
  })

  const channelMap = computed(() => {
    const map = new Map<number, Category>()
    categories.value.filter((item) => item.parentId === 0).forEach((item) => map.set(item.id, item))
    return map
  })

  const channelOptions = computed(() =>
    categories.value.filter((item) => item.parentId === 0).map((item) => ({ label: item.name, value: item.id }))
  )

  // 资源只能挂二级分类；label 带一级分类名，后台下拉更容易辨认
  const categoryOptions = computed(() =>
    categories.value
      .filter((item) => item.parentId > 0)
      .map((item) => ({
        label: `${channelMap.value.get(item.parentId)?.name || '未知分类'} / ${item.name}`,
        value: item.id
      }))
  )

  return {
    categories,
    loaded,
    loadCategories,
    categoryMap,
    channelMap,
    channelOptions,
    categoryOptions
  }
}
