import { useAppStore } from '@/store';
import { DictionaryItems } from '@/store/modules/app/types';

const appStore = useAppStore();

export const getDictionayList = (keyword: string): DictionaryItems[] => {
	const dict = appStore.$state.dictionaries;
	if (!dict || dict[keyword]) {
		return [];
	}
	return dict[keyword].list;
};

export const getDictionayLabel = (keyword: string, value: string): string => {
	const list = getDictionayList(keyword);
	const set: Record<string, string> = {};
	list.forEach((item) => {
		set[item.value] = item.label;
	});
	return set[value];
};
