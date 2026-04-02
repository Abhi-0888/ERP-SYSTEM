# EduCore ERP - Comprehensive System Blueprint

This document serves as the absolute source of truth for the EduCore ERP system. It details the underlying architecture, role-based access control (RBAC), multi-tenancy implementation, all built modules, their respective API endpoints, and the precise data flow across the application.

---

## 1. System Architecture & Foundation

### 1.1 Technology Stack
*   **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS, shadcn/ui components, Lucide React (Icons), Axios for API calls.
*   **Backend**: NestJS (TypeScript framework), Express underlying engine.
*   **Database**: MongoDB (managed via Mongoose ORM).
*   **Authentication**: JWT (JSON Web Tokens) with Passport.js, bcrypt for password hashing.

### 1.2 Multi-Tenancy & Data Isolation Model
The system is built as a highly scalable **multi-tenant SaaS**. A single deployment serves multiple universities.
*   **The `universityId` Anchor**: Almost every primary entity in the database (Users, Programs, Departments, Fees, Students, Attendance) contains a `universityId` field.
*   **`UniversityIsolationGuard`**: This NestJS guard checks the authenticated user's `universityId`. If the user is NOT a `SUPER_ADMIN`, the guard automatically blocks access to any resource or endpoint param that attempts to access or modify data belonging to another `universityId`.
*   **Service-Level Filtering**: Every `find` or `aggregate` query at the DB level automatically appends `{ universityId: currentUser.universityId }` for tenant-users.

---

## 2. Role-Based Access Control (RBAC) Matrix

Occupying 16 distinct roles, defined in `Role` enum. Access is strictly controlled via the `@Roles(...)` decorator.

### 2.1 Global/Platform Level
*   **`SUPER_ADMIN`**: Global visibility. Manages university onboarding, global audit logs, and system health.

### 2.2 University Leadership Level
*   **`UNIVERSITY_ADMIN`**: Owner of a specific tenant. Full CRUD over university staff, students, and settings.
*   **`REGISTRAR`**: Primary academic administrator (Enrollments, Programs, Years).
*   **`HOD` (Head of Department)**: Department-specific management (Faculty, Timetables).
*   **`FINANCE` / `ACCOUNTANT`**: Financial controllers (Fees, Payments).

### 2.3 Operational & Specialized Roles
*   **`ACADEMIC_COORDINATOR`**: Operational academic management.
*   **`EXAM_CONTROLLER`**: Results and exam scheduling.
*   **`LIBRARIAN`**: Library inventory and circulation.
*   **`HOSTEL_WARDEN`**: Housing management.
*   **`PLACEMENT_OFFICER` / `PLACEMENT_CELL`**: Career services.
*   **`TRANSPORT_MANAGER`**: Fleet and route management.

### 2.4 End-Users
*   **`FACULTY`**: Classroom management and attendance marking.
*   **`STUDENT`**: Read-only access to personal academic and financial data.

---

## 3. Module-by-Module Technical Deep Dive

### 3.1 Auth Module (`/api/auth`)
| Endpoint | Method | Description | Access Roles |
| :--- | :--- | :--- | :--- |
| `/login` | `POST` | Validates credentials, returns JWT & user profile. | Public |
| `/impersonate` | `POST` | Generates token for target user. | `SUPER_ADMIN` |

### 3.2 Academic Module (`/api/academic`)
| Endpoint | Method | Description | Access Roles |
| :--- | :--- | :--- | :--- |
| `/academic-years` | `POST` | Create new operational year. | `SUPER_ADMIN`, `UNIVERSITY_ADMIN`, `REGISTRAR` |
| `/academic-years` | `GET` | List all years. | `STUDENT`, `FACULTY`, `HOD`, `REGISTRAR`, `ADMIN` |
| `/departments` | `POST` | Create new department. | `SUPER_ADMIN`, `UNIVERSITY_ADMIN`, `REGISTRAR` |
| `/programs` | `POST` | Create degree program (e.g., B.Tech). | `UNIVERSITY_ADMIN`, `REGISTRAR`, `HOD` |
| `/courses` | `POST` | Define new course. | `UNIVERSITY_ADMIN`, `HOD`, `FACULTY` |
| `/courses/:id/assign-faculty` | `PATCH` | Link faculty user to course. | `HOD`, `COORDINATOR`, `ADMIN` |

### 3.3 Student Module (`/api/students`)
| Endpoint | Method | Description | Access Roles |
| :--- | :--- | :--- | :--- |
| `/` | `POST` | Initialize student profile for a User. | `REGISTRAR`, `UNIVERSITY_ADMIN` |
| `/` | `GET` | List students (paged). | `REGISTRAR`, `UNIVERSITY_ADMIN`, `HOD` |
| `/:id/enrollment` | `PATCH` | Update semester/batch/courses. | `REGISTRAR`, `UNIVERSITY_ADMIN` |

### 3.4 Fee Module (`/api/fees`)
| Endpoint | Method | Description | Access Roles |
| :--- | :--- | :--- | :--- |
| `/` | `POST` | Create fee structure (template). | `ACCOUNTANT`, `UNIVERSITY_ADMIN` |
| `/structures` | `GET` | List templates. | `ACCOUNTANT`, `REGISTRAR`, `ADMIN` |
| `/assign` | `POST` | Assign fee to specific student. | `ACCOUNTANT`, `UNIVERSITY_ADMIN` |
| `/payment` | `POST` | Record payment transaction. | `ACCOUNTANT`, `STUDENT` (if stripe/gateway) |
| `/student/:id` | `GET` | View student dues/history. | `ACCOUNTANT`, `STUDENT` |

### 3.5 Attendance Module (`/api/attendance`)
| Endpoint | Method | Description | Access Roles |
| :--- | :--- | :--- | :--- |
| `/` | `POST` | Mark attendance for a class. | `FACULTY`, `HOD`, `ADMIN` |
| `/bulk` | `POST` | Mark attendance for an entire list. | `FACULTY`, `HOD`, `ADMIN` |
| `/student/:id` | `GET` | View student percentage stats. | `STUDENT`, `FACULTY`, `HOD` |
| `/course/:id/summary` | `GET` | View class-wide summary. | `FACULTY`, `HOD`, `REGISTRAR` |

