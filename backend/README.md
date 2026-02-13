# NestJS Backend with CQRS

Backend API desenvolvido com NestJS utilizando o padrão CQRS (Command Query Responsibility Segregation), PostgreSQL, Sequelize ORM, Swagger e i18n.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js progressivo
- **CQRS** - Padrão de arquitetura Command Query Responsibility Segregation
- **PostgreSQL** - Banco de dados relacional
- **Sequelize** - ORM para Node.js
- **Swagger** - Documentação automática da API
- **i18n** - Internacionalização (PT-BR e EN)
- **pnpm** - Gerenciador de pacotes

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL (versão 12 ou superior)
- pnpm (instalado globalmente)

## 🔧 Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
pnpm install
```

3. Configure o banco de dados PostgreSQL:
   - Crie um banco de dados chamado `crm`
   - Ajuste as credenciais no arquivo `.env` se necessário

4. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Davi_123
DB_DATABASE=crm

PORT=3000
NODE_ENV=development
```

## 🎯 Executando a aplicação

### Modo de desenvolvimento

```bash
pnpm start:dev
```

### Modo de produção

```bash
pnpm build
pnpm start:prod
```

## 📚 Documentação da API

Após iniciar a aplicação, acesse a documentação Swagger em:

```
http://localhost:3000/api/docs
```

## 🏗️ Estrutura do Projeto

```
src/
├── apps/               # Módulos de aplicação
│   └── cliente/       # Módulo de clientes (exemplo CQRS)
│       ├── commands/      # Commands e handlers
│       ├── queries/       # Queries e handlers
│       ├── dto/           # Data Transfer Objects
│       ├── models/        # Modelos Sequelize
│       ├── clientes.controller.ts
│       └── clientes.module.ts
├── common/              # Código compartilhado
│   ├── base/           # Classes base para CQRS
│   └── interfaces/     # Interfaces comuns
├── i18n/               # Arquivos de tradução
│   ├── pt/            # Português
│   └── en/            # Inglês
├── app.module.ts       # Módulo principal
└── main.ts            # Arquivo de entrada
```

## 🎨 Padrão CQRS

Este projeto implementa o padrão CQRS separando:

### CommaClienteCommand` - Criar cliente
- `UpdateClienteCommand` - Atualizar cliente
- `DeleteClienteCommand` - Excluir cliente

### Queries (Leitura)
- `GetAllClientesQuery` - Listar todos os clientes
- `GetClienteByIdQuery` - Buscar clientes usuários
- `GetUserByIdQuery` - Buscar usuário por ID

## 🌍 Internacionalização

A API suporta múltiplos idiomas. Para especificar o idioma, use o parâmetro de query `lang`:

```clientes?lang=pt
GET http://localhost:3000/clientes?lang=pt
GET http://localhost:3000/users?lang=en
```

Idiomas suportados:
- `pt` - Português (padrão)
- `en` - Inglês

## 📝 Endpoints da API
Clientes

- `POST /clientes` - Criar cliente
- `GET /clientes` - Listar todos os clientes
- `GET /clientes/:id` - Buscar cliente por ID
- `PUT /clientes/:id` - Atualizar cliente
- `DELETE /clientes/:id` - Excluir cliente
- `DELETE /users/:id` - Excluir usuário

## 🧪 Testes

```bash
# Testes unitários
pnpm test

# Testes e2e
pnpm test:e2e

# Cobertura de testes
pnpm test:cov
```

## 📦 Build

```bash
pnpm build
```

## 🔍 Linting

```bash
pnpm lint
```

## 📄 Licença

MIT

## 👥 Autor

Desenvolvido com ❤️ usando NestJS e CQRS
