import { useMenuStore } from '@/store/modules/menu'
import { App, Directive, DirectiveBinding } from 'vue'

interface AuthBinding extends DirectiveBinding {
  value: string
}

function checkAuthPermission(el: HTMLElement, binding: AuthBinding): void {
  const menuStore = useMenuStore()

  // 如果没有权限，移除元素
  if (!menuStore.hasPermission(binding.value)) {
    removeElement(el)
  }
}

function removeElement(el: HTMLElement): void {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

const authDirective: Directive = {
  mounted: checkAuthPermission,
  updated: checkAuthPermission
}

export function setupPermissionDirective(app: App): void {
  app.directive('permission', authDirective)
}
