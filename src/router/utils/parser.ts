import { Menu } from '@/api/manager/menu/type'
import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'
import { rurl } from '@/utils/resource/url'

// function paramsToObject(query: string) {
//   if (query === '') {
//     return {}
//   }
//   const params = new URLSearchParams(query)
//   const obj: Record<string, string> = {}
//   params.forEach((value, key) => {
//     obj[key] = value
//   })
//   return obj
// }

export interface App {
  title: string
  icon: string
  keyword: string
}

export interface Home {
  path: string
  keyword: string
  title: string
}

class Parser {
  // 应用名称集合
  apps: App[] = []

  // 菜单列表集合
  menus: Map<string, AppRouteRecord[]> = new Map()

  // 首页路由
  homes: Map<string, Home> = new Map()

  // 路由
  routers: AppRouteRecord[]

  // appi路由
  apiRouters: AppRouteRecord[]

  // 指令
  permissions: Map<string, string>

  // 临时变量homePath
  home?: Home

  // 初始化构造函数
  constructor(menus: Menu[]) {
    this.routers = []
    this.permissions = new Map()
    this.apiRouters = []
    // 循环获取应用路由
    menus.forEach((menu) => {
      // 获取指令/路由/首页
      const routers: AppRouteRecord[] = []
      this.apiRouters = []
      this.handler([{ ...menu }], routers, false, menu.keyword as string, '', '')

      if (routers.length && routers[0].children?.length) {
        if (this.home) this.homes.set(menu.keyword as string, { ...this.home })
        this.apps.push(Parser.GetApp(menu))
        this.menus.set(menu.keyword as string, routers[0].children as AppRouteRecord[])
        // 将添加的api追加到children上
        routers[0].children = routers[0].children.concat(this.apiRouters)
        this.routers = this.routers.concat(routers)
      }
    })
  }

  // GetApp 获取App
  private static GetApp = (menu: Menu): App => {
    return {
      keyword: menu.keyword as string,
      title: menu.title,
      icon: menu.icon as string
    }
  }

  // 获取首页路由
  GetHome = () => {
    return this.homes
  }

  // 获取路由
  GetRouter = () => {
    return this.routers
  }

  // 获取路由
  GetMenu = () => {
    return this.menus
  }

  GetApps = () => {
    return this.apps
  }

  // handler 加载菜单以及指令
  private handler = (
    menus: Menu[],
    routers: AppRouteRecord[],
    h: boolean,
    key: string,
    parentKey: string,
    parentPath?: string
  ) => {
    menus.forEach((menu) => {
      let hidden: boolean = h
      // 处理菜单
      let router: any = null

      if (menu.path) {
        // 获取首页
        if (menu.isHome) {
          this.home = {
            path: menu.path,
            keyword: menu.keyword as string,
            title: menu.title
          }
        }

        const pm = 'ParentMenu'
        if (!menu.component) {
          menu.component = pm
        }

        // 加载组件
        if (menu.component === 'Layout') {
          menu.component = RoutesAlias.Layout
        }
        if (menu.component === 'ParentMenu') {
          menu.component = undefined
        }
        if (menu.type == 'R') {
          menu.icon = rurl(menu.icon as string)
        }

        // 判断是否为api挂载的页面
        const apiPage = menu.type === 'A' || menu.type === 'BA'
        // 如果是api则声称随机keyword
        const keyword = menu.keyword ? menu.keyword : Math.random().toString(36)

        hidden = (apiPage ? true : !!menu.isHidden) || hidden
        // hidden = isHidden

        const path = menu.path.startsWith('/') ? menu.path : `${parentPath}/${menu.path}`

        router = {
          path: path,
          name: keyword,
          component: menu.component,
          redirect: menu.redirect,
          activeMenu: keyword,
          children: [],
          meta: {
            keyword: key,
            title: menu.title,
            icon: menu.icon,
            isHide: hidden,
            isHideTab: !menu.isAffix,
            order: -Number(menu.weight),
            keepAlive: menu.isCache && !hidden,
            link: menu.url,
            isIframe: menu.isIframe,
            parentName: parentKey,
            parentPath: parentPath,
            notLayout: menu.component !== 'Layout'
          }
        }

        if (!apiPage) routers.push(router)
        else this.apiRouters.push(router)
      }

      // 处理指令
      if (menu.permission) {
        this.permissions.set(menu.permission, menu.path as string)
      }

      // 处理子菜单;
      if (menu.children) {
        if (router) {
          this.handler(menu.children, router.children, hidden, key, router.name, menu.path)
        } else {
          this.handler(menu.children, routers, hidden, key, '', menu.path)
        }
      }
    })
  }

  // 获取指令
  GetPermission = (): Map<string, string> => {
    return this.permissions
  }
}

export default Parser
