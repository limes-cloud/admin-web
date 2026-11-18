<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <div class="cv-head">
              <div class="cv-back" @click="router.push({ path: '/cron/chain' })">
                <ElIcon><ArrowLeft /></ElIcon>
              </div>
              <span class="cv-title">{{ chain?.name }} 的版本</span>
            </div>
          </template>
        </ArtTableHeader>
        <ArtTable
          :loading="loading"
          :data="data"
          :columns="columns"
          :pagination="pagination"
          row-key="id"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #version="{ row }">
            <span>v{{ row.version }}</span>
            <ElTag v-if="row.current" size="small" type="success" class="cv-tag">生效中</ElTag>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationsFor(row)" :data="row" />
          </template>
        </ArtTable>
      </div>
    </ElCard>

    <ElDialog
      v-model="viewVisible"
      :title="`查看 v${viewVersion?.version || ''}`"
      width="80%"
      top="5vh"
      destroy-on-close
      class="cv-view-dialog"
      @opened="viewCanvasRef?.refresh()"
    >
      <div class="cv-canvas">
        <ChainCanvas v-if="viewRule" ref="viewCanvasRef" :rule="viewRule" :plugins="viewPlugins" readonly fit />
      </div>
      <template #footer>
        <ElButton @click="viewVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="viewVersion && editFrom(viewVersion)">编辑</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="diffVisible" :title="diffTitle" width="85%" top="5vh" destroy-on-close>
      <MonacoEditor diff language="json" :original="diffLeft" :model-value="diffRight" read-only height="70vh" />
    </ElDialog>

    <ChainEditorDialog v-model="editorVisible" :chain-id="chainId" :version-id="editorVersionId" @saved="refreshData" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ArrowLeft, EditPen, Select, Switch, View } from '@element-plus/icons-vue'
  import { useTable } from '@/composables/useTable'
  import { GetChain, GetChainVersion, ListChainVersion, SwitchChainVersion } from '@/api/cron/chain/api'
  import type { ChainInfo, ChainVersion } from '@/api/cron/chain/type'
  import ChainCanvas from './components/graph/ChainCanvas.vue'
  import MonacoEditor from './components/MonacoEditor.vue'
  import ChainEditorDialog from './components/ChainEditorDialog.vue'
  import { parseRule } from './components/graph/flow-convert'
  import { fillMissingPositions } from './components/graph/layout'
  import type { Rule } from './types/dsl'
  import { formatTs, pretty } from './utils/format'
  import { pluginBriefsFor } from './utils/options'
  import type { PluginBrief } from './types/graph'

  defineOptions({ name: 'CronChainVersion' })

  const route = useRoute()
  const router = useRouter()
  const chainId = Number(route.query.id)
  const chain = ref<ChainInfo>()

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshUpdate
  } = useTable({
    core: {
      apiFn: ListChainVersion,
      apiParams: { chainId, page: 1, pageSize: 10 },
      columnsFactory: () => [
        { prop: 'version', label: '版本', width: 160, useSlot: true, slotName: 'version' },
        { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true },
        { prop: 'createdAt', label: '创建时间', width: 170, formatter: (row: ChainVersion) => formatTs(row.createdAt) },
        { prop: 'operation', label: '操作', fixed: 'right', width: 120, useSlot: true, slotName: 'operation' }
      ]
    }
  })

  onMounted(async () => {
    if (!chainId) {
      router.replace({ path: '/cron/chain' })
      return
    }
    await loadChain()
  })

  async function loadChain() {
    const res = await GetChain({ id: chainId })
    chain.value = res.chain
  }

  function operationsFor(row: ChainVersion) {
    return [
      { icon: View, label: '查看', click: () => view(row) },
      {
        icon: Select,
        label: '使用',
        color: 'success',
        hide: row.current,
        popConfirm: true,
        popTitle: `将 v${row.version} 设为生效版本？已有运行不受影响。`,
        permission: 'cron:chain_version:switch',
        click: async () => {
          await SwitchChainVersion({ chainId, versionId: row.id })
          ElMessage.success('已切换生效版本')
          await loadChain()
          refreshUpdate()
        }
      },
      {
        icon: Switch,
        label: '对比',
        hide: row.current || !chain.value?.currentVersion,
        click: () => openDiff(row)
      },
      { icon: EditPen, label: '编辑', color: 'primary', click: () => editFrom(row) }
    ].filter((i) => !i.hide)
  }

  // ---------- 查看 ----------

  const viewVisible = ref(false)
  const viewVersion = ref<ChainVersion>()
  const viewRule = ref<Rule>()
  const viewPlugins = ref<PluginBrief[]>([])
  const viewCanvasRef = ref<InstanceType<typeof ChainCanvas>>()

  async function view(row: ChainVersion) {
    viewVersion.value = row
    viewRule.value = undefined
    viewVisible.value = true
    const v = await GetChainVersion({ id: row.id })
    const r = parseRule(v.rule)
    fillMissingPositions(r)
    viewPlugins.value = await pluginBriefsFor(r)
    viewRule.value = r
  }

  // 以某版本为底全屏编辑；保存后刷新版本列表
  const editorVisible = ref(false)
  const editorVersionId = ref<number>()

  function editFrom(row: ChainVersion) {
    viewVisible.value = false
    editorVersionId.value = row.id
    editorVisible.value = true
  }

  // ---------- 对比 ----------

  const diffVisible = ref(false)
  const diffLeft = ref('')
  const diffRight = ref('')
  const diffTitle = ref('版本对比')

  /** 对比时去掉画布元数据，只比较规则本身 */
  function ruleText(raw: string): string {
    try {
      const r = JSON.parse(raw)
      delete r.ui
      return pretty(r)
    } catch {
      return raw
    }
  }

  /** 与使用中的版本对比：左侧使用中，右侧所选版本 */
  async function openDiff(row: ChainVersion) {
    const cur = chain.value
    if (!cur?.currentVersion) return
    const [a, b] = await Promise.all([GetChainVersion({ id: cur.currentVersion }), GetChainVersion({ id: row.id })])
    diffTitle.value = `对比 v${cur.currentVersionNo}（使用中）→ v${row.version}`
    diffLeft.value = ruleText(a.rule)
    diffRight.value = ruleText(b.rule)
    diffVisible.value = true
  }
</script>

<style scoped lang="scss">
  // ArtTableHeader 的 left 区只有 flex 没有垂直居中，标题文字会贴顶，和按钮不在一条线上
  .cv-head {
    display: flex;
    align-items: center;
  }

  // 返回按钮：与右侧工具栏按钮（ArtTableHeader .btn）同尺寸同样式
  .cv-back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-right: 12px;
    font-size: 16px;
    color: var(--art-gray-700);
    cursor: pointer;
    background-color: rgba(var(--art-gray-200-rgb), 0.8);
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
      color: var(--art-gray-800);
      background-color: rgba(var(--art-gray-300-rgb), 0.75);
    }
  }

  .cv-title {
    margin-right: 12px;
    font-weight: 500;
  }

  .cv-tag {
    margin-left: 6px;
  }

  .cv-canvas {
    height: 70vh;
  }
</style>

<style lang="scss">
  // 查看弹窗关闭全局缩放入场动画：画布在缩放中测量端口位置会算错（含祖先 transform），连线端点偏离节点
  .dialog-fade-enter-active .el-dialog.cv-view-dialog,
  .dialog-fade-leave-active .el-dialog.cv-view-dialog {
    animation: none;
  }
</style>
