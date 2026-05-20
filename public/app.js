(function () {
  const apiBase = "https://teacherstudy-d0gc2v3z7c74c1142.service.tcloudbase.com/api/wordcloud";
  const colors = ["#167b83", "#e6533f", "#c98822", "#3d7d45", "#4469a9", "#7c4a9d"];
  const cloud = document.querySelector("#cloud");
  const status = document.querySelector("#status");
  const form = document.querySelector("#wordForm");
  const input = document.querySelector("#wordInput");
  let refreshTimer;

  function setStatus(message) {
    status.textContent = message;
  }

  function normalizeWord(value) {
    return value.trim().replace(/\s+/g, " ").slice(0, 24);
  }

  function wordSize(count, maxCount) {
    const ratio = maxCount > 0 ? count / maxCount : 0;
    return Math.round(18 + ratio * 58);
  }

  async function requestJson(url, options) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options && options.headers ? options.headers : {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
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
    const result = await requestJson(apiBase);
    const words = result.words || [];
    render(words);
    setStatus(`已同步，共 ${words.length} 個詞。點擊詞語可加一票。`);
  }

  async function addWord(rawWord) {
    const word = normalizeWord(rawWord);
    if (!word) {
      input.focus();
      return;
    }
    await requestJson(apiBase, {
      method: "POST",
      body: JSON.stringify({ text: word })
    });
    await loadWords();
  }

  async function init() {
    try {
      setStatus("正在連接 CloudBase...");
      await loadWords();
      refreshTimer = window.setInterval(() => {
        loadWords().catch((error) => {
          setStatus(`CloudBase 讀取失敗：${error.message}`);
        });
      }, 3000);
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
    } catch (error) {
      setStatus(`新增失敗：${error.message}`);
    }
  });

  window.addEventListener("beforeunload", () => {
    if (refreshTimer) {
      window.clearInterval(refreshTimer);
    }
  });

  window.addEventListener("load", init);
})();
