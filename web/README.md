# [ftr-bitly] web

Aplicação web React para encurtamento de URLs inspirada no Brev.ly.

## Requisitos

- [ ] Deve ser possível criar um link
  - [ ] Não deve ser possível criar um link com encurtamento mal formatado
  - [ ] Não deve ser possível criar um link com encurtamento já existente
- [ ] Deve ser possível deletar um link
- [ ] Deve ser possível obter a URL original por meio do encurtamento
- [ ] Deve ser possível listar todas as URL's cadastradas
- [ ] Deve ser possível incrementar a quantidade de acessos de um link
- [ ] Deve ser possível baixar um CSV com o relatório dos links criados

Além disso, também temos algumas regras importantes específicas para o front-end:

- [ ] É obrigatória a criação de uma aplicação React no formato SPA utilizando o Vite como `bundler`;
- [ ] Siga o mais fielmente possível o layout do Figma;
- [ ] Trabalhe com elementos que tragam uma boa experiência ao usuário (`empty state`, ícones de carregamento, bloqueio de ações a depender do estado da aplicação);
- [ ] Foco na responsividade: essa aplicação deve ter um bom uso tanto em desktops quanto em celulares.

## Páginas

Essa aplicação possui 3 páginas:

- A página raiz (`/`) que exibe o formulário de cadastro e a listagem dos links cadastrados;
- A página de redirecionamento (`/:url-encurtada`) que busca o valor dinâmico da URL e faz a pesquisa na API por aquela URL encurtada;
- A página de recurso não encontrado (qualquer página que não seguir o padrão acima) que é exibida caso o usuário digite o endereço errado ou a url encurtada informada não exista.

## Stack

É obrigatório o uso de:

- Typescript
- React
- Vite sem framework

É flexível o uso de:

- TailwindCSS
- React Query
- React Hook Form
- Zod

## Instalação

```bash
# Instalar dependências
npm install
# ou
pnpm install
# ou
yarn install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto `web` com a seguinte variável:

```env
VITE_API_BASE_URL=http://localhost:3333
```

## Scripts

- `npm run dev` - Inicia o servidor de desenvolvimento na porta 5173
- `npm run build` - Gera o build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## Estrutura do Projeto

```
web/
├── src/
│   ├── pages/          # Páginas da aplicação
│   │   ├── Home.tsx    # Página principal com formulário e listagem
│   │   ├── Redirect.tsx # Página de redirecionamento
│   │   └── NotFound.tsx # Página 404
│   ├── config/         # Configurações
│   │   └── api.ts      # Configuração da API
│   ├── types/          # Tipos TypeScript
│   │   └── link.ts     # Tipos relacionados a links
│   ├── App.tsx         # Componente principal com rotas
│   ├── main.tsx        # Entry point da aplicação
│   └── index.css       # Estilos globais
├── index.html          # HTML principal
├── vite.config.ts      # Configuração do Vite
├── tsconfig.json       # Configuração do TypeScript
├── tailwind.config.js  # Configuração do TailwindCSS
└── package.json        # Dependências e scripts
```
