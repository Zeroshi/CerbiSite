


# CerbiSuite – Unified Logging, Governance & Observability

🔐 **Structured Logging** · 🧠 **Developer‑First Observability** · 🌐 **Cloud‑Native & Portable**

*Modular · Hybrid‑Ready · ML‑Friendly · Dev‑First*

---

## ✨ Why CerbiStream Exists

As applications grow and teams scale—often spanning internal squads, external contractors, and third‑party libraries—logging can become fragmented and inconsistent. That leads to:

- Confusing, unstructured log messages
- Difficult audits and compliance gaps
- Missed insights for monitoring or ML workloads

**CerbiStream** brings order and governance to this chaos by:

1. **Enforcing Structure at the Source**\
   Developers use a simple, fluent API to define log schemas. CerbiStream validates against that schema *before* emitting logs.
2. **Providing Modular Capabilities**\
   Pick only what you need: encryption, governance, telemetry, benchmarking—no unnecessary bloat.
3. **Enabling Audit‑Ready Compliance**\
   Logs can be encrypted, include required fields, and exclude forbidden fields, ensuring HIPAA, GDPR, SOC‑2, and internal policy adherence.
4. **Feeding ML‑Ready Pipelines**\
   Consistent metadata formats make logs immediately consumable by analytics or AI/ML services.

---

## 🚀 The Cerbi Ecosystem

CerbiSuite is a cohesive suite of tools, each addressing a critical aspect of enterprise logging:

| Component                          | Status           | Purpose                                                              |
| ---------------------------------- | ---------------- | -------------------------------------------------------------------- |
| **CerbiStream**                    | GA               | Core .NET logger with structured output, encryption, and governance  |
| **CerbiStream.GovernanceAnalyzer** | GA               | Static/dynamic schema validator enforcing rules at build and runtime |
| **CerbIQ**                         | Beta             | Routing, normalization, and fan-out engine for logs                  |
| **CerbiSense**                     | Alpha            | ML-driven anomaly detection and trend forecasting from metadata      |
| **CerbiShield**                    | Beta (SaaS Soon) | Governance dashboard UI & enforcement engine; available soon as SaaS |

---

## 🔍 Deep Dive: CerbiStream

### Core Concepts

- **ILogger**** Integration:** Leverages .NET logging abstractions for zero‑friction adoption.
- **Fluent Configuration API:** Chain methods to enable modes, encryption, governance, and telemetry.
- **Minimal Runtime Overhead:** Benchmarks show \~320 bytes allocated per log, with zero Gen0/1/2 GCs during high‑throughput scenarios.

### Preset Modes Explained

| Mode                                 | Description                                              | Use Case                    |
| ------------------------------------ | -------------------------------------------------------- | --------------------------- |
| `EnableDevModeMinimal()`             | Only console output—no metadata or telemetry.            | Quick debug, demos          |
| `EnableDeveloperModeWithTelemetry()` | Add metadata and forward telemetry (e.g., App Insights). | Dev testing with monitoring |
| `EnableBenchmarkMode()`              | Silence outputs to measure raw performance.              | Performance tuning          |

### Encryption Deep Dive

CerbiStream supports three encryption modes:

- **None:** Plain JSON logs, minimal CPU impact.
- **Base64:** Simple encoding, negligible overhead.
- **AES:** AES‑256 encryption with user‑provided key/IV.

```csharp
options.WithEncryptionMode(EncryptionType.AES)
       .WithEncryptionKey(myKeyBytes, myIvBytes);
```

AES mode adds \~7% overhead in benchmarks, but secures PII/PHI in transit and at rest.

### Governance Enforcement

The GovernanceAnalyzer extends CerbiStream by ingesting JSON rule sets:

- **Required Fields:** e.g. `UserId`, `CorrelationId`, `Timestamp`.
- **Forbidden Fields:** e.g. `SSN`, `CreditCardNumber`.
- **Severity Levels:** Build‑stop errors, warnings, or informational logs.
- **JSON Schema Versions:** Support for backward compatibility via versioned profiles.

### Queue‑First Architecture

Logs can be dispatched via:

- **Message Queues:** RabbitMQ, Kafka, Azure Service Bus, AWS SQS.
- **HTTP(S) Endpoints:** Post logs directly to a secure HTTPS listener.
- **Blob Storage:** Append logs to blob containers for offline processing.

```csharp
options.WithQueue("RabbitMQ", "localhost", "logs-queue");
// or
options.WithHttpEndpoint("https://myapp.com/logs");
```

### Telemetry & Observability

Optional integrations enrich logs with correlation data:

- **OpenTelemetry:** Automatic context propagation and export to backends.
- **Azure Application Insights:** Full‑fidelity traces and metrics.
- **AWS CloudWatch & X‑Ray**
- **Datadog APM & Logs**

```csharp
options.WithTelemetryProvider(TelemetryProvider.AppInsights, "<ikey>");
```

Logs include service name, environment, machine, and custom tags for powerful querying.

---

## 🏗️ Getting Started

### 1. Install NuGet Package

```bash
dotnet add package CerbiStream
```

### 2. Configure in Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Logging.AddCerbiStream(options =>
{
    options
      .WithQueue("AzureServiceBus", "sb://myservicebus", "logs-queue")
      .WithEncryptionMode(EncryptionType.AES)
      .WithGovernanceValidator((profile, log) =>
      {
          return log.ContainsKey("UserId") && log.ContainsKey("IPAddress");
      })
      .EnableDeveloperModeWithTelemetry();
});

