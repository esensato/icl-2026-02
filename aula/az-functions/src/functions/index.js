const { app, output } = require('@azure/functions');

// Output binding para fila
const queueOutput = output.storageQueue({
    queueName: 'minha-fila',
    connection: 'AzureWebJobsStorage'
});

app.http('enviarMensagemFunction', {
    methods: ['POST'],
    authLevel: 'anonymous',
    extraOutputs: [queueOutput],
    handler: async (request, context) => {

        const body = await request.json();

        const mensagem = {
            cliente: body.cliente,
            total: body.total,
            data: new Date().toISOString()
        };

        // Envia para fila
        context.extraOutputs.set(queueOutput, mensagem);

        context.log("Mensagem enviada para fila:", mensagem);

        return {
            status: 200,
            jsonBody: {
                message: "Mensagem enviada com sucesso",
                data: mensagem
            }
        };
    }
});


app.storageQueue('processarFilaFunction', {
    queueName: 'minha-fila',
    connection: 'AzureWebJobsStorage',

    handler: async (message, context) => {

        context.log("Mensagem recebida da fila:");

        context.log(message);

        // Exemplo de processamento
        if (message.cliente) {
            context.log(`Cliente: ${message.cliente}`);
            context.log(`Total: ${message.total}`);
        }

        // Aqui você poderia:
        // - salvar no banco
        // - chamar outra API
        // - enviar email
    }
});

app.timer('timerFunction', {
    schedule: '*/10 * * * * *',
    extraOutputs: [queueOutput],
    handler: async (myTimer, context) => {

        const mensagem = {
            origem: "timer",
            data: new Date().toISOString()
        };

        // Envia para fila
        context.extraOutputs.set(queueOutput, mensagem);

        context.log('Executando a cada 10 segundos');
    }
});

app.http('httpFunctionTeste', {
    methods: ['GET'],
    route: 'mensagem/{nome}',
    authLevel: 'function',
    handler: async (request, context) => {

        context.log("Recebida a requisicao", request.params.nome);
        const nome_requisicao = request.params.nome || 'Anonimo'
        const msg = request.query.get('msg') || 'Funcionou httpFunctionTeste';

        return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            jsonBody: { msg: `${nome_requisicao} ${msg}` }
        };
    }
});