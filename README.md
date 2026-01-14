# EduCore University ERP System

A complete multi-tenant University ERP system built with modern technologies.

## 🏗️ Project Structure

```
ERP_System/
├── backend/                  # NestJS backend
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/           # Guards, decorators, enums
│   │   └── modules/          # Feature modules (12 total)
│   ├── package.json
│   ├── nest-cli.json
│   └── tsconfig.json
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # shadcn/ui components
│   │   └── lib/              # Utilities & auth
│   ├── package.json
│   └── next.config.ts
├── README.md
├── API_DOCUMENTATION.md
└── QUICKSTART.md
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | NestJS + TypeScript |
| **Database** | MongoDB + Mongoose |
| **Frontend** | Next.js 15 + TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui |
| **Authentication** | JWT + Passport |

## 📊 Modules (12 Total)

1. **Auth** - JWT authentication & RBAC
2. **University** - Multi-tenant management
3. **User** - User management (12 roles)
4. **Academic** - Departments, Programs, Courses
5. **Student** - Enrollment & profiles
6. **Attendance** - Daily tracking
7. **Timetable** - Class scheduling
8. **Exam** - Exams & results
9. **Fee** - Fee management
10. **Library** - Book management
11. **Hostel** - Room allocation
12. **Placement** - Job portal

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running on localhost:27017

### Backend Setup
```bash
cd backend
npm install
npm run start:dev
```
Backend runs on: http://localhost:5001

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:3000

### Seed Database
Seeding is disabled by default. See the **Super Admin and Credentials** section below for secure instructions.

## 🔐 Super Admin and Credentials

This repository does not ship with working fake credentials for production safety. Seeding is disabled by default to avoid inserting test or fake users into real databases.

If you need to create a Super Admin for a development environment, enable seeding explicitly and supply real credentials via environment variables. Example (Unix/macOS):

```bash
cd backend
ENABLE_SEED=true SEED_SUPERADMIN=true \
SEED_SUPERADMIN_USERNAME=superadmin \
SEED_SUPERADMIN_EMAIL=admin@yourdomain.com \
SEED_SUPERADMIN_PASSWORD='Your$trongP@ss' npm run seed
```

On Windows PowerShell (single-line example):

```powershell
$env:ENABLE_SEED='true'; $env:SEED_SUPERADMIN='true'; $env:SEED_SUPERADMIN_USERNAME='superadmin'; $env:SEED_SUPERADMIN_EMAIL='admin@yourdomain.com'; $env:SEED_SUPERADMIN_PASSWORD='Your$trongP@ss'; npm run seed
```

Note: Only run seeding against development or isolated databases. For production, create Super Admin accounts via a secure provisioning workflow or direct DB migration with approved secrets management.

## 📖 Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Quick Start Guide](./QUICKSTART.md)

## 📝 License

MIT
