const express = require('express');
const router = express.Router();

const notificacaoController = require('../controllers/notificacao.controller');

router.get('/:idusuario', function (req, res) {
    notificacaoController.listar(req, res);
});

router.post('/', function (req, res) {
    notificacaoController.criar(req, res);
});

router.put('/:idusuario/:id', function (req, res) {
    notificacaoController.atualizar(req, res);
});

router.delete('/:idusuario/:id', function (req, res) {
    notificacaoController.excluir(req, res);
});

module.exports = router;