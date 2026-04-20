# PinBase 技术架构文档

## 1. 目标

PinBase 当前阶段的技术架构目标是：

- 简单：开发成本低，目录结构清晰，单人也能顺畅推进
- 健壮：核心逻辑可测试，数据结构稳定，后续增加功能不需要推翻重来
- 适合浏览器插件：优先适配 Chromium 系浏览器扩展场景
- 可持续迭代：后续加 Badge、选项页、分类重命名、同步能力时可以平滑扩展

结论上，最适合当前项目的方案是：

- `Manifest V3`
- `TypeScript`
- `React + Vite`
- `chrome.storage.local` 作为本地持久化
- 轻量状态管理，优先使用 React 自身状态 + service 层，不引入重量级全局状态库
- 样式采用本地 CSS 或 CSS Modules，不依赖运行时 CDN

这套方案的核心原则是：

- UI 层和数据层分离
- 扩展 API 访问统一收口
- 数据模型先定义清楚，再做页面
- 只引入真正必要的依赖

## 2. 为什么选这套方案

### 2.1 不选“纯静态 HTML 拼页面”

纯 HTML 页面适合快速看视觉，但不适合作为正式工程方案，因为：

- 页面状态一多，维护成本会迅速上升
- 弹窗、列表、表单、分类筛选之间会出现大量重复 DOM 逻辑
- 后面接插件 API、存储、快捷键、Badge 时会变乱

所以静态 HTML 适合做预览，不适合做正式实现。

### 2.2 不选“过重的工程栈”

当前项目是一个本地收藏类工具插件，不需要：

- Next.js
- 服务端渲染
- 数据库
- 重型状态库
- 微前端

这些会让项目复杂度明显高于收益。

### 2.3 选择 `React + TypeScript + Vite`

原因如下：

- React 足够成熟，适合拆分卡片、分类栏、弹窗、表单等组件
- TypeScript 可以提前约束网站数据、分类数据、存储接口，减少后期出错
- Vite 构建快，配置简单，适合插件弹窗和内容脚本构建
- 生态成熟，后面接扩展打包工具也方便

## 3. 技术选型

### 3.1 前端框架

- `React 18`
- `TypeScript`

说明：

- React 负责 popup、options 页等 UI 渲染
- TypeScript 负责业务模型和扩展 API 封装

### 3.2 构建工具

- `Vite`

说明：

- 启动快
- 构建插件多入口页面方便
- 配置量相对少

### 3.3 浏览器扩展规范

- `Manifest V3`

说明：

- Chromium 新扩展标准
- 支持 service worker 后台逻辑
- 更适合后续接 Badge、快捷键、页面状态监听

### 3.4 样式方案

推荐：

- `CSS Modules` 或普通本地 CSS 文件
- 使用 CSS Variables 管理主题色

不推荐：

- 运行时 CDN Tailwind
- 依赖外网字体和外网图标

原因：

- 插件环境对外部资源依赖越少越稳
- 后续打包、上架、离线调试都更省心

### 3.5 数据持久化

- `chrome.storage.local`

原因：

- 完全符合当前“本地使用、无账号、无云同步”的产品定位
- API 简单
- 容量对当前 MVP 足够

### 3.6 测试

推荐：

- `Vitest` 做单元测试
- `React Testing Library` 做组件行为测试

当前阶段至少要覆盖：

- URL normalize
- 数据存取
- 分类删除后的兜底逻辑
- 去重逻辑

## 4. 整体架构

推荐采用四层结构：

1. UI 层
2. 应用层
3. 领域层
4. 基础设施层

### 4.1 UI 层

负责：

- Popup 页面展示
- 添加网站弹窗
- 分类切换
- 卡片列表展示
- 表单交互

只做：

- 接收状态
- 触发事件
- 渲染界面

不直接做：

- 存储读写
- URL normalize
- 分类兜底
- Badge 更新逻辑

### 4.2 应用层

负责：

- 协调页面动作与业务逻辑
- 组织“添加网站”“删除网站”“查询网站”等用例
- 把 UI 事件转成明确的业务操作

典型用例：

- `addCurrentSite()`
- `searchSites(keyword)`
- `filterSitesByCategory(category)`
- `deleteSite(siteId)`
- `undoDelete(siteSnapshot)`

### 4.3 领域层

负责：