### 3.6 Timetable Module (`/api/timetable`)
| Endpoint | Method | Description | Access Roles |
| :--- | :--- | :--- | :--- |
| `/` | `POST` | Create timetable header. | `UNIVERSITY_ADMIN`, `REGISTRAR`, `HOD` |
| `/:id/slots` | `POST` | Add class slot (day/time/instructor/room). | `REGISTRAR`, `HOD`, `ADMIN` |
| `/student/:id` | `GET` | Fetch personal schedule. | `STUDENT`, `FACULTY`, `HOD`, `ADMIN` |
| `/instructor/:id`| `GET` | Fetch faculty work schedule. | `FACULTY`, `HOD`, `REGISTRAR` |

### 3.7 Resource Modules (Library, Hostel, Transport)
| Endpoint | Method | Module | Access Roles |
| :--- | :--- | :--- | :--- |
| `/library/books` | `POST` | Library | `LIBRARIAN`, `ADMIN` |
| `/library/issue` | `POST` | Library | `LIBRARIAN` |
| `/hostel/rooms` | `POST` | Hostel | `WARDEN`, `ADMIN` |
| `/hostel/allocate`| `POST` | Hostel | `WARDEN`, `ADMIN` |
| `/transport/routes`| `POST` | Transport | `TRANSPORT_MANAGER`, `ADMIN` |
| `/transport/enroll`| `POST` | Transport | `STUDENT` |

### 3.8 Placement Module (`/api/placement`)
| Endpoint | Method | Description | Access Roles |
| :--- | :--- | :--- | :--- |
| `/jobs` | `POST` | Create job posting. | `PLACEMENT_OFFICER`, `ADMIN` |
| `/apply` | `POST` | Student job application. | `STUDENT` |
| `/applications/:id/status` | `PATCH` | Shortlist/Reject application. | `PLACEMENT_OFFICER`, `ADMIN` |

### 3.9 Exam Module (`/api/exams`)
| Endpoint | Method | Description | Access Roles |
| :--- | :--- | :--- | :--- |
| `/` | `POST` | Schedule new exam. | `EXAM_CONTROLLER`, `ADMIN`, `FACULTY` |
| `/:id/marks` | `POST` | Upload student results. | `FACULTY`, `EXAM_CONTROLLER` |
| `/student/:id/results` | `GET` | View grade card. | `STUDENT`, `FACULTY`, `ADMIN` |

### 3.10 AI Module (`/api/ai`)
| Endpoint | Method | Description | Access Roles |
| :--- | :--- | :--- | :--- |
| `/chat` | `POST` | Context-aware AI assistant. | Any Logged In User |

---

## 4. Operational Logic & Data Flow

### 4.1 The Onboarding Pipeline
1.  `SUPER_ADMIN` creates a **University**.
2.  `SUPER_ADMIN` creates a **UNIVERSITY_ADMIN** user linked to that university.
3.  `UNIVERSITY_ADMIN` sets up **Academic Years**, **Departments**, and **Programs**.
4.  Staff/Faculty accounts are created under specified **Roles**.

### 4.2 The Student Lifecycle
1.  **Identity**: A User account is created (Role: STUDENT).
2.  **Profile**: A `StudentProfile` is initialized, linking the User to a specific `universityId`.
3.  **Academic Context**: The student is assigned to a Program and Academic Year.
4.  **Enrolling**: Courses are assigned to the student.
5.  **Operation**: The student can now see their **Timetable**, pick **Transport** routes, and view **Fee** structures assigned to their program.

### 4.3 Security & Interceptors
- **`AuditInterceptor`**: Automatically logs Every write operation (POST/PATCH/DELETE) into the `AuditLog` collection, capturing the user, the module, and the time.
- **`TransformInterceptor`**: Cleans outgoing JSON responses (e.g., removing `password` fields or sensitive internal keys).
- **`ValidationPipe`**: Strictly enforces that no unknown fields are sent to the API, preventing accidental data pollution.

---
_Blueprint documentation finalized as of March 30, 2026._


