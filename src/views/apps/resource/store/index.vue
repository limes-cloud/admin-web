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
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton
                v-permission="'resource:store:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
              >
                新增对象存储
              </ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <!-- 卡片列表 -->
        <div class="store-card-scroll">
          <ElEmpty v-if="!loading && !storeList.length" description="暂无对象存储" />

          <div v-else v-loading="loading" class="store-grid">
            <article v-for="item in storeList" :key="item.id" class="store-card">
              <div class="store-card__top">
                <span class="store-card__led" :class="item.status === 1 ? 'is-on' : 'is-off'"></span>
                <div class="store-card__title">
                  <h2>{{ item.name }}</h2>
                </div>
                <ElTag effect="light" type="primary">{{ providerLabel(item.provider) }}</ElTag>
              </div>

              <dl class="store-card__meta">
                <div>
                  <dt>接入</dt>
                  <dd class="mono">{{ item.endpoint || '-' }}</dd>
                </div>
                <div>
                  <dt>桶名</dt>
                  <dd class="mono">{{ item.bucket || '-' }}</dd>
                </div>
                <div>
                  <dt>地域</dt>
                  <dd class="mono">{{ item.region || '-' }}</dd>
                </div>
                <div>
                  <dt>AK</dt>
                  <dd class="mono">{{ item.ak || '-' }}</dd>
                </div>
              </dl>

              <div class="store-card__footer">
                <ElSwitch
                  v-permission="'resource:store:update'"
                  v-model="item.status"
                  :active-value="1"
                  :inactive-value="0"
                  inline-prompt
                  active-text="启用"
                  inactive-text="停用"
                  :before-change="handleUpdateStatus(item)"
                />
                <ArtOperation :list="operationItems" :data="item"></ArtOperation>
              </div>
            </article>
          </div>
        </div>

        <div v-if="pagination.total > 0" class="store-pagination">
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
        :title="dialogType === 'add' ? '新增对象存储' : '编辑对象存储'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="560px"
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
          <div class="store-footer">
            <ElButton v-ripple :loading="checking" @click="handleCheck">测试连接</ElButton>
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
  import { Delete, Edit, Plus } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'

  import { ListStore, CreateStore, UpdateStore, DeleteStore, ListProvider, CheckStore } from '@/api/resource/store/api'
  import { Store, CreateStoreRequest, UpdateStoreRequest, CheckStoreRequest } from '@/api/resource/store/type'

  defineOptions({ name: 'ResourceStore' })

  // 主仓库列表（编号、名称、类型、状态、操作列）
  const providers = ref<{ value: string; label: string }[]>([])
  const getProviders = () => {
    ListProvider().then((res) => {
      providers.value = res.list
    })
  }
  getProviders()

  // providerLabel 厂商标识 → 中文名（卡片徽标/列表展示用）
  const providerLabel = (p: string) => providers.value.find((item) => item.value === p)?.label || p

  const cdnAuthTypes = [
    { value: 'none', label: '不启用' },
    { value: 'cdn_a', label: 'CDN-A（query 签名）' },
    { value: 'cdn_b', label: 'CDN-B（path 签名）' },
    { value: 'cdn_c', label: 'CDN-C（header 签名）' },
    { value: 's3_presign', label: 'S3 预签名' }
  ]

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<Store>>({})

  // 搜索表单
  const searchForm = ref<Record<string, any>>({
    keyword: undefined,
    provider: undefined,
    status: undefined
  })

  const searchItems = computed(() => [
    {
      label: '名称/标识',
      key: 'keyword',
      type: 'input',
      props: { placeholder: '请输入名称或标识', clearable: true }
    },
    {
      label: '厂商',
      key: 'provider',
      type: 'select',
      props: {
        placeholder: '请选择厂商',
        clearable: true,
        options: providers.value,
        props: { value: 'value', label: 'label' }
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
      key: 'name',
      label: '存储名称',
      type: 'input',
      tip: '对象存储的展示名称，便于在列表中识别',
      props: {
        placeholder: '请输入对象存储名称',
        maxlength: 128,
        rules: [{ required: true, message: '请输入对象存储名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'keyword',
      label: '唯一标识',
      type: 'input',
      tip: '全局唯一标识，创建后不可修改，供应用配置按此引用（如 bos-bj）',
      props: {
        placeholder: '请输入唯一标识（如 bos-bj）',
        maxlength: 32,
        disabled: dialogType.value === 'edit',
        rules: [{ required: true, message: '请输入标识', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'provider',
      label: '存储厂商',
      type: 'select',
      tip: '对象存储厂商：aws / bos / oss / cos / obs / minio / rustfs / uss',
      props: {
        placeholder: '请选择厂商',
        style: { width: '100%' },
        filterable: true,
        options: providers.value,
        props: { value: 'value', label: 'label' },
        rules: [{ required: true, message: '请选择厂商', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'endpoint',
      label: '接入地址',
      type: 'input',
      tip: '对象存储服务接入点地址（如 https://bj.bcebos.com；本地 RustFS 可填 http://127.0.0.1:9000）',
      props: {
        placeholder: '如 https://bj.bcebos.com',
        maxlength: 255,
        rules: [{ required: true, message: '请输入接入点', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'region',
      label: '存储地域',
      type: 'input',
      tip: '存储桶所在地域（如 bj / us-east-1）',
      props: {
        placeholder: '如 bj / us-east-1',
        maxlength: 64,
        rules: [{ required: true, message: '请输入地域', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'bucket',
      label: '存储桶名',
      type: 'input',
      tip: '对象存储的存储桶（Bucket）名称',
      props: {
        placeholder: '请输入存储桶名称',
        maxlength: 128,
        rules: [{ required: true, message: '请输入存储桶', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'ak',
      label: '访问密钥',
      type: 'input',
      tip: '访问密钥 AccessKey ID',
      props: {
        placeholder: '请输入 AccessKey',
        maxlength: 255,
        rules: [{ required: true, message: '请输入 AccessKey', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'sk',
      label: '安全密钥',
      type: 'input',
      tip: '访问密钥 SecretKey；编辑时掩码显示，留空表示不修改',
      props: {
        placeholder: dialogType.value === 'edit' ? '已掩码，留空表示不修改' : '请输入 SecretKey',
        maxlength: 255,
        rules: [{ required: dialogType.value === 'add', message: '请输入 SecretKey', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'public_base_url',
      label: '公开地址',
      type: 'input',
      tip: '对外访问的基础地址：公有读填对象存储域名，走防盗链填 CDN 域名',
      props: {
        placeholder: '如 https://cdn.example.com',
        maxlength: 255,
        rules: [{ required: true, message: '请输入公开访问地址', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'cdn_auth_type',
      label: '鉴权方式',
      type: 'select',
      tip: '临时链接鉴权方式：不启用（公有读）/ CDN-A·B·C 签名 / S3 预签名',
      props: {
        placeholder: '请选择鉴权方式',
        style: { width: '100%' },
        options: cdnAuthTypes,
        props: { value: 'value', label: 'label' },
        rules: [{ required: true, message: '请选择鉴权方式', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'cdn_auth_key',
      label: '鉴权密钥',
      type: 'input',
      tip: 'CDN 防盗链签名密钥；仅 CDN-A/B/C 需要且必填，S3 预签名不使用可留空',
      hidden: !currentData.value.cdn_auth_type || currentData.value.cdn_auth_type === 'none',
      props: {
        placeholder: dialogType.value === 'edit' ? '已掩码，留空表示不修改' : '请输入鉴权密钥',
        maxlength: 255,
        rules: ['cdn_a', 'cdn_b', 'cdn_c'].includes(currentData.value.cdn_auth_type as string)
          ? [{ required: true, message: '请输入鉴权密钥', trigger: ['blur', 'change'] }]
          : []
      }
    },
    {
      key: 'description',
      label: '备注信息',
      type: 'input',
      tip: '可选的备注说明',
      props: {
        placeholder: '请输入备注（可选）',
        maxlength: 256
      }
    }
  ])

  const operationItems = [
    {
      icon: Edit,
      label: '编辑',
      color: 'warning',
      permission: 'resource:store:update',
      click: async (record: Store) => {
        showDialog('edit', record)
      }
    },
    {
      icon: Delete,
      label: '删除',
      color: 'danger',
      permission: 'resource:store:delete',
      click: async (record: Store) => {
        try {
          await ElMessageBox.confirm(
            '删除后不可恢复。仅允许删除无对象、上传会话、导出任务和应用配置引用的存储；不会删除桶内文件。',
            '删除对象存储',
            {
              confirmButtonText: '删除',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
          await DeleteStore({ id: record.id })
          ElMessage.success('删除成功')
          refreshData()
        } catch {
          // 取消删除或服务端拒绝时保持列表不变
        }
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
      apiFn: ListStore,
      paginationKey: { current: 'page', size: 'page_size' },
      apiParams: {
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'name',
          label: '存储名称',
          minWidth: 130
        },
        {
          prop: 'keyword',
          label: '存储标识',
          minWidth: 130
        },
        {
          prop: 'provider',
          label: '存储厂商',
          minWidth: 130,
          formatter: (row: Store) => providers.value.find((p) => p.value === row.provider)?.label || row.provider
        },
        {
          prop: 'endpoint',
          label: '接入点',
          minWidth: 130
        },
        {
          prop: 'bucket',
          label: '存储桶',
          minWidth: 130
        },
        {
          prop: 'ak',
          label: 'AccessKey',
          minWidth: 130
        },
        {
          prop: 'sk',
          label: 'SecretKey',
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
          formatter: (row: Store) => formatTime(row.updated_at)
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
  const storeList = computed(() => data.value as unknown as Store[])

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示弹窗
  const showDialog = (type: Form.DialogType, row?: Store) => {
    dialogType.value = type
    currentData.value = row ? { ...row, status: row.status ?? 1 } : { status: 1, cdn_auth_type: 'none' }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 表单校验后提交
  const formRef = ref<{ validate: (...args: any[]) => Promise<any> }>()

  // 测试存储连通性：用当前表单配置调用（不落库）
  const checking = ref(false)
  const handleCheck = async () => {
    try {
      const res = await formRef.value?.validate()
      if (!res) return
      const v = currentData.value
      checking.value = true
      const { ok, message } = await CheckStore({
        // 编辑场景传 id：sk 为掩码时后端回退用 DB 存储的真实 sk
        id: dialogType.value === 'edit' ? v.id : undefined,
        provider: v.provider as string,
        endpoint: v.endpoint as string,
        region: v.region as string,
        bucket: v.bucket as string,
        ak: v.ak as string,
        sk: v.sk as string
      } as CheckStoreRequest)
      if (ok) {
        ElMessage.success('连接正常')
      } else {
        ElMessage.error(message || '连接失败')
      }
    } catch {
      // 校验失败：不发起测试
    } finally {
      checking.value = false
    }
  }

  const handleDialogSubmit = async () => {
    try {
      const res = await formRef.value?.validate()
      if (!res) return
      const value = currentData.value
      if (dialogType.value === 'add') {
        await CreateStore(value as CreateStoreRequest)
        ElMessage.success('创建成功')
        refreshCreate()
      } else {
        await UpdateStore(value as UpdateStoreRequest)
        ElMessage.success('修改成功')
        refreshUpdate()
      }
      dialogVisible.value = false
    } catch {
      // 校验失败：保持弹窗不关闭
    }
  }

  // 列表内切换启用/停用（参考 role 页：before-change 确认后再提交）
  const handleUpdateStatus = (item: Store): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改对象存储状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            await UpdateStore({ id: item.id, status: item.status === 1 ? 0 : 1 })
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
  .store-footer {
    display: flex;
    justify-content: flex-end;
    padding: 10px 0 0;
  }

  .store-card-scroll {
    margin-top: 12px;
  }

  .store-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .store-card {
    display: flex;
    flex-direction: column;
    min-height: 210px;
    padding: 18px;
    background: var(--art-main-bg-color);
    border: 1px solid var(--art-border-color);
    border-radius: 8px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .store-card:hover {
    border-color: rgba(var(--art-primary), 0.45);
    box-shadow: var(--art-root-card-box-shadow);
  }

  .store-card__top {
    display: grid;
    grid-template-columns: 12px minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  .store-card__led {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--art-gray-400);
  }

  .store-card__led.is-on {
    background: rgb(var(--art-success));
    box-shadow: 0 0 0 3px rgba(var(--art-success), 0.18);
  }

  .store-card__title {
    min-width: 0;
  }

  .store-card__title h2 {
    margin: 0;
    overflow: hidden;
    font-size: 14px;
    font-weight: 700;
    line-height: 22px;
    color: var(--art-gray-900);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .store-card__title p {
    margin: 2px 0 0;
    overflow: hidden;
    font-size: 12px;
    color: var(--art-gray-500);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .store-card__meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 12px 0 0;
    padding-top: 12px;
    border-top: 1px solid var(--art-border-color);
  }

  .store-card__meta > div {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
  }

  .store-card__meta dt {
    margin: 0;
    font-size: 12px;
    color: var(--art-gray-500);
  }

  .store-card__meta dd {
    margin: 0;
    overflow: hidden;
    font-size: 13px;
    color: var(--art-gray-800);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .store-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 12px;
  }

  .store-card .mono {
    font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  }

  .store-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  @media (max-width: 1200px) {
    .store-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .store-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
