# AI Assisted Development Log - Insurance Policy & Claims Manager

**Applicant:** Parag  
**Date:** October 2026  
**Assignment:** TailVaR Consulting Founding Engineer Hiring 2026  
**Tools Used:** Gemini / Antigravity AI Coding Assistant  

---

## Session Overview

### Objectives
1. Build an end-to-end insurance policy and claims management platform adhering to all specification requirements.
2. Implement strict role-based access control with pre-seeded demo accounts (`customer1`, `customer2`, `admin`).
3. Enforce server-side claim accounting mechanics:
   - Calendar date format (`YYYY-MM-DD`).
   - Incident date within policy coverage period (inclusive).
   - Submitted claims block SI immediately.
   - Approved claims continue to consume SI.
   - Rejected claims release their blocked amount so it can be claimed again.
   - Only Submitted claims can be approved/rejected.
   - Concurrency safety with atomic transactions.
4. Build a functional, intuitive React frontend with quick 1-click reviewer sign-in.
5. Create an automated test suite verifying all rules and illustrative spec cases.
6. Prepare the application for cloud deployment and package for final submission.

---

## Log of Prompts and Actions

### 1. Requirements Extraction & System Architecture
- **Action:** Extracted specifications from the assignment PDF:
  - Account roles & demo credentials.
  - Data model: Policy, Claim, User.
  - Mandatory business logic & illustrative example (10 Lakh SI, 6 Lakh claim, 5 Lakh blocked, rejection restores 10 Lakhs, approval keeps consumed).
- **Prompt:** Initialize fullstack monorepo with React frontend and Node.js/Express TypeScript backend with Prisma and SQLite.

### 2. Backend Implementation & Transaction Safety
- **Action:** Created Prisma schema with models: `User`, `Policy`, `Claim`.
- **Action:** Implemented JWT authentication and role-based guards (`requireAdmin`, `requireCustomer`).
- **Action:** Built `policyService.ts` to compute policy balances and validate date ranges.
- **Action:** Implemented routes with `prisma.$transaction` to guarantee atomicity when checking balances and inserting claims or updating decisions.

### 3. Automated Test Suite Verification
- **Action:** Created `server/src/__tests__/claims.test.ts` with 14 automated test cases covering:
  - Auth failures & role boundaries.
  - Cross-tenant data isolation.
  - Boundary cases (incident dates before/after coverage, negative amounts).
  - Exact simulation of the illustrative scenario described in Section 1.6 of the specification document.
- **Outcome:** 14/14 tests passing.

### 4. Frontend Design & Usability
- **Action:** Built React SPA with Vite and Tailwind CSS:
  - `LoginPage` with 1-click quick-login buttons for `customer1`, `customer2`, and `admin` so evaluators can test instantly.
  - `AdminDashboard` displaying policy overview, customer accounts, create policy modal, and live claim decision controls.
  - `CustomerDashboard` displaying isolated customer policies, remaining SI gauges, and claim submission modal with bounded date pickers.
  - Toast feedback for all user actions.
- **Outcome:** Built successfully in 1.3s with zero build warnings.

### 5. Deployment Setup & Documentation
- **Action:** Configured single-service production serving (Express serving Vite static build).
- **Action:** Created `Dockerfile` and `docker-compose.yml`.
- **Action:** Formatted comprehensive `README.md` fulfilling all required sections:
  - Project overview and implemented features
  - Technology stack and rationale
  - System architecture
  - Live application URL
  - Tests performed (25/25 tests passing)
  - Edge cases identified, their handling, and fixes made
  - Assumptions, design trade-offs, known limitations
  - AI tools used and log locations

### 6. Review, Hardening & Final Polishing
- **Action:** Standardized UI with compact shadcn/ui components, restrained emerald accents, and clear whitespace.
- **Action:** Corrected policy counts to use "Total Policies" with a dynamic breakdown of Active, Upcoming, and Expired policies evaluated in the `Asia/Kolkata` (IST) application timezone.
- **Action:** Enhanced Admin Claims Review with an explicit confirmation modal displaying Claim ID, Customer, Policy ID, and Claim Amount before approving or rejecting.
- **Action:** Replaced ambiguous labels with clear terminology: "Claims Review", "Reserved + Used", "Remaining Coverage", "Submit Claim", "Create Policy".
- **Action:** Ensured expired policies accept claims as long as the incident date falls within the policy's coverage duration (`startDate <= incidentDate <= endDate`).
- **Action:** Verified "Switch Demo User" executes real server-side authentication (`POST /api/auth/login`) and completely resets tenant caches.
- **Action:** Expanded automated test suite from 14 to 25 comprehensive tests, executing against an isolated `test.db` to protect demo database stability.
- **Outcome:** 25/25 tests passing cleanly; production build verified.

---
*End of AI Development Transcript Log*
