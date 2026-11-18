<template>
  <div v-if="node" class="node-panel">
    <ElForm label-position="top" size="small" :disabled="disabled">
      <!-- 插件定义只配置任务本身：节点标识、执行方式、触发、输出名等由使用插件的节点决定 -->
      <ElFormItem v-if="definition" label="任务类型" :error="fieldError('type')">
        <ElSelect :model-value="node.type" placeholder="必选" @update:model-value="onTypeChange">
          <ElOption label="API" value="api" />
          <ElOption label="脚本" value="script" />
        </ElSelect>
      </ElFormItem>
      <template v-else>
        <ElDivider content-position="left">基本</ElDivider>
        <ElFormItem label="节点 ID" :error="fieldError('id')">
          <div class="np-inline">
            <ElInput v-model="idDraft" @change="onIdChange" />
            <ElButton v-if="node.mode === 'trigger'" :icon="CopyDocument" @click="copyId">复制 ID</ElButton>
          </div>
          <div v-if="isWarn" class="np-tip is-warn">复制产生的 ID，请改为可读、稳定的值</div>
        </ElFormItem>
        <ElFormItem label="名称" :error="fieldError('name')">
          <ElInput v-model="node.name" />
        </ElFormItem>
        <ElRow :gutter="8">
          <ElCol :span="12">
            <ElFormItem label="执行方式" :error="fieldError('mode')">
              <ElSelect :model-value="node.mode || 'auto'" @update:model-value="onModeChange">
                <ElOption label="自动执行（前驱完成后执行）" value="auto" />
                <ElOption label="被动触发（等外部触发后执行）" value="trigger" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol v-if="node.plugin" :span="12">
            <ElFormItem label="任务类型">
              <ElInput :model-value="pluginTypeLabel" disabled />
            </ElFormItem>
          </ElCol>
          <ElCol v-else :span="12">
            <ElFormItem label="任务类型" :error="fieldError('type')">
              <ElSelect :model-value="node.type" placeholder="必选" @update:model-value="onTypeChange">
                <ElOption label="API" value="api" />
                <ElOption label="脚本" value="script" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <template v-if="node.mode === 'trigger'">
          <ElDivider content-position="left">触发设置</ElDivider>
          <ElAlert type="info" :closable="false" class="np-alert">
            <div>外部触发接口：<code>POST /cron/api/v1/open/chain/trigger</code></div>
            <div
              >必填参数：<code>rid</code>（运行 ID）、<code>nid</code>（{{ node.id }}）、<code>trx</code>、<code
                >body</code
              ></div
            >
            <div
              >调用需 AK/SK 签名。需要通知外部系统时，在前面加一个 api 节点传 <code>${run.id}</code> 和本节点 id。</div
            >
          </ElAlert>
          <ElFormItem label="触发数据规则（body）" :error="fieldError('body')">
            <FieldRuleEditor v-model="node.body" />
          </ElFormItem>
          <ElFormItem label="最长待触发时长（默认 7 天）" :error="fieldError('waitTimeout')">
            <div class="np-inline">
              <ElInputNumber v-model="waitParts.d" :min="0" controls-position="right" class="np-num" />
              <span>天</span>
              <ElInputNumber v-model="waitParts.h" :min="0" :max="23" controls-position="right" class="np-num" />
              <span>时</span>
              <ElInputNumber v-model="waitParts.m" :min="0" :max="59" controls-position="right" class="np-num" />
              <span>分</span>
            </div>
          </ElFormItem>
          <ElFormItem label="超时动作" :error="fieldError('timeoutAction')">
            <ElSelect v-model="node.timeoutAction" placeholder="fail（默认）" clearable>
              <ElOption label="fail：运行直接失败" value="fail" />
              <ElOption label="break：运行中断" value="break" />
              <ElOption label="continue：节点忽略并继续" value="continue" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem
            v-if="node.timeoutAction === 'continue'"
            label="超时输出（timeoutOutput）"
            :error="fieldError('timeoutOutput')"
          >
            <JsonInput v-model="node.timeoutOutput" :rows="2" />
          </ElFormItem>
        </template>
      </template>

      <ElDivider v-if="!definition" content-position="left">任务设置</ElDivider>
      <div v-if="node.mode === 'trigger'" class="np-tip">任务在触发后执行，可引用 ${trigger.body.*}</div>
      <PluginParams v-if="node.plugin" :issues="issues" :candidates="candidates" />
      <template v-if="!definition && node.plugin">
        <ElFormItem label="准入条件（condition）" :error="fieldError('condition') || fieldError('skipOutput')">
          <TemplateInput
            v-model="node.condition"
            :candidates="conditionCandidates"
            placeholder='如 ${input.type} == "book" 或 ${quarkPlan.ok} == true；留空继承插件默认条件'
          />
          <div class="np-tip">
            当前节点入参可用
            <code>${input.*}</code>
            引用；留空时使用插件的默认准入条件；条件不满足时跳过当前节点，不执行、不重试、不挂起。
          </div>
        </ElFormItem>
        <ElFormItem v-if="node.condition" label="跳过时的输出（skipOutput）" :error="fieldError('skipOutput')">
          <JsonInput
            v-model="node.skipOutput"
            :rows="2"
            placeholder="条件不满足时写入 outputName 的 JSON，留空为 null"
          />
        </ElFormItem>
      </template>
      <template v-else-if="node.type === 'api'">
        <ElRow :gutter="8">
          <ElCol :span="8">
            <ElFormItem label="方法" :error="fieldError('method')">
              <ElSelect v-model="node.method">
                <ElOption v-for="m in HTTP_METHODS" :key="m" :label="m" :value="m" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="16">
            <ElFormItem label="地址（url）" :error="fieldError('url')">
              <TemplateInput v-model="node.url" :candidates="candidates" placeholder="http(s)://..." />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="请求头（header）" :error="fieldError('header')">
          <InputParams
            v-model="node.header"
            :candidates="candidates"
            name-label="请求头"
            key-prefix="X-Header-"
            value-placeholder="请求头的值，或点 + / 输入 ${ 选择变量"
            string-only
          />
        </ElFormItem>
      </template>
      <template v-else-if="node.type === 'script'">
        <ElFormItem label="请求参数（input）" :error="fieldError('input')">
          <InputParams
            v-model="node.input"
            v-model:internal="node.internal"
            :candidates="candidates"
            :allow-internal="definition"
          />
        </ElFormItem>
        <ElFormItem v-if="definition" label="准入条件（condition）" :error="fieldError('condition')">
          <TemplateInput
            v-model="node.condition"
            :candidates="definitionConditionCandidates"
            placeholder='如 ${input.type} == "book"；留空表示始终执行'
          />
          <div class="np-tip">
            插件默认准入条件，只能引用当前节点入参 <code>${input.*}</code>；使用插件的节点可覆盖。
          </div>
        </ElFormItem>
        <template v-else>
          <ElFormItem label="准入条件（condition）" :error="fieldError('condition') || fieldError('skipOutput')">
            <TemplateInput
              v-model="node.condition"
              :candidates="conditionCandidates"
              placeholder='如 ${input.type} == "book" 或 ${quarkPlan.ok} == true；留空表示始终执行'
            />
            <div class="np-tip">
              当前节点入参可用 <code>${input.*}</code>
              引用；条件不满足时跳过当前节点，不执行、不重试、不挂起；后续节点仍会继续。
            </div>
          </ElFormItem>
          <ElFormItem v-if="node.condition" label="跳过时的输出（skipOutput）" :error="fieldError('skipOutput')">
            <JsonInput
              v-model="node.skipOutput"
              :rows="2"
              placeholder="条件不满足时写入 outputName 的 JSON，留空为 null"
            />
          </ElFormItem>
        </template>
        <ElFormItem label="脚本代码" :error="fieldError('code')">
          <ScriptCode v-model="node.code" :readonly="disabled" />
        </ElFormItem>
      </template>
      <template v-else-if="node.type === 'chain'">
        <ElFormItem label="目标流程" :error="fieldError('chain')">
          <ElSelect v-model="node.chain" filterable placeholder="选择要调用的流程" class="np-full">
            <ElOption v-for="c in chainOptions" :key="c.keyword" :label="c.name" :value="c.keyword" />
          </ElSelect>
          <div class="np-tip">同步调用：节点输入作为子链入参，输出为子链最终输出；不允许嵌套调用</div>
        </ElFormItem>
        <ElFormItem label="请求参数（input，子链入参）" :error="fieldError('input')">
          <InputParams
            v-model="node.input"
            v-model:internal="node.internal"
            :candidates="candidates"
            :allow-internal="definition"
          />
        </ElFormItem>
        <ElFormItem v-if="definition" label="准入条件（condition）" :error="fieldError('condition')">
          <TemplateInput
            v-model="node.condition"
            :candidates="definitionConditionCandidates"
            placeholder='如 ${input.type} == "book"；留空表示始终执行'
          />
          <div class="np-tip">
            插件默认准入条件，只能引用当前节点入参 <code>${input.*}</code>；使用插件的节点可覆盖。
          </div>
        </ElFormItem>
        <template v-else>
          <ElFormItem label="准入条件（condition）" :error="fieldError('condition') || fieldError('skipOutput')">
            <TemplateInput
              v-model="node.condition"
              :candidates="conditionCandidates"
              placeholder='如 ${input.type} == "book" 或 ${quarkPlan.ok} == true；留空表示始终执行'
            />
            <div class="np-tip">
              当前节点入参可用 <code>${input.*}</code>
              引用；条件不满足时跳过当前节点，不执行、不重试、不挂起；后续节点仍会继续。
            </div>
          </ElFormItem>
          <ElFormItem v-if="node.condition" label="跳过时的输出（skipOutput）" :error="fieldError('skipOutput')">
            <JsonInput
              v-model="node.skipOutput"
              :rows="2"
              placeholder="条件不满足时写入 outputName 的 JSON，留空为 null"
            />
          </ElFormItem>
        </template>
      </template>
      <template v-else-if="node.type === 'loop'">
        <div class="np-tip">循环体请双击循环节点进入子画布编辑；此处只配置循环参数</div>
        <ElRow :gutter="8">
          <ElCol :span="12">
            <ElFormItem label="循环模式">
              <ElSelect v-model="node.loop!.mode">
                <ElOption label="次数（count）" value="count" />
                <ElOption label="集合（each）" value="each" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol v-if="node.loop?.mode === 'count'" :span="12">
            <ElFormItem label="循环次数" :error="fieldError('loop.times')">
              <ElInputNumber v-model="node.loop!.times" :min="1" :max="1000" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <template v-if="node.loop?.mode === 'each'">
          <ElFormItem label="遍历集合（items）" :error="fieldError('loop.items')">
            <TemplateInput v-model="node.loop!.items" :candidates="candidates" placeholder="${request.body.items}" />
          </ElFormItem>
          <ElFormItem label="迭代变量（itemVar）">
            <ElInput v-model="node.loop!.itemVar" placeholder="item" />
          </ElFormItem>
        </template>
      </template>
      <ElFormItem
        v-if="!node.plugin && node.type !== 'script'"
        label="请求参数（input）"
        :error="fieldError('input') || fieldError('files')"
      >
        <InputParams
          v-model="node.input"
          v-model:files="node.files"
          v-model:internal="node.internal"
          :candidates="candidates"
          :allow-files="node.requestType === 'multipart'"
          :allow-internal="definition"
        />
      </ElFormItem>
      <ElFormItem
        v-if="definition && node.type === 'api'"
        label="准入条件（condition）"
        :error="fieldError('condition')"
      >
        <TemplateInput
          v-model="node.condition"
          :candidates="definitionConditionCandidates"
          placeholder='如 ${input.type} == "book"；留空表示始终执行'
        />
        <div class="np-tip">
          插件默认准入条件，只能引用当前节点入参 <code>${input.*}</code>；使用插件的节点可覆盖。
        </div>
      </ElFormItem>
      <template v-if="!definition && !isLoopNode && !node.plugin && node.type !== 'script' && node.type !== 'chain'">
        <ElFormItem label="准入条件（condition）" :error="fieldError('condition') || fieldError('skipOutput')">
          <TemplateInput
            v-model="node.condition"
            :candidates="conditionCandidates"
            placeholder='如 ${input.type} == "book" 或 ${quarkPlan.ok} == true；留空表示始终执行'
          />
          <div class="np-tip">
            当前节点入参可用
            <code>${input.*}</code> 引用；条件不满足时跳过当前节点，不执行、不重试、不挂起；后续节点仍会继续。
          </div>
        </ElFormItem>
        <ElFormItem v-if="node.condition" label="跳过时的输出（skipOutput）" :error="fieldError('skipOutput')">
          <JsonInput
            v-model="node.skipOutput"
            :rows="2"
            placeholder="条件不满足时写入 outputName 的 JSON，留空为 null"
          />
        </ElFormItem>
      </template>
      <ElFormItem v-if="!definition" label="输出名（outputName）" :error="fieldError('outputName')">
        <ElInput v-model="node.outputName" placeholder="结果挂载到上下文的键，留空表示不挂载" clearable />
      </ElFormItem>
      <div v-if="!definition && node.plugin" class="np-tip np-plugin-output">
        <span class="np-plugin-output__label">输出（由插件决定）：</span>
        <span v-if="pluginOutput.fields.length" class="np-plugin-output__values">
          <code v-for="o in pluginOutput.fields" :key="o">{{ o }}</code>
        </span>
        <span v-else>{{ pluginOutput.has ? '整体输出' : '无' }}</span>
      </div>
      <!-- 插件节点的输出由插件决定，不能修改 -->
      <ElFormItem v-if="!node.plugin" :error="fieldError('output')">
        <template #label>
          <span class="np-label">
            输出映射（output）
            <ElButton link type="primary" :icon="QuestionFilled" @click="outputHelpVisible = true">怎么配置</ElButton>
          </span>
        </template>
        <InputParams
          v-model="node.output"
          :candidates="resultCandidates"
          name-label="字段"
          key-prefix="field"
          :value-placeholder="`如 \${${resultRoot}.data.id}，输入 \${ 选择`"
        />
        <OutputHelp v-model="outputHelpVisible" :root="resultRoot" />
      </ElFormItem>
      <!-- api：请求 / 响应格式与成功判定（放在输出映射之后） -->
      <template v-if="!node.plugin && node.type === 'api'">
        <ElRow :gutter="8">
          <ElCol :span="12">
            <ElFormItem label="请求格式">
              <ElSelect
                :model-value="node.requestType"
                placeholder="json（默认）"
                clearable
                @update:model-value="onRequestTypeChange"
              >
                <ElOption v-for="t in REQUEST_TYPES" :key="t" :label="t" :value="t" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="响应格式">
              <ElSelect v-model="node.responseType" placeholder="json（默认）" clearable>
                <ElOption v-for="t in BODY_TYPES" :key="t" :label="t" :value="t" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="成功判定（responseCondition）" :error="fieldError('responseCondition')">
          <TemplateInput
            v-model="node.responseCondition"
            :candidates="resultCandidates"
            placeholder="如 ${response.code} == 200，留空表示 HTTP 2xx 即成功"
          />
        </ElFormItem>
        <ElFormItem label="失败信息（errorMsg）" :error="fieldError('errorMsg')">
          <ElInput v-model="node.errorMsg" placeholder="如 ${response.msg}" />
        </ElFormItem>
      </template>
      <!-- 通用任务设置（超时 / 重试 / 挂起 / 忽略错误 / 提前返回）：控制节点（loop）不适用 -->
      <template v-if="!isLoopNode">
        <ElRow :gutter="8">
          <ElCol :span="12">
            <ElFormItem :label="`单次超时（秒，≤${DEFAULT_MAX_TIMEOUT}）`" :error="fieldError('timeout')">
              <ElInputNumber
                v-model="node.timeout"
                :min="1"
                :max="DEFAULT_MAX_TIMEOUT"
                :placeholder="timeoutPlaceholder"
                controls-position="right"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="总超时（秒，含重试）" :error="fieldError('totalTimeout')">
              <ElInputNumber v-model="node.totalTimeout" :min="1" placeholder="不限" controls-position="right" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="重试策略（按顺序匹配）" :error="fieldError('retry')">
          <div class="np-retry">
            <div v-for="(p, i) in node.retry || []" :key="i" class="np-retry__item">
              <div class="np-retry__match">
                <div class="np-retry__field">
                  <span>错误类型</span>
                  <ElSelect v-model="p.errors" multiple collapse-tags collapse-tags-tooltip placeholder="可空，多选">
                    <ElOption v-for="e in ERROR_NAMES" :key="e" :label="e" :value="e" />
                  </ElSelect>
                </div>
                <div class="np-retry__field">
                  <span>重试条件</span>
                  <div class="np-retry__control">
                    <TemplateInput
                      v-model="p.condition"
                      :candidates="retryConditionCandidates"
                      placeholder="如 ${error.status} == 503"
                    />
                    <ElTooltip content="重试条件说明" placement="top">
                      <ElButton class="np-retry__help" text :icon="QuestionFilled" @click="retryHelpVisible = true" />
                    </ElTooltip>
                  </div>
                </div>
              </div>
              <div class="np-inline">
                <span>退避</span>
                <ElButton text type="danger" :icon="Delete" @click="removeRetry(i)" />
              </div>
              <div class="np-retry__grid">
                <ElInputNumber
                  v-model="p.maxAttempts"
                  :min="0"
                  :max="5"
                  placeholder="次数 3"
                  controls-position="right"
                />
                <ElInputNumber v-model="p.interval" :min="0" placeholder="间隔 1s" controls-position="right" />
                <ElInputNumber v-model="p.backoffRate" :min="1" placeholder="倍率 2" controls-position="right" />
                <ElInputNumber
                  v-model="p.maxDelay"
                  :min="0"
                  :max="60"
                  placeholder="上限 60s"
                  controls-position="right"
                />
                <ElSelect v-model="p.jitter" placeholder="抖动 NONE" clearable>
                  <ElOption label="NONE" value="NONE" />
                  <ElOption label="FULL" value="FULL" />
                </ElSelect>
              </div>
              <div v-if="fieldError(`retry.${i}`)" class="np-tip is-error">{{ fieldError(`retry.${i}`) }}</div>
            </div>
            <ElButton text type="primary" :icon="Plus" @click="addRetry">添加重试策略</ElButton>
          </div>
        </ElFormItem>
        <SuspendPanel v-if="definition || !store.editingLoopId" :target="target" :issues="issues" />
        <ElFormItem v-if="!definition" :error="fieldError('ignoreError') || fieldError('fallbackOutput')">
          <ElCheckbox v-model="node.ignoreError">失败时忽略错误并继续</ElCheckbox>
          <JsonInput
            v-if="node.ignoreError"
            v-model="node.fallbackOutput"
            :rows="2"
            placeholder="兜底输出（JSON），留空为 null"
          />
        </ElFormItem>
        <ElFormItem v-if="!definition" :error="fieldError('nowResponse')">
          <ElCheckbox v-model="node.nowResponse">成功后提前返回调用方</ElCheckbox>
        </ElFormItem>
      </template>
    </ElForm>
    <RetryConditionHelp v-model="retryHelpVisible" />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { CopyDocument, Delete, Plus, QuestionFilled } from '@element-plus/icons-vue'
  import { useChainEditorStore } from '@/store/modules/chain-editor'
  import { listAllChains } from '../../utils/options'
  import FieldRuleEditor from './FieldRuleEditor.vue'
  import JsonInput from './JsonInput.vue'
  import TemplateInput from './TemplateInput.vue'
  import PluginParams from './PluginParams.vue'
  import ScriptCode from './ScriptCode.vue'
  import InputParams from './InputParams.vue'
  import OutputHelp from './OutputHelp.vue'
  import RetryConditionHelp from './RetryConditionHelp.vue'
  import SuspendPanel from './SuspendPanel.vue'
  import type { Node, NodeMode, TaskType } from '../../types/dsl'
  import type { VariableCandidate } from '../../types/graph'
  import type { Issue } from '../../types/issue'
  import {
    BODY_TYPES,
    DEFAULT_MAX_TIMEOUT,
    ERROR_NAMES,
    HTTP_METHODS,
    NODE_ID_PATTERN,
    REQUEST_TYPES,
    SCRIPT_TEMPLATE
  } from '../../utils/constants'
  defineOptions({ name: 'NodePanel' })

  const props = withDefaults(
    defineProps<{
      issues?: Issue[]
      candidates?: VariableCandidate[]
      isWarn?: boolean
      /** 编辑指定节点（插件定义）；不传 = 编辑器中选中的节点 */
      target?: Node
      /** 插件定义模式：只显示任务配置（任务类型、请求 / 脚本、入参、输出映射、超时、重试） */
      definition?: boolean
      disabled?: boolean
    }>(),
    { issues: () => [], candidates: () => [], isWarn: false, target: undefined, definition: false, disabled: false }
  )

  // 编辑对象：插件定义传入 target；否则取编辑器 store 中选中的节点，由 store 记录历史
  const store = useChainEditorStore()

  const outputHelpVisible = ref(false)
  const retryHelpVisible = ref(false)

  /** 输出映射引用执行结果的根：脚本 output（handler 返回值），api response（HTTP 响应） */
  /** 循环节点为控制节点：不展示超时 / 重试等任务通用设置 */
  const isLoopNode = computed(() => node.value?.type === 'loop')

  /** 可调用的流程（目标流程下拉） */
  const chainOptions = ref<{ name: string; keyword: string }[]>([])
  onMounted(() => {
    listAllChains().then(
      (list) => (chainOptions.value = (list || []).map((c) => ({ name: c.name, keyword: c.keyword })))
    )
  })

  const resultRoot = computed(() => (node.value?.type === 'script' ? 'output' : 'response'))
  const pluginOutput = computed(() => {
    const n = node.value
    if (!n?.plugin) return { fields: [] as string[], has: false }
    const output = store.specOf(n)?.config?.output
    if (output && typeof output === 'object' && !Array.isArray(output)) {
      return { fields: Object.keys(output), has: true }
    }
    return { fields: [] as string[], has: output !== undefined && output !== null && output !== '' }
  })
  const resultCandidates = computed(() => [
    { path: resultRoot.value, group: node.value?.type === 'script' ? '脚本返回值' : 'HTTP 响应' }
  ])

  /** 重试条件只暴露错误上下文，和成功判定一样使用 ${...} 变量写法。 */
  const retryConditionCandidates: VariableCandidate[] = [
    { path: 'error.type', group: '错误' },
    { path: 'error.status', group: '错误' },
    { path: 'error.message', group: '错误' },
    { path: 'error.body', group: '错误' }
  ]
  const node = computed(() => props.target ?? store.selectedNode)

  /** 当前节点入参的字段路径；插件节点合并插件默认值与节点覆盖值。 */
  function inputPaths(prefix: string, value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.flatMap((item, i) => {
        const path = `${prefix}.${i}`
        return [path, ...inputPaths(path, item)]
      })
    }
    if (value && typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => {
        const path = `${prefix}.${key}`
        return [path, ...inputPaths(path, item)]
      })
    }
    return []
  }

  const conditionCandidates = computed<VariableCandidate[]>(() => {
    const n = node.value
    if (!n) return props.candidates
    let input = n.input
    if (n.plugin) {
      const specInput = store.specOf(n)?.config?.input
      const defaults = specInput && typeof specInput === 'object' && !Array.isArray(specInput) ? specInput : {}
      const overrides = n.input && typeof n.input === 'object' && !Array.isArray(n.input) ? n.input : {}
      input = { ...defaults, ...overrides }
    }
    if (input === undefined || input === null) return props.candidates
    const group = '当前节点入参'
    return [
      { path: 'input', group },
      ...inputPaths('input', input).map((path) => ({ path, group })),
      ...props.candidates
    ]
  })

  /** 插件定义的准入条件只能引用当前节点入参，不提供运行信息等其它变量。 */
  const definitionConditionCandidates = computed<VariableCandidate[]>(() => {
    const input = node.value?.input
    const group = '当前节点入参'
    const paths = input && typeof input === 'object' && !Array.isArray(input) ? inputPaths('input', input) : []
    return [{ path: 'input', group }, ...paths.map((path) => ({ path, group }))]
  })

  const emit = defineEmits<{ rename: [oldId: string, newId: string] }>()

  /** api 专属字段（切换任务类型时清空） */
  const API_FIELDS = [
    'method',
    'url',
    'header',
    'responseCondition',
    'errorMsg',
    'requestType',
    'responseType',
    'files'
  ] as const

  /** 触发字段（切换为自动执行时清空） */
  const TRIGGER_FIELDS = ['body', 'waitTimeout', 'timeoutAction', 'timeoutOutput'] as const

  /** 字段问题：精确匹配或其子路径（如 retry.0.maxAttempts 归到 retry.0） */
  function fieldError(field: string): string {
    const hit = props.issues.find((i) => i.field === field || i.field.startsWith(`${field}.`))
    return hit ? hit.message : ''
  }

  // ---------- 模板节点 / 文件上传 ----------

  const spec = computed(() => (node.value ? store.specOf(node.value) : undefined))

  const pluginTypeLabel = computed(() => {
    const t = spec.value?.type || store.pluginOf(node.value?.plugin)?.type
    return t === 'script' ? '脚本（插件提供）' : t === 'api' ? 'API（插件提供）' : '由插件提供'
  })

  /** 超时占位：模板节点显示模板默认值 */
  const timeoutPlaceholder = computed(() => {
    const d = node.value?.plugin ? spec.value?.config?.timeout : undefined
    return d ? `插件默认 ${d}` : '60'
  })

  function onRequestTypeChange(v: string) {
    const n = node.value as Node
    n.requestType = (v || undefined) as Node['requestType']
    // files 只能用于 multipart
    if (n.requestType !== 'multipart') delete n.files
  }

  // ---------- 节点 ID ----------

  const idDraft = ref(node.value?.id || '')
  watch(
    () => node.value?.id,
    (v) => (idDraft.value = v || '')
  )

  async function onIdChange(v: string) {
    const n = node.value
    if (!n) return
    const next = v.trim()
    if (next === n.id) return
    if (!NODE_ID_PATTERN.test(next)) {
      ElMessage.warning('节点 ID 只能包含字母、数字、_、-，长度 1～64')
      idDraft.value = n.id
      return
    }
    if (store.rule.nodes.some((x) => x.id === next)) {
      ElMessage.warning(`节点 ID ${next} 已存在`)
      idDraft.value = n.id
      return
    }
    try {
      await ElMessageBox.confirm(
        '修改节点 ID 等同于删除旧节点、新增新节点，外部系统引用的 ID 将失效。确认修改？',
        '修改节点 ID',
        {
          type: 'warning'
        }
      )
      emit('rename', n.id, next)
    } catch {
      idDraft.value = n.id
    }
  }

  async function copyId() {
    if (!node.value) return
    try {
      await navigator.clipboard.writeText(node.value.id)
      ElMessage.success('已复制节点 ID')
    } catch {
      ElMessage.warning(`复制失败，请手动复制：${node.value.id}`)
    }
  }

  // ---------- 节点类型 / 任务类型切换 ----------

  function hasAny(keys: readonly (keyof Node)[]): boolean {
    const n = node.value as Node
    return keys.some((k) => n[k] !== undefined && n[k] !== null && n[k] !== '')
  }

  function clearFields(keys: readonly (keyof Node)[]) {
    const n = node.value as Node
    keys.forEach((k) => delete n[k])
  }

  async function confirmClear(msg: string): Promise<boolean> {
    try {
      await ElMessageBox.confirm(msg, '切换类型', { type: 'warning' })
      return true
    } catch {
      return false
    }
  }

  async function onModeChange(mode: NodeMode) {
    const n = node.value
    if (!n || (n.mode || 'auto') === mode) return
    if (mode === 'auto' && hasAny(TRIGGER_FIELDS)) {
      if (!(await confirmClear('切换为自动执行将清空触发设置（body、待触发时长、超时动作），任务设置保留。确认切换？')))
        return
      clearFields(TRIGGER_FIELDS)
    }
    n.mode = mode
  }

  async function onTypeChange(type: TaskType) {
    const n = node.value
    if (!n || n.type === type) return
    if (type === 'script' && hasAny(API_FIELDS)) {
      if (!(await confirmClear('切换为脚本将清空 api 专属字段（method、url、header 等）。确认切换？'))) return
      clearFields(API_FIELDS)
    }
    if (type === 'api' && hasAny(['code'])) {
      if (!(await confirmClear('切换为 API 将清空脚本代码。确认切换？'))) return
      clearFields(['code'])
    }
    n.type = type
    if (type === 'api' && !n.method) n.method = 'POST'
    if (type === 'script' && !n.code) n.code = SCRIPT_TEMPLATE
  }

  // ---------- 待触发时长（天/时/分 ⇄ 秒） ----------

  const waitParts = reactive({
    d: undefined as number | undefined,
    h: undefined as number | undefined,
    m: undefined as number | undefined
  })
  let syncingWait = false

  watch(
    () => node.value?.waitTimeout,
    (sec) => {
      syncingWait = true
      if (!sec) {
        waitParts.d = waitParts.h = waitParts.m = undefined
      } else {
        waitParts.d = Math.floor(sec / 86400)
        waitParts.h = Math.floor((sec % 86400) / 3600)
        waitParts.m = Math.floor((sec % 3600) / 60)
      }
      syncingWait = false
    },
    { immediate: true }
  )

  watch(
    () => [waitParts.d, waitParts.h, waitParts.m],
    ([d, h, m]) => {
      if (syncingWait || !node.value) return
      const sec = (d || 0) * 86400 + (h || 0) * 3600 + (m || 0) * 60
      node.value.waitTimeout = sec > 0 ? sec : undefined
    }
  )

  // ---------- 重试 ----------

  function addRetry() {
    const n = node.value as Node
    n.retry = [...(n.retry || []), { errors: ['Chain.Timeout', 'Chain.Network', 'Chain.Http5xx'] }]
  }

  function removeRetry(i: number) {
    const n = node.value as Node
    const list = (n.retry || []).filter((_, idx) => idx !== i)
    n.retry = list.length ? list : undefined
  }
