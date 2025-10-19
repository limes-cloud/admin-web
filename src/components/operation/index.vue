<template>
	<template v-if="rl.length > 1">
		<a-dropdown trigger="click" size="small" :hide-on-select="false">
			<slot>
				<a-button>
					<template #icon>
						<icon-list />
					</template>
				</a-button>
			</slot>

			<template #content>
				<div class="op-list">
					<template v-for="(item, index) in rl" :key="index">
						<div class="op-item">
							<template v-if="item.popconfirm">
								<a-popconfirm :content="'您确认要' + item.text + '?'" type="warning" @ok="onClick(item)">
									<a-doption>
										<a-space :style="{ color: getColor(item.color) }">
											<Icon :name="item.icon" :size="13"></Icon>
											<span>{{ item.text }}</span>
										</a-space>
									</a-doption>
								</a-popconfirm>
							</template>
							<template v-else>
								<a-doption>
									<a-space :style="{ color: getColor(item.color) }" @click="onClick(item)">
										<Icon :name="item.icon" :size="13"></Icon>
										<span>{{ item.text }}</span>
									</a-space>
								</a-doption>
							</template>
						</div>
					</template>
				</div>
			</template>
		</a-dropdown>
	</template>
	<template v-else>
		<a-space class="cursor-pointer">
			<template v-for="(item, index) in rl" :key="index">
				<template v-if="item.popconfirm">
					<a-popconfirm :content="'您确认要' + item.text + '?'" type="warning" @ok="onClick(item)">
						<a-tag :color="item.color">
							<template #icon>
								<Icon :name="item.icon" :size="13"></Icon>
							</template>
							{{ item.text }}
						</a-tag>
					</a-popconfirm>
				</template>
				<template v-else>
					<a-tag :color="item.color" @click="onClick(item)">
						<template #icon>
							<Icon :name="item.icon" :size="13"></Icon>
						</template>
						{{ item.text }}
					</a-tag>
				</template>
			</template>
		</a-space>
	</template>
</template>

<script lang="ts" setup>
import { hasPermission } from '@/utils/permission';

type Menu = {
	icon: string;
	text: string;
	color: string;
	permission?: string;
	popconfirm?: boolean;
	click: (data: any) => void;
};

const rl = ref<Menu[]>([]);
const props = defineProps<{
	data: any;
	list: Menu[];
}>();

watch(
	() => props.list,
	(val) => {
		rl.value = [];
		val.forEach((item: Menu) => {
			if (!item.permission) {
				rl.value.push(item);
				return;
			}
			if (hasPermission(item.permission)) {
				rl.value.push(item);
			}
		});
	},
	{ immediate: true }
);

const getColor = (color: string) => {
	if (!color) return '';
	return `rgb(var(--${color}-6))`;
};

const onClick = (item: Menu) => {
	if (item.click) item.click(props.data);
};
</script>

<style lang="less" scoped>
.op-list {
	padding: 3px 8px;

	.op-item {
		padding: 3px 0;

		:deep(.arco-dropdown-option) {
			.arco-dropdown-option-content {
				font-size: 13px;
				line-height: 30px;
			}
		}
	}
}
</style>
