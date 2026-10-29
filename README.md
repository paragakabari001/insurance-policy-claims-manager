# TailVaR Consulting - Insurance Policy & Claims Management System

> **Founding Engineer Hiring 2026: Take-Home Assignment**  
> Candidate: Parag  
> Repository: `https://github.com/paragakabari001/insurance-policy-claims-manager`  
> Live Application URL: `https://insurance-policy-claims-manager.onrender.com` *(or configurable deploy URL; see Deployment section)*

---

## 1. Project Overview and Implemented Features

This application is an end-to-end, multi-tenant insurance policy and claims management web application. It features strict role-based access control, server-side claim accounting validation with transactional concurrency control, durable persistence, and a responsive frontend interface with quick reviewer sign-in capabilities.

### Pre-configured Demo Accounts
The database automatically seeds on first launch with the required evaluation accounts:
| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Customer 1** | `customer1` | `Customer1@Demo26` | Own policies & claims only |
| **Customer 2** | `customer2` | `Customer2@Demo26` | Own policies & claims only |
| **Administrator** | `admin` | `Admin@Demo26` | All policies, all claims, policy issuance & claim decisions |

*Note: The login page includes 1-click demo switcher buttons for instant reviewer login without needing to copy-paste passwords.*

### Key Features Implemented

#### Administrator Capabilities
- **Policy Creation:** Issue insurance policies for either customer, specifying coverage start date, coverage end date, and Sum Insured (SI).
- **Comprehensive Policy Overview:** View all customer policies, coverage durations, original SI, remaining claimable SI, and dynamic utilization progress bars.
- **Claims Management & Adjudication:** Inspect claims across all customers with live status (`Submitted`, `Approved`, `Rejected`), customer identity, and linked policy.
- **Immediate State Decisions:** Approve or reject `Submitted` claims. Decisions immediately update the claim status and the policy's remaining claimable limit.

