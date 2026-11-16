const uploadService = require('../services/upload.service');

async function enviarArquivo(req, res) {
    if (!req.file) {
        return res.status(400).json({ mensagem: 'Selecione uma planilha para enviar.' });
    }

    const idAgencia = Number(req.body.idAgencia);
    if (!Number.isSafeInteger(idAgencia) || idAgencia <= 0) {
        return res.status(400).json({ mensagem: 'Agência não encontrada. Faça login novamente.' });
    }

    try {
        const arquivo = await uploadService.enviarArquivo(req.file, idAgencia);
        return res.status(201).json({
            mensagem: 'Arquivo enviado ao bucket com sucesso.',
            arquivo
        });
    } catch (erro) {
        console.error('Erro ao enviar arquivo para o S3:', erro.name);
        if (erro.name === 'CredentialsProviderError') {
            return res.status(503).json({ mensagem: 'Configure as credenciais AWS no backend para enviar arquivos.' });
        }
        if (erro.name === 'AccessDenied' || erro.name === 'InvalidAccessKeyId' || erro.name === 'SignatureDoesNotMatch' || erro.name === 'ExpiredToken') {
            return res.status(503).json({ mensagem: 'O acesso da AWS não permite enviar o arquivo. Confira as credenciais e a permissão s3:PutObject.' });
        }
        return res.status(502).json({ mensagem: 'Não foi possível enviar o arquivo ao bucket. Tente novamente.' });
    }
}

module.exports = { enviarArquivo };
