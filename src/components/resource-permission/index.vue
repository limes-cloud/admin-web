<template>
	<a-drawer :width="340" :visible="visible" title="设置资源所属部门" unmount-on-close @before-ok="submit" @cancel="close">
		<div>
			<a-tree
				v-model:checked-keys="form.departmentIds"
				v-model:half-checked-keys="halfIds"
				check-strictly
				:checkable="true"
				:data="departments"
				:only-check-leaf="true"
				:field-names="{
					key: 'id',
					icon: '_icon',
					title: 'name'
				}"
			/>
		</div>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ListCurrentDepartment } from '@/api/manager/department/api';
import { GetResource, UpdateResource } from '@/api/manager/resource/api';
import { UpdateResourceRequest } from '@/api/manager/resource/type';
import { Message, TreeNodeData } from '@arco-design/web-vue';
import { ref } from 'vue';

const halfIds = ref<number[]>([]);
const visible = ref(false);
const departments = ref<TreeNodeData[]>([]);
const form = ref<UpdateResourceRequest>({} as UpdateResourceRequest);

const submit = async () => {
	if (form.value.departmentIds.length === 0) {
		Message.error('最少选择一个部门');
		return false;
	}
	await UpdateResource(form.value);
	Message.success('设置成功');
	visible.value = false;
	return true;
};

const show = async (key: string, id: number) => {
	form.value = {
		keyword: key,
		resourceId: id,
		departmentIds: []
	};
	const depReply = await ListCurrentDepartment();
	departments.value = depReply.data.list;

	const resReply = await GetResource({ keyword: key, resourceId: id });
	form.value.departmentIds = resReply.data.departmentIds;

	visible.value = true;
};

const close = () => {
	visible.value = false;
};

defineExpose({ show, close });
</script>
