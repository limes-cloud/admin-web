<template>
  <div style="width: 100%">
    <div class="header-box">
      <div class="close" @click="emit('close')">
        <ElIcon><Close /></ElIcon>
      </div>
      <div class="header-bg">
        <img class="header-bg-wave" src="@/assets/img/user/wave.gif" />
      </div>
      <div class="halo halo-1"></div>
      <div class="halo halo-2"></div>
      <div class="header">
        <div class="logo">
          <ArtUpload
            v-model="avatar"
            :size="85"
            :limit="1"
            :auto-upload="true"
            class="user-avatar-upload"
            directory-path="manager/avatar"
            @change="handleUploadAvatar"
          ></ArtUpload>
        </div>
        <div class="title">{{ userinfo.nickname }}</div>
      </div>
    </div>
    <div class="info">
      <div class="info-item">
        <div class="info-title">
          <ArtIcon value="iconsys-user"></ArtIcon>
          <span style="margin-left: 2px">用户账户</span>
        </div>
        <div class="info-desc">
          <span style="margin-right: 2px">{{ userinfo.username }}</span>
        </div>
      </div>

      <div class="info-item">
        <div class="info-title">
          <ArtIcon value="iconsys-fenxiao"></ArtIcon>
          <span style="margin-left: 2px">所属部门</span>
        </div>
        <div class="info-desc">
          <div v-for="(item, ind) in getUserDepts()" :key="ind" :style="{ marginTop: '5px' }">
            <ElTag :type="item.dept.main ? 'primary' : 'info'"> {{ item.dept.name }} | {{ item.job.name }} </ElTag>
          </div>
        </div>
      </div>
    </div>

    <div class="segmented">
      <el-segmented
        v-model="settingMode"
        :options="[
          { label: '基础设置', value: 'base' },
          { label: '安全设置', value: 'password' }
        ]"
        size="default"
      />
    </div>

    <div v-if="settingMode === 'base'" class="setting">
      <el-form :model="baseForm">
        <el-form-item label="用户昵称">
          <el-input v-model="baseForm.nickname" placeholder="请输入用户昵称" clearable maxlength="40" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleUpdateBaseInfo">保存</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="settingMode === 'password'" class="setting password-setting">
      <div class="title">登陆密码</div>
      <div class="desc">
        <span>支持数字、字母、字符。 </span>
        <span class="edit" @click="editPasswordVisible = true"
          ><ArtIcon value="iconsys-xiugai" :size="16"></ArtIcon
        ></span>
      </div>
    </div>

    <ElDialog
      v-model="editPasswordVisible"
      :destroy-on-close="true"
      body-class="edit-dialog"
      width="320px"
      align-center
    >
      <div class="form-box">
        <div class="title"> 修改密码</div>
        <ArtForm
          v-model="editPasswordData"
          :items="editPasswordFormItems"
          :span="24"
          @cancel="editPasswordVisible = false"
          @submit="handleUpdatePassword"
        ></ArtForm>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { UpdateCurrentUser, UpdateCurrentUserPassword } from '@/api/manager/user/api'
  import { UpdateCurrentUserPasswordRequest, User } from '@/api/manager/user/type'
  import { useUserStore } from '@/store/modules/user'
  import { Close } from '@element-plus/icons-vue'
  defineOptions({ name: 'UserCenter' })

  const settingMode = ref('base')
  const emit = defineEmits(['close'])

  const userStore = useUserStore()
  const userinfo = computed(() => userStore.getUserInfo)

  const baseForm = ref<{ nickname: string }>({ nickname: userinfo.value.nickname as string })

  const avatar = ref(userinfo.value.avatar)
  // 更新用户头像
  const handleUploadAvatar = async () => {
    await UpdateCurrentUser({ avatar: avatar.value as string })

    userStore.setUserInfo({ ...userinfo.value, avatar: avatar.value } as User)
    ElMessage.success('更换头像成功')
  }

  const handleUpdateBaseInfo = async () => {
    await UpdateCurrentUser({ ...baseForm.value })
    userStore.setUserInfo({ ...userinfo.value, ...baseForm.value } as User)
    ElMessage.success('更新资料成功')
  }

  const editPasswordData = ref<UpdateCurrentUserPasswordRequest>({} as UpdateCurrentUserPasswordRequest)
  const editPasswordVisible = ref(false)

  const editPasswordFormItems = computed(() => [
    {
      key: 'oldPassword',
      label: '旧密码',
      type: 'password',
      props: {
        placeholder: '请输入旧密码',
        rules: [{ required: true, message: '请输入旧密码', trigger: ['blur', 'change'] }]
      }
    },
    {
      key: 'password',
      label: '新密码',
      type: 'input',
      props: {
        type: 'password',
        placeholder: '请输入新密码',
        maxlength: 16,
        rules: [
          { required: true, message: '请输入新密码', trigger: ['blur', 'change'] },
          { type: 'string', message: '密码格式错误', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ },
          { type: 'string', message: '密码最少6位数', min: 6 }
        ]
      }
    },
    {
      key: 'rePassword',
      label: '确认密码',
      type: 'input',
      props: {
        type: 'password',
        placeholder: '请再次输入新密码',
        rules: [
          { required: true, message: '请再次输入新密码', trigger: ['blur', 'change'] },
          {
            validator: (rule: any, value: any) => value === editPasswordData.value.password,
            message: '两次输入密码不一致',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  ])

  const handleUpdatePassword = async () => {
    await UpdateCurrentUserPassword(editPasswordData.value)
    editPasswordVisible.value = false
    ElMessage.success('更新密码成功')
  }

  const getUserDepts = () => {
    return userinfo.value.userDepts?.sort((a, b) => (b.dept.main === a.dept.main ? 0 : b.dept.main ? 1 : -1))
  }
</script>

<style lang="scss" scoped>
  .form-box {
    .title {
      padding: 10px;
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: 500;
      text-align: center;
    }

    padding: 10px;
  }

  .setting {
    padding: 20px;
  }

  .password-setting {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    .desc {
      color: var(--el-color-info-light-3);
    }

    .edit {
      color: var(--el-color-primary);
      cursor: pointer;
    }
  }

  .segmented {
    padding: 0 20px;

    .el-segmented {
      --el-segmented-item-selected-color: var(--el-color-primary);
      --el-segmented-item-selected-bg-color: var(--el-bg-color);
    }
  }

  .user-avatar-upload {
    :deep(.el-upload-list__item) {
      background: none !important;
      border: none !important;
    }

    :deep(.el-icon) {
      font-size: 14px !important;
    }

    :deep(.el-upload-list__item-status-label) {
      display: none;
    }
  }

  .header-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: #576fe9;

    .close {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 100;
      color: #fff;
      cursor: pointer;
    }

    .halo {
      position: absolute;
      width: 390px;
      height: 390px;
      background: rgb(255 255 255 / 5%);
      border-radius: 50%;
    }

    .halo-1 {
      top: -200px;
      left: -180px;
    }

    .halo-2 {
      bottom: -200px;
      left: -180px;
    }

    .header-bg {
      position: absolute;
      bottom: -1px;
      left: 0;
      z-index: 10;
      width: 100%;
      height: 160px;
      mix-blend-mode: screen;

      .header-bg-wave {
        z-index: 1;
        width: 100%;
        height: 100%;
      }
    }

    .header {
      z-index: 999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .title {
        margin-top: 5px;
        font-size: 15px;
        font-weight: 500;
        color: var(--el-color-info-light-9);
      }
    }
  }

  .info {
    box-sizing: border-box;
    padding: 20px;

    .info-item {
      display: flex;
      flex-direction: row;
      align-items: start;
      justify-content: space-between;
      padding: 15px 0;
      border-bottom: 1px solid var(--el-color-info-light-9);

      .info-title,
      .info-desc {
        display: flex;
        align-items: center;
      }

      .info-desc {
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        color: var(--el-color-info-light-3);
      }
    }
  }
</style>
