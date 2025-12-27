import api from "../api";

export const StatsService = {
    getGlobalStats: () => api.get("/stats/global"),
    getModuleStats: () => api.get("/stats/modules"),
};
