<template>
  <div v-if="node" class="selector-panel">
    <ElForm label-position="top" size="small">
      <ElFormItem label="名称" :error="fieldError('name')">
        <ElInput v-model="node.name" />
      </ElFormItem>

      <div v-for="(b, i) in branches" :key="b.id" class="sp-branch">
        <div class="sp-branch__head">
          <ElInput v-model="b.name" :placeholder="branchLabel(b, i)" class="sp-branch__name" />
          <ElButton text :icon="Top" :disabled="i === 0" title="上移" @click="move(i, -1)" />
          <ElButton text :icon="Bottom" :disabled="i === branches.length - 1" title="下移" @click="move(i, 1)" />
          <ElButton
            text
            type="danger"
            :icon="Delete"
            :disabled="branches.length <= 1"
            title="删除分支"
            @click="store.removeBranch(node.id, b.id)"
          />
        </div>
        <div v-if="b.conditions.length > 1" class="sp-logic">
          <ElRadioGroup :model-value="b.logic || 'and'" size="small" @update:model-value="b.logic = $event as any">
            <ElRadioButton value="and">且（全部满足）</ElRadioButton>
            <ElRadioButton value="or">或（任一满足）</ElRadioButton>
          </ElRadioGroup>
        </div>
        <div v-for="(c, j) in b.conditions" :key="j" class="sp-cond">
          <div class="sp-cond__row">
            <TemplateInput
              v-model="c.left"
              expression
              :candidates="candidates"
              placeholder="变量，如 order.amount"
              class="sp-cond__left"
            />
            <ElButton
              text
              type="danger"
              :icon="Close"
              :disabled="b.conditions.length <= 1"
              title="删除条件"
              @click="b.conditions.splice(j, 1)"
            />
          </div>
          <div class="sp-cond__row">
            <ElSelect :model-value="c.operator" class="sp-cond__op" @update:model-value="setOperator(c, $event)">
              <ElOption v-for="o in OPERATORS" :key="o.value" :label="o.label" :value="o.value" />
            </ElSelect>
            <TemplateInput
              v-if="needRight(c)"
              :model-value="rightText(c)"
              :candidates="candidates"
              placeholder="比较值，或 ${变量}"
              class="sp-cond__right"
              @update:model-value="c.right = $event"
            />
          </div>
          <div v-if="condError(i, j)" class="sp-error">{{ condError(i, j) }}</div>
        </div>
        <ElButton
          text
          type="primary"
          :icon="Plus"
          :disabled="b.conditions.length >= MAX_CONDITIONS"
          @click="b.conditions.push({ left: '', operator: 'eq', right: '' })"
        >
          添加条件
        </ElButton>
      </div>

      <ElButton :icon="Plus" :disabled="branches.length >= MAX_BRANCHES" class="sp-add" @click="addBranch">
        添加分支
      </ElButton>
      <div class="sp-else">否则：以上分支都不满足时走"否则"端口</div>
      <div v-if="fieldError('branches')" class="sp-error">{{ fieldError('branches') }}</div>
      <div class="sp-tip">按顺序判断，命中第一个满足的分支即走对应端口，其余端口的下游节点被跳过。</div>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Bottom, Close, Delete, Plus, Top } from '@element-plus/icons-vue'
  import { useChainEditorStore } from '@/store/modules/chain-editor'
  import TemplateInput from './TemplateInput.vue'
  import type { Branch, Condition, Operator } from '../../types/dsl'
  import type { VariableCandidate } from '../../types/graph'
  import type { Issue } from '../../types/issue'
  import { branchLabel, newBranch } from '../../utils/branch'
  import { MAX_BRANCHES, MAX_CONDITIONS, OPERATORS } from '../../utils/constants'

  // 分支器属性：分支按顺序判断，每个分支由条件组合（且 / 或）
  defineOptions({ name: 'SelectorPanel' })

  const props = withDefaults(defineProps<{ issues?: Issue[]; candidates?: VariableCandidate[] }>(), {
    issues: () => [],
    candidates: () => []
  })

  const store = useChainEditorStore()
  const node = computed(() => store.selectedNode)
  const branches = computed<Branch[]>(() => node.value?.branches || [])

  function fieldError(field: string): string {
    return props.issues.find((i) => i.field === field || i.field.startsWith(`${field}.`))?.message || ''
  }

  function condError(i: number, j: number): string {
    return fieldError(`branches.${i}.conditions.${j}`)
  }

  function needRight(c: Condition): boolean {
    return OPERATORS.find((o) => o.value === c.operator)?.right !== false
  }

  /** 比较值以文本编辑：非字符串字面量按 JSON 展示 */
  function rightText(c: Condition): string {
    if (c.right === undefined || c.right === null) return ''
    return typeof c.right === 'string' ? c.right : JSON.stringify(c.right)
  }

  /** 切到一元运算符时清掉比较值 */
  function setOperator(c: Condition, op: Operator) {
    c.operator = op
    if (!needRight(c)) delete c.right
    else if (c.right === undefined) c.right = ''
  }

  function addBranch() {
    const n = node.value
    if (!n) return
    n.branches = n.branches || []
    n.branches.push(newBranch(n.branches))
  }

  /** 调整分支顺序（判断顺序随之改变） */
  function move(i: number, delta: number) {
    const list = node.value?.branches
    if (!list) return
    const j = i + delta
    if (j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
  }
</script>

<style scoped lang="scss">
  .sp-branch {
    padding: 8px;
    margin-bottom: 10px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
  }

  .sp-branch__head {
    display: flex;
    gap: 2px;
    align-items: center;
    margin-bottom: 6px;

    .el-button + .el-button {
      margin-left: 0;
    }
  }

  .sp-branch__name {
    flex: 1;
  }

  .sp-logic {
    margin-bottom: 6px;
  }

  .sp-cond {
    padding: 6px;
    margin-bottom: 6px;
    background: var(--el-bg-color);
    border-radius: 4px;
  }

  .sp-cond__row {
    display: flex;
    gap: 6px;
    align-items: center;

    & + & {
      margin-top: 6px;
    }
  }

  .sp-cond__left,
  .sp-cond__right {
    flex: 1;
    min-width: 0;
  }

  .sp-cond__op {
    flex-shrink: 0;
    width: 120px;
  }

  .sp-add {
    width: 100%;
  }

  .sp-else {
    padding: 8px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-lighter);
    border-radius: 4px;
  }

  .sp-error {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-color-danger);
  }

  .sp-tip {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }
</style>
