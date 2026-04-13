import api from './axios';

export const authService = {
    login: (username, password) =>
        api.post('/auth/login', { username, password }),
};
