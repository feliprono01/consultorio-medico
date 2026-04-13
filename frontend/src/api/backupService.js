import api from './axios';

export const backupService = {
    getAll: () =>
        api.get('/backups'),

    create: () =>
        api.post('/backups'),

    download: (filename) =>
        api.get(`/backups/${filename}`, { responseType: 'blob' }),
};
