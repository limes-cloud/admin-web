export interface ExpressionFunction {
  name: string
  signature: string
  description: string
}

export interface ExpressionFunctionGroup {
  title: string
  functions: ExpressionFunction[]
}

export const EXPRESSION_FUNCTION_GROUPS: ExpressionFunctionGroup[] = [
  {
    title: 'Host',
    functions: [
      {
        name: 'req_host_in',
        signature: 'req_host_in("example.com", ...)',
        description: 'Host 精确匹配，忽略大小写。'
      },
      {
        name: 'req_host_suffix_in',
        signature: 'req_host_suffix_in("example.com", ...)',
        description: '匹配域名本身或其子域名。'
      },
      {
        name: 'req_host_port_in',
        signature: 'req_host_port_in("443", ...)',
        description: '按请求 Host 中的端口匹配。'
      }
    ]
  },
  {
    title: 'Path',
    functions: [
      {
        name: 'req_path_in',
        signature: 'req_path_in("/path", ...)',
        description: '路径精确匹配，区分大小写。'
      },
      {
        name: 'req_path_prefix_in',
        signature: 'req_path_prefix_in("/api/", false)',
        description: '路径前缀匹配；第二个参数为 true 时忽略大小写。'
      },
      {
        name: 'req_path_suffix_in',
        signature: 'req_path_suffix_in(".json", false)',
        description: '路径后缀匹配；第二个参数为 true 时忽略大小写。'
      },
      {
        name: 'req_path_contain',
        signature: 'req_path_contain("/old/", false)',
        description: '路径包含匹配；第二个参数为 true 时忽略大小写。'
      }
    ]
  },
  {
    title: 'Method',
    functions: [
      {
        name: 'req_method_in',
        signature: 'req_method_in("GET", "HEAD")',
        description: '请求方法匹配，忽略大小写。'
      }
    ]
  },
  {
    title: 'Header',
    functions: [
      {
        name: 'req_header_key_in',
        signature: 'req_header_key_in("X-Header", ...)',
        description: '请求头名称存在匹配，忽略大小写。'
      },
      {
        name: 'req_header_value_in',
        signature: 'req_header_value_in("X-Header", "value", ...)',
        description: '请求头值精确匹配，可传入多个值。'
      },
      {
        name: 'req_header_value_contain',
        signature: 'req_header_value_contain("User-Agent", "spider", true)',
        description: '请求头值包含匹配；第三个参数为 true 时忽略大小写。'
      },
      {
        name: 'req_header_value_prefix_in',
        signature: 'req_header_value_prefix_in("X-Env", "pro", false)',
        description: '请求头值前缀匹配；第三个参数为 true 时忽略大小写。'
      },
      {
        name: 'req_header_value_suffix_in',
        signature: 'req_header_value_suffix_in("X-Env", "-prod", false)',
        description: '请求头值后缀匹配；第三个参数为 true 时忽略大小写。'
      }
    ]
  },
  {
    title: 'User-Agent',
    functions: [
      {
        name: 'req_ua_contains_any',
        signature: 'req_ua_contains_any("baiduspider", "googlebot")',
        description: 'User-Agent 包含任意一个关键字，忽略大小写。'
      }
    ]
  },
  {
    title: 'Query',
    functions: [
      {
        name: 'req_query_exist',
        signature: 'req_query_exist("from")',
        description: '判断指定 Query 参数是否存在。'
      },
      {
        name: 'req_query_key_in',
        signature: 'req_query_key_in("from", ...)',
        description: 'Query 参数名精确匹配，可传入多个参数名。'
      },
      {
        name: 'req_query_key_prefix_in',
        signature: 'req_query_key_prefix_in("utm_", false)',
        description: 'Query 参数名前缀匹配；第二个参数为 true 时忽略大小写。'
      },
      {
        name: 'req_query_value_in',
        signature: 'req_query_value_in("from", "ad", ...)',
        description: '指定 Query 参数的值精确匹配，可传入多个值。'
      },
      {
        name: 'req_query_value_contain',
        signature: 'req_query_value_contain("from", "ad", false)',
        description: '指定 Query 参数的值包含匹配；第三个参数为 true 时忽略大小写。'
      },
      {
        name: 'req_query_value_prefix_in',
        signature: 'req_query_value_prefix_in("from", "ad", false)',
        description: '指定 Query 参数的值前缀匹配；第三个参数为 true 时忽略大小写。'
      },
      {
        name: 'req_query_value_suffix_in',
        signature: 'req_query_value_suffix_in("from", "ad", false)',
        description: '指定 Query 参数的值后缀匹配；第三个参数为 true 时忽略大小写。'
      }
    ]
  },
  {
    title: 'Cookie',
    functions: [
      {
        name: 'req_cookie_key_in',
        signature: 'req_cookie_key_in("session", ...)',
        description: 'Cookie 名称存在匹配，可传入多个名称。'
      },
      {
        name: 'req_cookie_value_in',
        signature: 'req_cookie_value_in("session", "value", ...)',
        description: '指定 Cookie 的值精确匹配，可传入多个值。'
      }
    ]
  },
  {
    title: 'Network',
    functions: [
      {
        name: 'req_client_ip_in',
        signature: 'req_client_ip_in("1.2.3.4", "10.0.0.0/8")',
        description: '客户端 IP 或 CIDR 网段匹配，可传入多个值。'
      },
      {
        name: 'req_client_ip_range',
        signature: 'req_client_ip_range("10.0.0.0/8", ...)',
        description: '客户端 IP 或 CIDR 网段匹配，可传入多个值。'
      },
      {
        name: 'req_proto_secure',
        signature: 'req_proto_secure()',
        description: '判断请求是否为 HTTPS 等安全协议。'
      }
    ]
  }
]
