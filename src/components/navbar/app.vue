<script lang="tsx">
import { defineComponent, h, compile } from 'vue';
import { useAppStore, useTabBarStore } from '@/store';
import { App, Home } from '@/router/types';
import { getHomeByMenu, homeTransTag } from '@/router/guard/permission';
import router from '@/router';
import { Button, Doption, Dropdown, TypographyText } from '@arco-design/web-vue';
import Menu from '@/components/menu/index.vue';

export default defineComponent({
	emit: ['collapse'],
	setup(_, { attrs }) {
		const appStore = useAppStore();
		const tabStore = useTabBarStore();

		const switchApp = (app: App) => {
			if (app.keyword === appStore.currentAppKey) {
				return;
			}
			appStore.setCurrentApp(app.keyword);

			let home = appStore.appHome;
			if (!home) {
				home = getHomeByMenu(router);
				appStore.setAppHome(appStore.currentAppKey, home as Home);
			}
			tabStore.setHomeTag(homeTransTag(home as Home));
			tabStore.resetTab();
			router.push({ path: appStore.appHomePath });
		};

		const renderSubMenu = () => {
			function travel(apps: App[], nodes = []) {
				apps.forEach((app) => {
					// This is demo, modify nodes as needed
					const icon = () => h(compile(`<icon-${app.icon}/>`));
					const node = (
						<a-menu-item key={app.keyword} v-slots={{ icon }} onClick={() => switchApp(app)}>
							{app.title}
						</a-menu-item>
					);
					nodes.push(node as never);
				});
				return nodes;
			}
			return travel(appStore.apps);
		};

		const renderMenu = () => (
			<a-menu {...attrs} mode={appStore.layout === 'twoColumns' ? 'vertical' : 'horizontal'} selected-keys={[appStore.currentAppKey]}>
				{renderSubMenu()}
			</a-menu>
		);

		const dropdownText = computed(() => appStore.apps?.find((item) => item?.keyword === appStore.currentAppKey)?.title);

		const renderDropdown = () => (
			<div class="navbar-dropdown">
				{appStore.device !== 'mobile' && <Menu class="top-menu" />}
				<div
					class={{
						'dropdown-ml-10': appStore.device === 'mobile',
						'navbar-dropdown-item': true
					}}
				>
					<Dropdown onSelect={switchApp}>
						{{
							default: () => (
								<Button>
									<TypographyText class="top-navbar-dropdown-text">{dropdownText.value}</TypographyText>
									<icon-down />
								</Button>
							),
							content: () =>
								appStore.apps.map((item) => (
									<Doption value={item} key={item?.keyword}>
										{h(compile(`<icon-${item.icon}/>`))} {item?.title}
									</Doption>
								))
						}}
					</Dropdown>
				</div>
			</div>
		);

		return () => (appStore.layout === 'topMenu' ? renderDropdown() : renderMenu());
	}
});
</script>

<style lang="less">
.navbar-dropdown {
	display: flex;
	flex: 1;
	align-items: center;

	.navbar-dropdown-item {
		width: 110px;
	}

	.top-menu {
		flex: 1;

		.arco-menu-icon {
			position: relative;
			top: 2px;
			margin-right: 0;
		}
	}

	.dropdown-ml-10 {
		margin-left: 10px;
	}

	.top-navbar-dropdown-text {
		margin-right: 6px;
	}
}
</style>
