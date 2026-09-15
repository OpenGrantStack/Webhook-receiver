import fs from "fs";
import path from "path";
import crypto from "crypto";

export class ApplicationManager {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.storePath = path.join(rootDir, "finance", ".applications.json");
    this.fsmPath = path.join(rootDir, "finance", "state-machines", "application.fsm.json");
    this.fsm = JSON.parse(fs.readFileSync(this.fsmPath, "utf-8"));
    this.applications = this.load();
  }

  load() {
    try { return JSON.parse(fs.readFileSync(this.storePath, "utf-8")); }
    catch { return []; }
  }

  save() {
    fs.mkdirSync(path.dirname(this.storePath), { recursive: true });
    fs.writeFileSync(this.storePath, JSON.stringify(this.applications, null, 2));
  }

  create(data) {
    const app = {
      id: `app_${crypto.randomBytes(7).toString("hex")}`,
      state: "DRAFT",
      previousState: null,
      stateHistory: [],
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.applications.push(app);
    this.save();
    return app;
  }

  get(id) {
    return this.applications.find((a) => a.id === id);
  }

  list(filters = {}) {
    let results = [...this.applications];
    if (filters.state) results = results.filter((a) => a.state === filters.state);
    if (filters.applicantId) results = results.filter((a) => a.applicantId === filters.applicantId);
    if (filters.programId) results = results.filter((a) => a.programId === filters.programId);
    return results;
  }

  transition(id, action, context = {}) {
    const app = this.get(id);
    if (!app) return { ok: false, error: "not_found" };

    const stateDef = this.fsm.states[app.state];
    if (!stateDef) return { ok: false, error: "invalid_state", state: app.state };

    const transition = stateDef.transitions[action];
    if (!transition) {
      return { ok: false, error: "invalid_transition", from: app.state, action, allowed: Object.keys(stateDef.transitions) };
    }

    // Guard check
    if (transition.guard && !this.checkGuard(transition.guard, app, context)) {
      return { ok: false, error: "guard_failed", guard: transition.guard };
    }

    // Required fields
    if (transition.requires) {
      const missing = transition.requires.filter((r) => !context[r] && !app[r]);
      if (missing.length) {
        return { ok: false, error: "missing_fields", missing };
      }
    }

    const from = app.state;
    app.previousState = from;
    app.state = transition.to;
    app.stateHistory = app.stateHistory || [];
    app.stateHistory.push({
      from,
      to: transition.to,
      at: new Date().toISOString(),
      actor: context.actor || "system",
      reason: context.reason,
    });

    if (transition.to === "SUBMITTED") app.submittedAt = new Date().toISOString();
    if (["APPROVED", "DECLINED"].includes(transition.to)) app.decidedAt = new Date().toISOString();

    this.save();
    return { ok: true, application: app, transition: { from, to: transition.to, action } };
  }

  checkGuard(guard, app, context) {
    switch (guard) {
      case "validateRequiredFields":
        return !!(app.applicantId && app.programId);
      case "minScore":
        return (app.score || 0) >= 60;
      default:
        return true;
    }
  }
}