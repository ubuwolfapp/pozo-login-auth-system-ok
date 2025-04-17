
import axios from 'axios';

// Constantes
const API_URL = 'http://localhost:3001/api'; // Cambiar por la URL real en producción

// Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    rol: string;
  };
}

// Servicio de autenticación
export const authService = {
  // Método para iniciar sesión
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Usuario o contraseña incorrectos');
        } else if (error.response?.status === 400) {
          throw new Error('Datos inválidos. Verifique su correo electrónico');
        }
        throw new Error('Error de conexión. Intente más tarde');
      }
      throw new Error('Error desconocido');
    }
  },

  // Método para almacenar el token JWT
  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  },

  // Método para obtener el token JWT
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  // Método para eliminar el token JWT (logout)
  removeToken(): void {
    localStorage.removeItem('authToken');
  },

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Método para pedir la recuperación de contraseña
  async forgotPassword(email: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/forgot-password`, { email });
    } catch (error) {
      throw new Error('Error al enviar solicitud de recuperación');
    }
  }
};
