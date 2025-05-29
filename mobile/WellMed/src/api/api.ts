import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PUBLIC_API_BASE_URL } from '@env';

const api = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token added to request:', token);
  } else {
    console.log('No token found, request will not include Authorization header');
  }
  return config;
});

export default api;
