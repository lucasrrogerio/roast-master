# Backlog da Primeira Versão (MVP) - Roast Master Web

Este documento descreve as tarefas macro divididas em Sprints para o desenvolvimento da primeira versão (Produto Mínimo Viável - MVP) do sistema de gestão da torrefação. O foco desta versão é validar o fluxo de ponta a ponta: do grão verde ao pacote.

## Sprint 1: Fundação, Acessos e Grão Cru
*O objetivo desta sprint é estabelecer a base do projeto e permitir o controle de entrada da matéria-prima.*

*   [x] **TAREFA 1.1: Setup da Arquitetura**
    *   Configuração do repositório, banco de dados (esquema inicial) e ambiente de desenvolvimento.
    *   **Quebra Técnica (Dev):**
        *   [x] Inicializar repositório Git.
        *   [x] Configurar estrutura Frontend (Vite/Next.js + React + Tailwind).
        *   [x] Configurar estrutura Backend (Node.js + TypeScript).
        *   [x] Levantar banco PostgreSQL / SQLite ACID.
        *   [x] Instalar e configurar ORM / Query Builder e criar schema inicial.
*   [x] **TAREFA 1.2: Autenticação e Perfis**
    *   Implementar tela de Login/Logout.
    *   Implementar controle de rotas baseadas em permissões (Admin vs Operador).
    *   **Quebra Técnica (Dev):**
        *   [x] Backend: Modelagem da tabela `users` no banco de dados.
        *   [x] Backend: Criar endpoint `POST /auth/login` para validação (bcrypt) e geração de token JWT.
        *   [x] Backend: Criar middlewares de validação de token e regras por Role (RBAC).
        *   [x] Frontend: Desenvolver interface de Login, Contexto de Autenticação React e interceptors para injetar JWT nas requisições.
*   [x] **TAREFA 1.3: Cadastro de Origens (Fazendas/Fornecedores)**
    *   CRUD (Criar, Ler, Atualizar, Deletar) para gerenciar os fornecedores de café.
    *   **Quebra Técnica (Dev):**
        *   [x] Backend: Criar rotas CRUD completas (`GET`, `POST`, `PUT`, `DELETE`).
        *   [x] Frontend: Construir tela de listagem e formulário de adição/edição de fornecedores.
*   [x] **TAREFA 1.4: Gestão de Lotes de Grão Cru**
    *   Formulário de entrada de saca/grão cru (dados de umidade, pontuação SCA, origem).
    *   Listagem do estoque atualizado de grãos verdes.
    *   **Quebra Técnica (Dev):**
        *   [x] Backend: Modelar tabela `green_bean_batches` com chave estrangeira vinculada à origem.
        *   [x] Backend: Endpoint para registrar entrada de estoque.
        *   [x] Frontend: Interface com listagem visual mostrando saldos atuais e modal para nova entrada de matéria-prima.

## Sprint 2: Core do Negócio - O Processo de Torra
*O objetivo desta sprint é digitalizar a operação do mestre de torra.*

*   [x] **TAREFA 2.1: Cadastro de Perfis de Torra**
    *   CRUD de receitas (Perfis de torra), onde o Mestre de Torra cadastra suas temperaturas, tempos alvo e cor desejada (Agtron).
    *   **Quebra Técnica (Dev):**
        *   [x] Backend: Endpoints e modelagem da tabela `roast_profiles`.
        *   [x] Frontend: CRUD gerenciável focado no Mestre de Torra (receitas).
*   [x] **TAREFA 2.2: Registro de Batida de Torra (Roast Batch)**
    *   Criar interface rápida para o registro da torra em tempo real.
    *   O usuário seleciona o Grão Cru e o Perfil de Torra.
    *   Input de Peso Inicial e Peso Final.
    *   **Quebra Técnica (Dev):**
        *   [x] Backend: Modelar `roast_batches` amarrando usuário executante, grão cru usado e perfil.
        *   [x] Backend: Endpoint de `POST /roast-batches` recebendo parâmetros pesados.
        *   [x] Frontend: Formulário adaptado com dropdowns assíncronos puxando lotes de grão disponíveis e perfis ativos.
*   [x] **TAREFA 2.3: Cálculo de Quebra e Integração de Estoque**
    *   Lógica no backend para calcular a % de perda de umidade ao salvar a torra.
    *   Ao concluir a torra, debitar automaticamente o "Peso Inicial" do lote de grão cru utilizado.
    *   **Quebra Técnica (Dev):**
        *   [x] Backend: Implementar lógica de DB Transaction: ao salvar uma torra, atualizar tabela do estoque verde subtraindo a quantidade usada na mesma query atômica.
        *   [x] Backend: Lógica de cálculo matemático `((PesoInicial - PesoFinal) / PesoInicial) * 100` e gravação do índice de quebra.
        *   [x] Backend: Retornar erro "Estoque Insuficiente" (400/422) se o Peso Inicial da torra exceder o saldo existente do grão verde.

## Sprint 3: Empacotamento, Rastreabilidade e Dashboard
*O objetivo desta sprint é finalizar a jornada do grão e prover visão gerencial.*

*   [x] **TAREFA 3.1: Cadastro de Produtos (SKUs)**
    *   CRUD para definir os tipos de pacotes vendidos (Ex: Pacote de 250g, 500g, 1Kg).
    *   **Quebra Técnica (Dev):**
        *   [x] Backend/Frontend: Modelagem e telas básicas (CRUD) de SKUs.
*   [x] **TAREFA 3.2: Fluxo de Empacotamento**
    *   Interface para "transformar" o café torrado gerado na Tarefa 2.2 em pacotes físicos.
    *   Geração de lote do pacote final linkado à batida de torra.
    *   **Quebra Técnica (Dev):**
        *   [x] Backend: Modelar `packaging_batches` linkando um registro de torra ao tipo de SKU embalado.
        *   [x] Frontend: Painel do estoquista para registrar saída de café torrado transformando em unidades fracionadas (pacotes).
*   [x] **TAREFA 3.3: Visão de Rastreabilidade**
    *   Tela de busca: Ao digitar o lote do pacote, exibir a "árvore" (Pacote -> Torra -> Grão Cru/Fazenda).
    *   **Quebra Técnica (Dev):**
        *   [x] Backend: Criar endpoint agregador que faz Join hierárquico `Packaging -> RoastBatch -> GreenBeanBatch -> Origin`.
        *   [x] Frontend: Representar o caminho do lote numa interface visual do tipo Timeline ou Flowchart.
*   [x] **TAREFA 3.4: Dashboard Gerencial MVP**
    *   Tela inicial com os cards: Volume Torrado no Mês (Kg), Quantidade de Torras Realizadas, Alerta de Estoque Baixo de Grão Cru.
    *   **Quebra Técnica (Dev):**
        *   [x] Backend: Agrupamentos e soma condicional SQL (`SUM`, `COUNT`) nos endpoints do dashboard.
        *   [x] Frontend: Integração dos indicadores com bibliotecas gráficas e cards visuais de status.
*   [x] **TAREFA 3.5: Testes Integrados e Homologação**
    *   Simular o fluxo ponta a ponta na aplicação (Entrada de 1 saca -> Torra de 10kg -> Empacotamento de 30 pacotes de 250g). Correção de bugs.
    *   **Quebra Técnica (Dev):**
        *   [x] Backend: Criação de testes unitários cruciais para a classe/serviço que realiza cálculos de desconto de estoque de Grão Cru e cálculos de quebra.
        *   [x] Escrever scripts de *seeding* no banco para facilitar setup de testes manuais da interface.
