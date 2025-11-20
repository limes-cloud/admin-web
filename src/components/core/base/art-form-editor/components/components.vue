<template>
  <div class="components" :class="[size]">
    <!-- <div class="page-title">
      <span class="icon"></span>
      <span>组件列表</span>
    </div> -->
    <template v-for="(ite, ind) in components" :key="ind">
      <div class="component-item">
        <div class="title">
          <el-icon><Operation /> </el-icon>
          <!-- <icon-menu-unfold class="icon" /> -->
          <span class="text">{{ ite.title }}</span>
        </div>
        <div class="content">
          <el-row :gutter="16">
            <el-col v-for="(t, i) in ite.items" :key="i" :span="size === 'mini' ? 24 : 12">
              <div class="item" @click="handleChoose(t)">
                <!-- <SvgIcon class="icon" :name="'form-' + t.type" :size="14" /> -->
                <el-icon><Operation /> </el-icon>
                <span style="margin-left: 5px">{{ t.name }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import Editor from '../lib/editor'
  import { ComponentDesc } from '../lib/types'
  import { Operation } from '@element-plus/icons-vue'

  withDefaults(defineProps<{ size?: string }>(), { size: 'lg' })

  const editor = new Editor()
  const { components } = editor
  const emit = defineEmits(['create'])

  const handleChoose = (cd: ComponentDesc) => {
    emit('create', cd.creater())
  }
</script>

<style lang="scss" scoped>
  .components {
    position: relative;
    flex-grow: 1;
    width: 240px;
    min-width: 240px;
    max-width: 240px;
    height: 100%;
    padding: 20px 15px;
    background: #fff;
    border: 1px solid #f2f2fe;
    border-radius: 4px;

    .page-title {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      font-size: 14px;
      font-weight: 700;
      color: #666;

      .icon {
        display: block;
        width: 5px;
        height: 16px;
        margin-right: 10px;
        background-color: #409eff;
        border-radius: 4px;
      }
    }

    .component-item {
      .title {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 700;
        color: #555;

        .icon {
          margin-right: 10px;
          font-size: 18px;
        }
      }

      .content {
        padding-top: 15px;
        padding-bottom: 10px;

        .item {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 30px;
          margin-bottom: 5px;
          line-height: 30px;
          text-align: center;
          border: 1px solid #fff;
          border-radius: 4px;

          &:hover {
            color: #787be8;
            cursor: pointer;
            border: 1px dashed #787be8;
          }
        }
      }
    }
  }

  .mini {
    width: 120px;
    min-width: 120px;
    max-width: 120px;
  }
</style>
