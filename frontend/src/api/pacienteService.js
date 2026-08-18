import api from './axios';

export const pacienteService = {
    getAll: () =>
        api.get('/pacientes'),

    getPage: ({ page = 0, size = 20, q } = {}) =>
        api.get('/pacientes/pagina', { params: { page, size, q } }),

    getById: (id) =>
        api.get(`/pacientes/${id}`),

    create: (data) =>
        api.post('/pacientes', data),

    update: (id, data) =>
        api.put(`/pacientes/${id}`, data),

    delete: (id) =>
        api.delete(`/pacientes/${id}`),

    updateHistoriaPsiquiatrica: (id, data) =>
        api.put(`/pacientes/${id}/historia-psiquiatrica`, data),
};
