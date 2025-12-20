import api from '../api';

export const PlacementService = {
    getAllJobs: async (params?: any) => {
        const response = await api.get('/placement', { params });
        return response.data;
    },
    getJobById: async (id: string) => {
        const response = await api.get(`/placement/${id}`);
        return response.data;
    },
    createJob: async (data: any) => {
        const response = await api.post('/placement', data);
        return response.data;
    },
    updateJob: async (id: string, data: any) => {
        const response = await api.patch(`/placement/${id}`, data);
        return response.data;
    },
    deleteJob: async (id: string) => {
        const response = await api.delete(`/placement/${id}`);
        return response.data;
    },
    applyForJob: async (data: any) => {
        const response = await api.post('/placement/apply', data);
        return response.data;
    },
    getStudentApplications: async (studentId: string) => {
        const response = await api.get(`/placement/student/${studentId}`);
        return response.data;
    },
    getApplicationById: async (id: string) => {
        const response = await api.get(`/placement/applications/${id}`);
        return response.data;
    },
    updateApplicationStatus: async (id: string, status: string) => {
        const response = await api.patch(`/placement/applications/${id}/status`, { status });
        return response.data;
    },
    getStats: async (params?: any) => {
        const response = await api.get('/placement/reports/summary', { params });
        return response.data;
    }
};
