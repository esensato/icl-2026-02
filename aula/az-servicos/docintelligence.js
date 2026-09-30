require("dotenv").config();

const DocumentIntelligence = require("@azure-rest/ai-document-intelligence").default;

const {
    getLongRunningPoller,
    isUnexpected,
} = require("@azure-rest/ai-document-intelligence");

const endpoint = process.env.DOCUMENT_INTELLIGENCE_ENDPOINT;
const key = process.env.DOCUMENT_INTELLIGENCE_KEY;
const documentUrlRead = "https://github.com/Azure-Samples/cognitive-services-REST-api-samples/raw/master/curl/form-recognizer/rest-api/invoice.pdf";

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