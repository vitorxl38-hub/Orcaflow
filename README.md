# 🚀 OrçaFlow — Plataforma SaaS Inteligente de Orçamentos Rápidos

O OrçaFlow é uma aplicação SaaS moderna, de altíssimo nível, construída com foco exclusivo na agilização extrema de propostas de serviços profissionais. Prestadores de qualquer nicho (eletricistas, encanadores, designers, freelancers, construtores e agências de tecnologia) conseguem gerar orçamentos impecáveis em menos de 2 minutos, disponibilizando QR Codes automatizados para Pix, links de pagamento e coleta de assinatura eletrônica.

---

## ✨ Funcionalidades Principais

### 🛠️ Geração Ultra-Veloz de Orçamentos
*   **Cálculo em Tempo Real:** Subtotais, taxas de descontos (porcentagem ou fixo) e valores finais atualizados sem latência.
*   **Duplicação Prática:** Reutilize orçamentos emitidos com apenas um clique.
*   **Contatos Rápidos:** Link direto com preenchimento da mensagem e compartilhamento automático no WhatsApp do cliente final.
*   **Pix Automatizado:** Simulador de Pix copia-e-cola imediato baseado na chave de faturamento configurada.

### 🧠 Inteligência Artificial com Copiloto Gemini (SDK v2)
*   **Refinador Contratual:** Otimização especializada de observações jurídicas, termos de faturamento ou cláusulas de garantia usando engenharia inteligente de prompts.
*   **Modelos de Nichos Técnicos:** A IA monta tabelas de custos sugeridas para áreas complexas de acordo com a predefinição do usuário.
*   **Preços Recomendados:** Calculadora interna que auxilia o prestador a precificar seus serviços em correlação regional com a média setorial.

### 🏢 Arquitetura Multi-Tenant / Multiempresa
*   **Workspaces Isolados:** Cada usuário pode gerenciar empresas paralelas, alterando esquemas cromáticos, logotipos, fones e e-mails de rodapé.
*   **Colaboração de Equipe:** Gestão de convites com permissões hierárquicas específicas (`ADMIN`, `MEMBER`, `VIEWER`).

### 📊 SaaS Analytics Premium (Linear / Notion Mood)
*   **Fórmulas SaaS:** Visores dedicados para MRR (Monthly Recurring Revenue), Churn Rate, Taxa de Conversão e estatísticas de planos.
*   **Dashboards Avançados:** Gráficos interativos integrados para distribuição de nichos e crescimento financeiro de faturamentos.

---

## 🛠️ Tecnologias Utilizadas

*   **Front-End:** React 19, Tailwind CSS (v4), Lucide React (Ícones), Motion (Animações).
*   **Back-End:** Node.js (Express server robusto).
*   **Banco de Dados & ORM:** PostgreSQL e Prisma (arquivos de modelos inclusos em `/prisma/schema.prisma`).
*   **Inteligência Artificial:** Google GenAI `@google/genai` (Gemini API).
*   **Estatísticas / Gráficos:** Recharts e D3.
*   **Build-system:** Vite & Esbuild.

---

## 🚀 Instalação e Execução Local

### 1. Pré-requisitos
*   Node.js (versão 18 ou superior)
*   NPM ou Yarn

### 2. Passo a Passo
1.  **Instale as dependências do projeto:**
    ```bash
    npm install
    ```

2.  **Configuração de Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como referência):
    ```env
    # Sua chave do Google Gemini (necessária para os cards de IA em produção)
    GEMINI_API_KEY="SUA_CHAVE_AQUI"
    
    # URL de faturamento ou rede (padrão local)
    APP_URL="http://localhost:3000"
    
    # URL de produção para seu PostgreSQL (Mudar para produção real Prisma)
    DATABASE_URL="postgresql://usuario:senha@localhost:5432/orcaflow?schema=public"
    ```

3.  **Execução do Servidor de Desenvolvimento:**
    Inicie a aplicação utilizando o tsx/vite integrado simultaneamente:
    ```bash
    npm run dev
    ```
    Isso iniciará o ecossistema na porta **3000** (http://localhost:3000), fornecendo o back-end simulado do banco dinâmico e o front-end simultaneamente!

4.  **Compilação de Produção:**
    ```bash
    npm run build
    ```

5.  **Início do Servidor Compilado:**
    ```bash
    npm start
    ```

---

## 🗄️ Integração com o Banco PostgreSQL (Prisma)

O projeto já inclui a estrutura original de tabelas relacionais do Prisma em `/prisma/schema.prisma`. Para utilizá-lo em ambiente de produção contínua com banco de dados real:

1.  Mapeie e instale o cliente Prisma:
    ```bash
    npm install @prisma/client
    npx prisma generate
    ```
2.  Execute as migrações automáticas para provisionar as tabelas no seu banco Cloud:
    ```bash
    npx prisma db push
    ```

---

## ☁️ Instruções de Deploy na Vercel

O OrçaFlow está arquitetado para ser implantado na **Vercel** ou em soluções baseadas em containers como **Cloud Run**:

### Deploy Rápido na Vercel (Full-Stack Express ou Serverless API)
1.  Instale a CLI da Vercel globalmente ou faça a integração direta pelo GitHub: `npm i -g vercel`.
2.  Associe a pasta do projeto.
3.  Configure as variáveis de ambiente necessárias (`GEMINI_API_KEY`) diretamente no painel de configurações da Vercel.
4.  Execute `vercel --prod` e obtenha seu link definitivo de produção instantaneamente!

---

## 🔒 Segurança e Termos de Uso do Sandbox
*   As assinaturas simuladas dos planos `PRO` e `BUSINESS` passam por um fluxo seguro de simulação de sandbox, permitindo demonstrar aos clientes integrações com gateways como Stripe ou Mercado Pago sem a necessidade de chaves fiscais produtivas ativas na primeira exibição.
