## Microsoft Azure
- Obter créditos **Student** para no [azure.microsoft.com](https://azure.microsoft.com/en-us/free/students/?culture=pt-br&country=br) *(pressionar control para abrir em nova página)*
- Acessar o [portal.azure.com](https://portal.azure.com/auth/login/)
```bash
az group list --output table
az resource list --output table
az account list-locations -o table
az group create --name rg-demo --location brazilsouth

az group delete --name rg-ai-aula --yes

az provider register --namespace Microsoft.OperationalInsights
az provider register --namespace Microsoft.sql
```
***
### Azure Text Translation
- Instanciar o serviço
```bash
az provider register --namespace Microsoft.CognitiveServices

az cognitiveservices account create \
  --name meu-translator \
  --resource-group rg-demo \
  --location brazilsouth \
  --kind TextTranslation \
  --sku F0 \
  --yes
```
- Obter o *endpoint* e a chave
```bash
az cognitiveservices account show \
  --name meu-translator \
  --resource-group rg-demo \
  --query properties.endpoint \
  -o tsv

az cognitiveservices account keys list \
  --name meu-translator \
  --resource-group rg-demo
```
- Instalar a biblioteca **nodejs**
```bash
npm install dotenv @azure-rest/ai-translation-text
```
- Criar o `.env` com os parâmetros
```javascript
TRANSLATOR_KEY=
TRANSLATOR_ENDPOINT=
```
- Exemplo de código
```javascript
require("dotenv").config();

const TextTranslationClient =
    require("@azure-rest/ai-translation-text").default;


// ========================================
// Configuração
// ========================================

const endpoint = process.env.TRANSLATOR_ENDPOINT;
const key = process.env.TRANSLATOR_KEY;

if (!endpoint || !key) {
    throw new Error(
        "TRANSLATOR_ENDPOINT e TRANSLATOR_KEY devem estar definidos no .env"
    );
}


// ========================================
// Instancia o cliente Translator
// ========================================

const client = new TextTranslationClient(
    endpoint,
    {
        key: key
    }
);


// ========================================
// Tradução
// ========================================

async function translate() {

    const text = "Olá, como você está?";

    console.log("Texto original:");
    console.log(text);

    console.log("\nTraduzindo...\n");


    const response = await client
        .path("/translate")
        .post({
            body: [
                {
                    text: text
                }
            ],
            queryParameters: {
                from: "pt",
                to: "en"
            }
        });


    // ========================================
    // Verifica erro
    // ========================================

    if (response.status >= 400) {

        console.error(
            "Erro na API:",
            response.body
        );

        return;
    }


    // ========================================
    // Resultado
    // ========================================

    const result = response.body;

    console.log("Resposta:");
    console.log(
        JSON.stringify(result, null, 2)
    );


    // ========================================
    // Mostra a tradução
    // ========================================

    const translation =
        result[0].translations[0];

    console.log("\n=================================");
    console.log("RESULTADO");
    console.log("=================================");

    console.log(
        "Idioma:",
        translation.to
    );

    console.log(
        "Tradução:",
        translation.text
    );
}


// ========================================
// Executa
// ========================================

translate()
    .catch(error => {

        console.error(
            "Erro:",
            error
        );

        process.exit(1);
    });
```
***
### Azure AI Language
- Instanciar o serviço
```bash
az cognitiveservices account list-skus --location brazilsouth

az cognitiveservices account create \
  --name meu-language \
  --resource-group rg-demo \
  --location brazilsouth \
  --kind TextAnalytics \
  --sku S \
  --yes
```
- Obter o *endpoint* e a chave
```bash
az cognitiveservices account show \
  --name meu-language \
  --resource-group rg-demo \
  --query properties.endpoint \
  -o tsv

az cognitiveservices account keys list \
  --name meu-language \
  --resource-group rg-demo
```
- Instalar a biblioteca **nodejs**
```bash
npm install dotenv @azure/ai-text-analytics
```
- Exemplo de código
```javascript
require("dotenv").config();

const {
    TextAnalyticsClient,
    AzureKeyCredential
} = require("@azure/ai-text-analytics");

const endpoint = process.env.LANGUAGE_ENDPOINT;
const key = process.env.LANGUAGE_KEY;

const client = new TextAnalyticsClient(
    endpoint,
    new AzureKeyCredential(key)
);

async function main() {

    const documents = [
        "Adorei o produto! A qualidade é excelente.",
        "O produto chegou atrasado e estou muito decepcionado.",
        "O produto chegou ontem."
    ];

    const results = await client.analyzeSentiment(
        documents,
        "pt",
        { includeOpinionMining: true }
    );

    for (const result of results) {

        if (result.error) {
            console.error("Erro:", result.error);
            continue;
        }

        console.log("=================================");
        console.log("Sentimento geral:", result.sentiment);
        console.log("Confiança:", result.confidenceScores);

        console.log("\nSentenças:");

        for (const sentence of result.sentences) {

            console.log("\nTexto:", sentence.text);
            console.log("Sentimento:", sentence.sentiment);
            console.log(
                "Confiança:",
                sentence.confidenceScores
            );

            if (sentence.opinions) {

                console.log("\nOpiniões:");

                for (const opinion of sentence.opinions) {

                    console.log(
                        "  Aspecto:",
                        opinion.target.text
                    );

                    console.log(
                        "  Sentimento do aspecto:",
                        opinion.target.sentiment
                    );

                    if (opinion.assessments) {

                        console.log("  Características:");

                        for (const assessment of opinion.assessments) {

                            console.log(
                                "    -",
                                assessment.text,
                                "→",
                                assessment.sentiment
                            );
                        }
                    }
                }
            }
        }
    }

}

main().catch(console.error);
```
### Azure Vision
- Instanciar o serviço
```bash
az cognitiveservices account create \
  --name meu-vision \
  --resource-group rg-demo \
  --location brazilsouth \
  --kind ComputerVision \
  --sku F0 \
  --yes

az cognitiveservices account show \
  --name meu-vision \
  --resource-group rg-demo \
  --query properties.endpoint \
  -o tsv

az cognitiveservices account keys list \
  --name meu-vision \
  --resource-group rg-demo
```
- Importar as bibliotecas **nodejs**
```bash
npm install @azure-rest/ai-vision-image-analysis
npm install @azure/core-auth
npm install dotenv
```
- Criar os parâmetros para acesso ao *endpoint*
```bash
VISION_ENDPOINT=
VISION_KEY=
```
- Código exemplo
```javascript
require("dotenv").config();
const Client = require("@azure-rest/ai-vision-image-analysis").default;
const { AzureKeyCredential } = require('@azure/core-auth');

// ========================================
// Configuração
// ========================================

const endpoint = process.env.VISION_ENDPOINT;
const key = process.env.VISION_KEY;

if (!endpoint || !key) {
    throw new Error(
        "VISION_ENDPOINT e VISION_KEY devem estar definidos no .env"
    );
}

// ========================================
// Instancia o cliente Azure Vision
// ========================================

const credential = new AzureKeyCredential(key);
const client = Client(endpoint, credential);

// ========================================
// Imagem que será analisada
// ========================================

const imageUrl =
    "https://learn.microsoft.com/azure/ai-services/computer-vision/media/quickstarts/presentation.png";


// ========================================
// Recursos de IA que queremos utilizar
// ========================================

const features = [
    "Read",
    "Tags",
    "Objects"
];


// ========================================
// Análise
// ========================================

async function analyzeImage() {

    console.log("Analisando imagem...\n");

    const result = await client
        .path("/imageanalysis:analyze")
        .post({
            body: {
                url: imageUrl
            },
            queryParameters: {
                features: features
            },
            contentType: "application/json"
        });


    // ========================================
    // Verifica se houve erro
    // ========================================

    if (result.status >= 400) {
        console.error("Erro na API:");
        console.error(result.body);
        return;
    }


    const data = result.body;


    // ========================================
    // Caption
    // ========================================

    if (data.captionResult) {

        console.log("=================================");
        console.log("DESCRIÇÃO DA IMAGEM");
        console.log("=================================");

        console.log(
            data.captionResult.text
        );

        console.log(
            "Confiança:",
            data.captionResult.confidence
        );
    }


    // ========================================
    // Tags
    // ========================================

    if (data.tagsResult) {

        console.log("\n=================================");
        console.log("TAGS");
        console.log("=================================");

        for (const tag of data.tagsResult.values) {

            console.log(
                `${tag.name} (${tag.confidence.toFixed(2)})`
            );
        }
    }


    // ========================================
    // Objetos
    // ========================================

    if (data.objectsResult) {

        console.log("\n=================================");
        console.log("OBJETOS DETECTADOS");
        console.log("=================================");

        for (const object of data.objectsResult.values) {

            console.log(
                `Objeto: ${object.tags[0].name}`
            );

            console.log(
                "Confiança:",
                object.tags[0].confidence
            );

            console.log(
                "Bounding Box:",
                object.boundingBox
            );

            console.log("---");
        }
    }


    // ========================================
    // OCR
    // ========================================

    if (data.readResult) {

        console.log("\n=================================");
        console.log("TEXTO DETECTADO (OCR)");
        console.log("=================================");

        for (const block of data.readResult.blocks) {

            for (const line of block.lines) {

                console.log(
                    line.text
                );
            }
        }
    }


    // ========================================
    // JSON completo
    // ========================================

    console.log("\n=================================");
    console.log("JSON COMPLETO");
    console.log("=================================");

    console.log(
        JSON.stringify(data, null, 2)
    );
}


// ========================================
// Executa
// ========================================

analyzeImage()
    .catch(error => {

        console.error(
            "Erro:",
            error
        );

        process.exit(1);
    });
```
### Document Intelligence
- Permite analisar um documento e extrair informações textuais a partir dele
- Maiores detalhes podem ser vistos [aqui](https://learn.microsoft.com/pt-br/azure/ai-services/document-intelligence/how-to-guides/use-sdk-rest-api?view=doc-intel-4.0.0&tabs=windows&pivots=programming-language-javascript)
- Instanciar o serviço
```bash
az cognitiveservices account create \
  --name meu-doc-intelligence \
  --resource-group rg-demo \
  --location brazilsouth \
  --kind FormRecognizer \
  --sku F0 \
  --yes
```
- Obter a chave de acesso e o *endpoint*
```bash
az cognitiveservices account show \
  --name meu-doc-intelligence \
  --resource-group rg-demo \
  --query properties.endpoint \
  -o tsv

az cognitiveservices account keys list \
  --name meu-doc-intelligence \
  --resource-group rg-demo
```
- Instalar as bibliotecas **nodejs**
```bash
npm init -y
npm install dotenv axios express multer @azure-rest/ai-document-intelligence @azure/identity
```
_ Tipos de modelos de documentos
    - prebuilt-read — extrai texto e informações de leitura do documento.
    - prebuilt-layout — extrai texto + estrutura/layout, como tabelas e seleção.
    - prebuilt-invoice — análise de notas fiscais.
    - prebuilt-receipt — recibos.
    - prebuilt-idDocument — documentos de identidade.
    - prebuilt-document — análise geral de documentos.
- Criar um arquivo `.env`
```javascript
DOCUMENT_INTELLIGENCE_KEY=
DOCUMENT_INTELLIGENCE_ENDPOINT=
DOCUMENT_URL_READ=
```
- Exempolo geral para processar documentos
```javascript
require("dotenv").config();

const DocumentIntelligence = require("@azure-rest/ai-document-intelligence").default;

const {
    getLongRunningPoller,
    isUnexpected,
} = require("@azure-rest/ai-document-intelligence");

const endpoint = process.env.DOCUMENT_INTELLIGENCE_ENDPOINT;
const key = process.env.DOCUMENT_INTELLIGENCE_KEY;
const documentUrlRead = process.env.DOCUMENT_URL_READ;

const client = DocumentIntelligence(
    endpoint,
    {
        key: key,
    }
);

async function main() {
    const response = await client
        .path("/documentModels/prebuilt-read:analyze", "prebuilt-layout")
        .post({
            contentType: "application/json",
            body: {
                urlSource: documentUrlRead,
            },
        });

    if (isUnexpected(response)) {
        throw response.body.error;
    }

    const poller = getLongRunningPoller(client, response);
    const result = await poller.pollUntilDone();

    console.log(JSON.stringify(result.body, null, 2));
}

main().catch(console.error);
```
- Exemplo de aplicação para reconhecer recibos
```javascript
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

const PORT = process.env.PORT || 3000;

const AZURE_KEY = "SUA_CHAVE";
const AZURE_ENDPOINT = "SEU_ENDPOINT"; 

app.get("/", (req, res) => {
  res.send(`
    <h2>Upload de documento (PDF/Imagem)</h2>
    <form method="POST" action="/analyze" enctype="multipart/form-data">
      <input type="file" name="file"/>
      <button type="submit">Enviar</button>
    </form>
  `);
});

// Endpoint principal
app.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const fileData = fs.readFileSync(req.file.path);

    const response = await axios.post(
      `${AZURE_ENDPOINT}/formrecognizer/documentModels/prebuilt-receipt:analyze?api-version=2023-07-31`,
      fileData,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY,
          "Content-Type": "application/octet-stream"
        }
      }
    );

    const operationLocation = response.headers["operation-location"];

    let result;
    while (true) {
      const poll = await axios.get(operationLocation, {
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY
        }
      });

      if (poll.data.status === "succeeded") {
        result = poll.data;
        break;
      }

      if (poll.data.status === "failed") {
        throw new Error("Falha na análise");
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    fs.unlinkSync(req.file.path);

    res.json(result);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Erro ao analisar documento");
  }
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
```
***
### Acessando Banco SQL Server
- Criar uma instância de banco de dados **SQL Server** usando o *CLI* (`az`)
```bash

az account list-locations --output table

az sql db list-editions --location brazilsouth --output table

az group create --name rg-demo --location brazilsouth

az sql server create --name meusqlserver123 --resource-group rg-demo --location brazilsouth --admin-user adminuser --admin-password "SenhaForte!123"

az sql server firewall-rule create --resource-group rg-demo --server meusqlserver123 --name AllowMyIP --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0

az sql db create --resource-group rg-demo --server meusqlserver123 --name db --service-objective Basic

az sql db list --resource-group rg-demo --server meusqlserver123 --output table
```
- Para remover um grupo de recursos (e todos os recursos associados a ele!)
```bash
az group delete --name rg-demo --yes --no-wait
```
- Efretuar a conexão com o banco de dados criado
```bash
sqlcmd -S meusqlserver123.database.windows.net -d db -U adminuser -P 'SenhaForte!123'
```
- Código *SQL* para criar as tabelas utilizadas nos exemplos
```sql
CREATE TABLE [dbo].[Recibos] (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Cliente NVARCHAR(100) NULL,
    Total FLOAT NULL);

CREATE TABLE PEDIDOS (ID INT IDENTITY(1,1) PRIMARY KEY, valor DECIMAL(10,2) NOT NULL, FINALIZADO BIT NOT NULL DEFAULT 0);

CREATE TABLE PEDIDOS_EXCLUIDOS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    TOTAL INT NOT NULL,
    DATA_CRIACAO DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
```
- Efetuando a conexão com o banco de dados criado
```bash
npm install --save mssql
```
```javascript
const sql = require("mssql");

const config = {
  user: "adminuser",
  password: "SenhaForte!123",
  server: "meusqlserver123.database.windows.net",
  database: "db",
  port: 1433,
  options: {
    encrypt: true, // obrigatório no Azure
    trustServerCertificate: false
  },
  connectionTimeout: 30000
};

async function conectar() {
  try {
    await sql.connect(config);

    const result = await sql.query("SELECT GETDATE() as data");

    console.log(result.recordset);

  } catch (err) {
    console.error("Erro:", err);
  }
}

conectar();
```
- Exemplo para inserir um registro
```javascript
async function inserirRecibo() {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    request.input("Id", sql.Int, 1);
    request.input("Cliente", sql.NVarChar(100), "João Silva");
    request.input("Total", sql.Float, 150.75);

    await request.query(`
      INSERT INTO dbo.Recibos (Id, Cliente, Total)
      VALUES (@Id, @Cliente, @Total)
    `);

    console.log("Registro inserido com sucesso!");

  } catch (err) {
    console.error("Erro:", err);
  } finally {
    sql.close();
  }
}
```
***
### Azure Functions
- Comandos do **Azure** *CLI* (`az`)
```bash
az functionapp list --output table
az functionapp function list --name minha-func-app --resource-group rg-demo --output table
az functionapp function show --name minha-func-app --resource-group rg-demo --function-name helloFunction
```
- Criar uma aplicação do tipo **Azure Functions** via linha de comando
```bash
$env:AZURE_CORE_ONLY_SHOW_ERRORS = "true"

az group create --name rg-app-functions --location brazilsouth

az storage account create --name appfunctionsstorage --resource-group rg-app-functions --location brazilsouth --sku Standard_LRS

az functionapp create --resource-group rg-app-functions --consumption-plan-location brazilsouth --runtime node --functions-version 4 --name app-functions-$(Get-Date -Format 'yyyyMMddHHmmss') --storage-account appfunctionsstorage
```
- Para efetuar testes locais
```bash
npm install -g azure-functions-core-tools@4
npm install @azure/functions
npm install @azure/functions-extensions-azure-sql

func start
```
#### HTTP Functions
```javascript
const { app } = require('@azure/functions');

app.http('httpFunctionTeste', {
    methods: ['GET'],
    route: 'mensagem/{nome}',
    authLevel: 'function',
    handler: async (request, context) => {

        context.log("Recebida a requisicao", request.params.nome);
        const nome_requisicao = request.params.nome || 'Anonimo'
        const msg = request.query.get('msg') || 'Funcionou httpFunctionTeste';

        return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            jsonBody: { msg: `${nome_requisicao} ${msg}` }
        };
    }
});
```
- No exemplo acima, repara que podem ser passados dois parâmetros pela *URL* (`request.params.nome` e `request.query.get('msg')`)
```bash
http://localhost:7071/api/mensagem/Joao?msg=ok
```
#### Timer Function
```javascript
const { app } = require('@azure/functions');

app.timer('timerFunction', {
    schedule: '*/10 * * * * *',

    handler: async (myTimer, context) => {
        context.log('Executando a cada 10 segundos');
    }
});
```
#### Queue Function - Produtor
- Instalar o **Azurite** para testar o armazenamento localmente
```bash
npm install -g azurite
azurite --skipApiVersionCheck --location ./data
```
- Atualizar o `AzureWebJobsStorage` no arquivo `local.settings.json`
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```
- Código produtor
```javascript
const { app, output } = require('@azure/functions');

// Output binding para fila
const queueOutput = output.storageQueue({
    queueName: 'minha-fila',
    connection: 'AzureWebJobsStorage'
});

app.http('enviarMensagemFunction', {
    methods: ['POST'],
    authLevel: 'anonymous',

    extraOutputs: [queueOutput],

    handler: async (request, context) => {

        const body = await request.json();

        const mensagem = {
            cliente: body.cliente,
            total: body.total,
            data: new Date().toISOString()
        };

        // Envia para fila
        context.extraOutputs.set(queueOutput, mensagem);

        context.log("Mensagem enviada para fila:", mensagem);

        return {
            status: 200,
            body: {
                message: "Mensagem enviada com sucesso",
                data: mensagem
            }
        };
    }
});
```
#### Queue Function - Consumidor
- Código consumidor
```javascript
const { app } = require('@azure/functions');

app.storageQueue('processarFilaFunction', {
    queueName: 'minha-fila',
    connection: 'AzureWebJobsStorage',

    handler: async (message, context) => {

        context.log("Mensagem recebida da fila:");

        context.log(message);

        // Exemplo de processamento
        context.log(`Cliente: ${message.cliente}`);
        context.log(`Total: ${message.total}`);

        // Aqui você poderia:
        // - salvar no banco
        // - chamar outra API
        // - enviar email
    }
});
```
#### Storage
- Listar todas as contas de armazenamento
```bash
az storage account list --output table
az storage account list --query "[].name" -o tsv
az storage account show --name appfunctionsstorage --resource-group rg-app-functions
```
- Obter a string de conexão
```bash
az storage account show-connection-string --name appfunctionsstorage --resource-group rg-app-functions
```
- Criar um storage do tipo *queue*
```bash
az storage queue create --name fila-teste --account-name appfunctionsstorage --connection-string <COLOCAR_AQUI_STRING_CONEXAO>
``` 
#### Blob Function
- Criar o *storage* para armazenar arquivos do tipo *blob* (imagens, por exemplo)
```bash
az storage container create --name upload --account-name appfunctionsstorage --connection-string <COLOCAR_AQUI_STRING_CONEXAO>
```
- Para tornar o repositório público
```bash
az storage container set-permission --name upload --public-access blob --account-name appfunctionsstorage --connection-string <COLOCAR_AQUI_STRING_CONEXAO>
```
- Código **Nodejs** cliente para efetuar o upload do arquivo
- Criar o projeto
```bash
mkdir upload-blob
cd upload-blob
npm init -y
```
- Instalar as dependências
```bash
npm install --save @azure/storage-blob express multer
```
- Criar o arquivo para *upload* (no caso, o arquivo considerado se chama `arquivo.txt`)
- Implementar o código para efetuar o *upload*
```javascript
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

const connectionString = "UseDevelopmentStorage=true";
const containerName = "uploads";
const filePath = "./arquivo.txt";

async function uploadBlob() {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists();
        // Somente para teste (falha de segurança pois permite o acesso via URL direto ao arquivo!)
        await containerClient.setAccessPolicy('blob');
        const blobName = "arquivo-" + Date.now() + ".txt";
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadResponse = await blockBlobClient.uploadFile(filePath);
        console.log("Upload realizado com sucesso!", JSON.stringify(uploadResponse));
        console.log("Blob:", blobName);

    } catch (err) {
        console.error("Erro:", err.message);
    }
}

uploadBlob();
```
- O arquivo pode ser acessado por meio da URL `http://127.0.0.1:10000/devstoreaccount1/uploads/NOME_DO_ARQUIVO` (trocar o `NOME_DO_ARQUIVO`)
- Quando um arquivo é carregado (*upload*) então uma função do tipo `storageBlob` pode ser disparada
```javascript
const { app } = require('@azure/functions');

app.storageBlob('processarArquivoFunction', {
    path: 'uploads/{name}',
    connection: 'AzureWebJobsStorage',

    handler: async (blob, context) => {

        const fileName = context.triggerMetadata.name;

        context.log(`Arquivo recebido: ${fileName}`);
        context.log(`Tamanho: ${blob.length} bytes`);
        const content = blob.toString();

        context.log("Conteúdo:", content);
    }
});
```
- Para o ambiente de cloud, consultar o [Storage Account](https://portal.azure.com/#view/Microsoft_Azure_StorageHub/StorageHub.MenuView/~/StorageAccountsBrowse)
```bash
az storage account keys list --resource-group <resource-group> --account-name <storage-account>
```
#### Exemplo de uma aplicação com *frontend* para o upload de imagem
- Criar uma pasta `public` no projeto para conter os arquivos *HTML* e *CSS*
- Código HTML para enviar a imagem (index.html)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Upload de Imagem</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="container">
    <h1>Upload de Imagem</h1>

    <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="file" required>
        <button type="submit">Enviar</button>
    </form>
</div>

</body>
</html>
```
- Código HTML para exibir a imagem (view.html)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Imagem Enviada</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="container">
    <h1>Upload realizado!</h1>
    <img id="preview" />
    <br><br>
    <a href="/">Voltar</a>
</div>

<script>
    const params = new URLSearchParams(window.location.search);
    const img = params.get("img");

    document.getElementById("preview").src = "/uploads/" + img;
</script>

</body>
</html>
```
- Arquivo de estilos (`style.css`)
```css
body {
    font-family: Arial;
    background: #f2f2f2;
    display: flex;
    justify-content: center;
    margin-top: 100px;
}

.container {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 0 10px #ccc;
    text-align: center;
}

h1 {
    margin-bottom: 20px;
}

input[type="file"] {
    margin-bottom: 15px;
}

button {
    background: #0078d4;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background: #005fa3;
}

img {
    max-width: 300px;
    border-radius: 10px;
    box-shadow: 0 0 10px #ccc;
}
```
- Código **nodejs** para processar a imagem (`server.js`)
```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Pasta para salvar uploads
const upload = multer({ storage });

// Servir arquivos estáticos
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Rota de upload
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;

    // Redireciona para página de visualização
    res.redirect(`/view.html?img=${file.filename}`);
});

// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
```
- Adaptar o código acima para realizar o upload na **Azure**
### Armazenamento Configurações Locais e na Cloud
- Configurações podem ser armazenadas **localmente** no arquivo `local.settings.json`
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "DB_PASSWORD": "123456",
    "API_KEY": "minha-chave"
  }
}
```
- Podem ser acessadas via código desta forma
```javascript
const senha = process.env.DB_PASSWORD;
```
- Já no ambiente cloud essas configurações devem ser criadas de outra forma
```bash
az functionapp config appsettings set --name minha-function --resource-group rg-app-functions --settings DB_PASSWORD=123456 API_KEY=minha-chave
```
- Ou ainda, na forma de *secrets* utilizando o **Azure Key Vault**
```bash
az keyvault create --name meu-keyvault --resource-group rg-app-functions --location brazilsouth
az keyvault secret set --vault-name meu-keyvault --name DB_PASSWORD --value 123456
```
- Para acessar via código dentro das funções
```javascript
DB_PASSWORD=@Microsoft.KeyVault(SecretUri=https://meu-keyvault.vault.azure.net/secrets/DB_PASSWORD)
```
### Acesso Banco de Dados
- Configurar a string de conexão como uma variável de ambiente
```bash
az functionapp config appsettings set --name minha-function --resource-group rg-app-functions --settings SqlConnectionString="Server=tcp:meusqlserver123.database.windows.net,1433;Initial Catalog=db;User ID=adminuser;Password=SenhaForte!123;Encrypt=True;"
```
- Exemplo de uma function que utiliza o recurso de **binding** para efetuar uma consulta ao banco de dados
```javascript
const { app, input } = require('@azure/functions');

// Define o binding de saída (SQL)
const sqlInput = input.sql({
    commandText: 'SELECT Id, Cliente, Total FROM dbo.Recibos',
    connectionStringSetting: 'SqlConnectionString'
});

app.http('listarRecibosFunction', {
    methods: ['GET'],
    authLevel: 'anonymous',
    extraInputs: [sqlInput],
    handler: async (request, context) => {

        context.log("Buscando recibos no banco...");

        context.log(sqlInput);

        // Executa o binding automaticamente
        const recibos = context.extraInputs.get(sqlInput);

        context.log("Resultado: ", recibos);

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recibos)
        };
    }
});
```
- Editar o arquivo `local.settings.json` e incluir a configuração para acesso ao banco de dados `SqlConnectionString` dentro de `Values`
- Exemplo com passagem de parâmetros
```javascript
const { app, input } = require('@azure/functions');

