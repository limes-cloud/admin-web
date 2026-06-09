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
  import { ListApp } from '@/api/manager/app/api'
  import { App } from '@/api/manager/app/type'
  import { ListCurrentMenu } from '@/api/manager/menu/api'
  import { Menu } from '@/api/manager/menu/type'
  import { GetRoleMenuIds, UpdateRoleMenuIds } from '@/api/manager/rolemenu/api'
  import { UpdateRoleMenuIdsRequest } from '@/api/manager/rolemenu/type'

  const roleId = ref(0)

  // 弹窗相关
  const dialogVisible = ref(false)
  const currentData = ref<Partial<UpdateRoleMenuIdsRequest>>({})

  const apps = ref<App[]>([])
  const menus = ref<Menu[]>([])

  const getApp = async (name?: string) => {
    const data = await ListApp({ page: 1, pageSize: 10, name })
    apps.value = data.list
  }

  const getRoleMenuIds = async (appId: number) => {
    const data = await GetRoleMenuIds({ appId: appId, roleId: roleId.value })
    currentData.value.menuIds = data.menuIds
  }

  const getMenus = async (appId: number) => {
    const data = await ListCurrentMenu({ appId: appId, onlyMenu: true })

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
      key: 'appId',
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
        onChange: async (id: number) => {
          await getMenus(id)
          await getRoleMenuIds(id)
        },
        options: apps.value,
        props: {
          value: 'id',
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
    ElMessage.success('修改成功')
    dialogVisible.value = false
  }

  const show = (id: number) => {
    roleId.value = id
    currentData.value = { roleId: roleId.value }
    menus.value = []
    dialogVisible.value = true
  }

  defineExpose({ show })
</script>
