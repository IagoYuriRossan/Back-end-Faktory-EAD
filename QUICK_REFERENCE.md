# ⚡ Quick Reference - Endpoints da API

## 🔑 Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| **POST** | `/auth/login` | Login com email e password |

```json
REQUEST:
{ "email": "user@empresa.com", "password": "senha123456" }

RESPONSE (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "João Silva",
    "email": "user@empresa.com",
    "role": "STUDENT",
    "organizationId": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

---

## 🏢 Organizações (PLATFORM_ADMIN only)

| Método | Endpoint | Permissão |
|--------|----------|-----------|
| **POST** | `/organizations` | PLATFORM_ADMIN |
| **GET** | `/organizations` | PLATFORM_ADMIN |
| **GET** | `/organizations/:id` | PLATFORM_ADMIN, ORG_ADMIN |
| **PATCH** | `/organizations/:id` | PLATFORM_ADMIN |

### Criar Organização
```json
POST /organizations

{
  "name": "Empresa XYZ LTDA",
  "cnpj": "12.345.678/0001-90"
}
```

### Listar Organizações
```
GET /organizations
```

### Obter Organização
```
GET /organizations/{id}
```

### Atualizar Organização
```json
PATCH /organizations/{id}

{
  "name": "Novo Nome",
  "status": "ACTIVE"
}
```

---

## 👥 Usuários

| Método | Endpoint | Permissão |
|--------|----------|-----------|
| **POST** | `/users` | PLATFORM_ADMIN, ORG_ADMIN |
| **GET** | `/users` | PLATFORM_ADMIN, ORG_ADMIN, STUDENT* |
| **GET** | `/users/:id` | PLATFORM_ADMIN, ORG_ADMIN |
| **PATCH** | `/users/:id` | PLATFORM_ADMIN, ORG_ADMIN |

*STUDENT - apenas listar usuários da mesma organização

### Criar Usuário
```json
POST /users

{
  "organizationId": "550e8400-e29b-41d4-a716-446655440001",
  "fullName": "Maria Silva",
  "email": "maria@empresa.com",
  "password": "senhaForte123!",
  "role": "STUDENT"
}
```

### Listar Usuários da Organização
```
GET /users
```

### Obter Usuário
```
GET /users/{id}
```

### Atualizar Usuário
```json
PATCH /users/{id}

{
  "fullName": "Novo Nome",
  "role": "ORG_ADMIN",
  "isActive": true
}
```

---

## 📚 Cursos

| Método | Endpoint | Permissão |
|--------|----------|-----------|
| **POST** | `/courses` | PLATFORM_ADMIN, ORG_ADMIN |
| **GET** | `/courses` | PLATFORM_ADMIN, ORG_ADMIN, STUDENT |
| **GET** | `/courses/:id` | PLATFORM_ADMIN, ORG_ADMIN, STUDENT |
| **PATCH** | `/courses/:id` | PLATFORM_ADMIN, ORG_ADMIN |

### Criar Curso
```json
POST /courses

{
  "organizationId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Introdução ao NestJS",
  "description": "Curso completo sobre NestJS",
  "status": "DRAFT",
  "isGlobal": false
}
```

**Tipos de Status:** `DRAFT`, `PUBLISHED`, `ARCHIVED`

### Listar Cursos (com módulos)
```
GET /courses
```

Retorna:
- Cursos da organização do usuário
- Cursos globais (`isGlobal: true`)

### Obter Curso (com módulos e aulas)
```
GET /courses/{id}
```

### Atualizar Curso
```json
PATCH /courses/{id}

{
  "title": "Novo Título",
  "status": "PUBLISHED",
  "description": "Nova descrição"
}
```

---

## 📝 Cabeçalhos Obrigatórios

### Para rotas protegidas (exceto `/auth/login`)

```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

### Exemplo com cURL
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Exemplo com Axios
```typescript
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
};

axios.get('http://localhost:3000/courses', config);
```

---

## 🔄 Fluxo Típico

```
1. POST /auth/login
   ↓ Recebe: access_token + user info
   
2. Armazenar token (localStorage/sessionStorage/cookie)
   ↓
   
3. GET /courses
   ↓ Header: Authorization: Bearer {token}
   ↓ Recebe: lista de cursos
   
4. Usar token em todas as requisições subsequentes
```

---

## ⚠️ Códigos de Erro

| Status | Significado |
|--------|-------------|
| **200** | OK - Requisição bem-sucedida |
| **201** | Created - Recurso criado |
| **400** | Bad Request - Dados inválidos |
| **401** | Unauthorized - Token inválido ou expirado |
| **403** | Forbidden - Sem permissão |
| **404** | Not Found - Recurso não encontrado |
| **409** | Conflict - Email/CNPJ duplicado |
| **500** | Server Error - Erro no servidor |

### Exemplo de Erro
```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas",
  "error": "Unauthorized"
}
```

---

## 🌐 Base URL

```
http://localhost:3000
```

---

## 📋 Validação de Entrada

| Campo | Validação |
|-------|-----------|
| **email** | RFC 5322 format |
| **password** | Mín. 8 caracteres |
| **cnpj** | `00000000000000` ou `00.000.000/0000-00` |
| **fullName** | Max. 255 caracteres |
| **title** (curso) | Max. 255 caracteres |
| **role** | `PLATFORM_ADMIN`, `ORG_ADMIN`, `STUDENT` |
| **status** (curso) | `DRAFT`, `PUBLISHED`, `ARCHIVED` |

---

## 🔐 Segurança

✅ Todas as senhas são hasheadas com bcrypt (12 rounds)  
✅ JWT com expiração configurável (padrão: 1 dia)  
✅ Multi-tenancy: isolamento automático de dados  
✅ RBAC: controle de acesso por role  
✅ Validação de entrada em todos os endpoints  

---

## 📚 Documentação Completa

- **API_DOCUMENTATION.md** - Documentação detalhada com exemplos
- **FRONTEND_INTEGRATION.md** - Guia de integração para diferentes frameworks

---

**Última atualização:** 4 de março de 2026
