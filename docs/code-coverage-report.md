# Code Coverage Report

Report date: April 23, 2026

Command used:

```powershell
cd backend
mvn clean test jacoco:report
```

## Summary

| Metric | Value |
|---|---:|
| Line coverage | 30.6% |
| Instruction coverage | 27.8% |
| Branch coverage | 17.7% |
| Tests run | 54 run, 0 failures, 0 errors, 0 skipped |

## Per-Package Breakdown

| Package | Line % | Instruction % | Branch % |
|---|---:|---:|---:|
| `com.pedaerial.operatorflightcheck.controller` | 22.7% | 11.9% | 5.9% |
| `com.pedaerial.operatorflightcheck.service` | 19.7% | 16.7% | 13.7% |
| `com.pedaerial.operatorflightcheck.security` | 88.0% | 86.9% | 63.9% |
| `com.pedaerial.operatorflightcheck.config` | 22.7% | 30.1% | 14.3% |

## Coverage Gap Analysis

The lowest coverage is concentrated in service and controller workflow code. `JobRequestService`, `ResponseMapper`, `PdfGenerationService`, `PaymentService`, `UserProfileService`, `ServiceCatalogService`, and `AgreementService` have little or no line coverage, so targeted unit tests around request submission, mapping, PDF generation error paths, payments, profiles, service catalog, and agreements would raise the service package. `JobRequestController`, `ServiceCatalogController`, and `AgreementController` are currently uncovered, so MockMvc tests should exercise authenticated role access and happy/error response paths. `DemoDataConfig` also has 0.0% line coverage; that can be covered with a focused Spring context or configuration test, though it is lower priority than user-facing API behavior.

## Planned Improvements

Phase 3 of the capstone roadmap will add MockMvc tests for `JobController`, `InvoiceController`, `DocumentController`, and `JobRequestController` to target 70%+ backend coverage. The same phase should add focused service tests for `JobRequestService`, `ResponseMapper`, and payment/agreement flows so coverage improves through meaningful workflow assertions rather than shallow test padding.
