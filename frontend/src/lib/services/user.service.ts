import api from '../api';

export interface User {
    id: string;
    _id?: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin?: string;
    universityId?: string;
    // Add other profile fields if your backend returns them spread or within a 'profile' key
}

export const UserService = {
    getAll: async (params?: any) => {
        const response = await api.get('/users', { params });
        return response.data;
    },

    getByRole: async (role: string, params?: any) => {
        const response = await api.get(`/users/role/${role}`, { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/users', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    }
};
