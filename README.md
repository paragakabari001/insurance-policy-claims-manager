# TailVaR Consulting - Insurance Policy & Claims Management System

> **Founding Engineer Hiring 2026: Take-Home Assignment**  
> Candidate: Parag  
> Repository: `https://github.com/paragakabari001/insurance-policy-claims-manager`  
> Submission Deadline: 7 November 2026, 11:59 PM IST  
> Operational Guarantee: 30 November 2026, 11:59 PM IST  

---

## 1. Project Overview and Implemented Features

This project is an end-to-end insurance policy and claims management web application designed for TailVaR Consulting. It provides a secure, role-based platform where administrators can create customer policies and adjudicate claims, while customers can view their active policies and file claims against remaining coverage limits.

### Pre-Configured Demo Accounts
The system is automatically seeded with the three required evaluation accounts:

| Role | Username | Password | Access Boundary |
| :--- | :--- | :--- | :--- |
| **Customer 1** | `customer1` | `Customer1@Demo26` | Isolated to Customer 1 policies and claims |
| **Customer 2** | `customer2` | `Customer2@Demo26` | Isolated to Customer 2 policies and claims |
| **Administrator** | `admin` | `Admin@Demo26` | Global access, policy issuance, claim adjudication |

*Note: Demo quick-login buttons on the sign-in page execute the real `POST /api/auth/login` authentication flow, issuing cryptographically signed JWT tokens.*

### Implemented Workflows & Features

#### Administrator
- **Policy Creation:** Issue insurance policies for either customer, specifying coverage start date, end date, and Sum Insured (SI). Rejects inverted dates (`endDate < startDate`) and non-positive SI amounts (`<= 0`).
- **Policy Overview:** Inspect all customer policies with customer identity, coverage dates, coverage status (`Active`, `Upcoming`, `Expired`), original SI, remaining coverage, and utilization progress (`Reserved + Used`).
- **Claims Review:** Inspect claims across all customers with live status (`Submitted`, `Approved`, `Rejected`), linked policy, incident date, and amount.
- **Decision Workflow & Confirmation:** Review submitted claims with an explicit confirmation dialog displaying Claim ID and Claim Amount. Approving keeps the amount consumed; rejecting releases the reserved balance immediately. Re-deciding a decided claim is rejected server-side.

#### Customer
- **Data Isolation:** Customers strictly access only their own policies and submitted claims. Attempts to view or submit claims against other customers' policies are blocked server-side (HTTP 403).
- **Claim Submission:** Submit claims against policies via top-level or row-level actions with preselected policy context. Incident dates are validated against the policy's coverage duration (`startDate <= incidentDate <= endDate`), inclusive, even for expired policies.
- **Decision Tracking:** Real-time visibility into claim statuses (`Submitted`, `Approved`, `Rejected`) with live badges and submission timestamps.

#### Claim Accounting Rules & Timezone Specification
$$\text{Remaining Coverage} = \text{Original Policy SI} - \sum \text{Submitted Claims} - \sum \text{Approved Claims}$$
1. **Application Timezone:** The server calculates today's calendar date and active policy status using the documented timezone: `Asia/Kolkata` (IST).
2. **Policy Counts:** Displays "Total Policies" with a clear breakdown of `Active`, `Upcoming`, and `Expired` policies. Coverage status (`Active` if `startDate <= today <= endDate`) is strictly decoupled from claimable balance.
3. **Immediate Reservation:** Submitted claims reserve coverage immediately.
4. **Approved Claims:** Permanently use coverage.
5. **Rejected Claims:** Immediately restore reserved coverage so it can be claimed again.
6. **Coverage Bounds:** Incident date must fall between policy start date and end date, inclusive (`startDate <= incidentDate <= endDate`), regardless of whether the policy is currently expired.
7. **Concurrency Safety:** Claims are processed within serialized database transactions (`prisma.$transaction`) to eliminate double-spending race conditions.

---

