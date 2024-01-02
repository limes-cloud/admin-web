<template>
	<div class="form-box">
		<div class="form">
			<a-form :model="formModel" auto-label-width>
				<template v-for="(ite, ind) in list" :key="ind">
					<div v-if="ite.type === 'input'" class="form-item" :class="curField === ite.field ? 'form-item-active' : ''" @click="chooseComponent(ite, ind)">
						<a-form-item
							row-class="form-row"
							:required="ite.config.require"
							:field="ite.field"
							:tooltip="ite.config.disabled ? '初始化隐藏' : '初始显示'"
							:label="ite.config.label"
						>
							<a-input v-model="formModel[ite.field]" :placeholder="ite.config.placeholder" />
							<Build :field="ite.field" @up="handleItemUp" @down="handleItemDown" @delete="handleItemDelete" />
						</a-form-item>
					</div>

					<div
						v-if="ite.type === 'textarea'"
						class="form-item"
						:class="curField === ite.field ? 'form-item-active' : ''"
						@click="chooseComponent(ite, ind)"
					>
						<a-form-item
							row-class="form-row"
							:required="ite.config.require"
							:field="ite.field"
							:tooltip="ite.config.disabled ? '初始化隐藏' : '初始显示'"
							:label="ite.config.label"
						>
							<a-textarea v-model="formModel[ite.field]" :placeholder="ite.config.placeholder" />
							<Build :field="ite.field" @up="handleItemUp" @down="handleItemDown" @delete="handleItemDelete" />
						</a-form-item>
					</div>

					<div v-if="ite.type === 'number'" class="form-item" :class="curField === ite.field ? 'form-item-active' : ''" @click="chooseComponent(ite, ind)">
						<a-form-item
							row-class="form-row"
							:required="ite.config.require"
							:field="ite.field"
							:tooltip="ite.config.disabled ? '初始化隐藏' : '初始显示'"
							:label="ite.config.label"
						>
							<a-input-number
								v-model="formModel[ite.field]"
								:placeholder="ite.config.placeholder"
								:step="ite.config.step"
								:min="ite.config.min"
								:max="ite.config.max"
							/>
							<Build :field="ite.field" @up="handleItemUp" @down="handleItemDown" @delete="handleItemDelete" />
						</a-form-item>
					</div>

					<div
						v-if="ite.type === 'password'"
						class="form-item"
						:class="curField === ite.field ? 'form-item-active' : ''"
						@click="chooseComponent(ite, ind)"
					>
						<a-form-item
							row-class="form-row"
							:required="ite.config.require"
							:field="ite.field"
							:tooltip="ite.config.disabled ? '初始化隐藏' : '初始显示'"
							:label="ite.config.label"
						>
							<a-input-password
								v-model="formModel[ite.field]"
								:placeholder="ite.config.placeholder"
								:step="ite.config.step"
								:min="ite.config.min"
								:max="ite.config.max"
							/>
							<Build :field="ite.field" @up="handleItemUp" @down="handleItemDown" @delete="handleItemDelete" />
						</a-form-item>
					</div>

					<div v-if="ite.type === 'radio'" class="form-item" :class="curField === ite.field ? 'form-item-active' : ''" @click="chooseComponent(ite, ind)">
						<a-form-item
							row-class="form-row"
							:required="ite.config.require"
							:field="ite.field"
							:tooltip="ite.config.disabled ? '初始化隐藏' : '初始显示'"
							:label="ite.config.label"
						>
							<a-radio-group v-model="formModel[ite.field]">
								<template v-for="val in ite.config.options" :key="val">
									<a-radio :value="val">{{ val }}</a-radio>
								</template>
							</a-radio-group>
							<Build :field="ite.field" @up="handleItemUp" @down="handleItemDown" @delete="handleItemDelete" />
						</a-form-item>
					</div>

					<div
						v-if="ite.type === 'checkbox'"
						class="form-item"
						:class="curField === ite.field ? 'form-item-active' : ''"
						@click="chooseComponent(ite, ind)"
					>
						<a-form-item
							row-class="form-row"
							:required="ite.config.require"
							:field="ite.field"
							:tooltip="ite.config.disabled ? '初始化隐藏' : '初始显示'"
							:label="ite.config.label"
						>
							<a-checkbox-group v-model="formModel[ite.field]">
								<template v-for="val in ite.config.options" :key="val">
									<a-checkbox :value="val">{{ val }}</a-checkbox>
								</template>
							</a-checkbox-group>
							<Build :field="ite.field" @up="handleItemUp" @down="handleItemDown" @delete="handleItemDelete" />
						</a-form-item>
					</div>

					<div v-if="ite.type === 'select'" class="form-item" :class="curField === ite.field ? 'form-item-active' : ''" @click="chooseComponent(ite, ind)">
						<a-form-item
							row-class="form-row"
							:required="ite.config.require"
							:field="ite.field"
							:tooltip="ite.config.disabled ? '初始化隐藏' : '初始显示'"
							:label="ite.config.label"
						>
							<a-select v-model="formModel[ite.field]" :placeholder="ite.config.placeholder" allow-clear>
								<template v-for="val in ite.config.options" :key="val">
									<a-option :value="val">{{ val }}</a-option>
								</template>
							</a-select>
							<Build :field="ite.field" @up="handleItemUp" @down="handleItemDown" @delete="handleItemDelete" />
						</a-form-item>
					</div>

					<div v-if="ite.type === 'time'" class="form-item" :class="curField === ite.field ? 'form-item-active' : ''" @click="chooseComponent(ite, ind)">
						<a-form-item
							row-class="form-row"
							:required="ite.config.require"
							:field="ite.field"
							:tooltip="ite.config.disabled ? '初始化隐藏' : '初始显示'"
							:label="ite.config.label"
						>
							<a-time-picker :placeholder="ite.config.placeholder" />
							<Build :field="ite.field" @up="handleItemUp" @down="handleItemDown" @delete="handleItemDelete" />
						</a-form-item>
					</div>

					<div v-if="ite.type === 'date'" class="form-item" :class="curField === ite.field ? 'form-item-active' : ''" @click="chooseComponent(ite, ind)">
						<a-form-item
							row-class="form-row"
							:required="ite.config.require"
							:field="ite.field"
							:tooltip="ite.config.disabled ? '初始化隐藏' : '初始显示'"
							:label="ite.config.label"
						>
							<a-date-picker :placeholder="ite.config.placeholder" />
							<Build :field="ite.field" @up="handleItemUp" @down="handleItemDown" @delete="handleItemDelete" />
						</a-form-item>
					</div>

					<!-- <div v-if="ite.type === 'upload'" class="form-item" :class="curField === ite.field ? 'form-item-active' : ''" @click="chooseComponent(ite, ind)">
						<a-form-item
							row-class="form-row"
							:required="ite.config.require"
							:field="ite.field"
							:tooltip="ite.config.disabled ? '初始化隐藏' : '初始显示'"
							:label="ite.config.label"
						>
							<Build :field="ite.field" @up="handleItemUp" @down="handleItemDown" @delete="handleItemDelete" />
						</a-form-item>
					</div> -->
				</template>
			</a-form>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Editor from '../lib/editor';
