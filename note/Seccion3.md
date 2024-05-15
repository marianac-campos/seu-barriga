# Seção 3: /accounts

## TDD na Prática

1º Adicionei um teste unitário para uma nova rota de usuário que iria buscar por todos e no final retornar a todos os usuários. Como esperado da etapa RED, o teste falhou:
![alt text](<Screenshot from 2024-04-24 09-18-45.png>)

2º Para corrigir isso, criei a rota e passei pela etapa GREEN:

![alt text](<Screenshot from 2024-04-24 09-22-51.png>)

3º Para mostrar a etapa de REFACTOR e como usar o TDD ajuda muito quando precisamos refatorar o código, removi a lógica de user de dentro do arquivo ```app.js``` e movi para a pasta router onde criei um arquivo chamado ```user.js```:

![alt text](<Screenshot from 2024-04-24 09-56-22.png>)

Ao final os testes que eu havia criado serviram para me indicar que a refatoração foi bem sucedida!

![alt text](<Screenshot from 2024-04-24 10-03-12.png>)

## O que é um middleware?

## Novas Dependências Desbloqueadas!

- body-parser
- consign
- pg
- knex
- knex-logger
