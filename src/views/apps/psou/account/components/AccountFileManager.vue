<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useClipboard } from '@vueuse/core'
  import {
    ArrowLeft,
    ArrowRight,
    Close,
    CopyDocument,
    Delete,
    Download,
    EditPen,
    Folder,
    FolderAdd,
    FolderOpened,
    Link,
    Rank,
    Refresh,
    Share,
    Upload,
    View
  } from '@element-plus/icons-vue'

  import {
    CreateAccountDir,
    DeleteAccountFile,
    DownloadAccountFile,
    ListAccountFile,
    MoveAccountFile,
    QuickTransferAccountFile,
    RenameAccountFile,
    ShareAccountFile,
    UnzipAccountFile,
    UploadAccountFile
  } from '@/api/psou/account/api'
  import type { Account, AccountFileItem, ShareAccountFileReply } from '@/api/psou/account/type'
  import type { OperationItem } from '@/components/core/forms/art-operation/index.vue'
  import { getFileSize } from '@/utils/file'
  import { formatTime } from '@/utils/time'

  defineOptions({ name: 'PsouAccountFileManager' })

  interface Crumb {
    name: string
    ref: string
  }

  type PreviewKind = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'none'
  type UTF8Status = 'valid' | 'truncated' | 'invalid'
  type ShareMode = 'command' | 'plain'

  interface DecodedText {
    text: string
    encoding: string
  }

  const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif', 'ico'])
  const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'ogv', 'mov', 'm4v'])
  const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'])
  const ARCHIVE_EXTENSIONS = new Set(['zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2', 'tbz2', 'xz', 'txz', 'zipx'])
  const TEXT_EXTENSIONS = new Set([
    'txt',
    'md',
    'markdown',
    'json',
    'xml',
    'yaml',
    'yml',
    'toml',
    'ini',
    'conf',
    'log',
    'csv',
    'tsv',
    'srt',
    'ass',
    'go',
    'js',
    'ts',
    'jsx',
    'tsx',
    'vue',
    'py',
    'java',
    'c',
    'h',
    'cpp',
    'cs',
    'php',
    'rb',
    'rs',
    'sh',
    'bash',
    'zsh',
    'html',
    'htm',
    'css',
    'scss',
    'less',
    'sql',
    'env'
  ])
  const TEXT_PREVIEW_BYTES = 512 * 1024
  const TEXT_PREVIEW_MAX_CHARS = 200000
  const BAIDU_COMMAND_WORD_RE = /^[\u3400-\u4DBF\u4E00-\u9FFF]+$/

  const props = defineProps<{
    modelValue: boolean
    account?: Account
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
  }>()

  const MAX_UPLOAD_BYTES = 100 * 1024 * 1024
  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })
  const platformLabel = computed(() => {
    if (props.account?.platform === 'baidu') return '百度网盘'
    if (props.account?.platform === 'quark') return '夸克网盘'
    return props.account?.platform || '网盘'
  })
  const canUnzip = computed(() => props.account?.status === 1)
  const unzipDestination = computed(() => props.account?.ext?.unzipDir?.trim() || '/psou/unzip')
  const rootDirRef = computed(() => (props.account?.platform === 'baidu' ? '/' : ''))
  const crumbs = ref<Crumb[]>([])
  const currentDirRef = computed(() => crumbs.value[crumbs.value.length - 1]?.ref ?? rootDirRef.value)
  const rows = ref<AccountFileItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(100)
  const hasMore = computed(() => page.value * pageSize.value < total.value)
  const loading = ref(false)
  const uploading = ref(false)
  const uploadPercent = ref(0)
  const uploadFileName = ref('')
  const downloadingId = ref('')
  const unzippingId = ref('')
  const movingId = ref('')
  const fileInputRef = ref<HTMLInputElement | null>(null)
  const previewVisible = ref(false)
  const previewLoading = ref(false)
  const previewKind = ref<PreviewKind>('none')
  const previewURL = ref('')
  const previewText = ref('')
  const previewNote = ref('')
  const previewMessage = ref('')
  const previewTitle = ref('')
  const previewRow = ref<AccountFileItem | null>(null)
  const quickTransferVisible = ref(false)
  const quickTransferSubmitting = ref(false)
  const quickTransferShareUrl = ref('')
  const quickTransferPassword = ref('')
  const quickTransferTargetCrumbs = ref<Crumb[]>([])
  const shareVisible = ref(false)
  const shareSubmitting = ref(false)
  const shareRow = ref<AccountFileItem | null>(null)
  const shareMode = ref<ShareMode>('plain')
  const shareTitle = ref('')
  const shareCommandWord = ref('')
  const sharePasscode = ref('')
  const sharePeriod = ref<'0' | '1' | '7' | '30'>('0')
  const shareResult = ref<ShareAccountFileReply | null>(null)
  const dirPickerVisible = ref(false)
  const dirPickerLoading = ref(false)
  const dirPickerCrumbs = ref<Crumb[]>([])
  const dirPickerRows = ref<AccountFileItem[]>([])
  const dirPickerMode = ref<'quickTransfer' | 'move'>('quickTransfer')
  const moveSubmitting = ref(false)
  const moveRow = ref<AccountFileItem | null>(null)
  const { copy } = useClipboard()
  let previewGeneration = 0

  const quickTransferTargetRef = computed(
    () => quickTransferTargetCrumbs.value[quickTransferTargetCrumbs.value.length - 1]?.ref ?? rootDirRef.value
  )
  const quickTransferTargetLabel = computed(() => directoryLabel(quickTransferTargetCrumbs.value))
  const dirPickerCurrentRef = computed(
    () => dirPickerCrumbs.value[dirPickerCrumbs.value.length - 1]?.ref ?? rootDirRef.value
  )
  const dirPickerCurrentLabel = computed(() => directoryLabel(dirPickerCrumbs.value))
  const shareSupportsCommand = computed(() => props.account?.platform === 'baidu')
  const shareUsesPasscode = computed(() => props.account?.platform === 'quark')
  const shareLinkURL = computed(() => {
    const raw = shareResult.value?.shareUrl?.trim() || ''
    const suffixIndex = raw.lastIndexOf('&&')
    if (suffixIndex > -1 && raw.endsWith('@')) return raw.slice(0, suffixIndex)
    return raw
  })
  const shareCommandText = computed(() => {
    if (shareMode.value !== 'command' || !shareSupportsCommand.value) return ''
    const result = shareResult.value
    if (!result) return ''
    return result.commandWord?.trim() || ''
  })
  const sharePasscodeText = computed(() => {
    const result = shareResult.value
    if (!result) return ''
    return result.password?.trim() || ''
  })

  function close() {
    previewVisible.value = false
    cancelPreviewLoad()
    visible.value = false
  }

  function resetState() {
    crumbs.value = [{ name: '根目录', ref: rootDirRef.value }]
    rows.value = []
    total.value = 0
    page.value = 1
    pageSize.value = 100
    previewVisible.value = false
    quickTransferVisible.value = false
    quickTransferSubmitting.value = false
    quickTransferShareUrl.value = ''
    quickTransferPassword.value = ''
    quickTransferTargetCrumbs.value = []
    shareVisible.value = false
    shareSubmitting.value = false
    shareRow.value = null
    resetShareForm()
    dirPickerVisible.value = false
    dirPickerLoading.value = false
    dirPickerCrumbs.value = []
    dirPickerRows.value = []
    dirPickerMode.value = 'quickTransfer'
    moveSubmitting.value = false
    moveRow.value = null
    movingId.value = ''
    cancelPreviewLoad()
  }

  function directoryLabel(items: Crumb[]) {
    const names = items
      .slice(1)
      .map((item) => item.name.trim())
      .filter(Boolean)
    return names.length ? names.join(' / ') : '根目录'
  }

  function directoryPath(items: Crumb[]) {
    const names = items
      .slice(1)
      .map((item) => item.name.trim())
      .filter(Boolean)
    return `/${names.join('/')}`
  }

  function openQuickTransfer() {
    if (!props.account) return
    quickTransferShareUrl.value = ''
    quickTransferPassword.value = ''
    quickTransferTargetCrumbs.value = crumbs.value.map((item) => ({ ...item }))
    quickTransferVisible.value = true
  }

  function resetShareForm() {
    shareMode.value = shareSupportsCommand.value ? 'command' : 'plain'
    shareTitle.value = ''
    shareCommandWord.value = ''
    sharePasscode.value = ''
    sharePeriod.value = '0'
    shareResult.value = null
  }

  function openShare(row: AccountFileItem) {
    if (!props.account || shareSubmitting.value) return
    resetShareForm()
    shareRow.value = row
    shareTitle.value = row.name
    shareVisible.value = true
  }

  function validateShareForm(): boolean {
    if (shareMode.value === 'command') {
      if (!shareSupportsCommand.value) {
        ElMessage.warning('当前平台暂不支持口令模式')
        return false
      }
      const commandWord = shareCommandWord.value.trim()
      if (!commandWord) {
        ElMessage.warning('请输入中文口令')
        return false
      }
      const length = Array.from(commandWord).length
      if (length < 4 || length > 10 || !BAIDU_COMMAND_WORD_RE.test(commandWord)) {
        ElMessage.warning('中文口令需为 4-10 个汉字')
        return false
      }
    }
    const passcode = sharePasscode.value.trim()
    if (shareUsesPasscode.value && passcode) {
      const length = Array.from(passcode).length
      if (length < 3 || length > 5) {
        ElMessage.warning('夸克提取码必须为 3-5 个字符')
        return false
      }
      if (/\s/.test(passcode)) {
        ElMessage.warning('夸克提取码不能包含空格')
        return false
      }
    }
    if (shareMode.value === 'command' && passcode && !/^[A-Za-z0-9]{4}$/.test(passcode)) {
      ElMessage.warning('百度提取码必须为 4 位字母或数字')
      return false
    }
    return true
  }

  async function submitShare() {
    if (!props.account || !shareRow.value || shareSubmitting.value || !validateShareForm()) return
    const row = shareRow.value
    shareSubmitting.value = true
    try {
      shareResult.value = await ShareAccountFile({
        accountId: props.account.id,
        files: [{ fsId: row.fsId, path: row.path }],
        title: shareTitle.value.trim() || row.name,
        periodDays: Number(sharePeriod.value) as 0 | 1 | 7 | 30,
        password:
          shareUsesPasscode.value || shareMode.value === 'command'
            ? sharePasscode.value.trim() || undefined
            : undefined,
        commandWord:
          shareMode.value === 'command' && shareSupportsCommand.value ? shareCommandWord.value.trim() : undefined
      })
      ElMessage.success('分享创建成功')
    } catch {
      // 请求层已提示错误
    } finally {
      shareSubmitting.value = false
    }
  }

  async function copyShareURL() {
    const shareURL = shareLinkURL.value
    if (!shareURL) return
    await copy(shareURL)
    ElMessage.success('分享链接已复制')
  }

  async function copyShareCommand() {
    const command = shareCommandText.value
    if (!command) return
    await copy(command)
    ElMessage.success('口令已复制')
  }

  async function copySharePasscode() {
    const passcode = sharePasscodeText.value
    if (!passcode) return
    await copy(passcode)
    ElMessage.success('提取码已复制')
  }

  function detectSharePlatform(rawUrl: string): 'baidu' | 'quark' | '' {
    try {
      const host = new URL(rawUrl.trim()).hostname.toLowerCase()
      if (host === 'pan.baidu.com') return 'baidu'
      if (host === 'pan.quark.cn') return 'quark'
    } catch {
      return ''
    }
    return ''
  }

  async function submitQuickTransfer() {
    if (!props.account || quickTransferSubmitting.value) return
    const shareUrl = quickTransferShareUrl.value.trim()
    if (!shareUrl) {
      ElMessage.warning('请输入分享链接')
      return
    }
    const platform = detectSharePlatform(shareUrl)
    if (!platform) {
      ElMessage.warning('仅支持百度网盘或夸克网盘分享链接')
      return
    }
    if (platform !== props.account.platform) {
      ElMessage.warning('分享链接与当前账号平台不一致')
      return
    }
    quickTransferSubmitting.value = true
    try {
      const reply = await QuickTransferAccountFile({
        accountId: props.account.id,
        dirRef: quickTransferTargetRef.value,
        shareUrl,
        password: quickTransferPassword.value.trim()
      })
      const fileCount = Number(reply.fileCount) || 0
      ElMessage.success(fileCount > 0 ? `已转存 ${fileCount} 个文件` : '转存成功')
      quickTransferVisible.value = false
      await loadFiles()
    } catch {
      // 请求层已提示错误
    } finally {
      quickTransferSubmitting.value = false
    }
  }

  async function openDirPicker() {
    if (!props.account) return
    dirPickerMode.value = 'quickTransfer'
    moveRow.value = null
    dirPickerCrumbs.value = quickTransferTargetCrumbs.value.map((item) => ({ ...item }))
    if (!dirPickerCrumbs.value.length) {
      dirPickerCrumbs.value = [{ name: '根目录', ref: rootDirRef.value }]
    }
    dirPickerRows.value = []
    dirPickerVisible.value = true
    await loadDirPicker()
  }

  async function loadDirPicker() {
    if (!props.account) return
    dirPickerLoading.value = true
    try {
      const reply = await ListAccountFile({
        accountId: props.account.id,
        dirRef: dirPickerCurrentRef.value,
        page: 1,
        pageSize: 200
      })
      dirPickerRows.value = (Array.isArray(reply.list) ? reply.list : []).filter((item) => item.isDir)
    } catch {
      dirPickerRows.value = []
    } finally {
      dirPickerLoading.value = false
    }
  }

  function enterDirPicker(row: AccountFileItem) {
    if (!row.isDir) return
    const nextRef = props.account?.platform === 'baidu' ? row.path : row.fsId
    if (!nextRef) return
    dirPickerCrumbs.value = [...dirPickerCrumbs.value, { name: row.name, ref: nextRef }]
    void loadDirPicker()
  }

  function goDirPickerCrumb(index: number) {
    if (index < 0 || index >= dirPickerCrumbs.value.length - 1 || dirPickerLoading.value) return
    dirPickerCrumbs.value = dirPickerCrumbs.value.slice(0, index + 1)
    void loadDirPicker()
  }

  function confirmDirPicker() {
    if (dirPickerMode.value === 'move') {
      void submitMove()
      return
    }
    quickTransferTargetCrumbs.value = dirPickerCrumbs.value.map((item) => ({ ...item }))
    dirPickerVisible.value = false
  }

  function openMoveDirPicker(row: AccountFileItem) {
    if (!props.account || row.isDir || movingId.value) return
    dirPickerMode.value = 'move'
    moveRow.value = row
    dirPickerCrumbs.value = crumbs.value.map((item) => ({ ...item }))
    dirPickerRows.value = []
    dirPickerVisible.value = true
    void loadDirPicker()
  }

  async function submitMove() {
    if (!props.account || !moveRow.value || moveSubmitting.value) return
    const row = moveRow.value
    const targetPath = directoryPath(dirPickerCrumbs.value)
    if (targetPath === '/') {
      ElMessage.warning('请选择根目录以外的目标目录')
      return
    }
    if (targetPath === directoryPath(crumbs.value)) {
      ElMessage.warning('文件已在该目录')
      return
    }
    moveSubmitting.value = true
    movingId.value = row.fsId
    try {
      await MoveAccountFile({
        accountId: props.account.id,
        targetPath,
        files: [
          {
            newPath: `${targetPath}/${row.name}`,
            fsId: row.fsId
          }
        ]
      })
      ElMessage.success('移动成功')
      dirPickerVisible.value = false
      moveRow.value = null
      await loadFiles()
    } catch {
      // 请求层已提示错误
    } finally {
      moveSubmitting.value = false
      movingId.value = ''
    }
  }

  async function loadFiles() {
    if (!props.account) return
    loading.value = true
    try {
      const reply = await ListAccountFile({
        accountId: props.account.id,
        dirRef: currentDirRef.value,
        page: page.value,
        pageSize: pageSize.value
      })
      rows.value = Array.isArray(reply.list) ? reply.list : []
      total.value = Number(reply.total) || 0
    } catch {
      rows.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  function start() {
    resetState()
    void loadFiles()
  }

  function changePage(next: number) {
    if (loading.value || next < 1) return
    page.value = next
    void loadFiles()
  }

  function changePageSize() {
    page.value = 1
    void loadFiles()
  }

  function enterDir(row: AccountFileItem) {
    if (!row.isDir) return
    const nextRef = props.account?.platform === 'baidu' ? row.path : row.fsId
    if (!nextRef) return
    crumbs.value = [...crumbs.value, { name: row.name, ref: nextRef }]
    page.value = 1
    void loadFiles()
  }

  function goCrumb(index: number) {
    if (index < 0 || index >= crumbs.value.length - 1 || loading.value) return
    crumbs.value = crumbs.value.slice(0, index + 1)
    page.value = 1
    void loadFiles()
  }

  function isValidName(value: string): true | string {
    const name = value.trim()
    if (!name) return '名称不能为空'
    if (name === '.' || name === '..') return '名称不合法'
    if (/[/\\]/.test(name)) return '名称不能包含 / 或 \\'
    if (Array.from(name).length > 255) return '名称不能超过255个字符'
    return true
  }

  async function createDir() {
    if (!props.account) return
    let result: { value: string }
    try {
      result = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
        confirmButtonText: '创建',
        cancelButtonText: '取消',
        inputPlaceholder: '例如：我的资源',
        inputValidator: isValidName
      })
    } catch {
      return
    }
    try {
      await CreateAccountDir({
        accountId: props.account.id,
        dirRef: currentDirRef.value,
        name: result.value.trim()
      })
      ElMessage.success('文件夹已创建')
      await loadFiles()
    } catch {
      // 请求层已提示错误
    }
  }

  async function renameEntry(row: AccountFileItem) {
    if (!props.account) return
    let result: { value: string }
    try {
      result = await ElMessageBox.prompt('请输入新名称（文件需保留扩展名）', '重命名', {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        inputValue: row.name,
        inputValidator: isValidName
      })
    } catch {
      return
    }
    const name = result.value.trim()
    if (name === row.name) return
    try {
      await RenameAccountFile({
        accountId: props.account.id,
        file: {
          fsId: row.fsId,
          dirRef: currentDirRef.value,
          path: row.path,
          name
        }
      })
      ElMessage.success('重命名成功')
      await loadFiles()
    } catch {
      // 请求层已提示错误
    }
  }

  async function removeEntry(row: AccountFileItem) {
    if (!props.account) return
    try {
      await ElMessageBox.confirm(
        row.isDir ? `确定删除文件夹“${row.name}”及其全部内容吗？` : `确定删除文件“${row.name}”吗？`,
        '删除确认',
        { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
      )
    } catch {
      return
    }
    try {
      await DeleteAccountFile({
        accountId: props.account.id,
        fsId: row.fsId,
        dirRef: currentDirRef.value,
        path: row.path
      })
      ElMessage.success('已删除')
      if (rows.value.length === 1 && page.value > 1) {
        page.value -= 1
      }
      await loadFiles()
    } catch {
      // 请求层已提示错误
    }
  }

  async function downloadEntry(row: AccountFileItem) {
    if (!props.account || row.isDir || downloadingId.value) return
    downloadingId.value = row.fsId
    try {
      const { blob, filename } = await DownloadAccountFile({
        accountId: props.account.id,
        fsId: row.fsId,
        path: row.path,
        name: row.name
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      ElMessage.success('下载已开始')
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '下载失败')
    } finally {
      downloadingId.value = ''
    }
  }

  function isArchiveFile(row: AccountFileItem) {
    return !row.isDir && ARCHIVE_EXTENSIONS.has(previewExtension(row.name))
  }

  async function unzipEntry(row: AccountFileItem) {
    if (!props.account || !canUnzip.value || !isArchiveFile(row) || unzippingId.value) return
    try {
      await ElMessageBox.confirm(`确定将“${row.name}”解压到“${unzipDestination.value}”吗？`, '在线解压', {
        type: 'info',
        confirmButtonText: '开始解压',
        cancelButtonText: '取消'
      })
    } catch {
      return
    }
    unzippingId.value = row.fsId
    try {
      const reply = await UnzipAccountFile({
        accountId: props.account.id,
        fsId: row.fsId,
        dirRef: currentDirRef.value,
        path: row.path,
        name: row.name,
        outputPath: props.account?.ext?.unzipDir?.trim() || undefined
      })
      ElMessage.success(reply.outputPath ? `解压完成：${reply.outputPath}` : '解压完成')
      await loadFiles()
    } catch {
      // 请求层已提示错误
    } finally {
      unzippingId.value = ''
    }
  }

  function previewExtension(name: string) {
    const index = name.lastIndexOf('.')
    return index >= 0 ? name.slice(index + 1).toLowerCase() : ''
  }

  function detectPreviewKind(type: string, name: string): PreviewKind {
    const mime = type.toLowerCase().split(';')[0].trim()
    const ext = previewExtension(name)
    if (mime.startsWith('image/') || IMAGE_EXTENSIONS.has(ext)) return 'image'
    if (mime.startsWith('video/') || VIDEO_EXTENSIONS.has(ext)) return 'video'
    if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(ext)) return 'audio'
    if (mime === 'application/pdf' || ext === 'pdf') return 'pdf'
    if (mime.startsWith('text/') || mime.includes('json') || mime.includes('xml') || TEXT_EXTENSIONS.has(ext)) {
      return 'text'
    }
    return 'none'
  }

  function isPreviewAllowed(name: string) {
    const ext = previewExtension(name)
    return IMAGE_EXTENSIONS.has(ext) || ext === 'txt'
  }

  function releasePreviewAsset() {
    if (previewURL.value) URL.revokeObjectURL(previewURL.value)
    previewURL.value = ''
    previewText.value = ''
    previewNote.value = ''
    previewMessage.value = ''
    previewKind.value = 'none'
    previewRow.value = null
    previewTitle.value = ''
  }

  function cancelPreviewLoad() {
    previewGeneration += 1
    previewLoading.value = false
  }

  function handlePreviewClosed() {
    if (!previewVisible.value) releasePreviewAsset()
  }

  function contentRangeTotal(contentRange: string) {
    const match = /bytes\s+\d+-\d+\/(\d+)/i.exec(contentRange)
    return match ? Number(match[1]) : null
  }

  function utf8Status(bytes: Uint8Array): UTF8Status {
    let index = 0
    while (index < bytes.length) {
      const first = bytes[index]
      if (first <= 0x7f) {
        index += 1
        continue
      }
      let continuationCount = 0
      if (first >= 0xc2 && first <= 0xdf) continuationCount = 1
      else if (first >= 0xe0 && first <= 0xef) continuationCount = 2
      else if (first >= 0xf0 && first <= 0xf4) continuationCount = 3
      else return 'invalid'
      if (index + continuationCount >= bytes.length) return 'truncated'
      for (let offset = 1; offset <= continuationCount; offset += 1) {
        if ((bytes[index + offset] & 0xc0) !== 0x80) return 'invalid'
      }
      index += continuationCount + 1
    }
    return 'valid'
  }

  function tryDecodeText(bytes: Uint8Array, encoding: string, trimTail: number) {
    const end = Math.max(0, bytes.length - trimTail)
    try {
      return new TextDecoder(encoding, { fatal: true }).decode(bytes.subarray(0, end))
    } catch {
      return null
    }
  }

  function decodeTextPayload(buffer: ArrayBuffer, allowTrim: boolean): DecodedText {
    const bytes = new Uint8Array(buffer)
    if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
      return { text: new TextDecoder('utf-8').decode(bytes.subarray(3)), encoding: 'utf-8' }
    }
    if (bytes[0] === 0xff && bytes[1] === 0xfe) {
      return { text: new TextDecoder('utf-16le').decode(bytes.subarray(2)), encoding: 'utf-16le' }
    }
    if (bytes[0] === 0xfe && bytes[1] === 0xff) {
      return { text: new TextDecoder('utf-16be').decode(bytes.subarray(2)), encoding: 'utf-16be' }
    }

    const status = utf8Status(bytes)
    if (status !== 'invalid') {
      const maxTrim = status === 'truncated' ? 3 : 0
      for (let trim = 0; trim <= maxTrim; trim += 1) {
        const text = tryDecodeText(bytes, 'utf-8', trim)
        if (text !== null) return { text, encoding: 'utf-8' }
      }
    }

    const maxTrim = allowTrim ? 3 : 0
    for (let trim = 0; trim <= maxTrim; trim += 1) {
      const text = tryDecodeText(bytes, 'gb18030', trim)
      if (text !== null) return { text, encoding: 'gb18030' }
    }
    return { text: new TextDecoder('gb18030').decode(bytes), encoding: 'gb18030' }
  }

  function textPreviewNote(contentRange: string, byteLength: number, textLength: number, encoding: string) {
    const notes: string[] = []
    if (encoding !== 'utf-8') notes.push(`已按 ${encoding.toUpperCase()} 编码解码`)
    const total = contentRangeTotal(contentRange)
    if ((total !== null && total > byteLength) || textLength >= TEXT_PREVIEW_MAX_CHARS) {
      notes.push('文件较大，仅展示前 512KB 内容，完整内容请下载查看。')
    }
    return notes.join('；')
  }

  async function openPreview(row: AccountFileItem) {
    if (!props.account || row.isDir) return
    if (!isPreviewAllowed(row.name)) {
      ElMessage.warning('该文件类型不允许查看')
      return
    }
    releasePreviewAsset()
    previewRow.value = row
    previewTitle.value = row.name
    previewMessage.value = ''
    previewVisible.value = true
    previewLoading.value = true
    const generation = ++previewGeneration
    const textHint = detectPreviewKind('', row.name) === 'text'
    try {
      const { blob, contentRange } = await DownloadAccountFile({
        accountId: props.account.id,
        fsId: row.fsId,
        path: row.path,
        name: row.name,
        range: textHint ? `bytes=0-${TEXT_PREVIEW_BYTES - 1}` : undefined
      })
      if (generation !== previewGeneration) return
      const kind = detectPreviewKind(blob.type, row.name)
      previewKind.value = kind
      if (kind === 'text') {
        const buffer = await blob.arrayBuffer()
        if (generation !== previewGeneration) return
        const total = contentRangeTotal(contentRange)
        const decoded = decodeTextPayload(buffer, total !== null && total > blob.size)
        previewText.value = decoded.text.slice(0, TEXT_PREVIEW_MAX_CHARS)
        previewNote.value = textPreviewNote(contentRange, blob.size, decoded.text.length, decoded.encoding)
      } else if (kind !== 'none') {
        previewURL.value = URL.createObjectURL(blob)
      } else {
        previewMessage.value = '该文件类型暂不支持在线查看，请下载后打开。'
      }
    } catch (error) {
      if (generation !== previewGeneration) return
      previewKind.value = 'none'
      previewMessage.value = '文件内容加载失败，请稍后重试或下载查看。'
      ElMessage.error(error instanceof Error ? error.message : '文件查看失败')
    } finally {
      if (generation === previewGeneration) previewLoading.value = false
    }
  }

  function pickFiles() {
    if (uploading.value) return
    fileInputRef.value?.click()
  }

  async function handleFilesPicked(event: Event) {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files || [])
    input.value = ''
    if (!props.account || !files.length) return

    for (const file of files) {
      if (file.size <= 0) {
        ElMessage.warning(`${file.name} 是空文件，已跳过`)
        continue
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        ElMessage.warning(`${file.name} 超过100MB，已跳过`)
        continue
      }
      const form = new FormData()
      form.append('accountId', String(props.account.id))
      form.append('dirRef', currentDirRef.value)
      form.append('file', file)
      uploading.value = true
      uploadPercent.value = 0
      uploadFileName.value = file.name
      try {
        await UploadAccountFile(form, (percent) => {
          uploadPercent.value = percent
        })
        ElMessage.success(`${file.name} 上传成功`)
      } catch {
        // 请求层已提示错误
      } finally {
        uploading.value = false
        uploadPercent.value = 0
        uploadFileName.value = ''
      }
    }
    await loadFiles()
  }

  function sizeText(row: AccountFileItem) {
    if (row.isDir) return '-'
    return getFileSize(Number(row.size) || 0) || '0B'
  }

  function fileOperationItems(row: AccountFileItem): OperationItem[] {
    const items: OperationItem[] = []
    if (!row.isDir) {
      items.push(
        {
          icon: View,
          label: '查看',
          color: 'primary',
          click: (record: AccountFileItem) => openPreview(record)
        },
        {
          icon: Download,
          label: downloadingId.value === row.fsId ? '下载中...' : '下载',
          color: 'primary',
          disabled: Boolean(downloadingId.value),
          click: (record: AccountFileItem) => downloadEntry(record)
        }
      )
    }
    if (canUnzip.value && isArchiveFile(row)) {
      items.push({
        icon: FolderOpened,
        label: unzippingId.value === row.fsId ? '解压中...' : '解压',
        color: 'success',
        disabled: Boolean(unzippingId.value),
        click: (record: AccountFileItem) => unzipEntry(record)
      })
    }
    items.push({
      icon: Share,
      label: '创建分享',
      color: 'success',
      click: (record: AccountFileItem) => openShare(record)
    })
    items.push({
      icon: EditPen,
      label: '重命名',
      color: 'warning',
      click: (record: AccountFileItem) => renameEntry(record)
    })
    if (!row.isDir) {
      items.push({
        icon: Rank,
        label: movingId.value === row.fsId ? '移动中...' : '移动',
        color: 'primary',
        disabled: Boolean(movingId.value),
        click: (record: AccountFileItem) => openMoveDirPicker(record)
      })
    }
    items.push({
      icon: Delete,
      label: '删除',
      color: 'danger',
      click: (record: AccountFileItem) => removeEntry(record)
    })
    return items
  }

  watch(
    () => props.modelValue,
    (value) => {
      if (value) start()
    }
  )

  watch(
    () => props.account?.id,
    () => {
      if (props.modelValue) start()
    }
  )
