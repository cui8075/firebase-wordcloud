(function () {
  const config = {
    env: "teacherstudy-d0gc2v3z7c74c1142",
    region: "ap-shanghai",
    accessKey: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL3RlYWNoZXJzdHVkeS1kMGdjMnYzejdjNzRjMTE0Mi5hcC1zaGFuZ2hhaS50Y2ItYXBpLnRlbmNlbnRjbG91ZGFwaS5jb20iLCJzdWIiOiJhbm9uIiwiYXVkIjoidGVhY2hlcnN0dWR5LWQwZ2MydjN6N2M3NGMxMTQyIiwiZXhwIjo0MDgyOTI3NDU2LCJpYXQiOjE3NzkyNDQyNTYsIm5vbmNlIjoiYzByUnhOTTFRYWlGU3NELUphMXY1QSIsImF0X2hhc2giOiJjMHJSeE5NMVFhaUZTc0QtSmExdjVBIiwibmFtZSI6IkFub255bW91cyIsInNjb3BlIjoiYW5vbnltb3VzIiwicHJvamVjdF9pZCI6InRlYWNoZXJzdHVkeS1kMGdjMnYzejdjNzRjMTE0MiIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.qBOn89lNdGEFvxksw5xsiT2T6i0hp2sLchaKkQeniAcmw0bQ1Lgc-FY_G0dQTSR59XGcsset2xQZeBDw22olZhjcT4LEelfb-H2GrQ7s7z7z2JtnYs5cR8aSq_x47y7BKj8RaVaVU7Rzjo3iTykBkA04p28Yrubh4hIInYP6LZLr8eQyuubznwgLtArYdMZE0MOifmBVhn_Zi9NgFP1xGi9WgVtTsbEe43h-6Qd1i6zbpzYIuiW8lSDz3ZlZTVNPvsjW3yLEJl8UKpWzuKz9p_5_xgNg-dlCwq_5qmApoDcanpxpkNaEe-ecGxF8jbjhZCLfzmjryEkgk_QHG3UHlA"
  };
  const collectionName = "wordcloud_words";
  const colors = ["#167b83", "#e6533f", "#c98822", "#3d7d45", "#4469a9", "#7c4a9d"];
  const cloud = document.querySelector("#cloud");
  const status = document.querySelector("#status");
  const form = document.querySelector("#wordForm");
  const input = document.querySelector("#wordInput");
  let db;
  let watcher;

  function setStatus(message) {
    status.textContent = message;
  }

  function normalizeWord(value) {
    return value.trim().replace(/\s+/g, " ").slice(0, 24);
  }

  function docIdFor(word) {
    return encodeURIComponent(word.toLowerCase()).replace(/\./g, "%2E");
  }

  function wordSize(count, maxCount) {
    const ratio = maxCount > 0 ? count / maxCount : 0;
    return Math.round(18 + ratio * 58);
  }

  function getAuth(app) {
    return typeof app.auth === "function" ? app.auth() : app.auth;
  }

  function toWords(docs) {
    return docs
      .map((doc) => ({
        id: doc._id || doc.id,
        text: doc.text,
        count: Number(doc.count || 1)
      }))
      .filter((word) => word.text)
      .sort((a, b) => b.count - a.count)
      .slice(0, 80);
  }

  function render(words) {
    cloud.innerHTML = "";

    if (!words.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "還沒有詞，先加入第一個。";
      cloud.append(empty);
      return;
    }

    const maxCount = Math.max(...words.map((word) => word.count || 1));
    words.forEach((word, index) => {
      const item = document.createElement("button");
      item.className = "word";
      item.type = "button";
      item.textContent = word.text;
      item.title = `${word.text}: ${word.count || 1}`;
      item.style.setProperty("--word-size", `${wordSize(word.count || 1, maxCount)}px`);
      item.style.setProperty("--word-weight", word.count >= maxCount ? "900" : "700");
      item.style.setProperty("--word-color", colors[index % colors.length]);
      item.addEventListener("click", () => addWord(word.text));
      cloud.append(item);
    });
  }

  async function loadWords() {
    const result = await db.collection(collectionName).orderBy("count", "desc").limit(80).get();
    if (result.code) {
      throw new Error(result.message || result.code);
    }
    render(toWords(result.data || []));
    setStatus(`即時同步中，共 ${(result.data || []).length} 個詞。點擊詞語可加一票。`);
  }

  async function addWord(rawWord) {
    const word = normalizeWord(rawWord);
    if (!word) {
      input.focus();
      return;
    }

    const ref = db.collection(collectionName).doc(docIdFor(word));
    const now = new Date();
    const existing = await ref.get();
    const data = Array.isArray(existing.data) ? existing.data[0] : existing.data;

    if (data && data._id) {
      const result = await ref.update({
        count: Number(data.count || 0) + 1,
        updatedAt: now
      });
      if (result.code || result.updated === 0) {
        throw new Error(result.message || "更新文字失敗");
      }
      return;
    }

    const result = await ref.set({
      text: word,
      count: 1,
      createdAt: now,
      updatedAt: now
    });
    if (result.code) {
      throw new Error(result.message || result.code);
    }
  }

  function startWatch() {
    if (watcher && typeof watcher.close === "function") {
      watcher.close();
    }

    watcher = db.collection(collectionName).limit(80).watch({
      onChange(snapshot) {
        const docs = snapshot.docs || [];
        render(toWords(docs));
        setStatus(`即時同步中，共 ${docs.length} 個詞。點擊詞語可加一票。`);
      },
      onError(error) {
        setStatus(`即時監聽暫時中斷：${error.message || error}。正在改用普通刷新。`);
        loadWords().catch((loadError) => {
          setStatus(`CloudBase 讀取失敗：${loadError.message}`);
        });
      }
    });
  }

  async function init() {
    if (!window.cloudbase) {
      setStatus("CloudBase SDK 尚未載入，請稍後重新整理。");
      return;
    }

    try {
      const app = cloudbase.init({
        env: config.env,
        region: config.region,
        accessKey: config.accessKey,
        auth: { detectSessionInUrl: true }
      });
      const auth = getAuth(app);
      if (!auth || typeof auth.signInAnonymously !== "function") {
        throw new Error("CloudBase 匿名登入不可用");
      }

      setStatus("正在匿名登入 CloudBase...");
      const login = await auth.signInAnonymously();
      if (login && login.error) {
        throw new Error(login.error.message || "匿名登入失敗");
      }

      db = app.database();
      setStatus("已連接 CloudBase，正在載入文字雲...");
      startWatch();
      await loadWords();
    } catch (error) {
      render([]);
      setStatus(`CloudBase 連接失敗：${error.message}`);
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const word = normalizeWord(input.value);
    input.value = "";
    try {
      await addWord(word);
      await loadWords();
    } catch (error) {
      setStatus(`新增失敗：${error.message}`);
    }
  });

  window.addEventListener("beforeunload", () => {
    if (watcher && typeof watcher.close === "function") {
      watcher.close();
    }
  });

  window.addEventListener("load", init);
})();