// Binding com parâmetro
const sqlInput = input.sql({
    commandText: `
        SELECT Id, Cliente, Total 
        FROM dbo.Recibos
        WHERE Cliente = @cliente
    `,
    parameters: [
        {
            name: 'cliente',
            type: 'nvarchar',
            value: '{query.cliente}'
        }
    ],
    connectionStringSetting: 'SqlConnectionString'
});

app.http('listarRecibosFunction', {
    methods: ['GET'],
    authLevel: 'anonymous',

    extraInputs: [sqlInput],

    handler: async (request, context) => {

        context.log("Buscando recibos por cliente...");

        const cliente = request.query.get('cliente');
        context.log("Cliente recebido:", cliente);

        const recibos = context.extraInputs.get(sqlInput);

        return {
            status: 200,
            body: recibos
        };
    }
});
```
- Para inserir um registro
```javascript
const { app, output } = require('@azure/functions');

// Binding de saída (INSERT)
const sqlOutput = output.sql({
    commandText: 'dbo.Recibos', // nome da tabela
    connectionStringSetting: 'SqlConnectionString'
});

app.http('inserirReciboFunction', {
    methods: ['POST'],
    authLevel: 'anonymous',

    extraOutputs: [sqlOutput],

    handler: async (request, context) => {

        context.log("Inserindo novo recibo...");

        // Pegando dados do body (JSON)
        const body = await request.json();

        const novoRecibo = {
            Cliente: body.cliente,
            Total: body.total
        };

        // Envia para o binding (INSERT automático)
        context.extraOutputs.set(sqlOutput, [novoRecibo]);

        context.log("Recibo inserido:", novoRecibo);

        return {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                message: "Recibo inserido com sucesso",
                data: novoRecibo
            }
        };
    }
});
```
- Como ficaria uma aplicação que chama o *endpoint* para cadastrar um recibo (atualizar a **URL** com o endereço gerado para publicação na **Azure**)
```javascript
async function inserirRecibo() {
    const URL_POST = 'http://localhost:7071/api/inserirReciboFunction';
    const response = await fetch(URL_POST, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cliente: 'João da Silva',
            total: 250.90
        })
    });

    const data = await response.json();

    console.log("Resposta:", data);
}

