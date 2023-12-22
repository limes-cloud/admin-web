import Mock from 'mockjs';
import setupMock, { successResponseWrap, failResponseWrap } from '@/utils/setup-mock';

import { MockParams } from '@/types/mock';
import { isLogin } from '@/utils/auth';

setupMock({
	setup() {
		// Mock.XHR.prototype.withCredentials = true;

		// 用户信息
		Mock.mock(new RegExp('/api/user/info'), () => {
			if (isLogin()) {
				const role = window.localStorage.getItem('userRole') || 'admin';
				return successResponseWrap({
					name: '王立群',
					avatar: '//lf1-xgcdn-tos.pstatp.com/obj/vcloud/vadmin/start.8e0e4855ee346a46ccff8ff3e24db27b.png',
					email: 'wangliqun@email.com',
					job: 'frontend',
					jobName: '前端艺术家',
					organization: 'Frontend',
					organizationName: '前端',
					location: 'beijing',
					locationName: '北京',
					introduction: '人潇洒，性温存',
					personalWebsite: 'https://www.arco.design',
					phone: '150****0000',
					registrationDate: '2013-05-10 12:10:00',
					accountId: '15012312300',
					certification: 1,
					role
				});
			}
			return failResponseWrap(null, '未登录', 50008);
		});

		// 验证码
		Mock.mock(new RegExp('/v1/login/captcha'), () => {
			const data = {
				uuid: 'c43a493f-93eb-45ce-89aa-55fc4fdd5ccd',
				captcha:
					'data:image/png;base64,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',
				expire: 180
			};
			return successResponseWrap(data);
		});

		// 登录
		Mock.mock(new RegExp('/v1/login'), (params: MockParams) => {
			const { username, password } = JSON.parse(params.body);
			if (!username) {
				return failResponseWrap(null, '用户名不能为空', 50000);
			}
			if (!password) {
				return failResponseWrap(null, '密码不能为空', 50000);
			}
			return successResponseWrap({
				token: '12345'
			});
			// return failResponseWrap(null, '账号或者密码错误', 50000);
		});

		// 登出
		Mock.mock(new RegExp('/api/user/logout'), () => {
			return successResponseWrap(null);
		});

		// 用户的服务端菜单
		Mock.mock(new RegExp('/v1/menu/tree'), () => {
			const menuList = [
				{
					app: 'manager',
					title: '基础平台',
					icon: 'user',
					type: 'R',
					children: [
						{
							app: 'manager',
							path: '/manager/dashboard',
							keyword: 'managerDashboard',
							component: 'Layout',
							redirect: '/manager/dashboard/workplace',
							is_hidden: false,
							type: 'M',
							permission: '',
							icon: 'dashboard',
							order: 1,
							is_home: false,
							title: '基础平台',
							weight: 10,
							children: [
								{
									app: 'manager',
									path: '/manager/menu',
									keyword: 'managerMenu',
									component: 'manager/menu/index',
									redirect: '',
									is_hidden: false,
									type: 'M',
									permission: '',
									title: '菜单管理',
									icon: 'dashboard',
									weight: 10
								},
								{
									app: 'manager',
									path: '/manager/role',
									keyword: 'managerRole',
									component: 'manager/role/index',
									redirect: '',
									is_hidden: false,
									type: 'M',
									is_home: true,
									permission: '',
									title: '角色管理',
									icon: 'dashboard',
									weight: 10
								},
								{
									app: 'manager',
									path: '/manager/department',
									keyword: 'managerDepartment',
									component: 'manager/department/index',
									redirect: '',
									is_hidden: false,
									type: 'M',
									is_home: true,
									permission: '',
									title: '部门管理',
									icon: 'dashboard',
									weight: 10
								}
							]
						}
					]
				},
				{
					app: 'configure',
					title: '配置中心',
					icon: 'user',
					type: 'R',
					children: [
						{
							app: 'configure',
							path: '/configure/dashboard',
							keyword: 'configureDashboard',
							component: 'Layout',
							redirect: '/configure/dashboard/workplace',
							is_hidden: false,
							type: 'M',
							permission: '',
							icon: 'dashboard',
							order: 1,
							is_home: false,
							title: '配置管理',
							weight: 10,
							children: [
								{
									app: 'configure',
									path: '/configure/dashboard/workplace',
									keyword: 'configureWorkplace',
									component: 'manager/dashboard/workplace/index',
									redirect: '',
									is_hidden: false,
									type: 'M',
									permission: '',
									title: '配置中心1',
									icon: 'dashboard',
									weight: 10
								},
								{
									app: 'configure',
									path: '/configure/dashboard/workplace2',
									keyword: 'configureWorkplace2',
									component: 'manager/dashboard/workplace2/index',
									redirect: '',
									is_hidden: false,
									type: 'M',
									is_home: true,
									permission: '',
									title: '配置中心2',
									icon: 'dashboard',
									weight: 10
								}
							]
						}
					]
				}
			];
			return successResponseWrap(menuList);
		});
	}
});
