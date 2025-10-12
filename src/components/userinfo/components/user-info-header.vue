<template>
	<div>
		<div class="header">
			<a-space :size="12" direction="vertical" align="center" style="z-index: 99">
				<Upload :files="files()" :limit="1" :auto-upload="true" directory-path="manager/avatar" @change="handleUploadAvatar"></Upload>
				<!-- <a-avatar :size="100">
					<img alt="avatar" :src="userinfo.avatar ? userinfo.avatar : $logo" />
				</a-avatar> -->
				<a-typography-title :heading="6" :style="{ margin: 0, color: '#fff' }">
					{{ userinfo.nickname }}
				</a-typography-title>
			</a-space>
		</div>
		<div class="user-msg">
			<div class="msg-item">
				<div class="label">
					<icon-user size="16" />
					用户账户
				</div>
				<div class="desc">
					{{ userinfo.username }}
				</div>
			</div>
			<div class="msg-item">
				<div class="label">
					<icon-user-group size="16" />
					主要部门
				</div>
				<div class="desc">
					{{ userinfo.dept?.name }}
				</div>
			</div>

			<div class="msg-item">
				<div class="label">
					<icon-safe size="16" />
					担任职位
				</div>
				<div class="desc">
					{{ userinfo.job?.name }}
				</div>
			</div>

			<!-- <div class="msg-item">
				<div class="label">
					<icon-mobile size="14" />
					联系电话
				</div>
				<div class="desc">
					{{ userinfo.phone }}
				</div>
			</div>

			<div class="msg-item">
				<div class="label">
					<icon-email size="14" />
					当前邮箱
				</div>
				<div class="desc">
					{{ userinfo.email }}
				</div>
			</div> -->
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance } from 'vue';
import { UpdateCurrentUser } from '@/api/manager/user/api';
import { useUserStore } from '@/store';
import { FileItem, Message } from '@arco-design/web-vue';

const { proxy } = getCurrentInstance() as any;
const userinfo = useUserStore();

const handleUploadAvatar = (list: FileItem[]) => {
	if (!list.length) return;
	UpdateCurrentUser({ avatar: list[0].response.key }).then(() => {
		Message.success('头像更换成功');
	});
};

const files = () => {
	if (userinfo.avatar) {
		return [
			{
				url: proxy.$rurl(userinfo.avatar, 100, 100),
				key: userinfo.avatar
			}
		];
	}
	return [{ url: proxy.$logo }];
};
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

	&::before {
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
	z-index: 100;
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
