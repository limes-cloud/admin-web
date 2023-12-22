<template>
	<div>
		<div class="header">
			<a-space :size="12" direction="vertical" align="center">
				<a-avatar :size="100">
					<img alt="avatar" :src="userInfo.avatar ? userInfo.avatar : $logo" />
				</a-avatar>
				<a-typography-title :heading="6" :style="{ margin: 0, color: '#fff' }">
					{{ userInfo.name }}
				</a-typography-title>
			</a-space>
		</div>
		<div class="user-msg">
			<div class="msg-item">
				<div class="label">
					<icon-user-group size="16" />
					所属部门
				</div>
				<div class="desc">
					{{ userInfo.department?.name }}
				</div>
			</div>

			<div class="msg-item">
				<div class="label">
					<icon-safe size="16" />
					所属角色
				</div>
				<div class="desc">
					{{ userInfo.role?.name }}
				</div>
			</div>

			<div class="msg-item">
				<div class="label">
					<icon-mobile size="14" />
					联系电话
				</div>
				<div class="desc">
					{{ userInfo.phone }}
				</div>
			</div>

			<div class="msg-item">
				<div class="label">
					<icon-email size="14" />
					当前邮箱
				</div>
				<div class="desc">
					{{ userInfo.email }}
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store';

const userInfo = useUserStore();

// const uploadCallback = async (files: any[]) => {
//   // todo更新用户信息
//   if (files.length) {
//     console.log({ id: userInfo.id, avatar: files[0].url });
//     await updateUser({ id: userInfo.id, avatar: files[0].url });
//     Message.success('更换头像成功');
//     // userInfo.info();
//   }
// };
</script>

<style scoped lang="less">
.header {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 200px;
	overflow: hidden;
	color: var(--gray-10);
	background: rgb(var(--blue-6));
	background-size: cover;

	:deep(.arco-avatar-trigger-icon-button) {
		color: rgb(var(--arcoblue-6));

		:deep(.arco-icon) {
			vertical-align: -1px;
		}
	}

	&::after {
		position: absolute;
		bottom: -1px;
		left: 0;
		display: block;
		width: 100%;
		height: 150px;
		background: url('@/assets/images/wave.gif') no-repeat;
		background-size: 100% 100%;
		mix-blend-mode: screen;
		content: '';
	}

	.arco-avatar {
		background-color: #fff;
	}
}

.hr {
	width: 100%;
	height: 15px;
	// background-color: var(--color-fill-2);
}

.user-msg {
	padding: 15px;

	.arco-icon {
		color: rgb(var(--gray-10));
	}

	.arco-typography {
		margin-left: 6px;
	}

	.msg-item {
		display: flex;
		justify-content: space-around;
		padding: 5px 0;

		.label {
			width: 50%;
			text-align: left;
		}

		.desc {
			width: 50%;
			color: rgb(var(--gray-7));
			text-align: right;
		}
	}
}
</style>
