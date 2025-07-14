<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { CSSProperties } from 'vue';
import QRCode from 'qrcode';

export interface Props {
	value?: string; // 扫描后的文本或地址
	icon?: string; // 二维码中图片的地址
	size?: number; // 二维码大小，单位 px
	iconSize?: number; // 二维码中图片的大小，单位 px
	color?: string; // 二维码颜色，Value must be in hex format (十六进制颜色值)
	bgColor?: string; // 二维码背景色，Value must be in hex format (十六进制颜色值)
	scale?: number; // 缩放因子，每个 black dots 占用多少像素
}

const props = withDefaults(defineProps<Props>(), {
	value: undefined,
	type: 'image',
	icon: undefined,
	size: 160,
	iconSize: 40,
	color: '#000',
	bgColor: '#FFF',
	bordered: true,
	borderColor: 'rgba(5, 5, 5, 0.06)',
	scale: 16,
	errorLevel: 'H'
});

const qrcode = ref<string>('');
const qrcodeStyle = computed(() => {
	const style: CSSProperties = {
		width: `${props.size}px`,
		height: `${props.size}px`,
		backgroundColor: `${props.bgColor}`
	};
	return style;
});
const iconStyle = computed(() => {
	const style: CSSProperties = {
		width: `${props.iconSize}px`,
		height: `${props.iconSize}px`,
		backgroundColor: `${props.bgColor}`
	};
	return style;
});
const qrcodeOptions = computed(() => {
	return {
		quality: 1, // number 默认 0.92, 0 <= quality <= 1 仅在 type 为 'image/jpeg' 或 'image/webp' 时有效
		margin: 0, // number 默认 4, 边距大小，单位 px
		scale: props.scale, // number，默认 4, 缩放因子，A value of 1 means 1px per modules (black dots).
		color: {
			dark: props.color, // 像素点颜色
			light: '#00000000' // 背景色
		}
	};
});
watch(
	() => [props.value, qrcodeOptions.value],
	async () => {
		if (props.value) {
			qrcode.value = await QRCode.toDataURL(props.value, qrcodeOptions.value);
		}
	},
	{
		immediate: true,
		deep: true,
		flush: 'post'
	}
);
defineExpose({
	getQRCodeImage: () => props.value && QRCode.toDataURL(props.value, qrcodeOptions.value)
});
</script>

<template>
	<div class="m-qrcode" :style="qrcodeStyle">
		<img :src="qrcode" class="qrcode-image" alt="QR Code" />
		<img v-if="icon" :src="icon" :style="iconStyle" class="qrcode-icon" alt="QR Code Icon" />
	</div>
</template>

<style lang="less" scoped>
.m-qrcode {
	position: relative;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
	.qrcode-svg,
	.qrcode-canvas,
	.qrcode-image {
		width: 100%;
		height: 100%;
	}
	.qrcode-canvas {
		:deep(canvas) {
			max-width: 100%;
			max-height: 100%;
		}
	}
	.qrcode-icon {
		position: absolute;
		z-index: 1;
		right: 0;
		left: 0;
		top: 0;
		bottom: 0;
		margin: auto;
		pointer-events: none;
		border-radius: 4px;
	}
}
</style>
