<template>
  <div class="container">
    <DirectoryPane class="left" :app="selectedApp" :apps="apps" @select="onSelect" @change-app="onChangeApp" />
    <FilePane class="right" :app="selectedApp" :directory="selected" />
  </div>
</template>

<style lang="scss" scoped>
  .container {
    display: flex;
    flex-direction: row;
    height: 100%;

    .left {
      flex: 0 0 240px;
      width: 260px;
      margin-right: 15px;
    }

    .right {
      width: calc(100% - 255px);
    }
  }
</style>

<script setup lang="ts">
  import DirectoryPane from './components/DirectoryPane.vue'
  import FilePane from './components/FilePane.vue'
  import { DirectoryView } from '@/api/resource/directory/type'
  import { ListApp } from '@/api/manager/app/api'
  import { App } from '@/api/manager/app/type'
  import { getAppKeyword } from '@/utils/app-context'

  defineOptions({ name: 'ResourceDirectory' })

  // 页面级 app：目录与文件共用，请求时通过 app 参数显式指定，不改全局登录应用
  const selectedApp = ref(getAppKeyword())
  const apps = ref<App[]>([])
  const isManagerApp = getAppKeyword() === 'manager'

  const loadApps = async () => {
    if (!isManagerApp) return
    const res = await ListApp({ page: 1, pageSize: 50, status: true })
    apps.value = res.list
  }
  loadApps()

  // 左栏选中的目录；右栏按它列文件
  const selected = ref<DirectoryView | null>(null)
  const onSelect = (row: DirectoryView) => {
    selected.value = row && row.id ? row : null
  }

  const onChangeApp = (app: string) => {
    if (!app || app === selectedApp.value) return
    selectedApp.value = app
    selected.value = null
  }
</script>
