# AI 热点新闻网站设计

日期：2026-06-10

## 目标

构建并上线一个 AI 热点新闻链接聚合网站，采用半自动化的编辑工作流。

第一版以全球 AI 产品和模型动态为主分类，以 AI 工具推荐为次分类。公开用户阅读精选新闻。管理员负责管理来源、抓取候选链接、审核候选内容，并发布选中的条目。

## 已确认决策

- 框架：使用 Next.js App Router。
- 部署：使用 Vercel。
- 数据库：使用 Neon Postgres，第一版从免费计划开始。
- ORM：使用 Drizzle ORM。
- 认证：使用 Auth.js / NextAuth 的 Credentials provider 实现管理员登录。
- 内容工作流：半自动聚合，发布前由管理员审核。
- 来源管理：管理员可以添加、编辑、启用和停用来源。
- 第一版内容来源：优先支持 RSS 和 Atom feed；后续只针对少量指定来源补充简单页面解析。

## 范围

### 第一版范围内

- 公开 AI 新闻网站。
- 仅管理员可用的来源管理。
- RSS/Atom 候选内容抓取。
- 候选内容审核和发布工作流。
- 已发布文章管理。
- 分类和标签筛选。
- 已发布文章搜索。
- Vercel 部署。
- Neon 数据库 schema 和迁移。
- 管理后台手动触发抓取。
- 由 secret 保护的 Cron 兼容抓取接口。

### 第一版范围外

- 公开用户账号。
- 访客提交来源。
- 全自动发布。
- 复杂网页爬虫。
- 将 AI 生成摘要作为必需依赖。
- 邮件 newsletter。
- 个性化信息流。
- 付费订阅。
- 实时热榜。

AI 摘要和自动打标签可以后续加入。第一版必须在没有配置 AI API key 的情况下也能完整运行。

## 产品结构

### 公开站点

公开站点展示精选 AI 新闻。即使部分原文外链在中国大陆访问困难，站内内容也应保持可读和有价值。

页面：

- `/`：最新已发布文章、精选文章和分类入口。
- `/category/models`：全球 AI 产品和模型动态。
- `/category/tools`：AI 工具推荐。
- `/sources`：本站使用中的活跃来源。
- `/search`：对已发布文章进行关键词搜索。
- `/article/[slug]`：文章详情页，包含摘要、来源、原文链接、标签、分类和发布时间。

文章卡片展示：

- 标题。
- 简短摘要。
- 来源名称。
- 原文链接。
- 发布时间。
- 分类。
- 标签。
- 精选状态，如果适用。

### 管理员区域

管理员区域由认证和权限检查保护。

页面：

- `/admin`：后台概览，展示来源健康状态、候选数量、近期发布和最近抓取结果。
- `/admin/sources`：添加、编辑、启用、停用和测试来源。
- `/admin/candidates`：审核抓取到的候选新闻；支持发布、忽略或编辑候选项。
- `/admin/articles`：编辑、下架、精选或删除已发布文章。
- `/admin/settings`：基础管理员和抓取设置。

只有配置好的管理员可以访问这些页面。第一版使用环境变量保存单个管理员邮箱和密码哈希。

## 架构

应用是一个部署到 Vercel 的单体 Next.js 项目。

主要组件：

- Next.js App Router：负责公开页面、后台页面、route handlers 和 server actions。
- Neon Postgres：负责持久化数据。
- Drizzle ORM：负责 schema、迁移和类型安全查询。
- Auth.js / NextAuth：负责管理员认证。
- RSS/Atom 抓取服务：负责抓取来源 feed。
- Vercel Cron 兼容 route：负责定时抓取。

数据流：

1. 管理员添加来源。
2. 管理员手动触发抓取，或由 Vercel Cron 调用抓取 route。
3. 抓取服务读取已启用来源。
4. 服务抓取 RSS/Atom feed。
5. Feed 条目被标准化为候选记录。
6. 候选条目通过规范化 URL hash 去重。
7. 管理员审核候选内容。
8. 通过审核的候选内容转为已发布文章。
9. 公开页面只读取已发布文章。

## 数据模型

### `sources`

保存管理员维护的新闻来源。

字段：

- `id`
- `name`
- `homepage_url`
- `feed_url`
- `category`
- `enabled`
- `last_fetched_at`
- `last_fetch_status`
- `last_fetch_error`
- `created_at`
- `updated_at`

### `candidates`

