<template>
  <div class="tracker-manage">
    <ElCard class="filter-card" shadow="never">
      <div class="filter-row">
        <ElSelect
          v-if="isManagerApp"
          v-model="selectedApp"
          class="filter-app"
          placeholder="选择应用"
          @change="handleAppChange"
        >
          <ElOption v-for="item in appList" :key="item.app" :label="item.name || item.app" :value="item.app" />
        </ElSelect>

        <ElInput
          v-model="pageKeyword"
          class="filter-keyword"
          placeholder="搜索页面名称或标识"
          clearable
          :prefix-icon="Search"
          @keyup.enter="loadPages"
          @clear="loadPages"
        />

        <ElSelect v-model="pageStatus" class="filter-status" placeholder="全部状态" clearable @change="loadPages">
          <ElOption label="启用" :value="true" />
          <ElOption label="停用" :value="false" />
        </ElSelect>

        <ElButton type="primary" :icon="Refresh" :loading="pageLoading" @click="refresh">刷新</ElButton>
        <span class="filter-tip">页面和点位由上报自动注册，管理端只负责命名、维度与启停。</span>
      </div>
    </ElCard>

    <div class="manage-grid">
      <ElCard class="panel panel--pages" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <span class="panel-header__title">页面</span>
              <span class="panel-header__tip">共 {{ pageList.length }} 个</span>
            </div>
            <ElTag effect="plain">按注册顺序</ElTag>
          </div>
        </template>

        <ElTable
          v-loading="pageLoading"
          :data="pageList"
          height="calc(100vh - 300px)"
          highlight-current-row
          row-key="id"
          @current-change="handlePageSelect"
        >
          <ElTableColumn prop="name" label="页面名称" min-width="150" show-overflow-tooltip />
          <ElTableColumn prop="key" label="页面 Key" min-width="160" show-overflow-tooltip />
          <ElTableColumn prop="pointCount" label="点位" width="72" align="right" />
          <ElTableColumn label="状态" width="86">
            <template #default="{ row }">
              <ElSwitch
                :model-value="row.status"
                size="small"
                :loading="row.statusSaving"
                :disabled="!$hasPermission('manager:tracker:page:update')"
                @change="(value: string | number | boolean) => updatePageStatus(row, Boolean(value))"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="72" fixed="right">
            <template #default="{ row }">
              <ElButton
                v-permission="'manager:tracker:page:update'"
                text
                type="primary"
                :icon="Edit"
                @click.stop="openPageDialog(row)"
              />
            </template>
          </ElTableColumn>
          <template #empty>
            <ElEmpty description="暂无页面数据，等待 H5 上报后自动注册" :image-size="72" />
          </template>
        </ElTable>
      </ElCard>

      <ElCard class="panel panel--points" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <span class="panel-header__title">点位</span>
              <span class="panel-header__tip">{{
                selectedPage ? `${selectedPage.name} · ${pointList.length} 个` : '请选择页面'
              }}</span>
            </div>
            <div class="panel-tools">
              <ElInput
                v-model="pointKeyword"
                size="small"
                placeholder="搜索点位"
                clearable
                :prefix-icon="Search"
                @keyup.enter="loadPoints"
                @clear="loadPoints"
              />
              <ElSelect v-model="pointStatus" size="small" placeholder="全部状态" clearable @change="loadPoints">
                <ElOption label="启用" :value="true" />
                <ElOption label="停用" :value="false" />
              </ElSelect>
            </div>
          </div>
        </template>

        <ElTable v-loading="pointLoading" :data="pointList" height="calc(100vh - 300px)" row-key="id">
          <ElTableColumn prop="name" label="点位名称" min-width="150" show-overflow-tooltip />
          <ElTableColumn prop="key" label="点位 Key" min-width="190" show-overflow-tooltip />
          <ElTableColumn label="维度" min-width="190">
            <template #default="{ row }">
              <div v-if="row.dimensions?.length" class="dimension-tags">
                <ElTag v-for="item in row.dimensions" :key="item" size="small" effect="plain">{{
                  dimensionLabel(item)
                }}</ElTag>
              </div>
              <span v-else class="muted">未配置</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="pv" label="PV" width="82" align="right" />
          <ElTableColumn prop="eventCount" label="事件量" width="92" align="right" />
          <ElTableColumn label="状态" width="86">
            <template #default="{ row }">
              <ElSwitch
                :model-value="row.status"
                size="small"
                :loading="row.statusSaving"
                :disabled="!$hasPermission('manager:tracker:point:update')"
                @change="(value: string | number | boolean) => updatePointStatus(row, Boolean(value))"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="72" fixed="right">
            <template #default="{ row }">
              <ElButton
                v-permission="'manager:tracker:point:update'"
                text
                type="primary"
                :icon="Edit"
                @click="openPointDialog(row)"
              />
            </template>
          </ElTableColumn>
          <template #empty>
            <ElEmpty :description="selectedPage ? '该页面暂无点位数据' : '请先选择左侧页面'" :image-size="72" />
          </template>
        </ElTable>
      </ElCard>
    </div>

    <ElDialog v-model="pageDialogVisible" title="编辑页面" width="480px" destroy-on-close>
      <ElForm v-if="pageForm" label-width="84px">
        <ElFormItem label="页面 Key">
          <ElInput :model-value="pageForm.key" disabled />
        </ElFormItem>
        <ElFormItem label="页面名称">
          <ElInput v-model="pageForm.name" maxlength="128" show-word-limit placeholder="用于看板展示" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSwitch v-model="pageForm.status" inline-prompt active-text="启用" inactive-text="停用" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="pageDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="pageSaving" @click="submitPage">保存</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="pointDialogVisible" title="编辑点位" width="560px" destroy-on-close>
      <ElForm v-if="pointForm" label-width="90px">
        <ElFormItem label="所属页面">
          <ElInput :model-value="`${pointForm.page} / ${pointForm.key}`" disabled />
        </ElFormItem>
        <ElFormItem label="点位名称">
          <ElInput v-model="pointForm.name" maxlength="128" show-word-limit placeholder="用于看板展示" />
        </ElFormItem>
        <ElFormItem label="说明">
          <ElInput
            v-model="pointForm.description"
            type="textarea"
            :rows="3"
            maxlength="512"
            show-word-limit
            placeholder="补充该点位的业务含义"
          />
        </ElFormItem>
        <ElFormItem label="分析维度">
          <ElSelect
            v-model="pointForm.dimensions"
            class="dimension-select"
            multiple
            filterable
            allow-create
            default-first-option
            :multiple-limit="5"
            collapse-tags
            collapse-tags-tooltip
            placeholder="最多 5 个，例如 $device、source"
          >
            <ElOption v-for="item in builtinDimensions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
          <div class="form-tip">维度取事件 props 中的同名字段；$device、$browser、$os、$event_type 为内置维度。</div>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSwitch v-model="pointForm.status" inline-prompt active-text="启用" inactive-text="停用" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="pointDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="pointSaving" @click="submitPoint">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Edit, Refresh, Search } from '@element-plus/icons-vue'
  import {
    ListTrackerApps,
    ListTrackerPages,
    ListTrackerPoints,
    UpdateTrackerPage,
    UpdateTrackerPoint
  } from '@/api/manager/tracker/api'
  import type { TrackerAppItem, TrackerPageItem, TrackerPointItem } from '@/api/manager/tracker/type'
  import { getAppKeyword } from '@/utils/app-context'
  import { isHttpError } from '@/utils/http/error'

  defineOptions({ name: 'TrackerManage' })

  const isManagerApp = getAppKeyword() === 'manager'

  interface PageRow extends TrackerPageItem {
    statusSaving?: boolean
  }

  interface PointRow extends TrackerPointItem {
    statusSaving?: boolean
  }

  const builtinDimensions = [
    { label: '设备', value: '$device' },
    { label: '浏览器', value: '$browser' },
    { label: '操作系统', value: '$os' },
    { label: '事件类型', value: '$event_type' }
  ]

  const appList = ref<TrackerAppItem[]>([])
  const selectedApp = ref('')
  const pageKeyword = ref('')
  const pageStatus = ref<boolean | ''>('')
  const pointKeyword = ref('')
  const pointStatus = ref<boolean | ''>('')
  const pageList = ref<PageRow[]>([])
  const pointList = ref<PointRow[]>([])
  const selectedPage = ref<PageRow>()
  const pageLoading = ref(false)
  const pointLoading = ref(false)

  const pageDialogVisible = ref(false)
  const pointDialogVisible = ref(false)
  const pageSaving = ref(false)
  const pointSaving = ref(false)
  const pageForm = ref<PageRow>()
  const pointForm = ref<PointRow & { dimensions: string[] }>()

  onMounted(async () => {
    try {
      if (isManagerApp) {
        const res = await ListTrackerApps()
        appList.value = res.list || []
        selectedApp.value = appList.value[0]?.app || ''
      } else {
        selectedApp.value = getAppKeyword()
      }
      if (selectedApp.value) await loadPages()
    } catch (error) {
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '加载点位应用失败')
    }
  })

  async function handleAppChange() {
    selectedPage.value = undefined
    pointList.value = []
    pointKeyword.value = ''
    pointStatus.value = ''
    await loadPages()
  }

  async function refresh() {
    await loadPages()
    if (selectedPage.value) await loadPoints()
  }

  async function loadPages() {
    if (!selectedApp.value) return
    pageLoading.value = true
    try {
      const res = await ListTrackerPages({
        app: selectedApp.value,
        keyword: pageKeyword.value.trim() || undefined,
        status: typeof pageStatus.value === 'boolean' ? pageStatus.value : undefined
      })
      pageList.value = (res.list || []).map((item) => ({ ...item, statusSaving: false }))
      const current = selectedPage.value && pageList.value.find((item) => item.id === selectedPage.value?.id)
      if (current) {
        selectedPage.value = current
        await loadPoints()
        return
      }
      if (pageList.value.length) {
        selectedPage.value = pageList.value[0]
        await loadPoints()
      } else {
        selectedPage.value = undefined
        pointList.value = []
      }
    } catch (error) {
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '加载页面失败')
    } finally {
      pageLoading.value = false
    }
  }

  async function loadPoints() {
    if (!selectedApp.value || !selectedPage.value) {
      pointList.value = []
      return
    }
    pointLoading.value = true
    try {
      const res = await ListTrackerPoints({
        app: selectedApp.value,
        page: selectedPage.value.key,
        keyword: pointKeyword.value.trim() || undefined,
        status: typeof pointStatus.value === 'boolean' ? pointStatus.value : undefined
      })
      pointList.value = (res.list || []).map((item) => ({ ...item, statusSaving: false }))
    } catch (error) {
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '加载点位失败')
    } finally {
      pointLoading.value = false
    }
  }

  function handlePageSelect(row?: PageRow) {
    if (!row || row.id === selectedPage.value?.id) return
    selectedPage.value = row
    pointKeyword.value = ''
    pointStatus.value = ''
    void loadPoints()
  }

  async function updatePageStatus(row: PageRow, status: boolean) {
    if (row.status === status || row.statusSaving) return
    row.statusSaving = true
    try {
      await UpdateTrackerPage({ id: row.id, status })
      row.status = status
      ElMessage.success(status ? '页面已启用' : '页面已停用')
    } catch (error) {
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '修改页面状态失败')
    } finally {
      row.statusSaving = false
    }
  }

  async function updatePointStatus(row: PointRow, status: boolean) {
    if (row.status === status || row.statusSaving) return
    row.statusSaving = true
    try {
      await UpdateTrackerPoint({ id: row.id, status })
      row.status = status
      ElMessage.success(status ? '点位已启用' : '点位已停用')
    } catch (error) {
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '修改点位状态失败')
    } finally {
      row.statusSaving = false
    }
  }

  function openPageDialog(row: PageRow) {
    pageForm.value = { ...row }
    pageDialogVisible.value = true
  }

  async function submitPage() {
    if (!pageForm.value) return
    if (!pageForm.value.name.trim()) {
      ElMessage.warning('请输入页面名称')
      return
    }
    pageSaving.value = true
    try {
      await UpdateTrackerPage({
        id: pageForm.value.id,
        name: pageForm.value.name.trim(),
        status: pageForm.value.status
      })
      ElMessage.success('页面已保存')
      pageDialogVisible.value = false
      await loadPages()
    } catch (error) {
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '保存页面失败')
    } finally {
      pageSaving.value = false
    }
  }

  function openPointDialog(row: PointRow) {
    pointForm.value = { ...row, dimensions: [...(row.dimensions || [])] }
    pointDialogVisible.value = true
  }

  async function submitPoint() {
    if (!pointForm.value) return
    if (!pointForm.value.name.trim()) {
      ElMessage.warning('请输入点位名称')
      return
    }
    pointSaving.value = true
    try {
      await UpdateTrackerPoint({
        id: pointForm.value.id,
        name: pointForm.value.name.trim(),
        description: pointForm.value.description.trim(),
        dimensionsJson: JSON.stringify(pointForm.value.dimensions),
        status: pointForm.value.status
      })
      ElMessage.success('点位已保存')
      pointDialogVisible.value = false
      await loadPoints()
    } catch (error) {
      if (!isHttpError(error)) ElMessage.error(error instanceof Error ? error.message : '保存点位失败')
    } finally {
      pointSaving.value = false
    }
  }

  function dimensionLabel(value: string) {
    return builtinDimensions.find((item) => item.value === value)?.label || value
  }
