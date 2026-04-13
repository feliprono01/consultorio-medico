import api from './axios';

export const consultaService = {
    getAll: () =>
        api.get('/consultas'),

    getById: (id) =>
        api.get(`/consultas/${id}`),

    getByPaciente: (pacienteId) =>
        api.get(`/consultas/paciente/${pacienteId}`),

    getUltimaByPaciente: (pacienteId) =>
        api.get(`/consultas/paciente/${pacienteId}/ultima`),

    create: (data) =>
        api.post('/consultas', data),

    update: (id, data) =>
        api.put(`/consultas/${id}`, data),

    delete: (id) =>
        api.delete(`/consultas/${id}`),
};
