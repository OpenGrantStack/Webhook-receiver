import fs from "fs";
import path from "path";
import crypto from "crypto";

export class WalletManager {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.storePath = path.join(rootDir, "finance", ".wallets.json");
    this.wallets = this.load();
  }

  load() {
    try { return JSON.parse(fs.readFileSync(this.storePath, "utf-8")); }
    catch { return []; }
  }

  save() {
    fs.mkdirSync(path.dirname(this.storePath), { recursive: true });
    fs.writeFileSync(this.storePath, JSON.stringify(this.wallets, null, 2));
  }

  create(data) {
    const wallet = {
      id: `wal_${crypto.randomBytes(7).toString("hex")}`,
      type: "internal",
      currency: "USD",
      status: "active",
      balance: { available: 0, pending: 0, reserved: 0, total: 0 },
      signers: [],
      quorum: 1,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.wallets.push(wallet);
    this.save();
    return wallet;
  }

  get(id) {
    return this.wallets.find((w) => w.id === id);
  }

  list(filters = {}) {
    let results = [...this.wallets];
    if (filters.ownerId) results = results.filter((w) => w.ownerId === filters.ownerId);
    if (filters.type) results = results.filter((w) => w.type === filters.type);
    if (filters.status) results = results.filter((w) => w.status === filters.status);
    return results;
  }

  getBalance(id) {
    const wallet = this.get(id);
    if (!wallet) return { error: "not_found" };
    return {
      walletId: id,
      currency: wallet.currency,
      ...wallet.balance,
    };
  }

  credit(id, amount) {
    const wallet = this.get(id);
    if (!wallet) return { ok: false, error: "not_found" };
    wallet.balance.available += amount;
    wallet.balance.total += amount;
    this.save();
    return { ok: true, wallet };
  }

  debit(id, amount) {
    const wallet = this.get(id);
    if (!wallet) return { ok: false, error: "not_found" };
    if (wallet.balance.available < amount) {
      return { ok: false, error: "insufficient_funds", available: wallet.balance.available, requested: amount };
    }
    wallet.balance.available -= amount;
    wallet.balance.total -= amount;
    this.save();
    return { ok: true, wallet };
  }

  reserve(id, amount) {
    const wallet = this.get(id);
    if (!wallet) return { ok: false, error: "not_found" };
    if (wallet.balance.available < amount) {
      return { ok: false, error: "insufficient_funds" };
    }
    wallet.balance.available -= amount;
    wallet.balance.reserved += amount;
    this.save();
    return { ok: true, wallet };
  }

  releaseReserve(id, amount) {
    const wallet = this.get(id);
    if (!wallet) return { ok: false, error: "not_found" };
    wallet.balance.reserved -= amount;
    wallet.balance.available += amount;
    this.save();
    return { ok: true, wallet };
  }
}