inserirRecibo();
```
### Aplicação Cliente para Testes
- Criar uma aplicação cliente para interagir com as funções criadas
```bash
mkdir cliente-teste
cd cliente-teste
npm init -y
npm install --save axios
```
- Código exemplo
```javascript
const axios = require('axios');

async function enviarPost() {
    try {
        const resposta = await axios.post('http://localhost:3000/dados', {
            nome: 'Edson',
            valor: 100
        });

        console.log('Resposta da API:');
        console.log(resposta.data);

    } catch (erro) {
        console.error('Erro:', erro.message);
    }
}

enviarPost();
```
### Deploy Aplicação
- Efetuar login no [portal.azure.com](https://portal.azure.com/) *(pressionar control para abrir em nova página)*
- Abrir um **Cloud Shell** na barra de ferramentas superior dentro do **Portal Azure**
- Criar um grupo de recursos para incluir uma VM, recursos de rede, armazenamento, etc...
- Buscando por uma VM em uma configuração mais básica chamada `Standard_B1s`
```bash
$env:AZURE_CORE_ONLY_SHOW_ERRORS = "true"
az group create --name rg-app --location eastus

az vm list-skus --location eastus -o table

az vm create --resource-group rg-app --name vm-demo --image Canonical:0001-com-ubuntu-minimal-jammy:minimal-22_04-lts-gen2:latest --admin-username azureuser --assign-identity --generate-ssh-keys --public-ip-sku Standard

