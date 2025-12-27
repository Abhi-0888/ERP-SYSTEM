import api from "../api";

export const TransportService = {
    getAllVehicles: () => api.get("/transport/vehicles"),
    createVehicle: (data: any) => api.get("/transport/vehicles", data),
    updateVehicle: (id: string, data: any) => api.patch(`/transport/vehicles/${id}`, data),
    deleteVehicle: (id: string) => api.delete(`/transport/vehicles/${id}`),

    getAllRoutes: () => api.get("/transport/routes"),
    createRoute: (data: any) => api.post("/transport/routes", data),
    updateRoute: (id: string, data: any) => api.patch(`/transport/routes/${id}`, data),
    deleteRoute: (id: string) => api.delete(`/transport/routes/${id}`),
};
