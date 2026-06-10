# ImobSys — Guia do Back-end

Documento único que consolida:

1. O **resumo da refatoração** executada para levar o MVP a um patamar próximo de produção.
2. O **guia de integração para o Front-end**, com referência completa de endpoints, contratos JSON, regras de validação, máquina de estados e exemplos de fluxo.

---

## Sumário

1. [Resumo da Refatoração](#1-resumo-da-refatoração)
2. [Stack e Arquitetura](#2-stack-e-arquitetura)
3. [Como Executar](#3-como-executar)
4. [Autenticação](#4-autenticação)
5. [Padrão de Respostas de Erro](#5-padrão-de-respostas-de-erro)
6. [Enums de Domínio](#6-enums-de-domínio)
7. [Máquina de Estados da Proposta](#7-máquina-de-estados-da-proposta)
8. [Referência de Endpoints](#8-referência-de-endpoints)
   - 8.1 [Auth](#81-auth)
   - 8.2 [Corretor](#82-corretor)
   - 8.3 [Cliente](#83-cliente)
   - 8.4 [Imóvel](#84-imóvel)
   - 8.5 [Proposta (Área Privada)](#85-proposta-área-privada)
   - 8.6 [Proposta (Área Pública)](#86-proposta-área-pública)
9. [Fluxo End-to-End de Exemplo](#9-fluxo-end-to-end-de-exemplo)
10. [Console H2](#10-console-h2)
11. [CORS](#11-cors)
12. [Checklist para o Front-end](#12-checklist-para-o-front-end)

---

## 1. Resumo da Refatoração

A base anterior era um CRUD básico, sem autenticação, sem validações, sem enumerações e sem regras de negócio reais. Esta refatoração transformou o back-end em um MVP funcional.

### Pacotes novos

| Pacote                 | Propósito                                                   |
| ---------------------- | ----------------------------------------------------------- |
| `enums/`               | Enumerações de domínio (Status, Tipo, Forma de Pagamento)   |
| `exception/`           | Exceções customizadas e `@RestControllerAdvice` global      |
| `security/`            | `UserDetailsService` que carrega o `Corretor` pelo e-mail   |
| `config/`              | `SecurityConfig` com HTTP Basic, BCrypt e CORS              |

### Resumo por número

| Categoria          | Quantidade |
| ------------------ | ---------- |
| Enums criados      | 5          |
| Exceções + handler | 4          |
| DTOs (incl. Update/Public/Auth/Error) | 16 |
| Entidades atualizadas | 4       |
| Repositories estendidos | 3      |
| Services           | 5 (1 novo + 4 refatorados) |
| Controllers        | 6 (2 novos + 4 refatorados) |
| Endpoints expostos | 26         |

### Principais decisões

- **HTTP Basic + BCrypt** em vez de JWT. Stateless, sem dependências adicionais, suficiente para MVP.
- **`@JsonIgnore` em `Corretor.senha`** garante que o hash nunca vaze em respostas.
- **`@CreationTimestamp` / `@UpdateTimestamp`** automatizam `dataCadastro`, `dataCriacao` e `dataAtualizacao`.
- **`FetchType.LAZY`** em todas as relações `@ManyToOne` para evitar N+1.
- **Máquina de estados embutida no enum `StatusProposta`** (`podeTransitarPara`, `ehTerminal`, `ehEditavel`). Transições inválidas viram `BusinessRuleException` → HTTP 422.
- **Side effect explícito**: aceitar proposta muda `Imovel.status` para `EM_NEGOCIACAO`. Cancelar/recusar libera o imóvel.
- **`GlobalExceptionHandler` cobre 11 cenários** distintos com payload padronizado.
- **Validações de unicidade aplicadas no service** (não só na DB) para retornar mensagens amigáveis antes do constraint estourar.
- **CORS centralizado** no `SecurityConfig` (em vez de `@CrossOrigin` espalhado).

### Validação

`mvn clean test`: **BUILD SUCCESS**, 49 arquivos compilados, contexto Spring inicia, schema JPA é gerado corretamente.

---

## 2. Stack e Arquitetura

| Camada         | Tecnologia                                      |
| -------------- | ----------------------------------------------- |
| Linguagem      | Java 21                                         |
| Framework      | Spring Boot 4.0.6 (Spring Framework 7.x)        |
| Persistência   | Spring Data JPA + Hibernate                     |
| Banco de dados | H2 (in-memory, profile dev)                     |
| Segurança      | Spring Security + BCrypt + HTTP Basic Auth      |
| Validação      | Jakarta Bean Validation (Hibernate Validator)   |
| Build          | Maven 3 (com `mvnw`)                            |
| Boilerplate    | Lombok (`@Data`, construtores)                  |

### Organização em camadas

```
controller  →  service  →  repository  →  model (entidade)
     ↓             ↑           ↑               ↑
   DTO         DTO ↔ entity   JPA          @Entity
```

Toda comunicação entre o front-end e os controllers acontece exclusivamente via DTOs (Java Records). Entidades JPA nunca são serializadas diretamente.

---

## 3. Como Executar

```bash
# Linux / macOS
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

A aplicação sobe em `http://localhost:8080` por padrão.

**Banco**: H2 em memória, recriado a cada reinicialização (`ddl-auto: create-drop`). Não há persistência entre execuções.

---

## 4. Autenticação

### Modelo

O back-end usa **HTTP Basic Authentication** sobre TLS (em produção). O front-end deve:

1. Coletar e-mail e senha do corretor.
2. Chamar `POST /api/auth/login` para validar as credenciais.
3. Guardar as credenciais no armazenamento do client (preferencialmente em memória ou `sessionStorage`, **nunca em `localStorage` em produção**).
4. Em todas as chamadas privadas subsequentes, enviar o header:

```
Authorization: Basic <base64(email:senha)>
```

### Endpoints públicos (sem auth)

- `POST /api/auth/login`
- `POST /api/corretores` (cadastro inicial)
- `GET /api/propostas/publico/{id}` e ações relacionadas
- `GET /h2-console/**`

Todos os demais endpoints **exigem** o header `Authorization: Basic`.

### Exemplo em JavaScript

```js
// 1. Login
const loginRes = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'ana@imob.com', senha: 'senha123' }),
});
if (!loginRes.ok) throw new Error('Credenciais inválidas');
const corretor = await loginRes.json();

// 2. Guardar credenciais (sessionStorage neste exemplo)
const basicAuth = 'Basic ' + btoa('ana@imob.com:senha123');
sessionStorage.setItem('imobsys:auth', basicAuth);

// 3. Chamadas privadas subsequentes
const clientes = await fetch('http://localhost:8080/api/clientes', {
  headers: { Authorization: sessionStorage.getItem('imobsys:auth') },
}).then(r => r.json());
```

### Códigos relacionados

| Código | Quando ocorre                                          |
| ------ | ------------------------------------------------------ |
| 200    | Login bem-sucedido                                     |
| 400    | Email ou senha em formato inválido                     |
| 401    | Credenciais erradas ou header `Authorization` ausente  |
| 403    | Autenticado, mas sem permissão (raro neste MVP)        |

---

## 5. Padrão de Respostas de Erro

Todo erro gerado pelo back-end retorna o mesmo formato JSON (`ErrorResponseDTO`):

```json
{
  "timestamp": "2026-05-16T13:55:42.123",
  "status": 422,
  "error": "Regra de negócio violada",
  "message": "Transição inválida: ACEITA → RASCUNHO.",
  "path": "/api/propostas/abc-123/status",
  "fieldErrors": null
}
```

Quando o erro é de validação de campos, `fieldErrors` é preenchido:

```json
{
  "timestamp": "2026-05-16T13:56:11.987",
  "status": 400,
  "error": "Erro de validação",
  "message": "Um ou mais campos da requisição são inválidos.",
  "path": "/api/clientes",
  "fieldErrors": [
    { "field": "cpf", "message": "O CPF deve conter exatamente 11 dígitos numéricos (sem pontuação)." },
    { "field": "nome", "message": "O nome é obrigatório." }
  ]
}
```

### Tabela de status HTTP usados

| Status | Significado                                                    |
| ------ | -------------------------------------------------------------- |
| 200    | OK — operação bem-sucedida                                     |
| 201    | Created — recurso criado (responde com o recurso)              |
| 204    | No Content — `DELETE` bem-sucedido                             |
| 400    | Bad Request — validação, JSON malformado, enum inválido        |
| 401    | Unauthorized — sem credenciais ou credenciais erradas          |
| 403    | Forbidden — autenticado mas sem permissão                      |
| 404    | Not Found — recurso inexistente                                |
| 409    | Conflict — duplicidade de CPF/e-mail/matrícula                 |
| 422    | Unprocessable Content — regra de negócio violada (state machine) |
| 500    | Internal Server Error — falha inesperada                       |

---

## 6. Enums de Domínio

O front-end deve enviar e renderizar exatamente estes valores (case-sensitive).

### `TipoImovel`

```
APARTAMENTO, CASA, COBERTURA, KITNET, TERRENO, SALA_COMERCIAL, GALPAO, CHACARA
```

### `StatusImovel`

```
DISPONIVEL, RESERVADO, EM_NEGOCIACAO, VENDIDO, ALUGADO, INDISPONIVEL
```

Default ao criar um imóvel sem informar o status: `DISPONIVEL`.

### `TipoProposta`

```
VENDA, ALUGUEL
```

### `StatusProposta`

```
RASCUNHO, PENDENTE_ACEITACAO, ACEITA, RECUSADA, AJUSTE_SOLICITADO, EXPIRADA, CANCELADA
```

### `FormaPagamento`

```
A_VISTA, FINANCIAMENTO_BANCARIO, CONSORCIO, PERMUTA, ENTRADA_PARCELAMENTO
```

---

## 7. Máquina de Estados da Proposta

```
                       (corretor envia)
        RASCUNHO ───────────────────────► PENDENTE_ACEITACAO
            │                                     │
            │                                     ├──► ACEITA  ──► Imóvel = EM_NEGOCIACAO
            │                                     ├──► RECUSADA
            │                                     ├──► AJUSTE_SOLICITADO ──► (volta a PENDENTE)
            │                                     └──► EXPIRADA / CANCELADA
            │
            └──► CANCELADA
```

### Tabela de transições permitidas

| Estado atual         | Transições válidas                                                   |
| -------------------- | -------------------------------------------------------------------- |
| `RASCUNHO`           | `PENDENTE_ACEITACAO`, `CANCELADA`                                    |
| `PENDENTE_ACEITACAO` | `ACEITA`, `RECUSADA`, `AJUSTE_SOLICITADO`, `EXPIRADA`, `CANCELADA`   |
| `AJUSTE_SOLICITADO`  | `PENDENTE_ACEITACAO`, `CANCELADA`                                    |
| `ACEITA`             | (terminal — nenhuma)                                                 |
| `RECUSADA`           | (terminal — nenhuma)                                                 |
| `EXPIRADA`           | (terminal — nenhuma)                                                 |
| `CANCELADA`          | (terminal — nenhuma)                                                 |

### Regras de UI derivadas

- **Botão "Editar"**: visível apenas se `status ∈ { RASCUNHO, AJUSTE_SOLICITADO }`.
- **Botão "Enviar"**: visível apenas se `status ∈ { RASCUNHO, AJUSTE_SOLICITADO }`.
- **Botão "Cancelar"**: visível enquanto `status` não for terminal.
- **Botão "Excluir"**: visível apenas se `status ∈ { RASCUNHO, CANCELADA, RECUSADA }`.
- **Página pública (link enviado ao cliente)**: só carrega se `status ≠ RASCUNHO`.
- **Botões "Aceitar/Recusar/Solicitar ajuste" (cliente)**: visíveis apenas se `status == PENDENTE_ACEITACAO` ou `AJUSTE_SOLICITADO`.

### Validade

Toda proposta tem um campo `validade` (`LocalDate`). Quando o corretor tenta transitar uma proposta cuja `validade` já passou, o back-end automaticamente marca como `EXPIRADA` e retorna 422.

---

## 8. Referência de Endpoints

Base URL: `http://localhost:8080`

Convenções:
- `*` = autenticação obrigatória (HTTP Basic).
- `°` = público (sem autenticação).
- IDs são `UUID` em formato string (ex.: `"5f0e2b6e-1c4f-4d3a-9b8c-2e1d3a4b5c6d"`).

---

### 8.1 Auth

#### `POST /api/auth/login` °

Valida credenciais do corretor. Retorna os dados básicos do usuário autenticado. Nas chamadas subsequentes, o front-end deve enviar `Authorization: Basic <base64(email:senha)>`.

**Request**

```json
{
  "email": "ana@imob.com",
  "senha": "senha123"
}
```

**Response 200**

```json
{
  "corretorId": "5f0e2b6e-1c4f-4d3a-9b8c-2e1d3a4b5c6d",
  "nome": "Ana Souza",
  "email": "ana@imob.com",
  "mensagem": "Autenticação realizada com sucesso. Utilize HTTP Basic Auth (e-mail/senha) nas próximas requisições."
}
```

**Erros**

- `400` — email/senha mal formatados
- `401` — credenciais inválidas

---

### 8.2 Corretor

#### `POST /api/corretores` °  (cadastro inicial, único endpoint público de corretor)

**Request**

```json
{
  "nome": "Ana Souza",
  "rg": "12.345.678-9",
  "cpf": "12345678901",
  "email": "ana@imob.com",
  "telefone": "+5511999990000",
  "senha": "senha123"
}
```

**Validações**

| Campo    | Regra                                                    |
| -------- | -------------------------------------------------------- |
| nome     | obrigatório, 2–120 caracteres                            |
| cpf      | obrigatório, exatamente 11 dígitos numéricos             |
| email    | obrigatório, formato de e-mail                           |
| senha    | obrigatória, 6–100 caracteres (armazenada como hash BCrypt) |

**Response 201**

```json
{
  "id": "5f0e2b6e-1c4f-4d3a-9b8c-2e1d3a4b5c6d",
  "nome": "Ana Souza",
  "rg": "12.345.678-9",
  "cpf": "12345678901",
  "email": "ana@imob.com",
  "telefone": "+5511999990000"
}
```

(A senha **nunca** é retornada.)

**Erros**

- `400` — validações falharam (`fieldErrors`)
- `409` — CPF ou e-mail já cadastrados

---

#### `GET /api/corretores` *

Lista todos os corretores.

**Response 200** — `CorretorResponseDTO[]`

---

#### `GET /api/corretores/{id}` *

Busca corretor por ID.

**Response 200** — `CorretorResponseDTO`
**Erros** — `404` se não encontrado

---

#### `PUT /api/corretores/{id}` *

Atualização completa (exceto senha e CPF, que não podem ser alterados aqui).

**Request** — `CorretorUpdateDTO`

```json
{
  "nome": "Ana Maria Souza",
  "rg": "12.345.678-9",
  "email": "ana.maria@imob.com",
  "telefone": "+5511988887777"
}
```

**Response 200** — `CorretorResponseDTO`

---

#### `PATCH /api/corretores/{id}` *

Atualização parcial. Envie apenas os campos que deseja alterar.

---

#### `DELETE /api/corretores/{id}` *

**Response 204** (sem corpo).

---

### 8.3 Cliente

#### `POST /api/clientes` *

**Request**

```json
{
  "nome": "João da Silva",
  "rg": "98.765.432-1",
  "cpf": "98765432100",
  "email": "joao@email.com",
  "telefone": "+5511977776666",
  "renda": 8500.00
}
```

**Validações**

| Campo  | Regra                                       |
| ------ | ------------------------------------------- |
| nome   | obrigatório, 2–120 caracteres               |
| cpf    | obrigatório, exatamente 11 dígitos          |
| email  | opcional, formato de e-mail                 |
| renda  | opcional, ≥ 0                               |

**Response 201**

```json
{
  "id": "c1a2b3d4-e5f6-7890-abcd-ef1234567890",
  "nome": "João da Silva",
  "rg": "98.765.432-1",
  "cpf": "98765432100",
  "email": "joao@email.com",
  "telefone": "+5511977776666",
  "renda": 8500.00,
  "dataCadastro": "2026-05-16T13:45:22.456"
}
```

**Erros**

- `400` — validações
- `409` — CPF/e-mail duplicados

---

#### `GET /api/clientes` *

Lista todos.

#### `GET /api/clientes/{id}` *

Busca por ID. `404` se não existe.

#### `PUT /api/clientes/{id}` *

Atualização completa (mesmo payload de `POST`).

#### `PATCH /api/clientes/{id}` *

Atualização parcial (`ClienteUpdateDTO`). CPF não pode ser alterado por PATCH.

```json
{ "telefone": "+5511966665555", "renda": 9200.00 }
```

#### `DELETE /api/clientes/{id}` *

**Response 204**.

---

### 8.4 Imóvel

#### `POST /api/imoveis` *

**Request**

```json
{
  "tipo": "APARTAMENTO",
  "status": "DISPONIVEL",
  "matricula": 102345,
  "metragem": 85.5,
  "valorMinimo": 480000.00,
  "valorMaximo": 520000.00,
  "valorIptu": 1200.00,
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310-100",
  "endereco": "Av. Paulista, 1500, ap. 92",
  "qtdComodos": 3,
  "qtdBanheiros": 2,
  "particularidades": "Vista para o parque, varanda gourmet.",
  "vistoriaRealizada": true
}
```

**Validações**

| Campo        | Regra                                            |
| ------------ | ------------------------------------------------ |
| tipo         | obrigatório, enum `TipoImovel`                   |
| status       | opcional (default `DISPONIVEL`)                  |
| matricula    | opcional, positivo, único no sistema             |
| metragem     | opcional, > 0                                    |
| valor*       | opcional, ≥ 0                                    |
| cep          | opcional, máximo 9 caracteres                    |
| qtd*         | opcional, ≥ 0                                    |

**Response 201** — `ImovelResponseDTO`

**Erros**

- `409` — matrícula duplicada

---

#### `GET /api/imoveis` *

Lista todos.

#### `GET /api/imoveis/{id}` *

Busca por ID.

#### `PUT /api/imoveis/{id}` *

Atualização completa.

#### `PATCH /api/imoveis/{id}` *

Atualização parcial (`ImovelUpdateDTO` — campos opcionais).

#### `PATCH /api/imoveis/{id}/status` *

Atualiza apenas o status do imóvel.

**Request**

```json
{ "status": "RESERVADO" }
```

**Response 200** — `ImovelResponseDTO`

#### `DELETE /api/imoveis/{id}` *

**Response 204**.
**Erros** — `409` se o imóvel está em `EM_NEGOCIACAO`, `VENDIDO` ou `ALUGADO`.

---

### 8.5 Proposta (Área Privada)

Todos os endpoints abaixo exigem autenticação do corretor.

#### `POST /api/propostas` *

Cria uma proposta com status inicial `RASCUNHO`. Se `validade` não for informada, será `LocalDate.now() + 7 dias`.

**Request**

```json
{
  "imovelId": "i1...",
  "clienteId": "c1...",
  "corretorId": "co1...",
  "tipo": "VENDA",
  "valor": 500000.00,
  "formaPagamento": "FINANCIAMENTO_BANCARIO",
  "validade": "2026-06-15",
  "termos": "Pagamento à vista de 20% como entrada, restante financiado em até 360 meses."
}
```

**Validações**

| Campo          | Regra                                     |
| -------------- | ----------------------------------------- |
| imovelId       | obrigatório (deve existir)                |
| clienteId      | obrigatório (deve existir)                |
| corretorId     | obrigatório (deve existir)                |
| tipo           | obrigatório, enum `TipoProposta`          |
| valor          | obrigatório, > 0                          |
| formaPagamento | opcional, enum `FormaPagamento`           |
| validade       | opcional, hoje ou futuro                  |

**Response 201** — `PropostaResponseDTO`

```json
{
  "id": "p1...",
  "tipo": "VENDA",
  "status": "RASCUNHO",
  "valor": 500000.00,
  "formaPagamento": "FINANCIAMENTO_BANCARIO",
  "validade": "2026-06-15",
  "termos": "Pagamento à vista...",
  "observacaoAjuste": null,
  "dataCriacao": "2026-05-16T14:00:00",
  "dataAtualizacao": "2026-05-16T14:00:00",
  "nomeCliente": "João da Silva",
  "telefoneCliente": "+5511977776666",
  "descricaoImovel": "APARTAMENTO em São Paulo",
  "nomeCorretor": "Ana Souza"
}
```

**Erros**

- `404` — algum dos três IDs não existe
- `422` — imóvel está `VENDIDO` ou `ALUGADO`

---

#### `GET /api/propostas` *

Lista todas as propostas (todos os corretores). Considere paginação no futuro.

#### `GET /api/propostas/{id}` *

Busca por ID. `404` se não existe.

---

#### `PUT /api/propostas/{id}` *  e  `PATCH /api/propostas/{id}` *

Atualização (completa ou parcial). **Só funciona** se `status ∈ { RASCUNHO, AJUSTE_SOLICITADO }`.

**Request** (`PropostaUpdateDTO`)

```json
{
  "valor": 495000.00,
  "termos": "Entrada de 15% após revisão solicitada pelo cliente.",
  "validade": "2026-07-01"
}
```

**Erros**

- `422` — proposta em estado não editável

---

#### `PATCH /api/propostas/{id}/status?novoStatus=...` *

Transição "manual" de estado (respeita máquina de estados). Útil quando o corretor precisa forçar uma transição via UI de administração.

**Exemplo**: `PATCH /api/propostas/abc/status?novoStatus=CANCELADA`

**Erros**

- `422` — transição inválida pela máquina de estados

---

#### `POST /api/propostas/{id}/enviar` *

Atalho semântico: `RASCUNHO`/`AJUSTE_SOLICITADO` → `PENDENTE_ACEITACAO`. Após esta chamada, o link público (`/api/propostas/publico/{id}`) está apto a ser compartilhado com o cliente.

**Response 200** — `PropostaResponseDTO`

---

#### `POST /api/propostas/{id}/cancelar` *

Cancela a proposta. Se o imóvel estava `EM_NEGOCIACAO` ou `RESERVADO` por causa desta proposta, ele volta para `DISPONIVEL`.

---

#### `DELETE /api/propostas/{id}` *

Apaga a proposta. **Só permitido** se `status ∈ { RASCUNHO, CANCELADA, RECUSADA }`.

**Response 204**.

---

### 8.6 Proposta (Área Pública)

**Estes endpoints não exigem autenticação.** São acessados pelo cliente final via o link compartilhado pelo corretor (otimizado para mobile).

A página pública só carrega propostas que **já foram enviadas** (status ≠ `RASCUNHO`).

---

#### `GET /api/propostas/publico/{id}` °

Carrega os dados da proposta para o cliente. Retorna um DTO específico (`PropostaPublicaDTO`) que **não expõe** dados sensíveis do corretor além de nome, telefone e e-mail (necessários para contato), e não expõe outros clientes/propostas.

**Response 200**

```json
{
  "id": "p1...",
  "tipo": "VENDA",
  "status": "PENDENTE_ACEITACAO",
  "valor": 500000.00,
  "formaPagamento": "FINANCIAMENTO_BANCARIO",
  "validade": "2026-06-15",
  "termos": "Pagamento à vista...",
  "observacaoAjuste": null,
  "nomeCorretor": "Ana Souza",
  "telefoneCorretor": "+5511999990000",
  "emailCorretor": "ana@imob.com",
  "descricaoImovel": "APARTAMENTO em São Paulo",
  "enderecoImovel": "Av. Paulista, 1500, ap. 92",
  "cidadeImovel": "São Paulo",
  "metragemImovel": 85.5,
  "qtdComodosImovel": 3,
  "qtdBanheirosImovel": 2
}
```

**Erros**

- `404` — proposta não existe
- `422` — proposta ainda está em `RASCUNHO` (não foi enviada ao cliente)

---

#### `POST /api/propostas/publico/{id}/aceitar` °

Cliente aceita a proposta.

- `status` muda para `ACEITA`.
- `Imovel.status` passa para `EM_NEGOCIACAO` (efeito colateral automático).

**Response 200** — `PropostaPublicaDTO`

**Erros**

- `422` — proposta não está em `PENDENTE_ACEITACAO`

---

#### `POST /api/propostas/publico/{id}/recusar` °

Cliente recusa. `status → RECUSADA`. Imóvel permanece disponível.

---

#### `POST /api/propostas/publico/{id}/solicitar-ajuste` °

Cliente solicita alterações nas condições.

**Request**

```json
{ "observacao": "Aceito, mas precisaria de prazo maior para a entrada — 90 dias em vez de 30." }
```

**Validações**

- `observacao`: obrigatória, 10–2000 caracteres

**Comportamento**

- `status → AJUSTE_SOLICITADO`
- `observacaoAjuste` é gravada no banco.
- O corretor recebe esta observação ao consultar a proposta (`GET /api/propostas/{id}`) e pode editar (`PUT`/`PATCH`) e reenviar (`POST .../enviar`).

---

## 9. Fluxo End-to-End de Exemplo

### Cenário

Cadastrar um corretor, autenticá-lo, cadastrar um imóvel e um cliente, criar e enviar uma proposta, e simular o cliente aceitando pelo link público.

```bash
# 0) Variáveis de conveniência
HOST=http://localhost:8080
AUTH="ana@imob.com:senha123"

# 1) Cadastrar corretor (PÚBLICO)
curl -s -X POST $HOST/api/corretores \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana Souza","cpf":"12345678901","email":"ana@imob.com","senha":"senha123"}'

# 2) Login (opcional — só valida credenciais)
curl -s -X POST $HOST/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@imob.com","senha":"senha123"}'

# 3) Cadastrar cliente (PRIVADO)
CLIENTE_ID=$(curl -s -u $AUTH -X POST $HOST/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","cpf":"98765432100","email":"joao@email.com"}' | jq -r .id)

# 4) Cadastrar imóvel (PRIVADO)
IMOVEL_ID=$(curl -s -u $AUTH -X POST $HOST/api/imoveis \
  -H "Content-Type: application/json" \
  -d '{"tipo":"APARTAMENTO","matricula":1001,"metragem":85,"cidade":"SP","valorMinimo":480000}' | jq -r .id)

# 5) Obter ID do corretor
CORRETOR_ID=$(curl -s -u $AUTH $HOST/api/corretores | jq -r '.[0].id')

# 6) Criar proposta (status RASCUNHO)
PROP_ID=$(curl -s -u $AUTH -X POST $HOST/api/propostas \
  -H "Content-Type: application/json" \
  -d "{\"imovelId\":\"$IMOVEL_ID\",\"clienteId\":\"$CLIENTE_ID\",\"corretorId\":\"$CORRETOR_ID\",\"tipo\":\"VENDA\",\"valor\":500000}" | jq -r .id)

# 7) Enviar proposta (RASCUNHO -> PENDENTE_ACEITACAO)
curl -s -u $AUTH -X POST $HOST/api/propostas/$PROP_ID/enviar

# 8) Compartilhar o link: $HOST/api/propostas/publico/$PROP_ID
#    Cliente abre no celular, vê os dados (PÚBLICO):
curl -s $HOST/api/propostas/publico/$PROP_ID

# 9) Cliente aceita (PÚBLICO) — Imóvel automaticamente vira EM_NEGOCIACAO
curl -s -X POST $HOST/api/propostas/publico/$PROP_ID/aceitar

# 10) Corretor confere status final
curl -s -u $AUTH $HOST/api/propostas/$PROP_ID
curl -s -u $AUTH $HOST/api/imoveis/$IMOVEL_ID
```

### Cenário alternativo: cliente solicita ajuste

```bash
# Cliente solicita ajuste em vez de aceitar
curl -s -X POST $HOST/api/propostas/publico/$PROP_ID/solicitar-ajuste \
  -H "Content-Type: application/json" \
  -d '{"observacao":"Preciso de prazo maior — 90 dias para a entrada."}'

# Corretor consulta a proposta e vê a observação
curl -s -u $AUTH $HOST/api/propostas/$PROP_ID

# Corretor edita os termos
curl -s -u $AUTH -X PATCH $HOST/api/propostas/$PROP_ID \
  -H "Content-Type: application/json" \
  -d '{"termos":"Entrada em 90 dias após assinatura.","valor":495000}'

# Corretor reenvia ao cliente
curl -s -u $AUTH -X POST $HOST/api/propostas/$PROP_ID/enviar
```

---

## 10. Console H2

Disponível em `http://localhost:8080/h2-console`.

| Campo            | Valor                                          |
| ---------------- | ---------------------------------------------- |
| JDBC URL         | `jdbc:h2:mem:imobsys`                          |
| User Name        | `sa`                                           |
| Password         | *(vazio)*                                      |
| Driver Class     | `org.h2.Driver`                                |

> Em produção este endpoint deve ser desabilitado (`spring.h2.console.enabled=false`).

---

## 11. CORS

Configurado no `SecurityConfig` para aceitar requisições de qualquer origem em todos os métodos (`GET, POST, PUT, PATCH, DELETE, OPTIONS`) com `Allow-Credentials: true`.

**Em produção**, restringir `allowedOriginPatterns` ao domínio real do front-end.

---

## 12. Checklist para o Front-end

Use isso como roteiro ao integrar:

- [ ] Implementar tela de login que chama `POST /api/auth/login`.
- [ ] Após login, armazenar `Basic <base64>` em `sessionStorage` (ou contexto).
- [ ] Interceptor HTTP que injeta o header `Authorization` em todas as chamadas privadas.
- [ ] Tratar 401 globalmente (redirecionar para tela de login).
- [ ] Renderizar `fieldErrors` do `ErrorResponseDTO` no formulário correspondente.
- [ ] Renderizar `error` + `message` em toasts/alertas para os demais erros (404/409/422/500).
- [ ] Tela de catálogo de imóveis: `GET /api/imoveis` + filtro por `status`.
- [ ] Tela de cadastro de cliente: `POST /api/clientes` com validações espelhando as do back.
- [ ] Tela de nova proposta: dropdowns alimentados por `GET /api/imoveis` e `GET /api/clientes`; usar enums fixos para `TipoProposta` e `FormaPagamento`.
- [ ] Detalhe da proposta: exibir botões "Editar/Enviar/Cancelar/Excluir" conforme a regra de UI da seção 7.
- [ ] Quando a proposta é enviada, gerar o link `/{front-end}/proposta/{id}` ou apontar direto para o endpoint público.
- [ ] Página pública (mobile-first): consumir `GET /api/propostas/publico/{id}`, com os três botões de ação.
- [ ] Modal "Solicitar Ajuste" com `textarea` (10–2000 caracteres) que envia para `POST /api/propostas/publico/{id}/solicitar-ajuste`.
- [ ] Tela "Acompanhamento" para o corretor: poll periódico em `GET /api/propostas/{id}` para refletir mudanças de status feitas pelo cliente.
