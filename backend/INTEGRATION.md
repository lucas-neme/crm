# Integração Power BI via n8n

Este documento descreve como configurar a integração entre o CRM e o Power BI usando n8n.

## Endpoints Disponíveis

### Base URL
```
http://localhost:3000/api/integrations
```

### 1. Exportar Clientes
**Endpoint:** `GET /api/integrations/clientes/export`

**Parâmetros de Query:**
- `dataInicio` (opcional): Data inicial no formato YYYY-MM-DD
- `dataFim` (opcional): Data final no formato YYYY-MM-DD

**Exemplo:**
```
GET http://localhost:3000/api/integrations/clientes/export?dataInicio=2024-01-01&dataFim=2024-12-31
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2026-02-03T18:00:00.000Z",
  "count": 3,
  "data": [
    {
      "id": "uuid",
      "codigo": 1,
      "nome": "Cliente Exemplo",
      "email": "cliente@example.com",
      "telefone": "(11) 99999-9999",
      "tipoPessoa": "FISICA",
      "isActive": true,
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    }
  ]
}
```

### 2. Exportar Negócios
**Endpoint:** `GET /api/integrations/negocios/export`

**Parâmetros de Query:**
- `dataInicio` (opcional): Data inicial de venda (YYYY-MM-DD)
- `dataFim` (opcional): Data final de venda (YYYY-MM-DD)

**Exemplo:**
```
GET http://localhost:3000/api/integrations/negocios/export?dataInicio=2024-01-01
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2026-02-03T18:00:00.000Z",
  "count": 2,
  "data": [
    {
      "id": "uuid",
      "codigo": 1,
      "dataVenda": "2026-02-03",
      "dataEntrega": "2026-02-10",
      "entrega": true,
      "valorFinal": 150.50,
      "clienteId": "uuid",
      "clienteCodigo": 1,
      "clienteNome": "Cliente Exemplo",
      "clienteTipoPessoa": "FISICA",
      "quantidadeItens": 2,
      "produtos": [
        {
          "produtoId": "uuid",
          "produtoNome": "Produto 1",
          "quantidade": 2,
          "valorUnitario": 50.25,
          "subtotal": 100.50
        }
      ],
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    }
  ]
}
```

### 3. Exportar Produtos
**Endpoint:** `GET /api/integrations/produtos/export`

**Exemplo:**
```
GET http://localhost:3000/api/integrations/produtos/export
```

### 4. Dashboard - Resumo
**Endpoint:** `GET /api/integrations/dashboard/resumo`

**Parâmetros de Query:**
- `dataInicio` (opcional): Data inicial (YYYY-MM-DD)
- `dataFim` (opcional): Data final (YYYY-MM-DD)

**Exemplo:**
```
GET http://localhost:3000/api/integrations/dashboard/resumo?dataInicio=2024-01-01&dataFim=2024-12-31
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2026-02-03T18:00:00.000Z",
  "periodo": {
    "dataInicio": "2024-01-01",
    "dataFim": "2024-12-31"
  },
  "resumo": {
    "clientes": {
      "total": 150,
      "ativos": 120,
      "inativos": 30
    },
    "produtos": {
      "total": 50,
      "ativos": 45,
      "inativos": 5
    },
    "vendas": {
      "total": 500,
      "valorTotal": 75000.50,
      "ticketMedio": 150.00,
      "comEntrega": 300,
      "semEntrega": 200
    }
  }
}
```

## Configuração no n8n

### Workflow de Exemplo - Sincronização Diária

1. **Trigger - Schedule Trigger**
   - Tipo: Interval
   - Intervalo: 1 dia
   - Horário: 02:00 AM

2. **HTTP Request - Buscar Negócios**
   - Method: GET
   - URL: `http://localhost:3000/api/integrations/negocios/export`
   - Authentication: None (adicione se necessário)
   - Response Format: JSON

3. **Code Node - Transformar Dados** (se necessário)
   ```javascript
   const items = $input.all();
   const data = items[0].json.data;
   
   return data.map(negocio => ({
     json: {
       ...negocio,
       // Transformações adicionais aqui
     }
   }));
   ```

4. **HTTP Request - Enviar para Power BI**
   - Method: POST
   - URL: `https://api.powerbi.com/beta/[workspace-id]/datasets/[dataset-id]/rows?key=[api-key]`
   - Body: JSON com os dados transformados

### Workflow Alternativo - Webhook

1. **Webhook Trigger**
   - Path: `crm-update`
   - Method: POST

2. **HTTP Request**
   - URL: `http://localhost:3000/api/integrations/[endpoint]`

3. **Processar e enviar para Power BI**

## Power BI - Configuração

### Opção 1: API REST Direta

1. No Power BI Desktop, vá em **Obter Dados**
2. Selecione **Web**
3. Cole a URL do endpoint: `http://localhost:3000/api/integrations/negocios/export`
4. Configure a atualização automática

### Opção 2: Via n8n (Recomendado)

1. Configure um workflow no n8n que busca dados da API
2. Transforme os dados conforme necessário
3. Envie para um dataset do Power BI via API
4. Configure agendamento no n8n

### Opção 3: Export para CSV/Excel

1. Configure n8n para buscar dados
2. Use o node **Spreadsheet** para gerar arquivo
3. Salve em local acessível pelo Power BI
4. Configure Power BI para ler o arquivo

## Exemplo de Workflow Completo n8n

```json
{
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300],
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 24
            }
          ]
        }
      }
    },
    {
      "name": "Buscar Negócios",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "url": "http://localhost:3000/api/integrations/negocios/export",
        "options": {}
      }
    },
    {
      "name": "Processar Dados",
      "type": "n8n-nodes-base.code",
      "position": [650, 300],
      "parameters": {
        "jsCode": "const data = $input.first().json.data;\nreturn data.map(item => ({ json: item }));"
      }
    },
    {
      "name": "Enviar para Power BI",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.powerbi.com/v1.0/myorg/datasets/YOUR_DATASET_ID/rows",
        "authentication": "genericCredentialType",
        "genericAuthType": "bearerTokenAuth",
        "options": {}
      }
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [[{ "node": "Buscar Negócios", "type": "main", "index": 0 }]]
    },
    "Buscar Negócios": {
      "main": [[{ "node": "Processar Dados", "type": "main", "index": 0 }]]
    },
    "Processar Dados": {
      "main": [[{ "node": "Enviar para Power BI", "type": "main", "index": 0 }]]
    }
  }
}
```

## Testando os Endpoints

Use curl ou Postman para testar:

```bash
# Testar endpoint de clientes
curl http://localhost:3000/api/integrations/clientes/export

# Testar endpoint de negócios com filtro de data
curl "http://localhost:3000/api/integrations/negocios/export?dataInicio=2024-01-01"

# Testar resumo do dashboard
curl http://localhost:3000/api/integrations/dashboard/resumo
```

## Segurança

⚠️ **Importante:** Para produção, adicione autenticação aos endpoints:

1. Implementar API Key
2. Usar JWT tokens
3. Configurar CORS adequadamente
4. Usar HTTPS

## Próximos Passos

1. ✅ Endpoints criados
2. Configure o n8n com os workflows desejados
3. Teste a integração
4. Configure o Power BI para consumir os dados
5. Adicione autenticação se necessário