var app = builder.Build();
app.Run();
```

### 3. Define Governance Profiles

Use the CerbiShell CLI or Dashboard UI to generate a JSON rule set:

```json
{
  "$schema": "https://cerbi.io/schema/governance.schema.json",
  "version": "1.0",
  "required": ["UserId","Timestamp","Level"],
  "forbidden": ["SSN","CreditCardNumber"],
  "encryption": "AES",
  "severity": { "MissingRequired": "Error", "ForbiddenPresent": "Warning" }
}
```

Load this at startup:

```csharp
options.WithGovernanceProfile("governance.rules.json");
```

---

## 📐 Architecture & Flow

```text
Your App (ILogger<T>)
    ↓
CerbiStream
    ├──▶ Your Sink (Splunk, Datadog, etc.)
    └──▶ CerbIQ (Routing & Normalization)
            ├──▶ Your Sink (Splunk, Datadog, etc.)
            └──▶ CerbiSense (Analytics)
```

1. **Source** logs with injected metadata & schema validation.
2. **Dispatch** via queue/HTTP/blob to chosen targets.
3. **Route** optional through CerbIQ for fan‑out and additional governance.
4. **Analyze** trends, anomalies, and compliance metrics in CerbiSense.

---

## 🔀 Deployment Patterns

| Pattern             | Flow                                          | Benefits                           |
| ------------------- | --------------------------------------------- | ---------------------------------- |
| **Direct**          | CerbiStream → Sink                            | Low latency                        |
| **Governed**        | CerbiStream → CerbIQ → Sink                   | Centralized governance, retry      |
| **Analytics**       | CerbiStream → CerbIQ → CerbiSense → Sink      | ML insights & anomaly detection    |
| **Offline Storage** | CerbiStream → Blob Storage → Batch Processing | Cost‑effective long‑term retention |

---

## 🔧 Advanced Customization

Use the full fluent API for granular control:

```csharp
options
    .EnableDevModeWithTelemetry()
    .WithQueue("Kafka","broker:9092","log-topic")
    .WithHttpEndpoint("https://logs.myapp.com/collect")
    .WithEncryptionMode(EncryptionType.Base64)
    .WithMetadataInjection(true)
    .WithGovernanceChecks(true)
    .WithTelemetryLogging(true);
```

Add custom enrichers:

```csharp
options.AddEnricher("Region", () => 
    new LogProperty("Region", Environment.GetEnvironmentVariable("REGION")));
```

---

## 🔗 Integration & Supported Platforms

- **Message Brokers:** RabbitMQ, Kafka, Azure SB, AWS SQS/Kinesis
- **HTTP(S) Endpoints:** RESTful ingestion
- **Blob Stores:** Azure Blobs, AWS S3, GCS
- **Telemetry Providers:** OpenTelemetry, App Insights, CloudWatch, Datadog
- **Sinks:** Splunk, Elasticsearch, Log Analytics, Generic REST
- **Languages:** .NET 6+, .NET Framework 4.7+

---

## 📊 Benchmark Results & Analysis

| Logger          | Mean (μs) | Alloc (B) | logs/sec est. | Encryption Overhead | Governance Overhead |
| --------------- | --------- | --------- | ------------- | ------------------- | ------------------- |
| **CerbiStream** | 213.9     | 320       | \~4,676       | +7% (AES vs None)   | +5% (rules checks)  |
| Serilog         | 213.5     | 1480      | \~4,686       | +10% (plugins)      | —                   |
| NLog            | 9.99      | 432       | \~100,100     | N/A                 | —                   |
| log4net         | 12.71     | 576       | \~78,700      | N/A                 | —                   |

> **Insight:** CerbiStream matches Serilog’s throughput while slashing memory by 78%, and adds built‑in encryption and governance enforcement.

---

## 🛡️ Governance Workflow

CerbiStream’s governance engine—powered by GovernanceAnalyzer—makes compliance a first‑class feature:

```text
Governance Dashboard UI
 (Create / Edit / Version / Deploy Rule Sets)
    ↓ JSON Profiles (Starter Kits: HIPAA, GDPR, SOC‑2, Custom)
GovernanceAnalyzer
 (Build‑time & Runtime Enforcement)
    • Validate Required & Forbidden Fields
    • Enforce Encryption Modes (None, Base64, AES)
    • Trigger Build Failure or Runtime Warnings
    • Support Live Reload & Callbacks
    • Emit Audit Logs for Policy Changes
    ↓ Enforcement
CerbiStream Logger
 (Structured, Encrypted, Policy‑Compliant Logs)
    ↓ Downstream
Ops & Security Dashboards
 • App Insights Rollup & Dashboards
 • Compliance Metrics (pass/fail, violations by service)
 • Drill‑down into failing logs
 • Export Reports (JSON, CSV)
 • Alerting via Email/Slack/SMS
```

This end‑to‑end workflow turns logging into an active safety net—enforcing policies at the edge rather than relying on downstream audits.

---

## 📚 Community & Contribution

CerbiSuite is open source and community‑driven:

- ⭐ Star and fork on GitHub
- 🐛 Report bugs or request features via Issues
- 📣 Join discussions in GitHub Discussions
- 🔧 Submit pull requests following [CONTRIBUTING.md]
- 🚀 Roadmap and changelog available in repo

---

## 📬 Contact & Resources

**Email:** [hello@cerbi.io](mailto\:hello@cerbi.io)

**NuGet:**

- [CerbiStream](https://www.nuget.org/packages/CerbiStream)
- [CerbiStream.GovernanceAnalyzer](https://www.nuget.org/packages/CerbiStream.GovernanceAnalyzer)

**GitHub:**

- [Zeroshi/Cerbi-CerbiStream](https://github.com/Zeroshi/Cerbi-CerbiStream)
- [Zeroshi/CerbiStream-GovernanceAnalyzer](https://github.com/Zeroshi/CerbiStream-GovernanceAnalyzer)

---

