---
title: Cerbi Suite – Unified Logging, Governance, and Observability
description: Enterprise-grade structured logging, governance enforcement, and predictive ML insights
layout: default
---


---

# Cerbi Suite – Unified Logging, Governance, and Observability

> 🔒 Enterprise-Grade Logging · ⚙️ Developer-Centric Tooling · 🌩️ Built for Cloud-Native & Hybrid Environments

---

## 🚀 What is Cerbi?

**Cerbi** is a modular suite of logging and observability tools designed for secure, standardized, and intelligent telemetry pipelines across distributed systems. The suite includes:

- ✅ **CerbiStream** – A next-gen structured logging library
- ✅ **GovernanceAnalyzer** – Build-time enforcement of log governance via Roslyn
- 🟦 **CerbiGov** *(Coming Soon)* – Lightweight UI for designing governance rules
- 🟩 **CerbiIQ** *(Coming Soon)* – Smart routing engine hosted in the client tenant
- 🧠 **CerbiSense** *(Coming Soon)* – ML-based predictive analytics

All tools work together but are fully **decoupled**, giving you total control and flexibility.

---

## 🔧 CerbiStream – Logging Library

> `dotnet add package CerbiStream`

Secure, high-performance logging for .NET:

- Enrich logs with consistent contextual metadata (`ServiceName`, `UserType`, `Feature`, etc.)
- Send logs to multiple destinations (RabbitMQ, Kafka, Azure, AWS, GCP, etc.)
- Optimize telemetry via filtering, sampling, and retry awareness
- Support for all major cloud telemetry services including Azure Application Insights, AWS CloudWatch, and Google Cloud Trace

📊 [View on NuGet »](https://www.nuget.org/packages/CerbiStream) · [🔗 GitHub Repo](https://github.com/Zeroshi/Cerbi-CerbiStream)

---

## 🛡️ GovernanceAnalyzer – Roslyn Analyzer

> `dotnet add package CerbiStream.GovernanceAnalyzer`

GovernanceAnalyzer enforces structured logging at build time:

- Validates required and optional fields
- Integrates with `cerbi_governance.json` for flexible profiles
- Blocks build if logs do not conform to declared governance rules

📊 [View on NuGet »](https://www.nuget.org/packages/CerbiStream.GovernanceAnalyzer) · 🔐 Enforces compliance without runtime impact

---

## 🧰 CerbiGov – Governance Dashboard *(Coming Soon)*

A sleek, tenant-hosted UI for:

- Designing and maintaining log governance policies
- Exporting configurations directly for build analyzers
- (Planned) Lockdown integration to enforce logging rules across projects

---

## 🔮 CerbiIQ – Smart Routing Engine *(Coming Soon)*

A lightweight message router hosted in the client’s tenant:

- Reads messages from CerbiStream queues
- Parses metadata for routing to appropriate destinations
- Supports custom schema logic and business filtering

---

## 🧠 CerbiSense – Predictive ML Engine *(Coming Soon)*

A centralized AI engine hosted by Cerbi:

- Consumes metadata from CerbiIQ
- Performs trend and anomaly detection using ML models
- Offers optional dashboards and reports (e.g., Power BI integrations)

---

## 🧪 Quality, Badges & Developer Info

| Package | NuGet | Downloads | License | Framework |
|--------|--------|-----------|---------|-----------|
| **CerbiStream** | ![NuGet](https://img.shields.io/nuget/v/CerbiStream?style=flat-square) | ![NuGet Downloads](https://img.shields.io/nuget/dt/CerbiStream?style=flat-square) | ![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square) | ![.NET](https://img.shields.io/badge/.NET-8.0-blue?style=flat-square) |
| **GovernanceAnalyzer** | ![NuGet](https://img.shields.io/nuget/v/CerbiStream.GovernanceAnalyzer?style=flat-square) | ![NuGet Downloads](https://img.shields.io/badge/Downloads-350%2B-blue?style=flat-square) | ![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square) | ![.NET](https://img.shields.io/badge/.NET-8.0-blue?style=flat-square) |

---

## 🌱 Support & Feedback

✅ GitHub Discussions and Issues Enabled  
✅ MIT License on open-source packages  
🔜 Newsletter & Early Access signups (via GitHub Pages Forms or StaticKit)

[📂 GitHub Home](https://github.com/Zeroshi) · [🧵 Join Discussion](https://github.com/Zeroshi/Cerbi-CerbiStream/discussions)

---

## 🐾 What's Next

- 🌐 Azure Marketplace integration
- 📬 Product Hunt launch + Dev.to announcement draft

---

Have questions, ideas, or interest in Cerbi for your org?
📧 Contact: **forest@wakingforest.dev**
