# Firebase 文字雲

這是一個使用 Firebase Hosting 與 Cloud Firestore 的即時文字雲網頁。

## 功能

- 新增文字到 Firestore `wordcloud_words` 集合
- 即時監聽資料變化並更新文字雲
- 點擊既有詞語可累加權重

## 部署

```powershell
npx.cmd -y firebase-tools@latest login
npx.cmd -y firebase-tools@latest deploy --only firestore:rules,hosting
```

部署後請用 Firebase Hosting 網址開啟，頁面會透過 `/__/firebase/init.js` 自動讀取專案設定。
