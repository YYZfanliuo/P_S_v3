# 课程表周视图重复显示修复

## 问题
课程表切换到周视图后，同一份时间轴被渲染了两次。

## 原因
`renderModule()` 在课程表的 `head` 区域渲染了一次周视图，同时在 `timetableView` 区域又渲染了一次。

## 修复
移除 `head` 区域的重复调用，保留 `timetableView` 作为唯一渲染入口。日视图和周视图切换逻辑、课程块点击编辑逻辑保持不变。

## 验证
- 桌面端 `scripts/app.js` 语法检查通过。
- 发布端 `www/scripts/app.js` 语法检查通过。
- `git diff --check` 通过。
- 网页已重新部署并验证可访问。