## 2. Technology Stack and Rationale

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Fast builds, strong type safety, and predictable component rendering. |
| **UI Components** | Tailwind CSS, shadcn/ui primitives, Lucide Icons | Clean, compact, professional interface with accessible contrast and restrained emerald accents. |
| **Backend API** | Node.js, Express, TypeScript | Modular routing, robust middleware ecosystem, and shared TypeScript domain interfaces. |
| **Database & ORM** | SQLite / PostgreSQL via Prisma ORM | Durable persistence, type-safe queries, migration integrity, and zero-configuration local evaluation. |
| **Authentication** | JWT (jsonwebtoken) & bcryptjs | Stateless, tamper-proof session tokens with salted bcrypt password hashing. |
| **Testing** | Jest, Supertest, ts-jest | Full integration and unit test suite verifying business logic, access control, and concurrency. |
| **Packaging** | Docker multi-stage build | Single deployable container serving both the static React build and Express API. |

---

## 3. System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Frontend                        │
│   (React 18 + Vite + Tailwind CSS + shadcn/ui)              │
│   • Single Navigation: Dashboard, Policies, Claims          │
│   • Real API authentication for all accounts                │
│   • Real-time remaining coverage balance preview            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Backend                       │
│   • Auth Middleware (JWT Bearer token verification)         │
│   • Tenant Isolation & Ownership Guard                      │
│   • Transactional Accounting Engine                         │
│   • Concurrency serialized checks (prisma.$transaction)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma Client
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Durable Database (SQLite)                   │
│   • Persists across container boots and application restarts│
│   • Auto-seeded with demo accounts and sample policies      │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Live Application URL

- **Primary Cloud Deployment URL:** `https://insurance-policy-claims-manager.onrender.com` *(or configured cloud provider URL)*
- **Local Application URL:** `http://localhost:5001`

### Cloud Deployment Instructions (Render / Railway / Fly.io / Docker)
1. Fork or clone repository: `https://github.com/paragakabari001/insurance-policy-claims-manager.git`
2. Connect to hosting platform (e.g., Render Web Service or Railway).
3. Build Command: `npm run build`
4. Start Command: `npm start`
5. Configure Environment Variables:
   - `PORT=5001`
   - `NODE_ENV=production`
   - `DATABASE_URL=file:./dev.db` (or a managed PostgreSQL database URL)
   - `JWT_SECRET=your_production_secret_key`

---

## 5. Local Setup, Migrations & Demo Account Setup

### Prerequisites
- Node.js >= 18
- npm >= 9

### Step-by-Step Local Setup

```bash
# 1. Clone repository
git clone https://github.com/paragakabari001/insurance-policy-claims-manager.git
cd insurance-policy-claims-manager

# 2. Install dependencies for root, server, and client
npm run postinstall

# 3. Seed demo accounts (customer1, customer2, admin) safely without data loss
npm run seed

# 4. Build both frontend and backend
npm run build

# 5. Start unified application (API + Frontend on port 5001)
npm start
```
Access the application at `http://localhost:5001`.

---

## 6. Tests Performed & Verification Report

The test suite runs with Jest and Supertest (`server/src/__tests__/claims.test.ts`).

To execute tests:
```bash
npm test
```

