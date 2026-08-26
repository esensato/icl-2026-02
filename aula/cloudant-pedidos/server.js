const { CloudantV1 } = require("@ibm-cloud/cloudant");
const { IamAuthenticator } = require("ibm-cloud-sdk-core");

const cloudant = CloudantV1.newInstance({
    authenticator: new IamAuthenticator({
        apikey: "Tla-DYOZSt0byxBZMGa75udwUsu7oQxCFkcq4-kK6DLj"
    }),
    serviceUrl: "https://3c51c00f-a182-4757-ae9e-e992e1471474-bluemix.cloudantnosqldb.appdomain.cloud"
});

const obterPedido = async () => {

    const response = await cloudant.getDocument({
        db: "pedidos",
        docId: "825456679c2589f991d794c3283312e2"
    });

    console.log(response.result);
}


const criarDB = async () => {

    const response = await cloudant.putDatabase({
        db: "alunos",
        partitioned: false
    });

    console.log(response.result);
}

const criarDoc = async () => {

    const aluno = {
        _id: "RM1111",
        nome: "Cecilia Busch Feiosa",
        curso: "Ciência da Computação",
        creditos: 10
    };

    const response = await cloudant.postDocument({
        db: "alunos",
        document: aluno
    });

    console.log(response.result);
}
//obterPedido();
//criarDB();
criarDoc();