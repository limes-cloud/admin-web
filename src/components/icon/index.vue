<script lang="tsx">
import { compile, defineComponent, h } from 'vue';

interface Props {
	name?: string;
	size?: number;
	color?: string;
}
export default defineComponent({
	props: {
		name: String,
		size: {
			type: Number,
			default: 16
		}
	},
	setup(props: Props) {
		return () => h(compile(`<icon-${props.name} :size="${props.size}" />`));
	}
});
</script>
