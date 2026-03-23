import api from '../api';
import { Exam, ApiResponse } from '../types';

export interface MarkSheet {
    _id?: string;
    studentId: any;
    examId: any;
    marksObtained: number;
    grade: string;
    comments?: string;
    recordedBy: any;
}

export const ExamService = {
    getExams: async (params?: Record<string, string | number | boolean>): Promise<{ exams: Exam[], total: number }> => {
        const response = await api.get('/exams', { params });
        return response.data;
    },

    getExamById: async (id: string): Promise<Exam> => {
        const response = await api.get(`/exams/${id}`);
        return response.data;
    },

    createExam: async (data: Partial<Exam>): Promise<Exam> => {
        const response = await api.post('/exams', data);
        return response.data;
    },

    updateExam: async (id: string, data: Partial<Exam>): Promise<Exam> => {
        const response = await api.patch(`/exams/${id}`, data);
        return response.data;
    },

    deleteExam: async (id: string): Promise<void> => {
        await api.delete(`/exams/${id}`);
    },

    getMarksByStudent: async (studentId: string): Promise<ApiResponse<MarkSheet[]>> => {
        const response = await api.get(`/exams/student/${studentId}/results`);
        return response.data;
    },

    recordMarks: async (examId: string, data: Partial<MarkSheet>): Promise<MarkSheet> => {
        const response = await api.post(`/exams/${examId}/marks`, data);
        return response.data;
    }
};
