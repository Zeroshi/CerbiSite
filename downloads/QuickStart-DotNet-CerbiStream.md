# Quick Start — .NET with CerbiStream

## Install (NuGet)
```bash
dotnet add package CerbiStream
dotnet add package Cerbi.MEL.Governance
dotnet add package CerbiStream.GovernanceAnalyzer
```

## Configure (Program.cs)
```csharp
using CerbiStream;

var logger = LoggerFactory.Create(builder =>
{
  builder.AddCerbiStream(options =>
  {
    options.WithFileFallback();
    options.UseGovernance("cerbi_governance.json");
  });
}).CreateLogger<Program>();
```

## Log with Governance
```csharp
logger.LogInformation("User logged in {@user}", new { UserId = "12345" });
```

## Next
- Author a profile in CerbiShield or include `cerbi_governance.json` in your project.
- Start in **relax-mode** to tag/redact without dropping visibility.
