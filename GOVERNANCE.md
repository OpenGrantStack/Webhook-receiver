# Governance of the OpenGrantStack Webhook Receiver

This document describes the governance model for the **Webhook Receiver** repository within the broader OpenGrantStack ecosystem.

## Mission Alignment

The Webhook Receiver exists to provide a **secure, auditable, and transparent** event-ingestion layer for GitHub App events.  
All governance decisions should support:

- Transparency by default
- Audit readiness
- Modular design
- Community participation
- Long-term sustainability of the OpenGrantStack platform

## Roles

### Maintainers

Maintainers have write access to the repository and are responsible for:

- Reviewing and merging pull requests
- Triaging issues
- Making architectural and design decisions for this service
- Ensuring the project remains aligned with the wider OpenGrantStack architecture
- Enforcing the Code of Conduct

Current maintainers are listed in the `CODEOWNERS` file (when present) and in the organization teams.

### Contributors

Anyone who submits code, documentation, issues, or other improvements is a contributor.  
Contributors do not need formal approval to participate.

### Organization-Level Governance

This repository is part of the **OpenGrantStack** organization.  
High-level policy, compliance, ethics, and cross-repo standards are defined in the central [governance](https://github.com/OpenGrantStack/governance) repository.

When a conflict arises between this document and organization-level governance, the organization-level document takes precedence.

## Decision Making

We use a lightweight consensus model:

1. **Routine changes** (bug fixes, small features, documentation)  
   → Approved by any maintainer via PR review.

2. **Significant changes** (new event types, breaking API changes, major architectural shifts)  
   → Discussion in a GitHub issue or discussion first.  
   → Requires approval from at least two maintainers (or one maintainer + clear community consensus).

3. **Security-related changes**  
   → Follow the process in [SECURITY.md](SECURITY.md).

Decisions are recorded in pull request discussions and, when appropriate, in the project roadmap.

## Adding or Removing Maintainers

- New maintainers are nominated by existing maintainers based on sustained, high-quality contributions and demonstrated alignment with project values.
- Nominations are discussed privately among current maintainers and then announced publicly.
- Maintainers may step down at any time by notifying the other maintainers.
- Inactive maintainers (no meaningful contribution for 6+ months) may be moved to emeritus status after discussion.

## Code of Conduct

All participants must follow the [Code of Conduct](CODE_OF_CONDUCT.md).  
Violations are handled according to the process defined in that document and by the OpenGrantStack organization.

## Amendments

This governance document may be updated via a pull request.  
Significant changes should be discussed in an issue first and require maintainer consensus.

---

**OpenGrantStack** is committed to open, transparent, and community-driven governance.  
Questions about governance can be raised as GitHub issues or directed to the organization maintainers.
