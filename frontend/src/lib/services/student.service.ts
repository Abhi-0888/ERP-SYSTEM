import api from '../api';

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    registrationNumber: string;
    programId: any; // Populated or ID
    academicYearId: any; // Populated or ID
    status: string;
    dateOfBirth: string;
    enrollmentDate: string;
    // ... add other fields as needed
}

export interface StudentStats {
    total: number;
    active: number;
    graduated: number;
    suspended: number;
}

export const StudentService = {
    // Get all students with optional filters
    getAll: async (params?: any) => {
        const response = await api.get('/students', { params });
        return response.data;
    },

    // Get student by ID
    getById: async (id: string) => {
        const response = await api.get(`/students/${id}`);
        return response.data;
    },

    // Create new student
    create: async (data: any) => {
        const response = await api.post('/students', data);
        return response.data;
    },

    // Update student
    update: async (id: string, data: any) => {
        const response = await api.patch(`/students/${id}`, data);
        return response.data;
    },

    // Delete student
    delete: async (id: string) => {
        const response = await api.delete(`/students/${id}`);
        return response.data;
    },

    // Get student stats (mock or real if endpoint exists)
    // We can aggregate this from the list or use a specific report endpoint
    getStats: async () => {
        // This endpoint was seen in controller: GET /students/reports/summary
        const response = await api.get('/students/reports/summary');
        return response.data;
    }
};
