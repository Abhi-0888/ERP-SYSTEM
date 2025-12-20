import api from '../api';

export interface University {
    _id: string;
    name: string;
    code: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    status: string;
    subscriptionPlan: string;
    createdAt: string;
}

export const UniversityService = {
    getAll: async () => {
        const response = await api.get('/universities');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/universities/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/universities', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/universities/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/universities/${id}`);
        return response.data;
    }
};
