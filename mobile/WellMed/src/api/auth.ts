import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const register = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/register`, null, { params: { email, password } });
    return response.data;
};

export const login = async (email: string, password: string) => {
    email = email.toLowerCase();
    const response = await axios.post(`${API_URL}/login`, null, { params: { email, password } });
    return response.data;
};

