const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('node:path');

async function enviarArquivo(arquivo, idAgencia) {
    const bucket = process.env.AWS_S3_BUCKET || 'guilherme-grupo4-27.10';
    const region = process.env.AWS_REGION || 'us-east-1';
    const cliente = new S3Client({ region });
    const nome = path.basename(arquivo.originalname.replace(/\\/g, '/'))
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_');
    const chave = `importacoes/${idAgencia}-${nome}`;
    
    try {
        await cliente.send(new PutObjectCommand({
            Bucket: bucket,
            Key: chave,
            Body: arquivo.buffer,
            ContentType: path.extname(nome).toLowerCase() === '.xlsx'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'application/vnd.ms-excel'
        }));
        return { nomeArquivo: arquivo.originalname, chave, bucket, tamanho: arquivo.size };
    } finally {
        cliente.destroy();
    }
}

module.exports = { enviarArquivo };
