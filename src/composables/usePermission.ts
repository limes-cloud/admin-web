import { useMenuStore } from '@/store/modules/menu'

export const usePermission = () => {
  const menuStore = useMenuStore()
  const hasPermission = (ps: string): boolean => {
    return menuStore.hasPermission(ps)
  }

  return {
    hasPermission
  }
}
