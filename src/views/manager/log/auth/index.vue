<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <!-- 搜索栏 -->
        <ArtSearchBar
          ref="searchBarRef"
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="resetSearchParams"
        >
        </ArtSearchBar>
      </div>

      <div class="table">
        <!-- 表格头部 -->
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData"> </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #avatar="{ row }">
            <ElAvatar shape="square" :size="60" :src="$rurl(row.user.avatar)"></ElAvatar>
          </template>
          <template #username="{ row }"> {{ row.user.username }}({{ row.user.nickname }}) </template>
          <template #appLogo="{ row }">
            <ElAvatar shape="square" :size="60" :src="$rurl(row.app.logo)"></ElAvatar>
          </template>
          <template #appName="{ row }"> {{ row.app.keyword }}({{ row.app.name }}) </template>
        </ArtTable>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ListAuthLog } from '@/api/manager/log/api'
  import { User } from '@/api/manager/user/type'

  import { formatTime } from '@/utils/time'
  import { Dept } from '@/api/manager/dept/type'
  import { ListCurrentDept } from '@/api/manager/dept/api'
  import { Job } from '@/api/manager/job/type'
  import { ListJob } from '@/api/manager/job/api'
  import { App } from '@/api/manager/app/type'
  import { ListApp } from '@/api/manager/app/api'
  import { ListOAutherType } from '@/api/manager/oauther/api'
  import { OAutherType } from '@/api/manager/oauther/type'

  defineOptions({ name: 'User' })

  // 搜索表单
  const searchForm = ref({
    keyword: undefined,
    name: undefined,
    status: undefined
  })

  const types = ref<OAutherType[]>([])
  ListOAutherType().then((res) => {
    types.value = res.list
  })

  const depts = ref<Dept[]>([])
  ListCurrentDept().then((res) => {
    depts.value = res.list
  })

  const jobs = ref<Job[]>([])
  const getJobs = (query?: string) => {
    ListJob({ page: 1, pageSize: 10, name: query }).then((res) => {
      jobs.value = res.list
    })
  }
  getJobs()

  const apps = ref<App[]>([])
  const getApps = (query?: string) => {
    ListApp({ page: 1, pageSize: 10, name: query }).then((res) => {
      apps.value = res.list
    })
  }
  getApps()

  const searchItems = computed(() => [
    {
      label: '用户账户',
      key: 'username',
      type: 'input',
      props: {
        placeholder: '请输入用户账户',
        clearable: true
      }
    },
    {
      key: 'appId',
      label: '所属应用',
      type: 'select',
      props: {
        placeholder: '请选择所属应用',
        clearable: true,
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getApps(query)
          } else {
            getApps()
          }
        },
        options: apps.value,
        props: {
          label: 'name',
          value: 'id'
        }
      }
    },
    {
      key: 'deptId',
      label: '所属部门',
      type: 'treeselect',
      props: {
        clearable: true,
        placeholder: '请选择所属部门',
        data: depts.value,
        checkStrictly: true,
        props: {
          label: 'name',
          value: 'id'
        }
      }
    }
  ])

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    getData,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: ListAuthLog,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'type',
          label: '登陆方式',
          useSlot: true,
          slotName: 'type'
        },
        {
          prop: 'avatar',
          label: '用户头像',
          useSlot: true,
          slotName: 'avatar'
        },
        {
          prop: 'username',
          label: '用户账户',
          useSlot: true,
          slotName: 'username'
        },
        {
          prop: 'appLogo',
          label: '应用Logo',
          useSlot: true,
          slotName: 'appLogo'
        },
        {
          prop: 'appName',
          label: '应用名称',
          useSlot: true,
          slotName: 'appName'
        },
        {
          prop: 'ip',
          label: 'IP地址'
        },
        {
          prop: 'address',
          label: '登陆地址'
        },
        {
          prop: 'browser',
          label: '浏览器'
        },
        {
          prop: 'device',
          label: '登陆设备'
        },
        {
          prop: 'code',
          label: '登陆状态',
          useSlot: true,
          slotName: 'code'
        },
        {
          prop: 'createdAt',
          label: '登陆时间',
          sortable: true,
          formatter: (row: User) => formatTime(row.createdAt)
        }
      ]
    }
  })

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }
</script>
