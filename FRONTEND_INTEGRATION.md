# 🔌 Guia de Integração - Frontend

Exemplos práticos de como consumir a API EG Faktory em diferentes tecnologias.

---

## 📦 JavaScript / TypeScript (Axios)

### Instalação

```bash
npm install axios
```

### Configurar Client HTTP

```typescript
import axios, { AxiosInstance } from 'axios';

class FaktoryApiClient {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token automaticamente
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Interceptor para tratar erros
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado, fazer logout
          this.logout();
        }
        return Promise.reject(error);
      },
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('faktory_token', token);
  }

  getToken() {
    return this.token || localStorage.getItem('faktory_token');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('faktory_token');
  }

  // ──────────────────────────────────
  // AUTH
  // ──────────────────────────────────

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', {
      email,
      password,
    });
    this.setToken(response.data.access_token);
    return response.data;
  }

  // ──────────────────────────────────
  // ORGANIZATIONS
  // ──────────────────────────────────

  async createOrganization(name: string, cnpj: string) {
    return this.api.post('/organizations', { name, cnpj });
  }

  async listOrganizations() {
    return this.api.get('/organizations');
  }

  async getOrganization(id: string) {
    return this.api.get(`/organizations/${id}`);
  }

  async updateOrganization(id: string, data: any) {
    return this.api.patch(`/organizations/${id}`, data);
  }

  // ──────────────────────────────────
  // USERS
  // ──────────────────────────────────

  async createUser(data: {
    organizationId: string;
    fullName: string;
    email: string;
    password: string;
    role: string;
  }) {
    return this.api.post('/users', data);
  }

  async listUsers() {
    return this.api.get('/users');
  }

  async getUser(id: string) {
    return this.api.get(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.api.patch(`/users/${id}`, data);
  }

  // ──────────────────────────────────
  // COURSES
  // ──────────────────────────────────

  async createCourse(data: {
    organizationId?: string;
    title: string;
    description?: string;
    status?: string;
    isGlobal?: boolean;
  }) {
    return this.api.post('/courses', data);
  }

  async listCourses() {
    return this.api.get('/courses');
  }

  async getCourse(id: string) {
    return this.api.get(`/courses/${id}`);
  }

  async updateCourse(id: string, data: any) {
    return this.api.patch(`/courses/${id}`, data);
  }
}

export default FaktoryApiClient;
```

### Uso em React

```typescript
import { useState } from 'react';
import FaktoryApiClient from './FaktoryApiClient';

const api = new FaktoryApiClient();

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await api.login(email, password);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Entrando...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

---

## 🎣 React Query (Recomendado)

### Instalação

```bash
npm install @tanstack/react-query axios
```

### Hooks Customizados

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

// Criar instance do axios com token automaticamente
const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('faktory_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ──────────────────────────────────
// LOGIN
// ──────────────────────────────────

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.post('/auth/login', credentials),
    onSuccess: (data) => {
      localStorage.setItem('faktory_token', data.data.access_token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    },
  });
};

// ──────────────────────────────────
// USERS
// ──────────────────────────────────

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users'),
    select: (data) => data.data,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/users/${id}`),
    select: (data) => data.data,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData: any) => api.post('/users', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// ──────────────────────────────────
// COURSES
// ──────────────────────────────────

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses'),
    select: (data) => data.data,
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`),
    select: (data) => data.data,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseData: any) => api.post('/courses', courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/courses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
```

### Usar em Componentes

```typescript
import React from 'react';
import { useCourses, useCreateCourse } from './hooks';

export const CoursesPage: React.FC = () => {
  const { data: courses, isLoading, error } = useCourses();
  const { mutate: createCourse, isPending } = useCreateCourse();

  const handleCreateCourse = () => {
    createCourse({
      organizationId: 'seu-org-id',
      title: 'Novo Curso',
      status: 'DRAFT',
    });
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar cursos</div>;

  return (
    <div>
      <h1>Cursos</h1>
      <button onClick={handleCreateCourse} disabled={isPending}>
        {isPending ? 'Criando...' : 'Criar Curso'}
      </button>
      <ul>
        {courses?.map((course) => (
          <li key={course.id}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <span>{course.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 🚀 Vue.js 3 (Composition API) com Axios

```typescript
import { ref, computed } from 'vue';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('faktory_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAuth = () => {
  const user = ref(null);
  const loading = ref(false);
  const error = ref('');

  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = '';
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('faktory_token', data.access_token);
      user.value = data.user;
      return data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao fazer login';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    localStorage.removeItem('faktory_token');
  };

  return { user, loading, error, login, logout };
};

