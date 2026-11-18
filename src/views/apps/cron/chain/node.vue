<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="resetSearchParams"
        />
      </div>
      <div class="table">
        <ArtTableHeader :loading="loading" @refresh="refreshData">
          <template #left>
            <ElButton :icon="FolderOpened" @click="groupVisible = true">分组管理</ElButton>
            <ElButton
              v-permission="'cron:chain_node:add'"
              v-ripple
              type="primary"
              :icon="Plus"
              @click="showDialog('add')"
            >
              新增插件
            </ElButton>
          </template>
        </ArtTableHeader>
        <div class="ct-card-scroll">
          <ElEmpty v-if="!loading && !data.length" description="暂无插件" />

          <div v-else v-loading="loading" class="ct-grid">
            <article v-for="row in data" :key="row.id" class="ct-card">
              <div class="ct-card__top">
                <span class="ct-card__logo" :style="{ background: row.iconBg || ICON_BG_DEFAULT }">
                  <ArtIcon v-if="row.icon" :value="row.icon" :size="30" />
                  <ElIcon v-else><Box /></ElIcon>
                </span>
                <div class="ct-card__title">
                  <h2 :title="row.name">{{ row.name }}</h2>
                  <p :title="row.description || ''">{{ row.description || '暂无描述' }}</p>
                </div>
                <ArtOperation :single="true" :list="operationsFor(row)" :data="row" :has-background="false">
                  <ElButton class="ct-card__more" text :icon="MoreFilled" />
                </ArtOperation>
              </div>
              <dl class="ct-card__meta">
                <div>
                  <dt>插件标识</dt>
                  <dd :title="row.keyword">{{ row.keyword }}</dd>
                </div>
                <div>
                  <dt>类型</dt>
                  <dd>{{ row.type === 'script' ? '脚本' : 'API' }}</dd>
                </div>
                <div>
                  <dt>范围</dt>
                  <dd>{{ !row.private ? '全局' : '私有' }}</dd>
                </div>
                <div>
                  <dt>版本</dt>
                  <dd>{{ row.currentVersion ? `v${row.currentVersionNo}` : '未发布' }}</dd>
                </div>
              </dl>
              <div class="ct-card__footer">
                <span class="ct-card__time">更新于 {{ formatTs(row.updatedAt) }}</span>
                <ElSwitch
                  v-model="row.status"
                  :disabled="!row.owned || !$hasPermission('cron:chain_node:update-status')"
                  inline-prompt
                  active-text="启用"
                  inactive-text="禁用"
                  :before-change="handleUpdateStatus(row)"
                  @click.stop
                />
              </div>
            </article>
          </div>
        </div>
        <div v-if="pagination.total > 0" class="ct-pagination">
          <ElPagination
            background
            :current-page="pagination.current"
            :page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增插件' : '修改插件'"
        :destroy-on-close="true"
        width="520px"
        align-center
      >
        <!-- 表单较长（含可见范围）时在弹窗内滚动，不超出屏幕 -->
        <ElScrollbar max-height="calc(100vh - 220px)">
          <ElForm ref="formRef" :model="currentData" label-width="auto" class="ct-form">
            <ElFormItem
              label="插件标识"
              prop="keyword"
              :rules="[
                { required: true, message: '请输入插件标识', trigger: 'blur' },
                { pattern: /^[a-zA-Z0-9_-]{1,64}$/, message: '只能包含字母、数字、_、-，长度 1～64', trigger: 'blur' }
              ]"
            >
              <ElInput
                v-model="currentData.keyword"
                :disabled="dialogType === 'edit'"
                placeholder="节点引用插件时使用，创建后不可修改"
              />
            </ElFormItem>
            <ElFormItem
              label="插件名称"
              prop="name"
              :rules="[{ required: true, message: '请输入插件名称', trigger: 'blur' }]"
            >
              <ElInput v-model="currentData.name" maxlength="64" />
            </ElFormItem>
            <ElFormItem label="插件分组" prop="groupId">
              <ElSelect v-model="currentData.groupId" filterable clearable placeholder="选择分组；不选为未分组">
                <ElOption v-for="g in groups" :key="g.id" :label="g.name" :value="g.id" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="插件图标" prop="icon">
              <div class="ct-icon-builder">
                <span class="ct-icon-preview" :style="{ background: currentData.iconBg || ICON_BG_DEFAULT }">
                  <ArtIcon v-if="currentData.icon" :value="currentData.icon" :size="59" />
                </span>
                <div class="ct-icon-controls">
                  <ArtIconSelector v-model="currentData.icon" width="100%" enable-iconify />
                  <ElColorPicker v-model="currentData.iconBg" :predefine="ICON_BG_PRESET" placeholder="背景色" />
                </div>
              </div>
            </ElFormItem>
            <ElFormItem label="插件描述" prop="description">
              <ElInput v-model="currentData.description" type="textarea" :rows="3" maxlength="255" />
            </ElFormItem>
            <!-- 只有 manager 能创建全局插件、授权给其他应用；其他应用的插件固定为本应用私有 -->
            <template v-if="isManager">
              <ElFormItem label="可见范围" prop="private">
                <ElRadioGroup v-model="currentData.private">
                  <ElRadio :value="true">私有</ElRadio>
                  <ElRadio :value="false">全局</ElRadio>
                </ElRadioGroup>
                <div class="ct-desc">全局：所有应用都可使用；私有：仅本应用与下面授权的应用可使用。</div>
              </ElFormItem>
              <ElFormItem v-if="currentData.private" label="授权应用" prop="apps">
                <ElSelect
                  v-model="currentData.apps"
                  multiple
                  filterable
                  remote
                  :remote-method="loadApps"
                  placeholder="选择可以使用该插件的应用（本应用无需选择）"
                  style="width: 100%"
                  :options="appOptions"
                  @visible-change="(v: boolean) => v && !appOptions.length && loadApps()"
                />
              </ElFormItem>
            </template>
          </ElForm>
        </ElScrollbar>
        <template #footer>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <ElDrawer
        v-model="versionVisible"
        :title="`插件开发：${editing?.name || ''}（${editing?.keyword || ''}）`"
        size="720px"
        destroy-on-close
        :before-close="beforeCloseVersion"
      >
        <div v-if="specError" class="ct-error">{{ specError }}</div>
        <!-- 可视化：与流程节点相同的任务配置 -->
        <div v-if="versionVisible && !jsonMode && draft" class="ct-visual">
          <NodePanel :target="draft.node" definition :candidates="defCandidates" :disabled="!editing?.owned" />
        </div>
        <!-- spec 无法可视化编辑时才出现 JSON 编辑 -->
        <MonacoEditor v-else-if="versionVisible" v-model="specText" language="json" height="calc(100vh - 220px)" />
        <template #footer>
          <div class="ct-footer">
            <span class="ct-base">
              基于：{{ baseLabel }}
              <span v-if="!editing?.owned" class="ct-readonly">（来自 {{ editing?.app }}，只读）</span>
            </span>
            <ElButton v-permission="'cron:chain_node_version:test'" :icon="CaretRight" @click="openTest">测试</ElButton>
            <ElButton
              v-if="editing?.owned"
              v-permission="'cron:chain_node_version:add'"
              type="primary"
              @click="openSave"
            >
              保存
            </ElButton>
          </div>
        </template>
        <ElDialog v-model="saveVisible" title="保存为新版本" width="460px" append-to-body :close-on-click-modal="false">
          <ElForm label-width="72px">
            <ElFormItem label="版本备注">
              <ElInput
                v-model="remark"
                type="textarea"
                :rows="3"
                maxlength="255"
                show-word-limit
                placeholder="本次修改的说明"
              />
            </ElFormItem>
            <ElFormItem v-if="$hasPermission('cron:chain_node_version:switch')" label="立即发布">
              <ElSwitch v-model="publish" />
              <span class="ct-desc">发布后新添加的节点默认使用该版本，已有节点需手动升级</span>
            </ElFormItem>
          </ElForm>
          <template #footer>
            <ElButton @click="saveVisible = false">取消</ElButton>
            <ElButton type="primary" :loading="savingVersion" @click="saveVersion">保存</ElButton>
          </template>
        </ElDialog>
        <NodeTestDialog
          v-model="testVisible"
          :node="testNode"
          :internal="testInternal"
          definition
          permission="cron:chain_node_version:test"
        />
      </ElDrawer>
    </ElCard>

    <NodeGroupDrawer v-model="groupVisible" @changed="onGroupsChanged" />
    <NodeVersionDrawer v-model="listVisible" :node="editing" @develop="loadVersion" @switched="onSwitched" />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch } from 'vue'
  import { ListApp } from '@/api/manager/app/api'
  import { getAppKeyword } from '@/utils/app-context'
  import type { FormInstance } from 'element-plus'
  import {
    Box,
    CaretRight,
    Delete,
    Edit,
    EditPen,
    Files,
    FolderOpened,
    MoreFilled,
    Plus
  } from '@element-plus/icons-vue'
  import { useTable } from '@/composables/useTable'
  import {
    CreateChainNode,
    CreateChainNodeVersion,
    DeleteChainNode,
    GetChainNodeVersion,
    ListChainNodeVersion,
    ListChainNode,
    UpdateChainNode,
    UpdateChainNodeStatus,
    ListChainNodeGroup
  } from '@/api/cron/chain/api'
  import type { ChainNodeGroupInfo, ChainNodeInfo, ChainNodeVersion } from '@/api/cron/chain/type'
  import MonacoEditor from './components/MonacoEditor.vue'
  import NodeGroupDrawer from './components/NodeGroupDrawer.vue'
  import NodeVersionDrawer from './components/NodeVersionDrawer.vue'
  import NodeTestDialog from './components/NodeTestDialog.vue'
  import NodePanel from './components/panel/NodePanel.vue'
  import type { Node } from './types/dsl'
  import type { VariableCandidate } from './types/graph'
  import { formatTs, pretty } from './utils/format'
  import { API_SPEC_SAMPLE } from './utils/template-samples'

  defineOptions({ name: 'CronChainNode' })

  /** manager 应用才能设置全局插件、授权其他应用 */
  const isManager = getAppKeyword() === 'manager'
  const allApps = ref<{ name: string; keyword: string }[]>([])
  if (isManager) {
    ListApp({ page: 1, pageSize: 50, status: true })
      .then((r) => (allApps.value = (r.list || []).map((a) => ({ name: a.name, keyword: a.keyword }))))
      .catch(() => undefined)
  }

  // ---------- 授权应用候选 ----------

  const appOptions = ref<{ label: string; value: string }[]>([])

  const toAppOptions = (list: Awaited<ReturnType<typeof ListApp>>['list']) =>
    list
      .filter((a) => a.keyword !== getAppKeyword())
      .map((a) => ({ label: `${a.name}（${a.keyword}）`, value: a.keyword }))

  async function loadApps(query?: string) {
    const kw = query?.trim()
    if (!kw) {
      appOptions.value = toAppOptions((await ListApp({ page: 1, pageSize: 50, status: true })).list)
      return
    }
    const [byName, byKeyword] = await Promise.all([
      ListApp({ page: 1, pageSize: 50, status: true, name: kw }),
      ListApp({ page: 1, pageSize: 50, status: true, keyword: kw })
    ])
    const all = [...byName.list, ...byKeyword.list]
    appOptions.value = toAppOptions(all.filter((a, i) => all.findIndex((b) => b.id === a.id) === i))
  }

  /** 编辑时把已授权的应用补进候选，否则下拉里只显示应用标识 */
  function ensureAppOptions(apps?: string[]) {
    const known = new Set(appOptions.value.map((o) => o.value))
    for (const a of apps || []) if (!known.has(a)) appOptions.value.push({ label: a, value: a })
  }

  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const submitting = ref(false)
  const formRef = ref<FormInstance>()
  // 图标背景色（对齐 psou 分类图标：预设色板 + 默认蓝）
  const ICON_BG_DEFAULT = '#2563eb'
  const ICON_BG_PRESET = [
    '#dc2626',
    '#ea580c',
    '#d97706',
    '#ca8a04',
    '#65a30d',
    '#16a34a',
    '#059669',
    '#0d9488',
    '#0891b2',
    '#0284c7',
    '#2563eb',
    '#4f46e5',
    '#7c3aed',
    '#9333ea',
    '#c026d3',
    '#db2777',
    '#e11d48',
    '#57534e',
    '#475569',
    '#111827'
  ]

  const currentData = ref<Partial<ChainNodeInfo>>({})

  const searchForm = ref({ keyword: undefined, name: undefined, groupId: undefined, status: undefined })
  // 全平台共用的插件分组（搜索与表单下拉）；在"分组管理"抽屉里维护，变更后重新加载
  const groups = ref<ChainNodeGroupInfo[]>([])
  const groupVisible = ref(false)

  function loadGroups() {
    ListChainNodeGroup({}, false)
      .then((r) => (groups.value = r.list || []))
      .catch(() => undefined)
  }

  /** 分组改名、删除后，列表中的分组名也要刷新 */
  function onGroupsChanged() {
    loadGroups()
    refreshData()
  }
  loadGroups()

  const searchItems = computed(() => [
    ...(isManager
      ? [
          {
            label: '所属应用',
            key: 'filterApp',
            type: 'select',
            props: {
              placeholder: '全部应用',
              clearable: true,
              options: allApps.value.map((a) => ({ label: `${a.name}（${a.keyword}）`, value: a.keyword }))
            }
          }
        ]
      : []),
    { label: '插件标识', key: 'keyword', type: 'input', props: { placeholder: '请输入插件标识', clearable: true } },
    { label: '插件名称', key: 'name', type: 'input', props: { placeholder: '请输入插件名称', clearable: true } },
    {
      label: '插件分组',
      key: 'groupId',
      type: 'select',
      props: {
        placeholder: '全部',
        clearable: true,
        filterable: true,
        options: groups.value.map((g) => ({ label: g.name, value: g.id }))
      }
    },
    {
      label: '插件状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '启用', value: true },
          { label: '禁用', value: false }
        ]
      }
    }
  ])

  /** 非所属插件只能开发（只读查看、测试）与查看版本 */
  function operationsFor(row: ChainNodeInfo) {
    return operationItems.filter((o) => row.owned || o.label === '开发' || o.label === '版本')
  }

  const operationItems = [
    {
      icon: EditPen,
      label: '开发',
      color: 'primary',
      permission: 'cron:chain_node_version:query',
      click: (row: ChainNodeInfo) => startDev(row)
    },
    {
      icon: Files,
      label: '版本',
      permission: 'cron:chain_node_version:query',
      click: (row: ChainNodeInfo) => openVersionList(row)
    },
    {
      icon: Edit,
      label: '修改',
      color: 'warning',
      permission: 'cron:chain_node:update',
      click: (row: ChainNodeInfo) => showDialog('edit', row)
    },
    {
      icon: Delete,
      label: '删除',
      color: 'danger',
      popConfirm: true,
      popTitle: '有启用中的流程调度引用时不能删除。确定删除？',
      permission: 'cron:chain_node:delete',
      click: async (row: ChainNodeInfo) => {
        await DeleteChainNode({ id: row.id })
        ElMessage.success('删除成功')
        refreshRemove()
      }
    }
  ]

  const {
    data: rawData,
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
  } = useTable({
    core: {
      apiFn: ListChainNode,
      apiParams: { page: 1, pageSize: 10, ...searchForm.value },
      columnsFactory: () => [
        { type: 'index', width: '60', label: '#' },
        { prop: 'name', label: '名称', minWidth: 160, useSlot: true, slotName: 'name' },
        { prop: 'keyword', label: '标识', minWidth: 140 },
        { prop: 'groupName', label: '分组', width: 120, formatter: (row: ChainNodeInfo) => row.groupName || '未分组' },
        { prop: 'private', label: '范围', width: 150, useSlot: true, slotName: 'scope' },
        { prop: 'type', label: '类型', width: 80, useSlot: true, slotName: 'type' },
        { prop: 'currentVersionNo', label: '生效版本', width: 100, useSlot: true, slotName: 'version' },
        { prop: 'status', label: '状态', width: 100, useSlot: true, slotName: 'status' },
        {
          prop: 'updatedAt',
          label: '更新时间',
          width: 170,
          formatter: (row: ChainNodeInfo) => formatTs(row.updatedAt)
        },
        { prop: 'operation', label: '操作', fixed: 'right', width: 120, useSlot: true, slotName: 'operation' }
      ]
    }
  })

  // useTable 无法从 ListChainNodeReply（{list,total}）推断记录类型，这里显式转换
  const data = computed(() => rawData.value as ChainNodeInfo[])

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: 'add' | 'edit', row?: ChainNodeInfo) => {
    dialogType.value = type
    currentData.value = row ? { ...row, apps: [...(row.apps || [])] } : { private: true, apps: [] }
    ensureAppOptions(currentData.value.apps)
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleSubmit = async () => {
    if (!(await formRef.value?.validate().catch(() => false))) return
    submitting.value = true
    try {
      const d = currentData.value
      const meta = {
        name: d.name!,
        groupId: d.groupId || 0,
        icon: d.icon || undefined,
        iconBg: d.iconBg || undefined,
        description: d.description || undefined,
        // 非 manager 不传，后端强制私有
        ...(isManager ? { private: d.private !== false, apps: d.private !== false ? d.apps || [] : [] } : {})
      }
      if (dialogType.value === 'add') {
        const res = await CreateChainNode({ keyword: d.keyword!, ...meta })
        ElMessage.success('创建成功，请保存第一个版本')
        dialogVisible.value = false
        refreshCreate()
        openDev({
          ...(d as ChainNodeInfo),
          id: res.id,
          currentVersion: 0,
          currentVersionNo: 0,
          status: false,
          owned: true,
          app: getAppKeyword(),
          private: d.private !== false
        })
      } else {
        await UpdateChainNode({ id: d.id!, ...meta })
        ElMessage.success('修改成功')
        dialogVisible.value = false
        refreshUpdate()
      }
    } finally {
      submitting.value = false
    }
  }

  const handleUpdateStatus = (row: ChainNodeInfo): (() => Promise<boolean>) => {
    return async () => {
      const tip = row.status
        ? '停用后编辑器不能新增引用、引用它的链保存时报错，已发布的链照常执行。确认停用？'
        : '确认启用此插件？'
      try {
        await ElMessageBox.confirm(tip, '提示', { type: 'warning' })
      } catch {
        return false
      }
      await UpdateChainNodeStatus({ id: row.id, status: !row.status })
      ElMessage.success('操作成功')
      refreshUpdate()
      return true
    }
  }

  // ---------- 开发（spec 编辑） ----------

  const versionVisible = ref(false)
  const editing = ref<ChainNodeInfo>()
  const specText = ref('')
  /** 载入时的内容，用于判断是否修改 */
  const loadedSpec = ref('')
  const specError = ref('')
  const baseLabel = ref('')
  /** 编辑基于的版本号（0 = 示例 / 未保存）；非所属插件测试时按该版本引用插件 */
  const baseNo = ref(0)
  const remark = ref('')
  const publish = ref(false)
  const savingVersion = ref(false)

  // ---------- 可视化编辑：spec ⇄ 草稿 ----------

  /** spec.config 中允许的任务字段（与后端 pluginConfigFields 一致） */
  const PLUGIN_TASK_FIELDS = [
    'method',
    'url',
    'header',
    'input',
    'requestType',
    'responseType',
    'files',
    'responseCondition',
    'errorMsg',
    'code',
    'timeout',
    'totalTimeout',
    'retry',
    'suspend',
    'condition',
    'output'
  ] as const

  interface SpecDraft {
    node: Node
  }

  const jsonMode = ref(false)
  const draft = ref<SpecDraft>()
  let syncing = false

  /** spec JSON → 草稿：config 展开为一个节点，交给节点面板编辑 */
  function toDraft(text: string): SpecDraft {
    const spec = JSON.parse(text || '{}')
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) throw new Error('spec 必须是 JSON 对象')
    return {
      node: {
        id: 'plugin',
        name: '插件',
        type: spec.type || 'api',
        ...(spec.config || {}),
        internal: Array.isArray(spec.internal) ? spec.internal : undefined
      } as Node
    }
  }

  /** 草稿 → spec JSON：只取任务字段放进 config，空值省略 */
  function toSpecText(d: SpecDraft): string {
    const n = d.node as Record<string, any>
    const config: Record<string, any> = {}
    for (const k of PLUGIN_TASK_FIELDS) {
      const v = n[k]
      if (v !== undefined && v !== null && v !== '') config[k] = v
    }
    const spec: Record<string, any> = { type: d.node.type, config }
    if (d.node.internal?.length) spec.internal = d.node.internal
    return pretty(spec)
  }

  /** 载入 spec 文本：可视化模式下解析为草稿并规范化文本；解析失败时切到 JSON 编辑 */
  function applySpecText(text: string): string {
    if (jsonMode.value) return text
    try {
      syncing = true
      draft.value = toDraft(text)
      return toSpecText(draft.value)
    } catch (e) {
      jsonMode.value = true
      specError.value = `spec 无法可视化编辑，已切到 JSON：${(e as Error).message}`
      return text
    } finally {
      nextTick(() => (syncing = false))
    }
  }

  watch(
    draft,
    (d) => {
      if (!d || syncing || jsonMode.value) return
      specText.value = toSpecText(d)
    },
    { deep: true }
  )

  /** 任务配置可引用的变量：只有运行信息（流程数据由使用插件的节点在请求参数里填写） */
  const defCandidates: VariableCandidate[] = [
    { path: 'run.id', group: '运行' },
    { path: 'run.attempt', group: '运行' },
    { path: 'run.app', group: '运行' }
  ]

  /**
   * 操作列"开发"：所属插件的最新版本不是生效版本（有未发布的版本）时，提示是否基于最新的未发布版本开发；
   * 否则基于生效版本；从未发布过时基于最新保存的版本
   */
  async function startDev(row: ChainNodeInfo) {
    if (row.owned) {
      const res = await ListChainNodeVersion({ nodeId: row.id, page: 1, pageSize: 1 })
      const latest = res?.list?.[0]
      // 还没有发布过：直接基于最新保存的版本，没有版本时为示例
      if (!row.currentVersion) return openDev(row, latest)
      if (latest && !latest.current && latest.id !== row.currentVersion) {
        try {
          await ElMessageBox.confirm(
            `当前已有未发布的版本 v${latest.version}（生效版本为 v${row.currentVersionNo}），是否基于未发布的版本开发？`,
            '有未发布的版本',
            {
              type: 'warning',
              confirmButtonText: `基于 v${latest.version}`,
              cancelButtonText: `基于生效版本 v${row.currentVersionNo}`,
              distinguishCancelAndClose: true
            }
          )
          return openDev(row, latest)
        } catch (action) {
          // 关闭弹框 = 不开发；点"基于生效版本"继续走默认
          if (action === 'close') return
        }
      }
    }
    return openDev(row)
  }

  /** 打开开发抽屉：基于指定版本；不指定 = 生效版本，没有版本时为 API 插件示例 */
  async function openDev(row: ChainNodeInfo, base?: ChainNodeVersion) {
    editing.value = row
    remark.value = ''
    publish.value = !row.currentVersion
    specError.value = ''
    let text = pretty(API_SPEC_SAMPLE)
    baseLabel.value = 'API 插件示例'
    baseNo.value = 0
    const id = base?.id || row.currentVersion
    if (id) {
      const res = await GetChainNodeVersion({ id })
      text = pretty(res.spec)
      baseNo.value = res.version?.version || base?.version || row.currentVersionNo || 0
      baseLabel.value = base && !base.current ? `未发布版本 v${baseNo.value}` : `生效版本 v${baseNo.value}`
    }
    jsonMode.value = false
    specText.value = applySpecText(text)
    loadedSpec.value = specText.value
    versionVisible.value = true
  }

  async function beforeCloseVersion(done: () => void) {
    if (specText.value !== loadedSpec.value) {
      try {
        await ElMessageBox.confirm('spec 有未保存的修改，确定关闭？', '提示', { type: 'warning' })
      } catch {
        return
      }
    }
    done()
  }

  // ---------- 测试：按编辑中的 spec（未保存也可）执行一次插件任务 ----------

  const testVisible = ref(false)
  const testNode = ref<Node>()
  const testInternal = ref<string[]>([])

  function openTest() {
    try {
      const spec = JSON.parse(specText.value || '{}')
      if (!spec || typeof spec !== 'object' || Array.isArray(spec)) throw new Error('spec 必须是 JSON 对象')
      const name = editing.value?.name || '插件'
      const internal: string[] = Array.isArray(spec.internal) ? spec.internal : []
      if (editing.value?.owned) {
        // 所属应用：按编辑中的 spec 直接执行，内部参数也可填写
        testNode.value = { ...(spec.config || {}), id: 'plugin', name, type: spec.type || 'api' } as Node
        testInternal.value = internal
      } else {
        // 其他应用拿到的内部参数与请求头已打码：按版本引用插件执行，只填写非内部参数
        if (!baseNo.value || !editing.value) throw new Error('请先在版本列表中查看一个版本')
        const input = spec.config?.input && typeof spec.config.input === 'object' ? spec.config.input : {}
        const open = Object.fromEntries(Object.entries(input).filter(([k]) => !internal.includes(k)))
        testNode.value = {
          id: 'plugin',
          name,
          plugin: editing.value.keyword,
          pluginVersion: baseNo.value,
          input: Object.keys(open).length ? open : undefined
        } as Node
        testInternal.value = []
      }
      specError.value = ''
      testVisible.value = true
    } catch (e) {
      specError.value = e instanceof SyntaxError ? `JSON 格式错误：${e.message}` : (e as Error).message
    }
  }

  /** 值为空的内部参数 */
  function emptyInternal(spec: Record<string, any>): string[] {
    const internal: string[] = Array.isArray(spec.internal) ? spec.internal : []
    const input = spec.config?.input && typeof spec.config.input === 'object' ? spec.config.input : {}
    return internal.filter((k) => {
      const v = input[k]
      return v === undefined || v === null || (typeof v === 'string' && !v.trim())
    })
  }

  // ---------- 保存：校验通过后弹框填写版本备注 ----------

  const saveVisible = ref(false)
  /** 待保存的 spec（打开保存弹框时校验并固定） */
  let pendingSpec: unknown

  function openSave() {
    let spec: unknown
    try {
      spec = JSON.parse(specText.value)
      if (!spec || typeof spec !== 'object' || Array.isArray(spec)) throw new Error('spec 必须是 JSON 对象')
      specError.value = ''
    } catch (e) {
      specError.value = `JSON 格式错误：${(e as Error).message}`
      return
    }
    // 内部参数由插件固定、节点上不能填写，值必填（与后端 plugin_internal_required 一致）
    const missing = emptyInternal(spec as Record<string, any>)
    if (missing.length) {
      specError.value = `内部参数 ${missing.join('、')} 的值必填`
      return
    }
    pendingSpec = spec
    saveVisible.value = true
  }

  async function saveVersion() {
    if (!editing.value || !pendingSpec) return
    savingVersion.value = true
    try {
      const doPublish = publish.value
      const res = await CreateChainNodeVersion({
        nodeId: editing.value.id,
        spec: JSON.stringify(pendingSpec),
        remark: remark.value || undefined,
        publish: doPublish
      })
      ElMessage.success(`已保存为 v${res.version}${doPublish ? ' 并发布' : ''}`)
      saveVisible.value = false
      pendingSpec = undefined
      loadedSpec.value = specText.value
      baseLabel.value = `v${res.version}`
      baseNo.value = res.version
      remark.value = ''
      if (doPublish) editing.value = { ...editing.value, currentVersion: res.id, currentVersionNo: res.version }
      refreshUpdate()
    } finally {
      savingVersion.value = false
    }
  }

  // ---------- 版本列表（NodeVersionDrawer） ----------

  const listVisible = ref(false)

  function openVersionList(row: ChainNodeInfo) {
    editing.value = row
    listVisible.value = true
  }

  /** 基于该版本开发（非所属插件为只读查看） */
  async function loadVersion(row: ChainNodeVersion) {
    if (editing.value) await openDev(editing.value, row)
  }

  function onSwitched(row: ChainNodeVersion) {
    if (editing.value) editing.value = { ...editing.value, currentVersion: row.id, currentVersionNo: row.version }
    refreshUpdate()
  }
