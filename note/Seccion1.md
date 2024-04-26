# Seção 1: Iniciando a API
Nessa seção do [curso da Udemy](https://uciandt.udemy.com/course/api-rest-nodejs-com-testes/learn/lecture/13001714#overview) (seção 3). Começamos a fazer as configurações iniciais do projeto utilizando o Eslint, seguindo os padrões do Airbnb, e do Jest para rodarmos os testes. 
Após isso, montamos o teste unitário para garantir que o servidor esteja sempre rodando na porta 3001 e em seguida configuramos realmente utilizando o framework Express.
Para evitar que o teste falhasse ao finalizar a execução da aplicação local, foi feito um mock utilizando a lib **supertest**.

Abaixo compartilho com vocês minhas anotações a respeito dessa seção.

## 1. Iniciando com Jest
Neste projeto, - como provavelmente já observado - utilizaremos o framework popularmente conhecido, **Jest**, para realizar os *testes unitários* da aplicação.

### 1.1 Diferença de "it" e "test"
No Jest tanto a função "it" quanto a "test" trarão o mesmo resultado para o seu teste. A escolha de qual utilizar fica a critério da equipe. 
Algo que pode ser levado em consideração é a forma como se escreverá os testes:

```sh
describe('yourModule', () => {
  it('should do this thing', () => {});
  it('should do the other thing', () => {});
});
```

```sh
describe('yourModule', () => {
  test('if it does this thing', () => {});
  test('if it does the other thing', () => {});
});
```

# 2. Test Driven Development (TDD)
O **TDD** refere-se a uma *prática de desenvolvimento de software* que consiste se começar a fazer a codificação a partir da escrita de **testes unitários**. 
Essa prática é divida num ciclo 3 etapas nomeadas como **Red, Green e Refactor**. Funcionando da seguinte maneira:
1. Escreve-se o teste referente a funcionalidade que será implementada. Ao executá-la é esperado que o teste falhe, representando a etapa **Red**.
2. Em seguida, deve-se criar o código baseado no teste e ao rodá-lo novamente é esperado que ele seja executado com sucesso, sendo a etapa **Green**.
3. Por fim, na etapa **Refactor** visa buscar melhorias no código e a aplicação de boas práticas de programação.

O uso do TDD tem como benefício:
- Maior cobertura de testes unitários
- Maior segurança ao refatorar o código
- Funcionalidades documentadas, facilitando a compreensão do código
- Menos tempo gasto com depuração

## 3. Novas Dependências Desbloqueadas!

- slint
- jest
- express
- supertest

## 3.1 Eslint
**ESLint** é um framework de *linting** para **JavaScript**. 
O **ESLint** permite aos desenvolvedores configurar regras personalizadas para o estilo de codificação e padrões específicos da equipe, ajudando a manter um código consistente e de alta qualidade em projetos **JavaScript**. 

> *Linting é o processo de análise estática de código para encontrar problemas potenciais, erros de sintaxe, inconsistências de estilo e outras questões que possam afetar a legibilidade, manutenibilidade e funcionalidade do código. 

## 3.2 O que é supertest
É uma dependência que simplifica o processo de teste de APIs HTTP. Permitindo que seja possível realizar requisições sem que seja necessário iniciar um servidor real.