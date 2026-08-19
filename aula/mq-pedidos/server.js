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
// Variáveis gerais para acesso à fila
const restUrl = process.env.MQ_REST_URL;
const qmgrName = process.env.MQ_QMGR;
const queueName = process.env.MQ_QUEUE_NAME;
const username = process.env.MQ_USER;
const password = process.env.MQ_PASSWORD;

const endpoint = `${restUrl}/messaging/qmgr/${qmgrName}/queue/${queueName}/message`;

const enviarMensagem = (message, res) => {

    // Configuração da requisição
    const config = {
        method: 'post',
        url: endpoint,
        auth: {
            username: username,
            password: password
        },
        headers: {
            'Content-Type': 'text/plain',
            'ibm-mq-rest-csrf-token': 'value' // Token CSRF obrigatório
        },
        data: message
    };

    // Enviar mensagem
    console.log('Enviando mensagem...\n');

    axios(config).then(response => {
        console.log('✓ Mensagem enviada com sucesso!');
        console.log('─────────────────────────────────────');
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Conteúdo: "${message}"`);
        console.log(`Tamanho: ${message.length} bytes`);

        // Informações adicionais do response
        if (response.headers['ibm-mq-md-messageid']) {
            console.log(`Message ID: ${response.headers['ibm-mq-md-messageid']}`);
        }
        console.log('─────────────────────────────────────\n');

        res.json({
            sucesso: true,
            mensagem: "Pedido recebido com sucesso!",
            pedido: message
        });
    }).catch(error => {
        console.error('✗ Erro ao enviar mensagem:');

        if (error.response) {
            // Erro da API
            console.error(`Status: ${error.response.status}`);
            console.error(`Mensagem: ${error.response.statusText}`);

            if (error.response.data) {
                console.error('Detalhes:', error.response.data);
            }
        } else if (error.request) {
            // Erro de rede
            console.error('Erro de conexão. Verifique a URL e conectividade.');
            console.error('URL:', endpoint);
        } else {
            // Outro erro
            console.error('Erro:', error.message);
        }

        process.exit(1);
    });

}

const receberMensagem = (res) => {

    const config = {
        method: 'delete',
        url: endpoint,
        auth: {
            username: username,
            password: password
        },
        headers: {
            'ibm-mq-rest-csrf-token': 'value' // Token CSRF obrigatório
        },
        // Timeout de 30 segundos para esperar por mensagens
        timeout: 30000
    };

    console.log('Aguardando mensagem...');

    axios(config).then(response => {

        console.log(`\n✓ Mensagem Recebida`);
        console.log('─────────────────────────────────────');
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Conteúdo: "${JSON.stringify(response.data, null, 2)}"`);

        // Informações adicionais dos headers
        if (response.headers['ibm-mq-md-messageid']) {
            console.log(`Message ID: ${response.headers['ibm-mq-md-messageid']}`);
        }
        if (response.headers['ibm-mq-md-correlationid']) {
            console.log(`Correlation ID: ${response.headers['ibm-mq-md-correlationid']}`);
        }
        if (response.headers['ibm-mq-md-format']) {
            console.log(`Format: ${response.headers['ibm-mq-md-format']}`);
        }
        if (response.headers['ibm-mq-md-putdate']) {
            console.log(`Put Date: ${response.headers['ibm-mq-md-putdate']}`);
        }
        if (response.headers['ibm-mq-md-puttime']) {
            console.log(`Put Time: ${response.headers['ibm-mq-md-puttime']}`);
        }

        console.log('─────────────────────────────────────\n');

        res.json(response.data);

    }).catch(error => {
        if (error.response) {
            if (error.response.status === 404) {
                console.log(`ℹ Nenhuma mensagem disponível na fila\n`);
                return false;
            } else {
                console.error(`✗ Erro ao receber mensagem:`);
                console.error(`Status: ${error.response.status}`);
                console.error(`Mensagem: ${error.response.statusText}`);

                if (error.response.data) {
                    console.error('Detalhes:', error.response.data);
                }
            }
        } else if (error.code === 'ECONNABORTED') {
            console.log(`ℹ Timeout - Nenhuma mensagem recebida no período\n`);
            return false;
        } else if (error.request) {
            console.error(`✗ Erro de conexão. Verifique a URL e conectividade.`);
            console.error('URL:', endpoint);
            return false;
        } else {
            console.error(`✗ Erro:`, error.message);
            return false;
        }
    });
}


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
