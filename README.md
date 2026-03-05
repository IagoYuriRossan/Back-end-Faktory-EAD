# Back-end-Faktory-EAD
# 🎓 EG Faktory EAD — Backend API

**Plataforma educacional B2B (SaaS) com suporte a multi-tenancy, JWT/RBAC e isolamento completo de dados.**

## 📚 Stack Tecnológico

- **Linguagem**: TypeScript
- **Framework**: NestJS (Node.js)
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT com RBAC
- **Arquitetura**: Modular com isolamento multi-tenant

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

Crie um arquivo `.env` (ou use `.env.example` como base):

```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/faktory_ead"
JWT_SECRET="sua-chave-secreta-super-segura"
JWT_EXPIRES_IN="1d"
PORT=3000
NODE_ENV=development
```

### 3. Executar Migrações

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Iniciar Servidor

```bash
# Desenvolvimento (com reload)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

**Servidor rodará em:** `http://localhost:3000`

---

## 📡 Documentação da API

### Para Consumidores Frontend

| Documento | Conteúdo |
|-----------|----------|
| 📋 **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | **COMECE AQUI** - Resumo rápido de todos os endpoints |
| 📚 **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | Documentação detalhada com exemplos completos |
| 🔌 **[FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)** | Exemplos de integração em React, Vue, Angular, etc |
| 📮 **[postman_collection.json](./postman_collection.json)** | Coleção para Postman/Insomnia |

---

## 🏗️ Estrutura de Diretórios

```
src/
├── main.ts                    # Bootstrap
├── app.module.ts              # Módulo raiz
├── prisma/                    # Prisma client & schema
├── auth/                      # JWT + RBAC
├── common/                    # Decorators, Guards, Interceptors
├── organizations/             # Gerenciar tenants
├── users/                     # Gerenciar usuários
└── courses/                   # Gerenciar cursos
```

---

## 🔑 Autenticação

1. **POST /auth/login** - Obter JWT token
2. Adicionar header: `Authorization: Bearer {TOKEN}`
3. Token expira em: `1 dia` (configurável)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@empresa.com","password":"senha123456"}'
```

---

## 📊 Modelos de Dados

10 tabelas com relacionamentos:

```
Organizations
├── Users
├── Courses
│   ├── Modules
│   │   └── Lessons
│   │       └── Questionnaires
│   │           ├── Questions
│   │           │   └── QuestionOptions
│   │           └── UserAnswers
│   └── Modules
│       └── Lessons
│           └── UserProgress
└── UserProgress
```

---

## 👥 Controle de Acesso (RBAC)

| Role | Permissões |
|------|-----------|
| **PLATFORM_ADMIN** | Tudo (cross-tenant) |
| **ORG_ADMIN** | Gerencia usuários e cursos da sua org |
| **STUDENT** | Lê cursos e completa aulas/questionários |

---

## 🔐 Multi-tenancy

✅ Isolamento automático de dados por `organizationId`  
✅ TenantInterceptor bloqueia exploração cross-tenant  
✅ Suporte a **cursos globais** acessíveis por todas as orgs  
✅ Cada query é filtrada pelo tenant do usuário  

---

## 📝 Endpoints Principais

### Auth
- `POST /auth/login`

### Organizations
- `POST /organizations` (PLATFORM_ADMIN)
- `GET /organizations`
- `GET /organizations/:id`
- `PATCH /organizations/:id`

### Users
- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`

### Courses
- `POST /courses`
- `GET /courses`
- `GET /courses/:id`
- `PATCH /courses/:id`

> **Veja mais em [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**

---

## 🧪 Scripts Disponíveis

```bash
npm run build          # Compilar TypeScript
npm run start          # Iniciar servidor
npm run start:dev      # Iniciar em modo desenvolvimento
npm run start:prod     # Iniciar produção
npm run format         # Formatar código
npm run test           # Rodar testes
npm run prisma:generate # Gerar Prisma Client
npm run prisma:migrate # Executar migrações
npm run prisma:studio  # Abrir Prisma Studio (GUI)
```

---

## 🛠️ Desenvolvimento

### Criar Novo Endpoint

1. Criar DTO em `src/modulo/dto/`
2. Criar Service em `src/modulo/modulo.service.ts`
3. Criar Controller em `src/modulo/modulo.controller.ts`
4. Adicionar rota com decorators `@Roles()` se necessário
5. Testar com Postman/cURL

### Exemplo: Criar Usuário

```typescript
// DTO
export class CreateUserDto {
  @IsEmail()
  email: string;
  // ... outros campos
}

// Service
async create(dto: CreateUserDto) {
  return this.prisma.user.create({ data: dto });
}

// Controller
@Post()
@Roles(UserRole.ORG_ADMIN)
create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}
```

---

## 🚨 Tratamento de Erros

Todos os erros retornam JSON:

```json
{
  "statusCode": 400,
  "message": "Descrição do erro",
  "error": "Bad Request"
}
```

---

## 📦 Deploy (Exemplo com Railway/Render)

1. Crie banco PostgreSQL na cloud
2. Configure `DATABASE_URL` em variáveis de ambiente
3. Run migrations: `npx prisma migrate deploy`
4. Deploy: `npm run build && npm run start:prod`

---

## 🔒 Segurança

- ✅ Senhas com bcrypt (12 rounds)
- ✅ JWT com expiração
- ✅ Validação de entrada
- ✅ Multi-tenancy isolado
- ✅ RBAC por role
- ✅ CORS habilitado

---

## 📞 Próximas Fases

- [ ] Módulos (CRUD)
- [ ] Aulas (CRUD)
- [ ] Questionários (CRUD)
- [ ] Progresso do usuário (Tracking)
- [ ] Respostas e Scoring
- [ ] Relatórios e Analytics
- [ ] Upload de vídeos (Vimeo/S3)
- [ ] Notificações (Email/Push)

---

## 📞 Suporte

Para dúvidas sobre:
- **API**: Ver [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Integração**: Ver [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
- **Quick Help**: Ver [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

**Desenvolvido com ❤️ em TypeScript + NestJS**  
**Última atualização**: 4 de março de 2026
