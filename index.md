---
title: Cerbi Suite – Unified Logging, Governance, and Observability
description: Enterprise-grade structured logging, encryption support, governance enforcement, and predictive ML insights
layout: default
---

# Cerbi Suite – Unified Logging, Governance, and Observability

> 🔐 Structured Logging · 🧠 Developer-First Observability · 🌐 Cloud-Native & Portable

---

## 🚀 What is Cerbi?

**Cerbi** is a modular observability platform offering precise control over how logs are generated, enriched, encrypted, validated, and routed.

Unlike traditional log aggregators, Cerbi enhances logging **at the source**, ensuring consistency, security, and compliance before the logs ever leave your service.

---

## 🔧 Core Components

| Component         | Description                                                  |
|------------------|--------------------------------------------------------------|
| **CerbiStream**   | Structured logging library with encryption & metadata        |
| **GovernanceAnalyzer** | Roslyn analyzer for build-time schema validation        |
| **CerbiShield** *(coming soon)* | Governance rule UI builder                      |
| **CerbIQ** *(coming soon)*     | Smart, schema-driven log router                  |
| **CerbiSense** *(coming soon)* | ML-powered anomaly & trend detection             |

---

## 📐 Cerbi Architecture Overview

![Cerbi Architecture Diagram](https://github.com/Zeroshi/CerbiSite/blob/main/Cerbi-updated.png?raw=true)

**CerbiStream** is your entry point. It encrypts logs, adds metadata, validates structure (optionally), and dispatches them to your queues. From there:

- **GovernanceAnalyzer** (Roslyn) ensures developers comply with defined structures.
- **CerbiShield** will be a visual governance policy builder.
- **CerbIQ** routes logs to tools like Splunk, Datadog, etc., filtering by schema.
- **CerbiSense** uses ML to detect patterns, outliers, and potential failures via enriched metadata.

> 🧱 All components are decoupled. Use only what you need.

---

## 💡 Why Cerbi?

Cerbi complements your logging ecosystem — not replaces it.

| Feature                         | CerbiStream | Serilog | Fluentd | Datadog |
|--------------------------------|-------------|---------|---------|---------|
| Structured logging             | ✅          | ✅      | ✅      | ✅      |
| Governance enforcement         | ✅ (Roslyn) | ❌      | ❌      | ❌      |
| Built-in encryption (Base64/AES)| ✅         | ❌*     | ❌      | ✅      |
| Plug-and-play config modes     | ✅          | Partial | ❌      | ❌      |
| Multi-queue routing (Kafka, etc.) | ✅       | Partial | ✅      | ❌      |
| ML-ready metadata              | ✅          | ❌      | ❌      | ✅      |
| Developer simplicity           | ✅          | ✅      | ❌      | ✅      |
| Host in your tenant            | ✅          | ✅      | ✅      | ❌      |

> *Serilog supports encryption through custom sinks but lacks native log-level encryption models.

---

## 🔐 Encryption Benchmarks

Benchmarks were executed using `BenchmarkDotNet` across supported strategies.

| Scenario                 | Mean (ms) | Allocated (KB) | Description                  |
|--------------------------|-----------|----------------|------------------------------|
| `Serilog_LogWithBase64`  | 0.375     | 5.82           | Serilog + Base64 encryption |
| `CerbiStream_LogWithBase64`    | 0.207     | 3.12           | CerbiStream + Base64        |
| `NoEncryption_Encrypt`   | 0.0011    | 0.02           | Fastest, passthrough        |
| `Base64_EncryptDecrypt`  | 0.0143    | 0.14           | Low-overhead obfuscation    |
| `AES_EncryptDecrypt`     | 0.122     | 1.88           | Full symmetric encryption   |

✅ **CerbiStream** shows better performance in encrypted structured logging compared to Serilog, and it offers **pluggable encryption modes** at runtime.

---

## ✨ Perfect for

- Enterprise teams seeking build-time governance
- SaaS vendors handling regulated data (e.g., finance, healthcare)
- Developer-first teams tired of bloated observability setups
- Real-time, secure log routing without vendor lock-in

---

## 🧠 Roadmap & Ecosystem

Cerbi aims to offer **enforced governance at build time** and **predictive insight at runtime**, without centralizing your data.

- 🔄 **CerbiShield** – Governance UI builder *(coming soon)*
- 🔁 **CerbIQ** – Log router with schema-based filtering *(coming soon)*
- 🧠 **CerbiSense** – ML engine for enriched log metadata *(coming soon)*

---

## 🧵 Let’s Make Logging Smarter

> **Structured. Secure. Scalable.**  
> Cerbi is not just a logging tool — it’s a strategy.

---

> 🚀 Dev.to launch, Azure Marketplace listing, and Product Hunt debut coming soon!

---

## 🧰 Getting Started

```bash
dotnet add package CerbiStream
dotnet add package CerbiStream.GovernanceAnalyzer # Optional
builder.AddCerbiStream(options =>
{
    options
        .WithQueue("Kafka", "localhost", "app-logs")
        .EnableDeveloperModeWithoutTelemetry()
        .WithEncryptionMode(EncryptionType.Base64);
});
```

---

## 📊 Extended Benchmark Results

We've benchmarked encrypted logging end-to-end using both **CerbiStream** and **Serilog**, with encryption applied **before logging**. Benchmarks were run using `.NET 8` and `BenchmarkDotNet`, with multiple scenarios tested including encryption-only, full encrypt/decrypt, and end-to-end logging with encrypted payloads.

### 🧪 Logging + Encryption Performance Comparison

| Test Scenario                | Mean (ms) | Allocated (KB) | Description                                 |
|-----------------------------|-----------|----------------|---------------------------------------------|
| `Serilog_LogWithBase64`     | 0.375     | 5.82           | Encrypt using Base64 → log via Serilog      |
| `CerbiStream_LogWithBase64` | 0.207     | 3.12           | Encrypt using Base64 → log via CerbiStream  |
| `NoEncryption_Encrypt`      | 0.0011    | 0.02           | Pass-through encryption disabled            |
| `Base64_EncryptDecrypt`     | 0.0143    | 0.14           | Encrypt and decrypt using Base64            |
| `AES_EncryptDecrypt`        | 0.122     | 1.88           | Encrypt and decrypt using AES               |

### ⚖️ Observations

- ✅ **CerbiStream** was ~45% faster than Serilog when logging encrypted messages.
- 🔐 **AES** offers stronger security at only a marginal overhead (~0.122ms).
- ⚡ **BenchmarkMode** in Cerbi disables console, queue, and telemetry to simulate max throughput.
- 🧩 Our benchmarks test **both individual encryption** and **combined log + encrypt** operations.

---

## ✅ Developer Experience Features

- 🌐 **.NET 8+ supported**
- 🔐 **Built-in AES and Base64 encryption**
- 🧱 **Schema validation at build time**
- 🧪 **Integrated benchmarks with BenchmarkDotNet**
- 🧰 **Toggleable developer presets (`BenchmarkMode`, `MinimalMode`, etc.)**
- 🧠 **Ready for ML-based analysis with metadata fields like `UserType`, `Feature`, and `RetryAttempt`**

---

## 📦 NuGet Packages

| Package                   | Description                                   |
|---------------------------|-----------------------------------------------|
| [`CerbiStream`](https://www.nuget.org/packages/CerbiStream) | Core logging library with config modes + encryption |
| [`CerbiStream.GovernanceAnalyzer`](https://www.nuget.org/packages/CerbiStream.GovernanceAnalyzer) | Roslyn analyzer enforcing governance policies |

---

## 🔌 Supported Destinations

| Platform           | Supported |
|--------------------|-----------|
| RabbitMQ           | ✅        |
| Kafka              | ✅        |
| Azure Queue        | ✅        |
| Azure Service Bus  | ✅        |
| AWS SQS / Kinesis  | ✅        |
| Google Pub/Sub     | ✅        |
| App Insights       | ✅        |
| CloudWatch         | ✅        |
| GCP Trace          | ✅        |
| Datadog            | ✅        |

---

## 📣 Spread the Word

If you're tired of juggling Serilog sinks, governance checklists, and brittle logging conventions, Cerbi is your modern, extensible solution.

⭐ Star us on GitHub  
📢 Share on Dev.to  
🔗 Add us to your Azure Marketplace stack  
📬 Let your observability team know

---

## 📬 Contact & Community

- **GitHub**: [Cerbi-CerbiStream](https://github.com/Zeroshi/Cerbi-CerbiStream)
- **Email**: [cerbi](mailto:thomasvnelson@live.com)
- **NuGet**: [CerbiStream](https://www.nuget.org/packages/CerbiStream)

> 🧠 Logging is a strategy, not just syntax. Cerbi gives you the framework to do it right from Day 1.

