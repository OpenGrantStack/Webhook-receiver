OpenGrantStack — Webhook Receiver

The OpenGrantStack Webhook Receiver is the secure event‑ingestion layer for the entire OpenGrantStack ecosystem. It verifies GitHub webhook signatures, normalizes incoming events, routes them to the correct handlers, and writes audit‑ready contribution entries into the OpenGrantStack Ledger.

This service is the backbone of contributor analytics, governance automation, and transparent grant reporting.

---

🚀 Purpose

This repository provides:

- A FastAPI-based webhook endpoint for GitHub App events  
- HMAC SHA‑256 signature verification  
- Event normalization and dispatching  
- Handler modules for issues, PRs, pushes, discussions, and more  
- A unified interface for writing contribution entries to the Ledger  
- Audit‑ready logging for governance and compliance  

---

📦 Features

- 🔐 Secure signature verification for all GitHub events  
- 🧩 Modular event handlers for each GitHub event type  
- 📘 Pydantic models for strict validation  
- 🧭 Dispatcher system for routing events  
- 📊 Contribution ledger integration  
- 🧪 Full test suite with CI coverage enforcement  
- 📚 Unified documentation pattern across all repos  

---

📁 Repository Structure

See docs/structure.md for the deep architecture, but here’s the high‑level view:

`
/
├── src/
│   ├── main.py
│   ├── config.py
│   ├── routers/
│   ├── adapters/
│   ├── services/
│   ├── models/
│   └── utils/
├── tests/
├── docs/
├── .github/workflows/
├── pyproject.toml
└── README.md
`

---

🛠️ Installation

`bash
git clone https://github.com/OpenGrantStack/webhook-receiver
cd webhook-receiver
pip install -r requirements.txt
`

---

▶️ Running the Server

`bash
uvicorn src.main:app --reload --port 8000
`

---

🧪 Running Tests

`bash
pytest --maxfail=1 --disable-warnings -q
`

---

🔌 Integrations

- GitHub App: Receives all webhook events  
- OpenGrantStack Ledger: Writes contribution entries  
- OpenGrantStack Hub: Surfaces analytics and contributor insights  

---

🧭 Governance & Compliance

This repository follows the OpenGrantStack governance model:

- GOVERNANCE.md  
- SECURITY.md  
- CONTRIBUTING.md  
- CODEOFCONDUCT.md  

---

🗺️ Roadmap

See the unified roadmap:  
https://github.com/OpenGrantStack/roadmap

---

🧑‍🤝‍🧑 Contributors

See CONTRIBUTORS.md

---

📄 License

APACHE 2.0 License — see LICENSE
# Webhook-receiver
The OpenGrantStack Webhook Receiver is the secure event‑ingestion layer for the entire OpenGrantStack ecosystem. It verifies GitHub webhook signatures, normalizes incoming events, routes them to the correct handlers, and writes audit‑ready contribution entries into the OpenGrantStack Ledger.
