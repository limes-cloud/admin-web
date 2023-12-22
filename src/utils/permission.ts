import { useAppStore } from '@/store';

export const hasPermission = (r: string) => {
	return useAppStore().permissions.has(r);
};

export default null;
