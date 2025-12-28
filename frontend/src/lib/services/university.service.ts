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

    getSummary: async (id: string) => {
        const response = await api.get(`/universities/${id}/summary`);
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
    },

    assignAdmin: async (id: string, data: { adminEmail: string; adminUsername?: string; adminPassword: string }) => {
        const response = await api.post(`/universities/${id}/assign-admin`, data);
        return response.data;
    },

    upgradeLicense: async (id: string, data: { subscriptionPlan: string; subscriptionDetails?: Record<string, any> }) => {
        const response = await api.patch(`/universities/${id}/upgrade-license`, data);
        return response.data;
    },
};
