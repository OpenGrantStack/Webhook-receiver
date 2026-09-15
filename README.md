
# OpenGrantStack — Webhook Receiver

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Status](https://img.shields.io/badge/Status-Active-yellow)](https://github.com/OpenGrantStack)
[![Progress](https://img.shields.io/badge/Progress-60%25-yellow)](https://github.com/OpenGrantStack)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Secure event-ingestion layer for the entire OpenGrantStack ecosystem.**

The Webhook Receiver verifies GitHub webhook signatures, normalizes incoming events, routes them to the correct handlers, and writes audit-ready contribution entries into the OpenGrantStack Ledger.

It is the backbone of contributor analytics, governance automation, and transparent grant reporting.

---

## 📊 Project Status

| Metric              | Value                          |
|---------------------|--------------------------------|
| **Progress**        | ████████████░░░░░░░░ **60%**  |
| **Tier**            | 🟡 Active (50–74)             |
| **Primary Language**| Python (FastAPI)              |
| **License**         | Apache 2.0                    |

**Live completion badges** (auto-update once status files are published):

![webhook-receiver](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/OpenGrantStack/.github/main/status/webhook-receiver.json)
![GrantReady-Ledger](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/OpenGrantStack/.github/main/status/GrantReady-Ledger.json)
![GrantReady-hub-SaaS](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/OpenGrantStack/.github/main/status/GrantReady-hub-SaaS.json)

> Progress is estimated from the OpenGrantStack org scoring rubric (description, LICENSE, README quality, tests, CI, recent activity, releases). Live badges will auto-update once the org scanner is run.

---

## 🚀 Purpose

This repository provides:

- A **FastAPI**-based webhook endpoint for GitHub App events
- **HMAC SHA-256** signature verification
- Event normalization and dispatching
- Modular handler modules for issues, pull requests, pushes, discussions, and more
- A unified interface for writing contribution entries to the **OpenGrantStack Ledger**
- Audit-ready logging for governance and compliance

---

## ✨ Features

| Feature                        | Description                                      |
|--------------------------------|--------------------------------------------------|
| 🔐 Secure Signature Verification | HMAC SHA-256 validation for every GitHub event  |
| 🧩 Modular Event Handlers      | Clean handlers per GitHub event type             |
| 📘 Pydantic Models             | Strict request/response validation               |
| 🧭 Event Dispatcher            | Routes events to the correct handler             |
| 📊 Ledger Integration          | Writes normalized contribution records           |
| 🧪 Test Suite + CI             | Full coverage enforcement via GitHub Actions     |
| 📚 Unified Docs Pattern        | Matches the OpenGrantStack documentation standard|

---

## 📁 Repository Structure

```
/
├── src/
│   ├── main.py              # FastAPI application entrypoint
│   ├── config.py            # Configuration & secrets
│   ├── routers/             # Webhook routes
│   ├── adapters/            # External service adapters (Ledger, etc.)
│   ├── services/            # Business logic & dispatchers
│   ├── models/              # Pydantic models
│   └── utils/               # Helpers (signature verification, etc.)
├── tests/                   # Unit + integration tests
├── docs/                    # Architecture, API, structure docs
├── .github/workflows/       # CI/CD pipelines
├── pyproject.toml           # Project metadata & dependencies
└── README.md
```

> Detailed architecture lives in `docs/structure.md` (coming soon).

---

## 🛠️ Installation

### Prerequisites

- **Python 3.11+**
- `pip` and `venv` (usually included with Python)
- A GitHub App webhook secret (for signature verification)
- (Optional) Docker & Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/OpenGrantStack/Webhook-receiver.git
cd Webhook-receiver
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (CMD)
.venv\Scripts\activate.bat
```

### 3. Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt

# Development extras (tests, linting, etc.)
# pip install -r requirements-dev.txt
# or once pyproject.toml is complete:
# pip install -e ".[dev]"
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env   # if the example file exists
```

Minimum required variables:

```env
# GitHub Webhook Secret (from your GitHub App settings)
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# Optional: Ledger / Hub connection details
LEDGER_API_URL=https://ledger.opengrantstack.example
LEDGER_API_KEY=your_ledger_api_key

# Server
HOST=0.0.0.0
PORT=8000
```

> **Never commit real secrets.** Keep `.env` in `.gitignore`.

### 5. (Optional) Run with Docker

```bash
docker build -t opengrantstack/webhook-receiver .
docker run -p 8000:8000 --env-file .env opengrantstack/webhook-receiver
```

Or with Docker Compose (once `docker-compose.yml` is available):

```bash
docker compose up --build
```

---

## ▶️ Running the Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The webhook endpoint will be available at:

```
POST http://localhost:8000/webhooks/github
```

Health check (once implemented):

```
GET http://localhost:8000/health
```

---

## 🧪 Running Tests

```bash
pytest --maxfail=1 --disable-warnings -q
```

With coverage:

```bash
pytest --cov=src --cov-report=term-missing
```

---

## 🔌 Integrations

| Service                    | Role                                      |
|----------------------------|-------------------------------------------|
| **GitHub App**             | Source of all webhook events              |
| **OpenGrantStack Ledger**  | Destination for contribution entries      |
| **OpenGrantStack Hub**     | Surfaces analytics & contributor insights |

---

## 🧭 Governance & Compliance

This repository follows the OpenGrantStack governance model:

- [GOVERNANCE.md](GOVERNANCE.md)
- [SECURITY.md](SECURITY.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

All contribution activity is designed to be **audit-ready** and fully transparent.

---

## 🗺️ Roadmap

See the unified OpenGrantStack roadmap:

→ [https://github.com/OpenGrantStack/roadmap](https://github.com/OpenGrantStack/roadmap)

---

## 🤝 Contributing

We welcome contributions of all kinds!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting.

---

## 📄 License

Licensed under the **Apache License 2.0**.

See [LICENSE](LICENSE) for the full text.

---

<div align="center">

**Part of the [OpenGrantStack](https://github.com/OpenGrantStack) ecosystem**  
*Open infrastructure for transparent, auditable, community-driven grantmaking.*

[Website](https://opengrantstack.publicvm.com) · [Organization](https://github.com/OpenGrantStack) · [Roadmap](https://github.com/OpenGrantStack/roadmap)

</div>
```

The Installation section is now significantly more complete and production-ready.


# OpenGrantStack — Webhook Receiver

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Status](https://img.shields.io/badge/Status-Active-yellow)](https://github.com/OpenGrantStack)
[![Progress](https://img.shields.io/badge/Progress-60%25-yellow)](https://github.com/OpenGrantStack)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Secure event-ingestion layer for the entire OpenGrantStack ecosystem.**

The Webhook Receiver verifies GitHub webhook signatures, normalizes incoming events, routes them to the correct handlers, and writes audit-ready contribution entries into the OpenGrantStack Ledger.

It is the backbone of contributor analytics, governance automation, and transparent grant reporting.

---

## 📊 Project Status

| Metric              | Value                          |
|---------------------|--------------------------------|
| **Progress**        | ████████████░░░░░░░░ **60%**  |
| **Tier**            | 🟡 Active (50–74)             |
| **Primary Language**| Python (FastAPI)              |
| **License**         | Apache 2.0                    |

> Progress is estimated from the OpenGrantStack org scoring rubric (description, LICENSE, README quality, tests, CI, recent activity, releases). Live badges will auto-update once the org scanner is run.

---

## 🚀 Purpose

This repository provides:

- A **FastAPI**-based webhook endpoint for GitHub App events
- **HMAC SHA-256** signature verification
- Event normalization and dispatching
- Modular handler modules for issues, pull requests, pushes, discussions, and more
- A unified interface for writing contribution entries to the **OpenGrantStack Ledger**
- Audit-ready logging for governance and compliance

---

## ✨ Features

| Feature                        | Description                                      |
|--------------------------------|--------------------------------------------------|
| 🔐 Secure Signature Verification | HMAC SHA-256 validation for every GitHub event  |
| 🧩 Modular Event Handlers      | Clean handlers per GitHub event type             |
| 📘 Pydantic Models             | Strict request/response validation               |
| 🧭 Event Dispatcher            | Routes events to the correct handler             |
| 📊 Ledger Integration          | Writes normalized contribution records           |
| 🧪 Test Suite + CI             | Full coverage enforcement via GitHub Actions     |
| 📚 Unified Docs Pattern        | Matches the OpenGrantStack documentation standard|

---

## 📁 Repository Structure

```
/
├── src/
│   ├── main.py              # FastAPI application entrypoint
│   ├── config.py            # Configuration & secrets
│   ├── routers/             # Webhook routes
│   ├── adapters/            # External service adapters (Ledger, etc.)
│   ├── services/            # Business logic & dispatchers
│   ├── models/              # Pydantic models
│   └── utils/               # Helpers (signature verification, etc.)
├── tests/                   # Unit + integration tests
├── docs/                    # Architecture, API, structure docs
├── .github/workflows/       # CI/CD pipelines
├── pyproject.toml           # Project metadata & dependencies
└── README.md
```

> Detailed architecture lives in `docs/structure.md` (coming soon).

---

## 🛠️ Installation

```bash
git clone https://github.com/OpenGrantStack/Webhook-receiver.git
cd Webhook-receiver

# Recommended: use a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

pip install -r requirements.txt
# or (once pyproject.toml is fully set up)
# pip install -e ".[dev]"
```

---

## ▶️ Running the Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The webhook endpoint will be available at:

```
POST http://localhost:8000/webhooks/github
```

---

## 🧪 Running Tests

```bash
pytest --maxfail=1 --disable-warnings -q
```

With coverage:

```bash
pytest --cov=src --cov-report=term-missing
```

---

## 🔌 Integrations

| Service                    | Role                                      |
|----------------------------|-------------------------------------------|
| **GitHub App**             | Source of all webhook events              |
| **OpenGrantStack Ledger**  | Destination for contribution entries      |
| **OpenGrantStack Hub**     | Surfaces analytics & contributor insights |

---

## 🧭 Governance & Compliance

This repository follows the OpenGrantStack governance model:

- [GOVERNANCE.md](GOVERNANCE.md)
- [SECURITY.md](SECURITY.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

All contribution activity is designed to be **audit-ready** and fully transparent.

---

## 🗺️ Roadmap

See the unified OpenGrantStack roadmap:

→ [https://github.com/OpenGrantStack/roadmap](https://github.com/OpenGrantStack/roadmap)

---

## 🤝 Contributing

We welcome contributions of all kinds!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting.

---

## 📄 License

Licensed under the **Apache License 2.0**.

See [LICENSE](LICENSE) for the full text.

---

<div align="center">

**Part of the [OpenGrantStack](https://github.com/OpenGrantStack) ecosystem**  
*Open infrastructure for transparent, auditable, community-driven grantmaking.*

[Website](https://opengrantstack.publicvm.com) · [Organization](https://github.com/OpenGrantStack) · [Roadmap](https://github.com/OpenGrantStack/roadmap)

</div>


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
