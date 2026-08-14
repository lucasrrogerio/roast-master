# Especificação de Produto: Sistema de Gestão para Torrefação de Cafés Especiais

## 1. Visão Geral do Produto
O **Roast Master Web** (nome sugerido) é uma aplicação web desenvolvida para gerenciar e rastrear todo o fluxo de produção de uma torrefação de cafés especiais. O sistema visa cobrir a jornada do café desde a chegada da saca de grão cru (verde) até o empacotamento do produto final, garantindo rastreabilidade, controle de qualidade e gestão de estoque em tempo real.

## 2. Requisitos Funcionais (RF)

Os requisitos funcionais descrevem o que o sistema deve fazer (suas funcionalidades).

*   **RF01: Gestão de Grãos Crus (Estoque Verde)**
    *   O sistema deve permitir o cadastro de entradas de grãos crus.
    *   **Dados necessários**: Origem, Fazenda/Produtor, Variedade, Processamento (Natural, Lavado, Honey, etc.), Altitude, Safra, Umidade (%), Pontuação SCA, Código do Lote, Quantidade (em Kg ou Sacas) e Valor de Custo.
    *   O sistema deve atualizar e exibir o saldo de estoque atualizado de cada lote de grão cru.

*   **RF02: Gestão de Perfis de Torra (Receitas)**
    *   O sistema deve permitir cadastrar e editar "Perfis de Torra" padronizados.
    *   **Dados necessários**: Nome do Perfil, Grão/Blend destinado, Temperatura de Carga, Tempo de Desenvolvimento, Temperatura Final, Cor final (escala Agtron) e notas de prova esperadas.

*   **RF03: Registro de Batidas de Torra (Roast Batches)**
    *   O sistema deve permitir o registro da execução de uma torra.
    *   **Ação**: O usuário seleciona o lote do grão cru, o perfil de torra utilizado, o Mestre de Torra responsável e insere a Data/Hora.
    *   **Métricas**: O usuário deve inserir o Peso Inicial (Kg) e, após a torra, o Peso Final (Kg).
    *   **Cálculo Automático**: O sistema deve calcular automaticamente a porcentagem de quebra (perda de umidade).
    *   **Integração de Estoque**: Salvar uma torra deve descontar automaticamente o peso inicial do estoque de grão cru.

*   **RF04: Gestão de Estoque de Produto Final (Empacotamento)**
    *   O sistema deve gerenciar SKUs de produtos finais (Ex: "Café Especial Mantiqueira - Pacote 250g", "Pacote 1Kg").
    *   O sistema deve permitir o "Empacotamento", onde uma quantidade de café de uma "Batida de Torra" (RF03) é convertida em unidades de pacotes finais.
    *   O sistema deve controlar a quantidade disponível de pacotes prontos para venda.

*   **RF05: Rastreabilidade Completa**
    *   O sistema deve ser capaz de, a partir do lote de um pacote final, rastrear qual foi a batida de torra específica e de qual fazenda/lote de grão cru o café se originou.

*   **RF06: Controle de Acesso e Autenticação**
    *   O sistema deve possuir login e senha.
    *   **Perfis**: Administrador (acesso total), Mestre de Torra (acesso às receitas e registros de torra), Estoquista (acesso apenas a entradas e saídas de pacotes/sacas).

*   **RF07: Dashboard e Relatórios**
    *   Exibir indicadores-chave: Alerta de estoque baixo (grão cru e pacotes), volume total torrado no mês atual, média de perda de umidade por grão.

## 3. Requisitos Não Funcionais (RNF)

Os requisitos não funcionais descrevem como o sistema deve operar (qualidade, performance, usabilidade).

*   **RNF01: Usabilidade e Responsividade**
    *   A interface da aplicação deve ser *mobile-friendly* (responsiva), permitindo que o Mestre de Torra ou estoquista utilize o sistema através de um tablet ou smartphone no chão de fábrica da torrefação de forma confortável.

*   **RNF02: Desempenho**
    *   O tempo de carregamento das listagens de estoque e registro de torra não deve exceder 2 segundos em conexões 4G/Wifi padrão, garantindo que não haja atrasos durante a operação de torra.

*   **RNF03: Disponibilidade**
    *   Sendo um sistema web para ambiente produtivo, deve estar hospedado em nuvem (Cloud) com alta disponibilidade (Uptime mínimo de 99.5%).

*   **RNF04: Segurança**
    *   Toda comunicação deve ser feita sobre protocolo HTTPS.
    *   Senhas devem ser armazenadas com criptografia (ex: bcrypt).
    *   A aplicação deve possuir rotinas automáticas de backup do banco de dados (diário).

*   **RNF05: Stack Tecnológico (Sugestão)**
    *   A aplicação deve ser construída utilizando tecnologias web modernas que facilitem a evolução do projeto (Ex: React/Vue para Frontend, Node.js/Python/Go para Backend, PostgreSQL para Banco de Dados).
