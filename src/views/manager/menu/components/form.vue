<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="480px" unmount-on-close @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				v-if="form.type != 'R'"
				field="parentId"
				label="父菜单"
				:rules="[
					{
						required: true,
						message: '父菜单是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-cascader
					v-model="form.parentId"
					check-strictly
					:options="menus"
					:field-names="{ value: 'id', label: 'title' }"
					placeholder="请选择父菜单"
					allow-search
				/>
			</a-form-item>

			<a-form-item
				field="title"
				label="标题"
				:rules="[
					{
						required: true,
						message: '标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" placeholder="请输入菜单标题" allow-clear />
			</a-form-item>

			<a-form-item
				field="weight"
				label="菜单权重"
				:rules="[
					{
						required: true,
						message: '菜单权重是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-number v-model="form.weight" placeholder="请输入菜单权重" :default-value="0" mode="button" />
			</a-form-item>

			<a-form-item
				field="type"
				label="菜单类型"
				:rules="[
					{
						required: true,
						message: '菜单类型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.type" :options="menuTypes" placeholder="请选择菜单类型" />
			</a-form-item>

			<a-form-item
				v-if="form.type === 'M' || form.type === 'R'"
				field="keyword"
				label="菜单标识"
				:rules="[
					{
						required: true,
						message: '菜单标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入菜单标识" allow-clear />
			</a-form-item>

			<a-form-item
				v-if="form.type === 'M' || form.type === 'R'"
				field="icon"
				label="菜单图标"
				:rules="[
					{
						required: true,
						message: '菜单图标是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.icon" allow-search placeholder="请选择菜单图标">
					<template v-for="item in iconOptions" :key="item">
						<a-option :value="item">
							<a-space align="center">
								<Icon :name="item" :size="18" />
								{{ item }}
							</a-space>
						</a-option>
					</template>
				</a-select>
			</a-form-item>

			<a-form-item
				v-if="form.type === 'A' || form.type === 'BA'"
				field="method"
				label="请求方法"
				:validate-trigger="['change', 'input']"
				:rules="[
					{
						required: true,
						message: '请求方法是必填项'
					}
				]"
			>
				<a-radio-group v-model="form.method">
					<a-radio value="GET">GET</a-radio>
					<a-radio value="POST">POST</a-radio>
					<a-radio value="PUT">PUT</a-radio>
					<a-radio value="DELETE">DELETE</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item
				v-if="form.type === 'A' || form.type === 'G'"
				field="permission"
				label="权限指令"
				:rules="[
					{
						required: true,
						message: '权限指令是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.permission" placeholder="请输入权限指令" allow-clear />
			</a-form-item>

			<a-form-item
				v-if="form.type === 'A' || form.type === 'BA'"
				field="api"
				label="接口路径"
				allow-clear
				:rules="[
					{
						required: true,
						message: '接口路径是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.api" placeholder="请输入接口路径" allow-clear />
			</a-form-item>

			<!-- api 可选菜单路径 -->
			<template v-if="form.type === 'A' || form.type === 'G'">
				<a-form-item field="path" label="菜单路径">
					<a-input v-model="form.path" placeholder="请输入菜单路径" allow-clear />
				</a-form-item>
				<a-form-item field="component" label="菜单组件">
					<a-input v-model="form.component" placeholder="请输入菜单组件" allow-clear />
				</a-form-item>
			</template>

			<!--菜单类型为必填-->
			<template v-if="form.type === 'M'">
				<a-form-item
					field="path"
					label="菜单路径"
					:rules="[
						{
							required: true,
							message: '菜单路径是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-input v-model="form.path" placeholder="请输入菜单路径" allow-clear />
				</a-form-item>

				<a-form-item field="component" label="菜单组件" :validate-trigger="['change', 'input']">
					<a-input v-model="form.component" placeholder="请输入菜单组件" allow-clear />
				</a-form-item>
			</template>

			<a-form-item v-if="form.type === 'M'" field="redirect" label="跳转路由" :validate-trigger="['change', 'input']">
				<a-input v-model="form.redirect" placeholder="请输入跳转路由" allow-clear />
			</a-form-item>

			<a-form-item v-if="form.type === 'M'" field="isHidden" label="是否隐藏" :validate-trigger="['change', 'input']">
				<a-radio-group v-model="form.isHidden" :default-value="false">
					<a-radio :value="false">否</a-radio>
					<a-radio :value="true">是</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item v-if="form.type === 'M'" field="isCache" label="是否缓存" :validate-trigger="['change', 'input']">
				<a-radio-group v-model="form.isCache" :default-value="false">
					<a-radio :value="false">否</a-radio>
					<a-radio :value="true">是</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item v-if="form.type === 'M'" field="isAffix" label="是否为tag" :validate-trigger="['change', 'input']">
				<a-radio-group v-model="form.isAffix" :default-value="false">
					<a-radio :value="false">否</a-radio>
					<a-radio :value="true">是</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item v-if="form.type === 'M'" field="isHome" label="设为首页" :validate-trigger="['change', 'input']">
				<a-radio-group v-model="form.isHome" :default-value="false">
					<a-radio :value="false">否</a-radio>
					<a-radio :value="true">是</a-radio>
				</a-radio-group>
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { Menu } from '@/api/manager/menu/type';
import { computed, ref, watch } from 'vue';
import icons from '@/utils/icon';
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { TableData, Message } from '@arco-design/web-vue';
import Icon from '@/components/icon/index.vue';
import { CreateMenu, UpdateMenu } from '@/api/manager/menu/api';

const formRef = ref();
const iconOptions = computed(() => icons);
const visible = ref(false);
const isAdd = ref(false);
const menuTypes = computed<SelectOptionData[]>(() => [
	{
		label: '菜单',
		value: 'M'
	},
	{
		label: '接口',
		value: 'A'
	},
	{
		label: '接口组',
		value: 'G'
	},
	{
		label: '基础接口',
		value: 'BA'
	},
	{
		label: '应用根菜单',
		value: 'R'
	}
]);

const props = defineProps<{
	menus?: TableData[];
	data: Menu;
}>();

const form = ref({} as Menu);
const emit = defineEmits(['refresh']);

watch(
	() => props.data,
	(val) => {
		if (!val) return;
		form.value = { weight: 0, ...val };
	}
);

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = () => {
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
	const data = form.value;
	if (isAdd.value) {
		if (data.type === 'R' && data.keyword) {
			data.component = 'Layout';
			data.path = `/${data.keyword.toLocaleLowerCase()}`;
		}
		await CreateMenu(data);
		Message.success('创建成功');
	} else {
		await UpdateMenu(data);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>

<style lang="less" scoped>
.check-box {
	display: flex;
	flex-direction: row;

	.chexk-item {
		width: 33%;
		min-width: 33%;
	}

	.operate {
		display: flex;
		flex: 1;
		justify-content: space-between;
		width: 50px;
	}
}

.mgb {
	margin-bottom: 10px;
}
</style>
