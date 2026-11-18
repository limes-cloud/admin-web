<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
          ref="searchBarRef"
          v-model="searchForm"
          :card="false"
          :items="searchItems"
          @search="handleSearch"
          @reset="resetSearchParams"
        />
      </div>

      <div class="table">
        <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
          <template #left>
            <ElSpace wrap>
              <ElButton
                v-permission="'gateway:route:add'"
                v-ripple
                type="primary"
                :icon="Plus"
                @click="showDialog('add')"
                >新增路由</ElButton
              >
              <ElButton
                v-permission="'gateway:publish'"
                v-ripple
                type="warning"
                :icon="Upload"
                @click="publishVisible = true"
                >发布</ElButton
              >
              <ElButton v-ripple :icon="Clock" @click="showHistory">发布历史</ElButton>
            </ElSpace>
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
          <template #rewrites="{ row }">
            <ElSpace wrap :size="4">
              <ElTag v-if="!row.rewrites?.length" type="info" effect="plain" size="small">无重写</ElTag>
              <ElTag v-else type="success" effect="plain" size="small">{{ row.rewrites.length }} 条</ElTag>
              <ElTag v-if="hasRedirectAction(row.rewrites)" type="warning" effect="plain" size="small">含重定向</ElTag>
            </ElSpace>
          </template>
          <template #terminal="{ row }">
            <ElTag v-if="row.rewrites?.length" :type="terminalTagType(row.rewrites)" effect="plain" size="small">
              {{ terminalText(row.rewrites) }}
            </ElTag>
            <span v-else class="muted">—</span>
          </template>
          <template #upstream="{ row }">
            <span v-if="row.upstream?.backends?.length">{{ backendText(row) }}</span>
            <span v-else class="muted">由响应动作直接返回</span>
          </template>
          <template #enabled="{ row }">
            <ElSwitch
              v-model="row.enabled"
              :active-value="true"
              :inactive-value="false"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
              :before-change="handleUpdateStatus(row)"
            />
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增路由' : '编辑路由'"
        :destroy-on-close="true"
        class="gateway-route-dialog"
        body-class="gateway-route-dialog-body"
        width="1080px"
        align-center
      >
        <ElForm
          ref="routeFormRef"
          :model="currentData"
          :rules="routeRules"
          :validate-on-rule-change="false"
          label-position="top"
          class="route-form"
        >
          <section class="route-section">
            <div class="route-section-header">
              <h3 class="route-section-title">基本信息</h3>
              <span class="section-tip">启用状态请在列表中操作</span>
            </div>

            <ElRow :gutter="12">
              <ElCol :span="15">
                <ElFormItem label="路由名称" prop="name">
                  <ElInput v-model="currentData.name" maxlength="128" placeholder="例如：盘搜蜘蛛首页 SEO" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="9">
                <ElFormItem label="优先级（越大越优先）" prop="priority">
                  <ElInputNumber v-model="currentData.priority" :controls="false" :min="-99999" :max="99999" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="24">
                <ElFormItem label="备注">
                  <ElInput
                    v-model="currentData.description"
                    type="textarea"
                    :rows="2"
                    maxlength="512"
                    show-word-limit
                    placeholder="补充路由用途或变更说明"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </section>

          <section class="route-section">
            <div class="route-section-header">
              <h3 class="route-section-title">路由匹配</h3>
              <span class="section-tip">按 priority DESC、id ASC 匹配，第一条命中路由胜出</span>
            </div>

            <ElFormItem prop="match.expression">
              <template #label>
                <span class="expression-label">
                  匹配表达式
                  <ElTooltip content="查看可用函数" placement="top">
                    <ElButton
                      class="expression-help-button"
                      link
                      type="primary"
                      :icon="QuestionFilled"
                      aria-label="查看匹配表达式可用函数"
                      @click.stop="expressionHelpVisible = true"
                    />
                  </ElTooltip>
                </span>
              </template>
              <ElInput
                v-model="currentData.match.expression"
                class="route-json-editor"
                type="textarea"
                :rows="3"
                placeholder='req_host_in("asou.fun") && req_path_in("/")'
              />
            </ElFormItem>
          </section>

          <section class="route-section">
            <div class="route-section-header">
              <div>
                <h3 class="route-section-title">路由内重写</h3>
                <span class="section-tip">仅命中当前路由后执行；priority 越大越先执行</span>
              </div>
              <ElButton type="primary" plain :icon="Plus" @click="addRewrite">添加规则</ElButton>
            </div>

            <div v-if="!currentData.rewrites.length" class="route-empty">
              未配置重写规则，请求将按原始路径转发到下游。
            </div>

            <div v-for="(rule, ruleIndex) in currentData.rewrites" :key="ruleIndex" class="rule-card">
              <div class="rule-card-header">
                <div class="rule-title">
                  <span class="rule-index">{{ ruleIndex + 1 }}</span>
                  <span>{{ rule.name || '未命名规则' }}</span>
                </div>
                <ElSpace :size="4">
                  <ElButton text :icon="ArrowUp" :disabled="ruleIndex === 0" @click="moveRewrite(ruleIndex, -1)" />
                  <ElButton
                    text
                    :icon="ArrowDown"
                    :disabled="ruleIndex === currentData.rewrites.length - 1"
                    @click="moveRewrite(ruleIndex, 1)"
                  />
                  <ElButton text type="danger" :icon="Delete" @click="removeRewrite(ruleIndex)" />
                </ElSpace>
              </div>

              <ElRow :gutter="12">
                <ElCol :span="14">
                  <ElFormItem label="规则名称">
                    <ElInput v-model="rule.name" maxlength="128" placeholder="例如：蜘蛛走 SEO" />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="6">
                  <ElFormItem label="规则优先级">
                    <ElInputNumber v-model="rule.priority" :controls="false" :min="-99999" :max="99999" />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="4">
                  <ElFormItem label="命中后终止">
                    <div class="route-switch-line">
                      <ElSwitch v-model="rule.match.terminal" inline-prompt active-text="是" inactive-text="否" />
                    </div>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="24">
                  <ElFormItem>
                    <template #label>
                      <span class="expression-label">
                        匹配表达式
                        <ElTooltip content="查看可用函数" placement="top">
                          <ElButton
                            class="expression-help-button"
                            link
                            type="primary"
                            :icon="QuestionFilled"
                            aria-label="查看匹配表达式可用函数"
                            @click.stop="expressionHelpVisible = true"
                          />
                        </ElTooltip>
                      </span>
                    </template>
                    <ElInput
                      v-model="rule.match.expression"
                      class="route-json-editor"
                      type="textarea"
                      :rows="2"
                      placeholder='req_method_in("GET", "HEAD")'
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>

              <div class="action-list">
                <div v-for="(action, actionIndex) in rule.actions" :key="actionIndex" class="action-card">
                  <div class="action-header">
                    <div class="action-title">动作 {{ actionIndex + 1 }}</div>
                    <ElSpace :size="4">
                      <ElButton
                        text
                        :icon="ArrowUp"
                        :disabled="actionIndex === 0"
                        @click="moveAction(rule, actionIndex, -1)"
                      />
                      <ElButton
                        text
                        :icon="ArrowDown"
                        :disabled="actionIndex === rule.actions.length - 1"
                        @click="moveAction(rule, actionIndex, 1)"
                      />
                      <ElButton text type="danger" :icon="Delete" @click="removeAction(rule, actionIndex)" />
                    </ElSpace>
                  </div>

                  <ElRow :gutter="12">
                    <ElCol :span="24">
                      <ElFormItem label="动作类型">
                        <ElSelect
                          :model-value="action.type"
                          filterable
                          placeholder="请选择动作"
                          @update:model-value="(value) => changeActionType(action, rule, value)"
                        >
                          <ElOption
                            v-for="option in ACTION_OPTIONS"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                          />
                        </ElSelect>
                      </ElFormItem>
                    </ElCol>
                    <ElCol v-for="field in actionFields(action)" :key="field.key" :span="field.span || 12">
                      <ElFormItem :label="field.label" :required="field.required">
                        <ElInput
                          v-if="field.kind === 'text'"
                          :model-value="actionFieldValue(action.params, field)"
                          :placeholder="field.placeholder"
                          @update:model-value="(value) => updateActionParam(action, field.key, value)"
                        />
                        <ElInput
                          v-else-if="field.kind === 'textarea'"
                          :model-value="actionFieldValue(action.params, field)"
                          :placeholder="field.placeholder"
                          type="textarea"
                          :rows="3"
                          @update:model-value="(value) => updateActionParam(action, field.key, value)"
                        />
                        <ElInputNumber
                          v-else-if="field.kind === 'number'"
                          :model-value="actionFieldValue(action.params, field)"
                          :min="field.min"
                          :max="field.max"
                          :controls="false"
                          @update:model-value="(value) => updateActionParam(action, field.key, value)"
                        />
                        <ElSelect
                          v-else-if="field.kind === 'select'"
                          :model-value="actionFieldValue(action.params, field)"
                          @update:model-value="(value) => updateActionParam(action, field.key, value)"
                        >
                          <ElOption
                            v-for="option in field.options || []"
                            :key="String(option.value)"
                            :label="option.label"
                            :value="option.value"
                          />
                        </ElSelect>
                        <div v-else-if="field.kind === 'switch'" class="route-switch-line">
                          <ElSwitch
                            :model-value="actionFieldValue(action.params, field)"
                            inline-prompt
                            active-text="保留"
                            inactive-text="丢弃"
                            @update:model-value="(value) => updateActionParam(action, field.key, value)"
                          />
                        </div>
                        <ElInputTag
                          v-else-if="field.kind === 'tags'"
                          :model-value="actionFieldValue(action.params, field)"
                          :placeholder="field.placeholder"
                          @update:model-value="(value) => updateActionParam(action, field.key, value)"
                        />
                      </ElFormItem>
                    </ElCol>
                  </ElRow>
                  <div v-if="actionMeta(action.type).tip" class="action-tip">{{ actionMeta(action.type).tip }}</div>
                </div>

                <ElButton class="add-action-button" plain :icon="Plus" @click="addAction(rule)">添加动作</ElButton>
              </div>
            </div>
          </section>

          <section class="route-section">
            <div class="route-section-header">
              <h3 class="route-section-title">下游服务</h3>
              <span class="section-tip">存在 REDIRECT 动作时，下游可以为空</span>
            </div>

            <ElRow :gutter="12">
              <ElCol :span="8">
                <ElFormItem label="下游协议">
                  <ElSelect v-model="currentData.upstream.protocol">
                    <ElOption label="HTTP" value="HTTP" />
                    <ElOption label="GRPC" value="GRPC" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="8">
                <ElFormItem label="超时（ms，0 不超时）">
                  <ElInputNumber v-model="currentData.upstream.timeoutMs" :controls="false" :min="0" :step="1000" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="8">
                <ElFormItem label="统一响应格式">
                  <div class="route-switch-line">
                    <ElSwitch
                      v-model="currentData.responseFormat"
                      inline-prompt
                      active-text="开启"
                      inactive-text="关闭"
                    />
                  </div>
                </ElFormItem>
              </ElCol>
              <ElCol :span="24">
                <ElFormItem label="后端地址">
                  <ElInputTag
                    v-model="currentData.upstream.backends"
                    placeholder="输入 ip:port 或 discovery://服务名，回车添加"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </section>

          <ElCollapse v-model="advancedOpen" class="route-advanced">
            <ElCollapseItem name="advanced" title="高级配置：重试、响应头、中间件与元数据">
              <ElRow :gutter="12">
                <ElCol :span="24">
                  <ElFormItem label="重试策略 JSON">
                    <ElInput
                      v-model="currentData.retryJSON"
                      class="route-json-editor"
                      type="textarea"
                      :rows="3"
                      placeholder='{&#10;  "count": 2,&#10;  "timeoutMs": 1000,&#10;  "conditions": []&#10;}'
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="24">
                  <ElFormItem label="响应头策略 JSON">
                    <ElInput
                      v-model="currentData.responseHeadersJSON"
                      class="route-json-editor"
                      type="textarea"
                      :rows="3"
                      placeholder='{&#10;  "set": { "Cache-Control": "no-store" },&#10;  "add": {},&#10;  "remove": ["Server"]&#10;}'
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="24">
                  <ElFormItem label="中间件 JSON">
                    <ElInput
                      v-model="currentData.middlewaresJSON"
                      class="route-json-editor"
                      type="textarea"
                      :rows="3"
                      placeholder='[{"name":"auth","options":{},"required":true}]'
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="24">
                  <ElFormItem label="Metadata JSON">
                    <ElInput
                      v-model="currentData.metadataJSON"
                      class="route-json-editor"
                      type="textarea"
                      :rows="3"
                      placeholder='{&#10;  "owner": "platform"&#10;}'
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>
            </ElCollapseItem>
          </ElCollapse>
        </ElForm>

        <template #footer>
          <div class="gateway-route-dialog-footer">
            <ElButton :disabled="savingRoute" @click="dialogVisible = false">取消</ElButton>
            <ElButton type="primary" :loading="savingRoute" @click="handleSubmit">确定</ElButton>
          </div>
        </template>
      </ElDialog>

      <ElDialog v-model="publishVisible" title="发布配置" width="480px" align-center>
        <ElAlert
          class="publish-guide"
          type="warning"
          title="发布后所有网关实例将在 60s 内热更新生效（含回滚能力）；草稿未发布前不生效。"
          :closable="false"
          show-icon
        />
        <ArtForm
          v-model="publishForm"
          :items="publishItems"
          :span="24"
          :show-button="false"
          @submit="doPublish"
          @cancel="publishVisible = false"
        />
      </ElDialog>

      <ElDialog v-model="historyVisible" title="发布历史" width="640px" align-center>
        <ElTable v-loading="historyLoading" :data="historyRows" row-key="version">
          <ElTableColumn prop="version" label="发布版本" width="90" />
          <ElTableColumn prop="operator" label="操作人员" width="110" />
          <ElTableColumn prop="remark" label="发布说明" min-width="160" show-overflow-tooltip />
          <ElTableColumn label="发布时间" width="160">
            <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <ElButton v-permission="'gateway:publish:rollback'" link type="danger" @click="showRollback(row.version)">
                回滚
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElDialog>

      <ElDialog v-model="rollbackVisible" title="回滚配置" width="480px" align-center>
        <ElAlert
          class="publish-guide"
          type="error"
          :title="`将恢复为 v${rollbackForm.version} 的配置并生成新版本（保留完整审计链），确认继续？`"
          :closable="false"
          show-icon
        />
        <ArtForm
          v-model="rollbackForm"
          :items="rollbackItems"
          :span="24"
          :show-button="false"
          @submit="doRollback"
          @cancel="rollbackVisible = false"
        />
      </ElDialog>

      <ExpressionHelp v-model="expressionHelpVisible" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
  import { ArrowDown, ArrowUp, Clock, Delete, Edit, Plus, QuestionFilled, Upload } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/time'
  import ExpressionHelp from './ExpressionHelp.vue'

  import {
    CreateRoute,
    DeleteRoute,
    ListHistory,
    ListRoute,
    Publish,
    Rollback,
    UpdateRoute
  } from '@/api/gateway/route/api'
  import type {
    GatewayAction,
    GatewayActionType,
    GatewayMiddleware,
    GatewayRoute,
    HeaderPolicy,
    HistoryItem,
    Retry,
    RewriteRule,
    SaveRouteRequest
  } from '@/api/gateway/route/type'
  import {
    ACTION_OPTIONS,
    actionFieldValue,
    actionMeta,
    defaultActionParams,
    validateActionParams
  } from './action-meta'

  defineOptions({ name: 'GatewayRoutes' })

  interface RouteForm {
    id?: number
    name: string
    description: string
    enabled: boolean
    priority: number
    match: { expression: string }
    rewrites: RewriteRule[]
    upstream: { protocol: string; timeoutMs: number; backends: string[] }
    retryJSON: string
    responseFormat: boolean
    responseHeadersJSON: string
    middlewaresJSON: string
    metadataJSON: string
  }

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<RouteForm>(blankForm())
  const routeFormRef = ref<FormInstance>()
  const savingRoute = ref(false)
  const advancedOpen = ref<string[]>([])
  const expressionHelpVisible = ref(false)

  const searchForm = ref({
    keyword: undefined,
    enabled: undefined
  })

  const searchItems = [
    {
      label: '路由名称/表达式',
      key: 'keyword',
      type: 'input',
      props: { placeholder: '请输入名称或匹配表达式', clearable: true }
    },
    {
      label: '启用状态',
      key: 'enabled',
      type: 'select',
      props: {
        placeholder: '请选择启用状态',
        clearable: true,
        options: [
          { label: '启用', value: '1' },
          { label: '禁用', value: '0' }
        ]
      }
    }
  ]

  const routeRules: FormRules = {
    name: [{ required: true, message: '请输入路由名称', trigger: ['blur', 'change'] }],
    'match.expression': [{ required: true, message: '请输入路由匹配表达式', trigger: ['blur', 'change'] }]
  }

  const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
  const jsonText = (value: any, fallback: any): string =>
    JSON.stringify(value === undefined || value === null ? fallback : value, null, 2)

  const normalizeAction = (action: GatewayAction): GatewayAction => ({
    type: action.type,
    params: {
      ...defaultActionParams(action.type),
      ...(action.params && typeof action.params === 'object' ? clone(action.params) : {})
    }
  })

  const normalizeRule = (rule: RewriteRule): RewriteRule => ({
    name: rule.name || '',
    priority: Number(rule.priority || 0),
    match: {
      expression: rule.match?.expression || '',
      terminal: rule.match?.terminal === true
    },
    actions: (rule.actions || []).map(normalizeAction)
  })

  function blankForm(): RouteForm {
    return {
      name: '',
      description: '',
      enabled: true,
      priority: 0,
      match: { expression: '' },
      rewrites: [],
      upstream: { protocol: 'HTTP', timeoutMs: 60000, backends: [] },
      retryJSON: '',
      responseFormat: false,
      responseHeadersJSON: '{}',
      middlewaresJSON: '[]',
      metadataJSON: ''
    }
  }

  const toForm = (row: GatewayRoute): RouteForm => ({
    id: row.id,
    name: row.name || '',
    description: row.description || '',
    enabled: row.enabled !== false,
    priority: Number(row.priority || 0),
    match: { expression: row.match?.expression || '' },
    rewrites: (row.rewrites || []).map(normalizeRule),
    upstream: {
      protocol: row.upstream?.protocol || 'HTTP',
      timeoutMs: Number(row.upstream?.timeoutMs || 0),
      backends: (row.upstream?.backends || []).map((item) => item.target)
    },
    retryJSON: row.upstream?.retry ? jsonText(row.upstream.retry, {}) : '',
    responseFormat: row.response?.format === true,
    responseHeadersJSON: jsonText(row.response?.headers, {}),
    middlewaresJSON: jsonText(row.middlewares, []),
    metadataJSON: row.metadata ? jsonText(row.metadata, {}) : ''
  })

  const hasRedirectAction = (rewrites: RewriteRule[] | null | undefined): boolean =>
    (rewrites || []).some((rule) => (rule.actions || []).some((action) => action.type === 'REDIRECT'))

  const terminalText = (rewrites: RewriteRule[] | null | undefined): string => {
    const rules = rewrites || []
    const terminalCount = rules.filter((rule) => rule.match?.terminal === true).length
    if (terminalCount === rules.length) return '全部终止'
    if (terminalCount === 0) return '均继续'
    return `${terminalCount}/${rules.length} 终止`
  }

  const terminalTagType = (rewrites: RewriteRule[] | null | undefined): 'success' | 'warning' | 'info' => {
    const rules = rewrites || []
    const terminalCount = rules.filter((rule) => rule.match?.terminal === true).length
    if (terminalCount === rules.length) return 'success'
    if (terminalCount === 0) return 'info'
    return 'warning'
  }

  const backendText = (row: GatewayRoute): string =>
    (row.upstream?.backends || []).map((item) => item.target).join(', ')

  const operationItems = [
    {
      icon: Edit,
      label: '修改路由',
      color: 'warning',
      permission: 'gateway:route:update',
      click: async (record: GatewayRoute) => showDialog('edit', record)
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除路由',
      color: 'danger',
      permission: 'gateway:route:delete',
      click: async (record: GatewayRoute) => {
        await DeleteRoute(record.id)
        ElMessage.success('删除成功（草稿态，发布后生效）')
        refreshRemove()
      }
    }
  ]

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
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: ListRoute,
      paginationKey: { current: 'page', size: 'size' },
      apiParams: { ...searchForm.value },
      columnsFactory: () => [
        { prop: 'name', label: '路由名称', minWidth: 220 },
        { prop: 'rewrites', label: '重写', width: 120, useSlot: true, slotName: 'rewrites' },
        { prop: 'terminal', label: '命中后终止', width: 110, useSlot: true, slotName: 'terminal' },
        { prop: 'priority', label: '优先级', width: 80 },
        { prop: 'upstream.backends', label: '下游', minWidth: 200, useSlot: true, slotName: 'upstream' },
        { prop: 'description', label: '备注', minWidth: 130, showOverflowTooltip: true },
        {
          prop: 'updatedAt',
          label: '更新时间',
          width: 170,
          formatter: (row: GatewayRoute) => formatTime(row.updatedAt)
        },
        { prop: 'enabled', label: '启用状态', width: 100, useSlot: true, slotName: 'enabled' },
        { prop: 'operation', label: '操作', width: 120, fixed: 'right', useSlot: true, slotName: 'operation' }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const showDialog = (type: Form.DialogType, row?: GatewayRoute): void => {
    dialogType.value = type
    currentData.value = row ? toForm(row) : blankForm()
    advancedOpen.value = []
    dialogVisible.value = true
    nextTick(() => routeFormRef.value?.clearValidate())
  }

  const actionFields = (action: GatewayAction) => actionMeta(action.type).fields

  const updateActionParam = (action: GatewayAction, key: string, value: any): void => {
    action.params = { ...(action.params || {}), [key]: value }
  }

  const ensureRedirectLast = (rule: RewriteRule): void => {
    const redirects = rule.actions.filter((action) => action.type === 'REDIRECT')
    const others = rule.actions.filter((action) => action.type !== 'REDIRECT')
    rule.actions.splice(0, rule.actions.length, ...others, ...redirects)
  }

  const changeActionType = (action: GatewayAction, rule: RewriteRule, type: GatewayActionType): void => {
    if (type === 'REDIRECT') {
      const currentIndex = rule.actions.indexOf(action)
      rule.actions = rule.actions.filter((item, index) => item.type !== 'REDIRECT' || index === currentIndex)
    }
    action.type = type
    action.params = defaultActionParams(type)
    ensureRedirectLast(rule)
  }

  const addAction = (rule: RewriteRule): void => {
    const action: GatewayAction = { type: 'PATH_SET', params: defaultActionParams('PATH_SET') }
    const redirectIndex = rule.actions.findIndex((item) => item.type === 'REDIRECT')
    if (redirectIndex >= 0) {
      rule.actions.splice(redirectIndex, 0, action)
      return
    }
    rule.actions.push(action)
  }

  const removeAction = (rule: RewriteRule, index: number): void => {
    rule.actions.splice(index, 1)
  }

  const moveAction = (rule: RewriteRule, index: number, offset: number): void => {
    const target = index + offset
    if (target < 0 || target >= rule.actions.length) return
    const [action] = rule.actions.splice(index, 1)
    rule.actions.splice(target, 0, action)
    ensureRedirectLast(rule)
  }

  const addRewrite = (): void => {
    currentData.value.rewrites.push({
      name: `重写规则 ${currentData.value.rewrites.length + 1}`,
      priority: 0,
      match: { expression: '', terminal: true },
      actions: [{ type: 'PATH_SET', params: defaultActionParams('PATH_SET') }]
    })
  }

  const removeRewrite = (index: number): void => {
    currentData.value.rewrites.splice(index, 1)
  }

  const moveRewrite = (index: number, offset: number): void => {
    const target = index + offset
    if (target < 0 || target >= currentData.value.rewrites.length) return
    const [rule] = currentData.value.rewrites.splice(index, 1)
    currentData.value.rewrites.splice(target, 0, rule)
  }

  const parseJSON = <T,>(label: string, text: string, fallback: T): T | undefined => {
    if (!text || !text.trim()) return fallback
    try {
      return JSON.parse(text) as T
    } catch (err) {
      ElMessage.error(`${label} 不是合法 JSON：${(err as Error).message}`)
      return undefined
    }
  }

  const validateRouteInput = (value: RouteForm): string | undefined => {
    if (!value.name.trim()) return '请输入路由名称'
    if (!value.match.expression.trim()) return '请输入路由匹配表达式'

    for (let ruleIndex = 0; ruleIndex < value.rewrites.length; ruleIndex += 1) {
      const rule = value.rewrites[ruleIndex]
      if (!rule.name.trim()) return `第 ${ruleIndex + 1} 条重写规则缺少名称`
      if (!rule.match.expression.trim()) return `第 ${ruleIndex + 1} 条重写规则缺少匹配表达式`
      if (!rule.actions.length) return `第 ${ruleIndex + 1} 条重写规则至少需要一个动作`
      for (let actionIndex = 0; actionIndex < rule.actions.length; actionIndex += 1) {
        const action = rule.actions[actionIndex]
        if (action.type === 'REDIRECT' && actionIndex !== rule.actions.length - 1) {
          return `第 ${ruleIndex + 1} 条重写规则中，REDIRECT 必须是最后一个动作`
        }
        const paramError = validateActionParams(action.type, action.params)
        if (paramError) return `第 ${ruleIndex + 1} 条重写规则的动作 ${actionIndex + 1}：${paramError}`
      }
    }

    if (!value.upstream.backends.length && !hasRedirectAction(value.rewrites)) {
      return '未配置下游地址时，至少需要一个 REDIRECT 动作'
    }
    return undefined
  }

  const buildRequest = (value: RouteForm): SaveRouteRequest | undefined => {
    const retry = parseJSON<Retry | null>('重试策略', value.retryJSON || '', null)
    const responseHeaders = parseJSON<HeaderPolicy>('响应头策略', value.responseHeadersJSON || '', {})
    const middlewares = parseJSON<GatewayMiddleware[]>('中间件', value.middlewaresJSON || '', [])
    const metadata = parseJSON<Record<string, string> | null>('Metadata', value.metadataJSON || '', null)
    if (retry === undefined || responseHeaders === undefined || middlewares === undefined || metadata === undefined) {
      return undefined
    }

    return {
      name: value.name.trim(),
      description: value.description || '',
      enabled: value.enabled !== false,
      priority: Number(value.priority || 0),
      match: { expression: value.match.expression.trim() },
      rewrites: value.rewrites.map((rule) => ({
        name: rule.name.trim(),
        priority: Number(rule.priority || 0),
        match: {
          expression: rule.match.expression.trim(),
          terminal: rule.match.terminal === true
        },
        actions: rule.actions.map((action) => ({
          type: action.type,
          params: action.params || {}
        }))
      })),
      upstream: {
        protocol: value.upstream.protocol || 'HTTP',
        timeoutMs: Number(value.upstream.timeoutMs || 0),
        backends: value.upstream.backends.map((target) => ({ target })),
        retry
      },
      response: {
        format: value.responseFormat === true,
        headers: responseHeaders || {}
      },
      middlewares: middlewares || [],
      metadata
    }
  }

  const handleSubmit = async () => {
    if (!routeFormRef.value) return
    const valid = await routeFormRef.value.validate().catch(() => false)
    if (!valid) return

    const inputError = validateRouteInput(currentData.value)
    if (inputError) {
      ElMessage.error(inputError)
      return
    }

    const req = buildRequest(currentData.value)
    if (!req) return

    savingRoute.value = true
    try {
      if (dialogType.value === 'add') {
        await CreateRoute(req)
        ElMessage.success('创建成功（草稿态，发布后生效）')
        refreshCreate()
      } else if (currentData.value.id) {
        await UpdateRoute(currentData.value.id, req)
        ElMessage.success('修改成功（草稿态，发布后生效）')
        refreshUpdate()
      }
      dialogVisible.value = false
    } finally {
      savingRoute.value = false
    }
  }

  const handleUpdateStatus = (item: GatewayRoute): (() => Promise<boolean>) => {
    return (): Promise<boolean> => {
      return new Promise((resolve) => {
        ElMessageBox.confirm('您确定修改路由状态？', '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(async () => {
            const inputError = validateRouteInput(toForm(item))
            if (inputError) {
              ElMessage.error(inputError)
              resolve(false)
              return
            }
            const req = buildRequest(toForm(item))
            if (!req) {
              resolve(false)
              return
            }
            req.enabled = !item.enabled
            await UpdateRoute(item.id, req)
            ElMessage.success('修改成功（草稿态，发布后生效）')
            refreshUpdate()
            resolve(true)
          })
          .catch(() => resolve(false))
      })
    }
  }

  const publishVisible = ref(false)
  const publishForm = ref<{ remark: string }>({ remark: '' })
  const publishItems = [
    {
      key: 'remark',
      label: '发布说明',
      type: 'input',
      props: {
        placeholder: '本次变更说明（审计用）',
        maxlength: 255,
        type: 'textarea',
        rules: [{ required: true, message: '请填写发布说明', trigger: ['blur', 'change'] }]
      }
    }
  ]

  const doPublish = async () => {
    const res = await Publish({ remark: publishForm.value.remark })
    publishVisible.value = false
    ElMessage.success(`发布成功，版本 v${res.version}`)
    refreshData()
  }

  const historyVisible = ref(false)
  const historyLoading = ref(false)
  const historyRows = ref<HistoryItem[]>([])

  const showHistory = async () => {
    historyVisible.value = true
    historyLoading.value = true
    try {
      const res = await ListHistory({ page: 1, size: 50 })
      historyRows.value = res.list || []
    } finally {
      historyLoading.value = false
    }
  }

  const rollbackVisible = ref(false)
  const rollbackForm = ref<{ version: number; remark: string }>({ version: 0, remark: '' })
  const rollbackItems = computed(() => [
    {
      key: 'version',
      label: '目标版本',
      type: 'number',
      props: { min: 1, disabled: true, rules: [{ required: true, message: '请选择版本', trigger: ['change'] }] }
    },
    {
      key: 'remark',
      label: '回滚说明',
      type: 'input',
      props: { placeholder: '回滚原因（审计用）', maxlength: 255, type: 'textarea' }
    }
  ])

  const showRollback = (version: number) => {
    rollbackForm.value = { version, remark: '' }
    rollbackVisible.value = true
  }

  const doRollback = async () => {
    const res = await Rollback({ version: rollbackForm.value.version, remark: rollbackForm.value.remark })
    rollbackVisible.value = false
    ElMessage.success(`已回滚到 v${rollbackForm.value.version}，生成新版本 v${res.version}`)
    historyVisible.value = false
    refreshData()
  }
