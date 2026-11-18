// 节点插件 spec 示例（新建插件时开发抽屉的初始内容）：config 与普通节点的配置相同

/** api 插件示例：上传图片（multipart）；file / dir 由使用插件的节点填写 */
export const API_SPEC_SAMPLE = {
  type: 'api',
  config: {
    method: 'POST',
    url: 'http://resource-svc/api/upload',
    header: { 'X-Upload-From': 'cron-${run.app}' },
    requestType: 'multipart',
    files: ['file'],
    input: { file: '', dir: 'default' },
    responseCondition: 'response.code == 200',
    errorMsg: '${response.msg}',
    output: { url: '${response.data.url}', id: '${response.data.id}' },
    timeout: 30,
    retry: [{ errors: ['Chain.Network', 'Chain.File'], maxAttempts: 2 }]
  }
}
