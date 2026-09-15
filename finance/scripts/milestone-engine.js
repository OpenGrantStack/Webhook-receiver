import fs from "fs";
import path from "path";
import crypto from "crypto";
import { TransferOrchestrator } from "./transfer-orchestrator.js";

export class MilestoneEngine {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.storePath = path.join(rootDir, "finance", ".milestones.json");
    this.fsm = JSON.parse(fs.readFileSync(path.join(rootDir, "finance", "state-machines", "milestone.fsm.json"), "utf-8"));
    this.milestones = this.load();
    this.transfers = new TransferOrchestrator(rootDir);
  }

  load() {
    try { return JSON.parse(fs.readFileSync(this.storePath, "utf-8")); }
    catch { return []; }
  }

  save() {
    fs.mkdirSync(path.dirname(this.storePath), { recursive: true });
    fs.writeFileSync(this.storePath, JSON.stringify(this.milestones, null, 2));
  }

  create(data) {
    const milestone = {
      id: `mls_${crypto.randomBytes(7).toString("hex")}`,
      status: "PENDING",
      proofArtifacts: [],
      reviewers: [],
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.milestones.push(milestone);
    this.save();
    return milestone;
  }

  get(id) {
    return this.milestones.find((m) => m.id === id);
  }

  list(filters = {}) {
    let results = [...this.milestones];
    if (filters.applicationId) results = results.filter((m) => m.applicationId === filters.applicationId);
    if (filters.status) results = results.filter((m) => m.status === filters.status);
    return results;
  }

  submitProof(id, { artifacts, submittedBy }) {
    const milestone = this.get(id);
    if (!milestone) return { ok: false, error: "not_found" };
    if (milestone.status !== "IN_PROGRESS") {
      return { ok: false, error: "invalid_state", status: milestone.status, expected: "IN_PROGRESS" };
    }

    // Verify each artifact has a hash
    for (const artifact of artifacts || []) {
      if (!artifact.hash) {
        return { ok: false, error: "missing_hash", artifact };
      }
      artifact.submittedAt = new Date().toISOString();
      artifact.submittedBy = submittedBy;
    }

    milestone.proofArtifacts = artifacts || [];
    milestone.status = "SUBMITTED";

    this.save();
    return { ok: true, milestone };
  }

  approve(id, { reviewerId, notes }) {
    const milestone = this.get(id);
    if (!milestone) return { ok: false, error: "not_found" };
    if (milestone.status !== "SUBMITTED" && milestone.status !== "UNDER_REVIEW") {
      return { ok: false, error: "invalid_state", status: milestone.status };
    }

    milestone.status = "APPROVED";
    milestone.approvedAt = new Date().toISOString();
    milestone.reviewNotes = notes;
    milestone.reviewers = [...(milestone.reviewers || []), reviewerId];

    this.save();
    return { ok: true, milestone };
  }

  async pay(id, { fromWalletId, toWalletId, proposedBy }) {
    const milestone = this.get(id);
    if (!milestone) return { ok: false, error: "not_found" };
    if (milestone.status !== "APPROVED") {
      return { ok: false, error: "not_approved", status: milestone.status };
    }

    const transferResult = this.transfers.propose({
      fromWalletId,
      toWalletId,
      amount: milestone.amount,
      currency: milestone.currency,
      applicationId: milestone.applicationId,
      milestoneId: milestone.id,
      proposedBy,
      reason: `Payout for milestone: ${milestone.title}`,
    });

    if (!transferResult.ok) return transferResult;

    milestone.transferId = transferResult.transfer.id;
    milestone.status = "PAID";
    milestone.paidAt = new Date().toISOString();

    this.save();
    return { ok: true, milestone, transfer: transferResult.transfer };
  }

  reject(id, { reason, reviewerId }) {
    const milestone = this.get(id);
    if (!milestone) return { ok: false, error: "not_found" };

    milestone.status = "REJECTED";
    milestone.rejectionReason = reason;
    milestone.reviewers = [...(milestone.reviewers || []), reviewerId];

    this.save();
    return { ok: true, milestone };
  }
}