import api from '../api';

export type LeaveType = 'CASUAL' | 'MEDICAL' | 'EARNED' | 'MATERNITY' | 'PATERNITY' | 'STUDY' | 'SICK' | 'OTHER';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Leave {
    _id: string;
    userId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: LeaveStatus;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    isHalfDay?: boolean;
    halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
    isEmergency: boolean;
}

export interface CreateLeaveDto {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
    isHalfDay?: boolean;
    halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
}

export const LeaveService = {
    getAll: async (params?: Record<string, string | number | boolean>) => {
        const response = await api.get('/leaves', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/leaves/${id}`);
        return response.data;
    },

    getByUser: async (userId: string) => {
        const response = await api.get(`/leaves/user/${userId}`);
        return response.data;
    },

    create: async (data: CreateLeaveDto) => {
        const response = await api.post('/leaves', data);
        return response.data;
    },

    approve: async (id: string, remarks?: string) => {
        const response = await api.patch(`/leaves/${id}/approve`, { remarks });
        return response.data;
    },

    reject: async (id: string, reason: string) => {
        const response = await api.patch(`/leaves/${id}/reject`, { reason });
        return response.data;
    },

    cancel: async (id: string) => {
        const response = await api.patch(`/leaves/${id}/cancel`);
        return response.data;
    },

    getPending: async () => {
        const response = await api.get('/leaves/pending');
        return response.data;
    },

    getBalance: async (userId: string, year?: number) => {
        const response = await api.get(`/leaves/user/${userId}/balance`, { params: { year } });
        return response.data;
    },

    getStats: async (month?: number, year?: number) => {
        const response = await api.get('/leaves/stats', { params: { month, year } });
        return response.data;
    }
};
