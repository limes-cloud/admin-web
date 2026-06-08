<template>
  <div class="proxy-page">
    <ElCard shadow="never">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:700">接口代理规则</span>
          <ElButton type="primary" :icon="Plus" @click="showDialog()">新增规则</ElButton>
        </div>
      </template>

      <ElAlert type="info" :closable="false" style="margin-bottom:16px">
        <template #title>
          <span style="font-weight:600">什么是接口代理规则？</span>
        </template>
        <template #default>
          <p style="margin:6px 0 0">在没有统一网关的情况下，前端所有请求默认走同一个 Host。</p>
          <p style="margin:4px 0 0">通过配置此规则，可以按 <b>URL 前缀</b> 将请求劫持到指定的后端服务 Host，无需修改代码或重启服务。</p>
          <p style="margin:4px 0 0">示例：将 <code>/configure/api</code> 开头的请求转发到 <code>http://192.168.1.10:8081</code>，其余请求仍走默认 Host。</p>
          <p style="margin:4px 0 0;color:var(--el-color-warning)">⚠ 规则仅在当前浏览器本地生效，刷新后依然保留，不影响其他人。</p>
        </template>
      </ElAlert>

      <ElTable :data="rules" border>
        <template #empty>
          <ElEmpty description="暂无规则，点击「新增规则」添加" />
        </template>
        <ElTableColumn prop="prefix" label="URL 前缀" min-width="180">
          <template #default="{ row }">
            <ElTag type="info">{{ row.prefix }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="host" label="目标 Host" min-width="220">
          <template #default="{ row }">
            <ElTag type="success">{{ row.host }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="remark" label="备注" min-width="140" show-overflow-tooltip />
        <ElTableColumn label="启用" width="70" align="center">
          <template #default="{ row }">
            <ElSwitch v-model="row.enabled" @change="save" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" fixed="right">
          <template #default="{ row }">
            <ArtOperation :list="operationItems" :data="row" />
          </template>
        </ElTableColumn>
      </ElTable>

    </ElCard>

    <ElDialog v-model="dialogVisible" :title="isEdit ? '编辑规则' : '新增规则'" width="480px" align-center :destroy-on-close="true">
      <ElForm ref="formRef" :model="form" label-position="top">
        <ElFormItem label="URL 前缀" prop="prefix" :rules="[{ required: true, message: '请输入 URL 前缀', trigger: ['blur', 'change'] }]">
          <ElInput v-model="form.prefix" placeholder="例：/configure/api" clearable />
          <ElText type="info" size="small">请求 URL 以此开头时生效</ElText>
        </ElFormItem>
        <ElFormItem label="目标 Host" prop="host" :rules="[{ required: true, message: '请输入目标 Host', trigger: ['blur', 'change'] }]">
          <ElInput v-model="form.host" placeholder="例：http://192.168.1.10:8080" clearable />
          <ElText type="info" size="small">不含路径，末尾无斜杠</ElText>
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput v-model="form.remark" placeholder="可选，用于标识此规则用途" clearable />
        </ElFormItem>
        <ElFormItem label="启用">
          <ElSwitch v-model="form.enabled" active-text="启用" inactive-text="禁用" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { Plus, Edit, Delete } from '@element-plus/icons-vue'
  import { getProxyRules, saveProxyRules, ProxyRule } from '@/utils/proxyRules'

  defineOptions({ name: 'DevProxy' })

  const rules = ref<ProxyRule[]>(getProxyRules())
  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const formRef = ref()
  const form = ref<ProxyRule>({ id: '', prefix: '', host: '', enabled: true, remark: '' })

  const save = () => saveProxyRules(rules.value)

  const operationItems = [
    { icon: Edit, label: '编辑', color: 'warning', click: (row: ProxyRule) => showDialog(row) },
    { icon: Delete, label: '删除', color: 'danger', popConfirm: true, click: (row: ProxyRule) => remove(row.id) }
  ]

  const showDialog = (row?: ProxyRule) => {
    isEdit.value = !!row
    form.value = row ? { ...row } : { id: '', prefix: '', host: '', enabled: true, remark: '' }
    dialogVisible.value = true
  }

  const handleSubmit = async () => {
    await formRef.value?.validate()
    if (isEdit.value) {
      const idx = rules.value.findIndex(r => r.id === form.value.id)
      if (idx !== -1) rules.value[idx] = { ...form.value }
    } else {
      rules.value.push({ ...form.value, id: Date.now().toString() })
    }
    save()
    dialogVisible.value = false
    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
  }

  const remove = (id: string) => {
    rules.value = rules.value.filter(r => r.id !== id)
    save()
    ElMessage.success('删除成功')
  }
</script>

<style scoped>
  .proxy-page { min-height: 100vh; background: #f5f7fa; padding: 24px; box-sizing: border-box; }
</style>
