# Projeto Full-Stack com NestJS

Este é um projeto full-stack que separa backend e frontend em pastas distintas.

## 📁 Estrutura do Projeto

```
├── backend/          # Aplicação NestJS (Backend)
├── frontend/         # Aplicação Frontend (a ser adicionada)
└── .github/          # Configurações do GitHub
```

## 🚀 Backend

O backend está desenvolvido com NestJS utilizando:
- CQRS (Command Query Responsibility Segregation)
- PostgreSQL + Sequelize
- Swagger para documentação
- i18n para internacionalização

📖 **[Documentação completa do backend](backend/README.md)**

### Executar o Backend

```bash
cd backend
pnpm install
pnpm start:dev
```

## 🎨 Frontend

Frontend será adicionado em breve.

## 📝 Documentação

- **Backend**: Veja [backend/README.md](backend/README.md)
- **Início Rápido**: Veja [backend/GETTING_STARTED.md](backend/GETTING_STARTED.md)

## 🛠️ Configuração

### Backend
1. Configure o PostgreSQL (banco: crm, porta: 5432)
2. Entre na pasta backend: `cd backend`
3. Configure o arquivo `.env`
4. Instale as dependências: `pnpm install`
5. Execute: `pnpm start:dev`

### Frontend
_A ser definido_

## 📊 Swagger

Após executar o backend, acesse a documentação da API em:
- http://localhost:3000/api/docs

## 🤝 Contribuindo

1. Clone o repositório
2. Siga as instruções de configuração do backend
3. Adicione o frontend quando necessário

---

**Estrutura modular preparada para crescimento do projeto!** 🚀
