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
          @reset="handleReset"
        >
        </ArtSearchBar>
      </div>
      <div class="table">
        <!-- 表格头部 -->
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton
                v-permission="'resource:appConfig:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
              >
                新增应用配置
              </ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <!-- 卡片列表 -->
        <div class="appcfg-card-scroll">
          <ElEmpty v-if="!loading && !configList.length" description="暂无应用配置" />

          <div v-else v-loading="loading" class="appcfg-grid">
            <article v-for="item in configList" :key="item.id" class="appcfg-card">
              <div class="appcfg-card__top">
                <span class="appcfg-card__led" :class="item.status === 1 ? 'is-on' : 'is-off'"></span>
                <div class="appcfg-card__title">
                  <h2>{{ item.app }}</h2>
                </div>
                <ElSwitch
                  v-permission="'resource:appConfig:update'"
                  v-model="item.status"
                  :active-value="1"
                  :inactive-value="0"
                  inline-prompt
                  active-text="启用"
                  inactive-text="停用"
                  :before-change="handleUpdateStatus(item)"
                />
              </div>

              <dl class="appcfg-card__meta">
                <div>
                  <dt>对象存储</dt>
                  <dd class="mono">{{ storeLabel(item.store_keyword) }}</dd>
                </div>
                <div>
                  <dt>导出存储</dt>
                  <dd class="mono">{{ storeLabel(item.export_store_keyword) }}</dd>
                </div>
                <div>
                  <dt>允许类型</dt>
                  <dd>{{ item.default_accept || '-' }}</dd>
                </div>
                <div>
                  <dt>文件上限</dt>
                  <dd>{{ item.default_max_size }} MB</dd>
                </div>
                <div>
                  <dt>失效时间</dt>
                  <dd>{{ item.temp_url_ttl }} s</dd>
                </div>
                <div>
                  <dt>导出时效</dt>
                  <dd>{{ item.export_ttl }} s</dd>
                </div>
              </dl>

              <div class="appcfg-card__cap">
                <div class="cap-head">
                  <span>容量</span>
                  <span class="mono">{{ capText(item) }}</span>
                </div>
                <div class="cap-bar">
                  <i :class="{ 'is-full': capPercent(item) >= 90 }" :style="{ width: capWidth(item) }"></i>
                </div>
              </div>

              <div class="appcfg-card__footer">
                <ArtOperation :list="operationItems" :data="item"></ArtOperation>
              </div>
            </article>
          </div>
        </div>

        <div v-if="pagination.total > 0" class="appcfg-pagination">
          <ElPagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="pagination.current"
            :page-size="pagination.size"
            :page-sizes="[8, 12, 20, 30, 50]"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增应用配置' : '编辑应用配置'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="460px"
        align-center
      >
        <ArtForm
          ref="formRef"
          v-model="currentData"
          :items="formItems"
          :span="24"
          label-width="auto"
          :show-submit="false"
          :show-cancel="false"
        >
        </ArtForm>

        <template #footer>
          <div class="app-config-footer">
            <ElButton v-ripple @click="dialogVisible = false">取消</ElButton>
            <ElButton v-ripple type="primary" @click="handleDialogSubmit">确定</ElButton>
          </div>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Edit, Plus } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  import { ListAppConfig, CreateAppConfig, UpdateAppConfig } from '@/api/resource/app_config/api'
  import { AppConfigView, CreateAppConfigRequest, UpdateAppConfigRequest } from '@/api/resource/app_config/type'
  import { ListApp } from '@/api/manager/app/api'
  import { ListStore } from '@/api/resource/store/api'
  import { getFileSize } from '@/utils/file'
  import { getAppKeyword } from '@/utils/app-context'

  defineOptions({ name: 'ResourceAppConfig' })

  // 配额单位换算：后端存字节，表单用 GB。后端 uint64 走 proto JSON 会序列化成字符串，统一 Number() 归一化
  const GB = 1024 ** 3
  const num = (v: unknown) => Number(v) || 0
  const gbToBytes = (gb?: number | string) => Math.round(num(gb) * GB)
  const bytesToGb = (b?: number | string) => {
    const n = num(b)
    return n > 0 ? Number((n / GB).toFixed(2)) : 0
  }

  // 卡片容量条（used_bytes/quota 可能是字符串，先归一化再运算）
  const capPercent = (it: AppConfigView) => {
    const q = num(it.quota)
    return q > 0 ? Math.min(100, Math.round((num(it.used_bytes) / q) * 100)) : 0
  }
  const capWidth = (it: AppConfigView) => {
    const q = num(it.quota)
    return (q > 0 ? Math.min(100, (num(it.used_bytes) / q) * 100) : 0) + '%'
  }
  const capText = (it: AppConfigView) => {
    const used = getFileSize(num(it.used_bytes)) || '0B'
    return num(it.quota) > 0 ? `${used} / ${getFileSize(num(it.quota))} · ${capPercent(it)}%` : `${used} · 不限`
  }

  // 对象存储下拉（store_keyword 选择，按名称远程搜索）
  const stores = ref<{ keyword: string; name: string }[]>([])
  const getStores = (query?: string) => {
    ListStore({ page: 1, page_size: 10, keyword: query }).then((res) => {
      stores.value = res.list
    })
  }
  getStores()

  // 存储标识 → 名称 映射：卡片按「名称(标识)」展示
  const storeMap = ref<Record<string, string>>({})
  const loadStoreMap = () => {
    ListStore({ page: 1, page_size: 100 }).then((res) => {
      const m: Record<string, string> = {}
      res.list.forEach((s: any) => {
        m[s.keyword] = s.name
      })
      storeMap.value = m
    })
  }
  loadStoreMap()
  const storeLabel = (kw?: string) => {
    if (!kw) return '-'
    const name = storeMap.value[kw]
    if (!name) return kw
    // 名称里已含标识（如「百度（bdemo）」）就不再重复追加
    return name.includes(kw) ? name : `${name}(${kw})`
  }

  // 页面级应用切换：请求参数显式指定 app，不改变管理端全局登录应用
  const isManagerApp = getAppKeyword() === 'manager'
  const selectedApp = ref(getAppKeyword())
  const appOptions = ref<{ label: string; value: string }[]>([])
  const loadApps = async (query?: string) => {
    if (!isManagerApp) return
    const keyword = query?.trim()
    const res = await ListApp({
      page: 1,
      pageSize: 50,
      status: true,
      ...(keyword ? { query: keyword } : {})
    })
    appOptions.value = res.list.map((item) => ({
      label: `${item.name}（${item.keyword}）`,
      value: item.keyword
    }))
  }
  loadApps()

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<AppConfigView>>({})

  // 搜索表单
  const searchForm = ref<Record<string, any>>({
    app: getAppKeyword(),
    status: undefined
  })

  const searchItems = computed(() => [
    {
      label: '所属应用',
      key: 'app',
      type: 'select',
      hidden: !isManagerApp,
      props: {
        placeholder: '请选择所属应用',
        filterable: true,
        remote: true,
        remoteMethod: loadApps,
        options: appOptions.value,
        onChange: (app: string) => {
          selectedApp.value = app || getAppKeyword()
          searchForm.value.app = selectedApp.value
          Object.assign(searchParams, { status: searchForm.value.status })
          getData()
        }
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { value: 1, label: '启用' },
          { value: 0, label: '停用' }
        ],
        props: { value: 'value', label: 'label' }
      }
    }
  ])

  const formItems = computed(() => [
    {
      key: 'store_keyword',
      label: '对象存储',
      type: 'select',
      tip: '该应用上传文件使用的对象存储（按存储标识引用）',
      props: {
        placeholder: '请选择对象存储',
        style: { width: '100%' },
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query) {
            getStores(query)
          } else {
            getStores()
          }
        },
        options: stores.value.map((s) => ({
          keyword: s.keyword,
          label: s.name.includes(s.keyword) ? s.name : `${s.name}(${s.keyword})`
        })),
        props: { value: 'keyword', label: 'label' },
        rules: [{ required: true, message: '请选择对象存储', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'export_store_keyword',
      label: '导出存储',
      type: 'select',
      tip: '导出产物存放的对象存储（按存储标识引用）',
      props: {
        placeholder: '请选择导出产物对象存储',
        style: { width: '100%' },
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query) {
            getStores(query)
          } else {
            getStores()
          }
        },
        options: stores.value.map((s) => ({
          keyword: s.keyword,
          label: s.name.includes(s.keyword) ? s.name : `${s.name}(${s.keyword})`
        })),
        props: { value: 'keyword', label: 'label' },
        rules: [{ required: true, message: '请选择导出对象存储', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'default_accept',
      label: '允许类型',
      type: 'input',
      tip: '* 或逗号分隔的扩展名（如 png,jpg；留空 = 禁止所有）',
      props: {
        placeholder: '* 或逗号分隔的扩展名（如 png,jpg；留空 = 禁止所有）',
        maxlength: 255
      }
    },
    {
      key: 'default_max_size',
      label: '文件上限',
      type: 'number',
      tip: '单文件大小上限（MB）',
      props: {
        placeholder: '请输入单文件大小上限（MB）',
        min: 1,
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入单文件大小上限', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'temp_url_ttl',
      label: '失效时间',
      type: 'number',
      tip: '临时访问链接有效期（秒），0 = 不生效',
      props: {
        placeholder: '临时访问链接有效期（秒），0 = 不生效',
        min: 0,
        style: { width: '100%' }
      }
    },
    {
      key: 'export_ttl',
      label: '导出时效',
      type: 'number',
      tip: '导出产物保留时长（秒），0 = 不生效',
      props: {
        placeholder: '导出产物保留时长（秒），0 = 不生效',
        min: 0,
        style: { width: '100%' }
      }
    },
    {
      key: 'quota',
      label: '存储配额',
      type: 'number',
      tip: '该应用可用的存储总量（GB），0 = 不限；默认 50',
      props: {
        placeholder: '存储配额（GB），0 = 不限',
        min: 0,
        style: { width: '100%' }
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '编辑',
      color: 'warning',
      permission: 'resource:appConfig:update',
      click: async (record: AppConfigView) => {
        showDialog('edit', record)
      }
    }
  ]

  const {
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    getData,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate
  } = useTable({
    core: {
      apiFn: (params: Parameters<typeof ListAppConfig>[0]) => ListAppConfig(params, selectedApp.value),
      paginationKey: { current: 'page', size: 'page_size' },
      apiParams: { status: undefined },
      columnsFactory: () => [
        {
          prop: 'app',
          label: '应用标识',
          minWidth: 130
        },
        {
          prop: 'store_keyword',
          label: '对象存储',
          minWidth: 130
        },
        {
          prop: 'export_store_keyword',
          label: '导出存储',
          minWidth: 130
        },
        {
          prop: 'default_accept',
          label: '允许类型',
          minWidth: 130
        },
        {
          prop: 'default_max_size',
          label: '文件上限(MB)',
          minWidth: 130
        },
        {
          prop: 'temp_url_ttl',
          label: '失效时间(s)',
          minWidth: 130
        },
        {
          prop: 'export_ttl',
          label: '导出时效(s)',
          minWidth: 130
        },
        {
          prop: 'status',
          label: '状态',
          minWidth: 130,
          slotName: 'status',
          useSlot: true
        },
        {
          prop: 'updated_at',
          label: '更新时间',
          minWidth: 130,
          formatter: (row: AppConfigView) => formatTime(row.updated_at)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          useSlot: true,
          slotName: 'operation'
        }
      ]
    }
  })

  // useTable 只能从 { records } 结构推导行类型，该接口返回 { list, total }，这里显式标注卡片列表的类型
  const configList = computed(() => data.value as unknown as AppConfigView[])

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { status: searchForm.value.status })
    getData()
  }

  const handleReset = () => {
    const app = getAppKeyword()
    selectedApp.value = app
    searchForm.value.app = app
    searchForm.value.status = undefined
    resetSearchParams()
  }

  // 显示弹窗
  const showDialog = (type: Form.DialogType, row?: AppConfigView) => {
    dialogType.value = type
    currentData.value = row
      ? { ...row, quota: bytesToGb(row.quota) }
      : { status: 1, default_accept: '*', default_max_size: 10, temp_url_ttl: 3600, export_ttl: 604800, quota: 50 }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 表单校验后提交
  const formRef = ref<{ validate: (...args: any[]) => Promise<any> }>()

  const handleDialogSubmit = async () => {
    try {
      const res = await formRef.value?.validate()
      if (!res) return
      // 表单的 quota 单位是 GB，提交前换算成字节
      const value = { ...currentData.value, quota: gbToBytes(currentData.value.quota) }
      if (dialogType.value === 'add') {
        await CreateAppConfig(value as CreateAppConfigRequest, selectedApp.value)
        ElMessage.success('创建成功')
        refreshCreate()
      } else {
        await UpdateAppConfig(value as UpdateAppConfigRequest, selectedApp.value)
        ElMessage.success('修改成功')
        refreshUpdate()
      }
      dialogVisible.value = false
    } catch {
      // 校验失败：保持弹窗不关闭
    }
  }

  // 列表内切换启用/停用（参考 role 页：before-change 确认后再提交，以 app 为唯一键局部更新）
  const handleUpdateStatus = (item: AppConfigView): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改应用配置状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateAppConfig({ status: item.status === 1 ? 0 : 1 }, selectedApp.value)
            ElMessage.success('修改成功')
            refreshUpdate()
            resolve(true)
          })
          .catch(() => {
            resolve(false)
          })
      })
    }
  }