- 网站数据模型定义
- 分类数据模型定义
- URL normalize 规则
- 去重规则
- 排序规则
- 边界约束

这是项目最重要的一层，因为它决定数据是否稳定。

### 4.4 基础设施层

负责：

- `chrome.storage.local` 读写
- Chrome Tabs API 调用
- Commands API 快捷键
- Action Badge 更新
- 浏览器事件监听

这层统一封装浏览器 API，避免 UI 或业务层到处直接调用 `chrome.*`

## 5. 页面与运行模块划分

当前建议拆成这几个运行模块：

### 5.1 Popup

用途：

- 主面板 UI
- 搜索
- 分类筛选
- 网站卡片展示
- 打开添加网站弹窗

特点：

- 用户高频使用入口
- 重点放在交互效率和渲染速度

### 5.2 Background Service Worker

用途：

- 监听快捷键
- 获取当前标签页信息
- 写入收藏数据
- 更新 Badge
- 响应页面切换事件

说明：

- 这是插件的后台协调中心
- 不做复杂 UI，只做事件与数据协调

### 5.3 Options Page

当前阶段：

- 可以暂不做

后续可承载：

- 快捷键说明
- 数据导入导出
- 分类高级管理
- 调试信息

### 5.4 Shared Core

用途：

- Popup 和 Background 共用的业务逻辑与数据模型

例如：

- `normalizeUrl`
- `isDuplicateSite`
- `siteSchema`
- `categoryRules`

## 6. 推荐目录结构

```text
project-root/
  docs/
    design-doccument.md
    tech-document.md
  public/
    manifest.json
    icons/
  src/
    app/
      popup/
        PopupApp.tsx
        pages/
        components/
      options/
        OptionsApp.tsx
      background/
        index.ts
    components/
      SiteCard/
      CategoryNav/
      AddSiteDialog/
      SearchBar/
    domain/
      models/
        site.ts
        category.ts
      rules/
        normalize-url.ts
        site-sort.ts
        category-rules.ts
    application/
      use-cases/
        add-site.ts
        delete-site.ts
        query-sites.ts
        update-badge.ts
    infrastructure/
      chrome/
        storage.ts
        tabs.ts
        badge.ts
        commands.ts
      repositories/
        site-repository.ts
        category-repository.ts
    hooks/
    styles/
      tokens.css
      global.css
    types/
    utils/
    main-popup.tsx
    main-options.tsx
  tests/
    unit/
    integration/
  package.json
  tsconfig.json
  vite.config.ts
```

## 7. 数据模型设计

### 7.1 Site

```ts
export interface SiteItem {
  id: string;
  title: string;
  url: string;
  normalizedUrl: string;
  categories: string[];
  note: string;
  createdAt: number;
  lastOpenedAt: number;
}
```

约束：

- `id` 使用 UUID
- `title` 必填，最大 100 字符
- `url` 必填
- `normalizedUrl` 必填，用于去重
- `categories` 至少有一个值
- 如果分类为空，自动归入 `其他`
- `note` 可为空，最大 200 字符

### 7.2 Category

```ts
export interface CategoryItem {
  name: string;
  builtIn: boolean;
  createdAt: number;
}
```

约束：

- `name` 唯一
- 最大 20 字符
- `其他` 为系统保底分类，`builtIn = true`
- 内置分类默认不可删除，至少 `其他` 不可删除

### 7.3 Storage Shape

推荐直接使用对象存储：

```ts
export interface PinBaseStorage {
  sites: SiteItem[];
  categories: CategoryItem[];
  ui: {
    lastSelectedCategory: string;
  };
}
```

说明：

- 小体量项目直接整体存储即可，简单且好维护
- 当前不需要为了性能过早做复杂索引
- 当数据规模明显扩大，再考虑索引结构

## 8. 关键技术决策

### 8.1 为什么不引入 Zustand / Redux

当前阶段不需要。

理由：

- Popup 页面状态范围小
- 主要数据源在 `chrome.storage.local`
- 复杂状态主要是“查询结果”和“弹窗开关”，React 自带状态足够

推荐方式：

- 服务层负责异步数据
- 页面组件负责局部 UI 状态
- 公共状态仅在必要时抽成 Context

### 8.2 为什么不直接把逻辑写进组件

如果把：

