<template>
	<div class="navbar">
		<div class="left-side" :style="{ width: appStore.menuWidth + 'px' }">
			<a-space>
				<img alt="logo" :src="$logo" style="width: 50px; height: 50px" />
				<a-typography-title :style="{ margin: 0, fontSize: '18px', width: '100%', minWidth: titleWidth() }" :heading="5" :ellipsis="true">
					{{ appStore.currentAppinfo.title }}
				</a-typography-title>
			</a-space>
		</div>
		<div v-if="appVisable" class="center-side">
			<App />
		</div>
		<ul class="right-side">
			<li>
				<a-tooltip :content="theme === 'light' ? '点击切换为暗黑模式' : '点击切换为亮色模式'">
					<a-button class="nav-btn" type="outline" :shape="'circle'" @click="handleToggleTheme">
						<template #icon>
							<icon-moon-fill v-if="theme === 'dark'" />
							<icon-sun-fill v-else />
						</template>
					</a-button>
				</a-tooltip>
			</li>

			<li>
				<a-tooltip :content="isFullscreen ? '点击退出全屏模式' : '点击切换全屏模式'">
					<a-button class="nav-btn" type="outline" :shape="'circle'" @click="toggleFullScreen">
						<template #icon>
							<icon-fullscreen-exit v-if="isFullscreen" />
							<icon-fullscreen v-else />
						</template>
					</a-button>
				</a-tooltip>
			</li>
			<li>
				<a-dropdown trigger="click">
					<a-avatar :size="32" :style="{ marginRight: '8px', cursor: 'pointer' }">
						<img v-if="avatar" alt="avatar" :src="avatar" />
						<img v-else alt="avatar" :src="$logo" />
					</a-avatar>
					<template #content>
						<a-doption>
							<a-space @click="handleLogout">
								<icon-export />
								<span>退出登录</span>
							</a-space>
						</a-doption>
					</template>
				</a-dropdown>
			</li>
		</ul>
	</div>
	<Userinfo :show="showUserinfoVisible" @cancel="showUserinfoVisible = false"></Userinfo>
</template>

<script lang="tsx" setup>
import useUser from '@/hooks/user';
import { useAppStore, useUserStore } from '@/store';
import { useDark, useFullscreen, useToggle } from '@vueuse/core';
import App from './app.vue';

const showUserinfoVisible = ref(false);
const appStore = useAppStore();

const userStore = useUserStore();

const { logout } = useUser();
const { isFullscreen, toggle: toggleFullScreen } = useFullscreen();
const avatar = computed(() => {
	return userStore.avatar;
});

const appVisable = computed(() => {
	return appStore.apps.length > 1 && appStore.layout !== 'twoColumns';
});

const theme = computed(() => {
	return appStore.theme;
});

const titleWidth = () => {
	if (appStore.device === 'mobile') {
		return `calc( ${appStore.menuWidth}px - 100px)`;
	}
	return `calc( ${appStore.menuWidth}px - 80px)`;
};

const isDark = useDark({
	selector: 'body',
	attribute: 'arco-theme',
	valueDark: 'dark',
	valueLight: 'light',
	storageKey: 'arco-theme',
	onChanged(dark: boolean) {
		// overridden default behavior
		appStore.toggleTheme(dark);
	}
});
const toggleTheme = useToggle(isDark);
const handleToggleTheme = () => {
	toggleTheme();
};

const handleLogout = () => {
	logout();
};
</script>

<style scoped lang="less">
.navbar {
	display: flex;
	justify-content: space-between;
	height: 100%;
	background-color: var(--color-bg-2);
	border-bottom: 1px solid var(--color-border);
}

.left-side {
	display: flex;
	align-items: center;
	padding-left: 15px;

	.title {
		min-width: calc();
	}
}

.center-side {
	display: flex;
	flex: 1;
	align-items: center;
}

.right-side {
	display: flex;
	padding-right: 20px;
	list-style: none;

	:deep(.locale-select) {
		border-radius: 20px;
	}

	li {
		display: flex;
		align-items: center;
		padding: 0 10px;
	}

	a {
		color: var(--color-text-1);
		text-decoration: none;
	}

	.nav-btn {
		color: rgb(var(--gray-8));
		font-size: 16px;
		border-color: rgb(var(--gray-2));
	}

	.trigger-btn,
	.ref-btn {
		position: absolute;
		bottom: 14px;
	}

	.trigger-btn {
		margin-left: 14px;
	}
}
</style>

<style lang="less">
.message-popover {
	.arco-popover-content {
		margin-top: 0;
	}
}
</style>