</script>

<style scoped>
  .app-config-footer {
    display: flex;
    justify-content: flex-end;
    padding: 10px 0 0;
  }

  .appcfg-card-scroll {
    margin-top: 12px;
  }

  .appcfg-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .appcfg-card {
    display: flex;
    flex-direction: column;
    min-height: 230px;
    padding: 18px;
    background: var(--art-main-bg-color);
    border: 1px solid var(--art-border-color);
    border-radius: 8px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .appcfg-card:hover {
    border-color: rgba(var(--art-primary), 0.45);
    box-shadow: var(--art-root-card-box-shadow);
  }

  .appcfg-card__top {
    display: grid;
    grid-template-columns: 12px minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  .appcfg-card__led {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--art-gray-400);
  }

  .appcfg-card__led.is-on {
    background: rgb(var(--art-success));
    box-shadow: 0 0 0 3px rgba(var(--art-success), 0.18);
  }

  .appcfg-card__title {
    min-width: 0;
  }

  .appcfg-card__title h2 {
    margin: 0;
    overflow: hidden;
    font-size: 14px;
    font-weight: 700;
    line-height: 22px;
    color: var(--art-gray-900);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .appcfg-card__title p {
    margin: 2px 0 0;
    overflow: hidden;
    font-size: 12px;
    color: var(--art-gray-500);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .appcfg-card__meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 12px 0 0;
    padding-top: 12px;
    border-top: 1px solid var(--art-border-color);
  }

  .appcfg-card__meta > div {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
  }

  .appcfg-card__meta dt {
    margin: 0;
    font-size: 12px;
    color: var(--art-gray-500);
  }

  .appcfg-card__meta dd {
    margin: 0;
    overflow: hidden;
    font-size: 13px;
    color: var(--art-gray-800);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .appcfg-card__cap {
    margin-top: 12px;
  }

  .appcfg-card__cap .cap-head {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--art-gray-500);
    margin-bottom: 6px;
  }

  .appcfg-card__cap .cap-bar {
    height: 6px;
    border-radius: 3px;
    background: var(--art-gray-200, rgba(120, 146, 184, 0.18));
    overflow: hidden;
  }

  .appcfg-card__cap .cap-bar i {
    display: block;
    height: 100%;
    border-radius: 3px;
    background: rgb(var(--art-success));
    transition: width 0.3s ease;
  }

  .appcfg-card__cap .cap-bar i.is-full {
    background: var(--el-color-danger);
  }

  .appcfg-card__footer {
    display: flex;
    justify-content: flex-end;
    margin-top: auto;
    padding-top: 12px;
  }

  .appcfg-card .mono {
    font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  }

  .appcfg-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  @media (max-width: 1200px) {
    .appcfg-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .appcfg-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
