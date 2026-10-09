const express = require('express');
const router = express.Router();

const perfilController = require('../controllers/perfil.controller');

router.get('/:id', function (req, res) {
    perfilController.getPerfil(req, res);
});

module.exports = router