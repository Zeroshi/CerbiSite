---
title: "Serilog Governance Analyzer"
description: "Overview of Cerbi.Serilog.GovernanceAnalyzer, a Serilog filter extension that enforces logging governance at runtime."
permalink: "/docs/serilog-governance-analyzer"
layout: "public_doc"
---

# Serilog Governance Analyzer

Cerbi.Serilog.GovernanceAnalyzer is a Serilog filter extension that enforces governance rules **at runtime**. It adds a layer of compliance on top of your existing Serilog configuration to make sure log events contain required fields and exclude forbidden or sensitive data.

> **Disclaimer:** Cerbi LLC is not affiliated with the maintainers of Serilog. This filter is a third‑party tool designed to work alongside Serilog.

## Installation

To add the runtime governance filter to your project, install the NuGet package:

```bash
dotnet add package Cerbi.Serilog.GovernanceAnalyzer
```

## Key features

- **Required fields:** blocks log entries that are missing mandated keys (for example `userId`).
- **Forbidden fields:** prevents logs from including sensitive data such as social security numbers or credit card information.
- **Advisory rules:** emits warnings for optional governance rules without blocking the log.
- **Live reload:** can watch `cerbi_governance.json` for changes at runtime.
- **Extensible:** supports custom rules via the `ICustomGovernancePlugin` interface.

## Setup and usage

1. **Install required packages:**

   ```bash
   dotnet add package Serilog
   dotnet add package Serilog.Sinks.Console
   dotnet add package Cerbi.Serilog.GovernanceAnalyzer
   ```

2. **Add a governance profile:** create a JSON file, typically named `cerbi_governance.json`, in your project root. A minimal example looks like this:

   ```json
   {
     "EnforcementMode": "Strict",
     "LoggingProfiles": {
       "default": {
         "FieldSeverities": {
           "userId": "Required",
           "ssn": "Forbidden"
         }
       }
     }
   }
   ```

   Include the file in your project so it is copied to the output directory:

   ```xml
   <ItemGroup>
     <None Include="cerbi_governance.json">
       <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
     </None>
   </ItemGroup>
   ```

3. **Configure Serilog:** reference the governance filter when creating your logger. This example uses the default profile defined in the JSON file.

   ```csharp
   using Serilog;
   using Serilog.Debugging;
   using Cerbi.Serilog.GovernanceAnalyzer;

   SelfLog.Enable(Console.Error);

   Log.Logger = new LoggerConfiguration()
       .Filter.WithCerbiGovernance("cerbi_governance.json", "default")
       .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties}{NewLine}{Exception}")
       .CreateLogger();
   ```

4. **Runtime behaviour:** log entries that meet the rules will be emitted normally, and violations will be blocked. For example:

   ```csharp
   Log.Information("User created | userId={userId}", "abc-123");   // ✅ passes
   Log.Information("SSN submitted | ssn={ssn}", "123-45-6789");    // ❌ blocked (forbidden)
   Log.Information("Order processed");                             // ❌ blocked (missing userId)
   ```

### Plugin support

For advanced scenarios, you can implement `ICustomGovernancePlugin` to create your own validation logic. A plugin can enforce domain‑specific rules, such as requiring a `TeamId` field in production logs.

## License and support

Cerbi.Serilog.GovernanceAnalyzer is licensed under the MIT license. For more details, visit [cerbi.io/licenses](https://cerbi.io/licenses). Questions or feedback? Contact [hello@cerbi.io](mailto:hello@cerbi.io).