# EduCore ERP — Complete System Blueprint & Skeleton
### Version 1.0 · April 2026 · "Building permit" document

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Multi-Tenancy Model](#4-multi-tenancy-model)
5. [Role-Based Access Control](#5-role-based-access-control)
6. [Backend — All Modules & API Endpoints](#6-backend--all-modules--api-endpoints)
7. [Database Schema — All Collections](#7-database-schema--all-collections)
8. [Frontend — All Pages & Routes](#8-frontend--all-pages--routes)
9. [Data Flow Diagrams](#9-data-flow-diagrams)
10. [Security Architecture](#10-security-architecture)
11. [Build Status — What Is Built](#11-build-status--what-is-built)
12. [Gap Analysis — What Is Missing](#12-gap-analysis--what-is-missing)
13. [Priority Roadmap to Release](#13-priority-roadmap-to-release)

---

## 1. System Overview

**EduCore ERP** is a multi-tenant, cloud-ready, role-based University Enterprise Resource Planning system. A single deployment serves multiple universities simultaneously, with strict data isolation between tenants.

**Core design principles:**

- Security-first: every endpoint is guarded by authentication + role check + university isolation.
- Multi-tenant SaaS: one codebase, many universities, zero data bleed.
- Audit everything: every write is automatically logged to the AuditLog collection.
- Lean role hierarchy: 16 distinct roles covering the full university org chart.

---

## 2. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend framework** | Next.js (App Router) | 15+ |
| **Frontend language** | TypeScript | 5+ |
| **UI components** | shadcn/ui | Latest |
| **Styling** | Tailwind CSS | v4 |
| **HTTP client** | Axios | Latest |
| **Backend framework** | NestJS | 10+ |
| **Backend language** | TypeScript | 5+ |
| **Database** | MongoDB | 7+ |
| **ORM** | Mongoose | 8+ |
| **Authentication** | Passport.js + JWT | Latest |
| **Password hashing** | bcrypt | Latest |
| **Runtime** | Node.js | 18+ |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│   Next.js 15 · App Router · Tailwind v4 · shadcn/ui · Axios │
│   Browser  ←→  Mobile (responsive)                          │
└─────────────────────────┬────────────────────────────────────┘
                          │  HTTPS · JWT Bearer Token
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                   API GATEWAY                                │
│   NestJS · Port 5001 · CORS configured · Helmet headers     │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│           MIDDLEWARE & CROSS-CUTTING CONCERNS                │
│  JwtAuthGuard → RolesGuard → UniversityIsolationGuard       │
│  ValidationPipe · AuditInterceptor · TransformInterceptor   │
└─────┬────────────────────────────────────────────────────────┘
      │
      ├── Auth module (/api/auth)
      ├── University module (/api/universities)
      ├── User module (/api/users)
      ├── Academic module (/api/academic)
      ├── Student module (/api/students)
      ├── Attendance module (/api/attendance)
      ├── Timetable module (/api/timetable)
      ├── Exam module (/api/exams)
      ├── Fee module (/api/fees)
      ├── Library module (/api/library)
      ├── Hostel module (/api/hostel)
      ├── Placement module (/api/placement)
      ├── Transport module (/api/transport)  ← NOT YET BUILT
      └── AI module (/api/ai)               ← NOT YET BUILT
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│   MongoDB (localhost:27017 / Atlas)                         │
│   Mongoose schemas · universityId-scoped queries            │
│   AuditLog collection · Compound indexes                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Multi-Tenancy Model

Every primary collection contains a `universityId` field (ObjectId reference to the University document).

**Isolation enforcement flow:**

```
Request arrives
    │
    ▼
JwtAuthGuard extracts user from JWT
    │
    ▼
user.universityId is loaded into request context
    │
    ▼
UniversityIsolationGuard checks:
  if user.role === SUPER_ADMIN → allow all universities
  else → block any param/body that references a different universityId
    │
    ▼
Service layer: every DB query appends { universityId: currentUser.universityId }
```

This means a UNIVERSITY_ADMIN from "SRM University" can never see or modify data from "VIT University" — even if they know the other university's ObjectIds.

---

## 5. Role-Based Access Control

### 5.1 Role Enum (16 roles)

```typescript
enum Role {
  // Platform
  SUPER_ADMIN = 'SUPER_ADMIN',

  // University leadership
  UNIVERSITY_ADMIN = 'UNIVERSITY_ADMIN',
  REGISTRAR = 'REGISTRAR',
  HOD = 'HOD',
  FINANCE = 'FINANCE',
  ACCOUNTANT = 'ACCOUNTANT',

  // Operational
  ACADEMIC_COORDINATOR = 'ACADEMIC_COORDINATOR',
  EXAM_CONTROLLER = 'EXAM_CONTROLLER',
  LIBRARIAN = 'LIBRARIAN',
  HOSTEL_WARDEN = 'HOSTEL_WARDEN',
  PLACEMENT_OFFICER = 'PLACEMENT_OFFICER',
  PLACEMENT_CELL = 'PLACEMENT_CELL',
  TRANSPORT_MANAGER = 'TRANSPORT_MANAGER',

  // End users
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
}
```

### 5.2 Guard Decorator Usage

```typescript
@Roles(Role.HOD, Role.REGISTRAR, Role.UNIVERSITY_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('/courses')
findAll(@CurrentUser() user: UserDocument) { ... }
```

---

## 6. Backend — All Modules & API Endpoints

### 6.1 Auth Module — `/api/auth`

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/login` | Validate credentials → return JWT + profile | Public |
| POST | `/impersonate` | Generate token for any user | SUPER_ADMIN |
| POST | `/refresh` | Refresh JWT (planned) | Authenticated |
| POST | `/logout` | Invalidate token (planned) | Authenticated |
| POST | `/forgot-password` | Send reset email (planned) | Public |
| POST | `/reset-password` | Apply new password (planned) | Public |

---

### 6.2 University Module — `/api/universities`

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create new university (onboard tenant) | SUPER_ADMIN |
| GET | `/` | List all universities | SUPER_ADMIN |
| GET | `/:id` | Get university details | SUPER_ADMIN, UNIVERSITY_ADMIN |
| PATCH | `/:id` | Update university profile | SUPER_ADMIN, UNIVERSITY_ADMIN |
| DELETE | `/:id` | Deactivate university | SUPER_ADMIN |

---

### 6.3 User Module — `/api/users`

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create user (any role) | SUPER_ADMIN, UNIVERSITY_ADMIN |
| GET | `/` | List users (paged, filterable) | UNIVERSITY_ADMIN, REGISTRAR, HOD |
| GET | `/:id` | Get user profile | Any (own) / Admin |
| PATCH | `/:id` | Update user | UNIVERSITY_ADMIN |
| PATCH | `/:id/role` | Change user role | SUPER_ADMIN, UNIVERSITY_ADMIN |
| PATCH | `/:id/activate` | Activate/deactivate user | UNIVERSITY_ADMIN |
| DELETE | `/:id` | Delete user | SUPER_ADMIN |

---

### 6.4 Academic Module — `/api/academic`

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/academic-years` | Create academic year | SUPER_ADMIN, UNIVERSITY_ADMIN, REGISTRAR |
| GET | `/academic-years` | List academic years | All authenticated |
| POST | `/departments` | Create department | SUPER_ADMIN, UNIVERSITY_ADMIN, REGISTRAR |
| GET | `/departments` | List departments | All authenticated |
| PATCH | `/departments/:id` | Update department | UNIVERSITY_ADMIN, REGISTRAR |
| POST | `/programs` | Create degree program | UNIVERSITY_ADMIN, REGISTRAR, HOD |
| GET | `/programs` | List programs | All authenticated |
| PATCH | `/programs/:id` | Update program | UNIVERSITY_ADMIN, REGISTRAR |
| POST | `/courses` | Create course | UNIVERSITY_ADMIN, HOD, FACULTY |
| GET | `/courses` | List courses | All authenticated |
| PATCH | `/courses/:id` | Update course | UNIVERSITY_ADMIN, HOD |
| PATCH | `/courses/:id/assign-faculty` | Assign faculty to course | HOD, ACADEMIC_COORDINATOR, UNIVERSITY_ADMIN |
| DELETE | `/courses/:id` | Delete course | UNIVERSITY_ADMIN, HOD |

---

### 6.5 Student Module — `/api/students`

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create student profile | REGISTRAR, UNIVERSITY_ADMIN |
| GET | `/` | List students (paged) | REGISTRAR, UNIVERSITY_ADMIN, HOD |
| GET | `/:id` | Get student profile | REGISTRAR, UNIVERSITY_ADMIN, HOD, STUDENT (own) |
| PATCH | `/:id/enrollment` | Update semester, batch, courses | REGISTRAR, UNIVERSITY_ADMIN |
| PATCH | `/:id` | Update student profile fields | REGISTRAR, UNIVERSITY_ADMIN |
| GET | `/:id/transcript` | Generate academic transcript (planned) | REGISTRAR, STUDENT (own) |

---

### 6.6 Attendance Module — `/api/attendance`

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Mark attendance for single student | FACULTY, HOD, UNIVERSITY_ADMIN |
| POST | `/bulk` | Mark attendance for entire class list | FACULTY, HOD, UNIVERSITY_ADMIN |
| GET | `/student/:id` | Get student attendance percentage & stats | STUDENT, FACULTY, HOD |
| GET | `/course/:id/summary` | Class-wide attendance summary | FACULTY, HOD, REGISTRAR |
| GET | `/course/:id/date/:date` | Attendance for a specific class date | FACULTY, HOD |
| PATCH | `/:id` | Correct a marked attendance record | HOD, UNIVERSITY_ADMIN |

---

### 6.7 Timetable Module — `/api/timetable`

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create timetable header (program + year) | UNIVERSITY_ADMIN, REGISTRAR, HOD |
| GET | `/` | List timetables | All authenticated |
| POST | `/:id/slots` | Add class slot (day/time/instructor/room) | REGISTRAR, HOD, UNIVERSITY_ADMIN |
| PATCH | `/:id/slots/:slotId` | Edit slot | REGISTRAR, HOD |
| DELETE | `/:id/slots/:slotId` | Remove slot | REGISTRAR, HOD |
| GET | `/student/:id` | Fetch student's personal schedule | STUDENT, FACULTY, HOD |
| GET | `/instructor/:id` | Fetch faculty's teaching schedule | FACULTY, HOD, REGISTRAR |
| GET | `/room/:room` | Get room occupancy view (planned) | REGISTRAR, HOD |

---

### 6.8 Exam Module — `/api/exams`

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Schedule new exam | EXAM_CONTROLLER, UNIVERSITY_ADMIN, FACULTY |
| GET | `/` | List exams | All authenticated |
| PATCH | `/:id` | Update exam details | EXAM_CONTROLLER, UNIVERSITY_ADMIN |
| DELETE | `/:id` | Cancel exam | EXAM_CONTROLLER, UNIVERSITY_ADMIN |
| POST | `/:id/marks` | Upload/enter student results | FACULTY, EXAM_CONTROLLER |
| PATCH | `/:id/marks/:resultId` | Correct a result | EXAM_CONTROLLER, UNIVERSITY_ADMIN |
| GET | `/student/:id/results` | View student grade card | STUDENT (own), FACULTY, UNIVERSITY_ADMIN |
| GET | `/course/:id/results` | View course-wide results | FACULTY, EXAM_CONTROLLER, HOD |

---

### 6.9 Fee Module — `/api/fees`

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create fee structure template | ACCOUNTANT, UNIVERSITY_ADMIN |
| GET | `/structures` | List fee structure templates | ACCOUNTANT, REGISTRAR, UNIVERSITY_ADMIN |
| GET | `/structures/:id` | Get fee structure detail | ACCOUNTANT, REGISTRAR |
| PATCH | `/structures/:id` | Update fee structure | ACCOUNTANT, UNIVERSITY_ADMIN |
| POST | `/assign` | Assign fee structure to student | ACCOUNTANT, UNIVERSITY_ADMIN |
| GET | `/student/:id` | View student's dues and payment history | ACCOUNTANT, STUDENT (own) |
| POST | `/payment` | Record payment (cash/bank/gateway) | ACCOUNTANT, STUDENT (via gateway) |
| GET | `/payment/:id/receipt` | Download payment receipt (planned) | ACCOUNTANT, STUDENT |
| GET | `/reports/outstanding` | List all students with dues (planned) | ACCOUNTANT, UNIVERSITY_ADMIN |

---

### 6.10 Library Module — `/api/library`

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/books` | Add book to inventory | LIBRARIAN, UNIVERSITY_ADMIN |
| GET | `/books` | List books (searchable) | All authenticated |
| GET | `/books/:id` | Get book detail + availability | All authenticated |
| PATCH | `/books/:id` | Update book details | LIBRARIAN, UNIVERSITY_ADMIN |
| DELETE | `/books/:id` | Remove book | LIBRARIAN, UNIVERSITY_ADMIN |
| POST | `/issue` | Issue book to member | LIBRARIAN |
| POST | `/return` | Process book return | LIBRARIAN |
| GET | `/member/:id/history` | Member's issue/return history | LIBRARIAN, STUDENT (own) |
| GET | `/overdue` | List all overdue books | LIBRARIAN, UNIVERSITY_ADMIN |

---

### 6.11 Hostel Module — `/api/hostel`

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/rooms` | Add hostel room | HOSTEL_WARDEN, UNIVERSITY_ADMIN |
| GET | `/rooms` | List rooms + occupancy | HOSTEL_WARDEN, UNIVERSITY_ADMIN |
| GET | `/rooms/:id` | Get room detail | HOSTEL_WARDEN |
| PATCH | `/rooms/:id` | Update room details | HOSTEL_WARDEN, UNIVERSITY_ADMIN |
| POST | `/allocate` | Allocate room to student | HOSTEL_WARDEN, UNIVERSITY_ADMIN |
| POST | `/vacate` | Vacate student from room | HOSTEL_WARDEN, UNIVERSITY_ADMIN |
| GET | `/residents` | List all current residents | HOSTEL_WARDEN, UNIVERSITY_ADMIN |
| GET | `/student/:id` | Get student's hostel allocation | HOSTEL_WARDEN, STUDENT (own) |

---

### 6.12 Placement Module — `/api/placement`

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/jobs` | Create job posting | PLACEMENT_OFFICER, UNIVERSITY_ADMIN |
| GET | `/jobs` | List active job postings | All authenticated |
| GET | `/jobs/:id` | Get job detail | All authenticated |
| PATCH | `/jobs/:id` | Update/close job | PLACEMENT_OFFICER, UNIVERSITY_ADMIN |
| POST | `/apply` | Student submits job application | STUDENT |
| GET | `/applications` | List all applications for a job | PLACEMENT_OFFICER, UNIVERSITY_ADMIN |
| GET | `/applications/my` | Student's own applications | STUDENT |
| PATCH | `/applications/:id/status` | Shortlist / Reject / Select applicant | PLACEMENT_OFFICER, UNIVERSITY_ADMIN |
| GET | `/reports/placements` | Placement statistics (planned) | PLACEMENT_OFFICER, UNIVERSITY_ADMIN |

---

### 6.13 Transport Module — `/api/transport` ⚠ NOT BUILT

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/routes` | Create transport route | TRANSPORT_MANAGER, UNIVERSITY_ADMIN |
| GET | `/routes` | List all routes | All authenticated |
| GET | `/routes/:id` | Get route detail + stops | All authenticated |
| PATCH | `/routes/:id` | Update route | TRANSPORT_MANAGER, UNIVERSITY_ADMIN |
| POST | `/vehicles` | Add vehicle to fleet | TRANSPORT_MANAGER, UNIVERSITY_ADMIN |
| GET | `/vehicles` | List fleet | TRANSPORT_MANAGER, UNIVERSITY_ADMIN |
| POST | `/enroll` | Student enrolls in a route | STUDENT |
| DELETE | `/enroll/:id` | Student un-enrolls | STUDENT |
| GET | `/student/:id` | Get student's transport allocation | TRANSPORT_MANAGER, STUDENT (own) |

---

### 6.14 AI Module — `/api/ai` ⚠ NOT BUILT

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/chat` | Context-aware AI assistant query | Any authenticated user |
| GET | `/chat/history` | Get conversation history | Any authenticated user |
| DELETE | `/chat/history` | Clear history | Any authenticated user |

---

## 7. Database Schema — All Collections

### 7.1 universities
```typescript
{
  _id: ObjectId,
  name: string,           // "SRM University"
  domain: string,         // "srm.edu.in"
  logo: string,           // URL
  address: string,
  phone: string,
  email: string,
  status: enum['ACTIVE', 'INACTIVE', 'SUSPENDED'],
  subscriptionPlan: enum['BASIC', 'STANDARD', 'ENTERPRISE'],
  createdAt: Date,
  updatedAt: Date
}
```

### 7.2 users
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,   // ← TENANT ANCHOR
  firstName: string,
  lastName: string,
  email: string,            // unique
  password: string,         // bcrypt hashed
  role: Role,               // 16-value enum
  phone: string,
  avatar: string,           // URL
  isActive: boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { universityId: 1 }, { email: 1 } unique, { universityId: 1, role: 1 }
```

### 7.3 departments
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  name: string,             // "Computer Science"
  code: string,             // "CSE"
  hodId: ObjectId,          // ref: users
  description: string,
  createdAt: Date
}
// Index: { universityId: 1 }
```

### 7.4 academic_years
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  label: string,            // "2024-2025"
  startDate: Date,
  endDate: Date,
  isCurrent: boolean,
  createdAt: Date
}
```

### 7.5 programs
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  departmentId: ObjectId,
  name: string,             // "B.Tech Computer Science"
  code: string,             // "BTECH-CS"
  degree: string,           // "Bachelor"
  durationYears: number,    // 4
  totalSemesters: number,   // 8
  createdAt: Date
}
```

### 7.6 courses
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  programId: ObjectId,
  departmentId: ObjectId,
  title: string,            // "Data Structures"
  code: string,             // "CS301"
  credits: number,          // 4
  semester: number,         // 3
  facultyId: ObjectId,      // assigned faculty
  isElective: boolean,
  createdAt: Date
}
```

### 7.7 student_profiles
```typescript
{
  _id: ObjectId,
  userId: ObjectId,         // ref: users (1:1)
  universityId: ObjectId,
  programId: ObjectId,
  academicYearId: ObjectId,
  departmentId: ObjectId,
  rollNumber: string,       // unique per university
  batch: string,            // "2022-2026"
  semester: number,         // current semester
  enrolledCourses: ObjectId[], // ref: courses
  status: enum['ACTIVE', 'INACTIVE', 'GRADUATED', 'DROPPED'],
  admissionDate: Date,
  guardianName: string,
  guardianPhone: string,
  address: string,
  createdAt: Date
}
// Index: { universityId: 1 }, { rollNumber: 1, universityId: 1 } unique
```

### 7.8 attendances
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  studentId: ObjectId,      // ref: student_profiles
  courseId: ObjectId,
  date: Date,
  status: enum['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
  markedById: ObjectId,     // ref: users (faculty who marked)
  remarks: string,
  createdAt: Date
}
// Index: { universityId: 1, courseId: 1, date: 1 }, { studentId: 1, courseId: 1 }
```

### 7.9 timetables
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  programId: ObjectId,
  academicYearId: ObjectId,
  semester: number,
  label: string,            // "Odd Semester 2024"
  slots: [TimetableSlot]    // embedded sub-documents
}

TimetableSlot {
  _id: ObjectId,
  day: enum['MON','TUE','WED','THU','FRI','SAT'],
  startTime: string,        // "09:00"
  endTime: string,          // "10:00"
  courseId: ObjectId,
  instructorId: ObjectId,
  room: string,             // "Lab-4A"
  type: enum['LECTURE', 'LAB', 'TUTORIAL']
}
```

### 7.10 exams
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  courseId: ObjectId,
  academicYearId: ObjectId,
  title: string,            // "Mid Semester Exam"
  type: enum['MIDTERM', 'FINAL', 'QUIZ', 'INTERNAL', 'PRACTICAL'],
  scheduledAt: Date,
  durationMinutes: number,
  totalMarks: number,
  passingMarks: number,
  room: string,
  createdAt: Date
}
```

### 7.11 exam_results
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  examId: ObjectId,
  studentId: ObjectId,      // ref: student_profiles
  marksObtained: number,
  grade: string,            // "A", "B+", etc.
  status: enum['PASS', 'FAIL', 'ABSENT', 'WITHHELD'],
  remarks: string,
  publishedAt: Date,
  createdAt: Date
}
// Index: { examId: 1, studentId: 1 } unique
```

### 7.12 fee_structures
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  name: string,             // "B.Tech Year 1 Fees"
  programId: ObjectId,
  academicYearId: ObjectId,
  components: [{
    label: string,          // "Tuition Fee"
    amount: number,
    isOptional: boolean
  }],
  totalAmount: number,
  dueDate: Date,
  createdAt: Date
}
```

### 7.13 fee_assignments
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  studentId: ObjectId,
  feeStructureId: ObjectId,
  amountDue: number,
  amountPaid: number,
  balance: number,          // computed
  status: enum['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED'],
  dueDate: Date,
  createdAt: Date
}
```

### 7.14 payments
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  feeAssignmentId: ObjectId,
  studentId: ObjectId,
  amount: number,
  method: enum['CASH', 'BANK_TRANSFER', 'ONLINE', 'DD', 'CHEQUE'],
  transactionId: string,
  receiptNumber: string,
  paidAt: Date,
  recordedById: ObjectId,   // staff who recorded
  createdAt: Date
}
```

### 7.15 books (Library)
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  title: string,
  author: string,
  isbn: string,
  publisher: string,
  year: number,
  category: string,
  totalCopies: number,
  availableCopies: number,
  location: string,         // "Rack B-4"
  coverImage: string,       // URL
  createdAt: Date
}
```

### 7.16 book_issues
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  bookId: ObjectId,
  memberId: ObjectId,       // ref: users
  issuedAt: Date,
  dueDate: Date,
  returnedAt: Date,
  status: enum['ISSUED', 'RETURNED', 'OVERDUE', 'LOST'],
  fine: number,
  createdAt: Date
}
```

### 7.17 hostel_rooms
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  roomNumber: string,
  block: string,            // "Block A"
  floor: number,
  type: enum['SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY'],
  capacity: number,
  amenities: string[],
  rent: number,             // per month
  status: enum['AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE'],
  createdAt: Date
}
```

### 7.18 hostel_allocations
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  roomId: ObjectId,
  studentId: ObjectId,
  checkInDate: Date,
  checkOutDate: Date,
  status: enum['ACTIVE', 'VACATED'],
  createdAt: Date
}
```

### 7.19 jobs (Placement)
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  companyName: string,
  jobTitle: string,
  description: string,
  requirements: string[],
  packageLPA: number,
  jobType: enum['FULLTIME', 'INTERNSHIP', 'CONTRACT'],
  location: string,
  applicationDeadline: Date,
  status: enum['OPEN', 'CLOSED', 'ON_HOLD'],
  postedById: ObjectId,
  createdAt: Date
}
```

### 7.20 job_applications
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  jobId: ObjectId,
  studentId: ObjectId,
  resumeUrl: string,
  coverLetter: string,
  status: enum['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'],
  appliedAt: Date,
  updatedAt: Date
}
```

### 7.21 transport_routes ⚠ NOT BUILT
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  routeName: string,        // "Route 4 - Kurnool City"
  stops: [{
    name: string,
    order: number,
    estimatedTime: string
  }],
  vehicleId: ObjectId,
  driverId: string,
  driverPhone: string,
  fareMonthly: number,
  status: enum['ACTIVE', 'INACTIVE'],
  createdAt: Date
}
```

### 7.22 transport_enrollments ⚠ NOT BUILT
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  studentId: ObjectId,
  routeId: ObjectId,
  boardingStop: string,
  enrolledAt: Date,
  status: enum['ACTIVE', 'CANCELLED']
}
```

### 7.23 audit_logs
```typescript
{
  _id: ObjectId,
  universityId: ObjectId,
  userId: ObjectId,         // who performed the action
  module: string,           // "FeeModule"
  action: string,           // "CREATE_PAYMENT"
  method: string,           // "POST"
  endpoint: string,         // "/api/fees/payment"
  payload: object,          // sanitized request body
  ipAddress: string,
  userAgent: string,
  createdAt: Date
}
// Index: { universityId: 1, createdAt: -1 }, { userId: 1 }
```

---

## 8. Frontend — All Pages & Routes

### 8.1 Public Routes (No auth required)

| Route | Component | Description |
|---|---|---|
| `/login` | `LoginPage` | Email + password form, JWT stored in cookie |
| `/forgot-password` ⚠ | `ForgotPasswordPage` | Email submission for reset link |
| `/reset-password` ⚠ | `ResetPasswordPage` | Token from URL + new password |

### 8.2 Role-Based Dashboards (Post-login redirect)

| Route | Visible To | Key Widgets |
|---|---|---|
| `/dashboard` (SUPER_ADMIN) | SUPER_ADMIN | University count, active tenants, global audit, health |
| `/dashboard` (UNIVERSITY_ADMIN) | UNIVERSITY_ADMIN | Total students, staff, fee collection, attendance rate |
| `/dashboard` (REGISTRAR/HOD) | Staff roles | Department stats, pending enrollments, timetable view |
| `/dashboard` (FACULTY) | FACULTY | Today's classes, attendance summary, pending mark uploads |
| `/dashboard` (STUDENT) | STUDENT | Timetable, attendance %, fee balance, exam results |

### 8.3 Academic Pages

| Route | Description | Access |
|---|---|---|
| `/academic/years` | Academic year list + create | REGISTRAR, UNIVERSITY_ADMIN |
| `/academic/departments` | Department list + create/edit | REGISTRAR, UNIVERSITY_ADMIN, HOD |
| `/academic/programs` | Program list + create/edit | REGISTRAR, UNIVERSITY_ADMIN, HOD |
| `/academic/programs/:id/courses` | Courses under a program | HOD, FACULTY |
| `/academic/courses/:id/assign-faculty` | Assign faculty dialog | HOD |

### 8.4 Student Pages

| Route | Description | Access |
|---|---|---|
| `/students` | Paginated student list | REGISTRAR, UNIVERSITY_ADMIN, HOD |
| `/students/new` | Create student profile | REGISTRAR, UNIVERSITY_ADMIN |
| `/students/:id` | Student profile detail | REGISTRAR, HOD, STUDENT (own) |
| `/students/:id/enrollment` | Edit enrollment details | REGISTRAR, UNIVERSITY_ADMIN |
| `/students/:id/transcript` ⚠ | Academic transcript PDF view | REGISTRAR, STUDENT (own) |

### 8.5 Attendance Pages

| Route | Description | Access |
|---|---|---|
| `/attendance` | Attendance dashboard | FACULTY, HOD |
| `/attendance/mark` | Mark attendance form + bulk | FACULTY, HOD |
| `/attendance/reports` | Attendance % reports per course | HOD, REGISTRAR |
| `/attendance/student/:id` | Student's individual stats | STUDENT, FACULTY |

### 8.6 Timetable Pages

| Route | Description | Access |
|---|---|---|
| `/timetable` | View timetable (role-filtered) | All authenticated |
| `/timetable/manage` | Create/edit timetable + slots | REGISTRAR, HOD |
| `/timetable/room-view` ⚠ | Room occupancy matrix | REGISTRAR, HOD |

### 8.7 Exam Pages

| Route | Description | Access |
|---|---|---|
| `/exams` | Exam list | All authenticated |
| `/exams/new` | Schedule new exam | EXAM_CONTROLLER, FACULTY |
| `/exams/:id` | Exam detail | All authenticated |
| `/exams/:id/marks` | Upload / enter marks | FACULTY, EXAM_CONTROLLER |
| `/exams/results` | My results (student) | STUDENT |

### 8.8 Fee Pages

| Route | Description | Access |
|---|---|---|
| `/fees/structures` | Fee structure list | ACCOUNTANT, REGISTRAR |
| `/fees/structures/new` | Create fee structure | ACCOUNTANT, UNIVERSITY_ADMIN |
| `/fees/assign` | Assign fee to student | ACCOUNTANT |
| `/fees/student/:id` | Student fee ledger + history | ACCOUNTANT, STUDENT (own) |
| `/fees/payment/new` | Record payment | ACCOUNTANT |
| `/fees/reports` ⚠ | Outstanding fees report | ACCOUNTANT, UNIVERSITY_ADMIN |

### 8.9 Library Pages

| Route | Description | Access |
|---|---|---|
| `/library/books` | Book catalog | All authenticated |
| `/library/books/new` | Add book | LIBRARIAN |
| `/library/books/:id` | Book detail + availability | All authenticated |
| `/library/issue` | Issue book form | LIBRARIAN |
| `/library/return` | Process return | LIBRARIAN |
| `/library/overdue` | Overdue report | LIBRARIAN |

### 8.10 Hostel Pages

| Route | Description | Access |
|---|---|---|
| `/hostel/rooms` | Room list + occupancy | HOSTEL_WARDEN, UNIVERSITY_ADMIN |
| `/hostel/rooms/new` | Add room | HOSTEL_WARDEN |
| `/hostel/allocate` | Allocate student to room | HOSTEL_WARDEN |
| `/hostel/residents` | Current residents list | HOSTEL_WARDEN |

### 8.11 Placement Pages

| Route | Description | Access |
|---|---|---|
| `/placement/jobs` | Job listings | All authenticated |
| `/placement/jobs/new` | Post job | PLACEMENT_OFFICER |
| `/placement/jobs/:id` | Job detail + apply button | All authenticated |
| `/placement/applications` | All applications (officer view) | PLACEMENT_OFFICER |
| `/placement/my-applications` | My applications (student) | STUDENT |

### 8.12 Transport Pages ⚠ NOT BUILT

| Route | Description | Access |
|---|---|---|
| `/transport/routes` | Route list | All authenticated |
| `/transport/routes/new` | Create route | TRANSPORT_MANAGER |
| `/transport/routes/:id` | Route detail + stops | All authenticated |
| `/transport/enroll` | Student enroll in route | STUDENT |
| `/transport/fleet` | Vehicle management | TRANSPORT_MANAGER |

### 8.13 Admin & System Pages

| Route | Description | Access | Status |
|---|---|---|---|
| `/users` | All users list | UNIVERSITY_ADMIN, SUPER_ADMIN | Built |
| `/users/new` | Create user | UNIVERSITY_ADMIN | Built |
| `/universities` | All universities | SUPER_ADMIN | Built |
| `/audit-logs` | Audit log viewer | SUPER_ADMIN, UNIVERSITY_ADMIN | ⚠ Missing |
| `/notifications` | Notification center | All authenticated | ⚠ Missing |
| `/reports/analytics` | Analytics dashboard | Admin roles | ⚠ Missing |
| `/settings/profile` | Own profile | All authenticated | Built |
| `/settings/university` | University settings | UNIVERSITY_ADMIN | Built |
| `/ai-chat` | AI assistant | All authenticated | ⚠ Missing |

---

## 9. Data Flow Diagrams

### 9.1 Student Lifecycle (Onboarding → Operation)

```
SUPER_ADMIN creates University tenant
         │
         ▼
SUPER_ADMIN creates UNIVERSITY_ADMIN user
         │
         ▼
UNIVERSITY_ADMIN sets up:
  - Academic Year  (POST /api/academic/academic-years)
  - Departments    (POST /api/academic/departments)
  - Programs       (POST /api/academic/programs)
  - Courses        (POST /api/academic/courses)
         │
REGISTRAR ▼
  Creates STUDENT User    (POST /api/users)
         │
         ▼
  Creates Student Profile (POST /api/students)
         │ links userId + universityId + programId + academicYearId
         ▼
  Assigns Enrollment      (PATCH /api/students/:id/enrollment)
         │ semester, batch, enrolledCourses[]
         ▼
ACCOUNTANT assigns Fee    (POST /api/fees/assign)
         │
         ▼
STUDENT can now:
  - View timetable        (GET /api/timetable/student/:id)
  - View attendance       (GET /api/attendance/student/:id)
  - View exam results     (GET /api/exams/student/:id/results)
  - Pay fees online       (POST /api/fees/payment)
  - Apply for jobs        (POST /api/placement/apply)
  - Enroll transport      (POST /api/transport/enroll)
```

### 9.2 Authentication Flow

```
User submits email + password
         │
         ▼
POST /api/auth/login
         │
         ▼
UserService.findByEmail() → user document
         │
         ▼
bcrypt.compare(password, user.password)
  FAIL → 401 Unauthorized
  PASS ↓
         ▼
JwtService.sign({ sub: userId, role, universityId })
         │  expires in 24h
         ▼
Response: { access_token, user: { id, email, role, universityId } }
         │
         ▼
Frontend stores token in httpOnly cookie / localStorage
         │
         ▼
Subsequent requests: Authorization: Bearer <token>
         │
         ▼
JwtAuthGuard validates → RolesGuard checks → UniversityIsolationGuard checks
```

### 9.3 Attendance Marking Flow

```
FACULTY opens Attendance page
         │
         ▼
GET /api/timetable/instructor/:id → today's classes
         │
         ▼
FACULTY selects course + date
         │
         ▼
GET /api/students?programId=&semester= → student list
         │
         ▼
FACULTY marks PRESENT/ABSENT per student
         │
         ▼
POST /api/attendance/bulk
  body: { courseId, date, records: [{ studentId, status }] }
         │
         ▼
AuditInterceptor logs: { userId, module: "Attendance", action: "BULK_MARK" }
         │
         ▼
200 OK → frontend shows success toast
```

---

## 10. Security Architecture

### 10.1 Guard Pipeline (every request)

```
[Request]
    → JwtAuthGuard         (validates JWT signature + expiry)
    → RolesGuard           (@Roles decorator check)
    → UniversityIsolationGuard (universityId isolation)
    → ValidationPipe        (DTO schema validation)
    → Controller method
    → AuditInterceptor      (logs write operations)
    → TransformInterceptor  (strips sensitive fields)
    → [Response]
```

### 10.2 Password Security

- Passwords hashed with bcrypt, cost factor 12.
- Raw passwords never stored, never logged, stripped by TransformInterceptor on all outgoing responses.

### 10.3 JWT Configuration

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '24h' }
})
```

Payload: `{ sub: userId, role: Role, universityId: ObjectId, iat: number, exp: number }`

### 10.4 Missing Security Controls (needed before production)

- Rate limiting (throttle guard, e.g. `@Throttle(100, 60)`)
- Refresh token rotation
- Password reset via email token (timed, one-use)
- IP allowlist for SUPER_ADMIN
- HTTPS-only enforcement
- CSP headers
- MongoDB connection string in environment (not hardcoded)

---

## 11. Build Status — What Is Built

### Backend ✅ (12/14 modules)

| Module | Status | Notes |
|---|---|---|
| Auth | ✅ Built | Login + impersonate |
| University | ✅ Built | Full CRUD |
| User | ✅ Built | All 16 roles supported |
| Academic | ✅ Built | Years, Departments, Programs, Courses, Faculty assign |
| Student | ✅ Built | Profiles + Enrollment |
| Attendance | ✅ Built | Mark, bulk, stats, summary |
| Timetable | ✅ Built | Header + Slots CRUD |
| Exam | ✅ Built | Schedule + Marks + Results |
| Fee | ✅ Built | Structures + Assign + Payments |
| Library | ✅ Built | Books + Issue + Return |
| Hostel | ✅ Built | Rooms + Allocation |
| Placement | ✅ Built | Jobs + Apply + Status |
| Transport | ❌ Missing | Routes, vehicles, enrollment |
| AI Chat | ❌ Missing | /api/ai/chat endpoint |

### Infrastructure ✅

- NestJS project structure with all guards, interceptors, pipes
- JWT + Passport authentication
- UniversityIsolationGuard multi-tenancy
- AuditInterceptor auto-logging
- TransformInterceptor (strips passwords)
- ValidationPipe DTO enforcement
- DB Seeder (SUPER_ADMIN bootstrap, env-gated)

### Frontend ✅ (12/14 module UIs built)

- Next.js 15 App Router structure
- shadcn/ui component library integrated
- Tailwind CSS v4 configured
- Axios with JWT interceptors
- Role-based dashboard layouts
- All 12 built module pages

---

## 12. Gap Analysis — What Is Missing

### Priority 1 — Blocking for any real use

| What | Where | Why it blocks |
|---|---|---|
| Password reset flow (forgot + email + reset) | Backend + Frontend | Users locked out permanently if password forgotten |
| Rate limiting / throttle guard | Backend | Open to brute force and DoS |
| HTTPS enforcement | Infrastructure | Credentials sent in plaintext |
| Environment variable validation (Joi schema) | Backend | App crashes silently with bad config |
| Transport module (backend + frontend) | Both | Blueprint module completely absent |

### Priority 2 — Required for production launch

| What | Where | Why it matters |
|---|---|---|
| Swagger / OpenAPI documentation | Backend | Frontend team and integrators have no API reference |
| Email service (Nodemailer / SendGrid) | Backend | Password resets, fee reminders, placement alerts |
| File upload (S3 or local) | Backend | Student photos, placement resumes, fee receipts |
| Stripe / Razorpay payment gateway | Backend | Online fee collection is incomplete |
| Audit log viewer UI | Frontend | Admins can't see the logs that are being collected |
| Notification system (in-app) | Backend + Frontend | No way to alert users of events |
| PDF receipt / report generation | Backend | Fee receipts, exam results, transcripts |
| AI Chat module (/api/ai/chat) | Backend + Frontend | Blueprint lists this, completely absent |

### Priority 3 — Quality & maintainability

| What | Where | Notes |
|---|---|---|
| Unit tests (Jest) | Backend | Zero test coverage right now |
| E2E tests (Playwright/Cypress) | Frontend | No test suite exists |
| Docker + docker-compose | Infrastructure | No containerization for deployment |
| GitHub Actions CI/CD | Infrastructure | No automated build/test/deploy |
| MongoDB compound indexes | Backend | Queries unoptimized at scale |
| Logging (Winston / Pino) | Backend | No structured application logs |
| Error monitoring (Sentry) | Both | No crash reporting |
| Mobile-responsive polish | Frontend | Some tables/forms break on mobile |
| Dark mode toggle | Frontend | Tailwind dark classes present but no toggle UI |
| Student transcript PDF | Backend | Important academic deliverable |

---

## 13. Priority Roadmap to Release

### Sprint 1 — Security hardening (Week 1–2)

1. Add `@nestjs/throttler` rate limiting globally
2. Add forgot-password flow: email token endpoint + frontend pages
3. Add Joi / `@hapi/joi` env validation on startup
4. Move all secrets to `.env` + document in `.env.example`
5. Add `helmet()` and CORS strict origin

### Sprint 2 — Missing modules (Week 2–3)

1. Build Transport backend module (routes, vehicles, enrollments)
2. Build Transport frontend pages
3. Build AI Chat backend module (integrate OpenAI / Anthropic SDK)
4. Build AI Chat frontend page (chat UI with history)

### Sprint 3 — Production features (Week 3–4)

1. Email service (Nodemailer + template)
2. File upload (multer + S3/local, for avatars + resumes)
3. Payment gateway integration (Razorpay for INR)
4. PDF generation (puppeteer or pdfkit) for receipts, transcripts
5. Notification system (in-app bell + email)

### Sprint 4 — Admin tooling (Week 4–5)

1. Audit log viewer frontend (filterable table)
2. Analytics dashboard (attendance %, fee collection chart, placement stats)
3. Swagger UI enabled at `/api/docs`
4. Report export (CSV/PDF)

### Sprint 5 — Quality & DevOps (Week 5–6)

1. Docker + docker-compose (mongo + backend + frontend)
2. GitHub Actions: lint → test → build → deploy
3. Jest unit tests for all service layers
4. MongoDB compound index review and optimization
5. Sentry error monitoring integration
6. Winston structured logging

---

*Blueprint authored: April 2026 · EduCore ERP v1.0*
*Based on GitHub repository: github.com/Abhi-0888/ERP-SYSTEM*