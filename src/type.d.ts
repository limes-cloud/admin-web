// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Vue from 'vue';

type FormatUrlFunc = (i: string, w?: number, h?: number) => string;
type FormatFunc = (string) => string;
type DetermineFunc = (string) => boolean;
declare module 'vue' {
	interface ComponentCustomProperties {
		$rurl: FormatUrlFunc;
		$logo: string;
		$parseTime: FormatFunc;
		$formatTime: FormatFunc;
		$densityList: Record<string, string>;
		$genderList: Record<string, string>;
		$hasPermission: DetermineFunc;
		$debounce: any;
	}
}

// declare module 'js-yaml';
