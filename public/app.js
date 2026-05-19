(function () {
  const collectionName = "wordcloud_words";
  const colors = ["#167b83", "#e6533f", "#c98822", "#3d7d45", "#4469a9", "#7c4a9d"];
  const cloud = document.querySelector("#cloud");
  const status = document.querySelector("#status");
  const form = document.querySelector("#wordForm");
  const input = document.querySelector("#wordInput");

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

  async function addWord(rawWord) {
    const word = normalizeWord(rawWord);
    if (!word) {
      input.focus();
      return;
    }

    const ref = window.db.collection(collectionName).doc(docIdFor(word));
    await window.db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const now = firebase.firestore.FieldValue.serverTimestamp();
      if (snapshot.exists) {
        transaction.update(ref, {
          count: firebase.firestore.FieldValue.increment(1),
          updatedAt: now
        });
        return;
      }

      transaction.set(ref, {
        text: word,
        count: 1,
        createdAt: now,
        updatedAt: now
      });
    });
  }

  window.addEventListener("load", () => {
    if (!window.firebase || !firebase.apps.length) {
      setStatus("Firebase 尚未初始化。請用 Firebase Hosting 或 Hosting Emulator 開啟此頁。");
      return;
    }

    window.db = firebase.firestore();
    setStatus("已連接 Firebase，正在載入文字雲...");

    window.db.collection(collectionName).onSnapshot(
      (snapshot) => {
        const words = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((word) => word.text)
          .sort((a, b) => (b.count || 0) - (a.count || 0))
          .slice(0, 80);

        render(words);
        setStatus(`即時同步中，共 ${words.length} 個詞。點擊詞語可加一票。`);
      },
      (error) => {
        setStatus(`Firestore 讀取失敗：${error.message}`);
      }
    );
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const word = normalizeWord(input.value);
    input.value = "";
    try {
      await addWord(word);
    } catch (error) {
      setStatus(`新增失敗：${error.message}`);
    }
  });
})();
