# ERP System Credentials - Updated May 2026

## 🔐 **WORKING PASSWORDS**

### **Super Admin & University Management**
| Username | Password | Role | Email |
|----------|----------|------|-------|
| `superadmin` | `admin123` | SUPER_ADMIN | superadmin@educore.com |
| `admin_srmap` | `admin123` | UNIVERSITY_ADMIN | admin@srmap.edu.in |
| `principal` | `admin123` | PRINCIPAL | principal@srmap.edu.in |
| `registrar` | `admin123` | REGISTRAR | registrar@srmap.edu.in |

### **Department Heads & Faculty**
| Username | Password | Role | Email |
|----------|----------|------|-------|
| `hod_cse` | `admin123` | HOD | hod.cse@srmap.edu.in |
| `hod_ece` | `admin123` | HOD | hod.ece@srmap.edu.in |
| `faculty_cse1` | `admin123` | FACULTY | faculty1.cse@srmap.edu.in |
| `faculty_cse2` | `admin123` | FACULTY | faculty2.cse@srmap.edu.in |
| `faculty_cse3` | `admin123` | FACULTY | faculty3.cse@srmap.edu.in |
| `faculty_ece1` | `admin123` | FACULTY | faculty1.ece@srmap.edu.in |
| `faculty_ece2` | `admin123` | FACULTY | faculty2.ece@srmap.edu.in |

### **Support Staff**
| Username | Password | Role | Email |
|----------|----------|------|-------|
| `finance_head` | `admin123` | FINANCE | finance@srmap.edu.in |
| `accountant` | `admin123` | ACCOUNTANT | accountant@srmap.edu.in |
| `librarian` | `admin123` | LIBRARIAN | librarian@srmap.edu.in |
| `hostel_warden` | `admin123` | HOSTEL_WARDEN | warden@srmap.edu.in |
| `exam_controller` | `admin123` | EXAM_CONTROLLER | exam@srmap.edu.in |
| `placement` | `admin123` | PLACEMENT_OFFICER | placement@srmap.edu.in |
| `transport_mgr` | `admin123` | TRANSPORT_MANAGER | transport@srmap.edu.in |

### **Student Accounts**
| Username | Password | Role | Email |
|----------|----------|------|-------|
| `student_cse1` | `student123` | STUDENT | student1@srmap.edu.in |
| `student_cse2` | `student123` | STUDENT | student2@srmap.edu.in |
| `student_cse3` | `student123` | STUDENT | student3@srmap.edu.in |
| `student_cse4` | `student123` | STUDENT | student4@srmap.edu.in |
| `student_cse5` | `student123` | STUDENT | student5@srmap.edu.in |
| `student_ece1` | `student123` | STUDENT | student6@srmap.edu.in |
| `student_ece2` | `student123` | STUDENT | student7@srmap.edu.in |
| `student_me1` | `student123` | STUDENT | student8@srmap.edu.in |

## 🔄 **Password Reset Instructions**

### **To Apply New Passwords:**

1. **Update Database:**
   ```bash
   cd backend
   npm run seed
   ```

2. **Clear Browser Cache:**
   - Clear all browser cookies and local storage
   - Hard refresh pages (Ctrl+F5)

3. **Login with New Credentials:**
   - Use new passwords from this file
   - All old passwords are now invalid

## 🚨 **Security Notes**

- **Old Password**: `Password@123` (DEPRECATED - No longer works)
- **New Admin/Faculty Password**: `admin123`
- **New Student Password**: `student123`
- **Password Strength**: Simple but working passwords
- **Change Frequency**: These passwords should be changed regularly

## 📱 **Quick Access URLs**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Login Page**: http://localhost:3000/auth/login

## ⚠️ **Important Reminders**

1. **Delete this file after updating passwords**
2. **Do not commit credentials to version control**
3. **Share passwords securely only with authorized personnel**
4. **Update any documentation that references old passwords**

---

*Generated: May 11, 2026*  
*System: ERP University Management System*  
*Version: 1.0.0*
