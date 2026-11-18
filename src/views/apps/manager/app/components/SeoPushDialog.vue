<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="880px"
    align-center
    destroy-on-close
    body-class="seo-push-dialog-body"
    @open="handleOpen"
  >
    <div v-loading="loading" class="seo-dialog">
      <div v-if="currentApp?.domains?.length" class="seo-dialog__domains">
        <div class="seo-dialog__domain-list">
          <span class="seo-dialog__label">绑定域名</span>
          <ElTag v-for="item in currentApp.domains" :key="item.domain" :type="item.isPrimary ? 'primary' : 'info'">
            {{ item.domain }}{{ item.isPrimary ? '（主域名）' : '' }}
          </ElTag>
        </div>
        <ElTag class="seo-dialog__generate" type="primary" effect="plain" round @click="handleInitHTML">
          一键生成 HTML
        </ElTag>
      </div>

      <ElEmpty v-if="!loading && !currentApp?.domains?.length" description="该应用未绑定域名，无法配置 SEO" />

      <template v-else-if="currentApp">
        <ArtForm
          v-model="currentSetting"
          :items="formItems"
          :span="12"
          :gutter="12"
          label-width="118px"
          :loading-submit="saving"
          loading-text="正在保存 SEO 配置..."
          @submit="handleSubmit"
          @cancel="visible = false"
        >
          <template #pushPlatforms>
            <ElSelect
              v-model="selectedPlatformKeys"
              multiple
              collapse-tags
              collapse-tags-tooltip
              filterable
              clearable
              placeholder="请选择要配置的平台"
              class="seo-dialog__platform-select"
            >
              <ElOption
                v-for="platform in platformDefinitions"
                :key="platform.key"
                :label="platform.label"
                :value="platform.key"
              >
                <div class="seo-dialog__platform-option">
                  <span>{{ platform.label }}</span>
                  <span class="seo-dialog__platform-capability">{{ platformCapability(platform) }}</span>
                </div>
              </ElOption>
            </ElSelect>
            <span v-if="!platformDefinitions.length" class="seo-dialog__empty">暂无可配置的推送平台</span>
          </template>
          <template #pushCounters>
            <ElTable v-if="pushCounterRows.length" :data="pushCounterRows" size="small" border max-height="240">
              <ElTableColumn prop="platform" label="推送平台" width="110" />
              <ElTableColumn prop="url" label="URL / 标识" min-width="300" show-overflow-tooltip />
              <ElTableColumn prop="date" label="最近推送日期" width="150" />
              <ElTableColumn prop="count" label="当日次数" width="120" />
            </ElTable>
            <span v-else class="seo-dialog__empty">暂无推送记录</span>
          </template>
          <template v-for="platform in pushablePlatforms" :key="platform.key" #[pushActionSlotName(platform)]>
            <div class="seo-dialog__push-row">
              <ElButton
                size="small"
                type="primary"
                plain
                :loading="pushingPlatform === platform.key"
                :disabled="Boolean(pushingPlatform)"
                @click="handlePush(platform.key)"
              >
                立即推送到 {{ platform.label }}
              </ElButton>
              <span class="seo-dialog__push-tip">使用已保存配置推送首页</span>
            </div>
          </template>
        </ArtForm>
      </template>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessageBox } from 'element-plus'
  import { GetApp, ListSEOPushPlatforms, PushSEO, UpdateApp } from '@/api/manager/app/api'
  import {
    App,
    AppSetting,
    AppSettingSEO,
    AppSettingSEOPush,
    AppSettingSEOPushField,
    AppSettingSEOPushPlatform,
    AppSettingSEOPushPlatformMeta
  } from '@/api/manager/app/type'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import { rurl } from '@/utils/resource/url'

  const props = defineProps<{
    modelValue: boolean
    app?: App
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const loading = ref(false)
  const saving = ref(false)
  const pushingPlatform = ref('')
  const currentApp = ref<App>()
  const savedSEOConfigSignature = ref('')

  const title = computed(() => {
    const name = currentApp.value?.showName || currentApp.value?.name || props.app?.showName || props.app?.name
    return name ? `SEO推送 - ${name}` : 'SEO推送'
  })

  const defaultSEOSetting = (): AppSettingSEO => ({
    enabled: false,
    homeTitle: '',
    description: '',
    keywords: '',
    titleTemplate: '{title} - {site}',
    canonicalDomain: '',
    robots: 'index,follow,max-image-preview:large',
    indexMode: 'home',
    sitemapEnabled: true,
    homeHtml: '',
    contactEmail: '',
    sameAs: [],
    externalLinks: []
  })

  const defaultSEOPushSetting = (): AppSettingSEOPush => ({
    autoPushOnPublish: false,
    platforms: {}
  })

  function normalizeSetting(setting?: AppSetting, definitions: AppSettingSEOPushPlatformMeta[] = []): AppSetting {
    const seo = setting?.seo ?? {}
    const seoPush = setting?.seoPush ?? {}
    const platforms: NonNullable<AppSettingSEOPush['platforms']> = {}
    for (const [key, platform] of Object.entries(seoPush.platforms ?? {})) {
      platforms[key] = {
        ...platform,
        config: { ...(platform.config ?? {}) },
        push: Object.fromEntries(Object.entries(platform.push ?? {}).map(([url, value]) => [url, { ...value }]))
      }
    }
    for (const definition of definitions) {
      const current = platforms[definition.key]
      if (!current) continue
      const config = { ...(current.config ?? {}) }
      for (const field of definition.fields ?? []) {
        if (field.key && config[field.key] === undefined) config[field.key] = ''
      }
      platforms[definition.key] = {
        dailyLimit: current.dailyLimit ?? definition.defaultDailyLimit ?? 0,
        verification: current.verification ?? '',
        config,
        push: { ...(current.push ?? {}) }
      }
    }
    return {
      jwt: {
        secret: setting?.jwt?.secret ?? '',
        expire: setting?.jwt?.expire ?? 3600,
        renewal: setting?.jwt?.renewal ?? 3600,
        uniqueDevice: setting?.jwt?.uniqueDevice ?? true,
        uniquePlatform: setting?.jwt?.uniquePlatform ?? true
      },
      web: { ...(setting?.web ?? {}) },
      modules: [...(setting?.modules ?? [])],
      seo: {
        ...defaultSEOSetting(),
        ...seo,
        sameAs: [...(seo.sameAs ?? [])],
        externalLinks: (seo.externalLinks ?? []).map((item) => ({ ...item }))
      },
      seoPush: {
        ...defaultSEOPushSetting(),
        ...seoPush,
        platforms
      }
    }
  }

  const platformDefinitions = ref<AppSettingSEOPushPlatformMeta[]>([])
  const selectedPlatformKeys = ref<string[]>([])
  const currentSetting = ref<AppSetting>(normalizeSetting())

  const platformLabels = computed<Record<string, string>>(() =>
    Object.fromEntries(platformDefinitions.value.map((platform) => [platform.key, platform.label]))
  )

  const selectedPlatformSet = computed(() => new Set(selectedPlatformKeys.value))
  const pushablePlatforms = computed(() =>
    platformDefinitions.value.filter((platform) => platform.supportsPush && selectedPlatformSet.value.has(platform.key))
  )

  const pushActionSlotName = (platform: AppSettingSEOPushPlatformMeta) => `pushAction.${platform.key}`

  function platformCapability(platform: AppSettingSEOPushPlatformMeta): string {
    if (platform.supportsPush && platform.supportsVerification) return '推送 + 验证'
    if (platform.supportsPush) return '推送'
    if (platform.supportsVerification) return '仅验证'
    return '配置'
  }

  function defaultPlatformSetting(platform: AppSettingSEOPushPlatformMeta): AppSettingSEOPushPlatform {
    const config: Record<string, string> = {}
    for (const field of platform.fields ?? []) {
      if (field.key) config[field.key] = ''
    }
    return {
      dailyLimit: platform.defaultDailyLimit ?? 0,
      verification: '',
      config,
      push: {}
    }
  }

  function fieldFormType(field: AppSettingSEOPushField): string {
    return field.type === 'select' ? 'select' : 'input'
  }

  function fieldFormProps(field: AppSettingSEOPushField): Record<string, any> {
    if (field.type === 'select') {
      return {
        placeholder: field.placeholder || '请选择',
        options: (field.options ?? []).map((option) => ({
          label: option.label || option.value || '',
          value: option.value || ''
        }))
      }
    }
    const props: Record<string, any> = { placeholder: field.placeholder || `请输入${field.label || ''}` }
    if (field.type === 'password' || field.secret) {
      props.type = 'password'
      props.showPassword = true
    } else if (field.type === 'number') {
      props.type = 'number'
    }
    return props
  }

  const formItems = computed(() => {
    const items: FormItem[] = [
      {
        key: 'seo.enabled',
        label: '启用 SEO',
        type: 'select',
        divider: 'SEO 配置',
        span: 24,
        defaultValue: false,
        tip: '开启后，蜘蛛访问首页时由 Manager 直接渲染 HTML；未开启或渲染失败时由 Nginx 回退 SPA',
        props: {
          placeholder: '请选择是否启用 SEO',
          options: [
            { label: '开启', value: true },
            { label: '关闭', value: false }
          ]
        }
      },
      {
        key: 'seo.homeHtml',
        label: '首页 HTML',
        type: 'code',
        span: 24,
        tip: '最终 HTML 会原样返回给蜘蛛；标题、描述、验证码、外链和 JSON-LD 都直接写在 HTML 里',
        props: {
          lang: 'html',
          showFullscreen: true,
          autoFormat: false,
          style: { width: '100%', height: '460px' }
        }
      },
      {
        key: 'pushPlatforms',
        label: '推送平台',
        type: 'input',
        divider: '推送配置',
        span: 24,
        tip: '选中即启用，移除平台即停用；可选平台由后端注册表动态提供'
      },
      {
        key: 'seoPush.autoPushOnPublish',
        label: '自动推送',
        type: 'select',
        span: 24,
        defaultValue: false,
        tip: '预留开关：业务方接入内容发布事件后才会自动推送；当前请使用各平台的立即推送',
        props: {
          options: [
            { label: '开启', value: true },
            { label: '关闭', value: false }
          ]
        }
      }
    ]

    for (const platform of platformDefinitions.value) {
      if (!selectedPlatformSet.value.has(platform.key)) continue
      const divider = platform.label
      const baseKey = `seoPush.platforms.${platform.key}`
      items.push({
        key: `divider.${platform.key}`,
        label: '',
        type: 'input',
        divider,
        dividerOnly: true,
        span: 24
      })
      if (platform.supportsPush) {
        items.push({
          key: `${baseKey}.dailyLimit`,
          label: '每日上限',
          type: 'number',
          span: 12,
          defaultValue: platform.defaultDailyLimit ?? 0,
          tip: '每天最多成功提交的 URL 数量，0 表示不限',
          props: { min: 0, max: 1000000, style: { width: '100%' } }
        })
      }
      if (platform.supportsVerification) {
        items.push({
          key: `${baseKey}.verification`,
          label: platform.verificationLabel || '站点验证',
          type: 'input',
          span: 12,
          tip: platform.description,
          props: { placeholder: platform.verificationPlaceholder || '请输入验证码 content 值' }
        })
      }
      for (const field of platform.fields ?? []) {
        if (!field.key) continue
        items.push({
          key: `${baseKey}.config.${field.key}`,
          label: field.label || field.key,
          type: fieldFormType(field),
          span: field.span || 12,
          tip: field.tip,
          props: fieldFormProps(field)
        })
      }
      if (platform.supportsPush) {
        items.push({
          key: pushActionSlotName(platform),
          label: '立即推送',
          type: 'input',
          span: 24,
          tip: '使用已保存的平台配置推送应用首页'
        })
      }
    }

    items.push({
      key: 'pushCounters',
      label: '推送记录',
      type: 'input',
      divider: '推送记录',
      span: 24,
      tip: '按平台和推送对象记录最近推送日期与当日成功次数'
    })
    return items
  })

  const pushCounterRows = computed(() => {
    const platforms = currentSetting.value.seoPush?.platforms ?? {}
    const rows: Array<{ platform: string; url: string; date: string; count: number }> = []
    for (const [platformKey, platform] of Object.entries(platforms)) {
      if (!selectedPlatformSet.value.has(platformKey)) continue
      for (const [url, counter] of Object.entries(platform.push ?? {})) {
        rows.push({
          platform: platformLabels.value[platformKey] || platformKey,
          url,
          date: counter?.date || '-',
          count: counter?.count || 0
        })
      }
    }
    return rows.sort((a, b) => b.date.localeCompare(a.date))
  })

  const HTML_ESCAPES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }

  const escapeHTML = (value: unknown): string =>
    String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] || char)

  const isFullHTMLDocument = (raw: string): boolean => {
    let value = raw.trim()
    while (value.startsWith('<!--')) {
      const end = value.indexOf('-->')
      if (end < 0) return false
      value = value.slice(end + 3).trim()
    }
    const lower = value.toLowerCase()
    return lower.startsWith('<!doctype') || lower.startsWith('<html')
  }

  type HomeResourceLink = {
    label: string
    url: string
    description?: string
    rel?: string
  }

  const PAN_RESOURCE_LINKS: HomeResourceLink[] = [
    { label: '夸克网盘', url: 'https://pan.quark.cn/', description: '轻量云盘，支持文件备份与在线预览' },
    { label: '百度网盘', url: 'https://pan.baidu.com/', description: '大容量文件存储与分享服务' },
    { label: '阿里云盘', url: 'https://www.alipan.com/', description: '阿里云推出的个人云存储服务' },
    { label: '115', url: 'https://115.com/', description: '个人云存储与文件管理服务' },
    { label: '迅雷云盘', url: 'https://pan.xunlei.com/', description: '迅雷旗下云盘与下载服务' },
    { label: '天翼云盘', url: 'https://cloud.189.cn/', description: '中国电信提供的云存储服务' },
    { label: '移动云盘', url: 'https://yun.139.com/', description: '中国移动提供的云存储服务' }
  ]

  const buildHomeHTML = (item: App, seo: AppSettingSEO, push: AppSettingSEOPush | undefined, bodyHtml = ''): string => {
    const appName = item.showName || item.name || item.keyword || '站点名称'
    const rawDomain =
      seo.canonicalDomain?.trim() ||
      item.domains?.find((row) => row.isPrimary)?.domain ||
      item.domains?.[0]?.domain ||
      ''
    let siteUrl = rawDomain
    if (siteUrl && !/^https?:\/\//i.test(siteUrl)) siteUrl = `https://${siteUrl}`
    if (siteUrl && !siteUrl.endsWith('/')) siteUrl += '/'

    const absoluteUrl = (value: string) => {
      const url = String(value || '').trim()
      if (!url) return ''
      if (/^https?:\/\//i.test(url)) return url
      if (!siteUrl) return url
      try {
        return new URL(url, siteUrl).href
      } catch {
        return url
      }
    }

    const title = seo.homeTitle?.trim() || appName
    const description = seo.description?.trim() || item.description?.trim() || item.comment?.trim() || `${appName} 首页`
    const keywords = seo.keywords?.trim() || ''
    const robots = seo.robots?.trim() || 'index,follow,max-image-preview:large'
    const logoUrl = absoluteUrl(rurl(item.logo || ''))
    const faviconUrl = absoluteUrl(rurl(item.favicon || ''))
    const contactEmail = seo.contactEmail?.trim() || ''
    const verificationTags = platformDefinitions.value.flatMap((platform) => {
      const value = push?.platforms?.[platform.key]?.verification?.trim()
      if (!platform.supportsVerification || !platform.verificationMeta || !value) return []
      return [`<meta name="${escapeHTML(platform.verificationMeta)}" content="${escapeHTML(value)}">`]
    })
    const sameAs = (seo.sameAs ?? []).map((value) => value.trim()).filter(Boolean)
    const configuredLinks = (seo.externalLinks ?? [])
      .filter((link) => link.enabled !== false && Boolean(link.url?.trim()))
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map((link) => ({
        label: link.label?.trim() || link.url?.trim() || '',
        url: link.url?.trim() || '',
        rel: link.rel
      }))
    const appIdentity = `${item.keyword || ''} ${item.name || ''} ${item.showName || ''}`.toLowerCase()
    const isPanSearch = appIdentity.includes('psou') || appIdentity.includes('盘搜')
    const resourceLinkMap = new Map<string, HomeResourceLink>()
    for (const link of [...(isPanSearch ? PAN_RESOURCE_LINKS : []), ...configuredLinks]) {
      const url = link.url.trim()
      if (!/^https?:\/\//i.test(url)) continue
      const key = url.replace(/\/+$/, '').toLowerCase()
      if (!resourceLinkMap.has(key)) resourceLinkMap.set(key, { ...link, url })
    }
    const resourceLinks = [...resourceLinkMap.values()]
    const normalizeRel = (rel?: string) => {
      const tokens = new Set((rel || '').split(/\s+/).filter(Boolean))
      tokens.add('noopener')
      tokens.add('noreferrer')
      return [...tokens].join(' ')
    }
    const hostOf = (url: string) => {
      try {
        return new URL(url).hostname.replace(/^www\./, '')
      } catch {
        return url
      }
    }
    const resourceSection = resourceLinks.length
      ? `<section id="resources" class="panel">
<div class="section-head">
<h2>${isPanSearch ? '常用网盘入口' : '推荐资源'}</h2>
<p>精选官方站点，便于快速访问与延伸阅读。</p>
</div>
<ul class="resource-grid">
${resourceLinks
  .map(
    (link) =>
      `<li><a href="${escapeHTML(link.url)}" target="_blank" rel="${escapeHTML(normalizeRel(link.rel))}" aria-label="访问 ${escapeHTML(link.label)}（新窗口）"><strong>${escapeHTML(link.label)}</strong><span>${escapeHTML(link.description || hostOf(link.url))}</span></a></li>`
  )
  .join('\n')}
</ul>
</section>`
      : ''

    const websiteJsonLd: Record<string, unknown> = {
      '@type': 'WebSite',
      name: appName,
      inLanguage: 'zh-CN'
    }
    if (siteUrl) websiteJsonLd.url = siteUrl
    if (description) websiteJsonLd.description = description
    const organizationJsonLd: Record<string, unknown> = { '@type': 'Organization', name: appName }
    if (siteUrl || logoUrl) {
      if (siteUrl) organizationJsonLd.url = siteUrl
      if (logoUrl) organizationJsonLd.logo = logoUrl
    }
    if (sameAs.length) organizationJsonLd.sameAs = sameAs
    websiteJsonLd.publisher = organizationJsonLd

    const keywordList = keywords
      .split(/[,，]/)
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 8)
    const faqItems = [
      { question: `${appName}是什么？`, answer: description },
      ...(isPanSearch
        ? [
            {
              question: '支持检索哪些网盘资源？',
              answer:
                '首页提供夸克网盘、百度网盘、阿里云盘、115、迅雷云盘、天翼云盘、移动云盘等常用网盘入口，具体可检索范围以站内结果为准。'
            }
          ]
        : []),
      {
        question: '如何开始使用？',
        answer: siteUrl ? `访问 ${siteUrl} 即可开始使用。` : `进入${appName}站点即可开始使用。`
      },
      {
        question: '如何反馈问题或建议？',
        answer: contactEmail
          ? `可以通过 ${contactEmail} 联系站点管理员。`
          : `可以通过${appName}站内公布的联系方式反馈。`
      }
    ]
    const faqSection = `<section id="faq" class="panel faq">
<div class="section-head">
<h2>常见问题</h2>
<p>关于${escapeHTML(appName)}的常见说明。</p>
</div>
${faqItems
  .map((item) => `<details><summary>${escapeHTML(item.question)}</summary><p>${escapeHTML(item.answer)}</p></details>`)
  .join('\n')}
</section>`
    const faqJsonLd = {
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer }
      }))
    }
    const jsonLd: Record<string, unknown> = { '@context': 'https://schema.org', '@graph': [websiteJsonLd, faqJsonLd] }
    const jsonLdText = JSON.stringify(jsonLd).replace(/</g, '\\u003c')

    const homeHref = siteUrl || '/'
    const keywordTags = keywordList.length
      ? `<ul class="tag-list">${keywordList.map((keyword) => `<li>${escapeHTML(keyword)}</li>`).join('')}</ul>`
      : ''
    const introSection = bodyHtml.trim()
      ? `<section id="overview" class="panel legacy-content">\n${bodyHtml.trim()}\n</section>`
      : `<section class="hero">
<p class="eyebrow">${escapeHTML(keywordList.slice(0, 3).join(' · ') || appName)}</p>
<h1>${escapeHTML(title)}</h1>
<p class="lead">${escapeHTML(description)}</p>
<a class="cta" href="${escapeHTML(homeHref)}">进入 ${escapeHTML(appName)}</a>
</section>
<section id="overview" class="panel">
<div class="section-head">
<h2>关于${escapeHTML(appName)}</h2>
<p>${escapeHTML(description)}</p>
</div>
${keywordTags}
</section>`

    const sitemapUrl = siteUrl && seo.sitemapEnabled !== false ? absoluteUrl('/sitemap.xml') : ''
    const headParts = [
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      '<meta name="theme-color" content="#1d4ed8">',
      `<title>${escapeHTML(title)}</title>`,
      `<meta name="description" content="${escapeHTML(description)}">`,
      keywords ? `<meta name="keywords" content="${escapeHTML(keywords)}">` : '',
      `<meta name="robots" content="${escapeHTML(robots)}">`,
      siteUrl ? `<link rel="canonical" href="${escapeHTML(siteUrl)}">` : '',
      sitemapUrl ? `<link rel="sitemap" type="application/xml" href="${escapeHTML(sitemapUrl)}">` : '',
      faviconUrl ? `<link rel="icon" href="${escapeHTML(faviconUrl)}">` : '',
      '<meta property="og:type" content="website">',
      '<meta property="og:locale" content="zh_CN">',
      `<meta property="og:site_name" content="${escapeHTML(appName)}">`,
      `<meta property="og:title" content="${escapeHTML(title)}">`,
      `<meta property="og:description" content="${escapeHTML(description)}">`,
      siteUrl ? `<meta property="og:url" content="${escapeHTML(siteUrl)}">` : '',
      logoUrl ? `<meta property="og:image" content="${escapeHTML(logoUrl)}">` : '',
      logoUrl ? `<meta property="og:image:alt" content="${escapeHTML(appName)}">` : '',
      logoUrl
        ? '<meta name="twitter:card" content="summary_large_image">'
        : '<meta name="twitter:card" content="summary">',
      `<meta name="twitter:title" content="${escapeHTML(title)}">`,
      `<meta name="twitter:description" content="${escapeHTML(description)}">`,
      logoUrl ? `<meta name="twitter:image" content="${escapeHTML(logoUrl)}">` : '',
      ...verificationTags
    ]
      .filter(Boolean)
      .join('\n')

    const brand = logoUrl
      ? `<a href="${escapeHTML(homeHref)}" rel="home"><img src="${escapeHTML(logoUrl)}" alt="${escapeHTML(appName)}"><span>${escapeHTML(appName)}</span></a>`
      : `<a href="${escapeHTML(homeHref)}" rel="home"><span>${escapeHTML(appName)}</span></a>`
    const contact = contactEmail
      ? `<p>联系邮箱：<a href="mailto:${escapeHTML(contactEmail)}">${escapeHTML(contactEmail)}</a></p>`
      : ''
    const currentYear = new Date().getFullYear()
    const scriptClose = '</' + 'script>'

    return `<!doctype html>
<!-- 首页 HTML：由管理端一键生成，标题、描述、外链和结构化数据均为最终内容 -->
<html lang="zh-CN">
<head>
${headParts}
<style>
:root{color-scheme:light;--ink:#172033;--muted:#5f6b7a;--accent:#1d4ed8;--line:#e5eaf2;--bg:#f5f8fc;--card:#fff}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:radial-gradient(circle at 10% 0,#e8f0ff 0,transparent 32rem),var(--bg);color:var(--ink);font:16px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:1040px;margin:0 auto;padding:24px 20px 48px}
.site-header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;padding:8px 0 24px}
.site-header a{display:inline-flex;align-items:center;gap:10px;color:var(--ink);font-size:20px;font-weight:700}
.site-header img{width:34px;height:34px;object-fit:contain;border-radius:9px}
.site-nav{display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center;font-size:14px}
.site-nav a{color:var(--muted)}
.hero{padding:clamp(28px,6vw,64px);border-radius:26px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#fff;box-shadow:0 20px 48px rgba(29,78,216,.18)}
.hero h1{margin:0 0 16px;font-size:clamp(32px,5vw,54px);line-height:1.12}
.hero .lead{max-width:720px;margin:0;color:rgba(255,255,255,.82);font-size:clamp(17px,2vw,20px)}
.eyebrow{margin:0 0 12px;color:#bfdbfe;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.cta{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 22px;margin-top:24px;border-radius:999px;background:#fff;color:var(--accent);font-weight:700}
.panel{padding:clamp(22px,4vw,34px);margin:22px 0;border:1px solid var(--line);border-radius:22px;background:var(--card);box-shadow:0 10px 28px rgba(15,23,42,.04)}
.section-head h2{margin:0 0 8px;font-size:clamp(24px,3vw,32px);line-height:1.25}
.section-head p{margin:0;color:var(--muted)}
.legacy-content>*:first-child{margin-top:0}
.legacy-content>*:last-child{margin-bottom:0}
.legacy-content h1{font-size:clamp(30px,4vw,44px);line-height:1.18}
.legacy-content section{margin:20px 0;padding:0;border:0;background:transparent}
.tag-list{display:flex;flex-wrap:wrap;gap:10px;padding:0;margin:20px 0 0;list-style:none}
.tag-list li{padding:6px 12px;border:1px solid #dbeafe;border-radius:999px;background:#eff6ff;color:#1e40af;font-size:14px}
.resource-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;padding:0;margin:22px 0 0;list-style:none}
.resource-grid a{display:flex;flex-direction:column;gap:4px;min-height:92px;padding:16px 18px;border:1px solid var(--line);border-radius:16px;background:#fbfdff;color:var(--ink);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
.resource-grid a:hover{border-color:#bfdbfe;box-shadow:0 10px 24px rgba(29,78,216,.1);text-decoration:none;transform:translateY(-2px)}
.resource-grid strong{font-size:16px}.resource-grid span{color:var(--muted);font-size:13px}
.faq details{padding:16px 0;border-top:1px solid var(--line)}
.faq details:first-of-type{margin-top:16px}
.faq summary{cursor:pointer;font-weight:700}
.faq details p{margin:10px 0 0;color:var(--muted)}
.site-footer{padding:28px 4px 0;color:var(--muted);font-size:14px}
.site-footer p{margin:6px 0}
@media (max-width:640px){.site-header{align-items:flex-start;flex-direction:column}.hero{border-radius:20px}.panel{border-radius:18px}.site-nav{gap:8px 16px}}
</style>
</head>
<body>
<div class="wrap">
<header class="site-header">
${brand}
<nav class="site-nav" aria-label="主导航">
<a href="#overview">关于</a>
${resourceSection ? '<a href="#resources">资源导航</a>' : ''}
<a href="#faq">常见问题</a>
</nav>
</header>
<main>
${introSection}
${resourceSection}
${faqSection}
</main>
<footer class="site-footer">
${contact}
<p>© ${currentYear} ${escapeHTML(appName)}</p>
</footer>
</div>
<script type="application/ld+json">${jsonLdText}${scriptClose}
</body>
</html>`
  }

  const handleOpen = async () => {
    currentApp.value = undefined
    platformDefinitions.value = []
    selectedPlatformKeys.value = []
    currentSetting.value = normalizeSetting()
    savedSEOConfigSignature.value = ''
    if (!props.app?.id) return

    loading.value = true
    try {
      const [detail, platformReply] = await Promise.all([GetApp({ id: props.app.id }), ListSEOPushPlatforms()])
      platformDefinitions.value = platformReply.list ?? []
      currentApp.value = detail
      currentSetting.value = normalizeSetting(detail.setting, platformDefinitions.value)
      selectedPlatformKeys.value = platformDefinitions.value
        .filter((platform) => Boolean(currentSetting.value.seoPush?.platforms?.[platform.key]))
        .map((platform) => platform.key)
      syncSelectedPlatforms(selectedPlatformKeys.value)
      savedSEOConfigSignature.value = currentSEOConfigSignature()
    } finally {
      loading.value = false
    }
  }

  const handleInitHTML = async () => {
    if (!currentApp.value) return

    const currentHtml = currentSetting.value.seo?.homeHtml?.trim() ?? ''
    if (currentHtml) {
      try {
        await ElMessageBox.confirm('一键生成会覆盖当前 HTML，是否继续？', '温馨提示', {
          confirmButtonText: '继续生成',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch {
        return
      }
    }

    if (!currentSetting.value.seo) currentSetting.value.seo = defaultSEOSetting()
    const bodyHtml = currentHtml && !isFullHTMLDocument(currentHtml) ? currentHtml : ''
    currentSetting.value.seo.homeHtml = buildHomeHTML(
      currentApp.value,
      currentSetting.value.seo,
      currentSetting.value.seoPush,
      bodyHtml
    )
    ElMessage.success('已生成完整 HTML')
  }

  const saveSetting = async (closeAfterSave: boolean): Promise<boolean> => {
    if (!currentApp.value) return false
    if (currentSetting.value.seo?.enabled && !currentSetting.value.seo.homeHtml?.trim()) {
      ElMessage.warning('已启用 SEO，请先填写或一键生成首页 HTML')
      return false
    }
    saving.value = true
    try {
      const latest = await GetApp({ id: currentApp.value.id })
      if (!latest.domains?.length) {
        ElMessage.warning('该应用已解除域名绑定，无法保存 SEO 配置')
        currentApp.value = latest
        return false
      }
      syncSelectedPlatforms(selectedPlatformKeys.value)
      const setting = {
        ...(latest.setting ?? {}),
        seo: clone(currentSetting.value.seo),
        seoPush: clone({
          ...currentSetting.value.seoPush,
          platforms: Object.fromEntries(
            Object.entries(currentSetting.value.seoPush?.platforms ?? {})
              .filter(([key]) => selectedPlatformSet.value.has(key))
              .map(([key, platform]) => [
                key,
                {
                  dailyLimit: platform.dailyLimit ?? 0,
                  verification: platform.verification ?? '',
                  config: platform.config ?? {},
                  push: platform.push ?? {}
                }
              ])
          )
        })
      } as AppSetting
      await UpdateApp({ id: latest.id, setting })
      currentApp.value = { ...latest, setting }
      savedSEOConfigSignature.value = currentSEOConfigSignature()
      ElMessage.success('SEO 配置已保存')
      if (closeAfterSave) visible.value = false
      return true
    } finally {
      saving.value = false
    }
  }

  const handleSubmit = () => saveSetting(true)

  const handlePush = async (platformKey: string) => {
    const app = currentApp.value
    if (!app) return
    syncSelectedPlatforms(selectedPlatformKeys.value)
    if (currentSEOConfigSignature() !== savedSEOConfigSignature.value) {
      if (!(await saveSetting(false))) return
    }
    pushingPlatform.value = platformKey
    try {
      const result = await PushSEO({ id: app.id, platform: platformKey })
      const parts = [`成功 ${result.success || 0} 条`, `无效 ${result.invalid || 0} 条`]
      if (Number(result.remain) >= 0) parts.push(`今日剩余 ${result.remain} 条`)
      if (result.message) parts.push(result.message)
      const text = `推送完成：${parts.join('，')}`
      if ((result.success || 0) > 0) ElMessage.success(text)
      else ElMessage.warning(text)

      const latest = await GetApp({ id: app.id })
      currentApp.value = latest
      currentSetting.value = normalizeSetting(latest.setting, platformDefinitions.value)
      savedSEOConfigSignature.value = currentSEOConfigSignature()
    } finally {
      pushingPlatform.value = ''
    }
  }

  const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? {}))

  function currentSEOConfigSignature(): string {
    const setting = currentSetting.value
    const platforms = Object.fromEntries(
      [...selectedPlatformKeys.value].sort().map((key) => {
        const platform = setting.seoPush?.platforms?.[key]
        return [
          key,
          {
            dailyLimit: platform?.dailyLimit ?? 0,
            verification: platform?.verification ?? '',
            config: Object.fromEntries(
              Object.entries(platform?.config ?? {}).sort(([left], [right]) => left.localeCompare(right))
            )
          }
        ]
      })
    )
    return JSON.stringify({
      seo: setting.seo ?? {},
      autoPushOnPublish: setting.seoPush?.autoPushOnPublish ?? false,
      platforms
    })
  }

  function syncSelectedPlatforms(keys: string[]) {
    const seoPush = currentSetting.value.seoPush
    if (!seoPush) return
    seoPush.platforms ??= {}
    const selected = new Set(keys)
    for (const platform of platformDefinitions.value) {
      if (selected.has(platform.key) && !seoPush.platforms[platform.key]) {
        seoPush.platforms[platform.key] = defaultPlatformSetting(platform)
      }
    }
  }

  watch(selectedPlatformKeys, syncSelectedPlatforms)
</script>

<style lang="scss" scoped>
  .seo-dialog {
    min-height: 160px;
  }

  .seo-dialog__domains {
    display: flex;
    gap: 16px;
    align-items: center;
    padding-bottom: 12px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--art-border-color);
  }

  .seo-dialog__domain-list {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 8px 10px;
    align-items: center;
    min-width: 0;
  }

  .seo-dialog__label {
    font-size: 13px;
    color: var(--art-gray-600);
  }

  .seo-dialog__generate {
    flex-shrink: 0;
    margin-left: auto;
    cursor: pointer;
  }

  .seo-dialog__push-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 10px;
    align-items: center;
  }

  .seo-dialog__push-tip {
    font-size: 12px;
    color: var(--art-gray-500);
  }

  .seo-dialog__empty {
    color: var(--art-gray-500);
  }

  .seo-dialog__platform-select {
    width: 100%;
  }

  .seo-dialog__platform-option {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
  }

  .seo-dialog__platform-capability {
    font-size: 12px;
    color: var(--art-gray-500);
  }

  :global(.seo-push-dialog-body) {
    max-height: 72vh;
    overflow-y: auto;
  }
</style>
