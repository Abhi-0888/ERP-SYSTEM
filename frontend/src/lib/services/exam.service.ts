import api from '../api';

export const ExamService = {
    getExams: async (params?: any) => {
        const response = await api.get('/exams', { params });
        return response.data;
    },
    getExamById: async (id: string) => {
        const response = await api.get(`/exams/${id}`);
        return response.data;
    },
    getStudentResults: async (studentId: string, params?: any) => {
        const response = await api.get(`/exams/student/${studentId}/results`, { params });
        return response.data;
    },
    getExamStatistics: async (examId: string) => {
        const response = await api.get(`/exams/${examId}/statistics`);
        return response.data;
    },
    recordMarks: async (examId: string, data: any) => {
        const response = await api.post(`/exams/${examId}/marks`, data);
        return response.data;
    }
};