#### Customer Capabilities
- **Strict Data Isolation:** Customers can only inspect their own policies and submitted claims.
- **Claim Submission Portal:** File claims against active policies with date picker constraints (clamped strictly within the policy's coverage window) and real-time claimable SI balance verification.
- **Live Decision Tracking:** View claim status updates (`Submitted`, `Approved`, `Rejected`) with instant visual badge indicators and submission timelines.

#### Core Business & Accounting Rules (Section 1.6)
1. **Coverage Window Verification:** Incident dates must strictly fall within `startDate <= incidentDate <= endDate` (inclusive calendar dates, format `YYYY-MM-DD`).
2. **Positive Value Constraints:** All policy SI amounts and claim amounts must be strictly positive (`> 0`).
3. **Claimable SI Safeguard:** A claim cannot exceed the remaining claimable SI for the selected policy (`total Submitted + total Approved <= sumInsured`).
4. **Immediate SI Blocking:** Claims in `Submitted` status immediately block the requested amount from the remaining claimable SI.
5. **Approval Mechanics:** `Approved` claims continue to consume SI indefinitely.
6. **Rejection Release Mechanics:** `Rejected` claims immediately release their blocked amount back into the available pool.
7. **Single-Decision Immutability:** Only claims in `Submitted` status can be decided. An already `Approved` or `Rejected` claim cannot be re-decided.
8. **Transactional Concurrency Safety:** All claim submissions and decision updates execute within atomic database transactions (`prisma.$transaction`) to prevent double-spending or race conditions.

---

## 2. Technology Stack and Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **React 18 + TypeScript + Vite** | Fast compilation, strict type safety, predictable state handling, and zero runtime overhead. |
| **Styling** | **Tailwind CSS + Lucide Icons** | Clean, responsive design with accessible color contrasts (amber for submitted, emerald for approved, rose for rejected). |
| **Backend API** | **Node.js + Express + TypeScript** | Robust RESTful routing, battle-tested middleware ecosystem, and shared TypeScript domain interfaces. |
| **ORM & Database** | **Prisma ORM + SQLite (Durable)** | High reliability, type-safe queries, migration integrity, and durability across restarts without complex external infrastructure setup. Easily adaptable to PostgreSQL via `DATABASE_URL`. |
| **Authentication** | **JWT (JSON Web Tokens) + bcryptjs** | Stateless authentication with cryptographic signature, role verification, and password hashing. |
| **Testing** | **Jest + Supertest + ts-jest** | Automated integration and unit test suite validating business rules, edge cases, and authorization boundaries. |
| **Containerization** | **Docker + Multi-stage Build** | Unified container packaging client static build and Express server into a single lightweight deployment artifact. |

---

## 3. System Architecture

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   (React 18 + TypeScript SPA / Vite / Tailwind UI)          │
│   • Quick Demo Switcher (customer1, customer2, admin)       │
│   • Dynamic SI utilization meter & date-constrained inputs  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Express Backend                        │
│   • Auth Middleware (JWT token validation & role check)     │
│   • Policy Controller & Claim Controller                    │
│   • Accounting Engine (Submitted blocks, Rejected releases) │
│   • Transactional Mutex / ACID isolation                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma Client
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Durable Persistence Store                   │
│   • SQLite Database (or PostgreSQL via DATABASE_URL)        │
│   • Auto-seeded demo accounts & initial test policies       │
│   • Persists across session restarts and container boots    │
└─────────────────────────────────────────────────────────────┘
```

### Component Data Flow
1. **User Authentication:** Client submits credentials to `POST /api/auth/login`. Server verifies bcrypt hash and returns a signed JWT containing `{ id, username, role, name }`.
2. **Access Control:** Every protected request carries `Authorization: Bearer <token>`. The middleware enforces customer-level tenant isolation (`customerId === req.user.id`) or admin-level access.
3. **Claim Processing Flow:**
   - Customer submits claim to `POST /api/claims`.
   - Backend begins database transaction:
     1. Fetches policy and checks customer ownership.
     2. Verifies incident date falls between policy `startDate` and `endDate`.
     3. Computes active claims (`Submitted` + `Approved`).
     4. Verifies `newClaim.amount <= (sumInsured - activeTotal)`.
     5. Creates claim in `Submitted` status, reducing remaining SI atomically.
4. **Decision Flow:**
   - Admin sends decision to `PATCH /api/claims/:id/decision`.
   - Validates that existing claim is currently in `Submitted` status.
   - Updates status to `Approved` (retains consumed SI) or `Rejected` (restores remaining SI).

---

## 4. Live Application URL & Deployment Instructions

### Live URL
- **Production URL:** `https://insurance-policy-claims-manager.onrender.com` *(or your assigned cloud deployment domain)*
- **Local URL:** `http://localhost:5001`

### Running Locally (Quick Start)

#### Prerequisites
- Node.js >= 18
- npm >= 9

```bash
# 1. Clone the repository
git clone https://github.com/paragakabari001/insurance-policy-claims-manager.git
cd insurance-policy-claims-manager

# 2. Run postinstall setup (installs server & client dependencies and generates Prisma client)
npm run postinstall

# 3. Seed demo accounts and illustrative policies
npm run seed

# 4. Build both frontend and backend
npm run build

# 5. Start unified production server
npm start
# -> Server running on http://localhost:5001
```

For live development with hot reloading:
```bash
# In terminal 1 (Backend API):
npm run dev:server

# In terminal 2 (Vite Frontend):
npm run dev:client
```

### Running with Docker

```bash
docker compose up --build
```
Access the application at `http://localhost:5001`.

### Deploying to Cloud (Render / Railway / Fly.io)
1. Link your GitHub repository `https://github.com/paragakabari001/insurance-policy-claims-manager`.
2. Set Build Command: `npm run build`
3. Set Start Command: `npm start`
4. Set Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5001`
   - `JWT_SECRET=<secure_random_string>`
   - `DATABASE_URL="file:./dev.db"` (or a PostgreSQL connection string)

---

## 5. Tests Performed

The system includes automated integration and unit test suites covering the core requirements and boundary edge cases (`server/src/__tests__/claims.test.ts`):

To run tests:
```bash
npm test
```

### Test Coverage Highlights:
- **Authentication & RBAC:**
  - Reject unauthenticated access (HTTP 401).
  - Reject non-admin users attempting to issue policies (HTTP 403).
  - Allow admin to issue policies with valid parameters (HTTP 201).
  - Reject policy end date earlier than start date (HTTP 400).
  - Reject policy creation with negative or zero SI (HTTP 400).
- **Tenant & Data Isolation:**
  - Verify Customer 1 cannot view Customer 2 policies or claims.
  - Verify Customer 1 cannot submit claims against Customer 2 policies (HTTP 403).
- **Illustrative Example from Assignment Specification (Section 1.6):**
  - Policy created with `SI: 10,00,000`.
  - Customer submits claim for `6,00,000` -> Remaining SI becomes `4,00,000`.
  - Customer attempts to submit claim for `5,00,000` -> **Rejected by system** (exceeds `4,00,000` remaining limit).
  - Administrator rejects the `6,00,000` claim -> Remaining SI immediately returns to `10,00,000`.
  - Customer re-submits `5,00,000` claim -> **Accepted** (remaining SI becomes `5,00,000`).
  - Administrator approves this claim -> Remaining SI remains at `5,00,000`.
  - Re-deciding an already approved/rejected claim is rejected (HTTP 400).

---

## 6. Edge Cases Identified, Handling & Fixes Made

| Edge Case | Risk | Handling & Implemented Fix |
| :--- | :--- | :--- |
| **Concurrent Claim Submissions** | Race conditions where two simultaneous claims pass SI check and exceed limit. | Handled via interactive database transactions (`prisma.$transaction`) ensuring serialized balance checks. |
| **Calendar Date vs Timestamp** | Timezone shifts causing incident date to fall outside start/end boundary. | Standardized strictly on ISO calendar date strings (`YYYY-MM-DD`). Validated format and bounds with regex and date arithmetic rather than floating UTC timestamps. |
| **Inverted Policy Dates** | Policies with `endDate < startDate`. | Server-side validation rejects any policy where `endDate < startDate` with a descriptive error message. |
| **Negative or Zero Amounts** | Zero or negative amounts manipulating balances. | Strictly checked `amount > 0` and `sumInsured > 0` on server routes. |
| **Cross-Tenant Claim Hijacking** | Malicious customer submitting claims using another customer's policy ID. | Explicit customer ownership check (`policy.customerId === req.user.id`) enforced server-side before processing. |
| **Re-deciding Decided Claims** | Changing an Approved claim to Rejected after payment, or vice-versa. | Explicit state check: only claims in `Submitted` status can receive decisions. Attempts to decide an already decided claim return HTTP 400. |
| **Floating Point Precision** | Rounding errors with monetary values (e.g., `0.1 + 0.2 = 0.30000000000000004`). | Normalized all monetary amounts using `Math.round(val * 100) / 100` before arithmetic and persistence. |

---

## 7. Assumptions, Design Trade-Offs, Known Limitations

### Assumptions
- Predefined demo accounts are fixed for evaluation purposes and do not require external password reset workflows.
- Currency is formatted in Indian Rupee format (`₹ 10,00,000`) matching the illustrative example in the specification.

### Design Trade-offs
- **Unified Single-Service vs Microservices:** Packaged React static assets directly inside the Express server for production.  
  *Trade-off:* Combines frontend and backend into a single deployment unit, eliminating CORS complexities, reducing cloud resource consumption, and ensuring 1-click cloud deployments without coordinating multiple services.
- **SQLite with Prisma:** Used SQLite as the default durable store.  
  *Trade-off:* Zero-configuration setup for local evaluation and portable file durability. Easily swappable to PostgreSQL on cloud providers simply by setting the `DATABASE_URL` environment variable.

### Known Limitations & Future Enhancements
- **Push Notifications:** As stated in the specification, push notifications were out of scope. Real-time updates are retrieved via manual refresh or state updates following user actions.
- **File Attachments:** Claims currently record incident date, description, and amounts. Supporting document uploads (e.g. medical bills or repair receipts via S3/Cloud Storage) can be added as a subsequent iteration.

---

## 8. AI Tools Used & Conversation Logs

### AI Tools Utilized
- **Claude & Gemini (Advanced Agentic Assistant):** Used for scaffolding project structure, designing transactional logic for claim accounting, formulating edge case test suites, and formatting documentation.
- **Assistance Scope:**
  - Automated generation of TypeScript types and Prisma schema definitions.
  - Formulating Jest integration tests directly mapped to the illustrative test case in Section 1.6 of the take-home specification.
  - Designing responsive UI components with Tailwind CSS.

### Location of Submitted AI Conversation Logs
In compliance with Section 2.2 and Section 3 of the submission guidelines, exported transcripts and conversation logs are preserved in:
- `logs/ai-conversation-log.md`
- Transcripts included in final submission ZIP archive.

---

## License & Confidentiality
This project was developed for the TailVaR Consulting Founding Engineer Hiring 2026 assessment. All assessment materials and intellectual property are subject to the confidentiality terms outlined in the assignment brief.
