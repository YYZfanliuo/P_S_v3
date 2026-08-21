"use strict";

const http = require("http");

const HOST = "127.0.0.1";
const PORT = Number(process.env.WORKBENCH_AI_PORT) || 5174;
const MAX_BODY = 8 * 1024 * 1024;
const DEFAULT_MAX_TOKENS = 3600;

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > MAX_BODY) {
        reject(new Error("请求内容过大"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (err) { reject(new Error("请求不是有效的 JSON")); }
    });
    req.on("error", reject);
  });
}

function buildHeaders(config) {
  const headers = { "Content-Type": "application/json" };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
  return headers;
}

async function proxyChat(payload) {
  const config = payload.config || {};
  if (!config.endpoint) throw new Error("请填写接口地址");
  if (!config.apiKey) throw new Error("请填写 API Key");
  if (!config.model) throw new Error("请填写模型名称");
  const endpoint = String(config.endpoint).replace(/\/$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(config.timeout) || 30000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: buildHeaders(config),
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        messages: Array.isArray(payload.messages) ? payload.messages : [],
        temperature: Number.isFinite(Number(config.temperature)) ? Number(config.temperature) : 0.2,
        max_tokens: Number(payload.requestOptions?.maxTokens) || Number(config.maxTokens) || DEFAULT_MAX_TOKENS,
        ...(payload.requestOptions?.responseFormat ? { response_format: payload.requestOptions.responseFormat } : {})
      })
    });
    const text = await response.text();
    let body;
    try { body = text ? JSON.parse(text) : {}; } catch (err) { body = { raw: text.slice(0, 4000) }; }
    if (!response.ok) {
      const detail = typeof body === "object" && body.error ? JSON.stringify(body.error) : text.slice(0, 400);
      throw new Error(`接口返回 HTTP ${response.status}${detail ? `：${detail}` : ""}`);
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.method === "GET" && req.url === "/api/ai/status") return send(res, 200, { ok: true, service: "local-ai-bridge" });
  if (req.method !== "POST" || req.url !== "/api/ai/chat") return send(res, 404, { error: "Not Found" });
  try {
    const payload = await readJson(req);
    const result = await proxyChat(payload);
    send(res, 200, { ok: true, result });
  } catch (err) {
    send(res, 502, { ok: false, error: err.name === "AbortError" ? "请求超时" : err.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`个人工作台 AI 本地中转层已启动：http://${HOST}:${PORT}`);
  console.log("仅监听本机，不接受局域网外部访问。");
});

server.on("error", err => {
  console.error(`AI 中转层启动失败：${err.message}`);
  process.exitCode = 1;
});