- storage 读写
- normalize
- 去重
- 分类兜底
- 删除撤销

都写进组件里，后面会很难维护。

所以必须把这些逻辑抽到：

- `domain`
- `application`
- `infrastructure`

组件只负责“显示”和“触发事件”。

### 8.3 为什么不依赖外部 CDN

插件项目最好避免依赖：

- CDN Tailwind
- Google Fonts
- 远程图标库

原因：

- 插件环境受 CSP 影响
- 离线调试和本地开发不稳定
- 后面上架审核时也更容易踩坑

推荐做法：

- 样式本地打包
- 字体先用系统字体栈
- 图标优先使用本地 SVG 或内置简化图标

## 9. 业务流程设计

### 9.1 添加当前网站

流程：

1. Background 获取当前 tab 信息
2. 应用层生成 `SiteItem`
3. 领域层执行 `normalizeUrl`
4. 仓储层检查是否重复
5. 若重复，返回“已收录”
6. 若不重复，写入 storage
7. UI 展示 Toast
8. Background 触发 Badge 更新

### 9.2 删除网站

流程：

1. UI 触发删除
2. 应用层先从内存状态中移除
3. 保存被删除对象快照
4. 写入 storage
5. 弹出带撤销的 Toast
6. 若用户点击撤销，则重新写回 storage

### 9.3 更新 Badge

流程：

1. 监听标签页切换或 URL 变化
2. 获取当前页面 URL
3. 执行 normalize
4. 在已存网站中匹配 `normalizedUrl`
5. 命中则显示 Badge
6. 未命中则清除 Badge

## 10. Manifest 设计建议

推荐包含：

- `action`
- `background.service_worker`
- `permissions`
  - `storage`
  - `tabs`
  - `activeTab`
- `commands`
- `icons`

后续如果 Badge 逻辑依赖更明确，也可加入：

- `host_permissions`

但当前 MVP 尽量按最小权限原则申请。

## 11. 错误处理策略

### 11.1 用户可见错误

统一通过 Toast 呈现：

- 该网站已收录
- 保存失败，请重试
- 当前页面无法收藏
- 分类已存在
- 没有找到匹配的网站

### 11.2 开发期错误

推荐统一封装一个轻量日志工具：

- 开发环境 `console.error`
- 生产环境只记录必要错误，不向用户暴露技术细节

### 11.3 存储写入失败

处理原则：

- 不让 UI 卡死
- 给用户明确反馈
- 保持当前状态可重试

## 12. 测试策略

优先级从高到低：

### 12.1 必测

- URL normalize
- URL 去重
- 删除分类后网站自动归类到“其他”
- 删除与撤销
- 添加当前网站

### 12.2 次优先级

- 搜索逻辑
- 分类筛选
- Badge 更新逻辑

### 12.3 UI 验证

至少验证：

- 主面板正常渲染
- 添加网站弹窗交互正常
- 空状态正常显示
- 搜索无结果状态正常显示

## 13. 开发阶段建议

推荐分三期推进。

### 第一期：可用 MVP

完成：

- Popup 主界面
- 添加网站弹窗
- 本地存储
- 搜索
- 分类筛选
- 删除与撤销
- 快捷键添加

### 第二期：插件能力完善

完成：

- Badge
- 页面切换监听
- 分类管理完善
- 选项页基础设置

### 第三期：工程质量提升

完成：

- 单元测试
- 组件测试
- 数据导入导出
- 更完善的错误处理

## 14. 最终推荐结论

PinBase 当前最适合的正式技术架构是：

- 前端：`React + TypeScript`
- 构建：`Vite`
- 扩展规范：`Manifest V3`
- 存储：`chrome.storage.local`
- 状态管理：`React State + Service 层`，不额外引入重状态库
- 样式：`CSS Modules / 本地 CSS + CSS Variables`
- 测试：`Vitest + React Testing Library`

这套方案的优点是：

- 足够简单，适合当前项目体量
- 足够稳定，后续扩展空间也够
- 工程边界清晰，不容易写成一坨
- 从静态预览页平滑过渡到正式开发实现

如果你下一步愿意，我可以继续直接帮你做两件事中的一个：

1. 基于这份技术文档，继续生成一版推荐的项目目录脚手架
2. 直接把项目初始化成 `Vite + React + TypeScript + Manifest V3` 的可运行插件骨架
