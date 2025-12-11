<!-- 通知组件 -->
<template>
  <div
    class="notice"
    v-show="visible"
    :style="{
      transform: show ? 'scaleY(1)' : 'scaleY(0.9)',
      opacity: show ? 1 : 0
    }"
    @click.stop=""
  >
    <div class="header">
      <span class="text">系统通知</span>
      <!-- <span class="btn" v-if="activeTab == 'unread'">标记已读</span> -->
    </div>

    <div class="bar">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部" name="all"><div></div></el-tab-pane>
        <el-tab-pane label="未读" name="unread"></el-tab-pane>
      </el-tabs>
    </div>

    <div class="content">
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        row-key="id"
        :pagination="pagination"
        :show-header="false"
        :pagination-options="{
          size: 'small',
          layout: 'total, sizes, prev, pager'
        }"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #item="{ row }">
          <div class="notice-item" @click="handleLookNotice(row)">
            <div class="notice-avatar">
              <ElAvatar shape="square" :size="40" :src="$rurl(row.classify.logo)"></ElAvatar>
            </div>
            <div class="notice-content">
              <div class="notice-title">{{ row.title }}</div>
              <div class="notice-time">{{ formatTime(row.createdAt) }}</div>
            </div>
          </div>
        </template>
      </ArtTable>
    </div>

    <ElDialog
      v-model="noticeVisible"
      :title="title"
      :destroy-on-close="true"
      :append-to-body="true"
      body-class="art-form-dialog"
      width="780px"
      align-center
      @close="handleCloseLookNotice"
    >
      <ArtRichView :value="currentData?.content" />
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { GetVisibleNotice, ListVisibleNotice } from '@/api/manager/notice/api'
  import { Notice } from '@/api/manager/notice/type'
  import { useTable } from '@/composables/useTable'
  import { formatTime } from '@/utils/time'
  import { ref, watch } from 'vue'

  defineOptions({ name: 'ArtNotification' })

  const props = defineProps<{
    value: boolean
  }>()

  const noticeVisible = ref(false)
  const title = ref('系统通知')
  const currentData = ref<Notice>()

  const activeTab = ref('all')
  const show = ref(false)
  const visible = ref(false)

  const searchForm = ref({
    notRead: false
  })

  const handleTabClick = (tab: any) => {
    if (tab.props.name === 'unread') {
      searchForm.value.notRead = true
    } else {
      searchForm.value.notRead = false
    }
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const handleLookNotice = async (row: any) => {
    const data = await GetVisibleNotice({ id: row.id })
    title.value = data.title
    currentData.value = data
    noticeVisible.value = true
  }

  const handleCloseLookNotice = () => {
    if (searchForm.value.notRead) {
      getData()
      currentData.value = undefined
    }
  }

  // 动画管理
  const useNotificationAnimation = () => {
    const showNotice = (open: boolean) => {
      if (open) {
        visible.value = open
        setTimeout(() => {
          show.value = open
        }, 5)
      } else {
        show.value = open
        setTimeout(() => {
          visible.value = open
        }, 350)
      }
    }

    return {
      showNotice
    }
  }

  const { showNotice } = useNotificationAnimation()

  const { columns, data, loading, searchParams, pagination, getData, handleSizeChange, handleCurrentChange } = useTable(
    {
      // 核心配置
      core: {
        apiFn: ListVisibleNotice,
        apiParams: { ...searchForm.value },
        columnsFactory: () => [
          {
            prop: 'item',
            label: '通知',
            useSlot: true,
            slotName: 'item'
          }
        ]
      }
    }
  )

  // 监听属性变化
  watch(
    () => props.value,
    (newValue) => {
      showNotice(newValue)
    }
  )
</script>

<style lang="scss" scoped>
  @use './style';
</style>
