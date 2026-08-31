<template>
  <div class="qrcode">
    <QrcodeVue :value="data.value" v-bind="qrcodeConfig" />
  </div>
</template>

<script setup lang="ts">
  import { OAutherLogin } from '@/api/manager/authorize/api'
  import { OAutherHandleReply, OAutherLoginReply } from '@/api/manager/authorize/type'
  import { useAppStore } from '@/store/modules/app'
  import { rurl } from '@/utils/resource/url'
  import QrcodeVue from 'qrcode.vue'
  import type { Level, RenderAs } from 'qrcode.vue'

  const props = defineProps<{
    data: OAutherHandleReply
  }>()

  const value = ref('')

  const emits = defineEmits(['success', 'info', 'bind'])

  watch(
    () => props.data,
    () => {
      const url = decodeURI(props.data.value)
      value.value = url
    }
  )

  const appStore = useAppStore()

  // 二维码配置
  const qrcodeConfig = reactive({
    size: 180,
    level: 'H' as Level,
    renderAs: 'canvas' as RenderAs,
    margin: 0,
    background: '#ffffff',
    foreground: '#000000',
    imageSettings: {
      src: rurl(appStore.app.logo as string),
      width: 40,
      height: 40,
      excavate: true
    }
  })

  const timer = ref()
  const isActive = ref(false)

  const stopPolling = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = undefined
    }
  }

  const fetchOAuthLogin = async () => {
    if (!props.data.uuid || !isActive.value) return
    OAutherLogin({ uuid: props.data.uuid }, false).then((res: OAutherLoginReply) => {
      if (!isActive.value) return
      stopPolling()

      if (res.needBind) {
        emits('bind', props.data.uuid)
        return
      }

      if (res.needInfo) {
        emits('info', props.data.uuid)
        return
      }

      emits('success', res.token, {})
      ElMessage.success('登录成功')
    })
  }

  onMounted(() => {
    isActive.value = true
    timer.value = setInterval(() => {
      fetchOAuthLogin()
    }, 3000)
  })

  onBeforeUnmount(() => {
    isActive.value = false
    stopPolling()
  })
</script>

<style lang="scss">
  .qrcode {
    display: flex;
    justify-content: center;
  }
</style>
