<template>
	<div class="container">
		<div class="logo">
			<img alt="logo" style="width: 100px" :src="$logo" />
			<!-- <div class="logo-text">{{ appStore.title }}</div>   -->
		</div>
		<div v-if="!isScanResult" class="content">
			<div class="content-inner">
				<div class="login-form-wrapper">
					<div class="login-form-action">
						<template v-if="isBind"><span>用户绑定</span></template>
						<template v-else><span>用户登陆</span></template>
					</div>
					<div class="login-form-title">
						{{ appStore.title }}
					</div>
					<div class="login-form-sub-title">{{ appStore.desc }}</div>
					<div class="login-form-error-msg">{{ errorMessage }}</div>
					<div class="login-container-box">
						<a-form v-if="oauthWay.action === 'password'" :model="loginForm" class="login-form" layout="vertical" @submit="handleSubmit">
							<a-form-item
								v-if="!isQueryTenant"
								field="tenant"
								:rules="[{ required: true, message: '所属租户是必填项' }]"
								:validate-trigger="['change', 'input']"
								hide-label
							>
								<a-select
									v-model="loginForm.tenant"
									placeholder="请选择所属租户"
									:scrollbar="true"
									:options="tenants"
									:disabled="isBind"
									@search="search.Search"
									@dropdown-reach-bottom="search.NextSearch"
								>
									<template #prefix><icon-user-group /></template>
								</a-select>
							</a-form-item>
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
									<a-checkbox checked="rememberPassword" :model-value="loginConfig.rememberPassword" @change="setRememberPassword">记住密码</a-checkbox>
								</div>
								<a-button size="large" type="primary" html-type="submit" long :loading="loading">{{ isBind ? '确认绑定' : '确认登录' }}</a-button>
							</a-space>
						</a-form>

						<a-form v-if="oauthWay.action === 'captcha'" :model="loginForm" class="login-form" layout="vertical" @submit="handleSubmit">
							<a-form-item field="username" :rules="[{ required: true, message: '账号不能为空' }]" :validate-trigger="['change', 'blur']" hide-label>
								<a-input v-model="loginForm.username" size="large" placeholder="账号不能为空">
									<template #prefix><icon-user /></template>
								</a-input>
							</a-form-item>
							<a-form-item field="captcha" :rules="[{ required: true, message: '验证码不能为空' }]" :validate-trigger="['change', 'blur']" hide-label>
								<a-input-search
									v-model="loginForm.captcha"
									size="large"
									placeholder="请输入验证码"
									allow-clear
									autocomplete
									search-button
									:loading="captchaLoading"
									@search="sendCaptcha"
								>
									<template #prefix>
										<icon-lock />
									</template>
									<template #button-default>{{ captchaTip }}</template>
								</a-input-search>
							</a-form-item>
							<a-space :size="16" direction="vertical">
								<div class="login-form-password-actions">
									<a-checkbox checked="rememberPassword" :model-value="loginConfig.rememberPassword" @change="setRememberPassword">记住密码</a-checkbox>
								</div>
								<a-button size="large" type="primary" html-type="submit" long :loading="loading">{{ isBind ? '确认绑定' : '确认登录' }}</a-button>
							</a-space>
						</a-form>

						<div v-if="oauthWay.action === 'scan'" class="login-qrcode">
							<div>
								<QRCode :size="180" :value="oauthWay.value" color="#2196f3" :icon="$logo"></QRCode>
							</div>
							<div class="login-qrcode-tip">
								<div class="login-qrcode-tip-info">
									<span style="margin-top: 5px; text-align: center">
										<icon-mobile />
										{{ oauthWay.tip }}
									</span>
								</div>
								<div>
									<a-button size="mini" @click="handleSwitchPassword">
										<icon-left />
										<span style="margin-left: 5px">密码登陆</span>
									</a-button>
								</div>
							</div>
						</div>
					</div>

					<div v-if="channels.length != 0 && !isBind" class="other-login-box">
						<a-divider orientation="center">其他登陆方式</a-divider>
						<div class="oauth-login">
							<template v-for="(item, index) in channels" :key="index">
								<div class="login-btn" @click="handleGetOAuthHandler(item.keyword, item.type)">
									<a-avatar shape="square" :image-url="$rurl(item.logo, 100, 100)" object-fit="fill"></a-avatar>
								</div>
								<a-divider v-if="index !== channels.length - 1" direction="vertical" />
							</template>
						</div>
					</div>
				</div>
			</div>

			<div class="footer">
				<Footer />
			</div>
		</div>

		<div v-else class="scan-result">
			<div class="scan-result-box">
				<a-result status="success" title="扫码提示" subtitle="你已成功使用设备扫码，等待登陆跳转"></a-result>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, reactive, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message, Modal } from '@arco-design/web-vue';
