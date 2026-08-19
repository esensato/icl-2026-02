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

obterPedido();