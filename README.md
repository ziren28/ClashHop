# ⛓️ ClashHop 代理链配置生成器

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Zero Dependency](https://img.shields.io/badge/Dependencies-0-success?style=for-the-badge)

**纯前端单文件 · 开箱即用的 Clash 链式代理配置生成工具**

*将机场入口节点与你的私人 VPS 落地节点无缝拼接，一键生成 Clash Meta 预处理脚本*

</div>

---

## 📖 目录

- [项目简介](#-项目简介)
- [核心特性](#-核心特性)
- [支持协议](#-支持协议)
- [使用指南](#-使用指南)
- [生成的脚本原理](#-生成的脚本原理)
- [部署与运行](#-部署与运行)

---

## 💡 项目简介

**ClashHop** 是一个轻量级的纯前端工具，专为解决手动编写 Clash 链式代理（Relay）配置繁琐易错的问题而生。

通过该工具，你可以直接在浏览器中粘贴你的 VPS 节点分享链接，它会自动解析并生成一段**标准的 Clash Meta JavaScript 预处理脚本**。将这段脚本放入你的 Clash 配置中，即可自动让流量先经过机场节点（第一跳），再通过你的 VPS（落地节点）发出。

> **完美适用场景：**
> * 希望使用机场的优质线路转发流量，但要求最终出口 IP 是自己干净的海外 VPS。
> * 需要指定特定域名的流量强制走自己的落地节点。

---

## ✨ 核心特性

本项目采用 **纯 Vanilla JS + HTML + CSS** 编写，没有任何复杂的构建工具链（如 Webpack/Vite）或庞大的框架（如 Vue/React），主打极致轻量与安全。

* 📦 **单文件运行：** 只有一个 HTML 文件，双击即可在任意浏览器打开使用。
* 🔒 **绝对安全：** 所有解析与代码生成都在本地浏览器完成，数据保存在本地 `localStorage`，零网络请求。
* 📋 **智能解析：** 支持直接粘贴分享链接（或 Base64 编码的链接）进行一键快速添加。
* 🔀 **规则分流：** 内置链路分流规则配置，指定域名流量强制走代理链。
* 🖱️ **体验流畅：** 支持节点拖拽排序、一键批量导入、节点快捷编辑与删除。
* 🌗 **自适应 UI：** 沉浸式深色模式设计，附带背景光效与流畅的 Toast 动画交互。

---

## 🔌 支持协议

支持直接解析以下协议的标准分享链接或带密码的 URI：

| 协议格式 | 链接示例 |
|:---|:---|
| **Shadowsocks** | `ss://base64_string#name` |
| **VLESS** | `vless://uuid@server:port?type=tcp&security=reality...#name` |
| **VMess** | `vmess://base64_json` |
| **SOCKS5** | `socks5://user:pass@server:port#name` <br> `socks5://server:port#name` |
| **HTTP / HTTPS** | `http://user:pass@server:port#name` <br> `https://server:port#name` |

---

## 📘 使用指南

### 1. 添加落地节点
1. 在“快速添加”输入框中，粘贴你的 VPS 节点分享链接（支持 `ss://`, `vless://`, `vmess://` 等）。
2. 可选填一个易于识别的“自定义名称”（例如：`⛓️ 落地-美西`）。
3. 点击 **「✚ 添加」**，或直接按回车键。
4. （进阶）点击 **「📋 批量导入」** 可一次性粘贴多个链接，每行一个。

### 2. 配置分流规则（可选）
如果你只希望特定网站（如 ChatGPT、Netflix）走你的私人 VPS，在“链路分流规则”区添加匹配规则：
* 例如：`DOMAIN-SUFFIX,openai.com`
* 例如：`DOMAIN-KEYWORD,netflix`

### 3. 高级设置（根据机场订阅调整）
* **第一跳策略组名称：** 自动生成的机场节点集合组名，默认为 `🛫 第一跳-机场入口`。
* **排除关键词：** 自动过滤订阅中的冗余节点（如包含“剩余流量”、“官网”的节点）。
* **主策略组名称匹配：** 脚本会自动寻找你的 Clash 配置文件中的主代理组（如 `Proxies`, `节点选择`），并将生成的代理链注入其中。如果你的主策略组名字很特殊，请在这里添加。

### 4. 生成并应用
1. 点击底部的 **「⚡ 生成 Clash 预处理脚本」**。
2. 点击代码框右上角的 **「📋 复制」**。
3. 将复制的代码粘贴到你的 Clash Meta / 订阅转换器的预处理脚本 (`script`) 区域中。

---

## ⚙️ 生成的脚本原理

ClashHop 生成的是 JavaScript 代码。当你的客户端加载该配置时，引擎会执行以下逻辑：

1.  **解析注入**：将你在网页端配置的 VPS 节点注入到 `proxies` 列表中。
2.  **清洗数据**：根据排除关键词过滤机场的无用节点，提取出真正可用的“机场节点”。
3.  **构建第一跳**：创建一个包含所有机场节点的 `select` 策略组（作为第一跳）。
4.  **串联链路**：利用 Clash Meta 的 `dialer-proxy` 属性，将你的 VPS 节点的出站流量强行指向“第一跳”策略组，形成代理链：`本机 -> 机场节点 -> 你的VPS -> 目标网站`。
5.  **规则接管**：将你配置的分流规则插入到原有规则的最前面，确保精准路由。

---

## 🚀 部署与运行

由于项目是**零依赖**的单文件，你可以选择任意一种方式运行：

### 方式一：本地直接打开（推荐）
将仓库代码克隆或下载到本地，双击目录下的 `index.html` 即可在浏览器中愉快使用。

### 方式二：静态托管
将 `index.html` 上传到任何支持静态页面的服务即可，例如：
* GitHub Pages
* Cloudflare Pages
* Vercel / Netlify
* 你的私人 Nginx / Apache 服务器
