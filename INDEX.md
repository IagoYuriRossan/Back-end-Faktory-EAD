# 📖 Índice de Documentação da API - EG Faktory EAD

**Bem-vindo! 👋 Este é seu mapa de navegação da documentação.**

---

## 🎯 Começar Aqui

### ⚡ **Tenho 5 minutos**
→ Leia: **[GET_STARTED.md](./GET_STARTED.md)** *(7,5 KB)*

Um guia prático e rápido para começar a consumir a API em 5 minutos.
- Testa no Postman
- Exemplos de código em React/Vue/Angular
- Fluxo de autenticação
- Erros comuns e soluções

### 📋 **Preciso de um endpoint rápido**
→ Leia: **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** *(5,7 KB)*

Resumo ultra-rápido de TODOS os endpoints com exemplos cURL.
- Tabelas de endpoints
- Headers obrigatórios
- Códigos de erro
- Validação de entrada

### 📚 **Quero documentação completa**
→ Leia: **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** *(19 KB)*

Documentação detalhada com todos os modelos de dados e exemplos JSON.
- Estrutura de diretórios
- Modelos de dados completos
- Fluxo de autenticação
- Todos os 13 endpoints com respostas
- Segurança

### 🔌 **Preciso integrar em meu framework**
→ Leia: **[FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)** *(20 KB)*

Exemplos práticos de integração em diferentes tecnologias.
- ⚛️ React (Axios + React Query)
- 🖖 Vue 3 (Composition API)
- 🅰️ Angular 16+
- 📱 React Native / Expo
- 🎣 Fetch API vanilla
- 🧪 Jest + testes

### 📦 **O que exatamente foi entregue?**
→ Leia: **[DELIVERABLES.md](./DELIVERABLES.md)** *(13 KB)*

Resumo completo da entrega.
- 4 entregáveis principais
- Checklist de implementação
- Estrutura do projeto
- Endpoints implementados
- Roadmap futuro

### 🚀 **Setup inicial do projeto**
→ Leia: **[README.md](./README.md)** *(6,4 KB)*

Documentação técnica principal do projeto.
- Stack tecnológico
- Início rápido
- Estrutura de diretórios
- Autenticação e Multi-tenancy

---

## 🔧 Ferramentas & Recursos

### 📮 Postman Collection
**[postman_collection.json](./postman_collection.json)** *(11 KB)*

Coleção pronta para importar no Postman com TODOS os endpoints.

**Como usar:**
1. Abra Postman
2. File → Import → [postman_collection.json](./postman_collection.json)
3. Teste os endpoints
4. Use a variável `{{access_token}}` para autenticação

---

## 📊 Estatísticas do Projeto

```
├── 📚 Documentação
│   ├── GET_STARTED.md               (7,5 KB)   ← COMECE AQUI
│   ├── QUICK_REFERENCE.md           (5,7 KB)
│   ├── API_DOCUMENTATION.md         (19 KB)
│   ├── FRONTEND_INTEGRATION.md      (20 KB)
│   ├── DELIVERABLES.md              (13 KB)
│   ├── README.md                    (6,4 KB)
│   └── INDEX.md                     (este arquivo)
│
├── 🔧 Código TypeScript
│   ├── 39 arquivos .ts
│   ├── 936+ linhas de código
│   ├── 4 módulos de domínio
│   └── 13 endpoints
│
├── 🛠️ Configuração
│   ├── tsconfig.json
│   ├── package.json
│   ├── nest-cli.json
│   ├── prisma/schema.prisma
│   └── .env.example
│
└── 📮 Testes
    └── postman_collection.json     (11 KB)
```

---

## 🎯 Escolha Seu Caminho

### 👨‍💻 **Para Desenvolvedores Frontend**

```
1️⃣ Leia: GET_STARTED.md (5 min)
   ↓
2️⃣ Escolha seu framework em FRONTEND_INTEGRATION.md
   ↓
3️⃣ Copie o código de exemplo
   ↓
4️⃣ Teste no Postman (postman_collection.json)
   ↓
5️⃣ Integre na sua aplicação
```

### 🏗️ **Para Arquitetos / Tech Leads**

```
1️⃣ Leia: DELIVERABLES.md (5 min)
   ↓
2️⃣ Leia: API_DOCUMENTATION.md (15 min)
   ↓
3️⃣ Revise a estrutura do backend (README.md)
   ↓
4️⃣ Compartilhe QUICK_REFERENCE.md com o time
```

### 📋 **Para QA / Testes**

