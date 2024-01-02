<template>
	<div class="components">
		<!-- <div class="page-title">
			<span class="icon"></span>
			<span>组件列表</span>
		</div> -->
		<template v-for="(ite, ind) in components" :key="ind">
			<div class="component-item">
				<div class="title">
					<icon-menu-unfold class="icon" />
					<span class="text">{{ ite.title }}</span>
				</div>
				<div class="content">
					<a-row :gutter="16">
						<a-col v-for="(t, i) in ite.items" :key="i" :span="12">
							<div class="item" @click="handleChoose(t)">
								<SvgIcon class="icon" :name="'form-' + t.type" :size="14" />
								<span style="margin-left: 5px">{{ t.name }}</span>
							</div>
						</a-col>
					</a-row>
				</div>
			</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
import Editor from '../lib/editor';
import { ComponentDesc } from '../lib/types';

const editor = new Editor();
const { components } = editor;
const emit = defineEmits(['create']);

const handleChoose = (cd: ComponentDesc) => {
	emit('create', cd.creater());
};
</script>

<style lang="less" scoped>
.components {
	position: relative;
	width: 240px;
	min-width: 240px;
	max-width: 240px;
	height: 100%;
	padding: 20px 15px;
	background: #fff;
	border: 1px solid #f2f2fe;
	border-radius: 4px;

	.page-title {
		display: flex;
		align-items: center;
		margin-bottom: 15px;
		color: #666;
		font-weight: 700;
		font-size: 14px;

		.icon {
			display: block;
			width: 5px;
			height: 16px;
			margin-right: 10px;
			background-color: #409eff;
			border-radius: 4px;
		}
	}

	.component-item {
		.title {
			display: flex;
			align-items: center;
			color: #555;
			font-weight: 700;

			.icon {
				margin-right: 10px;
				font-size: 18px;
			}
		}

		.content {
			padding-top: 15px;
			padding-bottom: 10px;

			.item {
				display: flex;
				align-items: center;
				justify-content: center;
				height: 30px;
				margin-bottom: 5px;
				line-height: 30px;
				text-align: center;
				border: 1px solid #fff;
				border-radius: 4px;

				&:hover {
					color: #787be8;
					border: 1px dashed #787be8;
					cursor: pointer;
				}
			}
		}
	}
}
</style>
