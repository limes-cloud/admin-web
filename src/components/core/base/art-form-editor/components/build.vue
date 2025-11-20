<template>
  <div class="build">
    <span class="move" @click.stop="emit('up', field)">
      <el-tooltip content="位置上移">
        <el-icon><ArrowUp /> </el-icon>
        <!-- <icon-arrow-up /> -->
      </el-tooltip>
    </span>
    <span class="move" @click.stop="emit('down', field)">
      <el-tooltip content="位置下移">
        <el-icon><ArrowDown /> </el-icon>
        <!-- <icon-arrow-down /> -->
      </el-tooltip>
    </span>
    <el-popconfirm title="您确认删除此输入项" type="warning" @confirm="emit('delete', field)">
      <template #reference>
        <span class="delete" @click.stop>
          <el-tooltip content="删除表单">
            <el-icon><Delete /> </el-icon>
            <!-- <icon-delete /> -->
          </el-tooltip>
        </span>
      </template>
    </el-popconfirm>
  </div>
</template>

<script lang="ts" setup>
  import { ArrowUp, ArrowDown, Delete } from '@element-plus/icons-vue'

  defineProps<{
    field: string
  }>()

  const emit = defineEmits(['up', 'down', 'delete'])
</script>

<style lang="scss" scoped>
  .build {
    box-sizing: border-box;
    width: 100px;
    min-width: 100px;
    max-width: 100px;
    text-align: right;

    span {
      padding: 0 8px;
      cursor: pointer;
    }

    span.delete {
      color: red;
    }

    span.move {
      color: #2979ff;
    }
  }
</style>