```
1️⃣ Importe postman_collection.json
   ↓
2️⃣ Consulte QUICK_REFERENCE.md
   ↓
3️⃣ Teste os endpoints
   ↓
4️⃣ Valide respostas com API_DOCUMENTATION.md
```

---

## 📈 Endpoints Disponíveis

### Auth
```
POST /auth/login
├─ Request: { email, password }
└─ Response: { access_token, user }
```

### Organizations (PLATFORM_ADMIN)
```
POST /organizations      ← Create
GET /organizations       ← List all
GET /organizations/:id   ← Get one
PATCH /organizations/:id ← Update
```

### Users
```
POST /users       ← Create (PLATFORM_ADMIN, ORG_ADMIN)
GET /users        ← List (PLATFORM_ADMIN, ORG_ADMIN, STUDENT*)
GET /users/:id    ← Get one
PATCH /users/:id  ← Update (PLATFORM_ADMIN, ORG_ADMIN)
```

### Courses
```
POST /courses       ← Create (PLATFORM_ADMIN, ORG_ADMIN)
GET /courses        ← List all (com módulos)
GET /courses/:id    ← Get one (com módulos e aulas)
PATCH /courses/:id  ← Update (PLATFORM_ADMIN, ORG_ADMIN)
```

**Total: 13 endpoints** ✅

---

## 🔐 Segurança

| Item | Status |
|------|--------|
| Senhas com bcrypt | ✅ |
| JWT com expiração | ✅ |
| RBAC por role | ✅ |
| Multi-tenancy | ✅ |
| Isolamento de dados | ✅ |
| Validação de entrada | ✅ |

---

## 🆘 Precisa de Ajuda?

| Dúvida | Arquivo |
|--------|---------|
| Como começar? | [GET_STARTED.md](./GET_STARTED.md) |
| Qual é o endpoint X? | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |
| Detalhes de um endpoint? | [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) |
| Como integrar em React? | [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) |
| O que foi entregue? | [DELIVERABLES.md](./DELIVERABLES.md) |
| Setup técnico | [README.md](./README.md) |

---

## 📞 Resumo Rápido

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -d '{"email":"user@empresa.com","password":"senha123456"}'
```

### Usar Token
```bash
Authorization: Bearer {access_token}
```

### Listar Cursos
```bash
curl http://localhost:3000/courses \
  -H "Authorization: Bearer {access_token}"
```

---

## 🎓 Estrutura Padrão de Resposta

### Sucesso (2xx)
```json
{
  "id": "uuid",
  "field1": "value",
  "field2": "value",
  "createdAt": "2026-03-04T10:30:00.000Z",
  "updatedAt": "2026-03-04T10:30:00.000Z"
}
```

### Erro (4xx/5xx)
```json
{
  "statusCode": 400,
  "message": "Descrição do erro",
  "error": "Bad Request"
}
```

---

## ✨ Features Principais

✅ **13 endpoints** funcionais  
✅ **4 módulos** (auth, organizations, users, courses)  
✅ **3 roles** (PLATFORM_ADMIN, ORG_ADMIN, STUDENT)  
✅ **10 tabelas** no banco (Prisma)  
✅ **JWT** com expiração configurável  
✅ **RBAC** com guards globais  
✅ **Multi-tenancy** com isolamento automático  
✅ **Validação** em todos os DTOs  
✅ **Tratamento de erros** robusto  
✅ **Documentação** completa em 5 arquivos  
✅ **Postman Collection** pronta para testar  
✅ **Exemplos** em React, Vue, Angular, Fetch API  

---

## 🚀 Roadmap

| Fase | Funcionalidade | Status |
|------|---|---|
| 1 | Auth + CRUD básico | ✅ FEITO |
| 2 | Modules + Lessons | 🔄 TODO |
| 3 | Questionnaires + Questions | 🔄 TODO |
| 4 | User Progress + Answers | 🔄 TODO |
| 5 | Relatórios | 🔄 TODO |

---

## 📱 Technologies

```
NestJS 11.x + TypeScript + Prisma + PostgreSQL + JWT + RBAC
```

---

## 📄 Versão

```
Backend: 1.0.0
API Version: 1.0
Last Updated: 4 de março de 2026
```

---

## 🎯 Próximo Passo?

1. **Desenvolvedores Frontend**: Vá para [GET_STARTED.md](./GET_STARTED.md)
2. **Revisores**: Vá para [DELIVERABLES.md](./DELIVERABLES.md)
3. **Testes**: Importe [postman_collection.json](./postman_collection.json)

---

**🎉 Tudo pronto! Comece a construir!**

---

*Desenvolvido com ❤️ em TypeScript + NestJS*  
*Arquiteto de Software Sênior | 4 de março de 2026*
