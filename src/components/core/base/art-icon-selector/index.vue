<!-- 图标选择器 -->
<template>
  <div class="icon-selector">
    <div
      class="select"
      @click="handleClick"
      :style="{ width: props.width }"
      :class="[size, { 'is-disabled': disabled }, { 'has-icon': selectValue }]"
    >
      <div class="icon" v-if="selectValue">
        <ArtIcon :value="selectValue" :size="16" />
      </div>
      <div class="text" v-if="!selectValue"> {{ props.placeholder }} </div>
      <div class="arrow">
        <i class="iconfont-sys arrow-icon">&#xe709;</i>
        <i class="iconfont-sys clear-icon" @click.stop="clearIcon">&#xe83a;</i>
      </div>
    </div>

    <ElDialog title="选择图标" :width="mergedMode ? '760px' : '40%'" v-model="visible" align-center @open="handleOpen">
      <!-- 系统图标 + 通用图标合并：左侧搜索/分类，右侧图标网格 -->
      <div v-if="mergedMode" class="icon-picker">
        <aside class="picker-side">
          <ElInput v-model="query" class="picker-search" placeholder="搜索图标" clearable />
          <ElScrollbar class="picker-categories">
            <ul>
              <li :class="{ active: activeCategory === ALL_CATEGORY }" @click="activeCategory = ALL_CATEGORY">
                全部图标
              </li>
              <li :class="{ active: activeCategory === SYSTEM_CATEGORY }" @click="activeCategory = SYSTEM_CATEGORY">
                系统图标
              </li>
              <li v-if="iconifyLoading" class="picker-tip">通用图标加载中…</li>
              <li v-if="iconifyCategories.length" class="picker-divider"></li>
              <li
                v-for="item in iconifyCategories"
                :key="item.value"
                :class="{ active: activeCategory === item.value }"
                @click="activeCategory = item.value"
              >
                {{ item.label }}
              </li>
            </ul>
          </ElScrollbar>
        </aside>

        <section class="picker-main">
          <ElScrollbar height="100%">
            <ul class="icons-list">
              <li
                v-for="item in pickerItems"
                :key="item.key"
                :title="item.name"
                :class="{ 'is-selected': item.value === selectValue }"
                @click="applyIcon(item.value)"
              >
                <ArtIcon v-if="item.type === 'mdi'" :value="item.value" :size="22" />
                <i v-else-if="item.icon" :class="`iconfont-sys ${item.icon.className}`"></i>
              </li>
            </ul>
            <ElEmpty v-if="!iconifyLoading && pickerItems.length === 0" description="没有匹配的图标" />
            <div v-else-if="mdiTruncated" class="iconify-tip">
              仅展示前 {{ ICONIFY_LIMIT }} 个，输入关键字继续筛选
            </div>
          </ElScrollbar>
        </section>
      </div>

      <ElScrollbar v-else height="400px">
        <ul class="icons-list">
          <li v-for="icon in iconsList" :key="icon.className" @click="selectorIcon(icon)">
            <i :class="`iconfont-sys ${icon.className}`" v-show="iconType === IconTypeEnum.CLASS_NAME"></i>
            <i class="iconfont-sys" v-html="icon.unicode" v-show="iconType === IconTypeEnum.UNICODE"></i>
          </li>
        </ul>
      </ElScrollbar>

      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="visible = false">取 消</ElButton>
          <ElButton type="primary" @click="visible = false">确 定</ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'

  import ArtIcon from '@/components/core/base/art-icon/index.vue'
  import { IconTypeEnum } from '@/enums/appEnum'
  import { extractIconClasses, type IconfontType } from '@/utils/constants'
  import { loadMdiIcons } from '@/utils/iconify'

  defineOptions({ name: 'ArtIconSelector' })

  // 组件大小类型
  type ComponentSize = 'large' | 'default' | 'small'

  // Props 接口定义
  interface Props {
    /** 图标类型 */
    iconType?: IconTypeEnum
    /** v-model 绑定的图标值 */
    modelValue?: string
    /** 未选择图标时的占位文案 */
    placeholder?: string
    /** 组件宽度 */
    width?: string
    /** 组件大小 */
    size?: ComponentSize
    /** 是否禁用 */
    disabled?: boolean
    /** 是否启用 Iconify 通用图标库 */
    enableIconify?: boolean
  }

  // Emits 接口定义
  interface Emits {
    'update:modelValue': [value: string]
    getIcon: [value: string]
  }

  // 使用 withDefaults 定义 props
  const props = withDefaults(defineProps<Props>(), {
    iconType: IconTypeEnum.CLASS_NAME,
    modelValue: '',
    placeholder: '请选择图标',
    width: '200px',
    size: 'default',
    disabled: false,
    enableIconify: false
  })

  // 定义 emits
  const emits = defineEmits<Emits>()

  // 左侧分类固定项
  const ALL_CATEGORY = ''
  const SYSTEM_CATEGORY = '__system__'

  // 图标网格条目
  interface PickerItem {
    key: string
    name: string
    value: string
    type: 'system' | 'mdi'
    icon?: IconfontType
  }

  // 响应式数据
  const selectValue = ref<string>(props.modelValue)
  const visible = ref<boolean>(false)
  const query = ref<string>('')
  const activeCategory = ref<string>(ALL_CATEGORY)

  // 图标列表 - 使用计算属性优化性能
  const iconsList = computed<IconfontType[]>(() => extractIconClasses())

  // 系统图标与通用图标合并展示，仅 class 类型图标支持 Iconify
  const mergedMode = computed(() => props.enableIconify && props.iconType === IconTypeEnum.CLASS_NAME)

  // 系统图标条目
  const systemItems = computed<PickerItem[]>(() =>
    iconsList.value.map((icon) => ({
      key: `system-${icon.className}`,
      name: icon.className,
      value: icon.className,
      type: 'system',
      icon
    }))
  )

  // Iconify 通用图标库
  const ICONIFY_LIMIT = 300
  const iconifyLoading = ref(false)
  const iconifyLoaded = ref(false)
  const iconifyNames = ref<string[]>([])
  const iconifyCategories = ref<{ label: string; value: string; icons: string[] }[]>([])

  const normalizedQuery = computed(() => query.value.trim().toLowerCase())

  // 当前分类下的通用图标（未截断）
  const mdiSource = computed<string[]>(() => {
    if (!mergedMode.value) return []
    const category = activeCategory.value
    if (category === SYSTEM_CATEGORY) return []
    const list =
      category === ALL_CATEGORY
        ? iconifyNames.value
        : iconifyCategories.value.find((item) => item.value === category)?.icons || []
    const keyword = normalizedQuery.value
    return keyword ? list.filter((name) => name.includes(keyword)) : list
  })

  const mdiTruncated = computed(() => mdiSource.value.length > ICONIFY_LIMIT)

  // 左侧分类与搜索命中的图标集合
  const pickerItems = computed<PickerItem[]>(() => {
    if (!mergedMode.value) return []
    const category = activeCategory.value
    const keyword = normalizedQuery.value

    // 系统图标：按 class 名称过滤
    const system =
      category === ALL_CATEGORY || category === SYSTEM_CATEGORY
        ? systemItems.value.filter((item) => !keyword || item.name.toLowerCase().includes(keyword))
        : []

    // 通用图标：按当前分类与关键字过滤，超出上限只展示前 300 个
    const mdi = mdiSource.value.slice(0, ICONIFY_LIMIT).map<PickerItem>((name) => ({
      key: `mdi-${name}`,
      name,
      value: `mdi:${name}`,
      type: 'mdi'
    }))

    return [...system, ...mdi]
  })

  // 选择系统图标
  const selectorIcon = (icon: IconfontType): void => {
    const iconValue = props.iconType === IconTypeEnum.CLASS_NAME ? icon.className : icon.unicode || ''
    applyIcon(iconValue)
  }

  // 回填并关闭弹窗
  const applyIcon = (iconValue: string): void => {
    selectValue.value = iconValue
    visible.value = false
    emits('update:modelValue', iconValue)
    emits('getIcon', iconValue)
  }

  // 懒加载 Iconify 图标库
  const ensureIconify = async (): Promise<void> => {
    if (!props.enableIconify || iconifyLoaded.value || iconifyLoading.value) return
    iconifyLoading.value = true
    try {
      const data = await loadMdiIcons()
      iconifyNames.value = data.names
      iconifyCategories.value = Object.entries(data.categories)
        .map(([label, icons]) => ({ label, value: label, icons }))
        .sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'))
      iconifyLoaded.value = true
    } catch (error) {
      console.error('加载 Iconify 图标库失败', error)
      ElMessage.error('图标库加载失败')
    } finally {
      iconifyLoading.value = false
    }
  }

  // 监听 modelValue 变化
  watch(
    () => props.modelValue,
    (newVal: string) => {
      selectValue.value = newVal
      if (props.enableIconify && newVal.startsWith('mdi:')) {
        void ensureIconify()
      }
    },
    { immediate: true }
  )

  // 打开弹窗时加载通用图标库
  const handleOpen = (): void => {
    if (mergedMode.value) {
      void ensureIconify()
    }
  }

  // 处理点击事件
  const handleClick = (): void => {
    if (!props.disabled) {
      visible.value = true
    }
  }

  // 清除图标
  const clearIcon = (): void => {
    selectValue.value = ''
    emits('update:modelValue', '')
    emits('getIcon', '')
  }

  // 计算属性：当前图标类型（用于模板中的判断）
  const iconType = computed<IconTypeEnum>(() => props.iconType)
