# 🚀 Começar Agora - Frontend

**Guia prático de 5 minutos para começar a consumir a API**

---

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Postman ou Insomnia (opcional, para testes)
- API Backend rodando em `http://localhost:3000`

---

## ⚡ Início Rápido (5 minutos)

### Passo 1: Ler a Documentação (2 min)

Abra **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** e leia a tabela de endpoints.

### Passo 2: Testar no Postman (2 min)

1. Abra **Postman** ou **Insomnia**
2. Escolha: **File → Import** (ou Ctrl+O)
3. Selecione **[postman_collection.json](./postman_collection.json)**
4. Clique em **POST /auth/login**
5. Preencha email e senha teste
6. Clique em **Send**
7. Copie o `access_token` que retornar
8. Clique em **Environment → Set Variable**
9. Nome: `access_token` → Value: (cole o token)
10. Tente **GET /courses** - pronto!

### Passo 3: Integrar no Frontend (até 30 min)

Escolha seu framework:

#### ⚛️ React + Axios

```bash
npm install axios
```

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Adicionar token após login
const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.access_token);
  api.defaults.headers.Authorization = `Bearer ${data.access_token}`;
  return data;
};

// Consumir endpoint
const getCourses = async () => {
  return api.get('/courses');
};
```

#### 📦 React + React Query

```bash
npm install @tanstack/react-query axios
```

```typescript
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
  });
};

// Usar no componente
function CoursesPage() {
  const { data: courses } = useCourses();
  return <div>{courses?.map(c => <h3>{c.title}</h3>)}</div>;
}
```

#### 🖖 Vue 3 + Axios

```bash
npm install axios
```

```typescript
import { onMounted, ref } from 'vue';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export default {
  setup() {
    const courses = ref([]);

    const fetchCourses = async () => {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      courses.value = data;
    };

    onMounted(fetchCourses);

    return { courses };
  },
};
```

#### 🅰️ Angular

```bash
npm install axios
```

```typescript
import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = axios.create({
    baseURL: 'http://localhost:3000',
  });

  getCourses() {
    const token = localStorage.getItem('token');
    return this.api.get('/courses', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
```

---

## 🔐 Fluxo de Autenticação

```
┌─────────────────┐
│   1. Login      │
│   POST /auth/login
│   { email, password }
│   ↓
│   Recebe: { access_token, user }
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Armazenar    │
│ localStorage.setItem(
│   'token',
│   access_token
│ )
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Usar em      │
│ cada requisição │
│ Authorization:  │
│   Bearer {token}│
└─────────────────┘
```

---

## 🎯 Exemplos de Requisições

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@empresa.com","password":"senha123456"}'
```

### Listar Cursos (com token)
```bash
TOKEN="seu_token_aqui"
curl -X GET http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN"
```

### Criar Curso
```bash
TOKEN="seu_token_aqui"
curl -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Novo Curso",
    "status": "DRAFT"
  }'
```

---

## 📱 Endpoints Principais

| Método | Rota | Necessita Auth |
|--------|------|---|
| **POST** | `/auth/login` | ❌ |
| **GET** | `/courses` | ✅ |
| **GET** | `/courses/:id` | ✅ |
| **POST** | `/courses` | ✅ |
| **PATCH** | `/courses/:id` | ✅ |
| **GET** | `/users` | ✅ |
| **POST** | `/users` | ✅ |
| **GET** | `/organizations` | ✅ |
| **POST** | `/organizations` | ✅ |

> **Veja mais em [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**

---

## 🆘 Erros Comuns

### Erro 401 (Unauthorized)
```json
{ "statusCode": 401, "message": "Credenciais inválidas" }
```
✅ Solução: Verifique email/password no login

### Erro 403 (Forbidden)
```json
{ "statusCode": 403, "message": "Acesso negado" }
```
✅ Solução: Seu role não tem permissão. Veja RBAC em [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Erro 409 (Conflict)
```json
{ "statusCode": 409, "message": "Email já cadastrado" }
```
✅ Solução: Email já existe na organização

### Token Expirado
```
GET request sem Authorization header
```
✅ Solução: Faça login novamente para obter novo token

---

## 📚 Documentação Completa

| Arquivo | Ler Quando |
|---------|-----------|
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | Precisa de um endpoint rápido |
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | Quer entender detalhes completos |
| **[FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)** | Precisa de exemplos em seu framework |
| **[DELIVERABLES.md](./DELIVERABLES.md)** | Quer ver tudo que foi entregue |

---

## ✅ Checklist

- [ ] Li [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- [ ] Importei [postman_collection.json](./postman_collection.json) no Postman
- [ ] Testei POST /auth/login e recebi um token
- [ ] Instalei axios/fetch na minha app
- [ ] Criei uma função para fazer login
- [ ] Armazenei o token no localStorage
- [ ] Testei fazer uma requisição autenticada (GET /courses)
- [ ] Consegui receber a resposta com dados

---

## 🆘 Precisa de Ajuda?

1. **Sobre um endpoint** → Veja [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. **Sobre autenticação** → Veja "Fluxo de Autenticação" acima
3. **Exemplos de código** → Veja [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
4. **Tudo sobre a API** → Veja [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

**🎉 Bora codar! Você tem tudo que precisa.**

---

## 🔗 Links Rápidos

- 📚 [Documentação Completa](./API_DOCUMENTATION.md)
- ⚡ [Quick Reference](./QUICK_REFERENCE.md)
- 🔌 [Integração Frontend](./FRONTEND_INTEGRATION.md)
- 📮 [Postman Collection](./postman_collection.json)
- 📦 [O que foi Entregue](./DELIVERABLES.md)

---

**Última atualização:** 4 de março de 2026
