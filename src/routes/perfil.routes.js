const express = require('express');
const router = express.Router();

const perfilController = require('../controllers/perfil.controller');

router.get('/preferencias/:idusuario', function (req, res) {
    perfilController.getPreferencias(req, res);
});

router.get('/:id/:idagencia', function (req, res) {
    perfilController.getPerfil(req, res);
});

router.post('/:idusuario', function(req, res) {
    console.log('POST de edição recebido!');
    perfilController.editarPerfil(req, res);
});

router.delete('/:idusuario', function(req, res) {
    console.log('DELETE de exclusão recebido!');
    perfilController.deletarPerfil(req, res);
});

router.post('/preferencias/:idusuario', function(req, res) {
    perfilController.salvarPreferencias(req, res);
});
module.exports = router