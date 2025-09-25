# Quick Start — CerbiStream (.NET)

```
dotnet add package CerbiStream
dotnet add package CerbiStream.GovernanceAnalyzer
dotnet add package Cerbi.MEL.Governance

```

**Program.cs**

```
using CerbiStream;

var logger = LoggerFactory.Create(builder =>
{
  builder.AddCerbiStream(opts =>
  {
    opts.WithFileFallback();
    opts.UseGovernance("cerbi_governance.json");
  });
}).CreateLogger<Program>();

logger.LogInformation("User logged in {@user}", new { UserId = "12345" });

```

**Next**: Add a governance profile and run your CI to see analyzer diagnostics.
