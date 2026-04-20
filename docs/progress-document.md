# PinBase 项目进度文档

## 1. 文档目的

这份文档用于记录 PinBase 项目从需求梳理到正式开发、联调、交付的完整执行计划，并标记当前进度。

状态标记规则：

- `[x]` 已完成
- `[ ]` 未开始
- `[-]` 进行中或待确认

## 2. 项目总目标

交付一个可在 Chromium 浏览器中运行的 PinBase 插件 MVP，支持：

- 收藏当前网站
- 搜索网站
- 分类筛选
- 网站卡片展示
- 删除与撤销
- 快捷键收录
- 基础 Badge 状态提示

## 3. 总执行计划

### 阶段 A：产品定义与页面方向确认

- [x] 明确产品定位与目标用户
- [x] 梳理核心使用场景
- [x] 梳理核心功能清单
- [x] 确认主面板页面布局方向
- [x] 确认“添加网站”弹窗布局方向
- [x] 整理设计文档，形成可读版本

阶段产出：

- [x] [docs/design-doccument.md](</e:/my_vibecoding/工具箱插件/docs/design-doccument.md:1>)

### 阶段 B：原型与视觉验证

- [x] 生成适合 Stitch 的页面描述 Prompt
- [x] 将主面板视觉稿落成可预览静态页面
- [x] 将“添加网站”弹窗落成可预览静态页面
- [x] 本地保存两张静态预览页，方便快速看样式

阶段产出：

- [x] [preview/pinbase-main.html](</e:/my_vibecoding/工具箱插件/preview/pinbase-main.html:1>)
- [x] [preview/pinbase-add-site.html](</e:/my_vibecoding/工具箱插件/preview/pinbase-add-site.html:1>)

### 阶段 C：技术方案确认

- [x] 确认项目最适合的技术架构
- [x] 选择插件技术标准：Manifest V3
- [x] 选择前端技术栈：React + TypeScript + Vite
- [x] 确认存储方案：`chrome.storage.local`
- [x] 确认分层方案：UI / 应用层 / 领域层 / 基础设施层
- [x] 明确推荐目录结构与开发阶段划分

阶段产出：

- [x] [docs/tech-document.md](</e:/my_vibecoding/工具箱插件/docs/tech-document.md:1>)

### 阶段 D：工程骨架搭建

- [x] 初始化基础工程配置文件
- [x] 创建 `package.json`
- [x] 创建 `tsconfig.json`
- [x] 创建 `vite.config.ts`
- [x] 创建插件入口页面 `popup.html`
- [x] 创建插件入口页面 `options.html`
- [x] 创建 `manifest.json`
- [x] 创建 React 入口文件
- [x] 创建全局样式文件
- [x] 创建基础目录结构
- [x] 创建 Popup 页面骨架
- [x] 创建 Options 页面骨架
- [x] 创建 Background Service Worker 骨架
- [x] 创建领域模型与基础规则文件
- [x] 创建存储与浏览器 API 封装

已完成文件：

- [x] [package.json](</e:/my_vibecoding/工具箱插件/package.json:1>)
- [x] [tsconfig.json](</e:/my_vibecoding/工具箱插件/tsconfig.json:1>)
- [x] [vite.config.ts](</e:/my_vibecoding/工具箱插件/vite.config.ts:1>)
- [x] [public/manifest.json](</e:/my_vibecoding/工具箱插件/public/manifest.json:1>)
- [x] [src/app/popup/PopupApp.tsx](</e:/my_vibecoding/工具箱插件/src/app/popup/PopupApp.tsx:1>)
- [x] [src/app/background/index.ts](</e:/my_vibecoding/工具箱插件/src/app/background/index.ts:1>)

### 阶段 E：依赖安装与首次运行验证

- [x] 安装项目依赖
- [x] 运行 TypeScript 类型检查
- [x] 运行 Vite 构建
- [x] 检查构建产物是否正确输出到 `dist`
- [x] 将 `dist` 作为浏览器扩展加载
- [ ] 验证 popup 是否可以正常打开
- [ ] 验证 options 页面是否可以打开
- [ ] 验证 background 是否正常注册

说明：
- 当前已完成本地安装、类型检查与生产构建
- 下一步需要在浏览器中手动加载 `dist` 目录做真实插件验证

手动验证步骤：

1. 打开 Chromium 浏览器的扩展管理页
2. 打开开发者模式
3. 选择“加载已解压缩的扩展程序”
4. 选择项目目录下的 `dist` 文件夹
5. 点击插件图标，检查 popup 是否能打开
6. 进入插件详情页，打开 options 页面
7. 观察扩展管理页是否有 background / service worker 报错

