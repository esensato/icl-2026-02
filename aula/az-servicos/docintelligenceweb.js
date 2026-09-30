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