export const useCourses = () => {
  const courses = ref([]);
  const loading = ref(false);
  const error = ref('');

  const fetchCourses = async () => {
    loading.value = true;
    error.value = '';
    try {
      const { data } = await api.get('/courses');
      courses.value = data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar cursos';
    } finally {
      loading.value = false;
    }
  };

  const createCourse = async (courseData: any) => {
    try {
      const { data } = await api.post('/courses', courseData);
      courses.value.push(data);
      return data;
    } catch (err) {
      throw err;
    }
  };

  return { courses, loading, error, fetchCourses, createCourse };
};
```

### Componente Vue

```vue
<template>
  <div class="courses">
    <h1>Cursos</h1>
    <button @click="createCourse" :disabled="loading">
      {{ loading ? 'Criando...' : 'Novo Curso' }}
    </button>
    <div v-if="loading" class="spinner">Carregando...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <ul>
      <li v-for="course in courses" :key="course.id">
        <h3>{{ course.title }}</h3>
        <p>{{ course.description }}</p>
        <span class="badge">{{ course.status }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCourses } from './composables';

const { courses, loading, error, fetchCourses, createCourse } = useCourses();

onMounted(() => {
  fetchCourses();
});

const createCourse = async () => {
  await createCourse({
    organizationId: 'seu-org-id',
    title: 'Novo Curso',
    status: 'DRAFT',
  });
};
</script>

<style scoped>
.courses {
  margin: 2rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
}

.error {
  color: red;
  margin: 1rem 0;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  border: 1px solid #ddd;
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 4px;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #28a745;
  color: white;
  border-radius: 3px;
  font-size: 0.85rem;
}
</style>
```

---

## 🔧 Angular 16+

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FaktoryApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  getCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses`);
  }

  getCourse(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/${id}`);
  }

  createCourse(course: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/courses`, course);
  }

  updateCourse(id: string, course: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/courses/${id}`, course);
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, user);
  }
}
```

### HTTP Interceptor (para adicionar token)

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('faktory_token');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req);
  }
}
```

---

## 📱 React Native / Expo

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.1.100:3000', // Seu IP local
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('faktory_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useLogin = () => {
  const [loading, setLoading] = React.useState(false);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('faktory_token', data.access_token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
};
```

---

## 🔌 Fetch API (Vanilla JavaScript)

```javascript
class FaktoryApi {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('faktory_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = data.access_token;
    localStorage.setItem('faktory_token', this.token);
    return data;
  }

  getCourses() {
    return this.request('/courses');
  }

  getCourse(id) {
    return this.request(`/courses/${id}`);
  }

  createCourse(courseData) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  getUsers() {
    return this.request('/users');
  }

  createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
}

// Uso
const api = new FaktoryApi();

// Login
await api.login('usuario@empresa.com', 'senha123456');

// Listar cursos
const courses = await api.getCourses();

// Criar curso
await api.createCourse({
  organizationId: 'seu-org-id',
  title: 'Novo Curso',
  status: 'DRAFT',
});
```

---

## 🧪 Testes com Jest + Axios Mock Adapter

```typescript
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import FaktoryApiClient from './FaktoryApiClient';

describe('FaktoryApiClient', () => {
  let api: FaktoryApiClient;
  let mock: MockAdapter;

  beforeEach(() => {
    api = new FaktoryApiClient();
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.reset();
  });

  test('should login successfully', async () => {
    const mockResponse = {
      access_token: 'token123',
      user: { id: '1', email: 'test@test.com', role: 'STUDENT' },
    };

    mock.onPost('/auth/login').reply(200, mockResponse);

    const result = await api.login('test@test.com', 'password123');

    expect(result.access_token).toBe('token123');
    expect(result.user.email).toBe('test@test.com');
  });

  test('should list courses', async () => {
    const mockCourses = [
      { id: '1', title: 'Course 1', status: 'PUBLISHED' },
      { id: '2', title: 'Course 2', status: 'DRAFT' },
    ];

    mock.onGet('/courses').reply(200, mockCourses);

    const result = await api.listCourses();

    expect(result.data).toHaveLength(2);
    expect(result.data[0].title).toBe('Course 1');
  });

  test('should handle login error', async () => {
    mock.onPost('/auth/login').reply(401, { message: 'Invalid credentials' });

    await expect(api.login('test@test.com', 'wrongpassword')).rejects.toThrow();
  });
});
```

---

## 🛡️ Segurança - Armazenar Token com Segurança

### LocalStorage (não recomendado para produção)
```javascript
// ⚠️ Vulnerável a XSS
localStorage.setItem('token', token);
```

### SessionStorage
```javascript
sessionStorage.setItem('token', token);
// Limpo ao fechar a aba
```

### HttpOnly Cookie (RECOMENDADO)
Configure o backend para enviar o token como cookie HttpOnly:
```javascript
// Backend envia:
// Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict
// O navegador cuida automaticamente
// E o axios envia automaticamente em cada requisição
```

---

**Pronto para consumir! Escolha o framework e comece a integração.** 🚀
