import type { AppRouteRecord } from '@/types/router'

// 资源站（psou）后台管理路由
// 后端控制模式下以 manager 菜单记录为准；此模块用于前端控制模式及菜单配置参考。
// 菜单 component 填 /psou/category、/psou/resource、/psou/distribute-account、/psou/account、/psou/netdisk、/psou/setting。
export const psouRoutes: AppRouteRecord = {
  path: '/psou',
  name: 'Psou',
  component: '/index/index',
  meta: {
    title: '资源站管理',
    icon: '&#xe721;'
  },
  children: [
    {
      path: 'category',
      name: 'PsouCategory',
      component: '/psou/category',
      meta: {
        title: '分类管理',
        keepAlive: true
      }
    },
    {
      path: 'resource',
      name: 'PsouResource',
      component: '/psou/resource',
      meta: {
        title: '资源管理',
        keepAlive: true
      }
    },
    {
      path: 'distribute-account',
      name: 'PsouDistributeAccount',
      component: '/psou/distribute-account',
      meta: {
        title: '分发账号',
        keepAlive: true
      }
    },
    {
      path: 'account',
      name: 'PsouAccount',
      component: '/psou/account',
      meta: {
        title: '账号管理',
        keepAlive: true
      }
    },
    {
      path: 'netdisk',
      name: 'PsouNetdisk',
      component: '/psou/netdisk',
      meta: {
        title: '网盘副本',
        keepAlive: true
      }
    },
    {
      path: 'setting',
      name: 'PsouSetting',
      component: '/psou/setting',
      meta: {
        title: '站点配置',
        keepAlive: true
      }
    }
  ]
}
