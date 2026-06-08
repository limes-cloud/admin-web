const STORAGE_KEY = 'dev_proxy_rules'

export interface ProxyRule {
  id: string
  prefix: string
  host: string
  enabled: boolean
  remark?: string
}

export function getProxyRules(): ProxyRule[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveProxyRules(rules: ProxyRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
}

export function matchProxyHost(url: string): string | null {
  const rules = getProxyRules()
  for (const rule of rules) {
    if (rule.enabled && url.startsWith(rule.prefix)) {
      return rule.host.replace(/\/$/, '')
    }
  }
  return null
}
