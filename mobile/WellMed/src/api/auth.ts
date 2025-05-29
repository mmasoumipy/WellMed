import axios from 'axios';
import api from './api';

const API_URL = 'http://127.0.0.1:8080';

export const register = async (email: string, password: string) => {
    const response = await api.post('/users/register', null, { params: { email, password } });
    return response.data;
};

// export const login = async (email: string, password: string) => {
//     email = email.toLowerCase();
//     const response = await axios.post(`${API_URL}/login`, null, { params: { email, password } });
//     return response.data;
// };

export const login = async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
  
    const response = await api.post('/users/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  
    return response.data;
  };
// export async function login(email: string, password: string) {
//     email = email.toLowerCase();

//     console.log('Logging in with email:', email);
//     console.log('Logging in with password:', password ? '******' : 'No password provided');
//     const response = await api.post('/users/login', { email, password });
//     if (response.status !== 200) {
//         console.error('Login failed:', response.data);
//         throw new Error(`Login failed resean: ${response.data.detail || 'Unknown error'}`);
//     }
//     return response.data;
//   }

