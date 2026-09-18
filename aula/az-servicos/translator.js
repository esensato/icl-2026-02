require("dotenv").config();
const Client = require("@azure-rest/ai-translation-text").default;
const { AzureKeyCredential } = require('@azure/core-auth');

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

const credential = new AzureKeyCredential(key);
const client = new Client(endpoint, credential);

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
    console.log(JSON.stringify(result, null, 2));

    // ========================================
    // Mostra a tradução
    // ========================================

    const translation = result[0].translations[0];

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