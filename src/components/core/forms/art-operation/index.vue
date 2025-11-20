<!-- 更多按钮 -->
<template>
  <div class="btn-more">
    <ElDropdown v-if="single || rl.length > 1">
      <template v-if="$slots.default">
        <slot></slot>
      </template>
      <ArtButtonTable v-else type="more" :iconBgColor="!hasBackground ? 'transparent' : ''" />
      <template #dropdown>
        <ElDropdownMenu>
          <template v-for="(item, index) in rl" :key="index">
            <ElDropdownItem
              v-if="!item.hide"
              :disabled="item.disabled"
              @click="onClick(item)"
              class="custom-dropdown-item"
            >
              <div class="dropdown-item-content">
                <ArtIcon
                  :value="item.icon"
                  :size="15"
                  :style="{
                    color: item.iconColor || item.color || getTypeColor(item.type),
                    margin: 0
                  }"
                />
                <span :style="{ color: item.color || getTypeColor(item.type) }">{{ item.label }}</span>
              </div>
            </ElDropdownItem>
          </template>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
    <div v-else style="text-align: center">
      <template v-for="(item, index) in rl" :key="index">
        <div class="custom-el-button">
          <ElButton
            :icon="item.icon"
            :color="item.color"
            :type="item.type ? item.type : 'primary'"
            plain
            @click="onClick(item)"
          ></ElButton>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { usePermission } from '@/composables/usePermission'
  import { ElMessageBox } from 'element-plus'

  defineOptions({ name: 'ArtOperation' })

  const { hasPermission } = usePermission()

  import { markRaw } from 'vue'

  type ButType = 'primary' | 'success' | 'info' | 'warning' | 'danger'
  export interface OperationItem {
    /** 按钮文本 */
    label: string
    /** 是否隐藏 */
    hide?: boolean
    /** 是否禁用 */
    disabled?: boolean
    /** 权限标识 */
    permission?: string
    /** 图标组件 */
    icon?: any
    /** 按钮类型 */
    type?: ButType
    /** 文本颜色 */
    color?: string
    /** 图标颜色（优先级高于 color） */
    iconColor?: string
    /** 弹窗确认 */
    popConfirm?: boolean
    /** 弹窗标题 */
    popTitle?: string
    /** 点击事件 */
    click?: (data: any) => void
  }

  interface Props {
    /** 下拉项列表 */
    list: OperationItem[]
    /** 额外数据 */
    data: any
    /** 整体权限控制 */
    permission?: string
    /** 是否显示背景 */
    hasBackground?: boolean
    /** 是否展示单个按钮 */
    single?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    hasBackground: true,
    popConfirm: false
  })

  const onClick = (item: OperationItem) => {
    if (!item.click) return
    if (!item.popConfirm) {
      item.click(props.data)
      return
    }
    const title = item.popTitle ? item.popTitle : '您确定要' + item.label + '？'
    ElMessageBox.confirm(title, '温馨提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      item.click?.(props.data)
    })
  }

  const rl = ref<OperationItem[]>([])

  const getTypeColor = (type?: ButType) => {
    switch (type) {
      case 'primary':
        return 'var(--el-color-primary)'
      case 'success':
        return 'var(--el-color-success)'
      case 'info':
        return 'var(--el-color-info)'
      case 'warning':
        return 'var(--el-color-warning)'
      case 'danger':
        return 'var(--el-color-danger)'
      default:
        return ''
    }
  }

  watch(
    () => props.list,
    (val) => {
      rl.value = []

      if (!val) return

      if (props.permission && !hasPermission(props.permission)) return

      val.forEach((item: OperationItem) => {
        const types = ['primary', 'success', 'info', 'warning', 'danger']
        if (types.includes(item.color || '')) {
          if (types.includes(item.color || '')) {
            item.type = item.color as ButType
            item.color = ''
          }
        }

        if (item.icon) {
          item.icon = markRaw(item.icon)
        }

        if (!item.permission) {
          rl.value.push(item)
          return
        }
        if (hasPermission(item.permission)) {
          rl.value.push(item)
        }
      })
    },
    { immediate: true }
  )
</script>

<style lang="scss" scoped>
  .btn-more {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dropdown-item-content {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .custom-el-button {
    :deep(.el-button) {
      width: 32px !important;
      height: 32px !important;
      padding: 8px;
    }
  }
</style>
