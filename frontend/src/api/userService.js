import api from './axios';

export const userService = {
    getAll: () =>
        api.get('/users'),

    create: (data) =>
        api.post('/users', data),

    delete: (id) =>
        api.delete(`/users/${id}`),

    resetPassword: (id, password) =>
        api.put(`/users/${id}/password`, { password }),
};
