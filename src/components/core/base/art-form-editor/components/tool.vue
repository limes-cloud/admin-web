<template>
  <div class="tool-box" :class="{ 'tool-box--single': single }">
    <div class="tool">
      <div v-if="!single" class="title"><span>组件属性</span></div>

      <!-- 无选中状态 -->
      <div v-if="!currentNode" class="tool-empty">
        <span>请选择组件</span>
      </div>

      <!-- 新版 FormNode 模式 -->
      <div v-if="currentNode">
        <el-form :model="currentNode" label-width="80px" label-position="left" size="small" class="tool-form">
          <!-- 字段节点配置 -->
          <template v-if="isFieldNodeType">
            <el-form-item label="字段标签">
              <el-input v-model="currentNode.label" placeholder="请输入标签" />
            </el-form-item>
            <el-form-item label="字段标识">
              <el-input v-model="currentNode.field" placeholder="请输入字段标识" />
            </el-form-item>
            <el-form-item
              v-if="
                !['number', 'radio', 'checkbox', 'upload', 'switch', 'slider', 'rate', 'colorpicker'].includes(
                  currentNode.type
                )
              "
              label="提示文本"
            >
              <el-input v-model="currentNode.config.placeholder" placeholder="请输入提示" />
            </el-form-item>
            <el-form-item
              v-if="!['upload', 'password', 'switch', 'slider', 'rate', 'colorpicker'].includes(currentNode.type)"
              label="默认值"
            >
              <el-input v-model="currentNode.config.value" placeholder="默认值" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="currentNode.config.description" type="textarea" :rows="2" placeholder="帮助文本" />
            </el-form-item>

            <!-- 数字 -->
            <template v-if="currentNode.type === 'number'">
              <el-divider>数字配置</el-divider>
              <el-form-item label="最小值"
                ><el-input-number v-model="currentNode.config.min" style="width: 100%"
              /></el-form-item>
              <el-form-item label="最大值"
                ><el-input-number v-model="currentNode.config.max" style="width: 100%"
              /></el-form-item>
              <el-form-item label="步进值"
                ><el-input-number v-model="currentNode.config.step" :min="0" style="width: 100%"
              /></el-form-item>
            </template>

            <!-- 上传 -->
            <template v-if="currentNode.type === 'upload'">
              <el-divider>上传配置</el-divider>
              <el-form-item label="文件类型">
                <el-select v-model="currentNode.config.filetype">
                  <el-option v-for="ft in fileTypes" :key="ft.value" :label="ft.label" :value="ft.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="最大文件数"
                ><el-input-number v-model="currentNode.config.limit" :min="1" style="width: 100%"
              /></el-form-item>
            </template>

            <!-- 日期/时间选择器 -->
            <template v-if="currentNode.type === 'datepicker'">
              <el-divider>日期类型</el-divider>
              <el-form-item label="类型">
                <el-select v-model="currentNode.config.dateType">
                  <el-option label="日期" value="date" />
                  <el-option label="日期时间" value="datetime" />
                  <el-option label="时间" value="time" />
                  <el-option label="周" value="week" />
                  <el-option label="月" value="month" />
                  <el-option label="年" value="year" />
                </el-select>
              </el-form-item>
            </template>

            <!-- 范围选择 -->
            <template v-if="currentNode.type === 'daterange'">
              <el-divider>范围配置</el-divider>
              <el-form-item label="范围类型">
                <el-select v-model="currentNode.config.rangeType">
                  <el-option label="日期范围" value="daterange" />
                  <el-option label="日期时间范围" value="datetimerange" />
                  <el-option label="时间范围" value="timerange" />
                  <el-option label="月份范围" value="monthrange" />
                </el-select>
              </el-form-item>
              <el-form-item label="分隔符"
                ><el-input v-model="currentNode.config.rangeSeparator" placeholder="至"
              /></el-form-item>
              <el-form-item label="起始提示"
                ><el-input v-model="currentNode.config.startPlaceholder" placeholder="开始日期"
              /></el-form-item>
              <el-form-item label="结束提示"
                ><el-input v-model="currentNode.config.endPlaceholder" placeholder="结束日期"
              /></el-form-item>
            </template>

            <!-- 颜色选择器 -->
            <template v-if="currentNode.type === 'colorpicker'">
              <el-divider>颜色配置</el-divider>
              <el-form-item label="透明度"><el-switch v-model="currentNode.config.showAlpha" /></el-form-item>
              <el-form-item label="颜色格式">
                <el-select v-model="currentNode.config.colorFormat">
                  <el-option label="HEX" value="hex" />
                  <el-option label="RGB" value="rgb" />
                  <el-option label="HSL" value="hsl" />
                </el-select>
              </el-form-item>
            </template>

            <!-- 树选择 -->
            <template v-if="currentNode.type === 'treeselect'">
              <el-divider>树选择配置</el-divider>
              <el-form-item label="多选"><el-switch v-model="currentNode.config.treeMultiple" /></el-form-item>
              <el-form-item label="父子不关联"
                ><el-switch v-model="currentNode.config.treeCheckStrictly"
              /></el-form-item>
              <el-form-item label="显示复选框"
                ><el-switch v-model="currentNode.config.treeShowCheckbox"
              /></el-form-item>
              <el-form-item label="可搜索"><el-switch v-model="currentNode.config.treeFilterable" /></el-form-item>
              <el-form-item label="数据来源">
                <el-radio-group v-model="currentNode.config.optionSource" @change="handleTreeOptionSourceChange">
                  <el-radio value="static">静态</el-radio>
                  <el-radio value="remote">远程</el-radio>
                </el-radio-group>
              </el-form-item>
              <template v-if="currentNode.config.optionSource !== 'remote'">
                <el-form-item label="树数据(JSON)">
                  <el-input
                    v-model="treeDataJson"
                    type="textarea"
                    :rows="4"
                    placeholder='[{"label":"节点1","value":"1","children":[]}]'
                    @blur="handleTreeDataJsonBlur"
                  />
                </el-form-item>
              </template>
              <template v-if="currentNode.config.optionSource === 'remote'">
                <el-form-item label="接口地址"
                  ><el-input v-model="remoteUrl" placeholder="https://api.example.com/tree"
                /></el-form-item>
                <el-form-item label="请求方式">
                  <el-select v-model="remoteMethod"
                    ><el-option label="GET" value="GET" /><el-option label="POST" value="POST"
                  /></el-select>
                </el-form-item>
                <el-form-item label="数据路径"
                  ><el-input v-model="remoteDataPath" placeholder="data.list"
                /></el-form-item>
                <el-form-item label="Label字段"
                  ><el-input v-model="remoteLabelField" placeholder="label"
                /></el-form-item>
                <el-form-item label="Value字段"
                  ><el-input v-model="remoteValueField" placeholder="value"
                /></el-form-item>
                <el-form-item label="依赖字段">
                  <el-select v-model="remoteDependsOn" multiple placeholder="选择依赖字段">
                    <el-option
                      v-for="f in availableFields"
                      :key="f.id"
                      :label="f.label || f.field"
                      :value="f.field!"
                      :disabled="f.id === currentNode.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="防抖(ms)"
                  ><el-input-number v-model="remoteDebounce" :min="0" :max="5000" :step="100" style="width: 100%"
                /></el-form-item>
              </template>
            </template>

            <!-- 长度限制 -->
            <template v-if="['input', 'textarea', 'password'].includes(currentNode.type)">
              <el-divider>长度限制</el-divider>
              <el-form-item label="最小长度"
                ><el-input-number v-model="currentNode.config.minLength" :min="0" style="width: 100%"
              /></el-form-item>
              <el-form-item label="最大长度"
                ><el-input-number v-model="currentNode.config.maxLength" :min="0" style="width: 100%"
              /></el-form-item>
            </template>

            <!-- 前缀后缀 -->
            <template v-if="['input', 'password'].includes(currentNode.type)">
              <el-divider>前缀 / 后缀</el-divider>
              <el-form-item label="前缀文本"
                ><el-input v-model="currentNode.config.prefix" placeholder="如 ¥、https://" clearable
              /></el-form-item>
              <el-form-item label="后缀文本"
                ><el-input v-model="currentNode.config.suffix" placeholder="如 元、@gmail.com" clearable
              /></el-form-item>
            </template>

            <!-- 选项 -->
            <template v-if="['radio', 'checkbox', 'select'].includes(currentNode.type)">
              <el-divider>选项配置</el-divider>
              <el-form-item label="数据来源">
                <el-radio-group v-model="currentNode.config.optionSource" @change="handleOptionSourceChange">
                  <el-radio value="static">静态</el-radio>
                  <el-radio value="remote">远程</el-radio>
                </el-radio-group>
              </el-form-item>
              <template v-if="currentNode.config.optionSource !== 'remote'">
                <VueDraggable
                  v-model="currentNode.config.options!"
                  handle=".drag-handle"
                  ghost-class="ghost"
                  class="option-drag-list"
                >
                  <div v-for="(opt, idx) in currentNode.config.options" :key="idx" class="option">
                    <el-icon class="drag-handle"><Rank /></el-icon>
                    <div class="input">
                      <el-input v-model="opt.label" placeholder="选项名称" @change="opt.value = opt.label" />
                    </div>
                    <div class="icon" @click="currentNode.config.options!.splice(idx, 1)">
                      <el-icon><Delete /></el-icon>
                    </div>
                  </div>
                </VueDraggable>
                <el-button
                  type="primary"
                  @click="currentNode.config.options!.push({ label: '新选项', value: '新选项' })"
                  >添加选项</el-button
                >
              </template>
              <template v-if="currentNode.config.optionSource === 'remote'">
                <el-form-item label="接口地址"
                  ><el-input v-model="remoteUrl" placeholder="https://api.example.com/options"
                /></el-form-item>
                <el-form-item label="请求方式">
                  <el-select v-model="remoteMethod"
                    ><el-option label="GET" value="GET" /><el-option label="POST" value="POST"
                  /></el-select>
                </el-form-item>
                <el-form-item label="数据路径"
                  ><el-input v-model="remoteDataPath" placeholder="data.list"
                /></el-form-item>
                <el-form-item label="Label字段"
                  ><el-input v-model="remoteLabelField" placeholder="label"
                /></el-form-item>
                <el-form-item label="Value字段"
                  ><el-input v-model="remoteValueField" placeholder="value"
                /></el-form-item>
                <el-form-item label="URL参数"
                  ><el-input v-model="remoteParams" placeholder="type={{type}}&id={{id}}"
                /></el-form-item>
                <el-form-item label="依赖字段">
                  <el-select v-model="remoteDependsOn" multiple placeholder="选择依赖字段">
                    <el-option
                      v-for="f in availableFields"
                      :key="f.id"
                      :label="f.label || f.field"
                      :value="f.field!"
                      :disabled="f.id === currentNode.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="防抖(ms)"
                  ><el-input-number v-model="remoteDebounce" :min="0" :max="5000" :step="100" style="width: 100%"
                /></el-form-item>
                <el-form-item label="请求头">
                  <div v-for="(item, hIdx) in remoteHeaders" :key="hIdx" class="option" style="margin-bottom: 4px">
                    <div class="input" style="display: flex; gap: 4px">
                      <el-input v-model="item.key" placeholder="Key" size="small" />
                      <el-input v-model="item.val" placeholder="Value" size="small" />
                    </div>
                    <div class="icon" @click="removeRemoteHeader(hIdx)"
                      ><el-icon><Delete /></el-icon
                    ></div>
                  </div>
                  <el-button type="primary" text size="small" @click="addRemoteHeader">+ 添加请求头</el-button>
                </el-form-item>
              </template>
            </template>

            <!-- 校验规则 -->
            <template v-if="['input', 'textarea'].includes(currentNode.type)">
              <el-divider>校验规则</el-divider>
              <el-form-item label="规则类型">
                <el-select v-model="nodeRuleType" placeholder="请选择" clearable @change="handleNodeRuleChange">
                  <el-option v-for="r in validRules" :key="r.value" :label="r.label" :value="r.value" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="nodeRuleType === 'regex'" label="正则表达式">
                <el-input v-model="currentNode.config.rule!.pattern" placeholder="如：^[a-zA-Z]+$" />
              </el-form-item>
              <el-form-item v-if="nodeRuleType" label="错误提示">
                <el-input v-model="currentNode.config.rule!.message" placeholder="自定义错误提示" />
              </el-form-item>
            </template>

            <!-- 状态 -->
            <el-divider>状态</el-divider>
            <el-form-item label="是否必填"><el-switch v-model="currentNode.config.required" /></el-form-item>
            <el-form-item label="初始隐藏"><el-switch v-model="currentNode.config.hidden" /></el-form-item>

            <!-- 字段联动（多条件） -->
            <el-divider>字段联动</el-divider>
            <el-form-item v-if="nodeRelations.length >= 2" label="组合逻辑">
              <el-select v-model="nodeRelationLogic">
                <el-option label="全部满足(AND)" value="and" />
                <el-option label="任一满足(OR)" value="or" />
              </el-select>
            </el-form-item>
            <div v-for="(rel, idx) in nodeRelations" :key="idx" class="relation-item">
              <el-form-item :label="'条件' + (idx + 1)">
                <el-select v-model="rel.field" placeholder="触发字段" clearable style="width: 100%">
                  <el-option
                    v-for="f in availableFields"
                    :key="f.id"
                    :label="f.label || f.field"
                    :value="f.field!"
                    :disabled="f.id === currentNode.id"
                  />
                </el-select>
              </el-form-item>
              <template v-if="rel.field">
                <el-form-item label="条件">
                  <el-select v-model="rel.condition">
                    <el-option label="等于" value="eq" />
                    <el-option label="不等于" value="neq" />
                    <el-option label="包含值" value="in" />
                    <el-option label="不包含值" value="notIn" />
                    <el-option label="为空" value="empty" />
                    <el-option label="不为空" value="notEmpty" />
                    <el-option label="大于" value="gt" />
                    <el-option label="小于" value="lt" />
                    <el-option label="大于等于" value="gte" />
                    <el-option label="小于等于" value="lte" />
                    <el-option label="包含文本" value="contains" />
                    <el-option label="在区间内" value="between" />
                    <el-option label="正则匹配" value="pattern" />
                  </el-select>
                </el-form-item>
                <el-form-item v-if="rel.condition === 'between'" label="区间值">
                  <div style="display: flex; gap: 4px; align-items: center">
                    <el-input-number
                      v-model="rel.value[0]"
                      placeholder="最小"
                      controls-position="right"
                      style="flex: 1"
                    />
                    <span>~</span>
                    <el-input-number
                      v-model="rel.value[1]"
                      placeholder="最大"
                      controls-position="right"
                      style="flex: 1"
                    />
                  </div>
                </el-form-item>
                <el-form-item v-else-if="!['empty', 'notEmpty'].includes(rel.condition)" label="条件值">
                  <el-input v-model="rel.value" placeholder="条件值" />
                </el-form-item>
                <el-form-item label="效果">
                  <el-select v-model="rel.effect">
                    <el-option label="显示" value="show" />
                    <el-option label="隐藏" value="hide" />
                    <el-option label="禁用" value="disabled" />
                    <el-option label="必填" value="required" />
                    <el-option label="赋值" value="value" />
                  </el-select>
                </el-form-item>
                <el-form-item v-if="rel.effect === 'value'" label="目标值">
                  <el-input v-model="rel.effectValue" placeholder="满足条件时赋的值" />
                </el-form-item>
              </template>
              <el-button v-if="nodeRelations.length > 1" type="danger" text size="small" @click="removeRelation(idx)"
                >删除此条件</el-button
              >
              <el-divider v-if="idx < nodeRelations.length - 1" style="margin: 8px 0" />
            </div>
            <el-button type="primary" text @click="addRelation">+ 添加条件</el-button>

            <!-- 计算属性 -->
            <el-divider>计算属性</el-divider>
            <el-form-item label="启用计算"><el-switch v-model="computedEnabled" /></el-form-item>
            <template v-if="computedEnabled">
              <el-form-item label="表达式">
                <el-input
                  v-model="computedExpression"
                  type="textarea"
                  :rows="2"
                  placeholder="如 {{price}} * {{quantity}}"
                />
              </el-form-item>
              <div v-if="computedDeps.length" class="computed-deps">
                <span class="computed-deps-label">依赖字段：</span>
                <el-tag v-for="dep in computedDeps" :key="dep" size="small" type="info">{{ dep }}</el-tag>
              </div>
            </template>

            <!-- 高级配置 -->
            <el-divider>高级</el-divider>
            <el-form-item label="自定义类名"
              ><el-input v-model="currentNode.config.customClass" placeholder="如 my-field" clearable
            /></el-form-item>
            <el-form-item label="自定义样式"
              ><el-input v-model="currentNode.config.customStyle" placeholder="如 margin-top: 10px" clearable
            /></el-form-item>
          </template>

          <!-- 容器节点配置 -->
          <template v-else-if="isContainerNodeType">
            <el-form-item label="标题"><el-input v-model="currentNode.label" placeholder="容器标题" /></el-form-item>
            <template v-if="currentNode.type === 'row'">
              <el-form-item label="栅格间距"
                ><el-input-number v-model="currentNode.config.gutter" :min="0" :max="48" style="width: 100%"
              /></el-form-item>
              <el-form-item label="水平对齐">
                <el-select v-model="currentNode.config.justify" placeholder="默认" clearable>
                  <el-option label="默认(start)" value="start" />
                  <el-option label="居中(center)" value="center" />
                  <el-option label="右对齐(end)" value="end" />
                  <el-option label="两端对齐" value="space-between" />
                  <el-option label="等间距" value="space-around" />
                  <el-option label="均匀分布" value="space-evenly" />
                </el-select>
              </el-form-item>
              <el-form-item label="垂直对齐">
                <el-select v-model="currentNode.config.align" placeholder="默认" clearable>
                  <el-option label="顶部(top)" value="top" />
                  <el-option label="居中(middle)" value="middle" />
                  <el-option label="底部(bottom)" value="bottom" />
                </el-select>
              </el-form-item>
              <el-divider>列配置</el-divider>
              <div class="child-item__legend">
                <span class="child-item__legend-idx">#</span>
                <span class="child-item__legend-main">宽度(span)</span>
                <span class="child-item__legend-action"></span>
              </div>
              <div v-for="(col, idx) in currentNode.children" :key="col.id" class="child-item">
                <div class="child-item__header">
                  <span class="child-item__index">{{ idx + 1 }}</span>
                  <el-input-number
                    v-model="col.config.span"
                    :min="1"
                    :max="24"
                    size="small"
                    :controls="false"
                    class="child-item__span-input"
                  />
                  <el-icon
                    v-if="currentNode.children!.length > 1"
                    class="child-item__delete"
                    @click="currentNode.children!.splice(idx, 1)"
                    ><Delete
                  /></el-icon>
                </div>
              </div>
              <el-button type="primary" text @click="addCol">+ 添加列</el-button>
            </template>
            <template v-if="currentNode.type === 'col'">
              <el-form-item label="列宽(span)"
                ><el-input-number v-model="currentNode.config.span" :min="1" :max="24" style="width: 100%"
              /></el-form-item>
            </template>
            <template v-if="currentNode.type === 'card'">
              <el-form-item label="阴影">
                <el-select v-model="currentNode.props!.shadow">
                  <el-option label="始终" value="always" /><el-option label="悬停" value="hover" /><el-option
                    label="无"
                    value="never"
                  />
                </el-select>
              </el-form-item>
            </template>
            <template v-if="currentNode.type === 'tabs'">
              <el-form-item label="样式">
                <el-select v-model="currentNode.props!.type">
                  <el-option label="卡片" value="card" />
                  <el-option label="边框卡片" value="border-card" />
                  <el-option label="默认" value="" />
                </el-select>
              </el-form-item>
              <el-divider>标签页管理</el-divider>
              <div class="child-item__legend">
                <span class="child-item__legend-idx">#</span>
                <span class="child-item__legend-main">标签名称</span>
                <span class="child-item__legend-action"></span>
              </div>
              <div v-for="(pane, idx) in currentNode.children" :key="pane.id" class="child-item">
                <div class="child-item__header">
                  <span class="child-item__index">{{ idx + 1 }}</span>
                  <el-input v-model="pane.label" placeholder="标签名称" size="small" />
                  <el-icon
                    v-if="currentNode.children!.length > 1"
                    class="child-item__delete"
                    @click="currentNode.children!.splice(idx, 1)"
                    ><Delete
                  /></el-icon>
                </div>
              </div>
              <el-button type="primary" text @click="addTabPane">+ 添加标签页</el-button>
            </template>
            <template v-if="currentNode.type === 'tab-pane'">
              <el-form-item label="标签名"
                ><el-input v-model="currentNode.label" placeholder="标签页名称"
              /></el-form-item>
            </template>
            <template v-if="currentNode.type === 'collapse'">
              <el-form-item label="手风琴"><el-switch v-model="currentNode.props!.accordion" /></el-form-item>
              <el-divider>面板管理</el-divider>
              <div class="child-item__legend">
                <span class="child-item__legend-idx">#</span>
                <span class="child-item__legend-main">面板标题</span>
                <span class="child-item__legend-action"></span>
              </div>
              <div v-for="(item, idx) in currentNode.children" :key="item.id" class="child-item">
                <div class="child-item__header">
                  <span class="child-item__index">{{ idx + 1 }}</span>
                  <el-input v-model="item.label" placeholder="面板标题" size="small" />
                  <el-icon
                    v-if="currentNode.children!.length > 1"
                    class="child-item__delete"
                    @click="currentNode.children!.splice(idx, 1)"
                    ><Delete
                  /></el-icon>
                </div>
              </div>
              <el-button type="primary" text @click="addCollapseItem">添加面板</el-button>
            </template>
            <template v-if="currentNode.type === 'collapse-item'">
              <el-form-item label="面板标题"
                ><el-input v-model="currentNode.label" placeholder="面板标题"
              /></el-form-item>
            </template>
            <template v-if="currentNode.type === 'inline'">
              <el-form-item label="间距"
                ><el-input-number v-model="currentNode.config.gutter" :min="0" :max="48" style="width: 100%"
              /></el-form-item>
              <el-form-item label="排列方向">
                <el-select v-model="currentNode.config.direction">
                  <el-option label="水平" value="horizontal" />
                  <el-option label="垂直" value="vertical" />
                </el-select>
              </el-form-item>
            </template>
            <template v-if="currentNode.type === 'table'">
              <el-form-item label="列间距"
                ><el-input-number v-model="currentNode.config.gutter" :min="0" :max="48" style="width: 100%"
              /></el-form-item>
              <el-divider>列配置</el-divider>
              <div class="child-item__legend">
                <span class="child-item__legend-idx">#</span>
                <span class="child-item__legend-main">标题</span>
                <span class="child-item__legend-sub">宽度</span>
                <span class="child-item__legend-action"></span>
              </div>
              <div v-for="(col, idx) in currentNode.children" :key="col.id" class="child-item">
                <div class="child-item__header">
                  <span class="child-item__index">{{ idx + 1 }}</span>
                  <el-input v-model="col.label" placeholder="标题" size="small" />
                  <el-input-number
                    v-model="col.config.span"
                    :min="1"
                    :max="24"
                    size="small"
                    :controls="false"
                    class="child-item__span-input"
                  />
                  <el-icon
                    v-if="currentNode.children!.length > 1"
                    class="child-item__delete"
                    @click="currentNode.children!.splice(idx, 1)"
                    ><Delete
                  /></el-icon>
                </div>
              </div>
              <el-button type="primary" text @click="addTableCol">+ 添加列</el-button>
            </template>
            <template v-if="currentNode.type === 'table-col'">
              <el-form-item label="列标题"><el-input v-model="currentNode.label" placeholder="列标题" /></el-form-item>
              <el-form-item label="列宽(span)"
                ><el-input-number v-model="currentNode.config.span" :min="1" :max="24" style="width: 100%"
              /></el-form-item>
            </template>
            <template v-if="currentNode.type === 'box'">
              <el-form-item label="排列方向">
                <el-select v-model="currentNode.config.direction"
                  ><el-option label="垂直" value="vertical" /><el-option label="水平" value="horizontal"
                /></el-select>
              </el-form-item>
              <el-form-item label="间距"
                ><el-input-number v-model="currentNode.config.gutter" :min="0" :max="48" style="width: 100%"
              /></el-form-item>
            </template>
            <template v-if="currentNode.type === 'space'">
              <el-form-item label="间距大小"
                ><el-input-number v-model="currentNode.config.gutter" :min="4" :max="100" style="width: 100%"
              /></el-form-item>
            </template>
            <template v-if="currentNode.type === 'descriptions'">
              <el-form-item label="列数"
                ><el-input-number v-model="currentNode.props!.column" :min="1" :max="4" style="width: 100%"
              /></el-form-item>
              <el-form-item label="边框"><el-switch v-model="currentNode.props!.border" /></el-form-item>
              <el-divider>描述项管理</el-divider>
              <div class="child-item__legend">
                <span class="child-item__legend-idx">#</span>
                <span class="child-item__legend-main">标签名</span>
                <span class="child-item__legend-sub">宽度</span>
                <span class="child-item__legend-action"></span>
              </div>
              <div v-for="(col, idx) in currentNode.children" :key="col.id" class="child-item">
                <div class="child-item__header">
                  <span class="child-item__index">{{ idx + 1 }}</span>
                  <el-input v-model="col.label" placeholder="标签名" size="small" />
                  <el-input-number
                    v-model="col.config.span"
                    :min="1"
                    :max="24"
                    size="small"
                    :controls="false"
                    class="child-item__span-input"
                  />
                  <el-icon
                    v-if="currentNode.children!.length > 1"
                    class="child-item__delete"
                    @click="currentNode.children!.splice(idx, 1)"
                    ><Delete
                  /></el-icon>
                </div>
              </div>
              <el-button type="primary" text @click="addDescriptionsItem">+ 添加描述项</el-button>
            </template>
            <template v-if="currentNode.type === 'group'">
              <el-form-item label="条目标题">
                <el-input v-model="currentNode.config.groupItemTitle" placeholder="如：家庭成员" />
              </el-form-item>
              <el-form-item label="字段标识">
                <el-input v-model="currentNode.field" placeholder="字段标识" />
              </el-form-item>
              <el-form-item label="展示样式">
                <el-select v-model="currentNode.config.groupLayout">
                  <el-option label="卡片" value="card" />
                  <el-option label="列表" value="list" />
                </el-select>
              </el-form-item>
              <el-form-item label="最少条目">
                <el-input-number
                  v-model="currentNode.config.groupMin"
                  :min="0"
                  :max="currentNode.config.groupMax || 10"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="最多条目">
                <el-input-number
                  v-model="currentNode.config.groupMax"
                  :min="currentNode.config.groupMin || 0"
                  :max="99"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="初始隐藏"><el-switch v-model="currentNode.config.hidden" /></el-form-item>
            </template>

            <!-- 水印 -->
            <template v-if="currentNode.type === 'watermark'">
              <el-divider>水印配置</el-divider>
              <el-form-item label="水印文字"
                ><el-input v-model="currentNode.config.watermarkContent" placeholder="水印文字"
              /></el-form-item>
              <el-form-item label="字号"
                ><el-input-number
                  v-model="currentNode.config.watermarkFontSize"
                  :min="10"
                  :max="48"
                  style="width: 100%"
              /></el-form-item>
              <el-form-item label="旋转角度"
                ><el-input-number v-model="currentNode.config.watermarkRotate" :min="-90" :max="90" style="width: 100%"
              /></el-form-item>
            </template>

            <!-- 容器联动 -->
            <el-divider>联动控制</el-divider>
            <el-form-item v-if="containerRelations.length >= 2" label="组合逻辑">
              <el-select v-model="nodeRelationLogic">
                <el-option label="全部满足(AND)" value="and" />
                <el-option label="任一满足(OR)" value="or" />
              </el-select>
            </el-form-item>
            <div v-for="(rel, idx) in containerRelations" :key="idx" class="relation-item">
              <el-form-item :label="'条件' + (idx + 1)">
                <el-select v-model="rel.field" placeholder="触发字段" clearable style="width: 100%">
                  <el-option
                    v-for="f in availableFields"
                    :key="f.id"
                    :label="f.label || f.field"
                    :value="f.field!"
                    :disabled="f.id === currentNode.id"
                  />
                </el-select>
              </el-form-item>
              <template v-if="rel.field">
                <el-form-item label="条件">
                  <el-select v-model="rel.condition">
                    <el-option label="等于" value="eq" />
                    <el-option label="不等于" value="neq" />
                    <el-option label="包含值" value="in" />
                    <el-option label="不包含值" value="notIn" />
                    <el-option label="为空" value="empty" />
                    <el-option label="不为空" value="notEmpty" />
                    <el-option label="大于" value="gt" />
                    <el-option label="小于" value="lt" />
                    <el-option label="大于等于" value="gte" />
                    <el-option label="小于等于" value="lte" />
                    <el-option label="包含文本" value="contains" />
                    <el-option label="在区间内" value="between" />
                    <el-option label="正则匹配" value="pattern" />
                  </el-select>
                </el-form-item>
                <el-form-item v-if="rel.condition === 'between'" label="区间值">
                  <div style="display: flex; gap: 4px; align-items: center">
                    <el-input-number
                      v-model="rel.value[0]"
                      placeholder="最小"
                      controls-position="right"
                      style="flex: 1"
                    />
                    <span>~</span>
                    <el-input-number
                      v-model="rel.value[1]"
                      placeholder="最大"
                      controls-position="right"
                      style="flex: 1"
                    />
                  </div>
                </el-form-item>
                <el-form-item v-else-if="!['empty', 'notEmpty'].includes(rel.condition)" label="条件值">
                  <el-input v-model="rel.value" placeholder="条件值" />
                </el-form-item>
                <el-form-item label="效果">
                  <el-select v-model="rel.effect">
                    <el-option label="显示" value="show" />
                    <el-option label="隐藏" value="hide" />
                  </el-select>
                </el-form-item>
              </template>
              <el-button
                v-if="containerRelations.length > 1"
                type="danger"
                text
                size="small"
                @click="removeContainerRelation(idx)"
                >删除此条件</el-button
              >
              <el-divider v-if="idx < containerRelations.length - 1" style="margin: 8px 0" />
            </div>
            <el-button type="primary" text @click="addContainerRelation">+ 添加条件</el-button>

            <!-- 高级配置 -->
            <el-divider>高级</el-divider>
            <el-form-item label="自定义类名"
              ><el-input v-model="currentNode.config.customClass" placeholder="如 my-container" clearable
            /></el-form-item>
            <el-form-item label="自定义样式"
              ><el-input v-model="currentNode.config.customStyle" placeholder="如 padding: 10px" clearable
            /></el-form-item>
          </template>

          <!-- 辅助组件配置 -->
          <template v-else>
            <el-form-item label="标题"><el-input v-model="currentNode.label" placeholder="标题" /></el-form-item>
            <el-form-item v-if="currentNode.type === 'alert'" label="类型">
              <el-select v-model="currentNode.props!.type">
                <el-option label="信息" value="info" /><el-option label="成功" value="success" /><el-option
                  label="警告"
                  value="warning"
                /><el-option label="错误" value="error" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="['alert', 'text'].includes(currentNode.type)" label="内容">
              <el-input v-model="currentNode.config.description" type="textarea" :rows="3" placeholder="内容" />
            </el-form-item>

            <!-- 按钮 -->
            <template v-if="currentNode.type === 'button'">
              <el-divider>按钮配置</el-divider>
              <el-form-item label="按钮文字"
                ><el-input v-model="currentNode.config.buttonText" placeholder="按钮"
              /></el-form-item>
              <el-form-item label="按钮类型">
                <el-select v-model="currentNode.config.buttonType">
                  <el-option label="主要" value="primary" />
                  <el-option label="成功" value="success" />
                  <el-option label="警告" value="warning" />
                  <el-option label="危险" value="danger" />
                  <el-option label="信息" value="info" />
                  <el-option label="默认" value="default" />
                </el-select>
              </el-form-item>
              <el-form-item label="按钮大小">
                <el-select v-model="currentNode.config.buttonSize">
                  <el-option label="大" value="large" />
                  <el-option label="默认" value="default" />
                  <el-option label="小" value="small" />
                </el-select>
              </el-form-item>
              <el-form-item label="朴素按钮"><el-switch v-model="currentNode.config.buttonPlain" /></el-form-item>
              <el-form-item label="圆角按钮"><el-switch v-model="currentNode.config.buttonRound" /></el-form-item>
            </template>

            <!-- 自定义HTML -->
            <template v-if="currentNode.type === 'html'">
              <el-divider>HTML内容</el-divider>
              <el-form-item label="HTML代码">
                <el-input
                  v-model="currentNode.config.htmlContent"
                  type="textarea"
                  :rows="5"
                  placeholder="<p>自定义内容</p>"
                />
              </el-form-item>
            </template>

            <!-- 段落 -->
            <template v-if="currentNode.type === 'paragraph'">
              <el-divider>段落配置</el-divider>
              <el-form-item label="段落内容">
                <el-input
                  v-model="currentNode.config.paragraphContent"
                  type="textarea"
                  :rows="3"
                  placeholder="段落内容"
                />
              </el-form-item>
              <el-form-item label="对齐方式">
                <el-select v-model="currentNode.config.paragraphAlign">
                  <el-option label="左对齐" value="left" />
                  <el-option label="居中" value="center" />
                  <el-option label="右对齐" value="right" />
                </el-select>
              </el-form-item>
            </template>

            <!-- 标签 -->
            <template v-if="currentNode.type === 'tag'">
              <el-divider>标签配置</el-divider>
              <el-form-item label="标签文字"
                ><el-input v-model="currentNode.config.tagText" placeholder="标签"
              /></el-form-item>
              <el-form-item label="标签类型">
                <el-select v-model="currentNode.config.tagType">
                  <el-option label="主要" value="primary" />
                  <el-option label="成功" value="success" />
                  <el-option label="警告" value="warning" />
                  <el-option label="危险" value="danger" />
                  <el-option label="信息" value="info" />
                  <el-option label="默认" value="" />
                </el-select>
              </el-form-item>
              <el-form-item label="主题">
                <el-select v-model="currentNode.config.tagEffect">
                  <el-option label="深色" value="dark" />
                  <el-option label="浅色" value="light" />
                  <el-option label="朴素" value="plain" />
                </el-select>
              </el-form-item>
              <el-form-item label="大小">
                <el-select v-model="currentNode.config.tagSize">
                  <el-option label="大" value="large" />
                  <el-option label="默认" value="default" />
                  <el-option label="小" value="small" />
                </el-select>
              </el-form-item>
              <el-form-item label="圆角"><el-switch v-model="currentNode.config.tagRound" /></el-form-item>
              <el-form-item label="可关闭"><el-switch v-model="currentNode.config.tagClosable" /></el-form-item>
            </template>

            <!-- 链接 -->
            <template v-if="currentNode.type === 'link'">
              <el-divider>链接配置</el-divider>
              <el-form-item label="链接文字"
                ><el-input v-model="currentNode.config.linkText" placeholder="链接文字"
              /></el-form-item>
              <el-form-item label="链接地址"
                ><el-input v-model="currentNode.config.linkHref" placeholder="https://..."
              /></el-form-item>
              <el-form-item label="链接类型">
                <el-select v-model="currentNode.config.linkType">
                  <el-option label="主要" value="primary" />
                  <el-option label="成功" value="success" />
                  <el-option label="警告" value="warning" />
                  <el-option label="危险" value="danger" />
                  <el-option label="信息" value="info" />
                  <el-option label="默认" value="default" />
                </el-select>
              </el-form-item>
              <el-form-item label="下划线"><el-switch v-model="currentNode.config.linkUnderline" /></el-form-item>
              <el-form-item label="打开方式">
                <el-select v-model="currentNode.config.linkTarget">
                  <el-option label="新标签页" value="_blank" />
                  <el-option label="当前页" value="_self" />
                </el-select>
              </el-form-item>
            </template>

            <!-- 提示气泡 -->
            <template v-if="currentNode.type === 'tooltip'">
              <el-divider>提示配置</el-divider>
              <el-form-item label="触发文字"
                ><el-input v-model="currentNode.config.tooltipTriggerText" placeholder="悬停查看提示"
              /></el-form-item>
              <el-form-item label="提示内容"
                ><el-input v-model="currentNode.config.tooltipContent" type="textarea" :rows="2" placeholder="提示文字"
              /></el-form-item>
              <el-form-item label="弹出位置">
                <el-select v-model="currentNode.config.tooltipPlacement">
                  <el-option label="上方" value="top" />
                  <el-option label="下方" value="bottom" />
                  <el-option label="左侧" value="left" />
                  <el-option label="右侧" value="right" />
                </el-select>
              </el-form-item>
            </template>
          </template>
        </el-form>
      </div>
    </div>
  </div>
