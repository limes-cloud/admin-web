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
      component: '/system/user-center',
      meta: {
        title: 'menus.system.userCenter',
        isHide: true,
        keepAlive: true,
        isHideTab: true
      }
    },
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
    {
      path: 'tenant',
      name: 'Tenant',
      component: '/system/tenant',
      meta: {
        icon: 'http://127.0.0.1:7080/resource/api/385d37202ae8f08cd8ba429eb51b5422.png?width=100&height=100&mode=fill',
        title: '租户管理',
        keepAlive: true
      }
    },
    {
      path: 'tenantapp',
      name: 'TenantApp',
      component: '/system/tenant/app',
      meta: {
        title: '套餐管理',
        isHide: true,
        keepAlive: true
      }
    },
    {
      path: 'app',
      name: 'App',
      component: '/system/app',
      meta: {
        title: '应用管理',
        keepAlive: true
      }
    },
    {
      path: 'appoauther',
      name: 'AppOAuther',
      component: '/system/app/oauther',
      meta: {
        title: '应用授权',
        isHide: true,
        keepAlive: true
      }
    },
    {
      path: 'appfield',
      name: 'AppField',
      component: '/system/app/field',
      meta: {
        title: '应用字段',
        isHide: true,
        keepAlive: true
      }
    },
    {
      path: 'menu',
      name: 'Menu',
      component: '/system/app/menu',
      meta: {
        title: '菜单管理',
        isHide: true,
        keepAlive: true
      }
    },
    {
      path: 'entity',
      name: 'Entity',
      component: '/system/app/entity',
      meta: {
        isHide: true,
        title: '实体管理',
        keepAlive: true
      }
    },
    {
      path: 'rule',
      name: 'Rule',
      component: '/system/app/rule',
      meta: {
        isHide: true,
        title: '规则管理',
        keepAlive: true
      }
    },
    {
      path: 'oauther',
      name: 'Oauther',
      component: '/system/oauther',
      meta: {
        title: '授权管理',
        keepAlive: true
      }
    },
    {
      path: 'field',
      name: 'Field',
      component: '/system/field',
      meta: {
        title: '字段管理',
        keepAlive: true
      }
    },
    {
      path: 'dictionary',
      name: 'Dictionary',
      component: '/system/dictionary',
      meta: {
        title: '字典管理',
        keepAlive: true
      }
    },
    {
      path: 'dept',
      name: 'Dept',
      component: '/system/dept',
      meta: {
        title: '部门管理',
        keepAlive: true
      }
    },
    {
      path: 'deptrole',
      name: 'DeptRole',
      component: '/system/dept/role',
      meta: {
        title: '部门角色',
        keepAlive: false,
        isHide: true
      }
    },
    {
      path: 'classify',
      name: 'DeptClassify',
      component: '/system/dept/classify',
      meta: {
        title: '部门分类',
        keepAlive: true,
        isHide: true
      }
    },
    {
      path: 'job',
      name: 'Job',
      component: '/system/job',
      meta: {
        title: '职位管理',
        keepAlive: true
      }
    },
    {
      path: 'jobrole',
      name: 'JobRole',
      component: '/system/job/role',
      meta: {
        title: '职位角色',
        keepAlive: false,
        isHide: true
      }
    },
    {
      path: 'role',
      name: 'Role',
      component: '/system/role',
      meta: {
        title: '角色管理',
        keepAlive: false
      }
    },
    {
      path: 'roleentity',
      name: 'RoleRule',
      component: '/system/role/entity',
      meta: {
        title: '数据权限',
        keepAlive: true,
        isHide: true
      }
    },
    {
      path: 'user',
      name: 'User',
      component: '/system/user',
      meta: {
        title: 'menus.system.user',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'userdept',
      name: 'UserDept',
      component: '/system/user/dept',
      meta: {
        title: '部门分配',
        keepAlive: true,
        isHide: true
      }
    }
  ]
}
