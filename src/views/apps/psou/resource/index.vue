<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search">
        <ArtSearchBar
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
              <ElButton v-ripple type="primary" :icon="Plus" @click="showDialog('add')"> 新增资源 </ElButton>
              <ElButton v-ripple :icon="Refresh" @click="loadCategories">刷新分类</ElButton>
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
          <template #cover="{ row }">
            <ElImage
              v-if="row.cover"
              class="res-cover"
              :src="$rurl(row.cover)"
              fit="cover"
              :preview-src-list="[$rurl(row.cover)]"
              preview-teleported
            />
            <span v-else class="muted">无封面</span>
          </template>
          <template #title="{ row }">
            <div class="res-title">
              <b>{{ row.title }}</b>
              <small>{{ row.summary || '-' }}</small>
            </div>
          </template>
          <template #status="{ row }">
            <ElSwitch
              :model-value="row.status === 1"
              inline-prompt
              active-text="上架"
              inactive-text="下架"
              :before-change="handleToggleStatus(row)"
            />
          </template>
          <template #isBanner="{ row }">
            <ElTag :type="row.isBanner ? 'success' : 'info'" effect="light" size="small">
              {{ row.isBanner ? '是' : '否' }}
            </ElTag>
          </template>
          <template #operation="{ row }">
            <ArtOperation :list="operationItems(row)" :data="row" />
          </template>
        </ArtTable>
      </div>

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增资源' : '编辑资源'"
        class="resource-dialog"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="600px"
        align-center
      >
        <div class="resource-form-body">
          <ArtForm
            ref="basicFormRef"
            v-model="currentData"
            :items="formItems"
            :span="12"
            label-width="96px"
            :show-submit="false"
            :show-cancel="false"
          />
        </div>

        <template #footer>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <ElDialog
        v-model="coverDialogVisible"
        class="resource-cover-dialog"
        title="选择封面 · 三方数据"
        width="760px"
        append-to-body
        align-center
        :close-on-click-modal="false"
        @closed="resetPendingMetadata"
      >
        <div v-if="pendingMetadata" class="cover-picker">
          <div class="cover-picker-meta">
            <div>
              <b>{{ pendingMetadata.title }}</b>
              <span v-if="pendingMetadata.year">{{ pendingMetadata.year }}</span>
              <span v-if="pendingMetadata.kind">{{ pendingMetadata.kind }}</span>
            </div>
            <ElRate :model-value="pendingMetadata.score / 2" disabled allow-half />
            <span>数据来源：{{ pendingMetadata.source || '三方数据' }}</span>
          </div>

          <div v-if="coverCandidates.length" class="cover-picker-grid">
            <button
              v-for="cover in coverCandidates"
              :key="cover"
              type="button"
              class="cover-option"
              :class="{ 'is-selected': selectedCover === cover }"
              @click="selectedCover = cover"
            >
              <img :src="$rurl(cover)" alt="封面候选" />
              <span class="cover-option-check">
                <ElIcon><Check /></ElIcon>
              </span>
            </button>
          </div>
          <ElEmpty v-else description="三方数据未返回可用封面，可手动上传" :image-size="72" />
        </div>

        <template #footer>
          <ElButton @click="coverDialogVisible = false">取消</ElButton>
          <ElButton
            type="primary"
            :disabled="!selectedCover"
            :loading="coverCropLoading"
            @click="handleUseSelectedCover"
          >
            使用所选封面
          </ElButton>
        </template>
      </ElDialog>

      <ElDialog
        v-model="coverCropVisible"
        :destroy-on-close="true"
        class="resource-cover-crop-dialog"
        modal-class="cut-dialog"
        title="裁剪封面"
        width="720px"
        append-to-body
        align-center
        :close-on-click-modal="false"
        @closed="releaseCoverCropSource"
      >
        <div v-loading="coverCropUploading" class="cutter" element-loading-text="正在上传裁剪后的封面">
          <Cutter
            v-if="coverCropSource"
            :img-url="coverCropSource"
            :cut-width="RESOURCE_COVER_CROP_WIDTH"
            :cut-height="RESOURCE_COVER_CROP_HEIGHT"
            :box-width="680"
            :box-height="560"
            :img-move="true"
            :tool-box-overflow="false"
            file-type="jpeg"
            @success="handleCoverCropSuccess"
            @error="handleCoverCropError"
          />
        </div>
      </ElDialog>

      <ElDialog
        v-model="bannerFocusVisible"
        title="轮播构图"
        class="resource-banner-focus-dialog"
        width="760px"
        append-to-body
        align-center
        :close-on-click-modal="false"
        @closed="resetBannerFocusDialog"
      >
        <div class="banner-focus">
          <div
            ref="bannerFocusStageRef"
            class="banner-focus__stage"
            :class="{ 'is-dragging': bannerFocusDragging }"
            @pointerdown="handleBannerFocusPointerDown"
            @pointermove="handleBannerFocusPointerMove"
            @pointerup="handleBannerFocusPointerUp"
            @pointercancel="handleBannerFocusPointerUp"
          >
            <img
              v-if="bannerFocusCover"
              class="banner-focus__image"
              :src="bannerFocusCover"
              :style="bannerFocusImageStyle"
              alt="轮播构图预览"
              draggable="false"
              @load="handleBannerFocusImageLoad"
            />
            <div v-else class="banner-focus__empty">该资源暂无封面</div>
            <div class="banner-focus__grid" />
            <span v-if="bannerFocusCover" class="banner-focus__hint"> 拖动图片，选择首页轮播的显示区域 </span>
          </div>
          <div class="banner-focus__toolbar">
            <div class="banner-focus__meta">
              <span class="banner-focus__ratio">构图比例：12:5 横图</span>
              <span class="banner-focus__position">
                显示位置：横向 {{ Math.round(bannerFocusX * 100) }}% · 纵向 {{ Math.round(bannerFocusY * 100) }}%
              </span>
            </div>
            <ElButton size="small" @click="resetBannerFocusCenter">恢复居中</ElButton>
          </div>
        </div>

        <template #footer>
          <ElButton @click="bannerFocusVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="bannerFocusSaving" :disabled="!bannerFocusCover" @click="saveBannerFocus">
            保存构图
          </ElButton>
        </template>
      </ElDialog>

      <ElDialog
        v-model="sourceDialogVisible"
        :title="sourceDialogTitle"
        class="resource-source-dialog"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="1080px"
        align-center
        @closed="resetSourceDialog"
      >
        <div class="source-dialog-body">
          <template v-if="!sourceEditing">
            <div class="source-list-toolbar">
              <div>
                <b>资源来源</b>
                <small>维护该资源可用的网盘副本</small>
              </div>
              <ElSpace>
                <ElButton :icon="Refresh" :loading="sourceListLoading" @click="loadSourceList()">刷新</ElButton>
                <ElButton type="primary" :icon="Plus" @click="openSourceEditor()">新增来源</ElButton>
              </ElSpace>
            </div>

            <div class="source-table-wrap">
              <ElTable
                v-loading="sourceListLoading"
                :data="sourceList"
                row-key="id"
                height="100%"
                empty-text="暂无资源来源"
              >
                <ElTableColumn prop="platform" label="平台" width="90">
                  <template #default="{ row }">
                    <ElTag effect="plain" size="small">{{ platformLabel(row.platform) }}</ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="shareUrl" label="分享链接" min-width="240" show-overflow-tooltip>
                  <template #default="{ row }">
                    <div class="source-link-cell">
                      <span :title="row.shareUrl">{{ row.shareUrl || '-' }}</span>
                      <small v-if="row.fsId" :title="row.fsId">fs_id：{{ row.fsId }}</small>
                    </div>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="文件大小" width="100">
                  <template #default="{ row }">{{ getFileSize(row.size) || '0 B' }}</template>
                </ElTableColumn>
                <ElTableColumn label="文件数" width="90">
                  <template #default="{ row }">{{ row.fileCount }}</template>
                </ElTableColumn>
                <ElTableColumn prop="formatSummary" label="格式" width="110" show-overflow-tooltip>
                  <template #default="{ row }">{{ row.formatSummary || '-' }}</template>
                </ElTableColumn>
                <ElTableColumn label="状态" width="100">
                  <template #default="{ row }">
                    <ElSwitch
                      :model-value="row.status === 1"
                      inline-prompt
                      active-text="正常"
                      inactive-text="失效"
                      :before-change="handleSourceStatusChange(row)"
                    />
                  </template>
                </ElTableColumn>
                <ElTableColumn label="更新时间" width="170">
                  <template #default="{ row }">{{ formatTime(row.updatedAt) }}</template>
                </ElTableColumn>
                <ElTableColumn label="操作" width="160" fixed="right">
                  <template #default="{ row }">
                    <ElSpace>
                      <ElButton link type="primary" :icon="Edit" @click="openSourceEditor(row)">编辑</ElButton>
                      <ElButton link type="danger" :icon="Delete" @click="handleDeleteSource(row)">删除</ElButton>
                    </ElSpace>
                  </template>
                </ElTableColumn>
              </ElTable>
            </div>
          </template>

          <template v-else>
            <div class="source-editor-toolbar">
              <div class="source-editor-title">
                <ElButton link :icon="ArrowLeft" @click="backToSourceList">返回</ElButton>
                <b>{{ sourceDraft.id ? '编辑来源' : '新增来源' }}</b>
                <small v-if="sourceResource">{{ sourceResource.title }}</small>
              </div>
            </div>

            <div class="source-editor-scroll">
              <div class="netdisk-grid">
                <ElFormItem class="span-2" label="来源方式" label-width="70px" required>
                  <ElRadioGroup v-model="sourceDraft.sourceMode" @change="handleSourceModeChange">
                    <ElRadioButton value="pansou">Pansou 检索</ElRadioButton>
                    <ElRadioButton value="direct">从链接提取</ElRadioButton>
                  </ElRadioGroup>
                </ElFormItem>

                <template v-if="sourceDraft.sourceMode === 'pansou'">
                  <ElFormItem class="span-2" label="检索资源" label-width="70px" required>
                    <div class="source-search-row">
                      <ElInput
                        v-model="sourceDraft.searchKeyword"
                        placeholder="输入资源名称检索"
                        maxlength="128"
                        clearable
                        @input="handleSearchKeywordInput(sourceDraft)"
                        @keyup.enter="handleSearchSources(sourceDraft)"
                      />
                      <ElButton
                        type="primary"
                        :loading="sourceDraft.searching"
                        @click="handleSearchSources(sourceDraft)"
                      >
                        检索
                      </ElButton>
                    </div>
                  </ElFormItem>
                  <ElFormItem
                    v-if="sourceDraft.searchResults.length"
                    class="span-2"
                    label="选择结果"
                    label-width="70px"
                    required
                  >
                    <div class="search-result-panel">
                      <div class="search-result-toolbar">
                        <small>已检测通过，选择结果后确认加载分享文件</small>
                        <ElSelect
                          v-model="sourceDraft.searchPlatform"
                          class="search-result-filter"
                          size="small"
                          @change="handleSearchPlatformChange"
                        >
                          <ElOption
                            v-for="item in searchPlatformOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                          />
                        </ElSelect>
                      </div>
                      <div class="search-result-list">
                        <ElRadioGroup
                          v-if="filteredSearchResults.length"
                          v-model="sourceDraft.searchToken"
                          class="search-result-radio"
                          @change="handlePickSearchResult(sourceDraft)"
                        >
                          <ElRadio
                            v-for="item in filteredSearchResults"
                            :key="item.token"
                            :value="item.token"
                            class="search-result-item"
                          >
                            <div class="search-result-content">
                              <ElTag effect="plain" size="small">{{ platformLabel(item.platform) }}</ElTag>
                              <span class="search-result-title">{{ item.title }}</span>
                              <small v-if="item.source">{{ item.source }}</small>
                            </div>
                          </ElRadio>
                        </ElRadioGroup>
                        <div v-else class="search-result-empty">该类型暂无有效资源</div>
                      </div>
                      <div class="search-result-actions">
                        <ElButton
                          type="primary"
                          :loading="sourceDraft.confirming"
                          :disabled="!sourceDraft.searchToken || sourceDraft.confirmedToken === sourceDraft.searchToken"
                          @click="handleConfirmSearchResult(sourceDraft)"
                        >
                          {{ sourceDraft.confirmedToken === sourceDraft.searchToken ? '已确认' : '确认' }}
                        </ElButton>
                      </div>
                    </div>
                  </ElFormItem>
                </template>

                <template v-else>
                  <ElFormItem class="span-2" label="分享链接" label-width="70px" required>
                    <div class="source-search-row">
                      <ElInput
                        v-model="sourceDraft.sourceUrl"
                        placeholder="粘贴百度网盘 / 夸克分享链接"
                        maxlength="512"
                        clearable
                        @input="handleDirectSourceInput(sourceDraft)"
                        @keyup.enter="handleExtractShareLink(sourceDraft)"
                      />
                      <ElButton
                        type="primary"
                        :loading="sourceDraft.confirming"
                        :disabled="sourceDraft.detailsConfirmed || !sourceDraft.sourceUrl.trim()"
                        @click="handleExtractShareLink(sourceDraft)"
                      >
                        {{ sourceDraft.detailsConfirmed ? '已提取' : '提取' }}
                      </ElButton>
                    </div>
                  </ElFormItem>
                </template>

                <ElFormItem
                  v-if="sourceDraft.detailsConfirmed"
                  class="span-2"
                  label="选择文件"
                  label-width="70px"
                  required
                >
                  <div v-loading="sourceDraft.treeLoading" class="transfer-tree-panel">
                    <div class="transfer-tree-toolbar">
                      <small>首屏加载两层，展开目录继续加载；可勾选多个文件或目录</small>
                      <span>已选 {{ sourceDraft.checkedFsIds.length }} 项</span>
                    </div>
                    <ElTree
                      :ref="(instance) => setTransferTreeRef(sourceDraft._key, instance)"
                      :data="sourceDraft.transferTree"
                      :props="transferTreeProps"
                      node-key="fsId"
                      show-checkbox
                      check-strictly
                      :expand-on-click-node="false"
                      class="transfer-tree"
                      @node-expand="handleTransferTreeExpand(sourceDraft, $event)"
                      @node-click="handleTransferTreeNodeClick(sourceDraft, $event)"
                      @check="(_data, info) => handleTransferTreeCheck(sourceDraft, info)"
                    >
                      <template #default="{ data }">
                        <div class="transfer-tree-node" :class="{ 'is-placeholder': data.isPlaceholder }">
                          <ElIcon>
                            <Folder v-if="data.isDir" />
                            <Document v-else />
                          </ElIcon>
                          <span class="transfer-tree-node__name" :title="data.path || data.name">{{ data.name }}</span>
                          <small v-if="!data.isDir && !data.isPlaceholder">{{ getFileSize(data.size) || '0 B' }}</small>
                        </div>
                      </template>
                    </ElTree>
                    <ElEmpty
                      v-if="!sourceDraft.treeLoading && !sourceDraft.transferTree.length"
                      description="分享内没有文件"
                    />
                    <div v-if="sourceDraft.activeTreeNode" class="tree-node-info">
                      <div>
                        <b>{{ sourceDraft.activeTreeNode.name }}</b>
                        <ElTag size="small" effect="plain">
                          {{ sourceDraft.activeTreeNode.isDir ? '文件夹' : '文件' }}
                        </ElTag>
                      </div>
                      <small v-if="sourceDraft.activeTreeNode.path">{{ sourceDraft.activeTreeNode.path }}</small>
                      <span v-else-if="!sourceDraft.activeTreeNode.isDir">
                        大小：{{ getFileSize(sourceDraft.activeTreeNode.size) || '0 B' }}
                      </span>
                    </div>
                    <div class="transfer-tree-actions">
                      <ElButton
                        type="primary"
                        :loading="sourceDraft.selectionScanning"
                        :disabled="!sourceDraft.checkedFsIds.length || sourceDraft.selectionConfirmed"
                        @click="handleSummarizeSelection(sourceDraft)"
                      >
                        {{ sourceDraft.selectionConfirmed ? '已确认' : '确认' }}
                      </ElButton>
                    </div>
                  </div>
                </ElFormItem>

                <ElFormItem v-if="sourceDraft.selectionConfirmed" class="span-2" label="文件详情" label-width="70px">
                  <div class="source-detail-grid">
                    <div class="source-detail-item source-detail-title">
                      <span>来源标题</span>
                      <b>{{ sourceDraft.searchTitle || '-' }}</b>
                    </div>
                    <div class="source-detail-item">
                      <span>文件大小</span>
                      <b>{{ getFileSize(sourceDraft.size) || '0 B' }}</b>
                    </div>
                    <div class="source-detail-item">
                      <span>文件数</span>
                      <b>{{ sourceDraft.fileCount }}</b>
                    </div>
                    <div class="source-detail-item">
                      <span>格式</span>
                      <b>{{ sourceDraft.formatSummary || '未识别' }}</b>
                    </div>
                  </div>
                </ElFormItem>

                <ElFormItem
                  v-if="sourceDraft.selectionConfirmed || sourceDraft.id"
                  label="转存账号"
                  label-width="70px"
                  required
                >
                  <ElSelect
                    v-model="sourceDraft.accountId"
                    :loading="accountLoading"
                    :disabled="!sourceDraft.platform"
                    placeholder="请选择转存账号"
                    filterable
                    style="width: 100%"
                  >
                    <ElOption
                      v-for="account in transferAccountOptions(sourceDraft)"
                      :key="account.id"
                      :label="accountOptionLabel(account)"
                      :value="account.id"
                    />
                  </ElSelect>
                </ElFormItem>
              </div>
            </div>
          </template>
        </div>

        <template v-if="sourceEditing" #footer>
          <ElButton @click="backToSourceList">取消</ElButton>
          <ElButton type="primary" :loading="sourceSaving" @click="saveSource">确认</ElButton>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    ArrowLeft,
    Check,
    Crop,
    Delete,
    Document,
    Edit,
    Folder,
    HomeFilled,
    Plus,
    Refresh
  } from '@element-plus/icons-vue'

  import { useTable } from '@/composables/useTable'
  import {
    CreateResource,
    DeleteResource,
    ListResource,
    FetchResourceMetadata,
    UpdateResource,
    UpdateResourceBanner,
    UpdateResourceBannerFocus,
    UpdateResourceStatus
  } from '@/api/psou/resource/api'
  import type {
    CreateResourceRequest,
    Resource,
    ResourceMetadata,
    UpdateResourceRequest
  } from '@/api/psou/resource/type'
  import {
    CreateNetdisk,
    DeleteNetdisk,
    GetNetdisk,
    ListNetdisk,
    UpdateNetdisk,
    UpdateNetdiskStatus
  } from '@/api/psou/netdisk/api'
  import type { CreateNetdiskRequest, Netdisk, NetdiskFile, UpdateNetdiskRequest } from '@/api/psou/netdisk/type'
  import { ListAccount } from '@/api/psou/account/api'
  import type { Account } from '@/api/psou/account/type'
  import {
    ListSearchFile,
    QuickSearchResources,
    SummarizeSelection,
    TransferSearchToAccount
  } from '@/api/psou/search/api'
  import type { SearchResourceItem, TransferFileItem } from '@/api/psou/search/type'
  import { loadingService } from '@/utils'
  import { getFileSize } from '@/utils/file'
  import { isPortraitImage } from '@/utils/resource/image'
  import { isRemoteResourceURL, resolveResourceUrl, rurl } from '@/utils/resource/url'
  import { uploadFile } from '@/utils/resource/upload'
  import { formatTime } from '@/utils/time'
  import { useCategoryOptions } from '../useCategoryOptions'

  defineOptions({ name: 'PsouResource' })

  const RESOURCE_COVER_CROP_WIDTH = 330
  const RESOURCE_COVER_CROP_HEIGHT = 440
  const RESOURCE_TAGS_MAX = 3

  interface ResourceForm extends Partial<Resource> {
    tagsArray?: string[]
  }

  type SearchPlatformFilter = 'all' | 'baidu' | 'quark'

  interface NetdiskDraft {
    _key: string
    id?: number
    sourceMode: 'pansou' | 'direct'
    platform: string
    shareUrl: string
    sourceUrl: string
    password: string
    userId: number
    accountId?: number
    fsId: string
    size: number
    formatSummary: string
    fileCount: number
    files: NetdiskFile[]
    status: number
    originalStatus?: number
    originalAccountId?: number
    originalPlatform: string
    originalShareUrl: string
    searchKeyword: string
    searching: boolean
    searchResults: SearchResourceItem[]
    searchPlatform: SearchPlatformFilter
    searchToken: string
    searchTitle: string
    confirming: boolean
    detailsConfirmed: boolean
    confirmedToken: string
    transferTree: TransferFileItem[]
    treeMeta: string
    treeLoading: boolean
    treeLoadingFsIds: string[]
    checkedFsIds: string[]
    selectionScanning: boolean
    selectionConfirmed: boolean
    selectedFsIds: string[]
    activeTreeNode?: TransferFileItem
    transferring: boolean
  }

  interface TransferTreeInstance {
    updateKeyChildren: (key: string, data: TransferFileItem[]) => void
  }

  interface TransferTreeCheckInfo {
    checkedKeys: Array<string | number>
  }

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<ResourceForm>({})
  const basicFormRef = ref<{ validate: () => Promise<unknown> } | null>(null)
  const submitting = ref(false)
  const coverDialogVisible = ref(false)
  const pendingMetadata = ref<ResourceMetadata>()
  const coverCandidates = ref<string[]>([])
  const selectedCover = ref('')
  const coverCropVisible = ref(false)
  const coverCropLoading = ref(false)
  const coverCropUploading = ref(false)
  const coverCropSource = ref('')
  let coverCropObjectURL = ''
  const bannerFocusVisible = ref(false)
  const bannerFocusSaving = ref(false)
  const bannerFocusDragging = ref(false)
  const bannerFocusResource = ref<Resource>()
  const bannerFocusCover = ref('')
  const bannerFocusX = ref(0.5)
  const bannerFocusY = ref(0.5)
  const bannerFocusStageRef = ref<HTMLElement | null>(null)
  const bannerFocusImageSize = ref({ width: 0, height: 0 })
  let bannerFocusDragStart: {
    pointerId: number
    clientX: number
    clientY: number
    x: number
    y: number
  } | null = null
  const accounts = ref<Account[]>([])
  const accountLoading = ref(false)
  const sourceDialogVisible = ref(false)
  const sourceResource = ref<Resource>()
  const sourceList = ref<Netdisk[]>([])
  const sourceListLoading = ref(false)
  const sourceEditing = ref(false)
  const sourceSaving = ref(false)
  let sourceLoadToken = 0
  let netdiskKeySeed = 0

  const platformOptions = [
    { label: '夸克', value: 'quark' },
    { label: '百度', value: 'baidu' },
    { label: '迅雷（暂不支持转存）', value: 'xunlei', disabled: true }
  ]

  const createNetdiskDraft = (source?: Partial<Netdisk>): NetdiskDraft => {
    netdiskKeySeed += 1
    const status = source?.id ? Number(source.status) || 0 : 1
    return {
      _key: `netdisk-${netdiskKeySeed}`,
      id: source?.id,
      sourceMode: 'direct',
      platform: source?.platform || '',
      shareUrl: source?.shareUrl || '',
      sourceUrl: source?.sourceUrl || source?.shareUrl || '',
      password: '',
      userId: Number(source?.userId) || 0,
      accountId: Number(source?.accountId) || undefined,
      fsId: source?.fsId || '',
      size: Number(source?.size) || 0,
      formatSummary: source?.formatSummary || '',
      fileCount: Number(source?.fileCount) || 0,
      files: source?.files || [],
      status,
      originalStatus: source?.id ? status : undefined,
      originalAccountId: Number(source?.accountId) || undefined,
      originalPlatform: source?.platform || '',
      originalShareUrl: source?.shareUrl || '',
      searchKeyword: '',
      searching: false,
      searchResults: [],
      searchPlatform: 'all',
      searchToken: '',
      searchTitle: '',
      confirming: false,
      detailsConfirmed: false,
      confirmedToken: '',
      transferTree: [],
      treeMeta: '',
      treeLoading: false,
      treeLoadingFsIds: [],
      checkedFsIds: [],
      selectionScanning: false,
      selectionConfirmed: false,
      selectedFsIds: [],
      transferring: false
    }
  }

  const sourceDraft = ref<NetdiskDraft>(createNetdiskDraft())
  const searchPlatformOptions = computed(() => {
    const results = sourceDraft.value.searchResults
    return [
      { label: `全部（${results.length}）`, value: 'all' as const },
      { label: `百度（${results.filter((item) => item.platform === 'baidu').length}）`, value: 'baidu' as const },
      { label: `夸克（${results.filter((item) => item.platform === 'quark').length}）`, value: 'quark' as const }
    ]
  })
  const filteredSearchResults = computed(() => {
    const platform = sourceDraft.value.searchPlatform
    if (platform === 'all') return sourceDraft.value.searchResults
    return sourceDraft.value.searchResults.filter((item) => item.platform === platform)
  })
  const sourceDialogTitle = computed(() => {
    const title = sourceResource.value?.title
    return title ? `资源来源 · ${title}` : '资源来源'
  })

  const { loadCategories, categoryMap, channelMap, categoryOptions } = useCategoryOptions()

  const canGenerateMetadata = computed(() => !!currentData.value.title?.trim())
  const aiMetadataTip = computed(() =>
    canGenerateMetadata.value ? '使用 AI 补全资源信息（接入中）' : '请先填写资源标题'
  )
  const thirdPartyMetadataTip = computed(() =>
    canGenerateMetadata.value ? '从三方数据源获取摘要、详情、标签、评分和封面' : '请先填写资源标题'
  )

  const applyMetadata = (metadata: ResourceMetadata, cover?: string) => {
    const resolvedTitle = String(metadata.title || '').trim()
    if (resolvedTitle) currentData.value.title = resolvedTitle

    const summary = String(metadata.summary || '').trim()
    if (summary) currentData.value.summary = summary

    const description = String(metadata.description || '').trim()
    if (description) currentData.value.description = description

    const tags = Array.isArray(metadata.tags)
      ? metadata.tags.map((tag) => String(tag).replace(/^#+/, '').trim()).filter(Boolean)
      : []
    if (tags.length) currentData.value.tagsArray = tags.slice(0, RESOURCE_TAGS_MAX)

    const score = Number(metadata.score)
    if (Number.isFinite(score)) {
      currentData.value.score = Math.min(10, Math.max(0, Math.round(score * 10) / 10))
    }
    if (cover) currentData.value.cover = cover
  }

  const handleAIResolveMetadata = () => {
    if (!canGenerateMetadata.value) {
      ElMessage.warning('请先填写资源标题')
      return
    }
    ElMessage.info('AI 元数据能力接入中，暂未开放')
  }

  const handleThirdPartyMetadata = () => {
    const title = String(currentData.value.title || '').trim()
    if (!title) {
      ElMessage.warning('请先填写资源标题')
      return
    }

    loadingService.apply(async () => {
      const { metadata } = await FetchResourceMetadata({ title, type: 'auto' })
      const covers = [...new Set((metadata.covers || []).map((cover) => String(cover).trim()).filter(Boolean))]
      if (covers.length) {
        pendingMetadata.value = metadata
        coverCandidates.value = covers
        selectedCover.value = covers[0]
        coverDialogVisible.value = true
        return
      }

      applyMetadata(metadata)
      ElMessage.warning(metadata.coverError || '三方数据未返回可用封面，请手动上传')
    }, '正在获取三方资源数据，请稍等')
  }

  const releaseCoverCropSource = () => {
    if (coverCropObjectURL) {
      URL.revokeObjectURL(coverCropObjectURL)
      coverCropObjectURL = ''
    }
    coverCropSource.value = ''
  }

  const handleUseSelectedCover = async () => {
    const cover = selectedCover.value.trim()
    const metadata = pendingMetadata.value
    if (!cover || !metadata || coverCropLoading.value) return

    coverCropLoading.value = true
    try {
      if (isRemoteResourceURL(cover)) {
        if (await isPortraitImage(cover)) {
          applyMetadata(metadata, cover)
          coverDialogVisible.value = false
          ElMessage.success('封面已是竖图，已直接使用三方图片，未转存对象存储')
          return
        }
        releaseCoverCropSource()
        coverCropSource.value = cover
        coverCropVisible.value = true
        return
      }

      const response = await fetch(
        resolveResourceUrl(`/resource/api/file/read-by-key?key=${encodeURIComponent(cover)}`)
      )
      if (!response.ok) throw new Error('获取封面图片失败')
      const blob = await response.blob()
      if (!blob.type.startsWith('image/')) throw new Error('封面内容不是有效图片')

      if (await isPortraitImage(blob)) {
        applyMetadata(metadata, cover)
        coverDialogVisible.value = false
        ElMessage.success('封面已是竖图，已直接使用')
        return
      }

      releaseCoverCropSource()
      coverCropObjectURL = URL.createObjectURL(blob)
      coverCropSource.value = coverCropObjectURL
      coverCropVisible.value = true
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '获取封面图片失败')
    } finally {
      coverCropLoading.value = false
    }
  }

  const handleCoverCropError = () => {
    ElMessage.error('封面图片加载失败，请手动上传竖图')
    coverCropVisible.value = false
  }

  const handleCoverCropSuccess = async (blob: Blob) => {
    if (!pendingMetadata.value || coverCropUploading.value) return

    coverCropUploading.value = true
    try {
      const type = blob.type || 'image/jpeg'
      const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg'
      const file = new File([blob], `cover.${ext}`, { type, lastModified: Date.now() })
      const result = await uploadFile(file, { path: 'psou/resource/cover', name: file.name })
      applyMetadata(pendingMetadata.value, result.key)
      coverCropVisible.value = false
      coverDialogVisible.value = false
      ElMessage.success('封面已裁剪上传，三方数据已填入，请核对后保存')
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '封面裁剪上传失败')
    } finally {
      coverCropUploading.value = false
    }
  }

  const resetPendingMetadata = () => {
    pendingMetadata.value = undefined
    coverCandidates.value = []
    selectedCover.value = ''
  }

  onBeforeUnmount(releaseCoverCropSource)

  const statusOptions = [
    { label: '下架', value: 0 },
    { label: '上架', value: 1 }
  ]

  const searchForm = ref({
    keyword: undefined as string | undefined,
    categoryId: undefined as number | undefined,
    status: undefined as number | undefined,
    isBanner: undefined as boolean | undefined
  })

  const searchItems = computed(() => [
    {
      label: '资源标题',
      key: 'keyword',
      type: 'input',
      props: { placeholder: '请输入资源标题', clearable: true, maxlength: 255 }
    },
    {
      label: '所属分类',
      key: 'categoryId',
      type: 'select',
      props: {
        placeholder: '请选择二级分类',
        clearable: true,
        filterable: true,
        options: categoryOptions.value
      }
    },
    {
      label: '资源状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择资源状态',
        clearable: true,
        options: statusOptions
      }
    },
    {
      label: '是否横幅',
      key: 'isBanner',
      type: 'select',
      props: {
        placeholder: '请选择是否横幅',
        clearable: true,
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    }
  ])

  const formItems = computed(() => {
    return [
      {
        key: 'categoryId',
        span: 24,
        label: '所属分类',
        type: 'select',
        props: {
          placeholder: '请选择二级分类',
          filterable: true,
          options: categoryOptions.value,
          style: { width: '100%' },
          rules: [{ required: true, message: '请选择二级分类', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'title',
        span: 24,
        label: '资源标题',
        type: 'input',
        props: {
          placeholder: '请输入资源标题',
          maxlength: 255,
          rules: [{ required: true, message: '请输入资源标题', trigger: ['blur', 'change'] }]
        },
        suffix: {
          hidden: false,
          icon: 'iconsys-mofa',
          tip: aiMetadataTip.value,
          style: { color: '#9a6ce6', opacity: canGenerateMetadata.value ? '1' : '0.45' },
          onclick: handleAIResolveMetadata
        },
        actions: [
          {
            icon: 'iconsys-shuju',
            tip: thirdPartyMetadataTip.value,
            style: { color: '#409eff', opacity: canGenerateMetadata.value ? '1' : '0.45' },
            onclick: handleThirdPartyMetadata
          }
        ]
      },
      {
        key: 'cover',
        span: 24,
        label: '封面图片',
        type: 'upload',
        props: {
          class: 'resource-cover-upload',
          accept: 'image/*',
          directoryPath: 'psou/resource/cover',
          limit: 1,
          width: '180px',
          height: '240px',
          selectFromFile: true,
          cut: {
            enable: true,
            width: RESOURCE_COVER_CROP_WIDTH,
            height: RESOURCE_COVER_CROP_HEIGHT,
            boxHeight: 560
          },
          rules: [{ required: true, message: '请上传封面图片', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'summary',
        span: 24,
        label: '资源摘要',
        type: 'input',
        props: {
          type: 'textarea',
          rows: 2,
          maxlength: 512,
          placeholder: '请输入一句话摘要',
          rules: [{ required: true, message: '请输入资源摘要', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'description',
        span: 24,
        label: '资源详情',
        type: 'input',
        props: {
          type: 'textarea',
          rows: 5,
          maxlength: 20000,
          placeholder: '请输入资源详情简介',
          rules: [{ required: true, message: '请输入资源详情', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'tagsArray',
        span: 24,
        label: '资源标签',
        type: 'inputtag',
        props: {
          placeholder: '输入标签后回车',
          max: RESOURCE_TAGS_MAX,
          maxlength: 64,
          rules: [
            {
              type: 'array',
              required: true,
              min: 1,
              message: '请至少添加一个资源标签',
              trigger: ['blur', 'change']
            },
            {
              type: 'array',
              max: RESOURCE_TAGS_MAX,
              message: `资源标签最多${RESOURCE_TAGS_MAX}个`,
              trigger: ['blur', 'change']
            }
          ]
        }
      },
      {
        key: 'score',
        label: '资源评分',
        type: 'number',
        props: {
          min: 0,
          max: 10,
          step: 0.1,
          precision: 1,
          align: 'left',
          controlsPosition: 'right',
          placeholder: '0.0 ~ 10.0',
          style: { width: '100%' },
          rules: [{ type: 'number', required: true, message: '请输入资源评分', trigger: ['blur', 'change'] }]
        }
      },
      {
        key: 'weight',
        label: '排序权重',
        type: 'number',
        defaultValue: 0,
        props: {
          min: -999999,
          max: 999999,
          align: 'left',
          controlsPosition: 'right',
          style: { width: '100%' }
        }
      }
    ]
  })

  const operationItems = (row: Resource) => {
    return [
      {
        icon: HomeFilled,
        label: row.isBanner ? '取消轮播' : '设为轮播',
        color: row.isBanner ? 'info' : 'success',
        popConfirm: true,
        popTitle: `确定${row.isBanner ? '取消' : '设为'}「${row.title}」轮播吗？`,
        click: (record: Resource) => handleToggleBanner(record)
      },
      ...(row.isBanner && row.cover
        ? [
            {
              icon: Crop,
              label: '轮播构图',
              color: 'primary',
              click: (record: Resource) => showBannerFocus(record)
            }
          ]
        : []),
      {
        icon: Folder,
        label: '资源来源',
        color: 'primary',
        click: (record: Resource) => showSourceDialog(record)
      },
      {
        icon: Edit,
        label: '编辑资源',
        color: 'warning',
        click: (record: Resource) => showDialog('edit', record)
      },
      {
        icon: Delete,
        popConfirm: true,
        label: '删除资源',
        color: 'danger',
        click: async (record: Resource) => {
          await DeleteResource({ id: record.id })
          refreshRemove()
        }
      }
    ]
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    searchParams,
    pagination,
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
      apiFn: ListResource,
      apiParams: {
        page: 1,
        pageSize: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'cover',
          label: '封面图片',
          width: 110,
          useSlot: true,
          slotName: 'cover'
        },
        {
          prop: 'title',
          label: '资源标题',
          minWidth: 240,
          useSlot: true,
          slotName: 'title'
        },
        {
          prop: 'categoryId',
          label: '所属分类',
          minWidth: 160,
          formatter: (row: Resource) => {
            const category = categoryMap.value.get(row.categoryId)
            if (!category) return `#${row.categoryId}`
            const channel = channelMap.value.get(category.parentId)?.name
            return channel ? `${channel} / ${category.name}` : category.name
          }
        },
        {
          prop: 'score',
          label: '资源评分',
          width: 90,
          formatter: (row: Resource) => (row.score == null ? '-' : Number(row.score).toFixed(1))
        },
        {
          prop: 'status',
          label: '资源状态',
          width: 100,
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'isBanner',
          label: '是否横幅',
          width: 110,
          useSlot: true,
          slotName: 'isBanner'
        },
        {
          prop: 'viewCount',
          label: '浏览/点击',
          width: 130,
          formatter: (row: Resource) => `${row.viewCount} / ${row.clickCount}`
        },
        {
          prop: 'weight',
          label: '排序权重',
          width: 100
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          width: 170,
          formatter: (row: Resource) => formatTime(row.createdAt)
        },
        {
          prop: 'updatedAt',
          label: '更新时间',
          width: 170,
          formatter: (row: Resource) => formatTime(row.updatedAt)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 110,
          fixed: 'right',
          useSlot: true,
          slotName: 'operation'
        }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, { ...searchForm.value })
    getData()
  }

  const normalizeTags = (tags?: string[]) =>
    Array.isArray(tags) ? tags.filter(Boolean).slice(0, RESOURCE_TAGS_MAX) : []

  const loadSourceList = async (resourceId = Number(sourceResource.value?.id)) => {
    if (!resourceId) {
      sourceList.value = []
      return
    }
    const token = ++sourceLoadToken
    sourceListLoading.value = true
    try {
      const reply = await ListNetdisk({ page: 1, pageSize: 200, resourceId })
      if (token !== sourceLoadToken) return
      sourceList.value = reply.list || []
    } catch {
      if (token === sourceLoadToken) {
        sourceList.value = []
      }
    } finally {
      if (token === sourceLoadToken) sourceListLoading.value = false
    }
  }

  const loadTransferAccounts = async () => {
    accountLoading.value = true
    try {
      const reply = await ListAccount({ page: 1, pageSize: 200, status: 1 })
      accounts.value = reply.list || []
    } catch {
      accounts.value = []
    } finally {
      accountLoading.value = false
    }
  }

  const platformLabel = (platform: string) => platformOptions.find((item) => item.value === platform)?.label || platform

  const transferAccountOptions = (copy: NetdiskDraft) => {
    return accounts.value.filter((account) => account.platform === copy.platform)
  }

  const accountOptionLabel = (account: Account) => {
    const name = account.name || `账号 #${account.id}`
    const storageTotal = Number(account.storageTotal) || 0
    const storage = storageTotal
      ? ` · ${getFileSize(Number(account.storageUsed) || 0)}/${getFileSize(storageTotal)}`
      : ''
    return `${name}${storage}`
  }

  const transferTreeProps = {
    label: 'name',
    children: 'children',
    disabled: 'disabled',
    isLeaf: (item: Record<string, unknown>) => !item.hasChildren
  }

  const transferTreePlaceholderPrefix = '__transfer_tree_placeholder__:'
  const transferTreeRefs = new Map<string, TransferTreeInstance>()

  const setTransferTreeRef = (key: string, instance: unknown) => {
    if (instance && typeof (instance as TransferTreeInstance).updateKeyChildren === 'function') {
      transferTreeRefs.set(key, instance as TransferTreeInstance)
      return
    }
    transferTreeRefs.delete(key)
  }

  const createTransferTreePlaceholder = (item: TransferFileItem, name = '加载中...'): TransferFileItem => ({
    fsId: `${transferTreePlaceholderPrefix}${item.fsId}`,
    name,
    isDir: false,
    size: 0,
    path: '',
    hasChildren: false,
    disabled: true,
    isPlaceholder: true
  })

  const normalizeTransferTree = (items: TransferFileItem[]): TransferFileItem[] =>
    items.map((item) => {
      const children = item.children?.length ? normalizeTransferTree(item.children) : undefined
      const canLoadChildren = item.isDir && item.hasChildren && !children?.length
      return {
        ...item,
        children: canLoadChildren ? [createTransferTreePlaceholder(item)] : children,
        hasChildren: item.isDir && (!!children?.length || !!item.hasChildren)
      }
    })

  const collectTransferSelection = (copy: NetdiskDraft) => {
    const selected = new Set(copy.checkedFsIds)
    const result: string[] = []
    const walk = (items: TransferFileItem[]) => {
      for (const item of items) {
        if (item.isPlaceholder) continue
        if (selected.has(item.fsId)) {
          result.push(item.fsId)
          continue
        }
        if (item.isDir && item.children?.length) walk(item.children)
      }
    }
    walk(copy.transferTree)
    return [...new Set(result)].sort()
  }

  // 转存接口要求显式给出每个文件的落地相对路径，这里按分享内路径回填
  const collectTransferItems = (copy: NetdiskDraft) => {
    const selected = new Set(collectTransferSelection(copy))
    const result: Array<{ newPath: string; fsId: string }> = []
    const walk = (items: TransferFileItem[], parentPath: string) => {
      for (const item of items) {
        if (item.isPlaceholder) continue
        const relativePath =
          (item.path || '').trim().replace(/^\/+/, '') || [parentPath, item.name].filter(Boolean).join('/')
        if (selected.has(item.fsId)) {
          result.push({ newPath: relativePath, fsId: item.fsId })
          continue
        }
        if (item.isDir && item.children?.length) walk(item.children, relativePath)
      }
    }
    walk(copy.transferTree, '')
    return result
  }

  const resetSelectionDetails = (copy: NetdiskDraft) => {
    copy.checkedFsIds = []
    copy.selectionScanning = false
    copy.selectionConfirmed = false
    copy.selectedFsIds = []
    copy.size = 0
    copy.formatSummary = ''
    copy.fileCount = 0
    copy.files = []
    copy.fsId = ''
    copy.accountId = undefined
  }

  const resetConfirmedDetails = (copy: NetdiskDraft) => {
    copy.confirming = false
    copy.detailsConfirmed = false
    copy.confirmedToken = ''
    copy.treeMeta = ''
    copy.treeLoading = false
    copy.treeLoadingFsIds = []
    copy.transferTree = []
    copy.activeTreeNode = undefined
    resetSelectionDetails(copy)
  }

  const buildTransferDirPath = (copy: NetdiskDraft) => {
    const resource = sourceResource.value
    const category = categoryMap.value.get(Number(resource?.categoryId ?? currentData.value.categoryId))
    const channel = category ? channelMap.value.get(category.parentId) : undefined
    const title = String(resource?.title || currentData.value.title || copy.searchTitle || '').trim()
    if (!category || !channel || !title) return ''
    return [channel.name, category.name, title].join('/')
  }

  // 转存目标目录必须是账号下的绝对路径，以账号配置的手动转存目录为基准
  const buildTransferTargetDir = (copy: NetdiskDraft, relativeDir: string) => {
    const relative = relativeDir.trim().replace(/^\/+/, '')
    if (!relative) return ''
    const account = accounts.value.find((item) => Number(item.id) === Number(copy.accountId))
    const base = account?.ext?.manual?.transferDir?.trim().replace(/\/+$/, '') || ''
    if (!base) return ''
    return `${base}/${relative}`
  }

  const detectPlatform = (rawUrl: string) => {
    try {
      const host = new URL(rawUrl.trim()).hostname.toLowerCase()
      if (host === 'pan.baidu.com') return 'baidu'
      if (host === 'pan.quark.cn') return 'quark'
    } catch {
      return ''
    }
    return ''
  }

  const transferSourceKey = (copy: NetdiskDraft) =>
    copy.sourceMode === 'pansou'
      ? `pansou:${copy.searchToken}`
      : `direct:${copy.platform}:${copy.sourceUrl.trim()}:${copy.password.trim()}`

  const buildTransferSourceRequest = (copy: NetdiskDraft) =>
    copy.sourceMode === 'pansou'
      ? { token: copy.searchToken }
      : {
          platform: copy.platform,
          shareUrl: copy.sourceUrl.trim(),
          password: copy.password.trim()
        }

  const handleDirectSourceInput = (copy: NetdiskDraft) => {
    copy.platform = detectPlatform(copy.sourceUrl)
    resetConfirmedDetails(copy)
    copy.searchTitle = ''
  }

  const handleSourceModeChange = () => {
    const copy = sourceDraft.value
    resetConfirmedDetails(copy)
    copy.platform = ''
    copy.shareUrl = ''
    copy.sourceUrl = ''
    copy.password = ''
    copy.searchResults = []
    copy.searchPlatform = 'all'
    copy.searchToken = ''
    copy.searchTitle = ''
  }

  const handleExtractShareLink = async (copy: NetdiskDraft) => {
    const shareUrl = copy.sourceUrl.trim()
    if (!shareUrl) {
      ElMessage.warning('请输入分享链接')
      return
    }
    const platform = detectPlatform(shareUrl)
    if (!platform) {
      ElMessage.warning('仅支持百度网盘或夸克网盘分享链接')
      return
    }

    copy.sourceUrl = shareUrl
    copy.platform = platform
    resetConfirmedDetails(copy)
    copy.searchToken = ''
    const sourceKey = transferSourceKey(copy)
    copy.confirming = true
    copy.treeLoading = true
    try {
      const reply = await ListSearchFile({
        platform,
        shareUrl,
        password: copy.password.trim()
      })
      if (transferSourceKey(copy) !== sourceKey) return
      copy.searchTitle = reply.list?.[0]?.name || `${platformLabel(platform)}分享`
      copy.activeTreeNode = undefined
      copy.treeLoadingFsIds = []
      copy.transferTree = normalizeTransferTree(reply.list || [])
      copy.treeMeta = reply.shareMeta || ''
      copy.detailsConfirmed = true
      copy.confirmedToken = sourceKey
      resetSelectionDetails(copy)
      if (!copy.transferTree.length) {
        ElMessage.warning('分享内没有可转存的文件')
      } else {
        ElMessage.success('已提取文件列表，请选择需要转存的文件')
      }
    } catch {
      if (transferSourceKey(copy) === sourceKey) resetConfirmedDetails(copy)
    } finally {
      if (transferSourceKey(copy) === sourceKey) {
        copy.confirming = false
        copy.treeLoading = false
      }
    }
  }

  const handleSearchSources = async (copy: NetdiskDraft) => {
    const keyword =
      copy.searchKeyword.trim() || String(sourceResource.value?.title || currentData.value.title || '').trim()
    if (!keyword) {
      ElMessage.warning('请输入检索关键词')
      return
    }
    copy.searchKeyword = keyword
    copy.searching = true
    resetConfirmedDetails(copy)
    copy.accountId = undefined
    copy.searchToken = ''
    copy.searchTitle = ''
    copy.shareUrl = ''
    copy.sourceUrl = ''
    copy.password = ''
    copy.searchResults = []
    copy.searchPlatform = 'all'
    try {
      const reply = await QuickSearchResources({ keyword })
      copy.searchResults = reply.list || []
      if (!copy.searchResults.length) {
        ElMessage.warning('没有检索到可用资源，请更换关键词')
      }
    } catch {
      copy.searchResults = []
    } finally {
      copy.searching = false
    }
  }

  const handleSearchKeywordInput = (copy: NetdiskDraft) => {
    if (!copy.searchResults.length && !copy.searchToken && !copy.detailsConfirmed) return
    resetConfirmedDetails(copy)
    copy.accountId = undefined
    copy.searchResults = []
    copy.searchPlatform = 'all'
    copy.searchToken = ''
    copy.searchTitle = ''
    copy.shareUrl = ''
    copy.sourceUrl = ''
    copy.password = ''
  }

  const handlePickSearchResult = (copy: NetdiskDraft) => {
    const result = copy.searchResults.find((item) => item.token === copy.searchToken)
    resetConfirmedDetails(copy)
    copy.accountId = undefined
    if (!result) {
      copy.searchTitle = ''
      return
    }
    copy.platform = result.platform
    copy.searchTitle = result.title
    copy.shareUrl = ''
    copy.sourceUrl = ''
  }

  const handleSearchPlatformChange = () => {
    const copy = sourceDraft.value
    const selected = copy.searchResults.find((item) => item.token === copy.searchToken)
    if (!selected || copy.searchPlatform === 'all' || selected.platform === copy.searchPlatform) return
    copy.searchToken = ''
    copy.searchTitle = ''
    resetConfirmedDetails(copy)
  }

  const handleConfirmSearchResult = async (copy: NetdiskDraft) => {
    const token = copy.searchToken
    const result = copy.searchResults.find((item) => item.token === token)
    if (!token || !result) {
      ElMessage.warning('请先选择 Pansou 检索结果')
      return
    }

    copy.confirming = true
    copy.treeLoading = true
    try {
      const reply = await ListSearchFile({ token })
      if (copy.searchToken !== token) return
      copy.platform = result.platform
      copy.searchTitle = result.title
      copy.activeTreeNode = undefined
      copy.treeLoadingFsIds = []
      copy.transferTree = normalizeTransferTree(reply.list || [])
      copy.treeMeta = reply.shareMeta || ''
      copy.detailsConfirmed = true
      copy.confirmedToken = token
      resetSelectionDetails(copy)
      if (!copy.transferTree.length) {
        ElMessage.warning('分享内没有可转存的文件')
      } else {
        ElMessage.success('已加载文件列表，请选择需要转存的文件')
      }
    } catch {
      if (copy.searchToken === token) resetConfirmedDetails(copy)
    } finally {
      if (copy.searchToken === token) {
        copy.confirming = false
        copy.treeLoading = false
      }
    }
  }

  const handleTransferTreeExpand = async (copy: NetdiskDraft, item: TransferFileItem) => {
    if (!item?.isDir || item.isPlaceholder || !item.hasChildren) return
    const loadedChildren = item.children?.filter((child) => !child.isPlaceholder) || []
    if (loadedChildren.length || copy.treeLoadingFsIds.includes(item.fsId)) return

    const sourceKey = transferSourceKey(copy)
    copy.treeLoadingFsIds.push(item.fsId)
    try {
      const reply = await ListSearchFile({
        ...buildTransferSourceRequest(copy),
        shareMeta: copy.treeMeta || undefined,
        dirFsId: item.fsId,
        dirPath: item.path || undefined
      })
      if (transferSourceKey(copy) !== sourceKey) return
      const children = normalizeTransferTree(reply.list || [])
      transferTreeRefs.get(copy._key)?.updateKeyChildren(item.fsId, children)
      item.children = children
      item.hasChildren = children.length > 0
      if (reply.shareMeta) copy.treeMeta = reply.shareMeta
    } catch {
      if (transferSourceKey(copy) === sourceKey) {
        const retry = createTransferTreePlaceholder(item, '加载失败，请重新展开重试')
        transferTreeRefs.get(copy._key)?.updateKeyChildren(item.fsId, [retry])
        item.children = [retry]
        item.hasChildren = true
      }
    } finally {
      const index = copy.treeLoadingFsIds.indexOf(item.fsId)
      if (index >= 0) copy.treeLoadingFsIds.splice(index, 1)
    }
  }

  const handleTransferTreeNodeClick = (copy: NetdiskDraft, data: TransferFileItem) => {
    if (data.isPlaceholder) return
    copy.activeTreeNode = data
  }

  const handleTransferTreeCheck = (copy: NetdiskDraft, info: TransferTreeCheckInfo) => {
    resetSelectionDetails(copy)
    copy.checkedFsIds = info.checkedKeys.map(String)
  }

  const handleSummarizeSelection = async (copy: NetdiskDraft) => {
    if (!copy.checkedFsIds.length) {
      ElMessage.warning('请先勾选需要转存的文件或目录')
      return
    }
    const sourceKey = transferSourceKey(copy)
    const checked = [...copy.checkedFsIds]
    const checkedSignature = [...checked].sort().join('|')
    const selection = collectTransferSelection(copy)
    if (!selection.length) {
      ElMessage.warning('请先勾选需要转存的文件或目录')
      return
    }
    copy.selectionScanning = true
    try {
      const reply = await SummarizeSelection({
        ...buildTransferSourceRequest(copy),
        shareMeta: copy.treeMeta || undefined,
        fsIds: selection
      })
      if (transferSourceKey(copy) !== sourceKey || [...copy.checkedFsIds].sort().join('|') !== checkedSignature) {
        return
      }
      copy.selectedFsIds = selection
      copy.size = Number(reply.totalSize) || 0
      copy.fileCount = Number(reply.fileCount) || 0
      copy.formatSummary = reply.formatSummary || ''
      copy.selectionConfirmed = true
      copy.accountId = undefined
      copy.fsId = ''
      ElMessage.success('已扫描选中文件并回填信息')
    } catch {
      if (transferSourceKey(copy) === sourceKey) {
        resetSelectionDetails(copy)
        copy.checkedFsIds = checked
      }
    } finally {
      if (transferSourceKey(copy) === sourceKey) copy.selectionScanning = false
    }
  }

  const transferSourceToAccount = async (copy: NetdiskDraft): Promise<boolean> => {
    const accountId = Number(copy.accountId)
    if (!accountId) {
      ElMessage.warning('请选择转存账号')
      return false
    }
    const relativeDir = buildTransferDirPath(copy)
    if (!relativeDir) {
      ElMessage.warning('请先完成资源分类和标题后再转存')
      return false
    }
    const targetDir = buildTransferTargetDir(copy, relativeDir)
    if (!targetDir) {
      ElMessage.warning('所选账号未配置手动转存目录，请先在账号设置中配置')
      return false
    }
    copy.transferring = true
    try {
      const reply = await TransferSearchToAccount({
        accountId,
        token: copy.sourceMode === 'pansou' ? copy.searchToken : undefined,
        platform: copy.sourceMode === 'direct' ? copy.platform : undefined,
        shareUrl: copy.sourceMode === 'direct' ? copy.sourceUrl.trim() : undefined,
        password: copy.sourceMode === 'direct' ? copy.password.trim() : undefined,
        targetDir,
        items: copy.selectedFsIds.length ? collectTransferItems(copy) : undefined
      })
      if (!reply.shareUrl) {
        ElMessage.error('转存完成但未生成分享链接')
        return false
      }
      copy.platform = reply.platform
      copy.accountId = reply.accountId
      copy.shareUrl = reply.shareUrl
      copy.fsId = reply.fsId
      copy.size = Number(reply.size) || 0
      copy.fileCount = Number(reply.fileCount) || 0
      copy.files = (reply.files || []).map((file) => ({
        name: file.name,
        isDir: file.isDir,
        size: Number(file.size) || 0,
        children: []
      }))
      copy.status = 1
      copy.originalAccountId = Number(reply.accountId) || accountId
      copy.originalPlatform = reply.platform
      copy.originalShareUrl = reply.shareUrl
      return true
    } catch {
      // 错误提示由请求层统一处理
      return false
    } finally {
      copy.transferring = false
    }
  }

  const sourceNeedsTransfer = (copy: NetdiskDraft) =>
    !copy.fsId.trim() ||
    Number(copy.accountId) !== Number(copy.originalAccountId) ||
    copy.platform !== copy.originalPlatform ||
    copy.shareUrl.trim() !== copy.originalShareUrl.trim()

  const validateSourceDraft = () => {
    const copy = sourceDraft.value
    if (copy.sourceMode === 'pansou' && !copy.searchKeyword.trim()) {
      ElMessage.warning('请输入检索资源')
      return false
    }
    if (copy.sourceMode === 'direct') {
      if (!copy.sourceUrl.trim()) {
        ElMessage.warning('请输入分享链接')
        return false
      }
      if (!detectPlatform(copy.sourceUrl)) {
        ElMessage.warning('仅支持百度网盘或夸克网盘分享链接')
        return false
      }
    }
    if (!copy.platform) {
      ElMessage.warning('请选择网盘平台')
      return false
    }
    const duplicated = sourceList.value.find((item) => item.platform === copy.platform && item.id !== copy.id)
    if (duplicated) {
      ElMessage.warning('该资源已存在相同平台的来源')
      return false
    }
    if (
      sourceNeedsTransfer(copy) &&
      (!copy.detailsConfirmed || !copy.selectionConfirmed || !copy.selectedFsIds.length)
    ) {
      ElMessage.warning(copy.sourceMode === 'direct' ? '请先提取并确认需要转存的文件' : '请先选择并确认需要转存的文件')
      return false
    }
    if (!copy.accountId) {
      ElMessage.warning('请选择转存账号')
      return false
    }
    return true
  }

  const toNetdiskPayload = (copy: NetdiskDraft, resourceId: number): CreateNetdiskRequest => {
    const shareUrl = copy.shareUrl.trim()
    return {
      resourceId,
      platform: copy.platform,
      shareUrl,
      sourceUrl: copy.sourceUrl.trim() || shareUrl,
      userId: Number(copy.userId) || 0,
      accountId: Number(copy.accountId) || 0,
      fsId: copy.fsId.trim(),
      size: Number(copy.size) || 0,
      formatSummary: copy.formatSummary.trim(),
      fileCount: Number(copy.fileCount) || 0,
      files: copy.files
    }
  }

  const resetSourceDialog = () => {
    sourceLoadToken += 1
    sourceEditing.value = false
    sourceSaving.value = false
    sourceList.value = []
    sourceListLoading.value = false
    sourceResource.value = undefined
    sourceDraft.value = createNetdiskDraft()
    transferTreeRefs.clear()
  }

  const showSourceDialog = async (row: Resource) => {
    sourceResource.value = row
    sourceEditing.value = false
    sourceDraft.value = createNetdiskDraft()
    sourceDialogVisible.value = true
    await Promise.all([loadSourceList(row.id), loadTransferAccounts()])
  }

  const openSourceEditor = async (source?: Netdisk) => {
    sourceDraft.value = createNetdiskDraft(source)
    sourceDraft.value.searchKeyword = sourceResource.value?.title || ''
    transferTreeRefs.clear()
    sourceEditing.value = true
    if (!source?.id) return
    try {
      const { netdisk: detail } = await GetNetdisk({ id: source.id })
      sourceDraft.value = createNetdiskDraft(detail)
      sourceDraft.value.searchKeyword = sourceResource.value?.title || ''
      transferTreeRefs.clear()
    } catch {
      sourceEditing.value = false
      sourceDraft.value = createNetdiskDraft()
    }
  }

  const backToSourceList = () => {
    sourceEditing.value = false
    sourceDraft.value = createNetdiskDraft()
    transferTreeRefs.clear()
  }

  const saveSource = async () => {
    if (!validateSourceDraft()) return
    const resourceId = Number(sourceResource.value?.id)
    if (!resourceId) {
      ElMessage.warning('资源不存在，请刷新后重试')
      return
    }
    const copy = sourceDraft.value
    const wasEditing = !!copy.id
    sourceSaving.value = true
    try {
      if (sourceNeedsTransfer(copy) && !(await transferSourceToAccount(copy))) return
      const payload = toNetdiskPayload(copy, resourceId)
      if (copy.id) {
        await UpdateNetdisk({ id: copy.id, ...payload } as UpdateNetdiskRequest)
      } else {
        const reply = await CreateNetdisk(payload)
        copy.id = reply.id
        copy.originalStatus = 1
      }
      if (copy.originalStatus !== copy.status) {
        await UpdateNetdiskStatus({ id: copy.id, status: copy.status })
      }
      copy.originalStatus = copy.status
      ElMessage.success(wasEditing ? '来源保存成功' : '来源已转存并新增成功')
      sourceEditing.value = false
      sourceDraft.value = createNetdiskDraft()
      transferTreeRefs.clear()
      await loadSourceList(resourceId)
      refreshData()
    } catch {
      // 错误提示由请求层统一处理
    } finally {
      sourceSaving.value = false
    }
  }

  const handleDeleteSource = async (row: Netdisk) => {
    try {
      await ElMessageBox.confirm(`确定删除该${platformLabel(row.platform)}来源吗？`, '温馨提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }
    try {
      await DeleteNetdisk({ id: row.id })
      ElMessage.success('来源已删除')
      await loadSourceList()
      refreshData()
    } catch {
      return
    }
  }

  const handleSourceStatusChange = (row: Netdisk): (() => Promise<boolean>) => {
    return async () => {
      const next = row.status === 1 ? 0 : 1
      try {
        await UpdateNetdiskStatus({ id: row.id, status: next })
        row.status = next
        ElMessage.success(`来源已标记为${next === 1 ? '正常' : '失效'}`)
        refreshData()
        return true
      } catch {
        return false
      }
    }
  }

  const showDialog = (type: Form.DialogType, row?: Resource) => {
    dialogType.value = type
    submitting.value = false
    if (type === 'add') {
      currentData.value = {
        categoryId: categoryOptions.value[0]?.value,
        weight: 0,
        tagsArray: []
      }
    } else if (row) {
      currentData.value = {
        ...row,
        score: row.score ?? undefined,
        tagsArray: normalizeTags(row.tags)
      }
    }
    dialogVisible.value = true
  }

  const buildPayload = () => {
    const item = currentData.value
    const score = typeof item.score === 'number' && Number.isFinite(item.score) ? item.score : undefined
    return {
      title: String(item.title || '').trim(),
      summary: String(item.summary || '').trim(),
      description: String(item.description || ''),
      categoryId: Number(item.categoryId),
      tags: (item.tagsArray || []).slice(0, RESOURCE_TAGS_MAX),
      ...(score === undefined ? {} : { score }),
      cover: String(item.cover || '').trim(),
      weight: Number(item.weight) || 0
    }
  }

  const handleSubmit = async () => {
    try {
      await basicFormRef.value?.validate()
    } catch {
      return
    }
    const payload = buildPayload()
    submitting.value = true
    try {
      if (dialogType.value === 'add') {
        await CreateResource(payload as CreateResourceRequest)
        ElMessage.success('创建成功，请通过操作栏「资源来源」维护网盘来源')
        refreshCreate()
      } else {
        const resourceId = Number(currentData.value.id)
        await UpdateResource({ id: resourceId, ...payload } as UpdateResourceRequest)
        ElMessage.success('修改成功')
        refreshUpdate()
      }
      dialogVisible.value = false
    } finally {
      submitting.value = false
    }
  }

  const handleToggleStatus = (row: Resource): (() => Promise<boolean>) => {
    return async () => {
      const next = row.status === 1 ? 0 : 1
      try {
        await ElMessageBox.confirm(`确定${next === 1 ? '上架' : '下架'}「${row.title}」吗？`, '温馨提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await UpdateResourceStatus({ id: row.id, status: next })
        ElMessage.success('修改成功')
        refreshData()
        return true
      } catch {
        return false
      }
    }
  }

  const handleToggleBanner = async (row: Resource) => {
    const next = !row.isBanner
    await UpdateResourceBanner({ id: row.id, isBanner: next })
    ElMessage.success(next ? '已设为轮播' : '已取消轮播')
    refreshData()
  }

  const clampBannerFocus = (value: number) => Math.min(1, Math.max(0, value))

  const bannerFocusImageStyle = computed(() => ({
    objectPosition: `${bannerFocusX.value * 100}% ${bannerFocusY.value * 100}%`
  }))

  const showBannerFocus = (row: Resource) => {
    bannerFocusResource.value = row
    bannerFocusCover.value = row.cover ? rurl(row.cover) : ''
    bannerFocusX.value = clampBannerFocus(Number(row.bannerFocusX ?? 0.5))
    bannerFocusY.value = clampBannerFocus(Number(row.bannerFocusY ?? 0.5))
    bannerFocusVisible.value = true
  }

  const resetBannerFocusCenter = () => {
    bannerFocusX.value = 0.5
    bannerFocusY.value = 0.5
  }

  const resetBannerFocusDialog = () => {
    bannerFocusResource.value = undefined
    bannerFocusCover.value = ''
    bannerFocusX.value = 0.5
    bannerFocusY.value = 0.5
    bannerFocusDragging.value = false
    bannerFocusImageSize.value = { width: 0, height: 0 }
    bannerFocusDragStart = null
  }

  const handleBannerFocusImageLoad = (event: Event) => {
    const image = event.target as HTMLImageElement
    bannerFocusImageSize.value = {
      width: image.naturalWidth || image.clientWidth,
      height: image.naturalHeight || image.clientHeight
    }
  }

  const bannerFocusOverflow = () => {
    const stage = bannerFocusStageRef.value
    const image = bannerFocusImageSize.value
    if (!stage || !image.width || !image.height) return { x: 0, y: 0 }

    const rect = stage.getBoundingClientRect()
    const scale = Math.max(rect.width / image.width, rect.height / image.height)
    return {
      x: Math.max(image.width * scale - rect.width, 0),
      y: Math.max(image.height * scale - rect.height, 0)
    }
  }

  const handleBannerFocusPointerDown = (event: PointerEvent) => {
    if (!bannerFocusCover.value || (event.pointerType === 'mouse' && event.button !== 0)) return
    bannerFocusDragStart = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: bannerFocusX.value,
      y: bannerFocusY.value
    }
    bannerFocusDragging.value = true
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  const handleBannerFocusPointerMove = (event: PointerEvent) => {
    const start = bannerFocusDragStart
    if (!start || start.pointerId !== event.pointerId) return

    const overflow = bannerFocusOverflow()
    if (overflow.x > 0) {
      bannerFocusX.value = clampBannerFocus(start.x - (event.clientX - start.clientX) / overflow.x)
    }
    if (overflow.y > 0) {
      bannerFocusY.value = clampBannerFocus(start.y - (event.clientY - start.clientY) / overflow.y)
    }
  }

  const handleBannerFocusPointerUp = (event: PointerEvent) => {
    if (!bannerFocusDragStart || bannerFocusDragStart.pointerId !== event.pointerId) return
    bannerFocusDragStart = null
    bannerFocusDragging.value = false
  }

  const saveBannerFocus = async () => {
    const resource = bannerFocusResource.value
    if (!resource || bannerFocusSaving.value) return

    bannerFocusSaving.value = true
    try {
      await UpdateResourceBannerFocus({
        id: resource.id,
        x: Number(bannerFocusX.value.toFixed(4)),
        y: Number(bannerFocusY.value.toFixed(4))
      })
      ElMessage.success('轮播构图已保存')
      bannerFocusVisible.value = false
      refreshData()
    } finally {
      bannerFocusSaving.value = false
    }
  }

  onMounted(loadCategories)
</script>

<style scoped>
  .res-cover {
    width: 60px;
    height: 80px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  :deep(.resource-cover-upload .el-upload-list--picture-card) {
    display: flex;
    width: 100%;
  }

  .cover-picker {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  :global(.resource-cover-crop-dialog) {
    max-width: calc(100vw - 48px);
  }

  :global(.resource-banner-focus-dialog) {
    max-width: calc(100vw - 48px);
  }

  .banner-focus {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .banner-focus__stage {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: #0b0f14;
    border-radius: 10px;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 18%);
    cursor: grab;
    touch-action: none;
    user-select: none;
    aspect-ratio: 12 / 5;

    &.is-dragging {
      cursor: grabbing;
    }
  }

  .banner-focus__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }

  .banner-focus__grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(
        90deg,
        transparent 33.2%,
        rgb(255 255 255 / 22%) 33.2%,
        rgb(255 255 255 / 22%) 33.45%,
        transparent 33.45%,
        transparent 66.5%,
        rgb(255 255 255 / 22%) 66.5%,
        rgb(255 255 255 / 22%) 66.75%,
        transparent 66.75%
      ),
      linear-gradient(
        0deg,
        transparent 33.2%,
        rgb(255 255 255 / 22%) 33.2%,
        rgb(255 255 255 / 22%) 33.45%,
        transparent 33.45%,
        transparent 66.5%,
        rgb(255 255 255 / 22%) 66.5%,
        rgb(255 255 255 / 22%) 66.75%,
        transparent 66.75%
      );
  }

  .banner-focus__hint {
    position: absolute;
    bottom: 10px;
    left: 50%;
    padding: 4px 10px;
    color: #fff;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
    background: rgb(0 0 0 / 56%);
    border-radius: 999px;
    transform: translateX(-50%);
  }

  .banner-focus__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgb(255 255 255 / 56%);
    font-size: 13px;
  }

  .banner-focus__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .banner-focus__meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .banner-focus__ratio {
    color: var(--el-text-color-primary);
    font-size: 12px;
    font-weight: 500;
  }

  .banner-focus__position {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .cutter {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .cover-picker-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    align-items: center;
    color: var(--el-text-color-secondary);

    > div {
      display: flex;
      gap: 8px;
      align-items: center;
      color: var(--el-text-color-primary);
    }

    b {
      font-size: 15px;
    }

    span {
      font-size: 12px;
    }
  }

  .cover-picker-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    max-height: 500px;
    padding: 4px;
    overflow: auto;
  }

  .cover-option {
    position: relative;
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    background: var(--el-fill-color-light);
    border: 2px solid transparent;
    border-radius: 10px;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;

    img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 3 / 4;
      object-fit: cover;
    }

    &:hover {
      border-color: var(--el-color-primary-light-5);
    }

    &.is-selected {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 3px var(--el-color-primary-light-8);
    }
  }

  .cover-option-check {
    position: absolute;
    right: 8px;
    bottom: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: #fff;
    background: var(--el-color-primary);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .cover-option.is-selected .cover-option-check {
    opacity: 1;
  }

  :global(.resource-dialog) {
    display: flex;
    flex-direction: column;
    height: 650px;
    overflow: hidden;
  }

  :global(.resource-dialog .el-dialog__body) {
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: hidden;
  }

  :global(.resource-dialog .el-dialog__header),
  :global(.resource-dialog .el-dialog__footer) {
    flex-shrink: 0;
  }

  :global(.resource-source-dialog) {
    display: flex;
    flex-direction: column;
    max-width: calc(100vw - 64px);
    height: 700px;
    overflow: hidden;
  }

  :global(.resource-source-dialog .el-dialog__body) {
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: hidden;
  }

  :global(.resource-source-dialog .el-dialog__header),
  :global(.resource-source-dialog .el-dialog__footer) {
    flex-shrink: 0;
  }

  .resource-form-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
  }

  .resource-form-body :deep(.art-form) {
    flex: 1;
    min-width: 0;
  }

  .source-dialog-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    min-height: 0;
  }

  .source-list-toolbar {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
  }

  .source-list-toolbar b {
    font-size: 14px;
  }

  .source-list-toolbar small {
    display: block;
    color: var(--el-text-color-secondary);
  }

  .source-table-wrap {
    flex: 1;
    min-height: 0;
  }

  .source-link-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .source-link-cell span,
  .source-link-cell small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .source-link-cell small {
    color: var(--el-text-color-secondary);
  }

  .source-editor-toolbar {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
  }

  .source-editor-title {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .source-editor-title b {
    flex-shrink: 0;
    font-size: 14px;
  }

  .source-editor-title small {
    overflow: hidden;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .source-editor-scroll {
    flex: 1;
    min-height: 0;
    padding-right: 4px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .netdisk-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 12px;
  }

  .netdisk-grid .span-2 {
    grid-column: 1 / -1;
  }

  .netdisk-grid :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  .netdisk-grid :deep(.el-form-item__label) {
    width: auto !important;
    padding-right: 12px;
  }

  .source-search-row {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .source-search-row :deep(.el-input) {
    flex: 1;
  }

  .search-result-panel {
    box-sizing: border-box;
    width: 100%;
    padding: 10px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
  }

  .search-result-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .search-result-toolbar small {
    color: var(--el-text-color-secondary);
  }

  .search-result-toolbar span {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-color-primary);
  }

  .search-result-filter {
    flex-shrink: 0;
    width: 132px;
  }

  .search-result-list {
    box-sizing: border-box;
    max-height: 220px;
    padding: 4px;
    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
  }

  .search-result-empty {
    padding: 16px 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  .search-result-radio {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
  }

  .search-result-item {
    box-sizing: border-box;
    width: 100%;
    height: auto;
    padding: 6px 8px;
    margin-right: 0;
    border-radius: 4px;
  }

  .search-result-item:hover {
    background: var(--el-fill-color-light);
  }

  .search-result-item :deep(.el-radio__label) {
    display: block;
    flex: 1;
    min-width: 0;
  }

  .search-result-content {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .search-result-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .search-result-content small {
    max-width: 150px;
    overflow: hidden;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .search-result-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .transfer-tree-panel {
    box-sizing: border-box;
    width: 100%;
    padding: 10px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
  }

  .transfer-tree-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .transfer-tree-toolbar small {
    color: var(--el-text-color-secondary);
  }

  .transfer-tree-toolbar span {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-color-primary);
  }

  .transfer-tree {
    max-height: 280px;
    padding: 4px;
    overflow: auto;
    overscroll-behavior: contain;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
  }

  .transfer-tree :deep(.el-tree-node__content) {
    height: 30px;
  }

  .transfer-tree-node {
    display: flex;
    gap: 6px;
    align-items: center;
    width: 100%;
    min-width: 0;
  }

  .transfer-tree-node__name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .transfer-tree-node small {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
  }

  .transfer-tree-node.is-placeholder {
    color: var(--el-text-color-placeholder);
  }

  .tree-node-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 10px;
    margin-top: 8px;
    background: var(--el-fill-color-blank);
    border-radius: 4px;
  }

  .tree-node-info > div {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .tree-node-info small,
  .tree-node-info > span {
    color: var(--el-text-color-secondary);
    word-break: break-all;
  }

  .transfer-tree-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .source-detail-grid {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 4px 16px;
    width: 100%;
    padding: 8px 10px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .source-detail-item {
    display: flex;
    gap: 6px;
    align-items: baseline;
    min-width: 0;
  }

  .source-detail-title {
    grid-column: 1 / -1;
  }

  .source-detail-item span {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  .source-detail-item b {
    min-width: 0;
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .transfer-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .res-title {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .res-title b {
    overflow: hidden;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .res-title small {
    overflow: hidden;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .muted {
    color: var(--el-text-color-placeholder);
  }
</style>
