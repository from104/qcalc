# 应用信息

本应用使用 vue+quasar+tauri 创建。

联系方式：Seo Kihyun <from104@gmail.com>，

Copyright © 2022 Seo Kihyun. MIT License.

## 更新日志

本项目的所有重要变更均记录在此文件中。

格式基于 [Keep a Changelog]，本项目遵循[语义化版本]。

## [0.13.1] 2026-08-18

### 变更

- 统一包名为 QCalc（Windows 用户需先卸载旧版”Q Calc”）

### 新增

- 每个版本附带 Android APK

### 修复

- Snap 包启动修复（#117）
- 0.12.x 版本恢复更新通知（Windows、AppImage）
- Windows 安装程序清理旧版文件
- AppImage 在 Wayland 不再立即退出（Linux）
- 修复结果字段错误高亮显示
- 桌面文本缩放应用到窗口尺寸（Linux）
- 按键标签不再溢出按钮
- 移除 Flatpak 音频权限要求

### 已知问题

- Flatpak 中屏幕阅读器无法访问 — 上游沙箱限制。使用 .deb、.rpm 或 AppImage（#113）
- Linux 剪贴板读取可能失败，粘贴到计算器时可能无效

## [0.13.0] 2026-08-09

### 变更

- 桌面应用从 Electron 迁移到 Tauri 2
- Tauri 自动更新完全启用
- 添加历史记录迁移和初次启动引导
- 原生 Wayland 设为默认（tauri#13749 / tauri#3117）
- 默认窗口尺寸增加（352×604 → 480×756）

### 新增

- 新增 2 个语言（葡萄牙语、俄语），共 10 种
- 屏幕阅读器朗读计算结果（Linux）
- 公式错误朗读
- 撤销[计算记录]删除操作
- 键盘可访问性改进（标签、公式输入、内存切换）
- WCAG AA 对比度主题

### 修复

- 屏幕阅读器支持改进
- 按语言格式化数字
- 公式计算器度数、错误分类、占位符替换
- 恢复[计算记录]后尊重最大记录数
- 桌面应用启动不再卡住
- Tauri/Linux 窗口尺寸、文字渲染、图标、Flatpak、Snap 包改进
- 葡萄牙语、俄语帮助页面现已打开
- 韩语标签修正

### 已知问题

- Snap 包不启动（#117）
- Flatpak 中屏幕阅读器无法访问 — 上游沙箱限制。使用 .deb、.rpm 或 AppImage（#113）
- Linux 屏幕阅读器验证不完整（音频、悬停、剪贴板、CSP）

有关以前版本的信息，请查看[此处](https://github.com/from104/qcalc/blob/main/CHANGELOG.md)。
