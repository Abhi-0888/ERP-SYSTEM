import { Role } from '../enums/role.enum';

export const ROLE_RANKS: Record<Role, number> = {
    [Role.SUPER_ADMIN]: 100,
    [Role.UNIVERSITY_ADMIN]: 80,
    [Role.REGISTRAR]: 70,
    [Role.FINANCE]: 70,
    [Role.EXAM_CONTROLLER]: 60,
    [Role.HOD]: 60,
    [Role.PLACEMENT_OFFICER]: 50,
    [Role.PLACEMENT_CELL]: 50,
    [Role.LIBRARIAN]: 50,
    [Role.HOSTEL_WARDEN]: 50,
    [Role.TRANSPORT_MANAGER]: 50,
    [Role.ACADEMIC_COORDINATOR]: 40,
    [Role.ACCOUNTANT]: 40,
    [Role.FACULTY]: 30,
    [Role.STUDENT]: 10,
};
