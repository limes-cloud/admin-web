<template>
  <div class="art-full-height cuetom-table">
    <ElCard class="art-table-card" shadow="never">
      <!-- 搜索 + 新增 -->
      <div class="search-box">
        <ElInput v-model="keyword" placeholder="搜索目录" clearable />
        <div class="search-box__actions">
          <ElButton
            v-permission="'resource:directory:add'"
            type="primary"
            class="btn-square"
            :icon="Plus"
            @click="showDialog('add')"
          />
          <ElDropdown
            v-if="isManagerApp"
            trigger="click"
            :disabled="apps.length <= 1"
            @command="handleChangeApp"
          >
            <ElButton
              class="btn-square"
              :icon="Switch"
              :title="`当前应用：${currentAppName}，点击切换`"
            />
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem
                  v-for="item in apps"
                  :key="item.keyword"
                  :command="item.keyword"
                  :disabled="item.keyword === app"
                >
                  <div class="app-option">
                    <span class="app-option__name">{{ item.name }}</span>
                    <span class="app-option__key">{{ item.keyword }}</span>
                    <ElIcon v-if="item.keyword === app"><Check /></ElIcon>
                  </div>
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>
      </div>

      <!-- 目录树（按路径层级缩进） -->
      <ElScrollbar v-loading="loading" class="dir-tree">
        <ElEmpty v-if="!loading && !treeData.length" description="暂无目录" :image-size="54" />
        <ElTree
          v-else
          :data="treeData"
          node-key="id"
          :props="{ label: 'label', children: 'children' }"
          :expand-on-click-node="false"
          :default-expand-all="true"
          highlight-current
          :current-node-key="currentSelectId"
          @node-click="onNodeClick"
        >
          <template #default="{ data: node }">
            <div class="dir-node">
              <ElIcon class="dir-node__icon"><Folder /></ElIcon>
              <span class="dir-node__name" :title="node.raw.path">{{ node.label }}</span>
              <span class="dir-node__ops" @click.stop>
                <ArtOperation :single="true" :list="operationItems" :data="node.raw">
                  <i class="iconfont-sys">&#xe6df;</i>
                </ArtOperation>
              </span>
            </div>
          </template>
        </ElTree>
      </ElScrollbar>

      <!-- 新增/编辑 -->
      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增目录' : '编辑目录'"
        :destroy-on-close="true"
        body-class="art-form-dialog"
        width="460px"
        align-center
      >
        <ArtForm ref="formRef" v-model="currentData" :items="formItems" :span="24" label-width="auto" :show-submit="false" :show-cancel="false">
        </ArtForm>
        <template #footer>
          <div class="dir-footer">
            <ElButton @click="dialogVisible = false">取消</ElButton>
            <ElButton type="primary" @click="handleSubmit">确定</ElButton>
          </div>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>
