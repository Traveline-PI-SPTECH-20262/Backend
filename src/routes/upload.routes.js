const express = require('express');
const multer = require('multer');
const path = require('node:path');
const uploadController = require('../controllers/upload.controller');

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024, files: 1, fields: 1 },
    fileFilter: function (req, arquivo, callback) {
        const extensao = path.extname(arquivo.originalname).toLowerCase();
        if (extensao !== '.xlsx' && extensao !== '.xls') {
            return callback(new Error('Envie um arquivo Excel (.xlsx ou .xls).'));
        }
        callback(null, true);
    }
});

router.post('/', function (req, res) {
    upload.single('arquivo')(req, res, function (erro) {
        if (erro) {
            let mensagem = erro.message;
            if (erro instanceof multer.MulterError) {
                mensagem = 'Envie apenas uma planilha no campo arquivo.';
            }
            if (erro.code === 'LIMIT_FILE_SIZE') {
                mensagem = 'O arquivo deve ter no máximo 20 MB.';
            }
            return res.status(400).json({ mensagem });
        }
        return uploadController.enviarArquivo(req, res);
    });
});

router.get('/historico/:idAgencia', async (req, res) => {
    return uploadController.historicoArquivos(req, res);
});

module.exports = router;
