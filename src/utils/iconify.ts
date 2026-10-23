import { addCollection } from '@iconify/vue'

export interface MdiIconData {
  names: string[]
  categories: Record<string, string[]>
}

// MDI 官方分类为英文，这里统一映射为中文展示
const MDI_CATEGORY_LABELS: Record<string, string> = {
  'Account / User': '账号 / 用户',
  Agriculture: '农业',
  'Alert / Error': '警告 / 错误',
  'Alpha / Numeric': '字母 / 数字',
  Animal: '动物',
  Arrange: '排列',
  Arrow: '箭头',
  Audio: '音频',
  Automotive: '汽车',
  Banking: '银行',
  Battery: '电池',
  'Brand / Logo': '品牌 / 标志',
  'Cellphone / Phone': '手机 / 电话',
  Clothing: '服饰',
  Cloud: '云',
  Color: '颜色',
  Currency: '货币',
  Database: '数据库',
  'Date / Time': '日期 / 时间',
  'Developer / Languages': '开发 / 语言',
  'Device / Tech': '设备 / 科技',
  'Drawing / Art': '绘画 / 艺术',
  'Edit / Modify': '编辑 / 修改',
  Emoji: '表情',
  'Files / Folders': '文件 / 文件夹',
  'Food / Drink': '食物 / 饮品',
  Form: '表单',
  'Gaming / RPG': '游戏 / 角色扮演',
  'Geographic Information System': '地理信息',
  'Hardware / Tools': '硬件 / 工具',
  'Health / Beauty': '健康 / 美容',
  Holiday: '节日',
  'Home Automation': '智能家居',
  Lock: '锁',
  Math: '数学',
  'Medical / Hospital': '医疗 / 医院',
  Music: '音乐',
  Nature: '自然',
  Navigation: '导航',
  Notification: '通知',
  'People / Family': '人物 / 家庭',
  Photography: '摄影',
  Places: '地点',
  Printer: '打印',
  Religion: '宗教',
  Science: '科学',
  Settings: '设置',
  Shape: '形状',
  Shopping: '购物',
  'Social Media': '社交媒体',
  Sport: '体育',
  'Text / Content / Format': '文本 / 内容',
  Tooltip: '提示',
  'Transportation + Flying': '交通 / 航空',
  'Transportation + Other': '交通 / 其他',
  'Transportation + Road': '交通 / 道路',
  'Transportation + Water': '交通 / 水运',
  Vector: '矢量图',
  'Video / Movie': '视频 / 电影',
  View: '视图',
  Weather: '天气'
}

// translateCategories 把 MDI 英文分类名替换为中文，未命中的保留原名
function translateCategories(categories: Record<string, string[]>): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(categories).map(([name, icons]) => [MDI_CATEGORY_LABELS[name] || name, icons])
  )
}

let mdiPromise: Promise<MdiIconData> | null = null

// loadMdiIcons 懒加载 Material Design Icons 并注册到 Iconify，离线可用
export function loadMdiIcons(): Promise<MdiIconData> {
  if (!mdiPromise) {
    mdiPromise = import('@iconify-json/mdi')
      .then(({ icons, metadata }) => {
        addCollection(icons)
        return {
          names: Object.keys(icons.icons),
          categories: translateCategories(metadata.categories || {})
        }
      })
      .catch((error) => {
        mdiPromise = null
        throw error
      })
  }
  return mdiPromise
}
