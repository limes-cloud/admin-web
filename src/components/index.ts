import { App } from 'vue'

import SQLBuilder from '@/components/core/base/art-sql-builder/index.vue'
export default {
  install(Vue: App) {
    Vue.component('ArtSQLBuilder', SQLBuilder)
  }
}
