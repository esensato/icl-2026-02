const { BlobServiceClient } = require('@azure/storage-blob');
require("dotenv").config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "upload";
const filePath = "arquivo.txt";

async function uploadBlob() {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists();
        // Somente para teste (falha de segurança pois permite o acesso via URL direto ao arquivo!)
        await containerClient.setAccessPolicy('blob');
        const blobName = filePath
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadResponse = await blockBlobClient.uploadFile(filePath);
        console.log("Upload realizado com sucesso!", JSON.stringify(uploadResponse));
        console.log("Blob:", blobName);

    } catch (err) {
        console.error("Erro:", err.message);
    }
}

uploadBlob();