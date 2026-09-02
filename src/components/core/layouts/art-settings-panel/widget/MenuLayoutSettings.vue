<template>
  <div v-if="width > 1000">
    <SectionTitle title="菜单布局" />
    <div class="setting-box-wrap">
      <div
        class="setting-item"
        v-for="(item, index) in configOptions.menuLayoutList"
        :key="item.value"
        @click="switchMenuLayouts(item.value)"
      >
        <div class="box" :class="{ 'is-active': item.value === menuType, 'mt-16': index > 2 }">
          <img :src="item.img" />
        </div>
        <p class="name">{{ menuLayoutNames[index] }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import SectionTitle from './SectionTitle.vue'
  import { useSettingStore } from '@/store/modules/setting'
  import { useSettingsConfig } from '../composables/useSettingsConfig'
  import { useSettingsState } from '../composables/useSettingsState'

  // 菜单布局中文名称，下标与 configOptions.menuLayoutList 一一对应
  const menuLayoutNames = ['垂直', '水平', '混合', '双列']

  const { width } = useWindowSize()
  const settingStore = useSettingStore()
  const { menuType } = storeToRefs(settingStore)
  const { configOptions } = useSettingsConfig()
  const { switchMenuLayouts } = useSettingsState()
</script>
