# AICode42

AICode42 é um pacote npm que permite gerar código usando inteligência artificial. Ele é instalado globalmente e executado no diretório do sistema onde você deseja gerar código com IA.

## Instalação

Para instalar o AICode42 globalmente, execute:

```bash
npm install -g aicode42
```

## Configuração

Para que o AICode42 funcione corretamente, é necessário criar alguns arquivos de configuração.

### 1. Configuração Global

Crie o arquivo `~/.aicode42/config.json` com o seguinte conteúdo:

```json
{
  "OPENAI_API_KEY": "sua-chave-api-da-openai"
}
```

Substitua `"sua-chave-api-da-openai"` pela sua chave de API da OpenAI.

### 2. Configuração do Projeto

No diretório do projeto onde você deseja gerar o código, crie o arquivo `.aicode42.json` com a configuração para gerar os códigos:

Exemplo:

```json
{
  "prefix": "user",
  "fileConfigs": [
    {
      "name": "dto",
      "model": "gpt-4o-2024-08-06",
      "system": "dto-input.txt",
      "prompt": "table.sql",
      "files": ["src/dto/{{prefix}}.dto.ts"]
    },
    {
      "name": "controller",
      "model": "gpt-4o-2024-08-06",
      "system": "controller-input.txt",
      "prompt": "table.sql",
      "files": ["src/controller/{{prefix}}.controller.ts"]
    }
  ]
}
```

Obs: {{prefix}} será substiuido pelo prefix informado acima

## Uso

Após a configuração, você pode executar o AICode42 no diretório do seu projeto:

```bash
aicode42
```

O AICode42 irá utilizar as configurações fornecidas para gerar o código correspondente.

## Autor

- **Márcio Motta** - [Marmottajr](https://github.com/marmottajr)

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou pull request.

## Licença

Este projeto está licenciado sob a licença MIT.
