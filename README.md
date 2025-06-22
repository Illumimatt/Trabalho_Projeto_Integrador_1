## **Documentação do Projeto: Fala, CEUB\!**

### **1. Visão Geral do Projeto**

  * **O que é?**
      * O "Fala, CEUB\!" é uma plataforma de feedback teorica desenvolvida para a comunidade acadêmica do CEUB. O objetivo é criar um canal de comunicação centralizado e seguro onde os alunos podem expressar suas opiniões sobre diversos aspectos da instituição.
  * **O Problema que Resolve:**
      * Centraliza feedbacks que estariam espalhados em redes sociais ou grupos, permitindo que tanto os alunos quanto a administração tenham uma visão clara dos pontos fortes e das áreas que necessitam de melhoria.
  * **Público-Alvo:**
      * Alunos do CEUB (usuários principais) e administração da faculdade (que pode visualizar os feedbacks e agir sobre eles).

### **2. Funcionalidades Principais**

  * **Autenticação de Usuários:**
      * Criação de conta e login (restrito a e-mails `@sempreceub` para garantir que apenas alunos participem).
      * Sistema de sessão simples usando `localStorage`.
  * **Sistema de Feedback (Três Tipos):**
      * **Avaliar:** Permite que os alunos deem uma nota (de 1 a 5 estrelas) e um comentário sobre locais, serviços ou equipamentos.
      * **Reclamar:** Permite o envio de reclamações formais, que podem ser anônimas.
      * **Sugerir:** Permite o envio de sugestões de melhoria.
  * **Visualização de Feedbacks:**
      * Páginas para listar sugestões, reclamações recentes (pendentes) e reclamações resolvidas.
  * **Ranking:**
      * Página de "Melhores Avaliados" com um pódio para o Top 3 e uma tabela de classificação baseada na nota média das avaliações.

### **3. Tecnologias Utilizadas**

  * **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS)
  * **Backend:** Node.js com o framework Express.js
  * **Banco de Dados:** Supabase (que utiliza PostgreSQL)

### **4. Configuração do Ambiente de Desenvolvimento**

  * **Pré-requisitos:**
      * Node.js (versão 18 ou superior)
      * npm (geralmente instalado com o Node.js)
      * Uma conta no Supabase com um projeto criado.
  * **Passos para Instalação:**
    1.  Clone o repositório: `git clone <URL_DO_SEU_REPOSITORIO>`
    2.  Navegue até a pasta do projeto: `cd fala-ceub`
    3.  Instale as dependências do backend: `npm install`
    4.  Crie um arquivo `.env` na raiz do projeto e adicione suas chaves do Supabase:
        ```
        SUPABASE_URL=URL_DO_SEU_PROJETO_SUPABASE
        SUPABASE_KEY=SUA_CHAVE_ANON_SUPABASE
        ```
    5.  Execute os scripts SQL (que criamos para as tabelas e funções) no SQL Editor do seu projeto Supabase para configurar o banco de dados.
    6.  Inicie o servidor backend: `node server.js` (ou o nome do seu arquivo principal).
    7.  Abra os arquivos HTML (`index.html`, etc.) em um servidor local (como a extensão "Live Server" do VS Code).

### **5. Estrutura de Pastas**

```
/
├── css/
│   ├── avalie.css
│   ├── criarconta.css
│   ├── login.css
│   └── ... (outros arquivos CSS)
├── js/
│   ├── avalie.js
│   ├── melhores-avaliados.js
│   └── ... (outros arquivos JS)
├── pages/
│   ├── avalie.html
│   ├── melhores-avaliados.html
│   └── ... (outros arquivos HTML)
├── assets/
│   └── icons/
│       └── ... (ícones SVG)
├── index.html
├── server.js (ou seu arquivo principal do backend)
├── package.json
└── README.md (este arquivo de documentação)
```

### **6. Documentação da API**

### **6.1. Autenticação e Usuários**

Esta seção cobre o cadastro, login e verificação de usuários.

#### **`[POST] /api/usuarios`**

  * **Descrição:** Cadastra um novo usuário no sistema.
  * **Corpo da Requisição (JSON):**
    ```json
    {
      "nome": "Nome do Aluno",
      "email": "aluno@sempreceub.br",
      "senha": "senhaSegura123"
    }
    ```
  * **Campos Obrigatórios:** `nome`, `email`, `senha`.
  * **Resposta de Sucesso (201 Created):**
    ```json
    {
      "mensagem": "Usuário cadastrado com sucesso!",
      "usuario": {
        "id": 1,
        "nome": "Nome do Aluno",
        "email": "aluno@sempreceub.br",
        "datacriacao": "2025-06-22T14:30:00.000Z"
      }
    }
    ```
  * **Respostas de Erro:**
      * **400 Bad Request:** Se faltar algum campo ou se o e-mail já estiver cadastrado.
        ```json
        { "erro": "Este email já está cadastrado" }
        ```
      * **500 Internal Server Error:** Se ocorrer um erro no banco de dados.

