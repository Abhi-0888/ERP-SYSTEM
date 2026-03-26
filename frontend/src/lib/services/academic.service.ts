import api from '../api';
import { Department, Program, Course, AcademicYear, ApiResponse } from '../types';

export const AcademicService = {
    // --- Departments ---
    getDepartments: async (params?: Record<string, string | number | boolean>): Promise<ApiResponse<Department[]>> => {
        const response = await api.get('/academic/departments', { params });
        return response.data;
    },
    createDepartment: async (data: Partial<Department>): Promise<Department> => {
        const response = await api.post('/academic/departments', data);
        return response.data;
    },
    updateDepartment: async (id: string, data: Partial<Department>): Promise<Department> => {
        const response = await api.patch(`/academic/departments/${id}`, data);
        return response.data;
    },
    deleteDepartment: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/academic/departments/${id}`);
        return response.data;
    },

    // --- Programs ---
    getPrograms: async (params?: Record<string, string | number | boolean>): Promise<ApiResponse<Program[]>> => {
        const response = await api.get('/academic/programs', { params });
        return response.data;
    },
    createProgram: async (data: Partial<Program>): Promise<Program> => {
        const response = await api.post('/academic/programs', data);
        return response.data;
    },
    updateProgram: async (id: string, data: Partial<Program>): Promise<Program> => {
        const response = await api.patch(`/academic/programs/${id}`, data);
        return response.data;
    },
    deleteProgram: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/academic/programs/${id}`);
        return response.data;
    },

    // --- Courses (Subjects) ---
    getCourses: async (params?: Record<string, string | number | boolean>): Promise<ApiResponse<Course[]>> => {
        const response = await api.get('/academic/courses', { params });
        return response.data;
    },
    createCourse: async (data: Partial<Course>): Promise<Course> => {
        const response = await api.post('/academic/courses', data);
        return response.data;
    },
    updateCourse: async (id: string, data: Partial<Course>): Promise<Course> => {
        const response = await api.patch(`/academic/courses/${id}`, data);
        return response.data;
    },
    deleteCourse: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/academic/courses/${id}`);
        return response.data;
    },

    // --- Academic Years ---
    getAcademicYears: async (params?: Record<string, string | number | boolean>): Promise<ApiResponse<AcademicYear[]>> => {
        const response = await api.get('/academic/academic-years', { params });
        return response.data;
    },
    getActiveAcademicYear: async (): Promise<AcademicYear> => {
        const response = await api.get('/academic/academic-years/active');
        return response.data;
    },
    createAcademicYear: async (data: Partial<AcademicYear>): Promise<AcademicYear> => {
        const response = await api.post('/academic/academic-years', data);
        return response.data;
    },
    updateAcademicYear: async (id: string, data: Partial<AcademicYear>): Promise<AcademicYear> => {
        const response = await api.patch(`/academic/academic-years/${id}`, data);
        return response.data;
    },
    deleteAcademicYear: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/academic/academic-years/${id}`);
        return response.data;
    },

    assignFaculty: async (courseId: string, facultyId: string): Promise<Course> => {
        const response = await api.patch(`/academic/courses/${courseId}/assign-faculty`, { facultyId });
        return response.data;
    }
};
