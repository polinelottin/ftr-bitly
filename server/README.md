# [ftr-bitly] server requirements

- [ ]  Deve ser possível criar um link
    - [ ]  Não deve ser possível criar um link com URL encurtada mal formatada
    - [ ]  Não deve ser possível criar um link com URL encurtada já existente
- [ ]  Deve ser possível deletar um link
- [ ]  Deve ser possível obter a URL original por meio de uma URL encurtada
- [ ]  Deve ser possível listar todas as URL’s cadastradas
- [ ]  Deve ser possível incrementar a quantidade de acessos de um link
- [ ]  Deve ser possível exportar os links criados em um CSV
    - [ ]  Deve ser possível acessar o CSV por meio de uma CDN (Amazon S3, Cloudflare R2, etc)
    - [ ]  Deve ser gerado um nome aleatório e único para o arquivo
    - [ ]  Deve ser possível realizar a listagem de forma performática
    - [ ]  O CSV deve ter campos como, URL original, URL encurtada, contagem de acessos e data de criação.

## Stack

- TypeScript
- Fastify
- Drizzle
- Postgres


## Scripts

Crie um script com a exata chave `db:migrate` responsável por executar as migrations do banco de dados.

## Docker

Para esse projeto back-end você deve construir um `Dockerfile`, seguindo as boas práticas, que deve ser responsável por gerar a imagem da aplicação.

## Dicas

- Não se esqueça de habilitar o CORS na aplicação.
- Em caso de dúvidas, utilize o espaço da comunidade e do nosso fórum para interagir com outros alunos/instrutores e encontrar uma solução que funcione para você.