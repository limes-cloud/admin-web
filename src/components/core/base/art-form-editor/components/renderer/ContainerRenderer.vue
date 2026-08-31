<template>
  <!-- row 容器 -->
  <template v-if="node.type === 'row'">
    <el-row :gutter="node.config.gutter || schema.config.gutter || 20" :class="node.config.customClass" :style="node.config.customStyle">
      <el-col v-for="col in node.children" :key="col.id" :span="col.config.span || 12">
        <RenderNodes
          :nodes="col.children || []"
          :form-data="formData"
          :readonly="readonly"
          :schema="schema"
        />
      </el-col>
    </el-row>
  </template>

  <!-- card 容器 -->
  <template v-else-if="node.type === 'card'">
    <el-card :shadow="node.props?.shadow || 'hover'" class="container-card" :class="node.config.customClass" :style="node.config.customStyle">
      <template #header>
        <span>{{ node.label }}</span>
      </template>
      <RenderNodes
        :nodes="node.children || []"
        :form-data="formData"
        :readonly="readonly"
        :schema="schema"
      />
    </el-card>
  </template>

  <!-- tabs 容器 -->
  <template v-else-if="node.type === 'tabs'">
    <el-tabs :type="node.props?.type || 'card'" :class="node.config.customClass" :style="node.config.customStyle">
      <el-tab-pane v-for="pane in node.children" :key="pane.id" :label="pane.label">
        <RenderNodes
          :nodes="pane.children || []"
          :form-data="formData"
          :readonly="readonly"
          :schema="schema"
        />
      </el-tab-pane>
    </el-tabs>
  </template>

  <!-- collapse 容器 -->
  <template v-else-if="node.type === 'collapse'">
    <el-collapse :accordion="node.props?.accordion" :class="node.config.customClass" :style="node.config.customStyle">
      <el-collapse-item v-for="item in node.children" :key="item.id" :title="item.label" :name="item.id">
        <RenderNodes
          :nodes="item.children || []"
          :form-data="formData"
          :readonly="readonly"
          :schema="schema"
        />
      </el-collapse-item>
    </el-collapse>
  </template>

  <!-- inline 容器 -->
  <template v-else-if="node.type === 'inline'">
    <div class="container-inline" :class="node.config.customClass" :style="[{ gap: (node.config.gutter || 16) + 'px' }, node.config.customStyle]">
      <RenderNodes
        :nodes="node.children || []"
        :form-data="formData"
        :readonly="readonly"
        :schema="schema"
      />
    </div>
  </template>

  <!-- table 表格布局 -->
  <template v-else-if="node.type === 'table'">
    <div class="container-table" :class="node.config.customClass" :style="node.config.customStyle">
      <div
        v-for="col in node.children"
        :key="col.id"
        class="container-table__col"
        :style="{ flex: col.config.span || 8 }"
      >
        <div class="container-table__header">{{ col.label }}</div>
        <div class="container-table__body">
          <RenderNodes
            :nodes="col.children || []"
            :form-data="formData"
            :readonly="readonly"
            :schema="schema"
          />
        </div>
      </div>
    </div>
  </template>

  <!-- box 盒子布局 -->
  <template v-else-if="node.type === 'box'">
    <div
      class="container-box"
      :class="node.config.customClass"
      :style="[{ flexDirection: node.config.direction === 'horizontal' ? 'row' : 'column', gap: (node.config.gutter || 12) + 'px' }, node.config.customStyle]"
    >
      <RenderNodes
        :nodes="node.children || []"
        :form-data="formData"
        :readonly="readonly"
        :schema="schema"
      />
    </div>
  </template>

  <!-- space 间距 -->
  <template v-else-if="node.type === 'space'">
    <div class="container-space" :class="node.config.customClass" :style="[{ height: (node.config.gutter || 20) + 'px' }, node.config.customStyle]"></div>
  </template>

  <!-- descriptions 描述列表 -->
  <template v-else-if="node.type === 'descriptions'">
    <div class="container-descriptions" :class="node.config.customClass" :style="[{ gridTemplateColumns: `repeat(${node.props?.column || 2}, 1fr)` }, node.config.customStyle]">
      <div v-for="col in node.children" :key="col.id" class="container-descriptions__item">
        <div class="container-descriptions__label">{{ col.label }}</div>
        <div class="container-descriptions__content">
          <RenderNodes
            :nodes="col.children || []"
            :form-data="formData"
            :readonly="readonly"
            :schema="schema"
          />
        </div>
      </div>
    </div>
  </template>

  <!-- watermark 水印容器 -->
  <template v-else-if="node.type === 'watermark'">
    <el-watermark
      :content="node.config.watermarkContent || '水印'"
      :font="{ fontSize: node.config.watermarkFontSize || 16, color: 'rgba(128, 128, 128, 0.25)' }"
      :rotate="node.config.watermarkRotate ?? -22"
      :gap="node.config.watermarkGap || [100, 100]"
      :class="node.config.customClass"
      :style="node.config.customStyle"
      class="container-watermark"
    >
      <div class="container-watermark__body">
        <RenderNodes
          :nodes="node.children || []"
          :form-data="formData"
          :readonly="readonly"
          :schema="schema"
        />
      </div>
    </el-watermark>
  </template>
</template>

<script lang="ts" setup>
  import { FormNode, FormSchema } from '../../lib/types'
  import RenderNodes from './RenderNodes.vue'

  defineProps<{
    node: FormNode
    formData: Record<string, any>
    readonly: boolean
    schema: FormSchema
  }>()
</script>

<style lang="scss" scoped>
  .container-card {
    margin-bottom: 16px;
  }

  .container-inline {
    display: flex;
    flex-wrap: wrap;
  }

  .container-table {
    display: flex;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 16px;

    &__col {
      flex: 1;
      border-right: 1px solid #e4e7ed;

      &:last-child {
        border-right: none;
      }
    }

    &__header {
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 600;
      color: #606266;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
    }

    &__body {
      padding: 12px;
    }
  }

  .container-box {
    display: flex;
  }

  .container-space {
    width: 100%;
  }

  .container-descriptions {
    display: grid;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 16px;

    &__item {
      border-right: 1px solid #e4e7ed;
      border-bottom: 1px solid #e4e7ed;

      &:nth-last-child(-n+2) {
        border-bottom: none;
      }
    }

    &__label {
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 600;
      color: #606266;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
    }

    &__content {
      padding: 12px;
    }
  }

  .container-watermark {
    margin-bottom: 16px;

    &__body {
      min-height: 60px;
    }
  }
</style>
