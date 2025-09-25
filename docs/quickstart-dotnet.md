---
title: "Quick Start (.NET)"
description: "Install CerbiStream and enable governance in minutes."
permalink: /docs/quickstart-dotnet/
layout: default
---

# Quick Start - CerbiStream (.NET)

#program 

dotnet add package CerbiStream
dotnet add package CerbiStream.GovernanceAnalyzer
dotnet add package Cerbi.MEL.Governance

using CerbiStream;
using Microsoft.Extensions.Logging;

var logger = LoggerFactory.Create(builder =>
{
    builder.AddCerbiStream(opts =>
    {
        opts.WithFileFallback();
        opts.UseGovernance("cerbi_governance.json");
    });
}).CreateLogger<Program>();

logger.LogInformation("User logged in {@user}", new { UserId = "12345" });
