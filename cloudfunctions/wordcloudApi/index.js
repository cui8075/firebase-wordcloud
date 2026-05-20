const http = require("http");
const cloudbase = require("@cloudbase/node-sdk");

const env = process.env.TCB_ENV || process.env.SCB_NAMESPACE || "teacherstudy-d0gc2v3z7c74c1142";
const app = cloudbase.init({ env });
const db = app.database();
const collection = db.collection("wordcloud_words");

function docIdFor(word) {
  return encodeURIComponent(word.toLowerCase()).replace(/\./g, "%2E");
}

function normalizeWord(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 24);
}

function send(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function listWords(res) {
  const result = await collection.orderBy("count", "desc").limit(80).get();
  const words = (result.data || [])
    .map((doc) => ({
      id: doc._id,
      text: doc.text,
      count: Number(doc.count || 1)
    }))
    .filter((word) => word.text)
    .sort((a, b) => b.count - a.count);

  send(res, 200, { ok: true, words });
}

async function addWord(req, res) {
  const rawBody = await readBody(req);
  const body = rawBody ? JSON.parse(rawBody) : {};
  const word = normalizeWord(body.text);
  if (!word) {
    send(res, 400, { ok: false, error: "请输入文字" });
    return;
  }

  const ref = collection.doc(docIdFor(word));
  const now = new Date();
  const existing = await ref.get();
  const data = Array.isArray(existing.data) ? existing.data[0] : existing.data;

  if (data && data._id) {
    await ref.update({
      count: Number(data.count || 0) + 1,
      updatedAt: now
    });
  } else {
    await ref.set({
      text: word,
      count: 1,
      createdAt: now,
      updatedAt: now
    });
  }

  send(res, 200, { ok: true });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return;
  }

  try {
    if (req.method === "GET") {
      await listWords(res);
      return;
    }

    if (req.method === "POST") {
      await addWord(req, res);
      return;
    }

    send(res, 405, { ok: false, error: "Method not allowed" });
  } catch (error) {
    send(res, 500, { ok: false, error: error.message });
  }
});

server.listen(9000);
