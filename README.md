# PinBase

PinBase 是一个基于 Chrome Manifest V3 的浏览器扩展，用来快速收藏、分类整理和再次打开常用网站。

## 当前能力

- popup 双列卡片视图
- 搜索与分类筛选
- 添加当前网站
- 编辑、删除、撤销删除
- 快捷键收录当前网站：`Alt + Shift + K`
- 页面内快捷键收录 toast
- 分类新增、重命名、删除
- 分类删除二次确认
- options 状态页

## 技术栈

- React 18
- TypeScript
- Vite
- Chrome Extension Manifest V3
- `chrome.storage.local`

## 本地开发

```bash
npm install
npm run check
npm run test
npm run build
```

## 加载扩展

1. 运行 `npm run build`
2. 打开 `chrome://extensions`
3. 打开右上角“开发者模式”
4. 点击“加载已解压的扩展程序”
5. 选择项目里的 `dist` 目录

## 统一验收建议

1. 打开任意网页，点击插件图标，确认 popup 正常显示
2. 点击“添加当前网站”，确认可保存
3. 点击卡片，确认能打开网站
4. 删除卡片后点击“撤销”，确认可恢复
5. 左侧分类右键，确认可重命名和删除
6. 删除分类时确认会出现二次确认弹窗
7. 按 `Alt + Shift + K`，确认页面右下角出现快捷键收录 toast
8. 打开 options 页面，确认能看到统计信息和分类管理

## 测试

当前项目内置了最小自动化测试，覆盖：

- `normalizeUrl`
- 网站新增 / 更新去重逻辑
- 分类新增 / 重命名 / 删除迁移逻辑

运行方式：

```bash
npm run test
```

## 项目文档

- [设计文档](docs/design-doccument.md)
- [技术文档](docs/tech-document.md)
- [进度文档](docs/progress-document.md)