az vm create --resource-group rg-app --name vm-demo --image Ubuntu2204 --size Standard_DC1ds_v3 --admin-username azureuser --generate-ssh-keys
```
- Registrar *namespace* `Microsoft.OperationalInsights`
```bash
az provider register --namespace Microsoft.OperationalInsights
```
- Instalar o *plugin* **Azure Extensions** dentro do **VS Code**
- Efetuar o *login* via **VS Code** no **Azure** utilizando o mesmo usuário da faculdade (o mesmo que obteve os créditos)
- Criar um **App Service**
- Criar uma aplicação **Nodejs** de teste
```javascript
const express = require("express");

const app = express();

// IMPORTANTE: Azure define a porta dinamicamente
const port = process.env.PORT || 3000;

// Middleware para JSON
app.use(express.json());

// Rota principal
app.get("/", (req, res) => {
    res.send("<h1>🚀 App rodando no Azure com Express!</h1>");
});

// Rota de teste API
app.get("/api/hello", (req, res) => {
    res.json({
        message: "Hello World API",
        status: "ok"
    });
});

// Rota POST (exemplo)
app.post("/api/data", (req, res) => {
    res.json({
        received: req.body
    });
});

// Subir servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
```
- Efetuar o *deploy* da aplicação na **Azure**

### Virtualização
- Criar uma máquina virtual dentro do modelo **IaS* de um servidor *Windows* com *Internet Information Services* (IIS)
- Verificar as regiões disponíveis para a conta e os tamanhos de VMs
```bash
az policy assignment list

