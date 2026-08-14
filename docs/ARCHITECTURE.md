# Proposta de Arquitetura - Roast Master Web

## 1. Visão Geral
A arquitetura do **Roast Master Web** será baseada no modelo Cliente-Servidor (Client-Server), utilizando uma API RESTful no backend para comunicação com uma Single Page Application (SPA) responsiva no frontend. Esta separação garante escalabilidade, facilita a manutenção e permite futuras integrações (como aplicativos nativos, caso seja necessário no futuro).

## 2. Stack Tecnológico (Proposta)

### 2.1. Frontend (Apresentação e SPA)
*   **Framework:** React.js (com Vite ou Next.js).
*   **Linguagem:** TypeScript para maior segurança e tipagem de dados estruturada.
*   **Estilização:** Tailwind CSS (facilita a criação rápida de interfaces responsivas e *mobile-friendly* focadas no ambiente da fábrica).
*   **Gerenciamento de Estado:** React Query (para cache e chamadas otimizadas à API) e Context API para dados globais leves (como a sessão do usuário e permissões).

### 2.2. Backend (API e Regras de Negócio)
*   **Linguagem/Framework:** Node.js com TypeScript e NestJS (ou Express.js). O TypeScript garantirá tipagem estática e coesão com o frontend, mitigando erros na ponte API/UI.
*   **Autenticação:** JWT (JSON Web Tokens) com armazenamento e validação por rotas via middleware. Senhas armazenadas com hash forte (`bcrypt`).
*   **Deploy/Hospedagem:** Infraestrutura em nuvem elástica (como AWS ECS, Heroku, Render ou Railway) para garantir estabilidade e alta disponibilidade (RNF03).

### 2.3. Banco de Dados e Armazenamento
*   **Banco de Dados Relacional:** PostgreSQL. Ideal para garantir a integridade referencial estrita que o sistema exige (necessário para a Rastreabilidade completa do pacote até a fazenda, sem risco de dados soltos).
*   **ORM (Object-Relational Mapping):** Prisma ORM ou TypeORM para agilizar as operações no banco, *migrations* seguras e facilitar relacionamentos.

## 3. Diagrama Lógico de Dados (Entidades Principais)
Abaixo estão as principais entidades estruturais e suas responsabilidades:

1.  **User (Usuário):** Gerencia os acessos (Administrador, Mestre de Torra, Estoquista).
2.  **GreenBeanBatch (Lote de Grão Cru):** Armazena dados da origem/fazenda, umidade, nota SCA, safra e, de maneira crítica, o **saldo atual disponível** (em Kg ou sacas).
3.  **RoastProfile (Perfil de Torra):** Guarda as receitas padrão (temperaturas alvo, tempo de desenvolvimento, cor Agtron).
4.  **RoastBatch (Batida de Torra):** Registro do processo real. Relaciona-se com 1 `GreenBeanBatch` (o grão que foi usado), 1 `RoastProfile` e 1 `User` (o Mestre). Armazena o peso inicial, peso final e a quebra (%) calculada.
5.  **ProductSKU (Produto de Venda):** Define os tipos de pacotes a serem comercializados (ex: "Mantiquera Especial 250g").
6.  **PackagingBatch (Lote de Empacotamento):** O registro da conversão do café torrado. Relaciona-se com 1 `RoastBatch` e 1 `ProductSKU`. Permite rastrear exatamente de qual torra saiu um pacote na prateleira.

## 4. Decisões Arquiteturais e de Design

*   **Mobile-First no Chão de Fábrica:** O frontend será desenvolvido com abordagem prioritária *mobile-first*. O design contará com botões grandes, fluxos com menos cliques, campos focados em digitação numérica (para pesos) e alto contraste, pensando na utilização em um tablet ou smartphone próximo ao torrador (RNF01).
*   **Transações de Banco Seguras (ACID):** Operações vitais, como o registro de uma batida de torra (que salva o processo e, simultaneamente, debita o estoque de grão cru), utilizarão **transações** no banco. Isso significa que, se houver falha de rede no meio da ação, não haverá furos (estoque negativo ou torras "fantasmas").
*   **Rastreabilidade Otimizada no BD:** Para viabilizar a rastreabilidade imediata (RF05), chaves estrangeiras eficientes garantirão que, ao pesquisar um lote num pacote, o sistema puxe via JOINS rapidamente todo o caminho: *Pacote > Torra > Lote Verde > Produtor*.
