const express = require('express');
const router = express.Router();
const recomendacoesController = require('../controllers/recomendacoes.controller');

router.get('/:idagencia', function (req, res) {
    recomendacoesController.getRecomendacoes(req, res);
});

module.exports = router;
