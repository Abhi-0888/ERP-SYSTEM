import api from '../api';

export interface Exam {
    _id?: string;
    id?: string;
    name: string;
    courseId: any;
    academicYearId: any;
    type: string;
    date: string;
    startTime: string;
    durationMinutes: number;
    room: string;
    maxMarks: number;
    status: string;
}

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
    getExams: async (params?: any): Promise<{ exams: Exam[], total: number }> => {
        const response = await api.get('/exams', { params });
        return response.data;
    },

    getExamById: async (id: string): Promise<Exam> => {
        const response = await api.get(`/exams/${id}`);
        return response.data;
    },

    createExam: async (data: any) => {
        const response = await api.post('/exams', data);
        return response.data;
    },

    updateExam: async (id: string, data: any) => {
        const response = await api.patch(`/exams/${id}`, data);
        return response.data;
    },

    getMarksByStudent: async (studentId: string): Promise<MarkSheet[]> => {
        const response = await api.get(`/exams/student/${studentId}/results`);
        return response.data;
    },

    recordMarks: async (examId: string, data: any) => {
        const response = await api.post(`/exams/${examId}/marks`, data);
        return response.data;
    }
};
