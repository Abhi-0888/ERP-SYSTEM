import api from '../api';

export enum FeeType {
    TUITION = 'TUITION',
    HOSTEL = 'HOSTEL',
    LIBRARY = 'LIBRARY',
    ACTIVITY = 'ACTIVITY',
    TRANSPORT = 'TRANSPORT',
    EXAMINATION = 'EXAMINATION',
    OTHER = 'OTHER',
}

export enum FeeStatus {
    PENDING = 'PENDING',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    FULLY_PAID = 'FULLY_PAID',
    OVERDUE = 'OVERDUE',
    WAIVED = 'WAIVED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    CHEQUE = 'CHEQUE',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CARD = 'CARD',
    ONLINE = 'ONLINE',
}

export interface FeeStructure {
    _id: string;
    name: string;
    type: FeeType;
    amount: number;
    academicYearId: string;
    programId?: string;
    dueDate: string;
    lateFeePerDay?: number;
    description?: string;
    status: FeeStatus;
}

export interface FeeFilter {
    academicYearId?: string;
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export const FeeService = {
    // Fee Structure management
    getFeeStructures: async (filter: FeeFilter = {}): Promise<ApiResponse<FeeStructure[]>> => {
        const response = await api.get('/fees', { params: filter });
        return response.data;
    },

    getFeeStructure: async (id: string): Promise<FeeStructure> => {
        const response = await api.get(`/fees/${id}`);
        return response.data;
    },

    createFeeStructure: async (data: Partial<FeeStructure>): Promise<FeeStructure> => {
        const response = await api.post('/fees', data);
        return response.data;
    },

    updateFeeStructure: async (id: string, data: Partial<FeeStructure>): Promise<FeeStructure> => {
        const response = await api.patch(`/fees/${id}`, data);
        return response.data;
    },

    deleteFeeStructure: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/fees/${id}`);
        return response.data;
    },

    // Student Fee Assignment & Status
    assignFeeToStudent: async (data: { studentId: string; feeId: string; customAmount?: number; remarks?: string }): Promise<unknown> => {
        const response = await api.post('/fees/assign', data);
        return response.data;
    },

    getStudentFeeStatus: async (studentId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<unknown>> => {
        const response = await api.get(`/fees/student/${studentId}/status`, { params: { page, limit } });
        return response.data;
    },

    // Payment recording
    recordPayment: async (feeId: string, data: { amountPaid: number; paymentMethod: PaymentMethod; transactionId?: string; remarks?: string; paymentDate?: string }): Promise<unknown> => {
        const response = await api.post('/fees/payment', { feeId, ...data });
        return response.data;
    },

    recordStudentPayment: async (studentId: string, data: { feeId: string; amountPaid: number; paymentMethod: PaymentMethod; transactionId?: string; remarks?: string; paymentDate?: string }): Promise<unknown> => {
        const response = await api.post(`/fees/student/${studentId}/payment`, data);
        return response.data;
    },

    // Reports
    getFeeStats: async (): Promise<unknown> => {
        const response = await api.get('/fees/reports/stats');
        return response.data;
    }
};
