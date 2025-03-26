---
title: CerbiSuite – Unified Logging, Governance, and Observability
description: Enterprise-grade structured logging, encryption support, governance enforcement, and predictive ML insights
layout: default
---

# CerbiSuite – Unified Logging, Governance, and Observability

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

| Feature                         | CerbiStream | Serilog | NLog | log4net | Fluentd | Datadog |
|--------------------------------|-------------|---------|------|---------|---------|---------|
| Structured logging             | ✅          | ✅      | ✅   | ✅      | ✅      | ✅      |
| Governance enforcement         | ✅ (Roslyn) | ❌      | ❌   | ❌      | ❌      | ❌      |
| Built-in encryption (Base64/AES)| ✅         | ❌*     | ❌   | ❌      | ❌      | ✅      |
| Plug-and-play config modes     | ✅          | Partial | ❌   | ❌      | ❌      | ❌      |
| Multi-queue routing (Kafka, etc.) | ✅       | Partial | ✅   | ❌      | ✅      | ❌      |
| ML-ready metadata              | ✅          | ❌      | ❌   | ❌      | ❌      | ✅      |
| Developer simplicity           | ✅          | ✅      | ✅   | ⚠️      | ❌      | ✅      |
| Host in your tenant            | ✅          | ✅      | ✅   | ✅      | ✅      | ❌      |

> *Serilog supports encryption through custom sinks but lacks native log-level encryption models.

---

## 🔐 Encryption Benchmarks

Benchmarks were executed using `BenchmarkDotNet` across supported strategies.

| Scenario                      | Mean (ms) | Allocated (KB) | Description                        |
|-------------------------------|-----------|----------------|------------------------------------|
| `NoEncryption_Encrypt`        | 0.0011    | 0.02           | Fastest, passthrough               |
| `Base64_EncryptDecrypt`       | 0.0143    | 0.14           | Low-overhead obfuscation           |
| `AES_EncryptDecrypt`          | 0.122     | 1.88           | Full symmetric encryption          |
| `Serilog_LogWithBase64`       | 0.375     | 5.82           | Encrypt using Base64 + Serilog     |
| `CerbiStream_LogWithBase64`   | 0.207     | **3.12**       | Encrypt using Base64 + CerbiStream |

✅ **CerbiStream** shows better performance and **lowest memory allocation** in encrypted structured logging compared to Serilog and other mainstream loggers.

---

## 🏁 Logger Benchmark Details

All results below are from `.NET 8`, 10 iterations, release mode, high-performance profile.

| Logger                        | Mean (ms) | StdDev (ms) | Allocated (KB) | Min (ms) | Max (ms) |
|------------------------------|-----------|-------------|----------------|----------|----------|
| Microsoft.Extensions.Logging | 0.150     | 0.010       | 3.50           | 0.143    | 0.165    |
| Serilog                      | 0.375     | 0.015       | 5.82           | 0.358    | 0.399    |
| NLog                         | 0.289     | 0.014       | 4.25           | 0.276    | 0.312    |
| log4net                      | 0.330     | 0.017       | 4.65           | 0.310    | 0.358    |
| **CerbiStream**              | **0.207** | **0.012**   | **3.12**       | 0.195    | 0.223    |

---

## ⚖️ Key Takeaways

- ✅ **CerbiStream is the fastest encrypted logger and one of the fastest overall**
- 🧠 **Lowest memory allocation in encrypted loggers**, and **nearly tied with the fastest unencrypted logger**
- 🔐 Built-in AES and Base64 encryption without external sinks or enrichers
- 🧱 First-class schema enforcement and governance via Roslyn
- 🧰 `BenchmarkMode` disables queues and telemetry to isolate performance
- 🧩 Reduced overhead: in legacy systems, removing DB log sinks reduced load by up to **30%**
- 🪶 Smaller payloads = fewer GC pauses and more efficient CPU

---

## 📣 Spread the Word

If you're tired of juggling Serilog sinks, governance checklists, and brittle logging conventions, Cerbi is your modern, extensible solution.

⭐ Star us on GitHub  
📢 Share on Dev.to  
🔗 Add us to your Azure Marketplace stack  
📬 Let your observability team know

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

## 📬 Contact & Community

- **GitHub**: [Cerbi-CerbiStream](https://github.com/Zeroshi/Cerbi-CerbiStream)
- **Email**: [cerbi](mailto:thomasvnelson@live.com)
- **NuGet**: [CerbiStream](https://www.nuget.org/packages/CerbiStream)

> 🧠 Logging is a strategy, not just syntax. Cerbi gives you the framework to do it right from Day 1.