az vm list-skus --location <regiao> --resource-type virtualMachines --output table

az vm list-skus --location <regiao> --resource-type virtualMachines --size Standard_E2s_v3 \
--query "[].{Name:name, Restrictions:restrictions, CPUs:capabilities[?name=='vCPUs'].value | [0], MemoryGB:capabilities[?name=='MemoryGB'].value | [0]}" \
--output table
```
- Como serão criados vários recursos, é importante agrupá-los em um *resource group* (`iis_server`)
```bash
az group create --name iis_server --location brazilsouth
```
- Criar uma rede virtual
```bash
az network vnet create \
  --resource-group iis_server \
  --name vm-iis \
  --address-prefix 10.0.0.0/16 \
  --subnet-name vm-iis-subnet \
  --subnet-prefix 10.0.1.0/24

az network vnet show \
  --resource-group iis_server \
  --name vm-iis \
  --output table

```
- Detalhe sobre o CIDR: o que significa /16 e /24
- /16 = 11111111.11111111.00000000.00000000 = 255.255.0.0
- /24 = 11111111.11111111.11111111.00000000 = 255.255.255.0
- Criar o *security group*
```bash
az network nsg create \
  --resource-group iis_server \
  --name nsg-iis
```
- Liberar **HTTP*
```bash
az network nsg rule create \
  --resource-group iis_server \
  --nsg-name nsg-iis \
  --name Allow-HTTP \
  --priority 1000 \
  --direction Inbound \
  --access Allow \
  --protocol Tcp \
  --destination-port-ranges 80
