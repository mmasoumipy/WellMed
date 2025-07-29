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
  birthday?: string;
  specialty?: string;
  created_at: string;
}

export const register = async (userData: RegisterData): Promise<RegisterResponse> => {
  try {
    console.log('Registering user with data:', userData);
    
    // Format the request payload to match your backend UserCreate schema
    const payload = {
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      name: userData.name.trim(),
      birthday: userData.birthday || null,
      specialty: userData.specialty?.trim() || null,
      created_at: new Date().toISOString(),
    };

    console.log('Sending registration payload:', { ...payload, password: '[HIDDEN]' });

    const response = await api.post('/users/register', payload);
    
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error response:', error?.response?.data);
    
    // Handle different types of errors
    if (error.response?.status === 400 && error.response?.data?.detail === "Email already registered") {
      throw new Error('This email is already registered. Please try logging in instead.');
    } else if (error.response?.status === 422) {
      // Validation error
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        // Handle Pydantic validation errors
        const errorMessages = detail.map((err: any) => 
          `${err.loc?.join(' ')}: ${err.msg}`
        ).join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      } else {
        throw new Error(detail || 'Invalid data provided');
      }
    } else if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error('Registration failed. Please try again.');
    }
  }
};

// New function to register and auto-login
export const registerAndLogin = async (userData: RegisterData): Promise<LoginResponse> => {
  try {
    // First, register the user
    await register(userData);
    
    // Then automatically log them in
    const loginResponse = await login(userData.email, userData.password);
    
    return loginResponse;
  } catch (error: any) {
    // If registration fails, throw that error
    // If login fails after successful registration, throw login error
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('Logging in with email:', email);
    
    // Create FormData for the login endpoint
    const formData = new FormData();
    formData.append('username', email.toLowerCase().trim()); // FastAPI OAuth2 expects 'username'
    formData.append('password', password);

    const response = await api.post('/users/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Login response:', response.data);

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