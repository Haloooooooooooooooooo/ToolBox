# PinBase 技术文档

## 1. 目标

PinBase 当前阶段的技术目标是：

- 简单：单人也能持续推进，目录结构清晰
- 健壮：核心逻辑可测试，数据结构稳定
- 适合扩展：适配 Chromium 系浏览器扩展场景
- 易迭代：后续增加同步、更多设置、导入导出时不需要推翻重来

## 2. 技术选型

当前采用的正式方案：

- 扩展规范：`Manifest V3`
- 前端框架：`React 18`
- 语言：`TypeScript`
- 构建工具：`Vite`
- 本地持久化：`chrome.storage.local`
- 测试：`Vitest 风格的 Node 内置测试流程 + TypeScript 编译`

选择这套方案的原因：

- React 适合拆分 popup、卡片、分类栏、弹窗等组件
- TypeScript 适合约束网站、分类、存储结构
- Vite 构建快，适合扩展多入口页面
- `chrome.storage.local` 足够支撑当前 MVP
- 依赖少，后续维护成本低

## 3. 架构分层

项目按四层组织：

1. UI 层
2. Application 层
3. Domain 层
4. Infrastructure 层

### 3.1 UI 层

负责：

- Popup 页面渲染
- Options 页面渲染
- 弹窗、卡片、分类栏交互
- 展示 toast、表单状态、空状态

不负责：

- 直接处理存储细节
- URL 归一化
- 去重规则
- Badge 刷新规则

### 3.2 Application 层

负责组织用例，例如：

- 添加网站
- 更新网站
- 删除网站
- 恢复网站
- 查询网站
- 新增分类
- 重命名分类
- 删除分类

### 3.3 Domain 层

负责稳定规则：

- 网站模型
- 分类模型
- URL 归一化
- 去重规则
- 分类兜底规则

### 3.4 Infrastructure 层

负责浏览器 API 封装：

- `chrome.storage`
- `chrome.tabs`
- `chrome.action`
- `chrome.commands`
- `chrome.permissions`

## 4. 运行模块

### 4.1 Popup

负责：

- 网站列表展示
- 搜索与分类筛选
- 添加 / 编辑 / 删除网站
- 分类右键管理
- popup 内 toast

### 4.2 Background Service Worker

负责：

- 快捷键监听
- 当前标签页数据读取
- 快捷键收录流程
- Badge 刷新
- 页面内 toast 注入

### 4.3 Options Page

负责：

- 基础状态展示
- 分类管理入口
- 调试信息查看

## 5. 目录建议

```text
docs/
  design-doccument.md
  progress-document.md
  tech-document.md
public/
  manifest.json
  icons/
src/
  app/
    popup/
    options/
    background/
  application/
    use-cases/
  components/
  domain/
    models/
    rules/
  infrastructure/
    chrome/
tests/
release/
```

## 6. 核心数据模型

### 6.1 SiteItem

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

- `id` 唯一
- `title` 必填
- `url` 必填
- `normalizedUrl` 用于去重
- `categories` 至少保留一个分类
- 无分类时自动归入“其他”

### 6.2 CategoryItem

```ts
export interface CategoryItem {
  name: string;
  builtIn: boolean;
  createdAt: number;
}
```

约束：

- `name` 唯一
- `其他` 为兜底分类
- 删除分类时，相关网站自动迁移到 `其他`

## 7. 关键业务规则

### 7.1 添加网站

流程：

1. 读取当前标签页标题与 URL
2. 执行 URL 归一化
3. 检查是否已存在
4. 不重复则写入存储
5. 刷新列表与 badge
6. 给出成功提示

### 7.2 删除网站

流程：

1. 从列表中移除
2. 记录删除快照
3. 显示可撤销 toast
4. 若用户撤销，则恢复数据

### 7.3 删除分类

流程：

1. 弹出二次确认
2. 删除分类本身
3. 将该分类下网站自动迁移到 `其他`
4. 刷新分类与列表

## 8. 权限策略

当前 `manifest` 使用的主要权限：

- `storage`
- `tabs`
- `scripting`
- `permissions`

`host_permissions` 当前为：

- `<all_urls>`

原因：

- 快捷键收录成功后，需要在当前页面内显示 toast
- 页面内 toast 依赖脚本注入，因此需要页面访问权限

## 9. 测试策略

当前优先保障：

- `normalizeUrl`
- 网站新增 / 更新去重
- 分类新增 / 重命名 / 删除迁移

发布前仍建议补做一轮真实浏览器手工回归。

## 10. 当前结论

PinBase 当前技术架构已经适合进入“可交付 MVP”阶段：

- 技术栈足够轻
- 结构足够清晰
- 功能主链闭环
- 后续可以继续扩展

下一阶段重点不再是重构架构，而是发布前回归、文档收口和交付整理。
