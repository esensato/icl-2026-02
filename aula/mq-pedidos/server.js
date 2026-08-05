require('dotenv').config();
const axios = require('axios');
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/pedido", (req, res) => {

    enviarMensagem(JSON.stringify(req.body, null, 2), res);

});

app.get("/pedido", (req, res) => {

    receberMensagem(res);

});

const enviarMensagem = (message, res) => {

    res.json({
        sucesso: true,
        mensagem: "Pedido recebido com sucesso!",
        pedido: message
    });


}

const receberMensagem = (res) => {

    res.json({
        "nome": "Carlos Silva",
        "livros": [
            "Docker sem Mistérios",
            "Terraform para Humanos",
            "Cloud Native Descomplicado"
        ]
    });

}

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