import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
import { useStorage } from '@vueuse/core';
import { useUserStore, useAppStore } from '@/store';
import useLoading from '@/hooks/loading';
import { GetUserLoginCaptcha } from '@/api/manager/user/api';
import { UserLoginRequest } from '@/api/manager/user/type';
import { ListTenantAppOAuthChannel } from '@/api/manager/app/api';
import { Channel } from '@/api/manager/app/type';
import { split } from 'lodash';
import { OAuthHandlerReply, OAuthBindRequest, OAuthLoginRequest } from '@/api/manager/auth/type';
import { OAuthHandler, OAuthLogin, ReportOAuthCode } from '@/api/manager/auth/api';
import Footer from '@/components/footer/index.vue';
import { Search, Result } from '@/utils/search';
import { ListTenant } from '@/api/manager/tenant/api';

const timeInter: any = ref(null);
const autoLoginTimeInter: any = ref(null);
const router = useRouter();
const errorMessage = ref('');
const channels = ref<Channel[]>([]);
const oauthWay = ref<OAuthHandlerReply>({ action: 'password' } as OAuthHandlerReply);
const isBind = ref(false);
const currentOAuthReq = ref<OAuthLoginRequest>({} as OAuthLoginRequest);
const isScanResult = ref(false);

const captchaLoading = ref(false);
const { loading, setLoading } = useLoading();
const userStore = useUserStore();
const appStore = useAppStore();
const loginConfig = useStorage('login-config', {
	rememberPassword: true,
	tenant: '',
	username: '',
	password: ''
});

const captchaBase64 = ref('');
const captchaTip = ref('获取验证码');

const loginForm = reactive<UserLoginRequest>({
	username: loginConfig.value.username,
	password: loginConfig.value.password,
	tenant: loginConfig.value.tenant,
	captcha: '',
	captchaId: ''
});

const tenants = ref<Result[]>([]);
const search = new Search(
	tenants.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListTenant({ ...req, name: req.query as string | undefined });

		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.keyword });
		});
		return res;
	},
	(val: any): boolean => {
		return loginForm.tenant === val;
	}
);

const isQueryTenant = ref(false);
onMounted(() => {
	const params = router.currentRoute.value.query;
	if (params.tenant) {
		loginForm.tenant = params.tenant as string;
		isQueryTenant.value = true;
	} else {
		search.Search();
	}
});

onUnmounted(() => {
	clearInterval(timeInter.value);
	timeInter.value = null;

	clearInterval(autoLoginTimeInter.value);
	autoLoginTimeInter.value = null;
});

const handleSwitchPassword = () => {
	oauthWay.value = { action: 'password' } as OAuthHandlerReply;
};