</script>

<style scoped lang="scss">
  // 可视化编辑：任务配置铺满抽屉宽度，随抽屉内容区滚动
  .ct-visual {
    padding-right: 8px;
  }

  // 开发抽屉底部：左侧版本来源，右侧测试 / 保存
  .ct-footer {
    display: flex;
    gap: 8px;
    align-items: center;

    .ct-base {
      flex: 1;
      text-align: left;
    }

    .el-button + .el-button {
      margin-left: 0;
    }
  }

  // 留出滚动条位置，避免内容贴边
  .ct-form {
    padding-right: 12px;
  }

  // ---------- 插件卡片网格（对齐 manager/app 布局） ----------

  :deep(.table) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .ct-card-scroll {
    flex: 1;
    min-height: 0;
    margin-top: 12px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .ct-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .ct-card {
    display: flex;
    flex-direction: column;
    min-height: 216px;
    padding: 18px;
    cursor: pointer;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 2px 10px rgb(0 0 0 / 6%);
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
      color: #fff;
      border-radius: 8px;
    }

    &__title {
      min-width: 0;

      h2 {
        margin: 0;
        overflow: hidden;
        font-size: 14px;
        font-weight: 700;
        line-height: 22px;
        color: var(--el-text-color-primary);
        text-overflow: ellipsis;
        white-space: nowrap;
        letter-spacing: 0;
      }

      p {
        display: -webkit-box;
        margin: 2px 0 0;
        overflow: hidden;
        font-size: 13px;
        font-weight: 400;
        line-height: 19px;
        color: var(--el-text-color-secondary);
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    &__more {
      --el-button-border-color: transparent;
      --el-button-bg-color: transparent;
      --el-button-hover-border-color: transparent;
      --el-button-hover-bg-color: var(--el-fill-color);
      --el-button-active-border-color: transparent;
      --el-button-active-bg-color: var(--el-fill-color);

      width: 32px !important;
      height: 32px !important;
      color: var(--el-text-color-secondary);
      border-color: transparent !important;
      border-radius: 6px;
      box-shadow: none !important;

      &:hover,
      &:focus,
      &:focus-visible,
      &:active {
        color: var(--el-text-color-secondary);
        border-color: transparent !important;
        box-shadow: none !important;
        outline: none;
      }

      &:focus-visible {
        outline: none !important;
      }

      &:hover,
      &:active {
        background: var(--el-fill-color) !important;
      }

      :deep(span) {
        outline: none !important;
        box-shadow: none !important;
      }
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
        color: var(--el-text-color-secondary);
      }

      dd {
        overflow: hidden;
        font-weight: 400;
        color: var(--el-text-color-primary);
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
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }

  .ct-card__time {
    font-size: 13px;
    color: var(--el-text-color-placeholder);
  }

  .ct-pagination {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  @media (max-width: 1180px) {
    .ct-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 500px) {
    .ct-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .ct-card {
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

  .ct-readonly {
    font-size: 12px;
    color: var(--el-color-warning);
  }

  .ct-icon-builder {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    width: 100%;
  }

  .ct-icon-preview {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    margin-top: 2px;
    color: #fff;
    border-radius: 16px;
  }

  .ct-icon-controls {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .ct-base {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .ct-error {
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--el-color-danger);
  }

  .ct-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  // 左右布局时，可见范围说明换到单选下一行
  .ct-form .ct-desc {
    width: 100%;
    line-height: 1.5;
  }

  :deep(.el-input-number),
  :deep(.el-select) {
    width: 100%;
  }
</style>
