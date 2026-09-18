require("dotenv").config();

const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");

const endpoint = process.env.LANGUAGE_ENDPOINT;
const key = process.env.LANGUAGE_KEY;

const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key));

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