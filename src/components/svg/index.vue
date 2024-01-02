<template>
	<svg aria-hidden="true" class="svg-icon" :style="{ width: size + 'px', height: size + 'px' }">
		<use :xlink:href="symbolId" :fill="color ? color : 'currentcolor'" />
	</svg>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
	name: 'SvgIcon',
	props: {
		prefix: {
			type: String,
			default: 'icon'
		},
		name: {
			type: String,
			required: true
		},
		color: {
			type: String
		},
		size: {
			type: Number,
			default: 32
		}
	},
	setup(props) {
		const symbolId = computed(() => `#${props.prefix}-${props.name}`);
		return { symbolId };
	}
});
</script>

<style lang="less" scoped>
.svg-icon {
	// width: 1em;
	// height: 1em;
	// vertical-align: -0.15em;
	// fill: currentColor;
	// overflow: hidden;
	vertical-align: middle;
	fill: currentcolor !important;
}
</style>
