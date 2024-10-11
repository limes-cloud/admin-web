import { App } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, GraphicComponent } from 'echarts/components';
import Chart from './chart/index.vue';
import Breadcrumb from './breadcrumb/index.vue';
import SvgIcon from './svg/index.vue';
import Icon from './icon/index.vue';
import Upload from './upload/index.vue';
import Tinymce from './tinymce/index.vue';
import FormEditor from './form-editor/index.vue';
import CodeEditor from './code-editor/index.vue';
import Xlsx from './xlsx/index.vue';
import ResourcePermission from './resource-permission/index.vue';
import Download from './download/index.vue';

// Manually introduce ECharts modules to reduce packing size

use([
	CanvasRenderer,
	BarChart,
	LineChart,
	PieChart,
	RadarChart,
	GridComponent,
	TooltipComponent,
	LegendComponent,
	DataZoomComponent,
	GraphicComponent
]);

export default {
	install(Vue: App) {
		Vue.component('Chart', Chart);
		Vue.component('Breadcrumb', Breadcrumb);
		Vue.component('SvgIcon', SvgIcon);
		Vue.component('Upload', Upload);
		Vue.component('Tinymce', Tinymce);
		Vue.component('FormEditor', FormEditor);
		Vue.component('Icon', Icon);
		Vue.component('CodeEditor', CodeEditor);
		Vue.component('Xlsx', Xlsx);
		Vue.component('Download', Download);
		Vue.component('ResourcePermission', ResourcePermission);
	}
};
