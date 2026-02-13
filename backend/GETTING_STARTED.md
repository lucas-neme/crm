# Início Rápido

## 1️⃣ Configurar o Banco de Dados

Certifique-se de que o PostgreSQL está instalado e rodando:

```bash
# Criar banco de dados (executar no psql ou pgAdmin)
CREATE DATABASE crm;
```

## 2️⃣ Instalar Dependências

```bash
pnpm install
```

## 3️⃣ Configurar Variáveis de Ambiente

Edite o arquivo `.env` com suas credenciais do PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Davi_123
DB_DATABASE=crm
```

## 4️⃣ Executar o Projeto

```bash
# Modo desenvolvimento (com hot-reload)
pnpm start:dev

# Modo produção
pnpm build
pnpm start:prod
```

## 5️⃣ Acessar a Aplicação

- **API Base**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

## 📝 Testar a API

### Criar um cliente (POST)

```bash
curl -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com"
  }'
```

### Listar clientes (GET)

```bash
curl http://localhost:3000/clientes
```

### Buscar cliente por ID (GET)

```bash
curl http://localhost:3000/clientes/{id}
```

### Atualizar cliente (PUT)

```bash
curl -X PUT http://localhost:3000/clientes/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João da Silva"
  }'
```

### Deletar cliente (DELETE)

```bash
curl -X DELETE http://localhost:3000/clientes/{id}
```

## 🌍 Usar com diferentes idiomas

Adicione o parâmetro `lang` na query:

```bash
# Português (padrão)
curl http://localhost:3000/clientes?lang=pt

# Inglês
curl http://localhost:3000/clientes?lang=en
```

## 🎯 Arquitetura CQRS

O projeto está organizado seguindo o padrão CQRS:

- **Commands**: Operações de escrita (CREATE, UPDATE, DELETE)
- **Queries**: Operações de leitura (GET)

Veja o módulo `apps/cliente/` como exemplo de implementação.

## 🚀 Próximos Passos

1. Configure o PostgreSQL e crie o banco de dados `crm`
2. Execute `pnpm install`
3. Configure o arquivo `.env`
4. Execute `pnpm start:dev`
5. Acesse http://localhost:3000/api/docs para ver a documentação Swagger

Pronto! Seu backend NestJS com CQRS está funcionando! 🎉
