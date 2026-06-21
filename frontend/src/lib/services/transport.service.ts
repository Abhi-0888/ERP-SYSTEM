import api from '../api';

export interface Vehicle {
    _id?: string;
    id?: string;
    registrationNumber: string;
    model?: string;
    type: string;
    capacity: number;
    status: string;
    health?: string;
    driverId?: string;
}

export interface Route {
    _id?: string;
    id?: string;
    name: string;
    startPoint: string;
    endPoint: string;
    stops: string[];
    vehicleId?: string;
    isActive?: boolean;
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
    },

    getStudentRoute: async (): Promise<any> => {
        const response = await api.get('/transport/my-route');
        return response.data;
    },

    applyForTransport: async (data: { routeId: string; pickupPoint: string }): Promise<any> => {
        const response = await api.post('/transport/enroll', data);
        return response.data;
    }
};
