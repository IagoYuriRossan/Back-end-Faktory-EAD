# EG Faktory EAD — Documentação da API Backend

> **Versão**: 1.0.0  
> **Stack**: NestJS + Prisma + PostgreSQL  
> **Autenticação**: JWT (Bearer Token)  
> **Multi-tenancy**: Suporte total com isolamento de dados

---

## 📋 Índice

1. [Estrutura de Diretórios](#estrutura-de-diretórios)
2. [Modelos de Dados](#modelos-de-dados)
3. [Autenticação e Autorização](#autenticação-e-autorização)
4. [Endpoints](#endpoints)
5. [Exemplos de Requisições](#exemplos-de-requisições)

---

## 🏗️ Estrutura de Diretórios

```
src/
├── main.ts                              # Bootstrap
├── app.module.ts                        # Módulo raiz
│
├── prisma/
│   ├── prisma.module.ts                 # Módulo global
│   ├── prisma.service.ts               # Client para BD
│   └── schema.prisma                   # Schema com 10 tabelas
│
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts                  # Lógica de login
│   ├── auth.controller.ts              # POST /auth/login
│   ├── jwt.strategy.ts                 # Estratégia JWT
│   ├── dto/
│   │   └── login.dto.ts                # { email, password }
│   ├── guards/
│   │   ├── jwt-auth.guard.ts           # Guard autenticação
│   │   └── roles.guard.ts             # Guard RBAC
│   └── interfaces/
│       └── jwt-payload.interface.ts
│
├── common/
│   ├── decorators/
│   │   ├── public.decorator.ts         # @Public()
│   │   ├── roles.decorator.ts          # @Roles(UserRole.ORG_ADMIN)
│   │   └── current-user.decorator.ts   # @CurrentUser()
│   └── interceptors/
│       └── tenant.interceptor.ts       # Multi-tenancy automático
│
├── organizations/                       # Gerenciar tenants
│   ├── organizations.module.ts
│   ├── organizations.service.ts
│   ├── organizations.controller.ts
│   └── dto/
│       ├── create-organization.dto.ts
│       └── update-organization.dto.ts
│
├── users/                               # Gerenciar usuários
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
│
└── courses/                             # Gerenciar cursos
    ├── courses.module.ts
    ├── courses.service.ts
    ├── courses.controller.ts
    └── dto/
        ├── create-course.dto.ts
        └── update-course.dto.ts
```

---

## 📊 Modelos de Dados

### Enums

```typescript
enum OrganizationStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum UserRole {
  PLATFORM_ADMIN      // Acesso a tudo, cross-tenant
  ORG_ADMIN           // Admin da sua organização
  STUDENT             // Apenas leitura de cursos e progresso
}

enum CourseStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum QuestionType {
  SINGLE_CHOICE
  MULTIPLE_CHOICE
}
```

### Organization

```typescript
{
  id: string (UUID)
  name: string
  cnpj: string (unique)
  status: OrganizationStatus
  createdAt: DateTime
  updatedAt: DateTime
}
```

### User

```typescript
{
  id: string (UUID)
  organizationId: string (UUID) — Tenant owner
  fullName: string
  email: string (unique per organization)
  passwordHash: string (bcrypt)
  role: UserRole
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Course

```typescript
{
  id: string (UUID)
  organizationId: string (UUID) | null — null para cursos globais
  title: string
  description: string
  status: CourseStatus
  isGlobal: boolean — true se acessível a todas as orgs
  createdByUserId: string (UUID)
  createdAt: DateTime
  updatedAt: DateTime
  modules?: Module[]
}
```

### Module

```typescript
{
  id: string (UUID)
  courseId: string (UUID)
  title: string
  sortOrder: integer
  createdAt: DateTime
  updatedAt: DateTime
  lessons?: Lesson[]
}
```

### Lesson

```typescript
{
  id: string (UUID)
  moduleId: string (UUID)
  title: string
  sortOrder: integer
  videoUrl: string — URL validada (Vimeo, S3+CloudFront)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Questionnaire

```typescript
{
  id: string (UUID)
  moduleId: string (UUID) | null
  lessonId: string (UUID) | null
  title: string
  description: string
  createdAt: DateTime
  updatedAt: DateTime
  questions?: Question[]
}
```

### Question

```typescript
{
  id: string (UUID)
  questionnaireId: string (UUID)
  prompt: string
  questionType: QuestionType
  sortOrder: integer
  points: decimal(6,2)
  createdAt: DateTime
  updatedAt: DateTime
  options?: QuestionOption[]
}
```

### QuestionOption

```typescript
{
  id: string (UUID)
  questionId: string (UUID)
  optionText: string
  isCorrect: boolean
  sortOrder: integer
  createdAt: DateTime
  updatedAt: DateTime
}
```

### UserProgress

```typescript
{
  id: string (UUID)
  organizationId: string (UUID)
  userId: string (UUID)
  lessonId: string (UUID)
  isCompleted: boolean
  lastTimestampWatchedSeconds: integer
  completedAt: DateTime | null
  createdAt: DateTime
  updatedAt: DateTime
}
```

### UserAnswer

```typescript
{
  id: string (UUID)
  organizationId: string (UUID)
  userId: string (UUID)
  questionnaireId: string (UUID)
  questionId: string (UUID)
  selectedOptionId: string (UUID) | null
  answerText: string | null
  isCorrect: boolean | null
  scoreAwarded: decimal(6,2)
  answeredAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 🔐 Autenticação e Autorização

### Bearer Token (JWT)

Todas as rotas (exceto `/auth/login`) requerem:

```
Authorization: Bearer {JWT_TOKEN}
```

### Payload do JWT

```typescript
{
  sub: string           // user id
  organizationId: string // tenant id
  role: UserRole
  email: string
  iat: number
  exp: number
}
```

### Controle de Acesso (RBAC)

| Rota | PLATFORM_ADMIN | ORG_ADMIN | STUDENT |
|------|---|---|---|
| POST /organizations | ✅ | ❌ | ❌ |
| GET /organizations | ✅ | ❌ | ❌ |
| POST /users | ✅ | ✅ | ❌ |
| GET /users | ✅ | ✅ | ❌ |
| PATCH /users/:id | ✅ | ✅ | ❌ |
| POST /courses | ✅ | ✅ | ❌ |
| GET /courses | ✅ | ✅ | ✅ |
| PATCH /courses/:id | ✅ | ✅ | ❌ |

### Multi-tenancy Automática

O **TenantInterceptor** garante que:
- O `organizationId` é extraído do JWT automaticamente
- Usuários NÃO PODEM forjar outro `organizationId` no body/params
- Cada query ao banco é filtrada por tenant
- `PLATFORM_ADMIN` é isento

---

## 📡 Endpoints

### 🔑 Autenticação

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@empresa.com",
  "password": "senha123456"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "João Silva",
    "email": "usuario@empresa.com",
    "role": "ORG_ADMIN",
    "organizationId": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

**Error (401):**
```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas",
  "error": "Unauthorized"
}
```

---

### 🏢 Organizações

#### Criar Organização (PLATFORM_ADMIN only)
```http
POST /organizations
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "name": "Empresa XYZ LTDA",
  "cnpj": "12.345.678/0001-90"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Empresa XYZ LTDA",
  "cnpj": "12.345.678/0001-90",
  "status": "ACTIVE",
  "createdAt": "2026-03-04T10:30:00.000Z",
  "updatedAt": "2026-03-04T10:30:00.000Z"
}
```

#### Listar Organizações (PLATFORM_ADMIN only)
```http
GET /organizations
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Empresa XYZ LTDA",
    "cnpj": "12.345.678/0001-90",
    "status": "ACTIVE",
    "createdAt": "2026-03-04T10:30:00.000Z",
    "updatedAt": "2026-03-04T10:30:00.000Z"
  }
]
```

#### Obter Organização
```http
GET /organizations/{id}
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Empresa XYZ LTDA",
  "cnpj": "12.345.678/0001-90",
  "status": "ACTIVE",
  "createdAt": "2026-03-04T10:30:00.000Z",
  "updatedAt": "2026-03-04T10:30:00.000Z"
}
```

#### Atualizar Organização (PLATFORM_ADMIN only)
```http
PATCH /organizations/{id}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "name": "Empresa XYZ LTDA - Nova Razão",
  "status": "INACTIVE"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Empresa XYZ LTDA - Nova Razão",
  "cnpj": "12.345.678/0001-90",
  "status": "INACTIVE",
  "createdAt": "2026-03-04T10:30:00.000Z",
  "updatedAt": "2026-03-04T11:00:00.000Z"
}
```

---

### 👥 Usuários

#### Criar Usuário (PLATFORM_ADMIN, ORG_ADMIN)
```http
POST /users
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "organizationId": "550e8400-e29b-41d4-a716-446655440001",
  "fullName": "Maria Santos",
  "email": "maria@empresa.com",
  "password": "senhaForte123!",
  "role": "STUDENT"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655441111",
  "organizationId": "550e8400-e29b-41d4-a716-446655440001",
  "fullName": "Maria Santos",
  "email": "maria@empresa.com",
  "role": "STUDENT",
  "isActive": true,
  "createdAt": "2026-03-04T10:30:00.000Z",
  "updatedAt": "2026-03-04T10:30:00.000Z"
}
```

#### Listar Usuários da Organização
```http
GET /users
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655441111",
    "organizationId": "550e8400-e29b-41d4-a716-446655440001",
    "fullName": "Maria Santos",
    "email": "maria@empresa.com",
    "role": "STUDENT",
    "isActive": true,
    "createdAt": "2026-03-04T10:30:00.000Z",
    "updatedAt": "2026-03-04T10:30:00.000Z"
  }
]
```

#### Obter Usuário
```http
GET /users/{id}
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655441111",
  "organizationId": "550e8400-e29b-41d4-a716-446655440001",
  "fullName": "Maria Santos",
  "email": "maria@empresa.com",
  "role": "STUDENT",
  "isActive": true,
  "createdAt": "2026-03-04T10:30:00.000Z",
  "updatedAt": "2026-03-04T10:30:00.000Z"
}
```

#### Atualizar Usuário (PLATFORM_ADMIN, ORG_ADMIN)
```http
PATCH /users/{id}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "fullName": "Maria Santos Silva",
  "role": "ORG_ADMIN",
  "isActive": true
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655441111",
  "organizationId": "550e8400-e29b-41d4-a716-446655440001",
  "fullName": "Maria Santos Silva",
  "email": "maria@empresa.com",
  "role": "ORG_ADMIN",
  "isActive": true,
  "createdAt": "2026-03-04T10:30:00.000Z",
  "updatedAt": "2026-03-04T11:15:00.000Z"
}
```

---

### 📚 Cursos

#### Criar Curso (PLATFORM_ADMIN, ORG_ADMIN)
```http
POST /courses
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "organizationId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Introdução ao NestJS",
  "description": "Curso completo sobre NestJS para iniciantes",
  "status": "DRAFT",
  "isGlobal": false
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655442222",
  "organizationId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Introdução ao NestJS",
  "description": "Curso completo sobre NestJS para iniciantes",
  "status": "DRAFT",
  "isGlobal": false,
  "createdByUserId": "550e8400-e29b-41d4-a716-446655441111",
  "createdAt": "2026-03-04T10:30:00.000Z",
  "updatedAt": "2026-03-04T10:30:00.000Z"
}
```

#### Listar Cursos
```http
GET /courses
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655442222",
    "organizationId": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Introdução ao NestJS",
    "description": "Curso completo sobre NestJS para iniciantes",
    "status": "PUBLISHED",
    "isGlobal": false,
    "createdByUserId": "550e8400-e29b-41d4-a716-446655441111",
    "createdAt": "2026-03-04T10:30:00.000Z",
    "updatedAt": "2026-03-04T10:30:00.000Z",
    "modules": [
      {
        "id": "550e8400-e29b-41d4-a716-446655443333",
        "courseId": "550e8400-e29b-41d4-a716-446655442222",
        "title": "Fundamentos",
        "sortOrder": 1,
        "createdAt": "2026-03-04T10:35:00.000Z",
        "updatedAt": "2026-03-04T10:35:00.000Z"
      }
    ]
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655444444",
    "organizationId": null,
    "title": "Curso Global - TypeScript",
    "description": "Disponível para todas as organizações",
    "status": "PUBLISHED",
    "isGlobal": true,
    "createdByUserId": null,
    "createdAt": "2026-03-03T08:00:00.000Z",
    "updatedAt": "2026-03-03T08:00:00.000Z",
    "modules": []
  }
]
```

#### Obter Curso com Módulos e Aulas
```http
GET /courses/{id}
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655442222",
  "organizationId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Introdução ao NestJS",
  "description": "Curso completo sobre NestJS para iniciantes",
  "status": "PUBLISHED",
  "isGlobal": false,
  "createdByUserId": "550e8400-e29b-41d4-a716-446655441111",
  "createdAt": "2026-03-04T10:30:00.000Z",
  "updatedAt": "2026-03-04T10:30:00.000Z",
  "modules": [
    {
      "id": "550e8400-e29b-41d4-a716-446655443333",
      "courseId": "550e8400-e29b-41d4-a716-446655442222",
      "title": "Fundamentos",
      "sortOrder": 1,
      "createdAt": "2026-03-04T10:35:00.000Z",
      "updatedAt": "2026-03-04T10:35:00.000Z",
      "lessons": [
        {
          "id": "550e8400-e29b-41d4-a716-446655445555",
          "moduleId": "550e8400-e29b-41d4-a716-446655443333",
          "title": "O que é NestJS?",
          "sortOrder": 1,
          "videoUrl": "https://vimeo.com/123456789",
          "createdAt": "2026-03-04T10:40:00.000Z",
          "updatedAt": "2026-03-04T10:40:00.000Z"
        }
      ]
    }
  ]
}
```

#### Atualizar Curso (PLATFORM_ADMIN, ORG_ADMIN)
```http
PATCH /courses/{id}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "title": "Introdução ao NestJS - Atualizado",
  "status": "PUBLISHED",
  "description": "Curso completo com todos os tópicos"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655442222",
  "organizationId": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Introdução ao NestJS - Atualizado",
  "description": "Curso completo com todos os tópicos",
  "status": "PUBLISHED",
  "isGlobal": false,
  "createdByUserId": "550e8400-e29b-41d4-a716-446655441111",
  "createdAt": "2026-03-04T10:30:00.000Z",
  "updatedAt": "2026-03-04T11:30:00.000Z"
}
```

---

## 📝 Exemplos de Requisições

### Com cURL

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "senha123456"
  }'
```

