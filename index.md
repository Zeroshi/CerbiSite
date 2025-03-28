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

> Cerbi is **not here to replace** major log tools — it's designed to **enhance and complement** them. Use CerbiStream to log, then send it anywhere: your queue, your sink, or through CerbIQ for governance-aware routing and optional ML analysis.

> Cerbi offers Serilog-level speed with dramatically lower memory usage, plus unmatched governance support and modular ML-friendly architecture.

>
> ---

## 🔀 Hybrid-Compatible by Design

Cerbi is built to integrate **with**, not against, your stack. Use only what you need:

- ✅ Use **CerbiStream** as a logger, send logs to your existing sink (Splunk, Datadog, etc.)
- ✅ Or route logs with **CerbIQ** for schema validation, queue normalization, and ML-ready structuring
- ✅ Only **CerbIQ** can forward metadata (not NPI by default) to **CerbiSense**, the shared AI insights engine

Cerbi is about precision at the source. **You own the routing, we offer optional intelligence**.

---

## 🔍 Feature Matrix (At a Glance)

| Capability            | CerbiStream | Serilog | NLog | log4net |
|-----------------------|-------------|---------|------|---------|
| Structured Logging    | ✅          | ✅      | ✅   | ✅      |
| Native Encryption     | ✅          | ❌      | ❌   | ❌      |
| Governance Analyzer   | ✅          | ❌      | ❌   | ❌      |
| Memory Efficient      | ✅          | ❌      | ⚠️   | ⚠️     |
| Built-in Presets      | ✅ *(soon)* | ⚠️ Partial | ❌   | ❌      |
| File Fallback         | ✅ *(soon)* | ✅      | ✅   | ✅      |

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

```
+--------------+
|  Your App    |  (ILogger<T>)
+--------------+
       |
       v
+---------------------+
|   CerbiStream       |  (Structured Log + Metadata)
+---------------------+
       |
       v
+---------------------+
|   Encryption Layer  |
+---------------------+
       |
       v
+---------------------+
|       Queue         |  (Kafka, RabbitMQ, etc.)
+---------------------+
       |
       v
+---------------------------+
|   Your Sink (optional)    |
+---------------------------+
       |
       v
+---------------------------+
|         CerbIQ            | (optional governance-aware router)
+---------------------------+
                |
                v (optional metadata only, never full logs or NPI)
        +-----------------------+
        |     CerbiSense        |
        |  (ML & global trends) |
        +-----------------------+
```

> 🧱 Modular & Decoupled:
> - Logs are sent to **your queue**.
> - You can:
>   - ✅ Route them to your sink
>   - ✅ Use **CerbIQ** to inspect, normalize, and route
> - **Only CerbIQ** can forward selected metadata to **CerbiSense**, a shared, anonymized ML dashboard

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

## 🔐 Encryption Performance Benchmarks

| Logger                    | Mode      | Mean (μs) | Allocated (B) |
|---------------------------|-----------|-----------|----------------|
| CerbiStream               | Plain     | 213.9     | 320            |
| **CerbiStream (Base64)**  | Encrypted | **221.3** | **320 ✅**     |
| Serilog                   | Plain     | 213.5     | 1480           |
| Serilog + Manual Base64   | Encrypted | 206.2     | 1640 ❌        |
| NLog                      | Plain     | 9.99      | 432            |
| Log4Net                   | Plain     | 12.71     | 576            |

---

## 📊 Extended Benchmark Comparisons

### 📈 Logs per Second (Estimated Throughput)

| Logger         | Mean (μs) | Logs/sec (est.) |
|----------------|-----------|------------------|
| NLog           | 9.99      | 100,100+ ⚡       |
| Log4Net        | 12.71     | ~78,700          |
| CerbiStream    | 213.9     | ~4,676           |
| Serilog        | 213.5     | ~4,686           |
| MS Logger      | 427.2     | ~2,341           |

---

### 💾 Memory Efficiency – Logs per 1KB Allocated

| Logger       | Allocated (B) | Logs per 1KB |
|--------------|----------------|---------------|
| CerbiStream  | 320            | **3.20 ✅**     |
| NLog         | 432            | 2.37          |
| Log4Net      | 576            | 1.78          |
| Serilog      | 1480           | 0.69 ❌        |

---

### 🧮 Logging Cost per Feature Set

| Logger     | Governance | Encryption | JSON Format | Alloc (B) | Time (μs) |
|------------|------------|------------|-------------|-----------|-----------|
| Cerbi      | ✅         | ✅         | ✅ *(soon)* | **320**   | **221.3** |
| Serilog    | ❌         | ❌         | ✅          | 1480      | 213.5     |
| NLog       | ❌         | ❌         | ⚠️ Partial  | 432       | 9.99      |
| Log4Net    | ❌         | ❌         | ❌          | 576       | 12.71     |

---

### ♻️ Garbage-Free Logging

CerbiStream emits structured logs with only **320B per log** and no Gen 0/1/2 collections observed during BenchmarkDotNet tests.

✅ **GC-friendly by design** — ideal for APIs, games, IoT, and real-time workloads.

---

## 🙅 What Cerbi Is Not

Let’s set clear expectations:

- ❌ Not a log aggregator like Splunk or Datadog
- ❌ Not a file-based logger (but file fallback is coming soon!)
- ❌ Not a rigid pipeline — use only what you need

Cerbi is modular, developer-first, and designed for precision and compliance.

---

## ⚙️ Setup Snippets (How We Tested)

```csharp
// CerbiStream Encrypted Logging
services.AddLogging(builder => builder.AddCerbiStream(opt =>
{
    opt.EnableBenchmarkMode();
    opt.WithQueue("noop", "noop", "noop");
    opt.WithEncryptionMode(EncryptionType.Base64);
}));

// Serilog + Base64 (manual)
_serilogEncrypted.LogInformation(Convert.ToBase64String(
    Encoding.UTF8.GetBytes($"Serilog: Logging at {DateTime.UtcNow}")));
```

---

## 🧭 CerbiSuite by Cerbi – Built for Real-Time, Secure Observability

Cerbi empowers developers with tools that prioritize structure, security, and simplicity — all in your own tenant. Whether you're building APIs, platforms, or ML-powered systems, Cerbi helps ensure your logs are consistent, validated, and ready for anything.

✅ **Use Cerbi as a logger** and keep your current pipeline  
✅ **Enhance it with CerbIQ** to route, govern, or even learn from your metadata  
✅ **Opt-in to CerbiSense** if you want collective ML insights on top

- 🌐 [GitHub](https://github.com/Zeroshi/Cerbi-CerbiStream)
- 📦 [NuGet: CerbiStream](https://www.nuget.org/packages/CerbiStream)
- ✉️ Contact: [thomasvnelson@live.com](mailto:thomasvnelson@live.com)

> Logging is not an afterthought. It’s infrastructure.  
> With Cerbi, you’re building it right from Day One.