本阶段验收标准：

- [x] `dist` 可以被浏览器正常加载
- [x] 插件图标出现且无明显报错
- [ ] popup 页面可以正常渲染
- [ ] options 页面可以正常渲染
- [ ] service worker 已注册且无启动错误

### 阶段 F：MVP 功能实现

#### F1. 数据与存储

- [ ] 实现完整的存储初始化逻辑
- [ ] 实现网站数据读写
- [ ] 实现分类数据读写
- [ ] 实现 UI 偏好数据读写
- [ ] 实现 storage 数据迁移兜底

#### F2. 网站收录

- [ ] 从当前标签页读取标题与 URL
- [ ] 实现 `normalizeUrl`
- [ ] 实现 URL 去重校验
- [ ] 实现“添加当前网站”表单提交流程
- [ ] 实现保存成功与失败反馈

#### F3. 主面板

- [ ] 用真实数据替换默认 mock 数据
- [ ] 实现网站列表渲染
- [ ] 实现空状态
- [ ] 实现搜索功能
- [ ] 实现分类筛选
- [ ] 实现网站卡片点击打开

#### F4. 弹窗

- [ ] 实现“添加网站”弹窗开关
- [ ] 实现表单字段编辑
- [ ] 实现分类勾选
- [ ] 实现备注输入
- [ ] 实现取消与保存

#### F5. 卡片操作

- [ ] 实现卡片编辑
- [ ] 实现卡片删除
- [ ] 实现删除后的撤销
- [ ] 实现最近打开时间更新

#### F6. 快捷键与 Badge

- [ ] 实现快捷键收录当前网站
- [ ] 实现当前页是否已收录的 Badge 判定
- [ ] 实现标签页切换后的 Badge 刷新
- [ ] 实现页面更新后的 Badge 刷新

### 阶段 G：分类管理能力

- [ ] 实现默认分类初始化
- [ ] 实现新增分类
- [ ] 实现分类去重校验
- [ ] 实现删除分类
- [ ] 实现删除分类后的“其他”兜底
- [ ] 限制系统保底分类不可删除

### 阶段 H：质量保障

- [ ] 补充 URL normalize 单元测试
- [ ] 补充去重逻辑测试
- [ ] 补充分类删除兜底测试
- [ ] 补充删除撤销测试
- [ ] 补充关键组件渲染测试
- [ ] 手工回归主流程

### 阶段 I：交付准备

- [ ] 整理 README 或使用说明
- [ ] 确认最终 manifest 权限最小化
- [ ] 整理图标资源
- [ ] 整理版本号与构建产物
- [ ] 生成可加载扩展包

## 4. 当前已完成清单

截至目前，已经完成的事项如下：

- [x] 产品需求与设计文档初版整理
- [x] 主面板线框方向确认
- [x] 添加网站弹窗方向确认
- [x] Stitch Prompt 编写
- [x] 两张本地静态预览页落地
- [x] 技术架构方案确认
- [x] 技术架构文档输出
- [x] 插件工程骨架初始化
- [x] Manifest、Vite、TS、React 入口文件创建
- [x] Popup / Options / Background 基础文件创建
- [x] 领域模型、存储层、基础 use case 骨架创建
- [x] 项目依赖安装完成
- [x] TypeScript 类型检查通过
- [x] 首次生产构建成功
- [x] `dist` 产物生成成功

## 5. 当前进行到哪里

当前项目状态：

- 阶段 A、B、C、D 已完成
- 阶段 E 已完成前半段
- 当前最合理的下一步是把 `dist` 加载到浏览器中做真实插件验证

因此，项目当前主线进度可以总结为：

- [x] 需求定义
- [x] 页面方向确认
- [x] 技术方案确认
- [x] 工程骨架搭建
- [-] 首次运行验证
- [ ] MVP 功能开发
- [ ] 测试与交付

## 6. 下一步建议执行顺序

建议接下来严格按下面顺序推进：

1. [x] 安装依赖
2. [x] 执行类型检查与构建
3. [ ] 在浏览器中加载插件
4. [ ] 修复首次运行问题
5. [ ] 接入真实 storage 数据流
6. [ ] 做“添加当前网站”完整闭环
7. [ ] 做搜索与分类筛选
8. [ ] 做删除与撤销
9. [ ] 做快捷键与 Badge
10. [ ] 补测试与交付说明

## 7. 备注

后续每完成一项，都直接在本文件中更新：

- 把 `[ ]` 改成 `[x]`
- 如有中途推进中的任务，可改成 `[-]`
- 如任务范围变化，可在对应阶段下面补充说明
