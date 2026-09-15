import fs from "fs";
import path from "path";
import crypto from "crypto";

export class TransactionEngine {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.storePath = path.join(rootDir, "finance", ".transactions.json");
    this.idempotencyPath = path.join(rootDir, "finance", ".idempotency.json");
    this.transactions = this.load(this.storePath);
    this.idempotency = this.load(this.idempotencyPath, {});
  }

  load(p, fallback = []) {
    try { return JSON.parse(fs.readFileSync(p, "utf-8")); }
    catch { return fallback; }
  }

  save() {
    fs.mkdirSync(path.dirname(this.storePath), { recursive: true });
    fs.writeFileSync(this.storePath, JSON.stringify(this.transactions, null, 2));
    fs.writeFileSync(this.idempotencyPath, JSON.stringify(this.idempotency, null, 2));
  }

  create(data) {
    // Idempotency: if the same key was used, return the existing transaction
    if (data.idempotencyKey && this.idempotency[data.idempotencyKey]) {
      const existing = this.get(this.idempotency[data.idempotencyKey]);
      return { ...existing, _idempotent: true };
    }

    const txn = {
      id: `txn_${crypto.randomBytes(7).toString("hex")}`,
      status: "PENDING",
      confirmations: 0,
      requiredConfirmations: 1,
      refundedAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    if (data.idempotencyKey) {
      this.idempotency[data.idempotencyKey] = txn.id;
    }

    this.transactions.push(txn);
    this.save();
    return txn;
  }

  get(id) {
    return this.transactions.find((t) => t.id === id);
  }

  list(filters = {}) {
    let results = [...this.transactions];
    if (filters.status) results = results.filter((t) => t.status === filters.status);
    if (filters.type) results = results.filter((t) => t.type === filters.type);
    if (filters.fromWalletId) results = results.filter((t) => t.fromWalletId === filters.fromWalletId);
    if (filters.toWalletId) results = results.filter((t) => t.toWalletId === filters.toWalletId);
    if (filters.applicationId) results = results.filter((t) => t.applicationId === filters.applicationId);
    if (filters.parentTransactionId) results = results.filter((t) => t.parentTransactionId === filters.parentTransactionId);
    return results;
  }

  update(id, patch) {
    const txn = this.get(id);
    if (!txn) return null;
    Object.assign(txn, patch, { updatedAt: new Date().toISOString() });
    this.save();
    return txn;
  }

  confirm(id, { providerRef, blockNumber, confirmations }) {
    const txn = this.get(id);
    if (!txn) return { ok: false, error: "not_found" };

    txn.confirmations = confirmations ?? (txn.confirmations + 1);
    txn.providerRef = providerRef || txn.providerRef;

    if (txn.confirmations >= txn.requiredConfirmations) {
      txn.status = "SETTLED";
      txn.confirmedAt = new Date().toISOString();
      txn.settledAt = new Date().toISOString();
    }

    this.save();
    return { ok: true, transaction: txn };
  }

  decline(id, { declineCode, declineReason }) {
    const txn = this.get(id);
    if (!txn) return { ok: false, error: "not_found" };

    txn.status = "DECLINED";
    txn.declineCode = declineCode;
    txn.declineReason = declineReason;
    txn.updatedAt = new Date().toISOString();

    this.save();
    return { ok: true, transaction: txn };
  }

  void(id, reason) {
    const txn = this.get(id);
    if (!txn) return { ok: false, error: "not_found" };

    if (txn.status === "SETTLED") {
      return { ok: false, error: "already_settled", message: "Cannot void a settled transaction. Use refund instead." };
    }

    txn.status = "VOIDED";
    txn.voidedAt = new Date().toISOString();
    txn.metadata = { ...(txn.metadata || {}), voidReason: reason };

    this.save();
    return { ok: true, transaction: txn };
  }

  reconcile({ from, to, walletId }) {
    let txns = [...this.transactions];
    if (from) txns = txns.filter((t) => t.createdAt >= from);
    if (to) txns = txns.filter((t) => t.createdAt <= to);
    if (walletId) txns = txns.filter((t) => t.fromWalletId === walletId || t.toWalletId === walletId);

    const summary = txns.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      acc._totalAmount = (acc._totalAmount || 0) + (t.amount || 0);
      return acc;
    }, {});

    return {
      generatedAt: new Date().toISOString(),
      filters: { from, to, walletId },
      totalTransactions: txns.length,
      summary,
      discrepancies: txns.filter((t) => t.status === "PENDING" && Date.now() - new Date(t.createdAt).getTime() > 86400000),
    };
  }
}