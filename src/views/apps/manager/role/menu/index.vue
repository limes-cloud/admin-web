<template>
  <ElDialog
    v-model="dialogVisible"
    title="角色菜单设置"
    :destroy-on-close="true"
    body-class="art-form-dialog"
    width="420px"
    align-center
  >
    <ArtForm
      v-model="currentData"
      :items="formItems"
      :span="24"
      @submit="handleSubmit"
      @cancel="dialogVisible = false"
    ></ArtForm>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ListAccessibleApp } from '@/api/manager/app/api'
  import { App } from '@/api/manager/app/type'
  import { ListCurrentMenu } from '@/api/manager/menu/api'
  import { Menu } from '@/api/manager/menu/type'
  import { GetRoleMenuIds, UpdateRoleMenuIds } from '@/api/manager/rolemenu/api'
  import { UpdateRoleMenuIdsRequest } from '@/api/manager/rolemenu/type'
  import { getAppKeyword } from '@/utils/app-context'

  const roleId = ref(0)
  const roleApp = ref(getAppKeyword())

  // 弹窗相关
  const dialogVisible = ref(false)
  const currentData = ref<Partial<UpdateRoleMenuIdsRequest>>({})

  const apps = ref<App[]>([])
  const menus = ref<Menu[]>([])

  const getApp = async (query?: string) => {
    const data = await ListAccessibleApp({ app: roleApp.value })
    const keyword = query?.trim().toLowerCase()
    apps.value = keyword
      ? data.list.filter(
          (item) => item.name.toLowerCase().includes(keyword) || item.keyword.toLowerCase().includes(keyword)
        )
      : data.list
  }

  const getRoleMenuIds = async (app: string) => {
    const data = await GetRoleMenuIds({ app: app, roleId: roleId.value })
    currentData.value.menuIds = data.menuIds
  }

  const getMenus = async (app: string) => {
    const data = await ListCurrentMenu({ app: app, onlyMenu: true })

    // 递归去除菜单中type=BA的节点,返回新的节点树
    const removeBase = (list: Menu[]) => {
      return list
        .map((item) => {
          if (item.type === 'BA') {
            return null
          }
          item.children = removeBase(item.children || [])
          return item
        })
        .filter((item) => {
          return item !== null
        })
    }

    // 递归去除菜单中type=G的节点且无children数据,返回新的节点树
    const removeEmptyGroup = (list: Menu[]) => {
      return list
        .map((item) => {
          if (item.type === 'G' && !item.children?.length) {
            return null
          }
          item.children = removeEmptyGroup(item.children || [])
          return item
        })
        .filter((item) => {
          return item !== null
        })
    }

    let list = removeBase(data.list)
    list = removeEmptyGroup(list)
    menus.value = list
  }

  const formItems = computed(() => [
    {
      key: 'app',
      label: '所属应用',
      type: 'select',
      props: {
        placeholder: '请选择所属应用',
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getApp(query)
          } else {
            getApp()
          }
        },
        /**
         * 应用选择变更后加载该应用菜单树与角色已选菜单。
         * 后端 menu / rolemenu 协议的 app 字段是应用 keyword 字符串（max_len 64），因此下拉取 keyword 而不是主键 id。
         * @param keyword 选中应用的 keyword 标识
         */
        onChange: async (keyword: string) => {
          currentData.value.app = keyword
          await getMenus(keyword)
          await getRoleMenuIds(keyword)
        },
        options: apps.value,
        props: {
          value: 'keyword',
          label: 'name'
        },
        rules: [{ required: true, message: '请选择所属应用', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'menuIds',
      label: '角色菜单',
      type: 'treeselect',
      props: {
        placeholder: '请选择角色菜单',
        data: menus.value,
        showCheckbox: true,
        multiple: true,
        nodeKey: 'id',
        currentNodeKey: 'id',
        collapseTags: true,
        defaultCheckedKeys: currentData.value.menuIds,
        props: {
          label: 'title',
          value: 'id'
        },
        rules: [{ required: true, message: '请选择应用菜单', trigger: ['blur', 'change'] }]
      }
    }
  ])

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    await UpdateRoleMenuIds({ ...currentData.value } as UpdateRoleMenuIdsRequest)
    ElMessage.success('设置成功')
    dialogVisible.value = false
  }

  const show = async (id: number, app?: string, appName?: string) => {
    roleId.value = id
    roleApp.value = app || getAppKeyword()
    currentData.value = { roleId: roleId.value, app: roleApp.value }
    menus.value = []
    dialogVisible.value = true
    await getApp()
    if (app && !apps.value.some((item) => item.keyword === app)) {
      apps.value = [{ keyword: app, name: appName || app } as App, ...apps.value]
    }
    if (app) {
      await getMenus(app)
      await getRoleMenuIds(app)
    }
  }

  defineExpose({ show })
</script>
