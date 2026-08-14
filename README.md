# Roast Master Web

Bem-vindo ao repositório do **Roast Master Web**! Este é um projeto fullstack com backend e frontend separados.

## 🚀 Tecnologias

### Backend
- **Node.js** com **TypeScript**
- **Prisma ORM** utilizando banco de dados local SQLite
- **Jest** para testes

### Frontend
- **Vite** com **TypeScript**
- **Tailwind CSS** para estilização

## 📂 Estrutura do Projeto

```
.
├── backend/     # API e lógica de servidor
├── frontend/    # Interface com o usuário construída com Vite
└── docs/        # Documentações relacionadas à arquitetura e projeto
```

## ⚙️ Como Executar Localmente

### 1. Backend
Navegue até a pasta do backend, instale as dependências, prepare o banco de dados e inicie a API:
```bash
cd backend
npm install

# Inicializa as tabelas do SQLite baseadas no schema do Prisma
npx prisma db push 

# (Opcional) Executa em modo dev, assumindo que há um script 'dev' no package.json
npm run dev
```

### 2. Frontend
Em outro terminal, acesse a pasta do frontend e inicie o ambiente de desenvolvimento:
```bash
cd frontend
npm install
npm run dev
```

## 🔒 Variáveis de Ambiente
Certifique-se de configurar um arquivo `.env` na pasta `backend/` caso seja necessário. Exemplo de estrutura mínima para o Prisma:
```env
DATABASE_URL="file:./roast_master.db"
```
