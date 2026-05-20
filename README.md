# 课堂文字云工具

这是一个课堂互动文字云项目。学生或参与者提交词语后，前端会即时读取后端资料并更新文字云显示。

## 功能

- 新增词语到 CloudBase `wordcloud_words` 集合。
- 相同词语会累加次数，并在文字云中放大显示。
- 前端定时刷新，方便课堂现场投放。

## 主要文件

| 文件 | 用途 |
| --- | --- |
| `index.html` | GitHub Pages 根入口 |
| `wordcloud-firebase.html` | 兼容旧链接的文字云页面 |
| `public/index.html` | Firebase Hosting / 静态站点入口 |
| `public/app.js` | 前端提交、读取与渲染文字云 |
| `public/styles.css` | 页面样式 |
| `cloudfunctions/wordcloudApi/index.js` | CloudBase HTTP API |
| `firebase.json` | Firebase Hosting 与 Firestore 配置 |
| `firestore.rules` | Firestore 规则 |

## 部署

GitHub Pages：

`https://cui8075.github.io/firebase-wordcloud/`

当前前端调用 CloudBase 环境：

`teacherstudy-d0gc2v3z7c74c1142`

Firebase 项目映射保存在 `.firebaserc`，默认项目为：

`teacherstudy-2d61d`