<!-- __REST__ -->
<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { Plus, Edit, Delete, Folder, FolderAdd, Switch, Check } from '@element-plus/icons-vue'
  import { ListDirectory, CreateDirectory, UpdateDirectory, DeleteDirectory } from '@/api/resource/directory/api'
  import { CreateDirectoryRequest, DirectoryView, UpdateDirectoryRequest } from '@/api/resource/directory/type'
  import { App } from '@/api/manager/app/type'
  import { getAppKeyword } from '@/utils/app-context'

  defineOptions({ name: 'DirectoryPane' })

  const isManagerApp = getAppKeyword() === 'manager'
  const props = defineProps<{ app: string; apps: App[] }>()
  const emit = defineEmits<{ select: [row: DirectoryView]; 'change-app': [app: string] }>()

  const currentAppName = computed(() => props.apps.find((item) => item.keyword === props.app)?.name || props.app)
  const handleChangeApp = (app: string) => {
    if (!app || app === props.app) return
    emit('change-app', app)
  }

  const keyword = ref('')
  const currentSelectId = ref(0)
  // 新建子目录时的父路径（如 /hello/）；输入框只填子目录名，提交时自动拼接
  const parentPath = ref('')

  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentData = ref<Partial<DirectoryView>>({})
  const formRef = ref<{ validate: (...args: any[]) => Promise<any> }>()

  const formItems = computed(() => [
    {
      key: 'path',
      label: parentPath.value ? '子目录名' : '目录路径',
      type: 'input',
      tip: parentPath.value
        ? `将创建在 ${parentPath.value} 下，仅填子目录名（可含多级，如 a/b）`
        : '完整目录路径，如 /images/avatar；分段格式由服务端校验',
      props: {
        placeholder: parentPath.value ? `在 ${parentPath.value} 下，输入子目录名` : '完整路径，如 /images/avatar',
        maxlength: 660,
        rules: [{ required: true, message: parentPath.value ? '请输入子目录名' : '请输入目录路径', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'accept',
      label: '允许类型',
      type: 'input',
      hidden: dialogType.value === 'add',
      tip: '* 或逗号分隔的扩展名（如 png,jpg；留空 = 禁止所有类型）',
      props: { placeholder: '* 或逗号分隔的扩展名', maxlength: 255 }
    },
    {
      key: 'max_size',
      label: '文件上限',
      type: 'number',
      hidden: dialogType.value === 'add',
      tip: '单文件大小上限（MB）',
      props: { placeholder: '单文件大小上限（MB）', min: 1, style: { width: '100%' } }
    }
  ])

  const operationItems = [
    {
      icon: FolderAdd,
      label: '新建',
      color: 'primary',
      permission: 'resource:directory:add',
      click: (row: DirectoryView) => showDialog('add', undefined, row.path.replace(/\/+$/, '') + '/')
    },
    {
      icon: Edit,
      label: '编辑',
      color: 'warning',
      permission: 'resource:directory:update',
      click: (row: DirectoryView) => showDialog('edit', row)
    },
    {
      icon: Delete,
      popConfirm: true,
      label: '删除',
      color: 'danger',
      permission: 'resource:directory:delete',
      click: async (row: DirectoryView) => {
        await DeleteDirectory({ id: row.id }, props.app)
        ElMessage.success('删除成功')
        refreshRemove()
      }
    }
  ]

  const { data, loading, getData, refreshCreate, refreshUpdate, refreshRemove } = useTable({
    core: {
      apiFn: (params: Parameters<typeof ListDirectory>[0]) => ListDirectory(params, props.app),
      excludeParams: ['page', 'pageSize'],
      columnsFactory: () => [{ prop: 'keyword', label: '目录', useSlot: true, slotName: 'keyword' }]
    },
    hooks: {
      onSuccess: (list: any[]) => {
        if (list.length > 0) {
          const kept = list.find((d) => d.id === currentSelectId.value)
          const target = kept || list[0]
          currentSelectId.value = target.id
          emit('select', target)
        } else {
          currentSelectId.value = 0
          emit('select', {} as DirectoryView)
        }
      }
    }
  })

  // 客户端搜索过滤
  const rows = computed(() => {
    const kw = keyword.value.trim()
    if (!kw) return data.value
    return data.value.filter((d: any) => (d.name || '').includes(kw) || (d.path || '').includes(kw))
  })

  // 路径工具：末段名 / 父路径
  const lastSeg = (p: string) => {
    const s = (p || '').replace(/\/+$/, '')
    const i = s.lastIndexOf('/')
    return i >= 0 ? s.slice(i + 1) : s
  }
  const parentOf = (p: string) => {
    const s = (p || '').replace(/\/+$/, '')
    const i = s.lastIndexOf('/')
    return i > 0 ? s.slice(0, i) : ''
  }

  interface TreeNode {
    id: number
    label: string
    raw: DirectoryView
    children: TreeNode[]
  }

  // 由平铺路径构建层级树（父路径缺失则作根节点）
  const treeData = computed<TreeNode[]>(() => {
    const list = rows.value as DirectoryView[]
    const byPath: Record<string, TreeNode> = {}
    list.forEach((d) => {
      byPath[d.path] = { id: d.id, label: d.name || lastSeg(d.path), raw: d, children: [] }
    })
    const roots: TreeNode[] = []
    list.forEach((d) => {
      const node = byPath[d.path]
      const parent = byPath[parentOf(d.path)]
      if (parent) parent.children.push(node)
      else roots.push(node)
    })
    return roots
  })

  const onNodeClick = (node: any) => handleSelect(node.raw)

  const showDialog = (type: Form.DialogType, row?: DirectoryView, prefillPath?: string): void => {
    dialogType.value = type
    if (type === 'add') {
      parentPath.value = prefillPath || ''
      currentData.value = { accept: '*', path: '' }
    } else {
      parentPath.value = ''
      currentData.value = { ...row }
    }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleSubmit = async () => {
    try {
      const res = await formRef.value?.validate()
      if (!res) return
      const value = currentData.value
      if (dialogType.value === 'add') {
        // 子目录：父路径 + 用户输入段；顶层：直接用用户输入的完整路径
        const seg = (value.path || '').trim().replace(/^\/+/, '')
        const fullPath = parentPath.value ? parentPath.value + seg : value.path
        await CreateDirectory({ path: fullPath } as CreateDirectoryRequest, props.app)
        ElMessage.success('创建成功')
        refreshCreate()
      } else {
        await UpdateDirectory(
          {
            id: value.id,
            path: value.path,
            accept: value.accept,
            max_size: value.max_size
          } as UpdateDirectoryRequest,
          props.app
        )
        ElMessage.success('修改成功')
        refreshUpdate()
      }
      dialogVisible.value = false
    } catch {
      // 校验失败：保持弹窗
    }
  }

  const handleSelect = (row: DirectoryView) => {
    if (row.id === currentSelectId.value) return
    currentSelectId.value = row.id
    emit('select', row)
  }

  watch(
    () => props.app,
    () => {
      keyword.value = ''
      currentSelectId.value = 0
      getData()
    }
  )
</script>

<style lang="scss" scoped>
  .search-box {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    &__actions {
      display: flex;
      flex: 0 0 auto;
      gap: 6px;
      margin-left: 6px;
    }
  }

  .app-option {
    display: flex;
    min-width: 190px;
    align-items: center;
    gap: 10px;

    &__name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__key {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .dir-tree {
    flex: 1;
    min-height: 0;
  }

  .dir-tree :deep(.el-tree-node__content) {
    height: 36px;
  }

  .dir-node {
    display: flex;
    flex: 1;
    min-width: 0;
    align-items: center;
    gap: 6px;

    &__icon {
      flex: 0 0 auto;
      font-size: 16px;
    }

    &__name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      font-size: 14px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__ops {
      flex: 0 0 auto;
      opacity: 0;
    }
  }

  .dir-tree :deep(.el-tree-node__content:hover) .dir-node__ops {
    opacity: 1;
  }

  .dir-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
