#!/usr/bin/env node
import http from "http";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

import { ApplicationManager } from "./application-manager.js";
import { WalletManager } from "./wallet-manager.js";
import { TransactionEngine } from "./transaction-engine.js";
import { TransferOrchestrator } from "./transfer-orchestrator.js";
import { TreasuryManager } from "./treasury-manager.js";
import { MilestoneEngine } from "./milestone-engine.js";
import { PaymentOrchestrator } from "./payment-orchestrator.js";
import { VoidEngine } from "./void-engine.js";
import { PayloadVerifier } from "./payload-verifier.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");

const PORT = Number(process.env.FINANCE_PORT || 9400);
const HOST = process.env.FINANCE_HOST || "0.0.0.0";

// ─── Service initialization ─────────────────────────────────
const services = {
  applications: new ApplicationManager(rootDir),
  wallets: new WalletManager(rootDir),
  transactions: new TransactionEngine(rootDir),
  transfers: new TransferOrchestrator(rootDir),
  treasuries: new TreasuryManager(rootDir),
  milestones: new MilestoneEngine(rootDir),
  payments: new PaymentOrchestrator(rootDir),
  voids: new VoidEngine(rootDir),
  payloads: new PayloadVerifier(rootDir),
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Idempotency-Key",
  });
  res.end(JSON.stringify(body, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (err) { reject(err); }
    });
    req.on("error", reject);
  });
}

// ─── Routes ─────────────────────────────────────────────────
const routes = {
  // Health
  "GET /health": (req, res) => sendJson(res, 200, {
    status: "ok",
    uptime: process.uptime(),
    services: Object.keys(services),
  }),

  // ─── Applications ───────────────────────────────────────
  "GET /applications": (req, res, { query }) => {
    const apps = services.applications.list(query);
    sendJson(res, 200, { total: apps.length, applications: apps });
  },
  "POST /applications": async (req, res) => {
    const body = await readBody(req);
    const app = services.applications.create(body);
    sendJson(res, 201, app);
  },
  "GET /applications/:id": (req, res, { params }) => {
    const app = services.applications.get(params.id);
    if (!app) return sendJson(res, 404, { error: "not_found" });
    sendJson(res, 200, app);
  },
  "POST /applications/:id/transition": async (req, res, { params }) => {
    const body = await readBody(req);
    const result = services.applications.transition(params.id, body.action, body);
    sendJson(res, result.ok ? 200 : 400, result);
  },

  // ─── Wallets ────────────────────────────────────────────
  "GET /wallets": (req, res, { query }) => {
    const wallets = services.wallets.list(query);
    sendJson(res, 200, { total: wallets.length, wallets });
  },
  "POST /wallets": async (req, res) => {
    const body = await readBody(req);
    const wallet = services.wallets.create(body);
    sendJson(res, 201, wallet);
  },
  "GET /wallets/:id": (req, res, { params }) => {
    const wallet = services.wallets.get(params.id);
    if (!wallet) return sendJson(res, 404, { error: "not_found" });
    sendJson(res, 200, wallet);
  },
  "GET /wallets/:id/balance": (req, res, { params }) => {
    const balance = services.wallets.getBalance(params.id);
    sendJson(res, 200, balance);
  },

  // ─── Transactions ───────────────────────────────────────
  "GET /transactions": (req, res, { query }) => {
    const txns = services.transactions.list(query);
    sendJson(res, 200, { total: txns.length, transactions: txns });
  },
  "GET /transactions/:id": (req, res, { params }) => {
    const txn = services.transactions.get(params.id);
    if (!txn) return sendJson(res, 404, { error: "not_found" });
    sendJson(res, 200, txn);
  },

  // ─── Transfers ──────────────────────────────────────────
  "GET /transfers": (req, res, { query }) => {
    const transfers = services.transfers.list(query);
    sendJson(res, 200, { total: transfers.length, transfers });
  },
  "POST /transfers": async (req, res) => {
    const body = await readBody(req);
    const transfer = services.transfers.propose(body);
    sendJson(res, 201, transfer);
  },
  "GET /transfers/:id": (req, res, { params }) => {
    const transfer = services.transfers.get(params.id);
    if (!transfer) return sendJson(res, 404, { error: "not_found" });
    sendJson(res, 200, transfer);
  },
  "POST /transfers/:id/approve": async (req, res, { params }) => {
    const body = await readBody(req);
    const result = services.transfers.approve(params.id, body.accountId, body.signature);
    sendJson(res, result.ok ? 200 : 400, result);
  },
  "POST /transfers/:id/execute": async (req, res, { params }) => {
    const result = await services.transfers.execute(params.id);
    sendJson(res, result.ok ? 200 : 400, result);
  },

  // ─── Treasuries ─────────────────────────────────────────
  "GET /treasuries": (req, res) => {
    const treasuries = services.treasuries.list();
    sendJson(res, 200, { total: treasuries.length, treasuries });
  },
  "GET /treasuries/:id": (req, res, { params }) => {
    const treasury = services.treasuries.get(params.id);
    if (!treasury) return sendJson(res, 404, { error: "not_found" });
    sendJson(res, 200, treasury);
  },

  // ─── Milestones ─────────────────────────────────────────
  "GET /milestones": (req, res, { query }) => {
    const milestones = services.milestones.list(query);
    sendJson(res, 200, { total: milestones.length, milestones });
  },
  "POST /milestones": async (req, res) => {
    const body = await readBody(req);
    const milestone = services.milestones.create(body);
    sendJson(res, 201, milestone);
  },
  "POST /milestones/:id/submit-proof": async (req, res, { params }) => {
    const body = await readBody(req);
    const result = services.milestones.submitProof(params.id, body);
    sendJson(res, result.ok ? 200 : 400, result);
  },
  "POST /milestones/:id/approve": async (req, res, { params }) => {
    const body = await readBody(req);
    const result = services.milestones.approve(params.id, body);
    sendJson(res, result.ok ? 200 : 400, result);
  },
  "POST /milestones/:id/pay": async (req, res, { params }) => {
    const body = await readBody(req);
    const result = await services.milestones.pay(params.id, body);
    sendJson(res, result.ok ? 200 : 400, result);
  },

  // ─── Payments ───────────────────────────────────────────
  "GET /payments": (req, res, { query }) => {
    const payments = services.payments.list(query);
    sendJson(res, 200, { total: payments.length, payments });
  },
  "POST /payments": async (req, res) => {
    const body = await readBody(req);
    const idempotencyKey = req.headers["x-idempotency-key"];
    const payment = services.payments.create({ ...body, idempotencyKey });
    sendJson(res, 201, payment);
  },
  "GET /payments/:id": (req, res, { params }) => {
    const payment = services.payments.get(params.id);
    if (!payment) return sendJson(res, 404, { error: "not_found" });
    sendJson(res, 200, payment);
  },
  "POST /payments/:id/capture": async (req, res, { params }) => {
    const result = await services.payments.capture(params.id);
    sendJson(res, result.ok ? 200 : 400, result);
  },

  // ─── Voids & Refunds ────────────────────────────────────
  "POST /voids": async (req, res) => {
    const body = await readBody(req);
    const result = await services.voids.create(body);
    sendJson(res, result.ok ? 201 : 400, result);
  },
  "GET /voids": (req, res, { query }) => {
    const voids = services.voids.list(query);
    sendJson(res, 200, { total: voids.length, voids });
  },

  // ─── Webhooks ───────────────────────────────────────────
  "POST /webhooks/:source": async (req, res, { params }) => {
    const raw = await readBody(req).catch(() => null);
    // PayloadVerifier needs the raw body for signature verification
    const rawBody = typeof raw === "string" ? raw : JSON.stringify(raw);
    const signature = req.headers["x-signature"] || req.headers["x-hub-signature-256"] || req.headers["x-payload-signature"];
    const result = await services.payloads.process(params.source, rawBody, signature, req.headers);
    sendJson(res, result.ok ? 200 : 401, result);
  },
  "GET /payloads": (req, res, { query }) => {
    const payloads = services.payloads.list(query);
    sendJson(res, 200, { total: payloads.length, payloads });
  },

  // ─── Reconciliation ─────────────────────────────────────
  "POST /reconcile": async (req, res) => {
    const body = await readBody(req);
    const result = services.transactions.reconcile(body);
    sendJson(res, 200, result);
  },
};

