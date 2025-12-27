import api from '../api';

export const HostelService = {
    getHostels: async (params?: any) => {
        const response = await api.get('/hostel/hostels', { params });
        return response.data;
    },
    getRooms: async (params?: any) => {
        const response = await api.get('/hostel/rooms', { params });
        return response.data;
    },
    getAvailableRooms: async (hostelId: string) => {
        const response = await api.get(`/hostel/rooms/availability/${hostelId}`);
        return response.data;
    },
    allocateRoom: async (data: any) => {
        const response = await api.post('/hostel/allocate', data);
        return response.data;
    },
    deallocateRoom: async (roomId: string, studentId: string) => {
        const response = await api.post(`/hostel/deallocate/${roomId}/${studentId}`);
        return response.data;
    },
    getOccupancyReport: async (hostelId: string) => {
        const response = await api.get(`/hostel/reports/occupancy/${hostelId}`);
        return response.data;
    },
    getSummary: async () => {
        const response = await api.get('/hostel/reports/summary');
        return response.data;
    }
};