</script>

<style lang="scss" scoped>
  .publish-guide {
    margin-bottom: 16px;
  }

  .muted,
  .section-tip {
    color: var(--el-text-color-secondary);
  }

  .section-tip {
    font-size: 12px;
    line-height: 18px;
  }

  :global(.gateway-route-dialog) {
    max-width: calc(100vw - 32px);
  }

  :global(.gateway-route-dialog .el-dialog__header) {
    padding-bottom: 12px;
    margin-right: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :global(.gateway-route-dialog .el-dialog__footer) {
    padding-top: 10px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  :global(.gateway-route-dialog-body) {
    max-height: calc(100vh - 196px);
    padding-top: 0;
    overflow-y: auto;
  }

  .route-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 0 0;

    :deep(.el-form-item) {
      margin-bottom: 10px;
    }

    :deep(.el-form-item__label) {
      padding-bottom: 4px;
      font-weight: 500;
      line-height: 18px;
      color: var(--el-text-color-regular);
    }

    :deep(.el-input-number),
    :deep(.el-select) {
      width: 100%;
    }
  }

  .route-section {
    padding: 12px 14px 0;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
  }

  .route-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
  }

  .route-section-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    color: var(--el-text-color-primary);
  }

  .expression-label {
    display: inline-flex;
    gap: 2px;
    align-items: center;
  }

  .expression-help-button {
    width: 18px;
    height: 18px;
    padding: 0;
  }

  .route-empty {
    padding: 18px 12px;
    margin-bottom: 10px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
  }

  .rule-card {
    padding: 10px 12px 4px;
    margin-bottom: 10px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .rule-card-header,
  .action-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }

  .rule-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
  }

  .rule-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 12px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 50%;
  }

  .action-list {
    padding-left: 10px;
    margin-bottom: 10px;
    border-left: 2px solid var(--el-border-color-lighter);
  }

  .action-card {
    padding: 8px 10px 0;
    margin-bottom: 8px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .action-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
  }

  .action-tip {
    padding-bottom: 8px;
    font-size: 12px;
    line-height: 17px;
    color: var(--el-text-color-secondary);
  }

  .add-action-button {
    width: 100%;
    margin-bottom: 6px;
  }

  .route-switch-line {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 32px;
  }

  .route-advanced {
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;

    :deep(.el-collapse-item__header) {
      height: 42px;
      padding: 0 14px;
      font-weight: 600;
      line-height: 42px;
      background: var(--el-fill-color-extra-light);
      border-bottom-color: var(--el-border-color-lighter);
    }

    :deep(.el-collapse-item__wrap) {
      border-bottom: 0;
    }

    :deep(.el-collapse-item__content) {
      padding: 12px 14px 0;
    }
  }

  .route-json-editor {
    :deep(.el-textarea__inner) {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      line-height: 1.6;
    }
  }

  .gateway-route-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  @media (width <= 720px) {
    .route-form :deep(.el-col) {
      flex: 0 0 100%;
      max-width: 100%;
    }

    .route-section {
      padding: 12px 12px 0;
    }

    .rule-card {
      padding: 10px 10px 4px;
    }
  }
</style>
