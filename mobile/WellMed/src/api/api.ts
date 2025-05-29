import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://localhost:8080',
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
