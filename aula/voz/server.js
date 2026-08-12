const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
require("dotenv").config();

const TextToSpeechV1 = require("ibm-watson/text-to-speech/v1");
const { IamAuthenticator } = require("ibm-watson/auth");

const app = express();

app.use(express.json());

app.use(express.static("public"));
app.use("/audio", express.static(path.join(__dirname, "audio")));

const textToSpeech = new TextToSpeechV1({
    authenticator: new IamAuthenticator({
        apikey: process.env.IBM_API_KEY
    }),
    serviceUrl: process.env.IBM_URL
});

app.post("/voz", async (req, res) => {

    try {

        const { texto } = req.body;

        if (!texto) {
            return res.status(400).json({
                erro: "Texto não informado."
            });
        }

        const params = {
            text: texto,
            accept: "audio/mp3",
            voice: "fr-CA_LouiseV3Voice"
        };

        const response = await textToSpeech.synthesize(params);

        const buffer = await streamToBuffer(response.result);

        const nomeArquivo =
            crypto.randomUUID() + ".mp3";

        const caminho =
            path.join(__dirname, "audio", nomeArquivo);
        fs.writeFileSync(caminho, buffer);

        res.json({
            sucesso: true,
            audio: "/audio/" + nomeArquivo
        });

    } catch (e) {

        console.error(e);

        res.status(500).json({
            erro: "Erro ao sintetizar voz."
        });

    }

});

function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {

        const chunks = [];

        stream.on("data", chunk => chunks.push(chunk));

        stream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        stream.on("error", reject);

    });
}

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor iniciado.");
});