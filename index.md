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

> Now benchmarked against top .NET loggers, Cerbi offers Serilog-level speed with dramatically lower memory usage, plus unmatched governance support.

---

## 🔧 Core Components

| Component           | Description                                                    |
|--------------------|----------------------------------------------------------------|
| **CerbiStream**     | ⚡ Fast, structured logging with metadata & encryption          |
| **GovernanceAnalyzer** | ✅ Enforces structure and standards at build time            |
| **CerbiShield** *(beta)* | Visual governance rule & policy builder                  |
| **CerbIQ** *(in dev)*     | Smart, schema-driven log router (Kafka/Splunk/etc.)        |
| **CerbiSense** *(in dev)* | ML-driven pattern detection & risk scoring               |

---

## 📐 Cerbi Architecture Overview

![Cerbi Architecture Diagram](https://github.com/Zeroshi/CerbiSite/blob/main/Cerbi-updated.png?raw=true)

**CerbiStream** is your entry point. It encrypts logs, adds metadata, validates structure (optionally), and dispatches them to your queues. From there:

- **GovernanceAnalyzer** (Roslyn) ensures developers comply with defined structures.
- **CerbiShield** is a visual governance policy builder.
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

## ⚡ Benchmark Results

### 🧪 Performance & Allocation Benchmarks (.NET 8, 10 iterations, release)

| Logger              | Mean (μs) | Allocated (B) |
|---------------------|-----------|----------------|
| **NLog_Log_Plain**      | 9.99     | 432            |
| **Log4Net_Log_Plain**   | 12.71    | 576            |
| **Serilog_Log_Plain**   | 213.5    | 1480           |
| **Cerbi_Log_Plain**     | 213.9    | **320 ✅**     |
| **MS_Log_Plain**        | 427.2    | 320            |

> ✅ CerbiStream matches Serilog's speed but uses **~78% less memory**, with built-in encryption and governance support.

---

## 🧠 Dev-Friendly by Design

CerbiStream includes modern features devs expect — and more:

- ✅ `AddCerbiStream("AzureWebApp")` preset support *(coming soon)*
- ✅ `WithJsonFormat()` for structured output
- ✅ `WithFileFallback()` for production resilience *(coming soon)*
- ✅ Roslyn analyzer to enforce log shape & metadata
- ✅ Clean DI setup – no manual sink management

---

## ⚖️ Key Takeaways

- 🚀 CerbiStream is **one of the fastest encrypted structured loggers**
- 🔐 Built-in Base64 and AES encryption — no sinks or enrichers required
- ⚙️ CerbiShield enables compile-time and runtime governance enforcement
- 📉 Lower memory = fewer GC pauses and higher throughput
- 💡 Serilog-compatible speed — **with governance built in**

---

## 🧩 Get Started in Seconds

```bash
dotnet add package CerbiStream
dotnet add package CerbiStream.GovernanceAnalyzer # Optional
```
