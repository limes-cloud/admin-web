<template>
  <div class="tool-box">
    <div class="tool">
      <div class="title"><span>组件属性</span></div>
      <div v-if="component">
        <el-form :model="form" auto-label-width class="tool-form">
          <el-form-item label="输入标题" :rules="[{ required: true, message: '标题是必填项' }]">
            <el-input v-model="form.config.label" allow-clear placeholder="请输入标题" />
          </el-form-item>

          <el-form-item label="字段标识" :rules="[{ required: true, message: '字段标识是必填项' }]">
            <el-input v-model="form.field" allow-clear placeholder="请输入字段标识" />
          </el-form-item>

          <el-form-item
            v-if="form.type != 'number'"
            label="输入提示"
            :rules="[{ required: true, message: '提示是必填项' }]"
          >
            <el-input v-model="form.config.placeholder" allow-clear placeholder="请输入提示" />
          </el-form-item>

          <el-form-item v-if="canDefaultValue" label="默认值" :rules="[{ required: true, message: '默认值是必填项' }]">
            <el-input v-model="form.config.value" allow-clear placeholder="请输入默认值" />
          </el-form-item>

          <template v-if="form.type == 'number'">
            <el-form-item label="最小值" :rules="[{ required: true, message: '最小值是必填项' }]">
              <el-input-number v-model="form.config.min" allow-clear placeholder="请输入最小值" />
            </el-form-item>
            <el-form-item label="最大值" :rules="[{ required: true, message: '最大值是必填项' }]">
              <el-input-number v-model="form.config.max" allow-clear placeholder="请输入最大值" />
            </el-form-item>
            <el-form-item label="步数值" :rules="[{ required: true, message: '步数值是必填项' }]">
              <el-input-number v-model="form.config.step" allow-clear placeholder="请输入步数值" />
            </el-form-item>
          </template>

          <el-form-item
            v-if="form.type === 'upload'"
            label="文件类型"
            :rules="[{ required: true, message: '文件类型是必填项' }]"
          >
            <el-select
              v-model="form.config.filetype"
              placeholder="请选择文件类型"
              :scrollbar="true"
              :options="fileTypes"
            />
          </el-form-item>

          <template v-if="['textarea', 'input'].includes(form.type)">
            <el-form-item label="最长输入" :rules="[{ required: true, message: '最长输入是必填项' }]">
              <el-input-number v-model="form.config.maxLength" allow-clear :step="1" placeholder="请输入最长输入" />
            </el-form-item>
            <el-form-item label="校验规则">
              <el-select
                v-model="form.config.filetype"
                placeholder="请选择校验规则"
                :scrollbar="true"
                :options="defaultComponentRule"
              />
            </el-form-item>
          </template>

          <el-form-item label="是否必填">
            <el-switch v-model="form.config.required" type="round">
              <template #checked>是</template>
              <template #unchecked>否</template>
            </el-switch>
          </el-form-item>

          <el-form-item label="是否禁用">
            <el-switch v-model="form.config.disabled" type="round">
              <template #checked>是</template>
              <template #unchecked>否</template>
            </el-switch>
          </el-form-item>

          <template v-if="['radio', 'checkbox', 'select'].includes(form.type)">
            <el-divider>选项</el-divider>
            <el-form-item v-for="(value, index) in form.config.options" :key="index" hide-label>
              <div class="option">
                <div class="input">
                  <el-input v-model="form.config.options[index]" allow-clear placeholder="请输入选项值" />
                </div>
                <div class="icon" @click="handleDeleteOption(index)">
                  <el-icon><Delete /> </el-icon>
                </div>
              </div>
            </el-form-item>
            <el-button type="primary" @click="handleAddOption()">
              <!-- <template #icon>
                <icon-plus />
              </template> -->
              <template #default>添加新选项</template>
            </el-button>
          </template>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch } from 'vue'
  import { Component } from '../lib/types'
  import { defaultComponentRule } from '../lib/data'
  import { Delete } from '@element-plus/icons-vue'

  const props = defineProps<{
    component?: Component
  }>()
  const form = ref<Component>({} as Component)

  const canDefaultValue = computed(() => {
    const not = ['upload', 'pcd']
    return !not.includes(form.value.type)
  })

  const handleDeleteOption = (index: number) => {
    form.value.config.options.splice(index, 1)
  }

  const handleAddOption = () => {
    form.value.config.options.push('新选项')
  }

  const fileTypes = [
    { value: 'image', label: '图片' },
    { value: 'video', label: '视频' },
    // { value: 'music', label: '音频' },
    // { value: 'document', label: '文档' },
    { value: 'file', label: '文件' }
  ]

  watch(
    () => props.component,
    () => {
      if (props.component) form.value = props.component
    },
    { deep: true, immediate: true }
  )

  // watch(
  // 	() => form.value,
  // 	() => {
  // 		emit('update:component', form.value);
  // 	},
  // 	{ deep: true }
  // );
</script>

<style lang="scss" scoped>
  .tool-box {
    position: relative;
    box-sizing: border-box;
    width: 240px;
    min-width: 240px;
    max-width: 240px;
    height: 100%;
    padding: 20px 15px;
    background: #fff;

    .tool-form {
      :deep(.el-form-item) {
        margin-bottom: 15px;
      }
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

        .icon {
          margin-right: 10px;
          font-size: 18px;
        }
      }

      .option {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;

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
    }
  }
</style>
