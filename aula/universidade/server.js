const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
    console.log(`Universidade Nova Horizonte`);
    console.log(`Acesse: http://localhost:${PORT}`);
});