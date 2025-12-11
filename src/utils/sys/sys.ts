interface SystemInfo {
  browserName?: string
  browserVersion?: string
  deviceType?: string
  platform?: string
  system?: string
  screenHeight?: number
  screenWidth?: number
  deviceOrientation?: string
  ua?: string
}

// 获取系统信息的函数
function getSystemInfoSync(): SystemInfo {
  const { userAgent, platform } = navigator
  const { width, height } = screen

  // 解析浏览器信息
  const browserInfo = parseBrowserInfo(userAgent)

  // 解析设备和系统信息
  const deviceInfo = parseDeviceInfo(userAgent, platform)

  // 判断设备方向
  const orientation = width > height ? 'landscape' : 'portrait'

  return {
    browserName: browserInfo.name,
    browserVersion: browserInfo.version,
    deviceType: deviceInfo.type,
    platform: platform,
    system: deviceInfo.os,
    screenHeight: height,
    screenWidth: width,
    deviceOrientation: orientation,
    ua: userAgent
  }
}

// 解析浏览器信息
function parseBrowserInfo(ua: string): { name: string; version: string } {
  const browsers = [
    { name: 'Chrome', pattern: /Chrome\/([0-9.]+)/ },
    { name: 'Firefox', pattern: /Firefox\/([0-9.]+)/ },
    { name: 'Safari', pattern: /Version\/([0-9.]+).*Safari/ },
    { name: 'Edge', pattern: /Edg\/([0-9.]+)/ },
    { name: 'IE', pattern: /MSIE ([0-9.]+)/ },
    { name: 'Opera', pattern: /OPR\/([0-9.]+)/ }
  ]

  for (const browser of browsers) {
    const match = ua.match(browser.pattern)
    if (match) {
      return {
        name: browser.name,
        version: match[1]
      }
    }
  }

  return { name: 'Unknown', version: '' }
}

// 解析设备和操作系统信息
function parseDeviceInfo(ua: string, platform: string): { type: string; os: string } {
  let deviceType = 'desktop'
  let os = 'Unknown'

  // 检测设备类型
  if (/Mobile|Android|iPhone|iPad|iPod/.test(ua)) {
    deviceType = 'mobile'
  } else if (/Tablet|iPad/.test(ua)) {
    deviceType = 'tablet'
  }

  // 检测操作系统
  if (/Windows/.test(ua) || platform.includes('Win')) {
    os = 'Windows'
  } else if (/Macintosh|Mac OS X/.test(ua) || platform.includes('Mac')) {
    os = 'macOS'
  } else if (/Linux/.test(ua) || platform.includes('Linux')) {
    os = 'Linux'
  } else if (/Android/.test(ua)) {
    os = 'Android'
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    os = 'iOS'
  }

  return { type: deviceType, os }
}

// 使用示例
const systemInfo = getSystemInfoSync()
console.log(systemInfo)

// 如果需要异步版本，也可以提供
export async function getSystemInfo(): Promise<SystemInfo> {
  return Promise.resolve(getSystemInfoSync())
}
