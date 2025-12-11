<template>
  <div style="width: 100%">
    <ArtForm v-model="currentData" :items="formItems" :span="24" @cancel="emits('close')" @submit="submit"></ArtForm>
  </div>
</template>

<script setup lang="ts">
  import { CreateFeedback, ListFeedbackClassify } from '@/api/manager/feedback/api'
  import { CreateFeedbackRequest, FeedbackClassify } from '@/api/manager/feedback/type'
  import { useAppStore } from '@/store/modules/app'
  import { getSystemInfo } from '@/utils'

  const appStore = useAppStore()

  const currentData = ref<Partial<CreateFeedbackRequest>>({})

  const emits = defineEmits(['close'])

  const classifies = ref<FeedbackClassify[]>([])
  const getClassifies = async (name?: string) => {
    const data = await ListFeedbackClassify({ page: 1, pageSize: 10, name })
    classifies.value = data.list
  }
  getClassifies()

  const formItems = reactive([
    {
      key: 'classifyId',
      label: '问题分类',
      type: 'select',
      props: {
        placeholder: '请选择问题分类',
        clearable: true,
        filterable: true,
        remote: true,
        remoteMethod: (query: string) => {
          if (query.length >= 1) {
            getClassifies(query)
          } else {
            getClassifies()
          }
        },
        options: classifies,
        props: {
          label: 'name',
          value: 'id'
        },
        rules: [{ required: true, message: '请选择问题分类', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'title',
      label: '问题标题',
      type: 'input',
      props: {
        placeholder: '请输入问题标题',
        rules: [{ required: true, message: '请输入问题标题', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'content',
      label: '问题内容',
      type: 'input',
      props: {
        type: 'textarea',
        placeholder: '请输入问题内容',
        rules: [{ required: true, message: '请输入问题内容', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'imageUrls',
      label: '反馈图片',
      type: 'upload',
      props: {
        multiple: true,
        limit: 3,
        size: 80,
        placeholder: '请选择反馈图片',
        accept: 'image',
        directoryPath: 'manager/feedback'
      }
    },
    {
      key: 'contact',
      label: '联系电话',
      type: 'input',
      props: {
        placeholder: '请输入联系电话',
        rules: [
          { required: false, message: '请输入联系电话', trigger: ['blur', 'change'] },
          { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的联系电话' }
        ]
      }
    }
  ])

  const submit = async () => {
    // 获取设备信息
    const sys = await getSystemInfo()
    currentData.value.device = JSON.stringify({
      browserName: sys.browserName,
      browserVersion: sys.browserVersion,
      deviceType: sys.deviceType,
      platform: sys.platform,
      system: sys.system,
      screenHeight: sys.screenHeight,
      screenWidth: sys.screenWidth,
      orientation: sys.deviceOrientation,
      userAgent: sys.ua
    })

    currentData.value.appId = appStore.app.id as number
    currentData.value.platform = 'H5'
    currentData.value.version = import.meta.env.VITE_VERSION
    const data = { ...currentData.value } as CreateFeedbackRequest
    if (currentData.value.imageUrls) {
      data.images = JSON.stringify(currentData.value.imageUrls)
    }

    await CreateFeedback(data)
    ElMessage.success('反馈成功')
    emits('close')
  }
</script>