#### **`[POST] /api/login`**

  * **Descrição:** Autentica um usuário existente e retorna seus dados.
  * **Corpo da Requisição (JSON):**
    ```json
    {
      "email": "aluno@sempreceub.br",
      "senha": "senhaSegura123"
    }
    ```
  * **Campos Obrigatórios:** `email`, `senha`.
  * **Resposta de Sucesso (200 OK):**
    ```json
    {
      "mensagem": "Login realizado com sucesso",
      "usuario": {
        "id": 1,
        "nome": "Nome do Aluno",
        "email": "aluno@sempreceub.br",
        "datacriacao": "2025-06-22T14:30:00.000Z"
      }
    }
    ```
  * **Respostas de Erro:**
      * **400 Bad Request:** Se as credenciais (email/senha) estiverem incorretas.
        ```json
        { "erro": "Email ou senha inválidos" }
        ```
      * **500 Internal Server Error:** Se ocorrer um erro no servidor.

#### **`[POST] /api/usuarios/verificar-email`**

  * **Descrição:** Verifica se um e-mail já existe no banco de dados. Útil para validação em tempo real no formulário de cadastro.
  * **Corpo da Requisição (JSON):**
    ```json
    {
      "email": "aluno@sempreceub.br"
    }
    ```
  * **Resposta de Sucesso (200 OK):**
    ```json
    { "emailExiste": true } 
    // ou { "emailExiste": false }
    ```

-----

### **6.2. Feedbacks (Envio)**

Rotas para criar os diferentes tipos de feedback.

#### **`[POST] /api/sugestoes`**

  * **Descrição:** Cria uma nova sugestão.
  * **Corpo da Requisição (JSON):**
    ```json
    {
      "usuarioId": 1,
      "localId": 5,          // Opcional
      "texto": "Minha sugestão de melhoria...",
      "anonimo": false       // Opcional
    }
    ```
  * **Resposta de Sucesso (201 Created):** Retorna o objeto da sugestão criada.

#### **`[POST] /api/reclamacoes`**

  * **Descrição:** Cria uma nova reclamação (com status padrão 'Pendente').
  * **Corpo da Requisição (JSON):**
    ```json
    {
      "usuarioId": 1,
      "localId": 2,          // Opcional
      "texto": "Minha reclamação sobre o item...",
      "anonimo": true        // Opcional
    }
    ```
  * **Resposta de Sucesso (201 Created):** Retorna o objeto da reclamação criada.

#### **`[POST] /api/avaliacao`**

  * **Descrição:** Cria uma nova avaliação com nota.
  * **Corpo da Requisição (JSON):**
    ```json
    {
      "usuarioId": 1,
      "localId": 8,          // Opcional
      "texto": "Gostei muito, mas poderia melhorar.",
      "anonimo": false,      // Opcional
      "nota": 4.5            // Opcional
    }
    ```
  * **Resposta de Sucesso (201 Created):** Retorna o objeto da avaliação criada.

-----

### **6.3. Feedbacks (Consulta)**

Rotas para listar os feedbacks enviados.

#### **`[GET] /api/sugestoes/recentes`**

  * **Descrição:** Lista todas as sugestões, ordenadas da mais recente para a mais antiga.
  * **Resposta de Sucesso (200 OK):** Retorna um array de objetos de sugestão.
    ```json
    [
      { "id": 1, "texto": "...", "anonimo": false, "usuarioNome": "Nome do Aluno", "criadoEm": "..." },
      { "id": 2, "texto": "...", "anonimo": true, "usuarioNome": null, "criadoEm": "..." }
    ]
    ```

#### **`[GET] /api/reclamacoes/pendentes`**

  * **Descrição:** Lista todas as reclamações com `status = 'Pendente'`.
  * **Resposta de Sucesso (200 OK):** Retorna um array de objetos de reclamação.

#### **`[GET] /api/reclamacoes/resolvidas`**

  * **Descrição:** Lista todas as reclamações com `status = 'Resolvido'`.
  * **Resposta de Sucesso (200 OK):** Retorna um array de objetos de reclamação.

-----

### **6.4. Ranking e Dados Gerais**

Rotas para popular seletores e a página de ranking.