</script>

<template>
  <ElDrawer v-model="visible" class="account-file-drawer" size="78%" :with-header="false" :destroy-on-close="false">
    <div class="fm">
      <header class="fm-head">
        <div class="fm-head__identity">
          <div class="fm-head__title">
            <h2>{{ account?.name || '账号' }} · 文件管理</h2>
            <ElTag size="small" effect="plain">{{ platformLabel }}</ElTag>
          </div>
          <p>直接操作真实网盘目录，上传与下载均由服务端代理。</p>
        </div>
        <ElButton text :icon="Close" @click="close" />
      </header>

      <div class="fm-toolbar">
        <ElBreadcrumb separator="/">
          <ElBreadcrumbItem v-for="(crumb, index) in crumbs" :key="`${crumb.ref}-${index}`">
            <button
              type="button"
              class="fm-crumb"
              :class="{ 'is-current': index === crumbs.length - 1 }"
              @click="goCrumb(index)"
            >
              {{ crumb.name }}
            </button>
          </ElBreadcrumbItem>
        </ElBreadcrumb>

        <ElSpace wrap>
          <ElTooltip content="刷新" placement="top">
            <ElButton :icon="Refresh" :loading="loading" aria-label="刷新" @click="loadFiles" />
          </ElTooltip>
          <ElTooltip content="新建文件夹" placement="top">
            <ElButton :icon="FolderAdd" aria-label="新建文件夹" @click="createDir" />
          </ElTooltip>
          <ElTooltip content="快速转存" placement="top">
            <ElButton :icon="Link" aria-label="快速转存" @click="openQuickTransfer" />
          </ElTooltip>
          <ElTooltip content="上传文件" placement="top">
            <ElButton type="primary" :icon="Upload" :loading="uploading" aria-label="上传文件" @click="pickFiles" />
          </ElTooltip>
          <input ref="fileInputRef" class="fm-file-input" type="file" multiple @change="handleFilesPicked" />
        </ElSpace>
      </div>

      <div v-if="uploading" class="fm-upload-state">
        <span>正在上传：{{ uploadFileName }}</span>
        <ElProgress :percentage="uploadPercent" :stroke-width="6" />
      </div>

      <div class="fm-table-wrap">
        <ElTable
          v-loading="loading"
          :data="rows"
          row-key="fsId"
          height="100%"
          table-layout="auto"
          class="fm-table"
          :empty-text="loading ? '加载中...' : '当前目录为空'"
        >
          <ElTableColumn label="名称" min-width="300">
            <template #default="{ row }">
              <button type="button" class="fm-name" :class="{ 'is-dir': row.isDir }" @click="enterDir(row)">
                <ElIcon v-if="row.isDir" :size="18"><Folder /></ElIcon>
                <span v-else class="fm-file-icon"><ArtFileType :file="row.name" /></span>
                <span :title="row.name">{{ row.name }}</span>
              </button>
            </template>
          </ElTableColumn>
          <ElTableColumn label="大小" width="120">
            <template #default="{ row }">{{ sizeText(row) }}</template>
          </ElTableColumn>
          <ElTableColumn label="修改时间" width="190">
            <template #default="{ row }">
              {{ row.updatedAt ? formatTime(Number(row.updatedAt)) : '-' }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="110" class-name="fm-actions-column" fixed="right">
            <template #default="{ row }">
              <ArtOperation :list="fileOperationItems(row)" :data="row" />
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <footer class="fm-footer">
        <span class="fm-summary">
          {{ total > 0 ? `共 ${total} 项` : `本页 ${rows.length} 项` }}
        </span>
        <ElSpace>
          <ElSelect v-model="pageSize" size="small" class="fm-page-size" @change="changePageSize">
            <ElOption :value="50" label="50 条/页" />
            <ElOption :value="100" label="100 条/页" />
            <ElOption :value="200" label="200 条/页" />
          </ElSelect>
          <ElButton size="small" :icon="ArrowLeft" :disabled="page <= 1 || loading" @click="changePage(page - 1)">
            上一页
          </ElButton>
          <span class="fm-page-index">第 {{ page }} 页</span>
          <ElButton size="small" :disabled="!hasMore || loading" @click="changePage(page + 1)">
            下一页<ElIcon class="fm-next-icon"><ArrowRight /></ElIcon>
          </ElButton>
        </ElSpace>
      </footer>
    </div>
  </ElDrawer>

  <ElDialog
    v-model="previewVisible"
    class="fm-preview-dialog"
    :title="previewTitle || '文件查看'"
    width="min(960px, 88vw)"
    top="5vh"
    append-to-body
    destroy-on-close
    @close="cancelPreviewLoad"
    @closed="handlePreviewClosed"
  >
    <div v-loading="previewLoading" class="fm-preview">
      <img
        v-if="previewKind === 'image' && previewURL"
        class="fm-preview__image"
        :src="previewURL"
        :alt="previewTitle"
      />
      <video v-else-if="previewKind === 'video' && previewURL" class="fm-preview__video" :src="previewURL" controls />
      <audio v-else-if="previewKind === 'audio' && previewURL" class="fm-preview__audio" :src="previewURL" controls />
      <iframe
        v-else-if="previewKind === 'pdf' && previewURL"
        class="fm-preview__pdf"
        :src="previewURL"
        :title="previewTitle"
      />
      <div v-else-if="previewKind === 'text'" class="fm-preview__text">
        <ElAlert v-if="previewNote" :title="previewNote" type="info" :closable="false" show-icon />
        <pre>{{ previewText }}</pre>
      </div>
      <ElEmpty
        v-else-if="!previewLoading"
        :description="previewMessage || '该文件类型暂不支持在线查看，请下载后打开。'"
        :image-size="90"
      />
    </div>
    <template #footer>
      <ElButton @click="previewVisible = false">关闭</ElButton>
      <ElButton
        type="primary"
        :icon="Download"
        :loading="Boolean(previewRow && downloadingId === previewRow.fsId)"
        :disabled="!previewRow || Boolean(downloadingId)"
        @click="previewRow && downloadEntry(previewRow)"
      >
        下载文件
      </ElButton>
    </template>
  </ElDialog>

  <ElDialog
    v-model="quickTransferVisible"
    title="快速转存"
    width="min(640px, 92vw)"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <ElForm label-width="84px" class="fm-quick-form">
      <ElFormItem label="分享链接" required>
        <ElInput
          v-model="quickTransferShareUrl"
          clearable
          placeholder="粘贴百度网盘或夸克网盘分享链接"
          :disabled="quickTransferSubmitting"
        />
        <div class="fm-quick-tip">支持链接内自带提取码；整包转存到所选目录。</div>
      </ElFormItem>
      <ElFormItem label="提取码">
        <ElInput
          v-model="quickTransferPassword"
          clearable
          maxlength="64"
          placeholder="链接未包含提取码时填写"
          :disabled="quickTransferSubmitting"
        />
      </ElFormItem>
      <ElFormItem label="目标目录" required>
        <div class="fm-dir-field">
          <ElInput :model-value="quickTransferTargetLabel" readonly />
          <ElButton :disabled="quickTransferSubmitting" @click="openDirPicker">选择目录</ElButton>
        </div>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton :disabled="quickTransferSubmitting" @click="quickTransferVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="quickTransferSubmitting" @click="submitQuickTransfer">开始转存</ElButton>
    </template>
  </ElDialog>

  <ElDialog
    v-model="shareVisible"
    :title="shareResult ? '分享已创建' : '创建分享'"
    width="min(620px, 92vw)"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <ElForm v-if="!shareResult" label-width="92px" class="fm-quick-form">
      <ElFormItem label="文件">
        <ElInput :model-value="shareRow?.name || ''" readonly />
      </ElFormItem>
      <ElFormItem v-if="shareSupportsCommand" label="分享模式" required>
        <div class="fm-share-mode">
          <ElRadioGroup v-model="shareMode" :disabled="shareSubmitting">
            <ElRadioButton value="command">口令模式</ElRadioButton>
            <ElRadioButton value="plain">普通链接</ElRadioButton>
          </ElRadioGroup>
          <div class="fm-quick-tip">支持自定义中文口令；创建后会在分享文本末尾追加 &&口令@。</div>
        </div>
      </ElFormItem>
      <ElFormItem v-else label="分享方式">
        <ElInput model-value="普通链接" readonly />
        <div class="fm-quick-tip">当前平台不支持口令分享。夸克可选设置提取码。</div>
      </ElFormItem>
      <ElFormItem v-if="shareMode === 'command' && shareSupportsCommand" label="中文口令" required>
        <ElInput
          v-model="shareCommandWord"
          clearable
          maxlength="10"
          show-word-limit
          placeholder="请输入 4-10 个汉字"
          :disabled="shareSubmitting"
        />
        <div class="fm-quick-tip">支持；创建后会在分享文本末尾追加 &&口令@。</div>
      </ElFormItem>
      <ElFormItem label="分享标题">
        <ElInput v-model="shareTitle" maxlength="255" clearable :disabled="shareSubmitting" />
      </ElFormItem>
      <ElFormItem label="有效期">
        <ElSelect v-model="sharePeriod" :disabled="shareSubmitting">
          <ElOption value="0" label="永久有效" />
          <ElOption value="1" label="1 天" />
          <ElOption value="7" label="7 天" />
          <ElOption value="30" label="30 天" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem v-if="shareUsesPasscode" label="提取码">
        <ElInput
          v-model="sharePasscode"
          clearable
          maxlength="5"
          show-word-limit
          placeholder="可选，3-5 个字符"
          :disabled="shareSubmitting"
        />
        <div class="fm-quick-tip">可选，支持中文；留空则创建公开链接。</div>
      </ElFormItem>
      <ElFormItem v-else-if="shareMode === 'command'" label="提取码">
        <ElInput
          v-model="sharePasscode"
          clearable
          maxlength="4"
          placeholder="留空则由平台生成或不设置"
          :disabled="shareSubmitting"
        />
        <div class="fm-quick-tip">可选，百度为 4 位字母或数字；留空则由平台生成。</div>
      </ElFormItem>
    </ElForm>

    <div v-else class="fm-share-result">
      <ElAlert title="分享创建成功" type="success" :closable="false" show-icon />
      <ElForm label-width="92px" class="fm-quick-form">
        <ElFormItem label="分享链接">
          <div class="fm-share-link">
            <ElInput :model-value="shareLinkURL" readonly />
            <ElButton :icon="CopyDocument" @click="copyShareURL">复制链接</ElButton>
          </div>
        </ElFormItem>
        <ElFormItem v-if="shareCommandText" label="口令">
          <div class="fm-share-link">
            <ElInput :model-value="shareCommandText" readonly />
            <ElButton :icon="CopyDocument" @click="copyShareCommand">复制口令</ElButton>
          </div>
        </ElFormItem>
        <ElFormItem v-if="sharePasscodeText" label="提取码">
          <div class="fm-share-link">
            <ElInput :model-value="sharePasscodeText" readonly />
            <ElButton :icon="CopyDocument" @click="copySharePasscode">复制提取码</ElButton>
          </div>
        </ElFormItem>
      </ElForm>
    </div>

    <template #footer>
      <template v-if="shareResult">
        <ElButton @click="shareVisible = false">关闭</ElButton>
      </template>
      <template v-else>
        <ElButton :disabled="shareSubmitting" @click="shareVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="shareSubmitting" @click="submitShare">创建分享</ElButton>
      </template>
    </template>
  </ElDialog>

  <ElDialog
    v-model="dirPickerVisible"
    :title="dirPickerMode === 'move' ? '移动文件到目录' : '选择目标目录'"
    width="min(620px, 92vw)"
    append-to-body
    destroy-on-close
  >
    <div class="fm-dir-picker">
      <ElBreadcrumb separator="/">
        <ElBreadcrumbItem v-for="(crumb, index) in dirPickerCrumbs" :key="`${crumb.ref}-${index}`">
          <button
            type="button"
            class="fm-crumb"
            :class="{ 'is-current': index === dirPickerCrumbs.length - 1 }"
            @click="goDirPickerCrumb(index)"
          >
            {{ crumb.name }}
          </button>
        </ElBreadcrumbItem>
      </ElBreadcrumb>
      <div v-loading="dirPickerLoading" class="fm-dir-list">
        <button
          v-for="row in dirPickerRows"
          :key="row.fsId"
          type="button"
          class="fm-dir-item"
          @click="enterDirPicker(row)"
        >
          <ElIcon :size="18"><Folder /></ElIcon>
          <span :title="row.name">{{ row.name }}</span>
          <ElIcon class="fm-dir-item__arrow"><ArrowRight /></ElIcon>
        </button>
        <ElEmpty
          v-if="!dirPickerLoading && !dirPickerRows.length"
          description="当前目录没有子文件夹"
          :image-size="72"
        />
      </div>
    </div>
    <template #footer>
      <div class="fm-dir-picker__footer">
        <span>当前目录：{{ dirPickerCurrentLabel }}</span>
        <ElSpace>
          <ElButton @click="dirPickerVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="dirPickerMode === 'move' && moveSubmitting" @click="confirmDirPicker">
            {{ dirPickerMode === 'move' ? '移动到此目录' : '选择此目录' }}
          </ElButton>
        </ElSpace>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
  :global(.account-file-drawer .el-drawer__body) {
    padding: 0;
  }

  .fm {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: var(--art-main-bg-color);
  }

  .fm-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 18px 22px 14px;
    border-bottom: 1px solid var(--art-border-color);
  }

  .fm-head__title {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .fm-head__title h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
  }

  .fm-head__identity p {
    margin: 6px 0 0;
    font-size: 12px;
    color: var(--art-text-gray-600);
  }

  .fm-toolbar {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 22px;
    border-bottom: 1px solid var(--art-border-color);

    /* 与操作列图标按钮保持一致：32×32 正方形 */
    :deep(.el-button) {
      width: 32px;
      height: 32px;
      padding: 8px;
    }
  }

  .fm-crumb {
    padding: 0;
    font-size: 13px;
    color: var(--art-text-gray-600);
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  .fm-crumb:hover,
  .fm-crumb.is-current {
    color: var(--el-color-primary);
  }

  .fm-crumb.is-current {
    font-weight: 600;
    cursor: default;
  }

  .fm-file-input {
    display: none;
  }

  .fm-upload-state {
    display: grid;
    grid-template-columns: minmax(180px, 280px) 1fr;
    gap: 16px;
    align-items: center;
    padding: 10px 22px;
    font-size: 12px;
    color: var(--art-text-gray-600);
    background: rgba(var(--el-color-primary-rgb), 0.06);
    border-bottom: 1px solid var(--art-border-color);
  }

  .fm-quick-tip {
    width: 100%;
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--art-text-gray-600);
  }

  .fm-share-mode {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .fm-share-result {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .fm-share-link {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  .fm-dir-field {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  .fm-dir-picker {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .fm-dir-list {
    min-height: 260px;
    max-height: 52vh;
    padding: 6px;
    overflow: auto;
    border: 1px solid var(--art-border-color);
    border-radius: 8px;
  }

  .fm-dir-item {
    display: flex;
    gap: 9px;
    align-items: center;
    width: 100%;
    padding: 11px 12px;
    font-size: 13px;
    color: var(--art-text-gray-900);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 6px;
  }

  .fm-dir-item:hover {
    color: var(--el-color-primary);
    background: var(--art-fill-color-light);
  }

  .fm-dir-item span {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fm-dir-item__arrow {
    color: var(--art-text-gray-500);
  }

  .fm-dir-picker__footer {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .fm-dir-picker__footer > span {
    min-width: 0;
    overflow: hidden;
    font-size: 12px;
    color: var(--art-text-gray-600);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fm-table-wrap {
    flex: 1;
    min-height: 0;
    padding: 12px 22px 0;
  }

  .fm-table {
    width: 100%;
  }

  .fm-table :deep(.fm-actions-column .cell) {
    white-space: nowrap;
  }

  .fm-name {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    max-width: 100%;
    padding: 0;
    font-size: 13px;
    color: var(--art-text-gray-900);
    cursor: default;
    background: transparent;
    border: 0;
  }

  .fm-name.is-dir {
    color: var(--el-color-primary);
    cursor: pointer;
  }

  .fm-name span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fm-file-icon {
    display: inline-flex;
    flex: 0 0 20px;
    width: 20px;
    height: 20px;
  }

  .fm-file-icon :deep(img) {
    object-fit: contain;
  }

  .fm-footer {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 22px 16px;
  }

  .fm-summary,
  .fm-page-index {
    font-size: 12px;
    color: var(--art-text-gray-600);
  }

  .fm-page-size {
    width: 108px;
  }

  .fm-next-icon {
    margin-left: 4px;
  }

  :global(.fm-preview-dialog .el-dialog__body) {
    padding: 6px 22px 0;
  }

  .fm-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    max-height: 70vh;
  }

  .fm-preview__image,
  .fm-preview__video {
    display: block;
    max-width: 100%;
    max-height: 68vh;
    object-fit: contain;
  }

  .fm-preview__video {
    width: 100%;
    background: #000;
  }

  .fm-preview__audio {
    width: min(640px, 100%);
  }

  .fm-preview__pdf {
    width: 100%;
    height: 68vh;
    border: 0;
  }

  .fm-preview__text {
    align-self: stretch;
    width: 100%;
    overflow: auto;
  }

  .fm-preview__text :deep(.el-alert) {
    margin-bottom: 12px;
  }

  .fm-preview__text pre {
    box-sizing: border-box;
    min-height: 260px;
    padding: 16px;
    margin: 0;
    overflow: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    line-height: 1.65;
    color: var(--art-text-gray-900);
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    background: var(--art-fill-color-light);
    border: 1px solid var(--art-border-color);
    border-radius: 8px;
  }
</style>