保存已抓取但尚未发布的新闻条目。

字段：

- `id`
- `source_id`
- `title`
- `url`
- `canonical_url_hash`
- `summary`
- `published_at`
- `fetched_at`
- `status`
- `raw_payload`
- `created_at`
- `updated_at`

候选状态：

- `new`
- `published`
- `ignored`

唯一约束基于 `canonical_url_hash`。

### `articles`

保存已发布的公开文章。

字段：

- `id`
- `candidate_id`
- `source_id`
- `slug`
- `title`
- `summary`
- `url`
- `category`
- `status`
- `featured`
- `published_at`
- `created_at`
- `updated_at`

文章状态：

- `published`
- `draft`
- `archived`

公开页面只展示 `published` 状态的文章。

### `tags` and `article_tags`

保存可复用标签，以及文章和标签之间的多对多关系。

因为筛选和搜索是公开体验的一部分，第一版可以使用规范化的标签表。

## 抓取和去重

RSS/Atom 是主要抓取方式。

抓取服务必须：

- 只抓取已启用来源。
- 解析常见 RSS 和 Atom 格式。
- 标准化链接、标题、摘要和日期。
- 当某个来源失败时，继续处理其他来源。
- 保存每个来源的抓取状态和错误信息。
- 通过规范化 URL hash 对条目去重。

规范化 URL 的处理规则：

- 去除首尾空白。
- 只在成本低且安全的情况下解析重定向。
- 移除 `utm_*` 等常见追踪参数。
- 在 hash 前对 URL 进行标准化。

第一版不需要基于标题相似度的去重。

## 认证和授权

Auth.js / NextAuth 使用 Credentials provider 和 JWT sessions 处理管理员登录。

授权规则：

- 只有 `ADMIN_EMAIL` 中配置的邮箱可以登录。
- 提交的密码会与 `ADMIN_PASSWORD_HASH` 校验。
- 管理后台页面检查服务端 session。
- 管理后台写操作检查服务端 session。
- Cron 抓取使用 `CRON_SECRET`。
- 数据库凭据和 secret 保存在 Vercel 环境变量中。

公开站点不需要认证。

第一版不包含公开用户，也不包含数据库驱动的用户管理系统。后续可以通过把管理员记录迁移到数据库，或切换到 OAuth provider 来支持多管理员。

## 错误处理

抓取失败需要对管理员可见，但不能中断整批抓取。

规则：

- 某个来源失败不会阻止其他来源继续处理。
- 每个来源保存最近一次抓取状态和错误信息。
- 候选内容创建错误会被记录，并展示在后台抓取结果中。
- Cron endpoint 返回已处理、已创建、已跳过和失败来源的汇总。
- 如果没有已发布文章，公开页面展示正常空状态。

## 部署

项目部署到 Vercel。

必需环境变量：

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `CRON_SECRET`

部署步骤：

1. 创建 Neon Postgres 项目。
2. 将 Neon 连接串以 `DATABASE_URL` 的形式添加到 Vercel。
3. 配置 Auth.js secret、管理员邮箱和管理员密码哈希。
4. 运行数据库迁移。
5. 将 Next.js 应用部署到 Vercel。
6. 配置自定义域名。
7. 为受保护的抓取 route 配置 Vercel Cron。

Neon Free 适合第一版使用。当存储接近免费额度、CU-hour 使用量经常接近免费额度、公开访问量稳定增长，或需要更强生产保障时再升级。

## 测试

第一版测试重点覆盖核心编辑闭环。

必需覆盖：

- RSS/Atom 解析器可以处理常见有效 feed。
- feed 字段缺失时抓取流程不会崩溃。
- URL 规范化可以对重复链接去重。
- 非管理员不能访问后台 route 或写操作。
- 候选内容发布后可以创建公开文章。
- 公开文章查询只返回已发布文章。
- 某个来源失败不会阻止其他来源继续抓取。

手动验证：

- 添加来源。
- 触发抓取。
- 审核候选内容。
- 发布一篇文章。
- 确认文章出现在公开站点。
- 确认被忽略的候选内容保持隐藏。

## 后续增强

- AI 生成摘要。
- AI 标签建议。
- 带审核的访客来源提交。
- Newsletter 摘要。
- 热度评分。
- 多语言摘要。
- 使用标题相似度的更高级去重。
- 来源可靠性评分。
- 如果中国大陆访问成为硬性要求，增加 Cloudflare 或中国大陆托管策略。