#### **`[GET] /api/ranking/melhores-avaliados`**

  * **Descrição:** Retorna a lista de locais ordenados pela maior nota média. Utiliza a função `get_melhores_avaliados` do banco de dados.
  * **Resposta de Sucesso (200 OK):**
    ```json
    [
      {
        "local_id": 10,
        "local_nome": "biblioteca_central",
        "nota_media": 4.9,
        "total_avaliacoes": 150
      },
      { ...outros locais... }
    ]
    ```

#### **`[GET] /api/categorias`**

  * **Descrição:** Retorna a lista de todas as categorias disponíveis.
  * **Resposta de Sucesso (200 OK):** Retorna um array de objetos de categoria.

#### **`[GET] /api/locais`**

  * **Descrição:** Retorna a lista de todos os locais disponíveis com o nome da sua categoria.
  * **Resposta de Sucesso (200 OK):** Retorna um array de objetos de local.

#### **`[GET] /api/locais/categoria/:categoriaId`**

  * **Descrição:** Retorna a lista de locais que pertencem a uma categoria específica.
  * **Parâmetro de Rota:** `categoriaId` (O ID da categoria).
  * **Resposta de Sucesso (200 OK):** Retorna um array de objetos de local.

### **7. Esquema do Banco de Dados**

O banco de dados do projeto é estruturado em torno de algumas tabelas principais que se relacionam para armazenar usuários, itens avaliáveis e os feedbacks.

---
#### **Tabela `usuario`**
Armazena as informações de cada usuário cadastrado na plataforma.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| **`id`** | `serial` | **Chave Primária.** Identificador único para cada usuário. |
| `nome` | `text` | Nome completo do usuário. |
| `email`| `text` | E-mail do usuário. **Único.** |
| `senha`| `text` | Senha do usuário, armazenada com hash e salt. |
| `tipo` | `varchar(20)`| Define o perfil do usuário (ex: 'Estudante', 'Professor', 'Moderador'). |
| `datacadastro`| `timestamp`| Data e hora do cadastro. Padrão: `now()`. |
| `ra` | `text` | Registro Acadêmico do aluno. **Único.** |

---
#### **Tabela `categoria`**
Funciona como uma tabela de lookup para agrupar diferentes tipos de locais.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| **`id`** | `serial` | **Chave Primária.** |
| `nome` | `text` | Nome da categoria (ex: 'sala_de_aula', 'equipamentos'). **Único.** |

---
#### **Tabela `local`**
Armazena cada item específico que pode ser alvo de um feedback.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| **`id`** | `serial` | **Chave Primária.** |
| `nome` | `text` | Nome do local (ex: 'sala_101', 'biblioteca_central'). **Único.** |
| `categoriaid`| `integer` | **Chave Estrangeira** que referencia `categoria(id)`. |

---
#### **Tabela `servicos`**
Armazena serviços específicos que podem ser avaliados e que não se encaixam necessariamente em um `local`.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| **`id`** | `bigint` | **Chave Primária.** |
| `nome` | `text` | Nome do serviço (ex: 'suporte_de_ti_helpdesk'). |

---
#### **Tabela `feedback`**
É a tabela central do sistema, armazenando todas as avaliações, reclamações e sugestões.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| **`id`** | `serial` | **Chave Primária.** |
| `usuarioid`| `integer` | **Chave Estrangeira** que referencia `usuario(id)`. |
| `localid`| `integer` | **Chave Estrangeira** que referencia `local(id)`. (Opcional) |
| `servicosid`| `bigint`| **Chave Estrangeira** que referencia `servicos(id)`. (Opcional) |
| `tipo` | `enum` | Tipo de feedback ('Avaliação', 'Reclamação', 'Sugestão'). |
| `texto`| `text` | O conteúdo do comentário do usuário. |
| `nota` | `float`| A nota de 1 a 5, usada apenas para `tipo = 'Avaliação'`. |
| `status` | `enum` | O estado de um feedback ('Pendente', 'Resolvido'). Padrão: `'Pendente'`. |
| `anonimo`| `boolean`| Se `true`, o nome do autor não deve ser exibido. Padrão: `false`.|
| `datacriacao`| `timestamp`| Data e hora de envio do feedback. Padrão: `now()`. |

---
#### **Tabela `resolucao`**
Armazena a resposta ou a solução dada a um `feedback`, geralmente a uma reclamação.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| **`id`** | `serial` | **Chave Primária.** |
| `feedbackid`| `integer` | **Chave Estrangeira** que referencia `feedback(id)`. |
| `tecnicoid`| `integer` | **Chave Estrangeira** que referencia `usuario(id)` (o moderador que resolveu). |
| `descricao`| `text` | Descrição da solução aplicada. |
| `dataresolucao`|`timestamp`| Data e hora da resolução. Padrão: `now()`. |
| `status` | `enum` | Status da moderação (ex: 'Aprovado', 'Rejeitado'). |
