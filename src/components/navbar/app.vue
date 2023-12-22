<script lang="tsx">
import { defineComponent, h, compile } from 'vue';
import { useAppStore, useTabBarStore } from '@/store';
import { App, Home } from '@/router/types';
import { getHomeByMenu, homeTransTag } from '@/router/guard/permission';
import router from '@/router';

export default defineComponent({
	emit: ['collapse'],
	setup() {
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

		return () => (
			<a-menu mode="horizontal" selected-keys={[appStore.currentAppKey]}>
				{renderSubMenu()}
			</a-menu>
		);
	}
});
</script>

<style lang="less">
.arco-menu-icon {
	margin-right: 0;
}
</style>
