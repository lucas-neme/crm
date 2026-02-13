# Projeto de Expansão do Módulo Imobiliário (CRM Imobiliária)

## Visão Geral
Transformação do conceito de "Módulo de Produtos" para "Tipo de CRM", com foco no modelo de negócio imobiliário (Revenda, Locação e Lançamentos). O núcleo do gerenciamento de produtos passará de uma entidade simples para dois níveis: **Empreendimento** (Pai) e **Unidade** (Filho).

## 1. Modelagem de Entidades

### A. Empreendimento (Project/Development)
Representa um prédio, condomínio ou lançamento.
- **Tabela:** `empreendimentos`
- **Campos:**
  - `id` (UUID) - PK
  - `nome` (String, not null)
  - `construtora_id` (UUID, nullable) - FK para parceiro/construtora (opcional, pode ser texto por enquanto)
  - `status` (Enum: 'LANÇAMENTO', 'EM OBRAS', 'PRONTO', 'ESGOTADO')
  - `previsao_entrega` (Date)
  - `descricao_curta` (Text)
  - `descricao_longa` (Text - HTML)
  - `endereco_cep` (String)
  - `endereco_logradouro` (String)
  - `endereco_numero` (String)
  - `endereco_complemento` (String)
  - `endereco_bairro` (String)
  - `endereco_cidade` (String)
  - `endereco_uf` (String)
  - `midias` (JSONB) - [{ tipo: 'imagem'|'video'|'pdf', url: '...', titulo: '...', ordem: 1 }]
  - `regras_comissao` (JSONB) - { percentual_padrao: 5.0, regras: '...' }
  - `is_ativo` (Boolean, default true)
  - Timestamps (`created_at`, `updated_at`)

### B. Unidade (Unit)
Representa o produto final vendável (apartamento, casa, sala, lote).
- **Tabela:** `unidades`
- **Campos:**
  - `id` (UUID) - PK
  - `empreendimento_id` (UUID, not null) - FK `empreendimentos`
  - `codigo_interno` (String, unique) - Ex: EMP-001-A101
  - `tipo` (Enum: 'CASA', 'APARTAMENTO', 'COMERCIAL', 'TERRENO')
  - `tipologia` (String, opcional) - Ex: 'Studio', '2Q', '3Q'
  - `torre` (String)
  - `andar` (String)
  - `numero_unidade` (String)
  - `area_total` (Decimal)
  - `area_privativa` (Decimal)
  - `quartos` (Int)
  - `suites` (Int)
  - `banheiros` (Int)
  - `vagas` (Int)
  - `valor_tabela` (Decimal)
  - `valor_oferta` (Decimal, nullable)
  - `valor_min_negociavel` (Decimal, nullable)
  - `status_unidade` (Enum: 'DISPONIVEL', 'RESERVADO', 'PROPOSTA', 'VENDIDO', 'DISTRATO')
  - `status_publicacao` (Enum: 'RASCUNHO', 'PUBLICADO', 'PAUSADO')
  - `canais_publicacao` (Array/JSONB) - ['SITE', 'OLX', 'ZAP']
  - `link_anuncio` (String)
  - `headline` (String) - Descrição curta para vitrine
  - `descricao` (Text)
  - `tags` (Array/JSONB) - ['Vista Mar', 'Sol da Manhã']
  - `midias` (JSONB) - [{ tipo: 'imagem', url: '...', destaque: true }]
  - Timestamps

### C. Leads & Funil
Adaptação da entidade `clientes` com novos campos ou tabela estendida.
- **Tabela:** `leads` (ou campos em `clientes`)
- **Novos Campos:**
  - `origem` (Enum: 'INSTAGRAM', 'FACEBOOK', 'PORTAL', 'INDICACAO', 'DIVERSOS')
  - `interesse` (Enum: 'COMPRA', 'VENDA', 'ALUGUEL')
  - `pipeline_stage` (Enum: 'NOVO', 'CONTATO', 'VISITA', 'PROPOSTA', 'RESERVA', 'CONTRATO', 'GANHO', 'PERDIDO')
  - `data_ultima_interacao` (Timestamp)
  - `temperatura` (Enum: 'FRIA', 'MORNA', 'QUENTE')
- **Relacionamento:** `lead_id` <-> `unidade_id` (N:N, tabela `lead_interesses`)

### D. Reservas & Propostas
- **Tabela:** `reservas`
  - `id`, `unidade_id` (FK), `cliente_id` (FK), `usuario_id` (Corretor), `data_inicio`, `data_fim` (Validade), `status` (ATIVA, VENCIDA, CANCELADA, CONVERTIDA)
- **Tabela:** `propostas`
  - `id`, `unidade_id` (FK), `cliente_id` (FK), `usuario_id` (Corretor), `valor_proposto`, `condicoes_pagamento` (JSONB), `status` (ENVIADA, ANALISE, ACEITA, RECUSADA), `data_proposta`

## 2. Estrutura de Rotas (NestJS)

- **Empreendimentos:**
  - `GET /empreendimentos` (Listar com filtros por cidade/bairro/status)
  - `GET /empreendimentos/:id` (Detalhes + lista de unidades resumida)
  - `POST /empreendimentos`
  - `PUT /empreendimentos/:id`
  - `DELETE /empreendimentos/:id`

- **Unidades:**
  - `GET /unidades` (Listar todas, filtros avançados: quartos, preço, área)
  - `GET /empreendimentos/:id/unidades` (Listar unidades de um empreendimento)
  - `POST /unidades`
  - `PUT /unidades/:id`
  - `PATCH /unidades/:id/status` (Alterar apenas disponibilidade)
  - `DELETE /unidades/:id`

- **CRM/Leads:**
  - `GET /leads` (Kanban view data)
  - `POST /leads/:id/interesse` (Vincular unidade)
  - `POST /reservas` (Criar reserva - valida regras de bloqueio)

## 3. Regras de Negócio
1.  **Bloqueio de Reserva:** Uma unidade com status `RESERVADO` ou `VENDIDO` não pode receber nova Reserva Ativa.
2.  **Expiração Automática:** Job (Cron) roda a cada hora verificando `reservas` onde `data_fim < NOW()` e status `ATIVA`. Atualiza para `VENCIDA` e libera unidade para `DISPONIVEL`.
3.  **Hierarquia:** Excluir um Empreendimento deve alertar se existirem Unidades vinculadas (ou Soft Delete).

## 4. Checklist Incremental de Implementação

- [ ] **Etapa 1 (DB & Models):** Criar tabelas `empreendimentos`, `unidades`, `reservas` e seus Models NestJS.
- [ ] **Etapa 2 (Backend Services):** Implementar CRUD básico de Empreendimentos e Unidades no backend.
- [ ] **Etapa 3 (Frontend - Empreendimentos):** Criar telas de Listagem e Cadastro de Empreendimentos.
- [ ] **Etapa 4 (Frontend - Unidades):** Criar gerenciamento de Unidades dentro do contexto de Empreendimento (Abas).
- [ ] **Etapa 5 (Frontend - CRM/Leads):** Implementar visualização Kanban para Leads e associação com Unidades.
- [ ] **Etapa 6 (Reservas e Bloqueios):** Implementar lógica de reserva, bloqueio de unidade e expiração.

## 5. Próximos Passos (Imediato)
Iniciar **Etapa 1**: Scripts de banco de dados e definição dos modelos no Backend.
