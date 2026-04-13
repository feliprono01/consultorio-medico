import api from './axios';

export const pacienteService = {
    getAll: () =>
        api.get('/pacientes'),

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