</template>

<!-- TOOL_SCRIPT_PLACEHOLDER -->
<script lang="ts" setup>
  import { ref, computed, watch, reactive, nextTick } from 'vue'
  import { Guid } from 'guid-typescript'
  import { VueDraggable } from 'vue-draggable-plus'
  import { ComponentRule, FormNode, NodeRelation, isFieldNode, isContainerNode } from '../lib/types'
  import { defaultComponentRule } from '../lib/data'
  import { componentTypes, collectFieldNodes } from '../lib/editor'
  import { extractDependencies } from '../lib/computed'
  import { Delete, Rank } from '@element-plus/icons-vue'

  const props = withDefaults(
    defineProps<{
      node?: FormNode
      nodes?: FormNode[]
      single?: boolean
    }>(),
    { single: false, nodes: () => [] }
  )

  const fileTypes = [
    { value: 'image', label: '图片' },
    { value: 'video', label: '视频' },
    { value: 'file', label: '文件' }
  ]

  // --- FormNode 模式 ---
  const currentNode = ref<FormNode | undefined>()
  const isFieldNodeType = computed(() => (currentNode.value ? isFieldNode(currentNode.value) : false))
  const isContainerNodeType = computed(() => (currentNode.value ? isContainerNode(currentNode.value) : false))

  watch(
    () => props.node,
    (val) => {
      currentNode.value = val
    },
    { immediate: true }
  )

  // 校验规则
  const validRules = computed(() => defaultComponentRule.filter((r) => r.value !== ''))
  const nodeRuleType = computed({
    get: () => currentNode.value?.config.rule?.value || '',
    set: (val: string) => {
      if (!currentNode.value) return
      if (!val) {
        currentNode.value.config.rule = undefined
        return
      }
      const found = defaultComponentRule.find((r) => r.value === val)
      currentNode.value.config.rule = {
        label: found?.label || val,
        value: val,
        ...(val === 'regex' ? { pattern: '' } : {})
      }
    }
  })
  const handleNodeRuleChange = (val: string) => {
    nodeRuleType.value = val
  }

  // 远程数据源
  const handleOptionSourceChange = (val: string | number | boolean | undefined) => {
    if (!currentNode.value) return
    if (val === 'remote' && !currentNode.value.config.remoteConfig) {
      currentNode.value.config.remoteConfig = {
        url: '',
        method: 'GET',
        labelField: 'label',
        valueField: 'value',
        dataPath: ''
      }
    }
  }
  const remoteUrl = computed({
    get: () => currentNode.value?.config.remoteConfig?.url || '',
    set: (v) => {
      if (currentNode.value?.config.remoteConfig) currentNode.value.config.remoteConfig.url = v
    }
  })
  const remoteMethod = computed({
    get: () => currentNode.value?.config.remoteConfig?.method || 'GET',
    set: (v: 'GET' | 'POST') => {
      if (currentNode.value?.config.remoteConfig) currentNode.value.config.remoteConfig.method = v
    }
  })
  const remoteDataPath = computed({
    get: () => currentNode.value?.config.remoteConfig?.dataPath || '',
    set: (v) => {
      if (currentNode.value?.config.remoteConfig) currentNode.value.config.remoteConfig.dataPath = v
    }
  })
  const remoteLabelField = computed({
    get: () => currentNode.value?.config.remoteConfig?.labelField || 'label',
    set: (v) => {
      if (currentNode.value?.config.remoteConfig) currentNode.value.config.remoteConfig.labelField = v
    }
  })
  const remoteValueField = computed({
    get: () => currentNode.value?.config.remoteConfig?.valueField || 'value',
    set: (v) => {
      if (currentNode.value?.config.remoteConfig) currentNode.value.config.remoteConfig.valueField = v
    }
  })
  const remoteParams = computed({
    get: () => currentNode.value?.config.remoteConfig?.params || '',
    set: (v) => {
      if (currentNode.value?.config.remoteConfig) currentNode.value.config.remoteConfig.params = v
    }
  })
  const remoteDependsOn = computed({
    get: () => currentNode.value?.config.remoteConfig?.dependsOn || [],
    set: (v) => {
      if (currentNode.value?.config.remoteConfig) currentNode.value.config.remoteConfig.dependsOn = v
    }
  })
  const remoteDebounce = computed({
    get: () => currentNode.value?.config.remoteConfig?.debounce ?? 300,
    set: (v) => {
      if (currentNode.value?.config.remoteConfig) currentNode.value.config.remoteConfig.debounce = v
    }
  })

  // 请求头（key-value 列表）
  const remoteHeaders = ref<{ key: string; val: string }[]>([])
  let headerSyncing = false

  watch(
    () => currentNode.value?.config.remoteConfig?.headers,
    (h) => {
      if (headerSyncing) return
      remoteHeaders.value = h ? Object.entries(h).map(([key, val]) => ({ key, val })) : []
    },
    { immediate: true }
  )

  watch(
    remoteHeaders,
    (list) => {
      if (!currentNode.value?.config.remoteConfig) return
      headerSyncing = true
      const obj: Record<string, string> = {}
      for (const item of list) {
        if (item.key) obj[item.key] = item.val
      }
      currentNode.value.config.remoteConfig.headers = obj
      nextTick(() => {
        headerSyncing = false
      })
    },
    { deep: true }
  )

  const addRemoteHeader = () => {
    remoteHeaders.value = [...remoteHeaders.value, { key: '', val: '' }]
  }
  const removeRemoteHeader = (idx: number) => {
    const list = [...remoteHeaders.value]
    list.splice(idx, 1)
    remoteHeaders.value = list
  }

  // --- 树选择 ---
  const handleTreeOptionSourceChange = (val: string | number | boolean | undefined) => {
    if (!currentNode.value) return
    if (val === 'remote' && !currentNode.value.config.remoteConfig) {
      currentNode.value.config.remoteConfig = {
        url: '',
        method: 'GET',
        labelField: 'label',
        valueField: 'value',
        dataPath: ''
      }
    }
  }

  const treeDataJson = computed({
    get: () => {
      try {
        return JSON.stringify(currentNode.value?.config.treeData || [], null, 2)
      } catch {
        return '[]'
      }
    },
    set: () => {
      /* handled by blur */
    }
  })

  const handleTreeDataJsonBlur = (e: FocusEvent) => {
    if (!currentNode.value) return
    const target = e.target as HTMLTextAreaElement
    try {
      currentNode.value.config.treeData = JSON.parse(target.value)
    } catch {
      // 格式错误时不更新
    }
  }

  // --- 字段联动（多条件） ---
  const availableFields = computed(() => collectFieldNodes(props.nodes))

  const nodeRelations = computed({
    get: () => currentNode.value?.relations || [],
    set: (val: NodeRelation[]) => {
      if (currentNode.value) currentNode.value.relations = val
    }
  })

  const nodeRelationLogic = computed({
    get: () => currentNode.value?.relationLogic || 'and',
    set: (val: 'and' | 'or') => {
      if (currentNode.value) currentNode.value.relationLogic = val
    }
  })

  const addRelation = () => {
    nodeRelations.value = [
      ...nodeRelations.value,
      { field: '', condition: 'eq', value: '', effect: 'show' } as NodeRelation
    ]
  }
  const removeRelation = (idx: number) => {
    const list = [...nodeRelations.value]
    list.splice(idx, 1)
    nodeRelations.value = list
  }

  // --- 容器联动 ---
  const containerRelations = computed({
    get: () => currentNode.value?.relations || [],
    set: (val: NodeRelation[]) => {
      if (currentNode.value) currentNode.value.relations = val
    }
  })
  const addContainerRelation = () => {
    containerRelations.value = [
      ...containerRelations.value,
      { field: '', condition: 'eq', value: '', effect: 'show' } as NodeRelation
    ]
  }
  const removeContainerRelation = (idx: number) => {
    const list = [...containerRelations.value]
    list.splice(idx, 1)
    containerRelations.value = list
  }

  // --- 计算属性 ---
  const computedEnabled = computed({
    get: () => currentNode.value?.config.computed?.enabled || false,
    set: (val: boolean) => {
      if (!currentNode.value) return
      currentNode.value.config.computed = val ? { enabled: true, expression: '' } : undefined
    }
  })
  const computedExpression = computed({
    get: () => currentNode.value?.config.computed?.expression || '',
    set: (val: string) => {
      if (!currentNode.value?.config.computed) return
      currentNode.value.config.computed.expression = val
      currentNode.value.config.computed.dependencies = extractDependencies(val)
    }
  })
  const computedDeps = computed(() => currentNode.value?.config.computed?.dependencies || [])

  // --- 容器操作 ---
  const uuid = (): string => Guid.create().toString().replace(/-/g, '').substring(0, 8)

  const ensureChildren = () => {
    if (currentNode.value && !currentNode.value.children) {
      currentNode.value.children = []
    }
  }

  const addCol = () => {
    ensureChildren()
    currentNode.value?.children?.push({ id: uuid(), type: 'col', config: { span: 12 }, children: [] })
  }
  const addTabPane = () => {
    ensureChildren()
    currentNode.value?.children?.push({ id: uuid(), type: 'tab-pane', label: '新标签', config: {}, children: [] })
  }
  const addCollapseItem = () => {
    ensureChildren()
    currentNode.value?.children?.push({ id: uuid(), type: 'collapse-item', label: '新面板', config: {}, children: [] })
  }
  const addTableCol = () => {
    ensureChildren()
    currentNode.value?.children?.push({
      id: uuid(),
      type: 'table-col',
      label: '列' + ((currentNode.value?.children?.length || 0) + 1),
      config: { span: 8 },
      children: []
    })
  }
  const addDescriptionsItem = () => {
    ensureChildren()
    currentNode.value?.children?.push({
      id: uuid(),
      type: 'col',
      label: '新描述项',
      config: { span: 12 },
      children: []
    })
  }