</script>

<style lang="scss" scoped>
  .tracker-manage {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .filter-card :deep(.el-card__body) {
    padding: 14px 16px;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .filter-app {
    width: 180px;
  }

  .filter-keyword {
    width: 240px;
  }

  .filter-status {
    width: 126px;
  }

  .filter-tip {
    color: var(--art-text-gray-500);
    font-size: 12px;
  }

  .manage-grid {
    display: grid;
    grid-template-columns: minmax(360px, 0.78fr) minmax(0, 1.52fr);
    gap: 16px;
    min-height: 0;
  }

  .panel {
    min-width: 0;
  }

  .panel :deep(.el-card__body) {
    padding: 12px 14px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .panel-header__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .panel-header__tip {
    margin-left: 8px;
    color: var(--art-text-gray-500);
    font-size: 12px;
    font-weight: 400;
  }

  .panel-tools {
    display: flex;
    gap: 8px;

    :deep(.el-input) {
      width: 160px;
    }

    :deep(.el-select) {
      width: 106px;
    }
  }

  .dimension-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .muted {
    color: var(--art-text-gray-500);
    font-size: 12px;
  }

  .dimension-select {
    width: 100%;
  }

  .form-tip {
    width: 100%;
    margin-top: 4px;
    color: var(--art-text-gray-500);
    font-size: 12px;
    line-height: 1.5;
  }

  @media (max-width: 1100px) {
    .manage-grid {
      grid-template-columns: 1fr;
    }

    .panel :deep(.el-table),
    .panel :deep(.el-table__body-wrapper) {
      height: auto !important;
    }
  }
</style>
