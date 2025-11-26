import { AppRouteRecord } from '@/types/router'

export const systemRoutes: AppRouteRecord = {
  path: '/system',
  name: 'System',
  component: '/index/index',
  meta: {
    title: 'menus.system.title',
    icon: 'http://127.0.0.1:7080/resource/api/385d37202ae8f08cd8ba429eb51b5422.png?width=100&height=100&mode=fill',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'user-center',
      name: 'UserCenter',
      component: '/manager/user-center',
      meta: {
        title: 'menus.system.userCenter',
        isHide: true,
        keepAlive: true,
        isHideTab: true
      }
    }
    // {
    //   path: 'menu',
    //   name: 'Menus',
    //   component: '/system/menu',
    //   meta: {
    //     title: 'menus.system.menu',
    //     keepAlive: true,
    //     roles: ['R_SUPER'],
    //     authList: [
    //       { title: '新增', authMark: 'add' },
    //       { title: '编辑', authMark: 'edit' },
    //       { title: '删除', authMark: 'delete' }
    //     ]
    //   }
    // },
  ]
}
