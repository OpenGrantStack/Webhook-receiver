import fs from "fs";
import path from "path";
import crypto from "crypto";
import { TransactionEngine } from "./transaction-engine.js";
import { WalletManager } from "./wallet-manager.js";

export class VoidEngine {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.storePath = path.join(rootDir, "finance", ".voids.json");
    this.voids = this.load();
    this.transactions = new TransactionEngine(rootDir);
    this.wallets = new WalletManager(rootDir);
  }

  load() {
    try { return JSON.parse(fs.readFileSync(this.storePath, "utf-8")); }
    catch { return []; }
  }

  save() {
    fs.mkdirSync(path.dirname(this.storePath), { recursive: true });
    fs.writeFileSync(this.storePath, JSON.stringify(this.voids, null, 2));
  }

  async create({ originalTransactionId, type, amount, reason, requestedBy, approvedBy }) {
    const original = this.transactions.get(originalTransactionId);
    if (!original) return { ok: false, error: "original_not_found" };

    // Determine if void or refund is appropriate
    const isSettled = original.status === "SETTLED";
    const resolvedType = type || (isSettled ? "refund" : "void");

    // Void: only before settlement. Refund: only after settlement.
    if (resolvedType === "void" && isSettled) {
      return { ok: false, error: "cannot_void_settled", message: "Use refund instead. Original is already settled.", suggestedType: "refund" };
    }
    if (resolvedType === "refund" && !isSettled) {
      return { ok: false, error: "cannot_refund_unsettled", message: "Use void instead. Original has not settled.", suggestedType: "void" };
    }

    const refundAmount = amount ?? original.amount;
    if (refundAmount > original.amount - (original.refundedAmount || 0)) {
      return { ok: false, error: "refund_exceeds_remaining", original: original.amount, alreadyRefunded: original.refundedAmount || 0 };
    }

    const voidRecord = {
      id: `vod_${crypto.randomBytes(7).toString("hex")}`,
      originalTransactionId,
      type: resolvedType,
      status: "PENDING",
      amount: refundAmount,
      currency: original.currency,
      reason,
      requestedBy,
      approvedBy: approvedBy || [],
      settledAtOriginal: isSettled,
      createdAt: new Date().toISOString(),
    };

    // Execute: reverse the wallets
    if (resolvedType === "void") {
      // Void: reverse the transaction entirely (was PENDING/CAPTURED)
      if (original.toWalletId) this.wallets.debit(original.toWalletId, refundAmount);
      if (original.fromWalletId) this.wallets.credit(original.fromWalletId, refundAmount);
      this.transactions.void(originalTransactionId, reason);
    } else {
      // Refund: return funds but keep record
      if (original.toWalletId) this.wallets.debit(original.toWalletId, refundAmount);
      if (original.fromWalletId) this.wallets.credit(original.fromWalletId, refundAmount);

      original.refundedAmount = (original.refundedAmount || 0) + refundAmount;
      original.status = original.refundedAmount >= original.amount ? "REFUNDED" : "PARTIALLY_REFUNDED";
      this.transactions.save();
    }

    voidRecord.status = "SUCCEEDED";
    this.voids.push(voidRecord);
    this.save();

    return { ok: true, void: voidRecord, originalStatus: original.status };
  }

  list(filters = {}) {
    let results = [...this.voids];
    if (filters.type) results = results.filter((v) => v.type === filters.type);
    if (filters.status) results = results.filter((v) => v.status === filters.status);
    if (filters.originalTransactionId) results = results.filter((v) => v.originalTransactionId === filters.originalTransactionId);
    return results;
  }
}