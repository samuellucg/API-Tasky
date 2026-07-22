# 📝 API Tasky

API RESTful para gerenciamento de tarefas com integração ao Telegram Bot, notificações em tempo real via WebSocket e sistema de filas para processamento assíncrono.

## 🚀 Funcionalidades

- **CRUD de Tarefas**: Criar, listar, atualizar e deletar tarefas
- **Integração com Telegram Bot**: Gerencie tarefas diretamente pelo Telegram
- **Multi-usuário**: Suporte a múltiplos usuários com isolamento de dados
- **Notificações em Tempo Real**: WebSocket para atualizações instantâneas
- **Persistência em PostgreSQL**: Dados armazenados de forma segura
- **Sistema de Filas**: BullMQ + Redis para processamento assíncrono
- **Painel Admin**: Interface web para monitoramento de filas (Bull Board)

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Docker](https://www.docker.com/) e Docker Compose
- Conta no [Telegram](https://telegram.org/) e Bot Token

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/samuellucg/api-tasky.git
cd api-tasky
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Server Configuration
PORT=3000

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=seu_token_aqui
DELETE_WEBHOOK=false
CLEAN_PENDENT_MESSAGES=false
SET_WEBHOOK=true

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=tasky_user
DB_PASSWORD=tasky_password
DB_NAME=tasky_db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Inicie os serviços com Docker

```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL na porta 5432
- Redis na porta 6379

### 4. Execute as migrações do banco de dados

```bash
# As tabelas serão criadas automaticamente na primeira execução
# ou execute o script SQL apropriado se disponível
```

### 5. Instale as dependências e inicie a aplicação

```bash
npm install
npm start
```

Para desenvolvimento com hot-reload:

```bash
npm run dev
```

## 📚 Documentação da API

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/tasks` | Lista todas as tarefas |
| POST | `/tasks` | Cria uma nova tarefa |
| PUT | `/tasks` | Atualiza uma tarefa existente |
| DELETE | `/tasks/:taskId` | Remove uma tarefa |
| GET | `/tasks/healthcheck` | Verifica status da API |
| GET | `/tasks/test` | Teste do WebSocket |

### Criar Tarefa

**Request:**
```http
POST /tasks
Content-Type: application/json

{
  "TaskName": "Minha Tarefa",
  "TaskDesc": "Descrição da tarefa",
  "HourTask": "2025-12-31T23:59:00",
  "NotifyTask": true,
  "TaskDone": false
}
```

**Response:**
```json
{
  "message": "Task created successfully"
}
```

### Atualizar Tarefa

**Request:**
```http
PUT /tasks
Content-Type: application/json

{
  "TaskId": 1,
  "TaskName": "Tarefa Atualizada",
  "TaskDone": true
}
```

**Response:**
```json
{
  "message": "Task updated successfully"
}
```

## 🤖 Comandos do Telegram Bot

| Comando | Descrição |
|---------|-----------|
| `/tarefas` | Lista todas as suas tarefas |
| `/criar` | Inicia o fluxo de criação de tarefa |
| `/editar` | Seleciona uma tarefa para editar |
| `/deletar` | Seleciona uma tarefa para remover |

## 🏗️ Arquitetura

```
API-Tasky/
├── Application/
│   ├── api.js           # Entry point da aplicação
│   └── socket.js        # Configuração do WebSocket
├── bot/
│   └── telegramWebhook.js # Handler do bot do Telegram
├── controllers/
│   └── taskController.js # Lógica dos endpoints HTTP
├── data/
│   ├── pg.js            # Conexão com PostgreSQL
│   └── taskRepository.js # Acesso a dados
├── dtos/
│   ├── createTaskDto.js  # Validação de criação
│   └── updateTaskDto.js  # Validação de atualização
├── routes/
│   └── tasks.js         # Definição das rotas
├── services/
│   ├── taskService.js   # Lógica de negócio
│   ├── notifyQueue.js   # Fila de notificações
│   └── workerMq.js      # Worker de processamento
├── docker-compose.yml   # Serviços Docker
└── package.json
```

## 🔧 Configuração do Webhook do Telegram

Para receber mensagens do Telegram, configure o webhook:

```bash
curl -X POST "https://api.telegram.org/bot<SEU_TOKEN>/setWebhook" \
  -d "url=https://seu-dominio.com/api/telegram/webhook"
```

Ou defina `SET_WEBHOOK=true` no `.env` e a aplicação configurará automaticamente.

## 🖥️ Painel de Administração

Monitore as filas BullMQ em tempo real:

```
http://localhost:3000/admin/queues
```

## 🧪 Testes

Execute os testes (quando disponíveis):

```bash
npm test
```

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia a aplicação em produção |
| `npm run dev` | Inicia com hot-reload (nodemon) |
| `npm test` | Executa os testes |

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Samuel Lucas** - [GitHub](https://github.com/samuellucg)

---

<p align="center">Feito com ❤️ e ☕</p>
