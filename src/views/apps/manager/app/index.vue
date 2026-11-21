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
                v-permission="'manager:app:group:query'"
                v-ripple
                type="success"
                :icon="Expand"
                @click="handleJumpGroup"
              >
                分组管理
              </ElButton>
              <ElButton
                v-permission="'manager:app:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
              >
                新增应用
              </ElButton>
            </ElSpace>
          </template>
        </ArtTableHeader>

        <!-- 卡片列表 -->
        <div class="app-card-scroll">
          <ElEmpty v-if="!loading && !appList.length" description="暂无应用" />

          <div v-else v-loading="loading" class="app-grid">
            <article v-for="item in appList" :key="item.id" class="app-card">
              <div class="app-card__top">
                <div class="app-card__logo" :class="getLogoClass(item)">
                  <ElImage v-if="item.logo" :src="getResourceUrl(item.logo, 72, 72)" fit="cover">
                    <template #error>
                      <span class="app-card__logo-fallback">{{ getAppInitial(item) }}</span>
                    </template>
                  </ElImage>
                  <span v-else>{{ getAppInitial(item) }}</span>
                </div>

                <div class="app-card__title">
                  <h2>{{ item.showName || item.name }}</h2>
                  <p>{{ item.description || item.comment || '暂无描述' }}</p>
                </div>

                <ArtOperation :single="true" :list="operationItems(item)" :data="item" :has-background="false">
                  <ElButton class="app-card__more" text :icon="MoreFilled" />
                </ArtOperation>
              </div>

              <dl class="app-card__meta">
                <div>
                  <dt>应用标识</dt>
                  <dd>{{ item.keyword }}</dd>
                </div>
                <div>
                  <dt>应用名称</dt>
                  <dd>{{ item.name }}</dd>
                </div>
                <div>
                  <dt>应用分组</dt>
                  <dd>{{ getGroupName(item.groupId) }}</dd>
                </div>
                <div>
                  <dt>展示名称</dt>
                  <dd>{{ item.showName || '-' }}</dd>
                </div>
                <div>
                  <dt>允许注册</dt>
                  <dd>{{ getRegisterLabel(item) }}</dd>
                </div>
                <div>
                  <dt>创建时间</dt>
                  <dd>{{ formatCardTime(item.createdAt) }}</dd>
                </div>
              </dl>

              <div class="app-card__footer">
                <ElTooltip
                  effect="dark"
                  :content="item.status ? '已启用' : item.reason || '已禁用'"
                  placement="top-start"
                >
                  <ElSwitch
                    v-model="item.status"
                    :disabled="!$hasPermission('manager:app:update')"
                    inline-prompt
                    active-text="启用"
                    inactive-text="禁用"
                    :before-change="handleUpdateStatus(item)"
                  />
                </ElTooltip>

                <ElTag :type="item.type === 'base' ? 'warning' : 'primary'" effect="light">
                  {{ getAppTypeLabel(item.type) }}
                </ElTag>
              </div>
            </article>
          </div>
        </div>

        <div v-if="pagination.total > 0" class="app-pagination">
          <ElPagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="pagination.current"
            :page-size="pagination.size"
            :page-sizes="[8, 10, 20, 30, 50]"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 新增/修改弹窗 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加应用' : '编辑应用'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="560px"
        align-center
      >
        <ArtForm
          v-model="currentData"
          :items="formItems"
          :span="24"
          @cancel="dialogVisible = false"
          @submit="handleSubmit"
        >
          <template #domains>
            <div class="domain-editor">
              <div v-for="(item, index) in domainRows" :key="index" class="domain-row">
                <ElInput v-model="item.domain" placeholder="例如 app.example.com" clearable />
                <ElCheckbox v-model="item.isPrimary" @change="handleDomainPrimaryChange(index)">主域名</ElCheckbox>
                <ElButton text type="danger" :icon="Delete" @click="removeDomain(index)" />
              </div>
              <ElButton text type="primary" :icon="Plus" @click="addDomain">添加域名</ElButton>
            </div>
          </template>
          <template #miniPrograms>
            <div class="domain-editor">
              <div v-for="(item, index) in miniProgramRows" :key="index" class="domain-row">
                <ElSelect v-model="item.platform" style="width: 132px">
                  <ElOption label="微信" value="mp-weixin" />
                  <ElOption label="支付宝" value="mp-alipay" />
                  <ElOption label="QQ" value="mp-qq" />
                  <ElOption label="快手" value="mp-kuaishou" />
                  <ElOption label="京东" value="mp-jd" />
                  <ElOption label="小红书" value="mp-xhs" />
                  <ElOption label="百度" value="mp-baidu" />
                  <ElOption label="抖音" value="mp-toutiao" />
                  <ElOption label="飞书" value="mp-lark" />
                </ElSelect>
                <ElInput v-model="item.appId" placeholder="例如 wx1234567890" clearable />
                <ElButton text type="danger" :icon="Delete" @click="removeMiniProgram(index)" />
              </div>
              <ElButton text type="primary" :icon="Plus" @click="addMiniProgram">添加小程序ID</ElButton>
            </div>
          </template>
        </ArtForm>
      </ElDialog>

      <SeoPushDialog v-model="seoPushVisible" :app="seoPushApp" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElMessageBox } from 'element-plus'
  import { Delete, Edit, Expand, Fold, MoreFilled, Plus, Promotion } from '@element-plus/icons-vue'
  import { CreateApp, DeleteApp, GetApp, ListApp, ListAppGroup, UpdateApp } from '@/api/manager/app/api'
  import { App, AppGroup, AppMiniProgram, AppSetting, CreateAppRequest, UpdateAppRequest } from '@/api/manager/app/type'
  import { GeneratePromptImage } from '@/api/ai-agent/generate/api'
  import { loadingService } from '@/utils'
  import { uploadFile } from '@/utils/resource/upload'
  import { imageToIco } from '@/utils/resource/image-to-ico'
  import { formatTime, parseTime } from '@/utils/time'
  import { rurl, resolveResourceUrl } from '@/utils/resource/url'
  import SeoPushDialog from './components/SeoPushDialog.vue'

  const router = useRouter()

  defineOptions({ name: 'App' })

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<App>>({})
  const seoPushVisible = ref(false)
  const seoPushApp = ref<App>()
  const domainRows = computed(() => currentData.value.domains ?? [])
  const miniProgramRows = computed(() => currentData.value.miniPrograms ?? [])

  const normalizeSetting = (setting?: AppSetting): AppSetting => {
    return {
      ...setting,
      jwt: {
        secret: setting?.jwt?.secret ?? '',
        expire: setting?.jwt?.expire ?? 3600,
        renewal: setting?.jwt?.renewal ?? 3600,
        uniqueDevice: setting?.jwt?.uniqueDevice ?? true,
        uniquePlatform: setting?.jwt?.uniquePlatform ?? true
      },
      web: { ...(setting?.web ?? {}) },
      // 默认密码已迁移至用户配置，编辑旧数据时回填 web.defaultPassword
      user: {
        defaultAvatar: setting?.user?.defaultAvatar ?? '',
        defaultPassword: setting?.user?.defaultPassword || setting?.web?.defaultPassword || ''
      },
      modules: [...(setting?.modules ?? [])],
      adminEmail: setting?.adminEmail ?? '',
      tracker: {
        enable: setting?.tracker?.enable ?? false,
        origins: [...(setting?.tracker?.origins ?? [])],
        maxPoints: setting?.tracker?.maxPoints ?? 0,
        conversionPoint: setting?.tracker?.conversionPoint ?? ''
      }
    }
  }

  const addDomain = () => {
    if (!currentData.value.domains) currentData.value.domains = []
    currentData.value.domains.push({ domain: '', isPrimary: currentData.value.domains.length === 0 })
  }

  const removeDomain = (index: number) => {
    currentData.value.domains?.splice(index, 1)
  }

  const addMiniProgram = () => {
    if (!currentData.value.miniPrograms) currentData.value.miniPrograms = []
    currentData.value.miniPrograms.push({ platform: 'mp-weixin', appId: '' })
  }

  const removeMiniProgram = (index: number) => {
    currentData.value.miniPrograms?.splice(index, 1)
  }

  const handleDomainPrimaryChange = (index: number) => {
    const rows = currentData.value.domains ?? []
    if (!rows[index]?.isPrimary) return
    rows.forEach((item, i) => {
      if (i !== index) item.isPrimary = false
    })
  }

  const groupList = ref<AppGroup[]>([])

  const appTypes = [
    { label: '基础设施', value: 'base' },
    { label: '标准应用', value: 'app' }
  ]

  // 基础设施应用选项（开通应用的可选项）
  const baseAppOptions = ref<{ label: string; value: string }[]>([])

  // 加载 type=base 的应用，作为开通应用选项
  const loadBaseApps = async () => {
    try {
      const res = await ListApp({ page: 1, pageSize: 50, type: 'base' })
      baseAppOptions.value = (res.list || []).map((item: App) => ({
        label: item.showName || item.name,
        value: item.keyword
      }))
    } catch {
      baseAppOptions.value = []
    }
  }

  // 搜索表单
  const searchForm = ref({
    query: undefined,
    groupId: undefined,
    status: undefined
  })

  const searchItems = computed(() => [
    {
      label: '应用名称/标识',
      key: 'query',
      type: 'input',
      props: { maxlength: '64', placeholder: '请输入应用名称或标识', clearable: true }
    },
    {
      label: '应用分组',
      key: 'groupId',
      type: 'select',
      props: {
        placeholder: '请选择应用分组',
        clearable: true,
        options: groupList.value.map((item) => ({ label: item.name, value: item.id }))
      }
    },
    {
      label: '应用状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择应用状态',
        clearable: true,
        options: [
          { label: '正常', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ])

  const formItems = computed(() => [
    {
      key: 'groupId',
      label: '应用分组',
      type: 'select',
      tip: '应用所属分组，用于管理端分类展示',
      props: {
        placeholder: '请选择应用分组',
        options: groupList.value.map((item) => ({ label: item.name, value: item.id })),
        rules: [{ required: true, message: '请选择应用分组', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'type',
      label: '应用类型',
      type: 'select',
      tip: 'base = 基础设施应用（供其他应用开通订阅）；app = 标准应用',

      props: {
        placeholder: '请选择应用类型',
        options: appTypes,
        rules: [{ required: true, message: '请选择应用类型', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'keyword',
      label: '应用标识',
      type: 'input',
      tip: '应用唯一标识，创建后不可修改',

      props: {
        placeholder: '请输入应用标识',
        disabled: dialogType.value === 'edit',
        rules: [
          { required: true, message: '请输入应用标识', trigger: ['blur', 'change'] },
          { type: 'string', message: '应用标识格式错误', pattern: /^[a-zA-Z_-][a-zA-Z0-9_-]*$/ }
        ]
      }
    },
    {
      key: 'name',
      label: '应用名称',
      type: 'input',
      tip: '应用名称，用于列表与识别的展示',

      props: {
        placeholder: '请输入应用名称',
        rules: [{ required: true, message: '请输入应用名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'showName',
      label: '展示名称',
      type: 'input',
      tip: '展示在登录页与首页的应用名称',

      props: {
        placeholder: '请输入展示名称',
        rules: [{ required: true, message: '请输入展示名称', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'logo',
      label: '应用logo',
      type: 'upload',
      tip: '应用 Logo，建议 256×256 正方形图片',

      // AI 生成（复用 ai-agent 的 app-logo 提示词，按应用名生成）
      suffix: {
        hidden: !currentData.value.name,
        icon: 'iconsys-mofa',
        tip: 'AI自动生成Logo',
        style: {
          color: '#9a6ce6'
        },
        onclick: () => {
          loadingService.apply(async () => {
            const data = await GeneratePromptImage({
              prompt: 'app-logo',
              variables: {
                query: currentData.value.name
              }
            })
            currentData.value.logo = data.list[0]
          }, '正在生成中，请稍等')
        }
      },

      props: {
        accept: 'image/*',
        selectFromFile: true,
        rules: [{ required: true, message: '请上传应用logo', trigger: ['blur', 'change'] }],
        directoryPath: 'manager/app/logo',
        cut: {
          enable: true,
          width: 256,
          height: 256
        }
      }
    },
    {
      key: 'favicon',
      label: '应用图标',
      type: 'upload',
      hidden: currentData.value.type === 'base',
      tip: '浏览器页签显示的图标（.ico 格式）；支持上传 png/jpg 自动转换为 128×128 ICO',

      // 同步：取当前应用 logo，转换 128×128 ICO 后重新上传为应用图标
      suffix: {
        hidden: !currentData.value.logo,
        icon: 'iconsys-fuzhi',
        tip: '从应用logo同步生成图标',
        style: {
          color: '#9a6ce6'
        },
        onclick: () => {
          loadingService.apply(async () => {
            // 1. 取应用 logo 图片内容：key 走服务端读流接口（对象存储未开 CORS，fetch 不能直连 302 目标）
            const key = currentData.value.logo as string
            const res = await fetch(resolveResourceUrl(`/resource/api/file/read-by-key?key=${key}`))
            if (!res.ok) {
              throw new Error('获取应用logo失败')
            }
            // 2. 转为 128×128 ICO
            const ico = await imageToIco(await res.blob(), 128)
            // 3. 重新上传（与上传组件同链路，返回可访问地址）
            const result = await uploadFile(new File([ico], 'favicon.ico', { type: 'image/x-icon' }), {
              path: 'manager/app/logo',
              name: 'favicon.ico'
            })
            // 统一存对象 key，避免 favicon 落成完整 URL
            currentData.value.favicon = result.key
          }, '正在同步应用图标，请稍等')
        }
      },

      props: {
        accept: 'image/*',
        convertToIco: true,
        rules: [{ required: true, message: '请上传应用图标', trigger: ['blur', 'change'] }],
        directoryPath: 'manager/app/logo'
      }
    },
    {
      key: 'private',
      label: '允许注册',
      type: 'select',
      placeholder: '请选择是否允许注册',
      hidden: currentData.value.type === 'base',
      tip: '是否允许用户通过该应用注册账户；禁止 = 仅允许已有账号登录',

      props: {
        rules: [{ required: true, message: '请选择是否允许注册', trigger: ['blur', 'change'] }],
        options: [
          { label: '允许', value: false },
          { label: '禁止', value: true }
        ]
      }
    },
    {
      key: 'loginable',
      label: '允许登录',
      type: 'select',
      placeholder: '请选择是否作为登录入口',
      hidden: currentData.value.type === 'base',
      tip: '是否作为登录入口；是 = 用户可通过该应用登录系统',

      props: {
        rules: [{ required: true, message: '请选择是否作为登录入口', trigger: ['blur', 'change'] }],
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    },
    {
      key: 'description',
      label: '应用描述',
      type: 'input',
      tip: '应用简介，展示在应用卡片与详情页',

      props: {
        placeholder: '请输入应用描述',
        type: 'textarea'
      }
    },
    {
      key: 'comment',
      label: '应用备注',
      type: 'input',
      tip: '内部备注，仅管理端可见',

      props: {
        placeholder: '请输入应用备注',
        type: 'textarea'
      }
    },
    {
      key: 'setting.modules',
      label: '开通应用',
      type: 'select',
      divider: '开通应用',
      hidden: currentData.value.type === 'base',
      tip: '开通的基础设施应用（type=base），用于菜单下发与接口鉴权',
      props: {
        placeholder: '请选择开通的基础设施应用',
        options: baseAppOptions.value,
        multiple: true,
        clearable: true
      }
    },
    {
      key: 'domains',
      label: '域名配置',
      type: 'input',
      divider: '站点配置',
      hidden: currentData.value.type === 'base',
      tip: '可绑定多个域名，每个应用最多设置一个主域名'
    },
    {
      key: 'miniPrograms',
      label: '小程序ID',
      type: 'input',
      hidden: currentData.value.type === 'base',
      tip: '绑定各小程序平台的 AppID，init 时会优先按平台 + AppID 识别应用'
    },
    {
      key: 'setting.web.copyright',
      label: '版权信息',
      type: 'input',
      hidden: currentData.value.type === 'base',
      tip: '显示在登录页和首页底部的版权信息，不输入则不显示',
      props: {
        placeholder: '请输入版权信息'
      }
    },
    {
      key: 'setting.web.watermark',
      label: '水印信息',
      type: 'input',
      hidden: currentData.value.type === 'base',
      tip: '显示在登录页和首页底部的水印信息，不输入则不显示',
      props: {
        placeholder: '请输入水印信息'
      }
    },
    {
      key: 'setting.adminEmail',
      label: '管理邮箱',
      type: 'input',
      hidden: currentData.value.type === 'base',
      tip: '用于接收应用相关的系统通知，例如告警和审核提醒',
      props: {
        placeholder: '请输入管理邮箱',
        maxlength: 255,
        clearable: true,
        rules: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.user.defaultAvatar',
      label: '默认头像',
      type: 'upload',
      divider: '用户配置',
      hidden: currentData.value.type === 'base',
      tip: '新建用户未设置头像以及用户头像为空时使用，不上传则不设置',
      props: {
        accept: 'image/*',
        selectFromFile: true,
        directoryPath: 'manager/app/avatar',
        cut: {
          enable: true,
          width: 256,
          height: 256
        }
      }
    },
    {
      key: 'setting.user.defaultPassword',
      label: '默认密码',
      type: 'input',
      hidden: currentData.value.type === 'base',
      tip: '新增用户未填写密码以及重置密码时使用',
      props: {
        type: 'password',
        showPassword: true,
        placeholder: '请输入默认密码',
        maxlength: 32,
        rules: [
          { required: true, message: '请输入默认密码', trigger: ['blur', 'change'] },
          { type: 'string', message: '密码最少6位数', min: 6 }
        ]
      }
    },
    {
      key: 'setting.jwt.secret',
      label: '授权密钥',
      type: 'input',
      divider: '授权配置',
      hidden: currentData.value.type === 'base',
      tip: 'JWT 签名密钥，用于生成与校验登录令牌',

      props: {
        placeholder: '请输入授权密钥 ',
        rules: [{ required: true, message: '请输入授权密钥', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.jwt.expire',
      label: '过期时间',
      type: 'number',
      hidden: currentData.value.type === 'base',
      defaultValue: 3600,
      tip: '令牌有效期（秒），到期后需重新登录',

      props: {
        placeholder: '请输入过期时间(秒)',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入过期时间(秒)', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.jwt.renewal',
      label: '续期时间',
      type: 'number',
      hidden: currentData.value.type === 'base',
      defaultValue: 3600,
      tip: '令牌到期前的续期窗口（秒），未到期前访问可自动续期',

      props: {
        placeholder: '请输入续期时间(秒)',
        style: { width: '100%' },
        rules: [{ required: true, message: '请输入续期时间(秒)', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.jwt.uniqueDevice',
      label: '唯一设备',
      type: 'select',
      hidden: currentData.value.type === 'base',
      tip: '开启后同一账号仅允许一个设备登录，新设备登录将使旧设备失效',

      props: {
        placeholder: '请选择是否开启唯一设备',
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ],
        rules: [{ required: true, message: '请选择是否开启唯一设备', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.jwt.uniquePlatform',
      label: '唯一平台',
      type: 'select',
      hidden: currentData.value.type === 'base',
      tip: '开启后同一账号仅允许一个平台登录，新平台登录将使旧平台失效',

      props: {
        placeholder: '请选择是否开启唯一平台',
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ],
        rules: [{ required: true, message: '请选择是否开启唯一平台', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'setting.tracker.enable',
      label: '点位采集',
      type: 'switch',
      divider: '点位分析',
      hidden: currentData.value.type === 'base',
      tip: '开启后允许该应用向 manager 上报页面访问和业务点位',
      props: {
        activeText: '开启',
        inactiveText: '关闭'
      }
    },
    {
      key: 'setting.tracker.origins',
      label: '上报来源',
      type: 'inputtag',
      hidden: currentData.value.type === 'base',
      tip: '按 scheme://host[:port] 配置，例如 https://asou.fun；为空表示不校验',
      props: {
        placeholder: '输入 Origin 后回车',
        clearable: true
      }
    },
    {
      key: 'setting.tracker.maxPoints',
      label: '注册上限',
      type: 'number',
      hidden: currentData.value.type === 'base',
      tip: '该应用最多自动注册的点位数；0 使用服务端默认值，服务端仍会按硬上限钳制',
      props: {
        min: 0,
        max: 2000,
        style: { width: '100%' },
        placeholder: '0 使用服务端默认值'
      }
    },
    {
      key: 'setting.tracker.conversionPoint',
      label: '转化点位',
      type: 'input',
      hidden: currentData.value.type === 'base',
      tip: '用于统计全站转化次数，例如 resource_netdisk_open；留空则不展示',
      props: {
        placeholder: '例如 resource_netdisk_open',
        maxlength: 128,
        clearable: true
      }
    }
  ])

  const operationItems = (record: App) => [
    {
      icon: 'iconsys-ziyuan1',
      label: '实体管理',
      color: 'primary',
      permission: 'manager:entity:query',
      click: async (record: App) => {
        router.push({
          name: 'Entity',
          query: {
            app: record.keyword
          }
        })
      }
    },
    {
      icon: 'iconsys-shaixuan',
      label: '规则管理',
      color: 'primary',
      permission: 'manager:entityrule:query',
      click: async (record: App) => {
        router.push({
          name: 'EntityRule',
          query: {
            app: record.keyword
          }
        })
      }
    },
    {
      icon: 'iconsys-anquan_2',
      label: '授权管理',
      color: 'primary',
      click: async (record: App) => {
        router.push({
          name: 'AppOAuther',
          query: {
            app: record.keyword
          }
        })
      }
    },
    {
      icon: Fold,
      label: '菜单管理',
      color: 'primary',
      permission: 'manager:menu:query',
      click: async (record: App) => {
        router.push({
          name: 'Menu',
          query: {
            app: record.keyword
          }
        })
      }
    },
    {
      icon: Promotion,
      label: 'SEO推送',
      color: 'primary',
      permission: 'manager:app:update',
      hide: !record.domains?.length,
      click: (row: App) => {
        seoPushApp.value = row
        seoPushVisible.value = true
      }
    },
    {
      icon: Edit,
      label: '修改应用',
      color: 'warning',
      permission: 'manager:app:update',
      click: async (record: App) => {
        // 查询详细应用信息
        const detail = await GetApp({ id: record.id })
        showDialog('edit', detail)
      }
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除应用',
      color: 'danger',
      permission: 'manager:app:delete',
      click: async (record: App) => {
        await DeleteApp({ id: record.id })
        refreshRemove()
      }
    }
  ]

  const table = useTable({
    core: {
      apiFn: ListApp,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          type: 'index',
          width: '60',
          label: '#'
        },
        {
          prop: 'logo',
          label: '应用Logo'
        },
        {
          prop: 'keyword',
          label: '应用标识'
        },
        {
          prop: 'name',
          label: '应用名称'
        },
        {
          prop: 'status',
          label: '应用状态'
        },
        {
          prop: 'comment',
          label: '应用备注'
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          sortable: true,
          formatter: (row: App) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '修改时间',
          sortable: true,
          formatter: (row: App) => formatTime(row.updatedAt)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right'
        }
      ]
    }
  })

  const {
    data: tableData,
    columnChecks,
    loading,
    pagination,
    searchParams,
    getData,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = table

  const appList = computed(() => tableData.value as App[])

  const loadGroups = async () => {
    const res = await ListAppGroup()
    groupList.value = res.list || []
  }

  // 搜索处理
  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  // 显示用户弹窗
  const showDialog = (type: Form.DialogType, row?: App): void => {
    dialogType.value = type
    currentData.value = row
      ? {
          ...row,
          setting: normalizeSetting(row.setting),
          domains: (row.domains ?? []).map((item) => ({ ...item })),
          miniPrograms: (row.miniPrograms ?? []).map((item) => ({ ...item }))
        }
      : {
          groupId: groupList.value[0]?.id,
          setting: normalizeSetting(),
          domains: [{ domain: '', isPrimary: true }],
          miniPrograms: []
        }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  // 处理弹窗提交事件
  const handleSubmit = async () => {
    const value = { ...currentData.value }
    value.domains = (value.domains ?? [])
      .map((item) => ({ domain: item.domain.trim(), isPrimary: item.isPrimary }))
      .filter((item) => item.domain)
    value.miniPrograms = (value.miniPrograms ?? [])
      .map((item) => ({ appId: item.appId.trim(), platform: item.platform.trim() }))
      .filter((item): item is AppMiniProgram => Boolean(item.appId && item.platform))
    if (dialogType.value === 'add') {
      await CreateApp(value as CreateAppRequest)
      ElMessage.success('创建成功')
      refreshCreate()
    } else {
      await UpdateApp(value as UpdateAppRequest)
      ElMessage.success('修改成功')
      refreshUpdate()
    }
    dialogVisible.value = false
  }

  const handleJumpGroup = () => router.push({ name: 'AppGroup' })

  const handleUpdateStatus = (item: App): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        if (item.status) {
          ElMessageBox.prompt('请输入禁用原因', '温馨提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValidator: (value) => value.length > 5,
            inputErrorMessage: '原因不能少于5个字符'
          })
            .then(async ({ value }) => {
              await UpdateApp({ id: item.id, status: !item.status, reason: value })
              ElMessage.success('禁用成功')
              refreshUpdate()
              resolve(true)
            })
            .catch(() => {
              resolve(false)
            })
        } else {
          ElMessageBox.confirm('您确定修改应用状态？', '温馨提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(async () => {
              await UpdateApp({ id: item.id, status: !item.status, reason: '' })
              ElMessage.success('启用成功')
              refreshUpdate()
              resolve(true)
            })
            .catch(() => {
              resolve(false)
            })
        }
      })
    }
  }

  const getResourceUrl = (key: string, width = 100, height = 100) => rurl(key, width, height)

  const getAppInitial = (item: App) => (item.showName || item.name || item.keyword || 'A').slice(0, 1).toUpperCase()

  const getAppTypeLabel = (type?: string) => appTypes.find((item) => item.value === type)?.label || type || '标准应用'

  const getGroupName = (id?: number) => groupList.value.find((item) => item.id === id)?.name || '-'

  const getRegisterLabel = (item: App) => {
    if (item.type === 'base') return '不适用'
    if (item.private === undefined) return '-'
    return item.private ? '禁止' : '允许'
  }

  const getLogoClass = (item: App) => {
    const index = Math.abs(item.id || 0) % 6
    return `is-tone-${index}`
  }

  const formatCardTime = (time: number) => parseTime(time, '{y}-{m}-{d}') || formatTime(time)

  onMounted(async () => {
    await Promise.all([loadGroups(), loadBaseApps()])
  })
</script>

<style lang="scss" scoped>
  :deep(.table) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .app-card-scroll {
    flex: 1;
    min-height: 0;
    padding-right: 4px;
    margin-top: 12px;
    overflow-y: auto;
  }

  .app-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .app-card {
    display: flex;
    flex-direction: column;
    min-height: 216px;
    padding: 18px;
    background: var(--art-main-bg-color);
    border: 1px solid var(--art-border-color);
    border-radius: 8px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;

    &:hover {
      border-color: rgba(var(--art-primary), 0.45);
      box-shadow: var(--art-root-card-box-shadow);
    }

    &__top {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr) 32px;
      gap: 14px;
      align-items: flex-start;
    }

    &__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      overflow: hidden;
      font-size: 14px;
      font-weight: 700;
      color: rgb(var(--art-primary));
      background: rgb(var(--art-bg-primary));
      border-radius: 8px;

      :deep(.el-image) {
        width: 100%;
        height: 100%;
      }

      :deep(.el-image__error) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: inherit;
        color: inherit;
        background: transparent;
      }

      &.is-tone-1 {
        color: rgb(var(--art-success));
        background: rgb(var(--art-bg-success));
      }

      &.is-tone-2 {
        color: rgb(var(--art-warning));
        background: rgb(var(--art-bg-warning));
      }

      &.is-tone-3 {
        color: rgb(var(--art-secondary));
        background: rgb(var(--art-bg-secondary));
      }

      &.is-tone-4 {
        color: rgb(var(--art-error));
        background: rgb(var(--art-bg-error));
      }

      &.is-tone-5 {
        color: rgb(var(--art-info));
        background: rgb(var(--art-bg-info));
      }
    }

    &__title {
      min-width: 0;

      h2 {
        margin: 0;
        overflow: hidden;
        font-size: 14px;
        font-weight: 700;
        line-height: 22px;
        color: var(--art-gray-900);
        text-overflow: ellipsis;
        letter-spacing: 0;
        white-space: nowrap;
      }

      p {
        display: -webkit-box;
        margin: 2px 0 0;
        overflow: hidden;
        font-size: 13px;
        font-weight: 400;
        line-height: 19px;
        color: var(--art-gray-600);
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    &__more {
      --el-button-border-color: transparent;
      --el-button-bg-color: transparent;
      --el-button-hover-border-color: transparent;
      --el-button-hover-bg-color: rgba(var(--art-gray-200-rgb), 0.72);
      --el-button-active-border-color: transparent;
      --el-button-active-bg-color: rgba(var(--art-gray-200-rgb), 0.72);

      width: 32px !important;
      height: 32px !important;
      color: var(--art-gray-500);
      border-color: transparent !important;
      border-radius: 6px;
      box-shadow: none !important;

      &:hover,
      &:focus,
      &:focus-visible,
      &:active {
        color: var(--art-gray-500);
        border-color: transparent !important;
        outline: none;
        box-shadow: none !important;
      }

      &:focus-visible {
        outline: none !important;
      }

      &:hover,
      &:active {
        background: rgba(var(--art-gray-200-rgb), 0.72) !important;
      }

      :deep(span) {
        outline: none !important;
        box-shadow: none !important;
      }
    }

    &__logo-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-size: 18px;
      font-weight: 700;
    }

    &__meta {
      display: grid;
      gap: 8px;
      padding: 14px 0;
      margin: 14px 0 0;

      div {
        display: grid;
        grid-template-columns: 74px minmax(0, 1fr);
        gap: 8px;
        align-items: center;
      }

      dt,
      dd {
        min-width: 0;
        margin: 0;
        font-size: 13px;
        line-height: 19px;
      }

      dt {
        color: var(--art-gray-500);
      }

      dd {
        overflow: hidden;
        font-weight: 400;
        color: var(--art-gray-700);
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 14px;
      margin-top: auto;
      border-top: 1px solid var(--art-border-color);
    }
  }

  @media (max-width: $device-notebook) {
    .app-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: $device-ipad-pro) {
    .app-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: $device-phone) {
    .app-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .app-card {
      padding: 16px;

      &__top {
        grid-template-columns: 48px minmax(0, 1fr) 32px;
        gap: 12px;
      }

      &__logo {
        width: 48px;
        height: 48px;
      }
    }
  }

  .app-pagination {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .domain-editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .domain-row {
    display: flex;
    gap: 10px;
    align-items: center;

    :deep(.el-input) {
      flex: 1;
      min-width: 0;
    }

    :deep(.el-checkbox) {
      flex-shrink: 0;
    }
  }
</style>