#### Criar Curso (com token)
```bash
curl -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "550e8400-e29b-41d4-a716-446655440001",
    "title": "NodeJS Avançado",
    "description": "Técnicas avançadas com Node.js",
    "status": "DRAFT",
    "isGlobal": false
  }'
```

#### Listar Cursos
```bash
curl -X GET http://localhost:3000/courses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Com Postman / Insomnia

**Base URL:** `http://localhost:3000`

**Headers padrão (para rotas protegidas):**
```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

---

## 🚀 Como Rodar o Servidor

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Executar migrações (cria tabelas no BD)
npx prisma migrate dev --name init

# Iniciar em desenvolvimento (watch mode)
npm run start:dev

# Ou em produção
npm run build
npm run start:prod
```

**Servidor rodará em:** `http://localhost:3000`

---

## 🔒 Variáveis de Ambiente (.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/faktory_ead?schema=public"
JWT_SECRET="sua-chave-secreta-super-segura-aqui"
JWT_EXPIRES_IN="1d"
PORT=3000
NODE_ENV=development
```

---

## ⚠️ Importante: Multi-tenancy

- ✅ **Cursos globais** (`isGlobal=true`, `organizationId=null`) são lidos por todas as orgs
- ✅ **TenantInterceptor** bloqueia exploração cross-tenant automaticamente
- ✅ Cada query no banco é filtrada por `organizationId` do usuário
- ⚠️ `PLATFORM_ADMIN` consegue operar cross-tenant
- ⚠️ Senha mínima: 8 caracteres
- ⚠️ CNPJ: formato `00000000000000` ou `00.000.000/0000-00`

---

## 📅 Próximas Fases (Roadmap)

- [ ] Módulos: Create, Update, Delete, Reorder
- [ ] Aulas: Create, Update, Delete, Reorder
- [ ] Questionários: Create, Update, Delete
- [ ] Progresso do Usuário: Track, Update
- [ ] Respostas: Submit, Score
- [ ] Relatórios: Dashboard, Analytics
- [ ] Upload de Vídeos (integração com Vimeo/S3)
- [ ] Notificações (email, push)
- [ ] Rate Limiting e Caching

---

**Última atualização:** 4 de março de 2026  
**Desenvolvido com ❤️ em NestJS**