```
- Liberar o **Remote Desktop**
```bash
az network nsg rule create \
  --resource-group iis_server \
  --nsg-name nsg-iis \
  --name Allow-RDP \
  --priority 1100 \
  --direction Inbound \
  --access Allow \
  --protocol Tcp \
  --destination-port-ranges 3389
```
- Mostrar as regras atualizadas
```bash
az network nsg rule list \
  --resource-group iis_server \
  --nsg-name nsg-iis \
  --output table
```
- Criar o IP público
```bash
az network public-ip create \
  --resource-group iis_server \
  --name pip-iis \
  --sku Standard \
  --allocation-method Static

az network public-ip show \
  --resource-group iis_server \
  --name pip-iis \
  --query ipAddress \
  --output tsv
```
- Criar a VM (será solicitado uma senha para a VM - utilizar VMT&ste!1234)
```bash
az vm create \
  --resource-group iis_server \
  --name iis-vm-1 \
  --location brazilsouth \
  --zone 1 \
  --size Standard_E2s_v3 \
  --image MicrosoftWindowsServer:WindowsServer:2025-datacenter-g2:latest \
  --admin-username azureuser \
  --security-type TrustedLaunch \
  --enable-secure-boot true \
  --enable-vtpm true \
  --storage-sku Premium_LRS \
  --os-disk-size-gb 127 \
  --vnet-name vm-iis \
  --subnet vm-iis-subnet \
  --public-ip-address pip-iis \
  --nic-delete-option delete \
  --os-disk-delete-option delete
