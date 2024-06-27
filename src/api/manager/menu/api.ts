import menuTree from './menu.json';

// ListMenuByCurRole 获取菜单信息列表
export async function ListMenuByCurRole() {
	return { data: { list: menuTree } };
}

export default null;
