import api from '../api';
import { User, ApiResponse } from '../types';

export const UserService = {
    getAll: async (params?: Record<string, string | number | boolean>): Promise<User[]> => {
        const response = await api.get('/users', { params });
        // Assuming /users returns User[] directly based on usage in users/page.tsx
        return response.data;
    },

    getByRole: async (role: string, params?: Record<string, string | number | boolean>): Promise<User[]> => {
        const response = await api.get(`/users/role/${role}`, { params });
        return response.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    create: async (data: Partial<User> & { password?: string }): Promise<User> => {
        const response = await api.post('/users', data);
        return response.data;
    },

    update: async (id: string, data: Partial<User>): Promise<User> => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    bulkImport: async (file: File): Promise<ApiResponse<unknown>> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/users/bulk-import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateStatus: async (id: string, status: string): Promise<User> => {
        const response = await api.patch(`/users/${id}/status`, { status });
        return response.data;
    },

    resetPassword: async (id: string): Promise<{ message: string }> => {
        const response = await api.patch(`/users/${id}/reset-password`);
        return response.data;
    }
};