### Verification Results (25/25 Passing Tests)
| Test Category | Test Case | Status |
| :--- | :--- | :--- |
| **Authentication** | Valid login for `customer1`, `customer2`, and `admin` | ✅ PASSED |
| **Authentication** | Reject invalid credentials (HTTP 401) | ✅ PASSED |
| **Authentication** | Working logout endpoint (`POST /api/auth/logout`) | ✅ PASSED |
| **Authentication** | Reject unauthenticated access to protected endpoints | ✅ PASSED |
| **Access Control** | Reject customer attempting admin policy creation (HTTP 403) | ✅ PASSED |
| **Access Control** | Reject customer attempting admin claim decision (HTTP 403) | ✅ PASSED |
| **Data Isolation** | Customer 1 views only Customer 1 policies | ✅ PASSED |
| **Data Isolation** | Customer 1 blocked from accessing Customer 2 policy ID | ✅ PASSED |
| **Data Isolation** | Customer 1 blocked from filing claim on Customer 2 policy | ✅ PASSED |
| **Data Isolation** | Administrator can view all customer policies | ✅ PASSED |
| **Validation** | Reject policy creation with end date earlier than start date | ✅ PASSED |
| **Validation** | Reject non-positive Sum Insured (`SI <= 0`) | ✅ PASSED |
| **Validation** | Reject zero or negative claim amount (`amount <= 0`) | ✅ PASSED |
| **Validation** | Reject invalid calendar date format (e.g., `2026-02-31`) | ✅ PASSED |
| **Boundaries** | Accept incident date exactly on `startDate` boundary | ✅ PASSED |
| **Boundaries** | Accept incident date exactly on `endDate` boundary | ✅ PASSED |
| **Boundaries** | Reject incident date 1 day before coverage start | ✅ PASSED |
| **Boundaries** | Reject incident date 1 day after coverage end | ✅ PASSED |
| **Accounting** | Step 1: Submit ₹6,00,000 on ₹10,00,000 SI $\rightarrow$ Remaining ₹4,00,000 | ✅ PASSED |
| **Accounting** | Step 2: Attempt ₹5,00,000 $\rightarrow$ Rejected (exceeds remaining SI) | ✅ PASSED |
| **Accounting** | Claim equal to exact remaining SI (₹4,00,000) $\rightarrow$ Accepted | ✅ PASSED |
| **Accounting** | Step 3: Admin rejects ₹6,00,000 claim $\rightarrow$ Balance restores to ₹10,00,000 | ✅ PASSED |
| **Accounting** | Step 4: Submit ₹5,00,000 claim $\rightarrow$ Accepted (remaining ₹5,00,000) | ✅ PASSED |
| **Accounting** | Step 5: Admin approves ₹5,00,000 claim $\rightarrow$ Balance stays ₹5,00,000 | ✅ PASSED |
| **Accounting** | Decided claims cannot be decided again (immutability) | ✅ PASSED |
| **Concurrency** | Concurrent claims exceeding SI serialized via transactions | ✅ PASSED |
| **Persistence** | Records persist durably in SQLite database file | ✅ PASSED |

---

## 7. Edge Cases Identified, Handling & Fixes

1. **Concurrent Simultaneous Claim Submissions:**
   - *Risk:* Two concurrent requests both read remaining SI as available, and both get inserted, exceeding policy limit.
   - *Fix:* Executed all balance checks and insertions within atomic database transactions (`prisma.$transaction`) with serialized locking.
2. **Calendar Date vs Floating Timestamps:**
   - *Risk:* Timezone offsets shift dates across midnight, causing valid incident dates to be wrongly rejected or vice versa.
   - *Fix:* Standardized strictly on calendar date strings (`YYYY-MM-DD`). Validated format and day-of-month ranges rigorously without UTC timezone drift.
3. **Exact Coverage Boundaries:**
   - *Handling:* Inclusive string comparisons (`targetDate >= startDate && targetDate <= endDate`) ensure incidents occurring on the exact first and last day of coverage are accepted.
4. **Claim Balance Immutability:**
   - *Handling:* Only claims in `Submitted` status can receive an `Approved` or `Rejected` decision. Re-deciding a claim returns HTTP 400.
5. **Monetary Precision:**
   - *Handling:* Stored amounts as positive monetary values with strict decimal rounding (`Math.round(val * 100) / 100`) preventing floating point inaccuracies.

---

## 8. Assumptions, Trade-offs & Limitations

- **Assumptions:** Demo accounts are pre-seeded for evaluator convenience. Indian numbering format (`₹ 10,00,000`) is used in the UI to match the illustrative example in the specification.
- **Trade-offs:** SQLite was selected as the default durable store for frictionless local evaluation and zero external dependencies, while Prisma allows swapping to PostgreSQL simply by changing `DATABASE_URL`.
- **Known Limitations:** Push notifications and WebSockets are out of scope as per section 1.5; updated decisions are reflected upon data refresh or subsequent retrieval.

---

## 9. AI Tools Used & Conversation Logs

### AI Tools Utilized
- **Claude & Gemini (Advanced Agentic Assistant):** Used for scaffolding, refactoring to shadcn/ui components, formulating transactional race condition tests, and drafting documentation.
- **Assistance Scope:**
  - TypeScript interfaces and Prisma database schema definitions.
  - Concurrency test implementation using `Promise.all` and transaction locks.
  - UI modernization with clean white modal dialogs and restrained emerald palette.

### Location of Submitted AI Conversation Logs
In accordance with Section 2.2 of the submission guidelines, development logs are preserved in:
- `docs/ai-logs/ai-development-log.md`
- `logs/ai-conversation-log.md`
- Included in the final submission ZIP archive.

---

## License & Confidentiality
This submission was developed confidentially for TailVaR Consulting.
