import fs from "fs";
import path from "path";

export class TreasuryManager {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.configPath = path.join(rootDir, "finance", "config", "treasuries.json");
    this.config = JSON.parse(fs.readFileSync(this.configPath, "utf-8"));
    this.treasuries = this.config.treasuries.map((t) => ({
      ...t,
      balance: { committed: 0, escrowed: 0, disbursed: 0, available: 0 },
      status: "active",
      createdAt: new Date().toISOString(),
    }));
  }

  list() {
    return this.treasuries;
  }

  get(id) {
    return this.treasuries.find((t) => t.id === id);
  }

  updateBalance(id, patch) {
    const treasury = this.get(id);
    if (!treasury) return { ok: false, error: "not_found" };
    Object.assign(treasury.balance, patch);
    return { ok: true, treasury };
  }

  checkSpendingLimit(treasuryId, amount) {
    const treasury = this.get(treasuryId);
    if (!treasury) return { ok: false, error: "not_found" };

    const limits = [...(treasury.spendingLimits || [])].sort((a, b) => b.threshold - a.threshold);
    for (const limit of limits) {
      if (amount >= limit.threshold) {
        return {
          ok: true,
          threshold: limit.threshold,
          quorumM: limit.quorumM,
          quorumN: limit.quorumN,
          requiresRoles: limit.requiresRoles || [],
        };
      }
    }

    return { ok: true, threshold: 0, quorumM: 1, quorumN: 1, requiresRoles: [] };
  }
}