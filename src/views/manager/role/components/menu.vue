<template>
	<Popup v-model:visible="visible" title="角色菜单设置" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="appId"
				label="应用"
				:rules="[
					{
						required: true,
						message: '应用是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.appId"
					placeholder="请选择应用"
					:scrollbar="true"
					:options="apps"
					allow-search
					@change="handleSelectApp"
					@search="searchAppFactory.Search"
					@dropdown-reach-bottom="searchAppFactory.NextSearch"
				></a-select>
			</a-form-item>

			<a-form-item
				field="menuIds"
				label="菜单权限"
				:rules="[
					{
						required: true,
						message: '菜单权限是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<div class="tree-content">
					<template v-if="form.appId">
						<a-tree
							v-if="menus.length > 0"
							v-model:checked-keys="form.menuIds"
							v-model:half-checked-keys="halfIds"
							:checkable="true"
							:data="menus"
							:only-check-leaf="true"
							:field-names="{
								key: 'id',
								icon: '_icon' // 这里必须改一下名字，不然会加载icon失败
							}"
						/>
						<div v-else class="empty">
							<div class="empty-content">
								<svgIcon name="empty-data" :size="100" text="请选择应用" />
								暂无数据
							</div>
						</div>
					</template>

					<div v-else class="empty">
						<div class="empty-content">
							<svgIcon name="empty-data" :size="100" text="请选择应用" />
							请选择应用
						</div>
					</div>
				</div>
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { GetRoleMenuIds, UpdateRoleMenu } from '@/api/manager/role/api';
import { UpdateRoleMenuRequest } from '@/api/manager/role/type';
import { Result, Search } from '@/utils/search';
import { ListCurrentApp } from '@/api/manager/app/api';
import { ListCurrentMenu } from '@/api/manager/menu/api';
import { Menu } from '@/api/manager/menu/type';

const formRef = ref();
const visible = ref(false);
const emit = defineEmits(['refresh']);

const menus = ref<Menu[]>([]);
const form = ref({} as UpdateRoleMenuRequest);
const halfIds = ref<number[]>([]);
const apps = ref<Result[]>([]);

const searchAppFactory = new Search(
	apps.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListCurrentApp({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.appId === (val as number);
	}
);

const handleGetMenus = async (appId: number) => {
	const { data } = await ListCurrentMenu({ appId: appId, filterBaseApi: true, filterRoot: true, filterTenant: true });
	menus.value = data.list;
};

const handleGetRoleMenuIds = async (appId: number) => {
	const { data } = await GetRoleMenuIds({ roleId: form.value.roleId, appId: appId });
	form.value.menuIds = data.menuIds;
};

const handleSelectApp = async (appId: number) => {
	await handleGetMenus(appId);
	await handleGetRoleMenuIds(appId);
};

const show = (roleId: number) => {
	form.value = { roleId: roleId } as UpdateRoleMenuRequest;

	searchAppFactory.Search();

	visible.value = true;
};

const close = () => {
	visible.value = false;
};

defineExpose({ show, close });

const handleSubmit = async () => {
	const arr = form.value.menuIds.concat(halfIds.value);
	const selects = Array.from(new Set(arr));
	if (selects.length < 1) {
		Message.error('至少选择一个菜单权限');
		return false;
	}

	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}
	try {
		const data = form.value;
		await UpdateRoleMenu(data);
		Message.success('操作成功');
		emit('refresh');
		return true;
	} catch (e) {
		return false;
	}
};
</script>

<style lang="less" scoped>
.tree-content {
	width: 100%;
	max-height: 300px;
	overflow: scroll;
	border: 1px solid var(--color-border);
	padding: 12px;
	border-radius: 4px;
	&::-webkit-scrollbar {
		display: none;
	}
}

.empty {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	.empty-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: var(--color-neutral-5);
	}
}
</style>
