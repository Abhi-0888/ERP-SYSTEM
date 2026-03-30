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
