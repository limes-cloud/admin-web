import { fourDotsSpinnerSvg } from '@/assets/svg/loading'
import { LoadingOptions } from 'element-plus'

/**
 * 获取当前主题对应的loading背景色
 * @returns 背景色字符串
 */
const getLoadingBackground = (): string => {
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? 'rgba(7, 7, 7, 0.85)' : '#fff'
}

const DEFAULT_LOADING_CONFIG = {
  lock: true,
  get background() {
    return getLoadingBackground()
  },
  svg: fourDotsSpinnerSvg,
  svgViewBox: '0 0 40 40',
  customClass: 'art-loading-fix'
} as const

interface LoadingInstance {
  close: () => void
}

let loadingInstance: LoadingInstance | null = null

export const loadingService = {
  /**
   * 显示 loading
   * @returns 关闭 loading 的函数
   */
  showLoading(cfg?: LoadingOptions): () => void {
    if (!loadingInstance) {
      // 每次显示时获取最新的配置，确保背景色与当前主题同步
      const config = {
        ...DEFAULT_LOADING_CONFIG,
        background: getLoadingBackground()
      }
      if (cfg) {
        Object.assign(config, cfg)
      }
      loadingInstance = ElLoading.service(config)
    }
    return () => this.hideLoading()
  },

  /**
   * 隐藏 loading
   */
  hideLoading(): void {
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
  },

  apply(fn: any, text?: string) {
    const cfg: LoadingOptions = {
      background: 'rgba(0, 0, 0, 0.7)',
      text: text || '加载中...'
    }

    const isAsyncFunction = (fn: any): boolean => {
      return fn && fn.constructor && fn.constructor.name === 'AsyncFunction'
    }
    // 判断fn是否为异步函数
    if (isAsyncFunction(fn)) {
      this.showLoading(cfg)
      fn().finally(() => {
        this.hideLoading()
      })
    } else if (fn instanceof Function) {
      this.showLoading(cfg)
      try {
        fn()
      } finally {
        this.hideLoading()
      }
    }
  }
}
