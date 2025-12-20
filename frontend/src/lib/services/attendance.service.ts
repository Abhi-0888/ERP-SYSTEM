import api from '../api';

export interface MarkAttendanceDto {
    studentId: string;
    courseId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'EXCUSED';
    date?: string;
    remarks?: string;
}

export interface AttendanceFilter {
    studentId?: string;
    courseId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export const AttendanceService = {
    markAttendance: async (dto: MarkAttendanceDto) => {
        const response = await api.post('/attendance', dto);
        return response.data;
    },

    markBulkAttendance: async (attendance: MarkAttendanceDto[]) => {
        const response = await api.post('/attendance/bulk', { attendance });
        return response.data;
    },

    getAttendance: async (filter: AttendanceFilter = {}) => {
        const params = new URLSearchParams();
        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined) params.append(key, value.toString());
        });
        const response = await api.get(`/attendance?${params.toString()}`);
        return response.data;
    },

    getStudentAttendance: async (studentId: string, courseId?: string) => {
        let url = `/attendance/student/${studentId}`;
        if (courseId) url += `?courseId=${courseId}`;
        const response = await api.get(url);
        return response.data;
    },

    getCourseSummary: async (courseId: string) => {
        const response = await api.get(`/attendance/course/${courseId}/summary`);
        return response.data;
    },

    updateAttendance: async (id: string, status: string, remarks?: string) => {
        const response = await api.patch(`/attendance/${id}`, { status, remarks });
        return response.data;
    },

    deleteAttendance: async (id: string) => {
        const response = await api.delete(`/attendance/${id}`);
        return response.data;
    },

    getReport: async (studentId?: string, startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (studentId) params.append('studentId', studentId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await api.get(`/attendance/reports/summary?${params.toString()}`);
        return response.data;
    }
};
