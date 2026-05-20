# 2026database - AGENTS.md

## 专案入口

专案名称：2026database
专案用途：课堂互动文字云工具，前端展示文字云，后端使用 CloudBase HTTP API 与 `wordcloud_words` 集合记录词语票数。
主要工作目录：D:\BaiduSyncdisk\2026database
GitHub repo：https://github.com/cui8075/firebase-wordcloud
预设 branch：master

## Obsidian 对应笔记

Obsidian vault：D:\BaiduSyncdisk\Secondbrain
专案驾驶舱：2026database/专案工作流程.md
收工时优先更新：同上

> 注意：专案驾驶舱是 Obsidian vault 里的笔记，不是工作资料夹里的 Markdown 文件。

## 工作桌 + 三个家

- 工作桌：D:\BaiduSyncdisk\2026database
- GitHub：https://github.com/cui8075/firebase-wordcloud
- Obsidian：D:\BaiduSyncdisk\Secondbrain + 2026database/专案工作流程.md
- Firebase：teacherstudy-2d61d；当前前端实际调用 CloudBase 环境 `teacherstudy-d0gc2v3z7c74c1142`

## 同步规则

开工时：
- 使用 `startup-sync` 流程
- 读本档
- 读 Obsidian 驾驶舱
- 检查 Git 状态
- 不自动 pull / commit / push

收工时：
- 使用 `shutdown-sync` 流程
- 更新 Obsidian 驾驶舱
- 只有规则、路径、专案边界改变时才更新本档
- 需要时 commit + push GitHub

新专案初始化时：
- 使用 `project-init-sync` 流程

## 主要文件

| 文件 | 用途 |
| --- | --- |
| `README.md` | 项目说明、工作模式和安全原则 |
| `public/index.html` | Firebase Hosting / 静态站点入口 |
| `public/app.js` | 前端文字云逻辑与 CloudBase API 调用 |
| `public/styles.css` | 前端样式 |
| `cloudfunctions/wordcloudApi/index.js` | CloudBase HTTP API |
| `firebase.json` | Firebase Hosting 与 Firestore 配置 |
| `firestore.rules` | Firestore 规则 |
| `.firebaserc` | Firebase 项目映射 |

## 不要做

- 不要把每日进度写进 AGENTS.md；进度写到 Obsidian 驾驶舱。
- 不要自动纳入无关 git 变更。
- 不要把 API key、token、密码写进 repo。
- 不要储存学生姓名；正式资料只用座号与班级代号。
