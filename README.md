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
```bash
cd backend
npm run seed
```

## 🔐 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Super Admin |      | admin123 |
| University Admin | uniadmin | admin123 |
| Faculty | faculty1 | admin123 |
| Student | student1 | admin123 |

## 📖 Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Quick Start Guide](./QUICKSTART.md)

## 📝 License

MIT
