<template>
	<div class="container">
		<div class="logo">
			<img alt="logo" style="width: 100px" :src="$logo" />
			<!-- <div class="logo-text">{{ appStore.title }}</div>   -->
		</div>
		<div class="content">
			<div class="content-inner">
				<div class="login-form-wrapper">
					<div class="login-form-title">{{ appStore.title }}</div>
					<div class="login-form-sub-title">{{ appStore.desc }}</div>
					<div class="login-form-error-msg">{{ errorMessage }}</div>
					<a-form :model="loginForm" class="login-form" layout="vertical" @submit="handleSubmit">
						<a-form-item field="username" :rules="[{ required: true, message: '账户不能为空' }]" :validate-trigger="['change', 'blur']" hide-label>
							<a-input v-model="loginForm.username" size="large" placeholder="请输入账户">
								<template #prefix><icon-user /></template>
							</a-input>
						</a-form-item>
						<a-form-item field="password" :rules="[{ required: true, message: '密码不能为空' }]" :validate-trigger="['change', 'blur']" hide-label>
							<a-input-password v-model="loginForm.password" size="large" placeholder="请输入密码" allow-clear autocomplete>
								<template #prefix>
									<icon-lock />
								</template>
							</a-input-password>
						</a-form-item>
						<a-form-item field="captcha" :rules="[{ required: true, message: '验证码不能为空' }]" :validate-trigger="['change', 'blur']" hide-label>
							<a-input v-model="loginForm.captcha" size="large" placeholder="请输入验证码" allow-clear autocomplete>
								<template #prefix>
									<icon-lock />
								</template>
								<template #append>
									<img v-if="captchaBase64" width="100" height="34" :src="captchaBase64" @click="fetchCaptcha()" />
								</template>
							</a-input>
						</a-form-item>
						<a-space :size="16" direction="vertical">
							<div class="login-form-password-actions">
								<a-checkbox checked="rememberPassword" :model-value="loginConfig.rememberPassword" @change="setRememberPassword as any">记住密码</a-checkbox>
							</div>
							<a-button size="large" type="primary" html-type="submit" long :loading="loading">确认登录</a-button>
						</a-space>
					</a-form>
				</div>
			</div>

			<div class="footer">
				<Footer />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import Footer from '@/components/footer/index.vue';
import { ref, reactive, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
import { useStorage } from '@vueuse/core';
import { useUserStore, useAppStore } from '@/store';
import useLoading from '@/hooks/loading';
import { GetUserLoginCaptcha } from '@/api/manager/user/api';
import { UserLoginRequest } from '@/api/manager/user/type';
// import logo from '@/assets/logo.png';

const timeInter: any = ref(null);
const router = useRouter();
const errorMessage = ref('');

const { loading, setLoading } = useLoading();
const userStore = useUserStore();
const appStore = useAppStore();
const loginConfig = useStorage('login-config', {
	rememberPassword: true,
	username: '',
	password: ''
});

onUnmounted(() => {
	clearInterval(timeInter.value);
	timeInter.value = null;
});

const captchaBase64 = ref('');

const loginForm = reactive<UserLoginRequest>({
	username: loginConfig.value.username,
	password: loginConfig.value.password,
	captcha: '',
	captchaId: ''
});

const fetchCaptcha = async () => {
	// 清除定时器
	clearInterval(timeInter.value);
	// 请求验证码
	const { data } = await GetUserLoginCaptcha();
	loginForm.captchaId = data.uuid;
	captchaBase64.value = data.captcha;
	// 定时刷新
	timeInter.value = setInterval(() => {
		fetchCaptcha();
	}, data.expire * 1000);
};

fetchCaptcha();

const handleSubmit = async ({ errors, values }: { errors: Record<string, ValidatedError> | undefined; values: Record<string, any> }) => {
	if (loading.value) return;
	if (!errors) {
		setLoading(true);
		try {
			await userStore.login(values as UserLoginRequest);
			// 不引用导致不回跳转
			const { redirect, ...othersQuery } = router.currentRoute.value.query;
			if (redirect && router.hasRoute(redirect as string)) {
				router.push({ name: redirect as string, query: { ...othersQuery } });
			} else {
				router.push({ path: '/', query: { ...othersQuery } });
			}

			Message.success('登陆成功');
			const { rememberPassword } = loginConfig.value;
			const { username, password } = values;
			loginConfig.value.username = rememberPassword ? username : '';
			loginConfig.value.password = rememberPassword ? password : '';
		} catch (err) {
			fetchCaptcha();
			errorMessage.value = (err as Error).message;
		} finally {
			setLoading(false);
		}
	}
};
const setRememberPassword = (value: boolean) => {
	loginConfig.value.rememberPassword = value;
};
</script>

<style lang="less" scoped>
.login-form {
	&-wrapper {
		width: 300px;
	}

	&-title {
		color: var(--color-text-1);
		font-weight: 500;
		font-size: 24px;
		line-height: 32px;
	}

	&-sub-title {
		color: var(--color-text-3);
		font-size: 16px;
		line-height: 24px;
	}

	&-error-msg {
		height: 32px;
		color: rgb(var(--red-6));
		line-height: 32px;
	}

	&-password-actions {
		display: flex;
		justify-content: space-between;
	}

	&-register-btn {
		color: var(--color-text-3) !important;
	}
}
</style>

<style lang="less" scoped>
.container {
	display: flex;
	height: 100vh;
	background: url('@/assets/images/login.jpg') center center fixed no-repeat;
	background-size: cover;

	.content {
		position: relative;
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: flex-end;
		margin-right: 100px;
		padding-bottom: 40px;
	}

	.footer {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 100%;
	}
}

.logo {
	position: fixed;
	top: 24px;
	left: 22px;
	z-index: 1;
	display: inline-flex;
	align-items: center;

	&-text {
		margin-right: 4px;
		margin-left: 4px;
		color: var(--color-fill-1);
		font-size: 20px;
	}
}
</style>

<style lang="less" scoped>
// responsive
@media (max-width: @screen-lg) {
	.container {
		.content {
			justify-content: center;
			margin-right: 0;
		}
	}
}
</style>
