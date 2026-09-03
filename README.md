# ⚙️ Traveline — Back-end

> Camada de serviço e API responsável pela regra de negócios, autenticação e gerenciamento de dados do SaaS **Traveline**.

---

## 🚀 Sobre o Módulo

Este diretório contém a API e a arquitetura de servidores do Traveline. O sistema foi desenvolvido para processar operações pesadas de agências de turismo, como a gestão de múltiplos usuários, manipulação de agendas em tempo real, controle de reservas e comunicação com o banco de dados estruturado (documentado em `docs/01-db`).

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem / Runtime:** [Node.js / Java]
* **Framework:** [Express / Spring Boot / html / css / js]
* **Banco de Dados:** [MySQL]

---

## 🗂️ Estrutura de Pastas

```text
src/backend/
├── src/
│   ├── controllers/   # Controladores das rotas (recebem as requisições)
│   ├── models/        # Modelos de mapeamento do banco de dados
│   ├── routes/        # Definição dos endpoints da API
│   ├── services/      # Regras de negócio da aplicação
│   └── server.js      # Ponto de entrada da aplicação
├── .env.example       # Exemplo de variáveis de ambiente
└── package.json       # Dependências do projeto
