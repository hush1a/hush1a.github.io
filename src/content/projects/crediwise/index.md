---
title: "CrediWise"
description: "Two-way credit safety app built at GarudaHacks 7.0, pairing a native iOS client with a Python backend."
date: 2026-07-01
repoURL: "https://github.com/Shazaw/CrediWise"
image: "./cover.jpg"
imageAlt: "Live safe-borrowing recommendation: safe loan amount, maximum instalment, liquidity buffer and tenor"
gallery:
  - src: "./api-overview.jpg"
    alt: "FastAPI docs for the backend, with the assessment endpoints: twin, recommendation, dashboard, shocks and offers"
  - src: "./assessment-dashboard.jpg"
    alt: "Live assessment dashboard response: data confidence, risk band and plain-language reasons"
  - src: "./shock-scenarios.jpg"
    alt: "Live shock-resilience response: an income-drop scenario with a day-by-day balance projection"
  - src: "./offer-safety.jpg"
    alt: "Live offer safety evaluation: a simulated lender offer scored and ranked, with warnings and reason codes"
  - src: "./dashboard-schema.jpg"
    alt: "ReDoc reference for the assessment dashboard response schema"
stack:
  - area: "Backend"
    mine: true
    items: ["Python", "FastAPI", "Pydantic", "SQLAlchemy", "PostgreSQL", "Celery", "Redis", "MinIO", "Tesseract OCR", "Docker", "Pytest"]
  - area: "iOS app"
    items: ["Swift", "SwiftUI"]
---

**Back-End Developer** · GarudaHacks 7.0 (Safety track)

- Built most of the backend for a credit safety engine for thin-file, informal-income and gig-worker users in Indonesia. It answers not only whether a user is creditworthy, but whether a loan is worthy of the user.
- Turned uploaded bank statements, CSVs and receipt images into verified transactions through a Celery pipeline: PDF and CSV parsing, Tesseract OCR, duplicate detection and a trust layer that scores how reliable the data is.
- Wrote the deterministic engines behind every result: a Cash-Flow Digital Twin, repayment-risk bands with reason codes, shock simulations, safe borrowing capacity and a safety-first ranking of loan offers.
- Kept AI out of the scoring. A local, self-hosted model only phrases existing reason codes, so every output stays reproducible and auditable, and an experimental repayment model runs in shadow without changing results.
- Set up the FastAPI service with JWT auth, rate limiting, versioned Alembic migrations, S3-compatible storage and a published OpenAPI contract for the iOS team.
