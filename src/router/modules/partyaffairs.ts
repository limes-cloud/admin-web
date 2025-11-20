import { AppRouteRecord } from '@/types/router'

export const partyAffairsRoutes: AppRouteRecord = {
  path: '/partyaffairs',
  name: 'PartyAffairs',
  component: '/index/index',
  meta: {
    title: '信号灯',
    icon: '&#xe7b9;',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'banner',
      name: 'Banner',
      component: '/partyaffairs/banner',
      meta: {
        title: '轮播管理',
        keepAlive: true
      }
    },
    {
      path: 'information',
      name: 'Information',
      component: '/partyaffairs/information',
      meta: {
        title: '资讯管理',
        keepAlive: true
      }
    }
  ]
}
