import api from '../api';
import { Student, ApiResponse } from '../types';

export interface StudentStats {
    totalStudents: number;
    activeStudents: number;
    suspendedStudents: number;
    graduatedStudents: number;
}

export const StudentService = {
    // Get all students with optional filters
    getAll: async (params?: Record<string, string | number | boolean>): Promise<ApiResponse<Student[]>> => {
        const response = await api.get('/students', { params });
        return response.data;
    },

    // Get student by ID
    getById: async (id: string): Promise<Student> => {
        const response = await api.get(`/students/${id}`);
        return response.data;
    },

    // Create new student
    create: async (data: Partial<Student>): Promise<Student> => {
        const response = await api.post('/students', data);
        return response.data;
    },

    // Update student
    update: async (id: string, data: Partial<Student>): Promise<Student> => {
        const response = await api.patch(`/students/${id}`, data);
        return response.data;
    },

    // Delete student
    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/students/${id}`);
        return response.data;
    },

    // Get students by course enrollment
    getByCourse: async (courseId: string): Promise<Student[]> => {
        const response = await api.get(`/students/course/${courseId}`);
        return response.data;
    },

    // Get student stats
    getStats: async (): Promise<StudentStats> => {
        // This endpoint was seen in controller: GET /students/reports/summary
        const response = await api.get('/students/reports/summary');
        return response.data;
    },

    // Add this for enrollments page
    updateEnrollment: async (id: string, data: { courseIds: string[] }): Promise<Student> => {
        const response = await api.patch(`/students/${id}/enrollment`, data);
        return response.data;
    }
};
