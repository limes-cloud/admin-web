import { AppRouteRecord } from '@/types/router'
import { getAPIBaseURL } from '@/utils/runtime-config'

// 个人中心由 art-header-bar 的 ArtUserCenter 弹窗承载，没有独立视图，
// 因此本模块当前不含任何可访问子路由；保留目录节点是为了让 routeModules 的引用保持有效。
export const systemRoutes: AppRouteRecord = {
  path: '/system',
  name: 'System',
  component: '/index/index',
  meta: {
    title: '系统管理',
    icon: `${getAPIBaseURL()}/resource/api/385d37202ae8f08cd8ba429eb51b5422.png?width=100&height=100&mode=fill`,
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: []
}
