<template>
	<Popup v-model:visible="visible" unmount-on-close :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="right" layout="horizontal" auto-label-width>
			<a-form-item
				field="appId"
				label="套餐应用"
				:rules="[
					{
						required: true,
						message: '套餐应用是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.appId"
					placeholder="请选择套餐应用"
					:scrollbar="true"
					:options="apps"
					@change="handlerSelectApp"
					@search="search.Search"
					@dropdown-reach-bottom="search.NextSearch"
				/>
			</a-form-item>

			<a-form-item
				field="expiredAt"
				label="过期时间"
				:rules="[
					{
						required: true,
						message: '过期时间是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-date-picker v-model="form.expiredAt" value-format="timestamp" style="width: 100%" allow-clear />
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
							v-model:checked-keys="menuIds"
							v-model:half-checked-keys="menuHalfIds"
							:checkable="true"
							:data="menus"
							:only-check-leaf="true"
							:field-names="{
								key: 'id',
								icon: '_icon' // 这里必须改一下名字，不然会加载icon失败
							}"
							@check="handlerSelectMenu"
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
import { ListApp } from '@/api/manager/app/api';
import { ListMenu } from '@/api/manager/menu/api';
import { Menu } from '@/api/manager/menu/type';
import { CreateTenantApp, GetTenantAppMenuIds, UpdateTenantApp } from '@/api/manager/tenant/api';
import { TenantApp, CreateTenantAppRequest, UpdateTenantAppRequest } from '@/api/manager/tenant/type';
import { Result, Search } from '@/utils/search';
import { Message } from '@arco-design/web-vue';
import { ref } from 'vue';

const props = defineProps<{ tenantId: number }>();

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = CreateTenantAppRequest | UpdateTenantAppRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

const apps = ref<Result[]>([]);
const menus = ref<Menu[]>([]);
const menuIds = ref<number[]>([]);
const menuHalfIds = ref<number[]>([]);

const search = new Search(
	apps.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListApp({ ...req, name: req.query as string | undefined });

		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return form.value.appId === val;
	}
);

const handleListMenu = async (appId: number) => {
	const { data } = await ListMenu({ appId, filterBaseApi: true });
	menus.value = data.list;
};

const handleListAppMenu = async (tenantId: number, appId: number) => {
	const { data } = await GetTenantAppMenuIds({ appId, tenantId });
	menuIds.value = data.menuIds;
};

const handlerSelectApp = () => {
	handleListMenu(form.value.appId);
};

const showAddDrawer = () => {
	search.Search();

	visible.value = true;
	isAdd.value = true;
	form.value = {} as Type;
	form.value.menuIds = [];
};

const showUpdateDrawer = async (data: TenantApp) => {
	await search.Search();
	await handleListMenu(data.appId);
	await handleListAppMenu(data.tenantId, data.appId);

	if (!search.IsExist(data.appId)) {
		apps.value.push({ label: data.app.name, value: data.app.id } as Result);
	}

	form.value = { ...data, menuIds: menuIds.value } as Type;
	form.value.expiredAt = data.expiredAt * 1000;

	visible.value = true;
	isAdd.value = false;
};

const closeDrawer = () => {
	visible.value = false;
};

defineExpose({ showAddDrawer, showUpdateDrawer, closeDrawer });

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}
	const data = { ...form.value };
	data.expiredAt /= 1000;
	data.tenantId = props.tenantId;

	try {
		if (isAdd.value) {
			await CreateTenantApp(data as CreateTenantAppRequest);
			Message.success('创建成功');
		} else {
			await UpdateTenantApp(data as UpdateTenantAppRequest);
			Message.success('更新成功');
		}
		emit('refresh');
		return true;
	} catch (e) {
		return false;
	}
};

const handlerSelectMenu = () => {
	const arr = menuIds.value.concat(menuHalfIds.value);
	const selects = Array.from(new Set(arr));
	if (selects.length >= 1) {
		form.value.menuIds = selects;
	}
};
</script>

<style lang="less" scoped>
.tree-content {
	width: 100%;
	max-height: 300px;
	padding: 12px;
	overflow: scroll;
	border: 1px solid var(--color-border);
	border-radius: 4px;

	&::-webkit-scrollbar {
		display: none;
	}
}

.empty {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;

	.empty-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: var(--color-neutral-5);
	}
}
</style>
