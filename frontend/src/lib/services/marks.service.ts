import api from '../api';
import { MarkSheet, ApiResponse } from '../types';

export interface Mark {
    _id: string;
    studentId: any;
    examId: any;
    courseId: any;
    marksObtained: number;
    enteredBy: string;
    remarks?: string;
    createdAt: string;
    updatedAt: string;
}

export const MarksService = {
    getAll: async (params?: Record<string, string | number | boolean>): Promise<ApiResponse<Mark[]>> => {
        const response = await api.get('/marks', { params });
        return response.data;
    },

    getById: async (id: string): Promise<Mark> => {
        const response = await api.get(`/marks/${id}`);
        return response.data;
    },

    getByStudent: async (studentId: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<Mark[]>> => {
        const response = await api.get(`/marks/student/${studentId}`, { params });
        return response.data;
    },

    create: async (data: Partial<Mark>): Promise<Mark> => {
        const response = await api.post('/marks', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Mark>): Promise<Mark> => {
        const response = await api.patch(`/marks/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/marks/${id}`);
        return response.data;
    }
};
