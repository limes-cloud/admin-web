import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useAppStore } from '@/store/modules/app'

/** 扩展的路由配置类型 */
export type AppRouteRecordRaw = RouteRecordRaw & {
  hidden?: boolean
}

/** 顶部进度条配置 */
export const configureNProgress = () => {
  NProgress.configure({
    easing: 'ease',
    speed: 600,
    showSpinner: false,
    trickleSpeed: 200,
    parent: 'body'
  })
}

/**
 * 设置页面标题，根据路由元信息和系统信息拼接标题
 * @param to 当前路由对象
 */
export const setPageTitle = (to: RouteLocationNormalized): void => {
  const appStore = useAppStore()
  const { title } = to.meta
  if (title) {
    setTimeout(() => {
      document.title = `${formatMenuTitle(String(title))} - ${appStore.app.name}`
    }, 150)
  }
}

/**
 * 设置页面标题，根据路由元信息和系统信息拼接标题
 * @param to 当前路由对象
 */
export const setWebIcon = (path: string): void => {
  const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link')
  link.rel = 'icon'
  link.href = path
  document.head.appendChild(link)
}

/**
 * 格式化菜单标题，作为菜单标题展示的唯一入口
 * 菜单标题在路由配置与后端菜单数据里已经是可直接展示的中文文案，这里只做空值归一，
 * 保证调用点拿到的一定是字符串，不再做任何 key 解析
 * @param title 菜单标题，来源于路由 meta.title 或后端菜单数据
 * @returns 有值时返回原标题，无值时返回空字符串
 */
export const formatMenuTitle = (title: string): string => {
  return title || ''
}
