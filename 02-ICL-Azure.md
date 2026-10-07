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
require("dotenv").config();

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

const PORT = process.env.PORT || 3000;

const endpoint = process.env.DOCUMENT_INTELLIGENCE_ENDPOINT;
const key = process.env.DOCUMENT_INTELLIGENCE_KEY;

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
            `${endpoint}/formrecognizer/documentModels/prebuilt-receipt:analyze?api-version=2023-07-31`,
            fileData,
            {
                headers: {
                    "Ocp-Apim-Subscription-Key": key,
                    "Content-Type": "application/octet-stream"
                }
            }
        );

        const operationLocation = response.headers["operation-location"];

        let result;
        while (true) {
            const poll = await axios.get(operationLocation, {
                headers: {
                    "Ocp-Apim-Subscription-Key": key
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
az provider register --namespace Microsoft.sql

az account list-locations --output table

az sql db list-editions --location brazilsouth --output table

az group create --name rg-demo --location brazilsouth

az sql server create --name meusqlserver123 --resource-group rg-demo --location brazilsouth --admin-user adminuser --admin-password SenhaForte$123

az sql server firewall-rule create --resource-group rg-demo --server meusqlserver123 --name AllowMyIP --start-ip-address 0.0.0.0 --end-ip-address 255.255.255.255

az sql db create --resource-group rg-demo --server meusqlserver123 --name db --service-objective Basic

az sql db list --resource-group rg-demo --server meusqlserver123 --output table
```
- Para remover um grupo de recursos (e todos os recursos associados a ele!)
```bash
az group delete --name rg-demo --yes --no-wait
```
- Instalar o `sqlcmd`
```bash
wget https://github.com/microsoft/go-sqlcmd/releases/download/v1.10.0/sqlcmd-linux-amd64.tar.bz2

tar -xvf sqlcmd-linux-amd64.tar.bz2

```
- Efretuar a conexão com o banco de dados criado
```bash
./sqlcmd -S meusqlserver123.database.windows.net -d db -U adminuser -P SenhaForte$123
```
```sql
CREATE USER appuser WITH PASSWORD = 'SenhaForte$123';
GO

ALTER ROLE db_datareader ADD MEMBER appuser;
GO

ALTER ROLE db_datawriter ADD MEMBER appuser;
GO

```

- Código *SQL* para criar as tabelas utilizadas nos exemplos
```sql
CREATE TABLE RECIBOS (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Cliente NVARCHAR(100) NULL,
    Total FLOAT NULL);

CREATE TABLE PEDIDOS (ID INT IDENTITY(1,1) PRIMARY KEY, valor DECIMAL(10,2) NOT NULL, FINALIZADO BIT NOT NULL DEFAULT 0);

CREATE TABLE PEDIDOS_EXCLUIDOS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    TOTAL INT NOT NULL,
    DATA_CRIACAO DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO
```
- Efetuando a conexão com o banco de dados criado
```bash
npm install --save mssql
```
```javascript
const sql = require("mssql");

const config = {
  user: "appuser",
  password: "SenhaForte$123",
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
    process.exit(0);

  } catch (err) {
    console.error("Erro:", err);
    process.exit(1);
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

        request.input("Cliente", sql.NVarChar(100), "João Silva");
        request.input("Total", sql.Float, 150.75);

        await request.query(`INSERT INTO RECIBOS (Cliente, Total) VALUES (@Cliente, @Total)`);

        console.log("Registro inserido com sucesso!");
        process.exit(0);

    } catch (err) {
        console.error("Erro:", err);
    } finally {
        sql.close();
    }
}
```
- Exemplo para consultar recibos
```javascript
async function listarRecibos() {
    try {

        await sql.connect(config);

        const request = new sql.Request();
        const resultado = await request.query(`SELECT * FROM RECIBOS`);
        console.log(resultado.recordset);
        process.exit(0);

    } catch (err) {
        console.error("Erro:", err);
    } finally {
        sql.close();
    }
}
```
***
### Azure Functions
- Verificar as regiões disponíveis para a conta por meio das políticas
```bash
az policy assignment list --query "[].parameters.listOfAllowedLocations.value[]" -o tsv
```
- Criar uma variável de ambiente com a localização mais próxima obtida da lista acima
```bash
export LOCATION=
```
- Criar uma aplicação do tipo **Azure Functions** via linha de comando 
```bash
export AZURE_CORE_ONLY_SHOW_ERRORS=true

export STORAGE_NAME=stf$(date +%s)
export FUNCTION_APP_NAME=app-functions-$(date +%s)
export RESOURCE_GROUP=az-functions

az group create --name $RESOURCE_GROUP --location $LOCATION

az storage account create --name $STORAGE_NAME --resource-group $RESOURCE_GROUP --location $LOCATION --sku Standard_LRS

az functionapp create --resource-group $RESOURCE_GROUP --consumption-plan-location $LOCATION --runtime node --functions-version 4 --name $FUNCTION_APP_NAME --storage-account $STORAGE_NAME

az functionapp show \
  --resource-group $RESOURCE_GROUP \
  --name $FUNCTION_APP_NAME \
  --query "{Name:name,State:state,Host:defaultHostName}" \
  --output table

```

- Criar uma função local para teste
```bash
mkdir hello-node
cd hello-node

cat > package.json <<'EOF'
{
  "name": "hello-node-function",
  "version": "1.0.0",
  "description": "Hello World Azure Function",
  "main": "src/functions/hello.js",
  "scripts": {
    "start": "func start"
  },
  "dependencies": {
    "@azure/functions": "^4.0.0"
  }
}
EOF

mkdir -p src/functions

cat > src/functions/hello.js <<'EOF'
const { app } = require('@azure/functions');

app.http('hello', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        return {
            status: 200,
            jsonBody: {
                message: 'Hello World from Azure Functions!',
                runtime: 'Node.js'
            }
        };
    }
});
EOF

npm install

zip -r function.zip . -x "node_modules/.cache/*"
```
- Publicar a função
```bash
az functionapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $FUNCTION_APP_NAME \
  --src function.zip
```
- Obter o endereço IP de acesso à função publicada
```bash
HOSTNAME=$(az functionapp show \
  --resource-group $RESOURCE_GROUP \
  --name $FUNCTION_APP_NAME \
  --query defaultHostName \
  --output tsv)

echo $HOSTNAME

curl "https://$HOSTNAME/api/hello"
```
#### Ambiente Local (VS Code)
- Instalar a *extension* **Azure Functions** dentro do **VS Code**
- Para efetuar testes locais
```bash
npm i -g azure-functions-core-tools@4

func init az-functions --worker-runtime javascript

cd az-functions
```
#### HTTP Functions
- Criar a implementação com o nome `index.js` no diretório `src/functions`
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
- Iniciar o ambiente de testes locais
```bash
func start
```
- Verificar o resultado na URL `http://localhost:7071/api/mensagem/Joao?msg=ok`
#### Timer Function
- Funções que executam de tempos em tempos conforme programação
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
            jsonBody: {
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
- Para testar o envio da mensagem para a fila
```bash
curl -X POST \
  http://localhost:7071/api/enviarMensagemFunction \
  -H "Content-Type: application/json" \
  -d '{"cliente":"Edson","total":1000.00}'
```
#### Storage
- Listar todas as contas de armazenamento
```bash
az storage account list --query "[].{Name:name,Location:location,Kind:kind}" --output table
az storage account show --name $STORAGE_NAME --resource-group $RESOURCE_GROUP
```
- Obter a string de conexão
```bash
export AZURE_STORAGE_CONNECTION_STRING=$(
  az storage account show-connection-string \
    --name "$STORAGE_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query connectionString \
    --output tsv
)

echo $AZURE_STORAGE_CONNECTION_STRING
```
- Criar um storage do tipo *queue*
```bash
az storage queue create --name fila-teste --account-name $STORAGE_NAME --connection-string $AZURE_STORAGE_CONNECTION_STRING
``` 
#### Blob Function
- Criar o *storage* para armazenar arquivos do tipo *blob* (imagens, por exemplo)
```bash
az storage container create --name upload --account-name $STORAGE_NAME --connection-string $AZURE_STORAGE_CONNECTION_STRING
```
- Para tornar o repositório público
```bash
az storage account update \
  --name $STORAGE_NAME  \
  --resource-group $RESOURCE_GROUP \
  --allow-blob-public-access true

az storage container set-permission \
  --name upload \
  --public-access blob \
  --account-name $STORAGE_NAME \
  --connection-string $AZURE_STORAGE_CONNECTION_STRING

az storage account show \
  --name $STORAGE_NAME \
  --resource-group $RESOURCE_GROUP \
  --query allowBlobPublicAccess \
  --output tsv
```
- Código **Nodejs** cliente para efetuar o upload do arquivo
- Criar o projeto
```bash
mkdir az-upload-blob
cd az-upload-blob
npm init -y
```
- Instalar as dependências
```bash
npm install --save @azure/storage-blob express multer env
```
- Criar o arquivo para *upload* (no caso, o arquivo considerado se chama `arquivo.txt`)
- Implementar o código para efetuar o *upload*
```javascript
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

const connectionString = "UseDevelopmentStorage=true";
const containerName = "upload";
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
- Para que o arquivo seja enviado para o *storage* na **Azure** basta informar a string de conexão da conta de armazenamento
```javascript
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
```
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
### Virtualização
- Criar uma máquina virtual dentro do modelo **IaS* de um servidor *Windows* com *Internet Information Services* (IIS)
- Verificar as localizações disponíveis para a conta por meio das políticas
```bash
```bash
az policy assignment list --query "[].parameters.listOfAllowedLocations.value[]" -o tsv
```
- Escolher uma localização e definir em uma variável de ambiente
```bash
export LOCATION=
```
- Objetivo: encontrar qual a região disponível oferece uma VM com tamanho mínimo `Standard_E2s_v4`
- Pesquisar as máquinas virtuais e seus recursos dentro de uma região
```bash
az vm list-skus \
  --resource-type virtualMachines \
  --query "[?capabilities[?name=='vCPUs' && value=='1'] || capabilities[?name=='vCPUs' && value=='2']].{SKU:name,Family:family,vCPUs:capabilities[?name=='vCPUs'].value | [0],MemoryGB:capabilities[?name=='MemoryGB'].value | [0],Restrictions:restrictions}" \
  --output table \
  --location $LOCATION
```
- Verificar se existem *quotas* disponíveis para a máquina virtual selecionada anteriormente 
```bash
az vm list-usage \
  --query "[?to_number(limit) > \`0\`].{Quota:name.localizedValue,Current:currentValue,Limit:limit}" \
  --output table \
  --location $LOCATION

az vm list-usage \
  --query "[?contains(name.value, 'EC2')].{Quota:name.localizedValue,Current:currentValue,Limit:limit}" \
  --output table \
  --location $LOCATION
```
- Como serão criados vários recursos, é importante agrupá-los em um *resource group* (`iis_server`)
```bash
export RESOURCE_GROUP=iis_server
az group create --name $RESOURCE_GROUP --location $LOCATION

```
- Criar uma rede virtual
```bash
export VNET_NAME=vm-iis-net
export SUB_NET_NAME=vm-iis-subnet

az network vnet create \
  --resource-group $RESOURCE_GROUP \
  --name $VNET_NAME \
  --address-prefix 10.0.0.0/16 \
  --subnet-name $SUB_NET_NAME \
  --subnet-prefix 10.0.1.0/24

az network vnet show \
  --resource-group $RESOURCE_GROUP \
  --name $VNET_NAME \
  --output table
```
- Detalhe sobre o CIDR: o que significa /16 e /24
- /16 = 11111111.11111111.00000000.00000000 = 255.255.0.0
- /24 = 11111111.11111111.11111111.00000000 = 255.255.255.0
- Criar o *security group*
```bash
export NSG_NAME=nsg-iis
az network nsg create \
  --resource-group $RESOURCE_GROUP \
  --name $NSG_NAME
```
- Liberar **HTTP*
```bash
az network nsg rule create \
  --resource-group $RESOURCE_GROUP \
  --nsg-name $NSG_NAME \
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
  --resource-group $RESOURCE_GROUP \
  --nsg-name $NSG_NAME \
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
  --resource-group $RESOURCE_GROUP \
  --nsg-name $NSG_NAME \
  --output table
```
- Criar o IP público
```bash
export PIP_NAME=pip-iis

az network public-ip create \
  --resource-group $RESOURCE_GROUP \
  --name $PIP_NAME \
  --sku Standard \
  --allocation-method Static

az network public-ip show \
  --resource-group $RESOURCE_GROUP \
  --name $PIP_NAME \
  --query ipAddress \
  --output tsv
```
- Criar a VM (será solicitado uma senha para a VM - utilizar VMT&ste!1234)
```bash

export VM1_NAME=iis-vm-1

az vm create \
  --resource-group $RESOURCE_GROUP \
  --name $VM1_NAME \
  --zone 1 \
  --size Standard_D2as_v4 \
  --image MicrosoftWindowsServer:WindowsServer:2025-datacenter-g2:latest \
  --admin-username azureuser \
  --security-type TrustedLaunch \
  --enable-secure-boot true \
  --enable-vtpm true \
  --storage-sku Premium_LRS \
  --os-disk-size-gb 127 \
  --vnet-name $VNET_NAME \
  --subnet $SUB_NET_NAME \
  --public-ip-address $PIP_NAME \
  --nsg $NSG_NAME \
  --nic-delete-option delete \
  --os-disk-delete-option delete \
  --location $LOCATION
```
- Instalar o IIS
```bash
az vm extension set \
  --resource-group $RESOURCE_GROUP \
  --vm-name $VM1_NAME \
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
- Criar um novo IP para atender ao *load balancer*
```bash
export LB_NAME=lb-web
export LB_PIP_NAME=pip-lb

az network public-ip create \
  --resource-group $RESOURCE_GROUP \
  --name $LB_PIP_NAME \
  --sku Standard \
  --allocation-method Static

az network public-ip show \
  --resource-group $RESOURCE_GROUP \
  --name $LB_PIP_NAME \
  --query ipAddress \
  --output tsv
```
- Criar o *load balancer*
```bash
az network lb create \
  --resource-group iis_server \
  --name lb-web \
  --sku Standard \
  --public-ip-address pip-lb \
  --frontend-ip-name frontend \
  --backend-pool-name backend
```
- Descobrir as interfaces de rede das VMs
```bash
az vm show \
  --resource-group $RESOURCE_GROUP \
  --name $VM1_NAME \
  --show-details \
  --query networkProfile.networkInterfaces[0].id \
  --output tsv

az vm show \
  --resource-group $RESOURCE_GROUP \
  --name $VM2_NAME \
  --show-details \
  --query networkProfile.networkInterfaces[0].id \
  --output tsv

export NIC1_ID=$(az vm show \
  --resource-group $RESOURCE_GROUP \
  --name $VM1_NAME \
  --query networkProfile.networkInterfaces[0].id \
  --output tsv)

export NIC2_ID=$(az vm show \
  --resource-group $RESOURCE_GROUP \
  --name $VM2_NAME \
  --query networkProfile.networkInterfaces[0].id \
  --output tsv)

export NIC1_NAME=$(basename $NIC1_ID)
export NIC2_NAME=$(basename $NIC2_ID)
```
- Definir um *pool* onde as duas VMs serão associadas
```bash
az network nic ip-config address-pool add \
  --address-pool backend \
  --ip-config-name ipconfig1 \
  --nic-name $NIC1_NAME \
  --resource-group $RESOURCE_GROUP \
  --lb-name $LB_NAME

az network nic ip-config address-pool add \
  --address-pool backend \
  --ip-config-name ipconfig1 \
  --nic-name $NIC2_NAME \
  --resource-group $RESOURCE_GROUP \
  --lb-name $LB_NAME
```
- Criar um *health probe*
```bash
az network lb probe create \
  --resource-group $RESOURCE_GROUP \
  --lb-name $LB_NAME \
  --name http-probe \
  --protocol Http \
  --port 80 \
  --path
```
- Definir a regra de balanceamento
```bash
az network lb rule create \
  --resource-group $RESOURCE_GROUP \
  --lb-name $LB_NAME \
  --name http-rule \
  --protocol Tcp \
  --frontend-port 80 \
  --backend-port 80 \
  --frontend-ip-name frontend \
  --backend-pool-name backend \
  --probe-name http-probe
```
- Verificar todas as configurações
```bash
az network lb show \
  --resource-group $RESOURCE_GROUP \
  --name $LB_NAME \
  --output table

az network lb address-pool show \
  --resource-group $RESOURCE_GROUP \
  --lb-name $LB_NAME \
  --name backend \
  --output json

az network lb probe list \
  --resource-group $RESOURCE_GROUP \
  --lb-name $LB_NAME \
  --output table

az network lb rule list \
  --resource-group $RESOURCE_GROUP \
  --lb-name $LB_NAME \
  --output table
```
- Obter o IP público do *load balancer*
```bash
export LB_IP=$(az network public-ip show \
  --resource-group $RESOURCE_GROUP \
  --name $LB_PIP_NAME \
  --query ipAddress \
  --output tsv)

echo $LB_IP
```
- Testar o balanceamento
```bash
for i in {1..10}; do
  curl -s http://$LB_IP | grep "<h1>"
done
```
- Testar a alta disponibilidade
```bash
az vm stop \
  --resource-group $RESOURCE_GROUP \
  --name $VM1_NAME

curl http://$LB_IP

az vm start \
  --resource-group $RESOURCE_GROUP \
  --name $VM1_NAME
```
### Azure Kubernetes Service (AKS)
- Verificar as aplicações básicas
```bash
docker --version
node --version
kubectl version --client
```
- Criar as variáveis de ambiente utilizadas
```bash
export RESOURCE_GROUP=rg-aula-aks
export LOCATION=eastus
export AKS_NAME=aks-aula
export ACR_NAME=acraulaaks$RANDOM
```
- Criar o grupo de recursos
```bash
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```
- Criar o **Azure Container Registry (ACR)**
```bash
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic

az acr show \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --output table
```
- Obter o endereço do **ACR**
```bash
az acr show \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --query loginServer \
  --output tsv
```
- Criar o *cluster*
```bash
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME \
  --node-count 1 \
  --generate-ssh-keys
```
- Conectando ao *cluster*
```bash
az aks get-credentials \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME
```
- Cria uma aplicação simples em **Nodejs**
```bash
mkdir hello-kubernetes
cd hello-kubernetes
npm init -y
npm install express
cat >>index.js <EOF
const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World from Node.js on Kubernetes!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF
```
- Criar o *Dockerfile*
```yaml
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
```
- Criar a imagem **Docker**
```bash
ACR_LOGIN_SERVER=$(az acr show \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --query loginServer \
  --output tsv)

echo $ACR_LOGIN_SERVER

docker build \
  -t $ACR_LOGIN_SERVER/hello-node:v1 .

docker images
```
- Publicar a imagem no **ACR**
```bash
az acr login --name $ACR_NAME

docker push $ACR_LOGIN_SERVER/hello-node:v1

az acr repository list \
  --name $ACR_NAME \
  --output table

az acr repository show-tags \
  --name $ACR_NAME \
  --repository hello-node \
  --output table
```
- Conceder a permissão ao *cluster* para acessar o **ACR**
```bash
az aks update \
  --resource-group $RESOURCE_GROUP \
  --name $AKS_NAME \
  --attach-acr $ACR_NAME
```
- Criar o `deployment.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: hello-node

spec:
  replicas: 2

  selector:
    matchLabels:
      app: hello-node

  template:
    metadata:
      labels:
        app: hello-node

    spec:
      containers:
        - name: hello-node
          image: ACR_LOGIN_SERVER/hello-node:v1
          ports:
            - containerPort: 3000
```
- Aplicar o *deployment*
```bash
kubectl apply -f deployment.yaml

kubectl get deployments

kubectl get pods
```
- Criar o `service.yaml`
```bash
apiVersion: v1
kind: Service

metadata:
  name: hello-node

spec:
  type: LoadBalancer

  selector:
    app: hello-node

  ports:
    - port: 80
      targetPort: 3000
```
- Aplicar o *service*
```bash
kubectl apply -f service.yaml

kubectl get service
```
- Obter o endereço de acesso à aplicação
```bash
kubectl get service hello-node -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```











