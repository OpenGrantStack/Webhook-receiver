import fs from "fs";
import path from "path";
import crypto from "crypto";

export class PayloadVerifier {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.storePath = path.join(rootDir, "finance", ".payloads.json");
    this.processedEvents = new Set();
    this.payloads = this.load();
    this.secrets = {
      stripe: process.env.STRIPE_WEBHOOK_SECRET,
      circle: process.env.CIRCLE_WEBHOOK_SECRET,
      request_network: process.env.REQUEST_NETWORK_WEBHOOK_SECRET,
      safe: process.env.SAFE_WEBHOOK_SECRET,
      stellar: process.env.STELLAR_WEBHOOK_SECRET,
      custom: process.env.CUSTOM_WEBHOOK_SECRET,
    };
  }

  load() {
    try { return JSON.parse(fs.readFileSync(this.storePath, "utf-8")); }
    catch { return []; }
  }

  save() {
    fs.mkdirSync(path.dirname(this.storePath), { recursive: true });
    fs.writeFileSync(this.storePath, JSON.stringify(this.payloads.slice(-1000), null, 2));
  }

  verifySignature(source, rawBody, signature) {
    const secret = this.secrets[source];
    if (!secret) return { valid: false, error: "no_secret_configured" };
    if (!signature) return { valid: false, error: "missing_signature" };

    // HMAC-SHA256 over the raw request body (never re-serialized JSON)
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const provided = signature.replace(/^sha256=/, "");

    try {
      const valid = crypto.timingSafeEqual(
        Buffer.from(expected, "hex"),
        Buffer.from(provided, "hex")
      );
      return { valid };
    } catch {
      return { valid: false, error: "signature_mismatch" };
    }
  }

  async process(source, rawBody, signature, headers = {}) {
    // Signature verification
    const sigResult = this.verifySignature(source, rawBody, signature);

    // Deduplicate by event ID (provider-supplied, unique per delivery)
    const eventId = headers["x-event-id"] || headers["x-github-delivery"] || headers["x-idempotency-key"];

    if (eventId && this.processedEvents.has(eventId)) {
      return { ok: true, action: "duplicate", eventId };
    }

    let body;
    try { body = JSON.parse(rawBody); }
    catch { return { ok: false, error: "invalid_json" }; }

    const payload = {
      id: `pld_${crypto.randomBytes(7).toString("hex")}`,
      source,
      event: headers["x-event-type"] || body.type || body.event || "unknown",
      eventId: eventId || null,
      receivedAt: new Date().toISOString(),
      signatureValid: sigResult.valid,
      rawBody: rawBody.slice(0, 10000),
      body,
      processed: false,
    };

    // Reject invalid signatures
    if (!sigResult.valid) {
      payload.processingError = sigResult.error;
      this.payloads.push(payload);
      this.save();
      return { ok: false, error: "invalid_signature", detail: sigResult.error };
    }

    // Mark as processed
    if (eventId) this.processedEvents.add(eventId);
    payload.processed = true;
    payload.processedAt = new Date().toISOString();

    this.payloads.push(payload);
    this.save();

    return { ok: true, action: "processed", payload };
  }

  list(filters = {}) {
    let results = [...this.payloads];
    if (filters.source) results = results.filter((p) => p.source === filters.source);
    if (filters.event) results = results.filter((p) => p.event === filters.event);
    if (filters.signatureValid !== undefined) results = results.filter((p) => p.signatureValid === filters.signatureValid);
    return results;
  }
}