</script>

<style lang="scss" scoped>
  .icon-selector {
    width: 100%;

    .select {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--el-component-custom-height);
      padding: 0 11px;
      cursor: pointer;
      border: 1px solid var(--art-border-dashed-color);
      border-radius: calc(var(--custom-radius) / 3 + 2px) !important;
      transition: border 0.3s;

      @media (width <= 500px) {
        width: 100% !important;
      }

      &.large {
        height: 40px;
      }

      &.small {
        height: 24px;
      }

      &:hover:not(.is-disabled).has-icon {
        .arrow-icon {
          display: none;
        }

        .clear-icon {
          display: block !important;
        }
      }

      &:hover {
        border-color: var(--art-text-gray-400);
      }

      .icon {
        display: flex;
        align-items: center;
        width: 20px;
        font-size: 16px;
        color: var(--art-gray-700);

        :deep(svg) {
          width: 16px;
          height: 16px;
        }

        i {
          display: block;
          margin: 0;
          font-size: 16px;
        }
      }

      .text {
        flex: 1;
        width: auto;
        font-size: 14px;
        color: var(--el-text-color-placeholder);
        text-align: left;

        @include ellipsis();

        @media (width <= 500px) {
          display: none;
        }
      }

      .arrow {
        display: flex;
        align-items: center;
        height: calc(100% - 2px);

        i {
          font-size: 13px;
          color: var(--art-gray-600);
        }

        .clear-icon {
          display: none;
        }
      }

      &.is-disabled {
        cursor: not-allowed;
        background-color: var(--el-disabled-bg-color);
        border-color: var(--el-border-color-lighter);

        .icon,
        .text,
        .arrow {
          color: var(--el-text-color-placeholder);
        }

        &:hover {
          border-color: var(--el-border-color-lighter);
        }
      }
    }

    .icon-picker {
      display: flex;
      gap: 12px;
      height: 420px;
    }

    .picker-side {
      box-sizing: border-box;
      display: flex;
      flex: none;
      flex-direction: column;
      width: 180px;
      height: 100%;
      padding-right: 12px;
      border-right: 1px solid var(--art-border-color);
    }

    .picker-search {
      flex: none;
      margin-bottom: 10px;
    }

    .picker-categories {
      flex: 1;
      min-height: 0;

      ul {
        padding-right: 4px;
      }

      li {
        padding: 7px 10px;
        margin-bottom: 2px;
        font-size: 13px;
        color: var(--art-gray-700);
        cursor: pointer;
        border-radius: calc(var(--custom-radius) / 3 + 2px);

        &:hover {
          background: var(--art-gray-100);
        }

        &.active {
          font-weight: 500;
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
      }

      .picker-divider {
        height: 1px;
        padding: 0;
        margin: 8px 4px;
        pointer-events: none;
        background: var(--art-border-color);
      }

      .picker-tip {
        padding: 6px 10px;
        font-size: 12px;
        color: var(--art-gray-500);
        pointer-events: none;
      }
    }

    .picker-main {
      flex: 1;
      min-width: 0;
      height: 100%;
    }

    .iconify-tip {
      padding: 8px 0;
      font-size: 12px;
      color: var(--art-gray-500);
      text-align: center;
    }

    .icons-list {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      border-top: 1px solid var(--art-border-color);
      border-left: 1px solid var(--art-border-color);

      li {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        aspect-ratio: 1 / 1;
        color: var(--art-gray-600);
        text-align: center;
        cursor: pointer;
        border-right: 1px solid var(--art-border-color);
        border-bottom: 1px solid var(--art-border-color);

        &:hover {
          background: var(--art-gray-100);
        }

        &.is-selected {
          background: var(--el-color-primary-light-9);

          i,
          :deep(svg) {
            color: var(--el-color-primary);
          }
        }

        i {
          font-size: 22px;
          color: var(--art-gray-800);
        }

        :deep(svg) {
          width: 22px;
          height: 22px;
          margin: 0 auto;
          color: var(--art-gray-800);
        }
      }
    }
  }
</style>
