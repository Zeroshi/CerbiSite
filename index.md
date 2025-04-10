---
title: CerbiSuite – Unified Logging, Governance, and Observability
description: Enterprise-grade structured logging, encryption support, governance enforcement, and predictive ML insights
layout: default
---

# CerbiSuite – Unified Logging, Governance, and Observability

🔐 Structured Logging · 🧠 Developer-First Observability · 🌐 Cloud-Native & Portable  
_Modular · Hybrid-Ready · ML-Friendly · Dev-First_

---

## ✨ Why CerbiStream Exists

CerbiStream is a tool built to help applications log information accurately and consistently.

Logging is how apps keep track of what’s happening behind the scenes. When something goes wrong, logs tell you exactly what happened, so you can quickly fix the issue.

Today, companies often use multiple teams or contractors, which leads to messy and inconsistent logging.  
Cerbi fixes that:

✅ Sets clear, enforced rules for what should be logged  
✅ Helps teams keep their logs consistent, structured, and secure  
✅ Ensures logs are ready for audit, monitoring, or machine learning  
✅ Use only the parts you need (modular)

---

## Table of Contents

- [✨ Why CerbiStream Exists](#-why-cerbistream-exists)
- [🚀 What is Cerbi?](#-what-is-cerbi)
- [🔀 Hybrid-Compatible by Design](#-hybrid-compatible-by-design)
- [Overview](#overview)
- [Highlights](#highlights)
- [Features](#features)
- [Architecture & Implementation](#architecture--implementation)
- [🧠 Cerbi Ecosystem Architecture](#-cerbi-ecosystem-architecture)
- [🔍 Routing Options](#-routing-options)
- [Preset Modes and Configuration](#preset-modes-and-configuration)
- [Advanced Customization](#advanced-customization)
- [Usage Examples](#usage-examples)
- [Integration & Supported Platforms](#integration--supported-platforms)
- [Governance and Compliance](#governance-and-compliance)
- [Telemetry Provider Support](#telemetry-provider-support)
- [Unit Testing](#unit-testing)
- [CerbiSuite: The Bigger Picture](#cerbisuite-the-bigger-picture)
- [Benchmark Results](#benchmark-results)
- [Logs per Second (Estimated Throughput)](#logs-per-second-estimated-throughput)
- [Memory Efficiency – Logs per 1KB Allocated](#memory-efficiency--logs-per-1kb-allocated)
- [Logging Cost per Feature Set](#logging-cost-per-feature-set)
- [📊 Feature Matrix (At a Glance)](#-feature-matrix-at-a-glance)
- [🔧 Core Components](#-core-components)
- [📐 Benchmark Summary](#-benchmark-summary)
- [♻️ GC-Friendly Logging](#️-gc-friendly-logging)
- [🙅 What Cerbi Is Not](#-what-cerbi-is-not)
- [Garbage-Free Logging](#garbage-free-logging)
- [Contributing](#contributing)
- [License](#license)
- [🧭 CerbiSuite: Logging Built Right From Day One](#-cerbisuite-logging-built-right-from-day-one)
- [🌐 Resources](#-resources)

---


## 🚀 What is Cerbi?

Cerbi is a modular observability platform offering precise control over how logs are generated, enriched, encrypted, validated, and routed.

Cerbi enhances logging at the **source**, before logs leave your app:
- Ensures consistency and structure
- Enables encryption and validation
- Routes logs to your queue or sink
- Optionally analyzes trends via ML

**Cerbi is not a replacement for log tools** like Splunk or Datadog — it's an enhancement.

---

## ✅ Built for Compliance and Multi-Team Environments

CerbiSuite was built for modern engineering orgs where:
- Internal teams and external contractors contribute to shared codebases
- Logs must be **audit-ready**, **structured**, and **consistent**
- Compliance with **HIPAA**, **GDPR**, **SOC 2**, and other standards is non-negotiable

With Cerbi, you can:
- Enforce structured logging at the source—not just at the sink
- Eliminate shadow or inconsistent logs between teams and environments
- Ensure real-time governance validation without slowing developers down

Cerbi acts as a **compliance safety net** for distributed development, ensuring every log—no matter who wrote it—follows your standards.

---

## 🔀 Hybrid-Compatible by Design

Use Cerbi your way:

✅ CerbiStream logs → your sink  
✅ CerbiStream → queue → CerbIQ (normalize, filter, govern) → your sink  
✅ CerbIQ (optional) → CerbiSense (only metadata, no PII)

Cerbi works with your stack. You keep control. We offer precision.


![Modular](https://img.shields.io/badge/modular--by--design-%E2%9C%94%EF%B8%8F-blue?style=flat-square)
![Hybrid-Ready](https://img.shields.io/badge/hybrid--compatible-%F0%9F%94%81-green?style=flat-square)



## Overview

CerbiSuite is a modular observability platform built to empower enterprises with precise control over logging, governance, and real-time insights.

---

## Highlights

- **Dev-Friendly & Flexible:**  
  Works seamlessly with .NET Core’s logging abstractions (`ILogger<T>`).

- **High Performance:**  
  Engineered for low latency and high throughput with efficient resource usage, even in realistic Dev Mode.

- **Governance-Enforced Logging:**  
  Enforces structured logging compliance, ensuring logs meet audit and regulatory requirements (e.g., HIPAA, GDPR).

- **Encryption & Security:**  
  Supports configurable encryption modes—None, Base64, or AES—providing robust data protection.

- **Queue-First Architecture:**  
  Decouples log generation from delivery, allowing logs to be processed and normalized before reaching downstream sinks.

- **Telemetry & Analytics:**  
  Integrates with major telemetry platforms to enrich logs for comprehensive observability and diagnostics.

---

## Features

- **Developer Modes:**  
  - **EnableDevModeMinimal():** Minimal console logging without metadata injection; perfect for lightweight, low-overhead logging.  
  - **EnableDeveloperModeWithoutTelemetry():** Adds metadata to console logs without sending telemetry data.  
  - **EnableDeveloperModeWithTelemetry():** Full developer mode with metadata enrichment, telemetry, and optional governance checks.  
  - **EnableBenchmarkMode():** Silent mode for performance testing; disables outputs, enrichers, and telemetry.

- **Governance Enforcement:**  
  Built-in support to enforce structured logging through internal validators or via the optional CerbiStream.GovernanceAnalyzer. This helps maintain consistent log schemas across teams.

- **Encryption Options:**  
  Log data can be secured using flexible encryption modes (Base64, AES), with configurable keys and initialization vectors (IVs).

- **Queue-First, Sink-Agnostic Logging:**  
  Logs are routed through configurable messaging queues (e.g., RabbitMQ, Kafka) allowing decoupled and resilient delivery to any final sink via CerbIQ.

- **Telemetry Integration:**  
  Seamless integration with OpenTelemetry, Azure App Insights, AWS CloudWatch, GCP Trace, and Datadog, enabling enriched observability.

---

## Architecture & Implementation

CerbiSuite is architected for high performance, compliance, and modularity:

- **Asynchronous Processing:**  
  Uses modern asynchronous patterns to handle high-frequency logging without blocking application threads.

- **Queue-First Model:**  
  Log events are first enqueued (via messaging systems such as RabbitMQ or Kafka) and then dispatched to downstream sinks—ensuring decoupling of log generation from delivery.

- **Modular & Configurable:**  
  A fluent API enables rapid configuration of modes, encryption, telemetry, and governance settings. This makes CerbiStream highly adaptable to diverse deployment scenarios.

- **Governance & Validation:**  
  Enforces structured logging policies through a built-in governance engine or external validators, ensuring compliance and data integrity before logs leave your application.

- **Preset Performance Modes:**  
  Offers tailored modes for different environments—from raw performance testing (Benchmark Mode) to rich, real-world logging in development (Developer Modes).

## 🧠 Cerbi Ecosystem Architecture

```
Your App (ILogger<T>)
        |
        v
+------------------+
|  CerbiStream     |  <- Your structured logger
|  (adds metadata) |
+------------------+
        |
        v
+------------------+
|  Encryption Layer|
+------------------+
        |
        v
+------------------+
|  Message Queue   |
+------------------+
     |           |
     |           +--> Your Sink (Splunk, Datadog, etc.)
     |
     +--> CerbIQ (Optional Routing/Governance Layer)
              |
              v
       (optional) CerbiSense + Your Sink (Splunk, Datadog, etc.)
       (only from CerbIQ, metadata only)
```

---

## 🔍 Routing Options

- CerbiStream → Queue → Your Sink  
- CerbiStream → Queue → CerbIQ → Your Sink  
- CerbiStream → Queue → CerbIQ → CerbiSense (optional metadata-only ML) + Your sink

---

## Preset Modes and Configuration

CerbiStream offers several preset modes to simplify configuration:

### Developer Modes

- **EnableDevModeMinimal()**  
  Minimal logging output with only console logs—ideal for quick diagnostics.
```csharp
builder.Logging.AddCerbiStream(options => options.EnableDevModeMinimal());
```

- **EnableDeveloperModeWithoutTelemetry()**  
  Console logging with metadata injection but excluding telemetry.
```csharp
builder.Logging.AddCerbiStream(options => options.EnableDeveloperModeWithoutTelemetry());
```

- **EnableDeveloperModeWithTelemetry()**  
  Full logging with metadata enrichment, telemetry, and optional governance.
```csharp
builder.Logging.AddCerbiStream(options => options.EnableDeveloperModeWithTelemetry());
```

### Benchmark Mode

- **EnableBenchmarkMode()**  
  Disables outputs, metadata, and telemetry to measure raw performance.
```csharp
builder.Logging.AddCerbiStream(options => options.EnableBenchmarkMode());
```

---

## Advanced Customization

Customize your logging configuration using the fluent API:

**Queue Configuration:**
```csharp
options.WithQueue("RabbitMQ", "localhost", "logs-queue");
```

**Encryption Configuration:**
```csharp
options.WithEncryptionMode(EncryptionType.AES)
       .WithEncryptionKey(myKey, myIV);
```

**Governance Validator:**
```csharp
options.WithGovernanceValidator((profile, log) =>
{
    return log.ContainsKey("UserId") && log.ContainsKey("IPAddress");
});
```

**Feature Toggles:**
```csharp
options.WithTelemetryLogging(true)
       .WithConsoleOutput(true)
       .WithMetadataInjection(true)
       .WithGovernanceChecks(true);
```

---

## Usage Examples

**Basic Example**
```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Logging.AddCerbiStream(options =>
{
    options.EnableDevModeMinimal();
});
var app = builder.Build();
app.Run();
```

**Developer Mode with Custom Queue and Encryption**
```csharp
builder.Logging.AddCerbiStream(options =>
{
    options.WithQueue("Kafka", "broker-address", "app-logs")
           .WithEncryptionMode(EncryptionType.Base64)
           .EnableDeveloperModeWithoutTelemetry();
});
```

**Full Mode with Telemetry and Governance**
```csharp
builder.Logging.AddCerbiStream(options =>
{
    options
        .WithQueue("AzureServiceBus", "sb://myservicebus.servicebus.windows.net", "logs-queue")
        .WithEncryptionMode(EncryptionType.AES)
        .WithGovernanceValidator((profile, log) =>
        {
            return log.ContainsKey("UserId") && log.ContainsKey("IPAddress");
        })
        .EnableDeveloperModeWithTelemetry();
});
```

---

## Integration & Supported Platforms

CerbiStream is designed to integrate into a variety of environments:

**Messaging Queues:**  
Supports RabbitMQ, Kafka, Azure Service Bus, AWS SQS/Kinesis, and Google Pub/Sub.

**Telemetry Providers:**

| Provider           | Supported |
|--------------------|-----------|
| OpenTelemetry      | ✅        |
| Azure App Insights | ✅        |
| AWS CloudWatch     | ✅        |
| GCP Trace          | ✅        |
| Datadog            | ✅        |

**Pluggable Sinks:**  
Logs are routed first to queues. Downstream solutions like CerbIQ can aggregate and forward logs to Splunk, Elasticsearch, Blob Storage, etc.

---

## Governance and Compliance

CerbiStream’s governance features ensure that your logs are structured and compliant:

**Structured Logging Enforcement:**  
Automatically validates that every log adheres to predefined schemas, making compliance with standards like HIPAA and GDPR easier.

**External Governance Hook:**  
Plug in custom governance validation logic as needed:
```csharp
options.WithGovernanceValidator((profile, log) =>
{
    return log.ContainsKey("UserId") && log.ContainsKey("IPAddress");
});
```

**Optional Governance Analyzer:**  
Use the CerbiStream.GovernanceAnalyzer package to perform static and runtime log validations, ensuring consistent adherence to organizational standards.

---

## Telemetry Provider Support

CerbiStream seamlessly integrates with telemetry systems to enrich your log data:

**Supported Providers:**

- OpenTelemetry
- Azure App Insights
- AWS CloudWatch
- GCP Trace
- Datadog

Configuration through the fluent API makes it simple to forward enriched log data to your observability platform.

---

## Unit Testing

Test your logging implementation with ease:
```csharp
var mockQueue = Substitute.For<IQueue>();
var logger = new CerbiLoggerBuilder()
    .WithQueue("TestQueue", "localhost", "unit-test-logs")
    .UseNoOpEncryption() // Or your specific encryption provider
    .Build(mockQueue);

var result = await logger.LogEventAsync("Test log event", LogLevel.Information);
Assert.True(result);
```

This ensures your logging meets expected behavior in isolation.

---

## CerbiSuite: The Bigger Picture

CerbiSuite is a unified platform designed to bring structure, security, and insight to your logs. Its key components include:

- **CerbiStream:**  
  High-performance, governance-enforced logging for .NET.

- **CerbIQ:**  
  Advanced log routing, aggregation, and schema normalization to prepare logs for final sinks or further analysis.

- **CerbiStream.GovernanceAnalyzer:**  
  Static and runtime validation to enforce structured logging standards.

- **CerbiSense (Optional):**  
  An ML-driven engine that analyzes non-sensitive metadata (forwarded via CerbIQ) to detect global trends, perform risk scoring, and identify anomalies.

Together, these components ensure that logs are consistent, secure, and rich in context—from source to insight.

---

## Benchmark Results

**Performance & Allocation Benchmarks (.NET 8, 10 iterations, release)**

| Logger             | Mean (μs) | Allocated (B) |
|--------------------|-----------|---------------|
| NLog_Log_Plain     | 9.99      | 432           |
| Log4Net_Log_Plain  | 12.71     | 576           |
| Serilog_Log_Plain  | 213.5     | 1480          |
| Cerbi_Log_Plain    | 213.9     | 320           |
| MS_Log_Plain       | 427.2     | 320           |

> 🧠 **CerbiStream matches Serilog’s speed while using ~78% less memory, and includes built-in encryption and governance.**

---

**Encryption Performance Benchmarks**

| Logger             | Mode       | Mean (μs) | Allocated (B) |
|--------------------|------------|-----------|---------------|
| CerbiStream        | Plain      | 213.9     | 320           |
| CerbiStream (Base64)| Encrypted | 221.3     | 320           |
| Serilog            | Plain      | 213.5     | 1480          |
| Serilog + Base64   | Encrypted  | 206.2     | 1640          |
| NLog               | Plain      | 9.99      | 432           |
| Log4Net            | Plain      | 12.71     | 576           |

---

## Logs per Second (Estimated Throughput)

| Logger     | Mean (μs) | Logs/sec (est.) |
|------------|-----------|-----------------|
| NLog       | 9.99      | 100,100+        |
| Log4Net    | 12.71     | ~78,700         |
| CerbiStream| 213.9     | ~4,676          |
| Serilog    | 213.5     | ~4,686          |
| MS Logger  | 427.2     | ~2,341          |

---

## Memory Efficiency – Logs per 1KB Allocated

| Logger     | Allocated (B) | Logs per 1KB |
|------------|----------------|--------------|
| CerbiStream| 320            | 3.20         |
| NLog       | 432            | 2.37         |
| Log4Net    | 576            | 1.78         |
| Serilog    | 1480           | 0.69         |

---

## Logging Cost per Feature Set

| Logger     | Governance | Encryption | JSON Format | Alloc (B) | Time (μs) |
|------------|------------|------------|-------------|-----------|-----------|
| Cerbi      | ✅         | ✅         | ✅ (soon)   | 320       | 221.3     |
| Serilog    | ❌         | ❌         | ✅          | 1480      | 213.5     |
| NLog       | ❌         | ❌         | ⚠️ Partial  | 432       | 9.99      |
| Log4Net    | ❌         | ❌         | ❌          | 576       | 12.71     |

---

## 📊 Feature Matrix (At a Glance)

| Capability            | CerbiStream | Serilog | NLog | log4net |
|-----------------------|-------------|---------|------|---------|
| Structured Logging    | ✅          | ✅      | ✅   | ✅      |
| Native Encryption     | ✅          | ❌      | ❌   | ❌      |
| Governance Analyzer   | ✅          | ❌      | ❌   | ❌      |
| Memory Efficient      | ✅          | ❌      | ⚠️   | ⚠️     |
| Built-in Presets      | ✅ (soon)   | ⚠️      | ❌   | ❌      |
| File Fallback         | ✅ (soon)   | ✅      | ✅   | ✅      |

---

## 🔧 Core Components

| Component         | Description |
|------------------|-------------|
| **CerbiStream**   | ⚡ Fast, structured logging with metadata & encryption |
| **GovernanceAnalyzer** | ✅ Build-time and runtime structure enforcement |
| **CerbiShield** (beta) | Visual builder for governance rules |
| **CerbIQ** (dev) | Smart routing, queue normalization, validation |
| **CerbiSense** (dev) | Metadata-only ML engine for risk scoring and anomaly detection |

---

## 📐 Benchmark Summary

**.NET 8 Benchmarks (μs / B)**

- CerbiStream: 213.9 μs / 320B ✅
- Serilog: 213.5 μs / 1480B ❌
- NLog: 9.99 μs / 432B ⚡
- Log4Net: 12.71 μs / 576B

Cerbi matches Serilog speed with ~78% less memory.

---

## ♻️ GC-Friendly Logging

Cerbi emits only 320B per log with zero Gen 0/1/2 collections (BenchmarkDotNet verified).

Ideal for:
- APIs
- IoT
- Games
- Real-time workloads

---

## 🙅 What Cerbi Is Not

- ❌ Not a log aggregator like Splunk/Datadog  
- ❌ Not a file-only logger (file fallback coming!)  
- ❌ Not a rigid pipeline — **use only what you need**


---

## Garbage-Free Logging

CerbiStream emits structured logs with only 320B per log and no Gen 0/1/2 collections during BenchmarkDotNet tests — ideal for APIs, IoT, real-time workloads, and other high-performance environments.

---

## Contributing

Contributions are welcome!

- **Report Bugs / Request Features:** Open an issue on GitHub.
- **Submit Pull Requests:** Follow our coding guidelines and run the tests.
- **Join the Community:** Star the repo, share feedback, and help improve CerbiStream.

---

## License

This project is licensed under the MIT License.

---

Star the repo ⭐ | Contribute 🔧 | File issues 🐛  
Created by @Zeroshi

---

### Final Notes

- Adjust numerical benchmark values and descriptions if your latest tests yield different results.
- Ensure links (e.g., for benchmarks, governance, or any other external documentation) are current.
- Customize sections for your own branding and support contact information as needed.

---

## 🧭 CerbiSuite: Logging Built Right From Day One

Cerbi empowers teams building:
- APIs
- Platforms
- ML & AI systems

**Use it standalone or plug in CerbIQ and CerbiSense.**  
Everything happens in your own tenant.

---

## 🌐 Resources

📦 NuGet: `CerbiStream`  
📁 GitHub: [github.com/Zeroshi/Cerbi-CerbiStream](https://github.com/Zeroshi/Cerbi-CerbiStream)  
✉️ Contact: thomasvnelson@live.com

---

> Logging is not an afterthought. It’s infrastructure.
> With Cerbi, you’re building it right from Day One.