</script>

<style lang="scss" scoped>
  .tool-box {
    position: relative;
    box-sizing: border-box;
    width: 260px;
    min-width: 260px;
    max-width: 260px;
    height: 100%;
    padding: 20px 15px;
    background: #fff;
    border: 1px solid #f2f2fe;
    border-radius: 4px;

    &--single {
      width: 100%;
      min-width: unset;
      max-width: unset;
      border: none;
    }

    .tool-form {
      :deep(.el-form-item) {
        margin-bottom: 15px;
      }
    }

    .tool-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #999;
    }

    .tool {
      height: 100%;
      overflow-y: scroll;

      &::-webkit-scrollbar {
        display: none;
      }

      .title {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        font-weight: 700;
        color: #555;
      }

      .option {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 6px;

        .drag-handle {
          cursor: grab;
          color: #909399;
          margin-right: 4px;
          font-size: 14px;
        }

        .input {
          flex: 1;
        }

        .icon {
          width: 20px;
          min-width: 20px;
          color: red;
          text-align: right;
          cursor: pointer;
        }
      }

      .option-drag-list {
        width: 100%;
      }

      .relation-item {
        margin-bottom: 8px;
        padding: 8px;
        background: #f8f9fa;
        border-radius: 4px;
      }

      .computed-deps {
        padding: 0 0 12px;

        .computed-deps-label {
          font-size: 12px;
          color: #909399;
          margin-right: 4px;
        }

        .el-tag {
          margin-right: 4px;
        }
      }

      .child-item__legend {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 6px;
        padding-bottom: 4px;
        border-bottom: 1px solid #ebeef5;
        font-size: 11px;
        color: #909399;

        .child-item__legend-idx {
          width: 20px;
          min-width: 20px;
          text-align: center;
        }

        .child-item__legend-main {
          flex: 1;
          padding-left: 8px;
        }

        .child-item__legend-sub {
          width: 50px;
          min-width: 50px;
          text-align: left;
          padding-left: 4px;
        }

        .child-item__legend-action {
          width: 14px;
          min-width: 14px;
        }
      }

      .child-item {
        margin-bottom: 6px;

        .child-item__header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .child-item__index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          min-width: 20px;
          height: 20px;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          background: var(--el-color-primary);
          border-radius: 50%;
        }

        .child-item__delete {
          color: var(--el-color-danger);
          cursor: pointer;
          font-size: 14px;
          width: 14px;
          min-width: 14px;
          flex-shrink: 0;

          &:hover {
            opacity: 0.7;
          }
        }

        .child-item__span-input {
          width: 50px !important;
          min-width: 50px;
          flex-shrink: 0;
        }
      }
    }
  }
</style>
