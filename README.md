# 课堂文字云工具

这是一个课堂互动文字云项目。学生或参与者提交词语后，前端会即时读取后端资料并更新文字云显示。

## 功能

- 新增词语到 CloudBase `wordcloud_words` 集合。
- 相同词语会累加次数，并在文字云中放大显示。
- 前端定时刷新，方便课堂现场投放。

## 主要文件

| 文件 | 用途 |
| --- | --- |
| `public/index.html` | 静态网页入口 |
| `public/app.js` | 前端提交、读取与渲染文字云 |
| `public/styles.css` | 页面样式 |
| `cloudfunctions/wordcloudApi/index.js` | CloudBase HTTP API |
| `firebase.json` | Firebase Hosting 与 Firestore 配置 |
| `firestore.rules` | Firestore 规则 |
| `AGENTS.md` | Codex 项目工作规则 |

## 部署

当前前端调用 CloudBase 环境：

`teacherstudy-d0gc2v3z7c74c1142`

Firebase 项目映射保存在 `.firebaserc`，默认项目为：

`teacherstudy-2d61d`

## 工作模式

- 开始工作时对 Codex 说「开工」。
- 结束工作时对 Codex 说「收工」。
- 项目进度记录在 Obsidian：`D:\BaiduSyncdisk\Secondbrain\2026database\专案工作流程.md`。

## 安全原则

- 不提交 `.env`、API key、token、密码或管理凭证。
- 学生资料只使用座号、班级代号或匿名词语，不保存真实姓名。
