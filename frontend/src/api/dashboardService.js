import api from './axios';

export const dashboardService = {
    getStats: () =>
        api.get('/dashboard/stats'),
};
