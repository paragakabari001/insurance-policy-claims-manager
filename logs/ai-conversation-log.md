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
  - Tests performed
  - Edge cases identified, their handling, and fixes made
  - Assumptions, design trade-offs, known limitations
  - AI tools used and log locations

---
*End of AI Development Transcript Log*
