const express = require('express');
const router = express.Router();

const painelController = require('../controllers/painel.controller');

router.get('/:idagencia', function (req, res) {
    painelController.getfuncionarios(req, res);
});

module.exports = router