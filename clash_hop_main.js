function main(params) {

  // ╔═══════════════════════════════════════════════════╗
  // ║  📝 节点配置区 - 直接粘贴分享链接即可                  ║
  // ╚═══════════════════════════════════════════════════╝

  var MY_VPS_LINKS = [
    {
      link: "ss://xxxxx",
      name: "⛓️ 落地-美国SJC-SS",
    },
    {
      link: "vless://xxxxx",
      name: "⛓️ 落地-美国SJC-VLESS",
    },
    {
      link: "vmess://xxxxx",
      name: "⛓️ 落地-美国AWS-VMess",
    },

    // ── SOCKS5 示例 ──
    // 格式: socks5://user:pass@server:port#名字
    // 格式: socks5://server:port#名字（无认证）
    {
      link: "socks5://user:pwd@xx.com:8361",
      name: "⛓️ 落地-SOCKS5示例",
    },

    // ── HTTP 代理示例 ──
    // 格式: http://user:pass@server:port#名字
    // 格式: https://user:pass@server:port#名字（TLS）
    // 格式: http://server:port#名字（无认证）
    {
      link: "http://user:pwd@xx.com:8361",
      name: "⛓️ 落地-HTTP示例",
    },
    {
      link: "http://user:pwd@xx.com:8361",
      name: "⛓️ 落地-HTTPS示例",
    },
  ];

  // ╔═══════════════════════════════════════════════════╗
  // ║  📝 规则配置区                                     ║
  // ╚═══════════════════════════════════════════════════╝

  var CHAIN_RULES = [
    "DOMAIN-SUFFIX,ippure.com",
  ];

  var EXCLUDE_KEYWORDS = [
    "Traffic", "Expire", "流量", "到期", "剩余", "套餐", "官网", "公告"
  ];

  var FIRST_HOP_NAME = "🛫 第一跳-机场入口";

  var MAIN_GROUP_NAMES = [
    "Proxies", "proxies", "PROXY", "Proxy", "proxy",
    "🚀 节点选择", "节点选择", "♻️ 自动选择", "自动选择",
    "🔰 节点选择", "Select", "select",
  ];


  // ╔═══════════════════════════════════════════════════╗
  // ║  🔧 工具函数（无需修改）                              ║
  // ╚═══════════════════════════════════════════════════╝

  function base64Decode(str) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    var output = "";
    var buffer = 0;
    var bits = 0;
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      if (c === '=') break;
      var idx = chars.indexOf(c);
      if (idx === -1) continue;
      buffer = (buffer << 6) | idx;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        output += String.fromCharCode((buffer >> bits) & 0xFF);
      }
    }
    return output;
  }

  function parseQueryString(qs) {
    var result = {};
    if (!qs) return result;
    var pairs = qs.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var eqIdx = pairs[i].indexOf('=');
      if (eqIdx === -1) {
        result[pairs[i]] = "";
      } else {
        var key = pairs[i].substring(0, eqIdx);
        var val = pairs[i].substring(eqIdx + 1);
        try { val = decodeURIComponent(val); } catch(e) {}
        result[key] = val;
      }
    }
    return result;
  }

  // 通用的 URI 解析：提取 user:pass@host:port
  function parseURI(uri) {
    var result = { user: "", pass: "", server: "", port: 0 };
    var hostport = uri;

    if (uri.indexOf('@') !== -1) {
      var atIdx = uri.indexOf('@');
      var userinfo = uri.substring(0, atIdx);
      hostport = uri.substring(atIdx + 1);
      var colonIdx = userinfo.indexOf(':');
      if (colonIdx !== -1) {
        result.user = userinfo.substring(0, colonIdx);
        result.pass = userinfo.substring(colonIdx + 1);
        try { result.user = decodeURIComponent(result.user); } catch(e) {}
        try { result.pass = decodeURIComponent(result.pass); } catch(e) {}
      } else {
        result.user = userinfo;
        try { result.user = decodeURIComponent(result.user); } catch(e) {}
      }
    }

    var lastColon = hostport.lastIndexOf(':');
    if (lastColon !== -1) {
      result.server = hostport.substring(0, lastColon);
      result.port = parseInt(hostport.substring(lastColon + 1));
    } else {
      result.server = hostport;
    }

    // 去掉 IPv6 方括号
    if (result.server.charAt(0) === '[' && result.server.charAt(result.server.length - 1) === ']') {
      result.server = result.server.substring(1, result.server.length - 1);
    }

    return result;
  }


  // ╔═══════════════════════════════════════════════════╗
  // ║  🔧 链接解析器（无需修改）                            ║
  // ╚═══════════════════════════════════════════════════╝

  function parseSS(link, customName) {
    var uri = link.replace("ss://", "");
    var name = customName || "";

    var hashIdx = uri.indexOf('#');
    if (hashIdx !== -1) {
      if (!name) { try { name = decodeURIComponent(uri.substring(hashIdx + 1)); } catch(e) { name = uri.substring(hashIdx + 1); } }
      uri = uri.substring(0, hashIdx);
    }

    var qIdx = uri.indexOf('?');
    if (qIdx !== -1) uri = uri.substring(0, qIdx);

    var server, port, cipher, password;

    if (uri.indexOf('@') !== -1) {
      var atIdx = uri.indexOf('@');
      var userinfo = uri.substring(0, atIdx);
      var hostport = uri.substring(atIdx + 1);
      var decoded;
      try { decoded = base64Decode(userinfo); } catch(e) { decoded = userinfo; }
      var colonIdx = decoded.indexOf(':');
      cipher = decoded.substring(0, colonIdx);
      password = decoded.substring(colonIdx + 1);
      var lastColon = hostport.lastIndexOf(':');
      server = hostport.substring(0, lastColon);
      port = parseInt(hostport.substring(lastColon + 1));
    } else {
      var decoded2 = base64Decode(uri);
      return parseSS("ss://" + decoded2, customName);
    }

    if (!name) name = "SS-" + server + ":" + port;

    return {
      name: name, type: "ss", server: server, port: port,
      cipher: cipher, password: password, udp: true,
    };
  }

  function parseVless(link, customName) {
    var uri = link.replace("vless://", "");
    var name = customName || "";

    var hashIdx = uri.indexOf('#');
    if (hashIdx !== -1) {
      if (!name) { try { name = decodeURIComponent(uri.substring(hashIdx + 1)); } catch(e) { name = uri.substring(hashIdx + 1); } }
      uri = uri.substring(0, hashIdx);
    }

    var qIdx = uri.indexOf('?');
    var queryStr = "";
    if (qIdx !== -1) {
      queryStr = uri.substring(qIdx + 1);
      uri = uri.substring(0, qIdx);
    }

    var p = parseQueryString(queryStr);

    var atIdx = uri.indexOf('@');
    var uuid = uri.substring(0, atIdx);
    var hostport = uri.substring(atIdx + 1);
    var lastColon = hostport.lastIndexOf(':');
    var server = hostport.substring(0, lastColon);
    var port = parseInt(hostport.substring(lastColon + 1));

    if (!name) name = "VLESS-" + server + ":" + port;

    var node = {
      name: name, type: "vless", server: server, port: port,
      uuid: uuid, network: p.type || "tcp", udp: true,
    };

    var security = p.security || "";
    if (security === "reality") {
      node.tls = true;
      node["reality-opts"] = {};
      if (p.pbk) node["reality-opts"]["public-key"] = p.pbk;
      if (p.sid) node["reality-opts"]["short-id"] = p.sid;
      if (p.spx) node["reality-opts"]["spider-x"] = p.spx;
      if (p.sni) node.servername = p.sni;
      if (p.fp) node["client-fingerprint"] = p.fp;
      node["skip-cert-verify"] = false;
    } else if (security === "tls") {
      node.tls = true;
      if (p.sni) node.servername = p.sni;
      if (p.fp) node["client-fingerprint"] = p.fp;
      if (p.alpn) node.alpn = p.alpn.split(',');
      node["skip-cert-verify"] = false;
    }

    if (node.network === "ws") {
      node["ws-opts"] = {};
      if (p.path) node["ws-opts"].path = p.path;
      if (p.host) node["ws-opts"].headers = { Host: p.host };
    } else if (node.network === "grpc") {
      node["grpc-opts"] = {};
      if (p.serviceName) node["grpc-opts"]["grpc-service-name"] = p.serviceName;
    }

    if (p.flow) node.flow = p.flow;

    return node;
  }

  function parseVmess(link, customName) {
    var encoded = link.replace("vmess://", "");
    var jsonStr = base64Decode(encoded);
    var json = JSON.parse(jsonStr);

    var name = customName || json.ps || ("VMess-" + json.add + ":" + json.port);

    var node = {
      name: name, type: "vmess", server: json.add,
      port: parseInt(json.port), uuid: json.id,
      alterId: parseInt(json.aid) || 0,
      cipher: json.scy || "auto",
      network: json.net || "tcp", udp: true,
    };

    if (json.tls === "tls") {
      node.tls = true;
      if (json.sni) node.servername = json.sni;
      if (json.fp) node["client-fingerprint"] = json.fp;
      if (json.alpn) node.alpn = json.alpn.split(',');
      node["skip-cert-verify"] = (json.insecure === "1");
    }

    if (node.network === "ws") {
      node["ws-opts"] = {};
      if (json.path) node["ws-opts"].path = json.path;
      if (json.host) node["ws-opts"].headers = { Host: json.host };
    } else if (node.network === "grpc") {
      node["grpc-opts"] = {};
      if (json.path) node["grpc-opts"]["grpc-service-name"] = json.path;
    } else if (node.network === "h2") {
      node["h2-opts"] = {};
      if (json.path) node["h2-opts"].path = json.path;
      if (json.host) node["h2-opts"].host = [json.host];
    }

    return node;
  }

  // ── SOCKS5 解析 ──
  // socks5://user:pass@server:port#name
  // socks5://server:port#name
  function parseSocks5(link, customName) {
    var uri = link;
    // 统一去掉协议头
    uri = uri.replace("socks5h://", "").replace("socks5://", "").replace("socks://", "");
    var name = customName || "";

    var hashIdx = uri.indexOf('#');
    if (hashIdx !== -1) {
      if (!name) { try { name = decodeURIComponent(uri.substring(hashIdx + 1)); } catch(e) { name = uri.substring(hashIdx + 1); } }
      uri = uri.substring(0, hashIdx);
    }

    var qIdx = uri.indexOf('?');
    if (qIdx !== -1) uri = uri.substring(0, qIdx);

    var info = parseURI(uri);

    if (!name) name = "SOCKS5-" + info.server + ":" + info.port;

    var node = {
      name: name, type: "socks5", server: info.server,
      port: info.port, udp: true,
    };

    if (info.user) node.username = info.user;
    if (info.pass) node.password = info.pass;

    return node;
  }

  // ── HTTP/HTTPS 代理解析 ──
  // http://user:pass@server:port#name
  // https://user:pass@server:port#name
  function parseHTTP(link, customName) {
    var useTls = false;
    var uri = link;

    if (uri.indexOf("https://") === 0) {
      useTls = true;
      uri = uri.replace("https://", "");
    } else {
      uri = uri.replace("http://", "");
    }

    var name = customName || "";

    var hashIdx = uri.indexOf('#');
    if (hashIdx !== -1) {
      if (!name) { try { name = decodeURIComponent(uri.substring(hashIdx + 1)); } catch(e) { name = uri.substring(hashIdx + 1); } }
      uri = uri.substring(0, hashIdx);
    }

    var qIdx = uri.indexOf('?');
    if (qIdx !== -1) uri = uri.substring(0, qIdx);

    var info = parseURI(uri);

    if (!name) name = "HTTP-" + info.server + ":" + info.port;

    var node = {
      name: name, type: "http", server: info.server,
      port: info.port,
    };

    if (info.user) node.username = info.user;
    if (info.pass) node.password = info.pass;

    if (useTls) {
      node.tls = true;
      node["skip-cert-verify"] = true;
    }

    return node;
  }

  function parseLink(item) {
    try {
      var link = item.link.trim();
      var customName = item.name || "";
      if (link.indexOf("ss://") === 0)                                     return parseSS(link, customName);
      if (link.indexOf("vless://") === 0)                                  return parseVless(link, customName);
      if (link.indexOf("vmess://") === 0)                                  return parseVmess(link, customName);
      if (link.indexOf("socks5://") === 0 || link.indexOf("socks://") === 0 || link.indexOf("socks5h://") === 0) return parseSocks5(link, customName);
      if (link.indexOf("http://") === 0 || link.indexOf("https://") === 0) return parseHTTP(link, customName);
      return null;
    } catch(e) {
      return null;
    }
  }


  // ╔═══════════════════════════════════════════════════╗
  // ║  ⚙️ 主逻辑区（无需修改）                             ║
  // ╚═══════════════════════════════════════════════════╝

  if (!params.proxies) params.proxies = [];
  if (!params['proxy-groups']) params['proxy-groups'] = [];
  if (!params.rules) params.rules = [];

  // 0. 解析所有链接
  var MY_VPS_NODES = [];
  for (var i = 0; i < MY_VPS_LINKS.length; i++) {
    var node = parseLink(MY_VPS_LINKS[i]);
    if (node) MY_VPS_NODES.push(node);
  }

  if (MY_VPS_NODES.length === 0) return params;

  // 1. 自动找主策略组
  function findMainGroup() {
    for (var i = 0; i < MAIN_GROUP_NAMES.length; i++) {
      for (var j = 0; j < params['proxy-groups'].length; j++) {
        if (params['proxy-groups'][j].name === MAIN_GROUP_NAMES[i]) {
          return params['proxy-groups'][j];
        }
      }
    }
    for (var k = 0; k < params['proxy-groups'].length; k++) {
      if (params['proxy-groups'][k].type === "select") return params['proxy-groups'][k];
    }
    return params['proxy-groups'][0] || null;
  }

  var mainGroup = findMainGroup();
  if (!mainGroup) return params;

  // 2. 收集机场节点
  var vpsNames = [];
  for (var i = 0; i < MY_VPS_NODES.length; i++) vpsNames.push(MY_VPS_NODES[i].name);

  var airportNodes = [];
  for (var i = 0; i < params.proxies.length; i++) {
    var pName = params.proxies[i].name;
    var excluded = false;
    for (var j = 0; j < EXCLUDE_KEYWORDS.length; j++) {
      if (pName.indexOf(EXCLUDE_KEYWORDS[j]) !== -1) { excluded = true; break; }
    }
    if (!excluded) {
      var isVps = false;
      for (var k = 0; k < vpsNames.length; k++) {
        if (pName === vpsNames[k]) { isVps = true; break; }
      }
      if (!isVps) airportNodes.push(pName);
    }
  }

  if (airportNodes.length === 0) return params;

  // 3. 创建第一跳组
  params['proxy-groups'].unshift({
    name: FIRST_HOP_NAME,
    type: "select",
    proxies: airportNodes,
  });

  // 4. 注入 VPS 节点
  var chainProxyNames = [];
  for (var i = 0; i < MY_VPS_NODES.length; i++) {
    var newNode = {};
    var src = MY_VPS_NODES[i];
    for (var key in src) {
      if (src.hasOwnProperty(key)) newNode[key] = src[key];
    }
    newNode["dialer-proxy"] = FIRST_HOP_NAME;
    params.proxies.push(newNode);
    chainProxyNames.push(src.name);
  }

  // 5. 注入到主策略组
  if (mainGroup.proxies) {
    for (var i = chainProxyNames.length - 1; i >= 0; i--) {
      var exists = false;
      for (var j = 0; j < mainGroup.proxies.length; j++) {
        if (mainGroup.proxies[j] === chainProxyNames[i]) { exists = true; break; }
      }
      if (!exists) mainGroup.proxies.unshift(chainProxyNames[i]);
    }
  }

  // 6. 插入分流规则
  if (CHAIN_RULES.length > 0 && chainProxyNames.length > 0) {
    var targetProxy = chainProxyNames[0];
    var newRules = [];
    for (var i = 0; i < CHAIN_RULES.length; i++) {
      newRules.push(CHAIN_RULES[i] + "," + targetProxy);
    }
    var merged = [];
    for (var i = 0; i < newRules.length; i++) merged.push(newRules[i]);
    for (var i = 0; i < params.rules.length; i++) merged.push(params.rules[i]);
    params.rules = merged;
  }

  return params;
}
