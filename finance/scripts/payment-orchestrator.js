import fs from "fs";
import path from "path";
import crypto from "crypto";
import { TransactionEngine } from "./transaction-engine.js";

export class PaymentOrchestrator {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.storePath = path.join(rootDir, "finance", ".payments.json");
    this.declineCodes = JSON.parse(fs.readFileSync(path.join(rootDir, "finance", "decline-codes.json"), "utf-8"));
    this.payments = this.load();
    this.transactions = new TransactionEngine(rootDir);
  }

  load() {
    try { return JSON.parse(fs.readFileSync(this.storePath, "utf-8")); }
    catch { return []; }
  }

  save() {
    fs.mkdirSync(path.dirname(this.storePath), { recursive: true });
    fs.writeFileSync(this.storePath, JSON.stringify(this.payments, null, 2));
  }

  create(data) {
    // Idempotency: return existing payment if key matches
    if (data.idempotencyKey) {
      const existing = this.payments.find((p) => p.idempotencyKey === data.idempotencyKey);
      if (existing) return { ...existing, _idempotent: true };
    }

    const payment = {
      id: `pay_${crypto.randomBytes(7).toString("hex")}`,
      status: "CREATED",
      currency: "USD",
      attempts: [],
      transactionIds: [],
      createdAt: new Date().toISOString(),
      ...data,
    };

    this.payments.push(payment);
    this.save();
    return payment;
  }

  get(id) {
    return this.payments.find((p) => p.id === id);
  }

  list(filters = {}) {
    let results = [...this.payments];
    if (filters.status) results = results.filter((p) => p.status === filters.status);
    if (filters.applicationId) results = results.filter((p) => p.applicationId === filters.applicationId);
    if (filters.orderId) results = results.filter((p) => p.orderId === filters.orderId);
    return results;
  }

  async capture(id) {
    const payment = this.get(id);
    if (!payment) return { ok: false, error: "not_found" };
    if (payment.status !== "AUTHORIZED") {
      return { ok: false, error: "not_authorized", status: payment.status };
    }

    payment.status = "CAPTURED";
    payment.capturedAt = new Date().toISOString();

    const txn = this.transactions.create({
      type: "payment",
      amount: payment.amount,
      currency: payment.currency,
      paymentId: payment.id,
      fromWalletId: payment.fromAccountId,
      toWalletId: payment.toWalletId,
      applicationId: payment.applicationId,
    });

    payment.transactionIds.push(txn.id);
    this.save();

    return { ok: true, payment, transaction: txn };
  }

  decline(id, declineCode) {
    const payment = this.get(id);
    if (!payment) return { ok: false, error: "not_found" };

    const declineDef = this.declineCodes.codes.find((c) => c.code === declineCode);

    payment.status = "DECLINED";
    payment.decline = {
      code: declineCode,
      category: declineDef?.category || "hard",
      reason: declineDef?.description || declineCode,
      retryable: declineDef?.retryable || false,
      advice: declineDef?.advice || "do_not_retry",
      createdAt: new Date().toISOString(),
    };

    payment.attempts.push({
      attemptId: `att_${crypto.randomBytes(4).toString("hex")}`,
      status: "DECLINED",
      declineCode,
      at: new Date().toISOString(),
    });

    this.save();
    return { ok: true, payment, decline: payment.decline };
  }

  // Process a provider webhook. Key on providerPaymentId for idempotency.
  processWebhook({ providerPaymentId, orderId, status, amount, currency }) {
    // Find payment by providerPaymentId
    let payment = this.payments.find((p) => p.providerPaymentId === providerPaymentId);

    // Or by orderId if providerPaymentId not yet set
    if (!payment && orderId) {
      payment = this.payments.find((p) => p.orderId === orderId && p.status === "CREATED");
      if (payment) payment.providerPaymentId = providerPaymentId;
    }

    if (!payment) return { ok: false, error: "payment_not_found" };

    // Only SUCCESS is final. FAILED and PENDING are transitional.
    if (status !== "SUCCESS" && status !== "SETTLED") {
      return { ok: true, action: "ignored", status, reason: "not_final_status" };
    }

    // Already final?
    if (payment.status === "SETTLED" || payment.status === "CAPTURED") {
      return { ok: true, action: "already_final", status: payment.status };
    }

    payment.status = "SETTLED";
    payment.settledAt = new Date().toISOString();

    this.save();
    return { ok: true, action: "settled", payment };
  }
}