const express = require('express');
const router = express.Router();

const painelController = require('../controllers/painel.controller');

router.get('/:idagencia', function (req, res) {
    painelController.getfuncionarios(req, res);
});

router.put('/:idusuario', function(req, res) {
    console.log('PUT de edição recebido!');
    painelController.editarDadosFuncionarios(req, res);
});

router.delete('/:idusuario', function(req, res) {
    console.log('DELETE de exclusão recebido!');
    painelController.deletarDadosFuncionarios(req, res);
});


module.exports = router