const sendCaptcha = async () => {
	if (!loginForm.username) {
		return;
	}

	const { data } = await OAuthHandler({ keyword: oauthWay.value.keyword, user: loginForm.username });
	captchaLoading.value = true;
	const duration = Number(data.value);
	let index = duration;
	const timmer = setInterval(() => {
		captchaTip.value = `${index}秒后重新获取`;
		index -= 1;
		if (index <= 0) {
			clearInterval(timmer);
			captchaTip.value = '获取验证码';
			captchaLoading.value = false;
		}
	}, 1000);

	oauthWay.value = data;
	currentOAuthReq.value = {
		keyword: data.keyword,
		uuid: data.uuid,
		code: ''
	};
};

const oathLoginSetToken = (token) => {
	userStore.setToken(token);
	// 不引用导致不回跳转
	const { redirect, ...othersQuery } = router.currentRoute.value.query;
	if (redirect && router.hasRoute(redirect as string)) {
		router.push({ name: redirect as string, query: { ...othersQuery } });
	} else {
		router.push({ path: '/', query: { ...othersQuery } });
	}

	Message.success('登陆成功');
};

const oauthLoginBindModal = () => {
	Modal.info({
		title: '账号绑定提示',
		content: '当前授权渠道未绑定账号，立即跳转绑定～',
		onOk: () => {
			oauthWay.value.action = 'password';
			isBind.value = true;
		}
	});
};

const fetchCaptcha = async () => {
	// 清除定时器
	clearInterval(timeInter.value);
	// 请求验证码
	const { data } = await GetUserLoginCaptcha();
	loginForm.captchaId = data.uuid;
	captchaBase64.value = data.captcha;
	if (!data.expire) {
		Message.error('验证码配置错误');
		return;
	}
	// 定时刷新
	timeInter.value = setInterval(() => {
		fetchCaptcha();
	}, data.expire * 1000);
};

fetchCaptcha();

const fetchOAuthLogin = async () => {
	// 清除定时器
	clearInterval(autoLoginTimeInter.value);
	// 请求验证码
	const { data } = await OAuthLogin(currentOAuthReq.value);
	if (!data) {
		// 定时刷新
		autoLoginTimeInter.value = setInterval(() => {
			fetchOAuthLogin();
		}, 2000);
		return;
	}

	if (!data.isBind) {
		oauthLoginBindModal();
		return;
	}

	// 设置登陆token
	oathLoginSetToken(data.token);
};

watch(
	() => oauthWay.value.action,
	() => {
		if (oauthWay.value.action === 'scan') {
			setTimeout(() => {
				fetchOAuthLogin();
			}, 2000);
		} else {
			clearInterval(autoLoginTimeInter.value);
		}
	}
);

const oauthLogin = async (req: OAuthLoginRequest) => {
	const { data } = await OAuthLogin(req).finally(() => {
		appStore.stopLoading();
	});

	if (!data.isBind) {
		oauthLoginBindModal();
		return Promise.reject();
	}
	oathLoginSetToken(data.token);
	return Promise.resolve();
};

