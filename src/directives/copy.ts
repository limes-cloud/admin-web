import { App, Directive, DirectiveBinding } from 'vue'

function copy(el: HTMLElement, binding: DirectiveBinding) {
  const { value } = binding
  el.onclick = async () => {
    if (value.length > 0) {
      await navigator.clipboard.writeText(value)
      ElMessage.success('复制成功')
    }
  }
}

const copyDirective: Directive<HTMLElement> = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    copy(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    copy(el, binding)
  }
}

export function setupCopyDirective(app: App) {
  app.directive('copy', copyDirective)
}
