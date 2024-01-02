<template>
	<div class="build">
		<span class="move" @click.stop="emit('up', field)">
			<a-tooltip content="位置上移">
				<icon-arrow-up />
			</a-tooltip>
		</span>
		<span class="move" @click.stop="emit('down', field)">
			<a-tooltip content="位置下移">
				<icon-arrow-down />
			</a-tooltip>
		</span>
		<a-popconfirm content="您确认删除此输入项" type="warning" @ok="emit('delete', field)">
			<span class="delete" @click.stop>
				<a-tooltip content="删除表单">
					<icon-delete />
				</a-tooltip>
			</span>
		</a-popconfirm>
	</div>
</template>

<script lang="ts" setup>
defineProps<{
	field: string;
}>();

const emit = defineEmits(['up', 'down', 'delete']);
</script>

<style lang="less" scoped>
.build {
	width: 100px;
	min-width: 100px;
	max-width: 100px;
	text-align: right;

	span {
		padding: 0 8px;
		cursor: pointer;
	}

	span.delete {
		color: red;
	}

	span.move {
		color: #2979ff;
	}
}
</style>
