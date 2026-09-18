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