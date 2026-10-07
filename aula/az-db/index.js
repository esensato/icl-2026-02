const sql = require("mssql");

const config = {
    user: "appuser",
    password: "SenhaForte$123",
    server: "meusqlserver1234.database.windows.net",
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

//conectar();

//inserirRecibo();

listarRecibos();