```
- Instalar o IIS
```bash
az vm extension set \
  --resource-group iis_server \
  --vm-name iis-vm-1 \
  --name CustomScriptExtension \
  --publisher Microsoft.Compute \
  --version 1.10 \
  --settings '{"commandToExecute":"powershell -ExecutionPolicy Bypass -Command \"Install-WindowsFeature -Name Web-Server -IncludeManagementTools\""}'

az vm extension list \
  --resource-group $RESOURCE_GROUP \
  --vm-name $VM_NAME \
  --output table

```
- Criar uma página html
```bash
az vm extension set \
  --resource-group iis_server \
  --vm-name $VM_NAME \
  --name CustomScriptExtension \
  --publisher Microsoft.Compute \
  --version 1.10 \
  --settings '{"commandToExecute":"powershell -ExecutionPolicy Bypass -Command \"Set-Content -Path C:\\inetpub\\wwwroot\\index.html -Value ''<html><head><title>Azure IaaS Lab</title></head><body><h1>Servidor IIS no Azure</h1><p>Esta página está sendo servida por uma VM Windows Server.</p><p>Laboratório de IaaS.</p></body></html>''\""}'
```
### Balanceamento de Carga
- Criar um *load balancer*
```bash
az network lb create \
  --resource-group iis_server \
  --name lb-web \
  --sku Standard \
  --public-ip-address pip-lb \
  --frontend-ip-name frontend \
  --backend-pool-name backend
```
- Criar um novo IP para atender ao *load balancer*
```bash
az network public-ip create \
  --resource-group iis_server \
  --name pip-lb \
  --sku Standard \
  --allocation-method Static
```
- Definir um *pool* onde as duas VMs serão associadas
```bash
az network nic ip-config address-pool add \
  --address-pool backend \
  --ip-config-name ipconfig1 \
  --nic-name NIC_DA_VM1 \
  --resource-group iis_server \
  --lb-name lb-web
```