// ─── Router ─────────────────────────────────────────────────
function matchRoute(method, pathname) {
  const key = `${method} ${pathname}`;
  if (routes[key]) return { handler: routes[key], params: {} };

  for (const [routeKey, handler] of Object.entries(routes)) {
    const [routeMethod, routePath] = routeKey.split(" ");
    if (routeMethod !== method) continue;

    const routeParts = routePath.split("/");
    const pathParts = pathname.split("/");
    if (routeParts.length !== pathParts.length) continue;

    const params = {};
    let match = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        params[routeParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (routeParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }
    if (match) return { handler, params };
  }
  return null;
}

// ─── Server ─────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Idempotency-Key",
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const match = matchRoute(req.method, url.pathname);

  if (!match) {
    return sendJson(res, 404, { error: "not_found", path: url.pathname });
  }

  try {
    const query = Object.fromEntries(url.searchParams.entries());
    await match.handler(req, res, { query, params: match.params });
  } catch (err) {
    console.error(`[${req.method} ${url.pathname}]`, err);
    sendJson(res, 500, { error: "internal_error", message: err.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`💰 Finance server at http://${HOST}:${PORT}`);
  console.log(`   Applications  /applications`);
  console.log(`   Wallets       /wallets`);
  console.log(`   Transactions  /transactions`);
  console.log(`   Transfers     /transfers`);
  console.log(`   Treasuries    /treasuries`);
  console.log(`   Milestones    /milestones`);
  console.log(`   Payments      /payments`);
  console.log(`   Voids         /voids`);
  console.log(`   Webhooks      /webhooks/:source`);
  console.log(`   Reconcile     /reconcile`);
});