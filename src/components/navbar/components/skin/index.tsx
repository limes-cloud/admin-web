import { Modal, List, ListItem, ListItemMeta, Button } from '@arco-design/web-vue';
import { map } from 'lodash';
import styles from './index.module.less';

const valueMap = {
	default: '默认',
	gray: '灰色'
};

export default defineComponent({
	props: {
		modelValue: {
			type: String,
			required: true
		}
	},
	emits: ['update:modelValue', 'change'],
	setup(props, { emit }) {
		const visible = ref(false);
		const skinList = reactive([
			{
				name: 'default',
				desc: '默认皮肤',
				avatar: <div class={styles.avatar} style="background-color: var(--color-bg-1);"></div>
			},
			{
				name: 'gray',
				desc: '经典灰色',
				avatar: <div class={styles.avatar} style="background-color: #2c3643;"></div>
			}
		]);
		watchEffect(() => {
			emit('change', props.modelValue);
		});
		return () => (
			<>
				<Button
					size="mini"
					type="primary"
					onClick={() => {
						visible.value = true;
					}}
				>
					{valueMap[props?.modelValue]}
				</Button>
				<Modal
					visible={visible.value}
					onCancel={() => {
						visible.value = false;
					}}
					onOk={() => {
						visible.value = false;
					}}
					title="皮肤设置"
					bodyClass={styles.modal}
				>
					<List>
						{map(skinList, (item) => (
							<>
								<ListItem key={item?.name}>
									{{
										default: () => (
											<ListItemMeta title={item?.name} description={item?.desc}>
												{{
													avatar: () => item?.avatar
												}}
											</ListItemMeta>
										),
										actions: () => (
											<Button
												type="primary"
												size="mini"
												disabled={item?.name === props?.modelValue}
												onClick={() => {
													emit('update:modelValue', item?.name);
												}}
											>
												{item?.name === props?.modelValue ? '使用中' : '使用'}
											</Button>
										)
									}}
								</ListItem>
							</>
						))}
					</List>
				</Modal>
			</>
		);
	}
});
