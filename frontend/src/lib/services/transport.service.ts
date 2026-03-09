import api from '../api';

export interface Vehicle {
    _id?: string;
    id?: string;
    plateNumber: string;
    model: string;
    type: string;
    capacity: number;
    status: string;
    driverName?: string;
    driverPhone?: string;
}

export interface Route {
    _id?: string;
    id?: string;
    name: string;
    source: string;
    destination: string;
    stops: { name: string; time: string }[];
    fare: number;
    isActive: boolean;
}

export const TransportService = {
    getVehicles: async (): Promise<Vehicle[]> => {
        const response = await api.get('/transport/vehicles');
        return response.data;
    },

    getRoutes: async (): Promise<Route[]> => {
        const response = await api.get('/transport/routes');
        return response.data;
    },

    createVehicle: async (data: any) => {
        const response = await api.post('/transport/vehicles', data);
        return response.data;
    },

    createRoute: async (data: any) => {
        const response = await api.post('/transport/routes', data);
        return response.data;
    }
};
