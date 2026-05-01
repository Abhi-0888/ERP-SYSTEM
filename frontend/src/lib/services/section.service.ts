import api from '../api';

export interface Section {
    _id: string;
    name: string;
    departmentId: string;
    programId: string;
    academicYearId: string;
    semester: number;
    batch: string;
    maxStrength: number;
    currentStrength: number;
    classAdvisorId?: string;
    students: string[];
    isActive: boolean;
}

export interface CreateSectionDto {
    name: string;
    departmentId: string;
    programId: string;
    academicYearId: string;
    semester: number;
    batch: string;
    maxStrength?: number;
    classAdvisorId?: string;
}

export const SectionService = {
    getAll: async (params?: Record<string, string | number | boolean>) => {
        const response = await api.get('/sections', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/sections/${id}`);
        return response.data;
    },

    create: async (data: CreateSectionDto) => {
        const response = await api.post('/sections', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateSectionDto>) => {
        const response = await api.patch(`/sections/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/sections/${id}`);
        return response.data;
    },

    addStudent: async (sectionId: string, studentId: string) => {
        const response = await api.post(`/sections/${sectionId}/students/${studentId}`);
        return response.data;
    },

    removeStudent: async (sectionId: string, studentId: string) => {
        const response = await api.delete(`/sections/${sectionId}/students/${studentId}`);
        return response.data;
    },

    assignAdvisor: async (sectionId: string, facultyId: string) => {
        const response = await api.post(`/sections/${sectionId}/advisor/${facultyId}`);
        return response.data;
    },

    getByFaculty: async (facultyId: string) => {
        const response = await api.get(`/sections/faculty/${facultyId}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/sections/stats');
        return response.data;
    }
};
