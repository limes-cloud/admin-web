<template>
	<a-list :bordered="false">
		<a-list-item>
			<a-list-item-meta>
				<template #avatar>
					<a-typography-paragraph>登录密码</a-typography-paragraph>
				</template>
				<template #description>
					<div class="content">
						<a-typography-paragraph class="tip">支持数字、字母、字符。</a-typography-paragraph>
					</div>
					<div class="operation">
						<a-link @click="handleChange('password')"><icon-edit /></a-link>
					</div>
				</template>
			</a-list-item-meta>
		</a-list-item>
	</a-list>
	<ChangeModal
		:info="changeInfo"
		:edit-visible="editVisible"
		:set-edit-visible="
			() => {
				editVisible = false;
			}
		"
	/>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import ChangeModal from './change-modal.vue';

const editVisible = ref(false);
const changeInfo = ref({ key: '', name: '' });

const handleChange = (tp: string) => {
	changeInfo.value.key = tp;
	switch (tp) {
		case 'phone':
			changeInfo.value.name = '电话';
			break;
		case 'email':
			changeInfo.value.name = '邮箱';
			break;
		case 'password':
			changeInfo.value.name = '密码';
			break;
		default:
			break;
	}
	editVisible.value = true;
};
</script>

<style lang="less">
.content {
	.arco-list-item {
		align-items: center;
		justify-content: center;
		padding: 10px 0 !important;

		.arco-typography {
			margin-bottom: 0 !important;
		}
	}
}
</style>

<style scoped lang="less">
:deep(.arco-list-item) {
	border-bottom: none !important;

	.arco-typography {
		margin-bottom: 20px;
	}

	.arco-list-item-meta-avatar {
		margin-bottom: 1px;
	}

	.arco-list-item-meta {
		padding: 0;
	}
}

:deep(.arco-list-item-meta-content) {
	flex: 1;
	border-bottom: 1px solid var(--color-neutral-3);

	.arco-list-item-meta-description {
		display: flex;
		flex-flow: row;
		justify-content: space-between;

		.tip {
			color: rgb(var(--gray-6));
		}

		.operation {
			min-width: 70px;
			text-align: right;
		}
	}
}
</style>
