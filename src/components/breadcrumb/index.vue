<template>
	<a-breadcrumb class="container-breadcrumb">
		<a-breadcrumb-item>
			<icon-apps />
		</a-breadcrumb-item>

		<a-breadcrumb-item v-for="(item, index) in rlist" :key="index">
			<template v-if="item.isLink && index != rlist.length - 1">
				<a-link :href="item.path">{{ item.title }}</a-link>
			</template>
			<template v-else>
				{{ item.title }}
			</template>
		</a-breadcrumb-item>
	</a-breadcrumb>
</template>

<script lang="ts" setup>
import router from '@/router';

interface Item {
	title: string;
	path?: string;
	name?: string;
	isLink?: boolean;
}

const props = defineProps<{ list?: Item[] }>();
const rlist = ref<Item[]>([]);

onMounted(() => {
	if (props.list?.length) {
		rlist.value = props.list;
		return;
	}

	// 不存在则自动生成
	const temps = router.currentRoute.value.matched;
	const arr: Item[] = [];
	temps.forEach((item, index) => {
		if (index >= 1 && item.meta.title === temps[index - 1].meta.title) {
			return;
		}
		arr.push({
			title: item.meta.title as string,
			path: item.path,
			name: item.name as string,
			isLink: (item.path && !!item.name && item.meta.notLayout) as boolean
		});
	});
	rlist.value = arr;
});

// {
// 	items: {
// 		type: Array as PropType<string[]>,
// 		default() {
// 			const temps = router.currentRoute.value.matched;
// 			const arr: string[] = [];
// 			temps.forEach((item) => {
// 				arr.push(item.meta.title as string);
// 			});
// 			return arr;
// 		}
// 	}
// }
</script>

<style scoped lang="less">
.container-breadcrumb {
	margin: 16px 0;

	:deep(.arco-breadcrumb-item) {
		color: rgb(var(--gray-6));

		&:last-child {
			color: rgb(var(--gray-8));
		}
	}
}
</style>