const handleSubmit = async ({ errors, values }: { errors: Record<string, ValidatedError> | undefined; values: Record<string, any> }) => {
	if (loading.value) return;
	if (!errors) {
		setLoading(true);
		try {
			if (oauthWay.value.action === 'password') {
				if (isBind.value) {
					const data = {
						...values,
						...currentOAuthReq.value
					};
					await userStore.oauthBind(data as unknown as OAuthBindRequest);
				} else {
					await userStore.login(values as UserLoginRequest);
				}
				// 不引用导致不回跳转
				const { redirect, ...othersQuery } = router.currentRoute.value.query;
				if (redirect && router.hasRoute(redirect as string)) {
					router.push({ name: redirect as string, query: { ...othersQuery } });
				} else {
					router.push({ path: '/', query: { ...othersQuery } });
				}

				Message.success('登陆成功');
				const { rememberPassword } = loginConfig.value;
				const { username, password, tenant } = values;
				loginConfig.value.username = rememberPassword ? username : '';
				loginConfig.value.password = rememberPassword ? password : '';
				loginConfig.value.tenant = rememberPassword ? tenant : '';
			} else {
				await oauthLogin({
					...currentOAuthReq.value,
					user: values.username,
					code: values.captcha
				});
			}
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

const getOAuthChannels = async () => {
	const app = useAppStore();
	const { data } = await ListTenantAppOAuthChannel({ app: app.keyword, tenant: loginForm.tenant });
	channels.value = data.list;
};

watch(
	() => loginForm.tenant,
	() => {
		if (loginForm.tenant) {
			getOAuthChannels();
		} else {
			channels.value = [];
		}
	},
	{ immediate: true }
);

const handleGetOAuthHandler = async (key: string, type: string) => {
	if (type === 'email') {
		oauthWay.value = { action: 'captcha', keyword: key } as OAuthHandlerReply;
		return;
	}
	const { data } = await OAuthHandler({ keyword: key });

	oauthWay.value = data;

	currentOAuthReq.value = {
		keyword: data.keyword,
		uuid: data.uuid,
		code: ''
	};
};

const handleInit = async () => {
	const getCode = async (keyword, query) => {
		const { data } = await OAuthHandler({ keyword });
		return query[data.codeField] || '';
	};

	// 后续适配新的url在这里添加
	const getCustomValue = (query) => {
		return (query.state as string) || '';
	};

	const { query } = router.currentRoute.value;
	const state = getCustomValue(query);
	const [keyword, action, uuid] = split(state, '.');

	if (!keyword || !action || !uuid) return;

	const code = await getCode(keyword, query);
	if (!code.length) return;
	currentOAuthReq.value = {
		keyword,
		code,
		uuid
	};

	if (action === 'jump') {
		// 直接请求三方登陆接口
		appStore.startLoading('正在登录中...');
		oauthLogin(currentOAuthReq.value);
		return;
	}

	// 判断是否为扫码登陆
	if (action === 'scan') {
		isScanResult.value = true;
		ReportOAuthCode(currentOAuthReq.value).then(() => {
			Message.success('扫码成功~');
		});
	}
};

handleInit();
</script>

<style lang="less" scoped>
.login-form {
	&-wrapper {
		width: 350px;
		padding: 15px;
		border-radius: 8px;
	}

	&-action {
		margin-bottom: 10px;
		color: var(--color-text-1);
		font-weight: 500;
		font-size: 22px;
		line-height: 32px;
	}

	&-title {
		color: var(--color-text-1);
		font-weight: 500;
		font-size: 16px;
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
	position: relative;
	display: flex;
	box-sizing: border-box;
	height: 100vh;
	background: url('@/assets/images/login.jpg') center center fixed no-repeat;
	background-size: cover;

	.content {
		position: absolute;
		top: 100px;
		right: 100px;
		padding-bottom: 40px;
	}

	.footer {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 40px;
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

.oauth-login {
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	text-align: center;

	.login-btn {
		cursor: pointer;
	}
}

.other-login-box {
	margin-top: 40px;
}

.scan-result {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100vh;

	&-box {
		width: 240px;
		background: rgb(255 255 255 / 70%);
		border-radius: 4px;
		box-shadow: 0 0 12px rgb(0 0 0 / 10%);
	}
}

.login-qrcode {
	display: flex;
	padding: 15px;
	background: var(--color-bg-1);
	border-radius: 8px;
	box-shadow: 0 0 5px rgb(0 0 0 / 10%);

	&-tip {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		margin-left: 15px;

		&-info {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 150px;
			color: rgb(var(--warning-5));
		}
	}
}
</style>

<style lang="less" scoped>
// responsive
@media (max-width: @screen-sm) {
	.container {
		.content {
			position: relative;
			top: 30px;
			left: 0;
			display: flex;
			flex: 1;
			align-items: center;
			justify-content: center;
			margin-right: 0;
			padding-bottom: 0;
		}

		.footer {
			bottom: 25px;
		}
	}
}
</style>
