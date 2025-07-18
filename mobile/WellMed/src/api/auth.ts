// import axios from 'axios';
// import api from './api';

// const API_URL = 'http://127.0.0.1:8080';

// export const register = async (email: string, password: string) => {
//     const response = await api.post('/users/register', null, { params: { email, password } });
//     return response.data;
// };

// // export const login = async (email: string, password: string) => {
// //     email = email.toLowerCase();
// //     const response = await axios.post(`${API_URL}/login`, null, { params: { email, password } });
// //     return response.data;
// // };

// export const login = async (email: string, password: string) => {
//     const formData = new FormData();
//     formData.append('username', email);
//     formData.append('password', password);
  
//     const response = await api.post('/users/login', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
  
//     return response.data;
//   };
// // export async function login(email: string, password: string) {
// //     email = email.toLowerCase();

// //     console.log('Logging in with email:', email);
// //     console.log('Logging in with password:', password ? '******' : 'No password provided');
// //     const response = await api.post('/users/login', { email, password });
// //     if (response.status !== 200) {
// //         console.error('Login failed:', response.data);
// //         throw new Error(`Login failed resean: ${response.data.detail || 'Unknown error'}`);
// //     }
// //     return response.data;
// //   }




import api from './api';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  birthday?: string;
  specialty?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    specialty?: string;
    birthday?: string;
  };
}

interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  message: string;
}

export const register = async (userData: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await api.post('/users/register', {
      email: userData.email.toLowerCase(),
      password: userData.password,
      name: userData.name,
      birthday: userData.birthday || null,
      specialty: userData.specialty || null,
    });
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(
      error.response?.data?.detail || 
      'Registration failed. Please try again.'
    );
  }
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // Create FormData for the login endpoint
    const formData = new FormData();
    formData.append('username', email.toLowerCase()); // FastAPI OAuth2 expects 'username'
    formData.append('password', password);

    const response = await api.post('/users/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Validate response structure
    if (!response.data?.access_token) {
      throw new Error('Invalid response from server - missing access token');
    }

    if (!response.data?.user?.id) {
      throw new Error('Invalid response from server - missing user data');
    }

    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    } else if (error.response?.status === 404) {
      throw new Error('User not found. Please check your email or register.');
    } else if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error('Login failed. Please try again.');
    }
  }
};

export const logout = async (): Promise<void> => {
  // For now, just clear local storage
  // In the future, you might want to call a logout endpoint
  try {
    // Clear all auth-related data
    // This is handled by the api interceptor, but we can also do it explicitly
    console.log('Logging out user...');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const refreshToken = async (): Promise<string | null> => {
  // Implement token refresh logic if your backend supports it
  // For now, return null to indicate no refresh token support
  return null;
};