import Build from './build.vue';
import { Component } from '../lib/types';

export interface AnyObject {
	[key: string]: any;
}

const props = defineProps<{
	list: Component[];
}>();
const emit = defineEmits(['update:list', 'choose']);

const curField = ref('');
const formModel = ref<AnyObject>({});

const handleItemUp = (field: string) => {
	Editor.up(props.list, field);
	emit('update:list', props.list);
};

const handleItemDown = (field: string) => {
	Editor.down(props.list, field);
	emit('update:list', props.list);
};

const handleItemDelete = (field: string) => {
	Editor.delete(props.list, field);
	emit('update:list', props.list);
};

const chooseComponent = (ite: Component, ind: number) => {
	curField.value = ite.field;
	emit('choose', ite, ind);
};
</script>

<style lang="less" scoped>
.form-box {
	position: relative;
	box-sizing: border-box;
	width: calc(100% - 500px);
	min-width: calc(100% - 500px);
	max-width: calc(100% - 500px);
	height: 100%;
	padding: 20px 15px;
	background: #fff;
	border: 1px solid #f2f2fe;
	border-radius: 4px;

	.form {
		width: 100%;
		height: 100%;
		overflow-y: scroll;

		&::-webkit-scrollbar {
			display: none;
		}

		.form-row {
			margin-bottom: 0 !important;
		}

		.form-item {
			margin-bottom: 22px;
			padding: 0 10px;
			border: 1px dashed #fff;
			border-radius: 4px;
			cursor: move;
		}

		.form-item-active {
			border: 1px dashed #787be8;
		}
	}
}
</style>
