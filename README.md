# PinBase

PinBase 是一个基于 Chrome Manifest V3 的浏览器扩展，用来快速收藏、分类整理和再次打开常用网站。

## 当前能力

- Popup 主界面浏览已收藏网站
- 搜索网站标题、备注和分类
- 左侧分类筛选与分类管理
- 添加当前网站
- 编辑网站信息
- 删除网站并撤销删除
- 快捷键收录当前网站：`Alt + Shift + K`
- 页面内快捷键收录提示
- 已收藏状态 badge 提示
- Options 页面基础状态查看

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
5. 选择项目中的 `dist` 目录

## 验收建议

1. 打开任意网页，点击扩展图标，确认 popup 正常打开
2. 点击“添加当前网站”，确认可以保存
3. 点击卡片，确认能打开网站

4. 删除卡片后点击“撤销”，确认可恢复
5. 在左侧分类上右键，确认可以重命名和删除
6. 按 `Alt + Shift + K`，确认页面内出现快捷键收录提示
7. 打开 Options 页面，确认能看到统计信息与分类管理区域

## 测试

当前项目已包含最小自动化测试，覆盖：

- `normalizeUrl`
- 网站新增 / 更新去重逻辑
- 分类新增 / 重命名 / 删除迁移逻辑

运行方式：

```bash
npm run test
```

## 文档

- [设计文档](docs/design-doccument.md)
- [技术文档](docs/tech-document.md)
- [进度文档](docs/progress-document.md)
