import api from './axios';

export const consultaService = {
    getAll: (params = {}) =>
        api.get('/consultas', { params }),

    getById: (id) =>
        api.get(`/consultas/${id}`),

    getByPaciente: (pacienteId) =>
        api.get(`/consultas/paciente/${pacienteId}`),

    getUltimaByPaciente: (pacienteId) =>
        api.get(`/consultas/paciente/${pacienteId}/ultima`),

    create: (data) =>
        api.post('/consultas', data),

    // Modelo append-only (Ley 26.657): "editar" una consulta ya no la
    // modifica en el lugar -- crea una version nueva que la corrige. La
    // fila original queda intacta para siempre. Ver docs/ROADMAP_CUMPLIMIENTO_LEGAL.md.
    corregir: (id, data) =>
        api.post(`/consultas/${id}/corregir`, data),

    getVersiones: (id) =>
        api.get(`/consultas/${id}/versiones`),

    delete: (id) =>
        api.delete(`/consultas/${id}`),

    getHistorial: (id) =>
        api.get(`/consultas/${id}/historial`),

    exportarAuditoria: (id) =>
        api.get(`/consultas/${id}/auditoria/exportar`, { responseType: 'blob' }),
};
