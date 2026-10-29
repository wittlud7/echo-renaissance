# 运行与部署边界

## 本机运行

使用 Node.js 24 的较新补丁版本：

```sh
npm ci
npm run db:local
npm run dev -- --port 5182
```

打开 `http://127.0.0.1:5182/echo/#atelier`。

`db:local` 使用 Cloudflare Wrangler 的本地 D1 模拟器，只应用尚未执行的迁移，数据保存在 `.wrangler/state`。配置中的 UUID 为固定的本地占位符，不是线上数据库 ID。不需要 Cloudflare 账号或 API token。命令行为参考 [官方 D1 migrations 文档](https://developers.cloudflare.com/d1/wrangler-commands/#d1-migrations-apply)。

开发服务器提供仅限回环地址的模拟登录。它用于验证个人空间、同步与公开作品流程，不代表生产身份认证。首次运行时没有任何人的真实数据；SQLite、账号令牌和浏览器存储都不在仓库中。

## 技术组成

- 前端：`public/echo/` 的原生 JavaScript、CSS、SVG 与历史图像。
- 服务端：Vinext / React / Next 风格路由，运行于 Cloudflare Workers。
- 数据：D1，Drizzle 管理迁移；保存前校验格式，按账号隔离，版本冲突需要合并。
- 私密与公开：个人 vault 保存札记、回忆与草稿；公开作品单独生成白名单快照。
- 导入：浏览器解析 XLSX/CSV；NeoDB 可通过正式只读 OAuth 导入。

## 生产部署

当前线上实例使用 Sites 的可信身份入口。`app/chatgpt-auth.ts` 读取由可信入口注入的身份头，因此**构建成功不等于可以把 Worker 直接放到任意公开地址使用**。自行部署时必须提供等效的身份验证入口：阻止客户端伪造身份头，验证实际登录身份，并为 D1 配置自己的生产数据库。

此源码副本已经移除原站点的 `project_id`，不能用于覆盖原站点。若要部署到新的 Sites 项目，先注册自己的站点，再在 `.openai/hosting.json` 中配置其身份；不要复用示例站点的数据库或账号资源。

GitHub Actions 只执行检查与构建，不会发布网站或修改线上数据。

## 验证

```sh
npm run check
npm test
npm run typecheck
npm run build
```

29 项自动测试覆盖导航归属与旧链接兼容、关联、导入、创作来源、风格、账号隔离、同步冲突、分块存储、OAuth 协议与公开快照边界。NeoDB 真人授权和真实用户留存仍需实际验证。当前不是微信小程序。