</script>

<style scoped lang="scss">
  // 带说明链接的表单标签
  .np-label {
    display: inline-flex;
    gap: 6px;
    align-items: center;

    .el-button {
      font-size: 12px;
    }
  }

  .node-panel {
    :deep(.el-form-item__label) {
      font-weight: 600;
    }

    :deep(.el-select),
    :deep(.el-input-number) {
      width: 100%;
    }
  }

  .np-inline {
    display: flex;
    gap: 6px;
    align-items: center;
    width: 100%;

    > span {
      flex-shrink: 0;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    :deep(.el-select) {
      flex: 1;
    }
  }

  .np-num {
    flex: 1;
  }

  .np-alert {
    margin-bottom: 12px;
    font-size: 12px;
    line-height: 1.6;

    code {
      padding: 0 3px;
      background: var(--el-fill-color);
      border-radius: 3px;
    }
  }

  .np-tip {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    &.is-warn {
      margin: 2px 0 0;
      color: var(--el-color-warning);
    }

    &.is-error {
      margin: 2px 0 0;
      color: var(--el-color-danger);
    }
  }

  .np-plugin-output {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    margin-top: -4px;

    code {
      padding: 0 3px;
      background: var(--el-fill-color);
      border-radius: 3px;
    }
  }

  .np-plugin-output__label {
    flex: none;
  }

  .np-plugin-output__values {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    min-width: 0;
  }

  .np-retry {
    width: 100%;
  }

  .np-retry__control {
    display: flex;
    gap: 4px;
    align-items: center;

    > :first-child {
      flex: 1;
      min-width: 0;
    }
  }

  .np-retry__help {
    flex: 0 0 auto;
    padding: 0 4px;
  }

  .np-retry__item {
    padding: 6px;
    margin-bottom: 6px;
    border: 1px dashed var(--el-border-color);
    border-radius: 4px;
  }

  .np-retry__match {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .np-retry__field {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 6px;
    align-items: center;

    > span {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .np-retry__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin-top: 4px;
  }
</style>
