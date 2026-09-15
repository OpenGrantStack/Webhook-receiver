SECURITY.md
---

### `SECURITY.md`


# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| main    | :white_check_mark: |
| < 1.0   | :x:                |

We currently only support the latest code on the `main` branch.  
Security fixes will be backported only if a stable release series exists.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately using one of the following methods:

1. **Preferred**: Open a private security advisory on GitHub  
   → Go to the repository → **Security** tab → **Report a vulnerability**

2. Email: **security@opengrantstack.org**  
   (or the address listed in the organization profile)

### What to include in your report

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes or mitigations (optional)
- Your preferred contact method

We will acknowledge receipt of your report within **72 hours** and provide a more detailed response within **7 days**.

## Scope

This project is responsible for:

- Receiving and verifying GitHub webhook signatures (HMAC SHA-256)
- Normalizing and routing events
- Writing contribution records to the Ledger

Security issues related to signature verification bypass, injection attacks, unauthorized event processing, or leakage of secrets are considered **in scope**.

## Disclosure Policy

- We follow **coordinated disclosure**.
- We will work with you to understand and fix the issue.
- We will not publicly disclose the vulnerability until a fix is available (or an agreed timeline has passed).
- Credit will be given to reporters unless they prefer to remain anonymous.

## Security Best Practices for Contributors

- Never commit secrets, API keys, or webhook secrets
- Use environment variables / `.env` files (and keep them out of git)
- Validate all incoming webhook payloads with Pydantic models
- Always verify the `X-Hub-Signature-256` header before processing events
- Prefer the principle of least privilege when integrating with the Ledger or other services

## Hall of Fame

We will maintain a list of security researchers who have responsibly disclosed vulnerabilities (with their permission).

---

Thank you for helping keep OpenGrantStack secure and trustworthy.
