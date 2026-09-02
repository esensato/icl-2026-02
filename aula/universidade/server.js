const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.post("/teste", (req, res) => {

    const userData = req.body;

    console.log(userData);

    // Respond back to the client
    res.status(201).json({
        message: "Data received successfully!",
        data: userData
    });

});

app.listen(PORT, () => {
    console.log(`Universidade Nova Horizonte`);
    console.log(`Acesse: http://localhost:${PORT}`);
});