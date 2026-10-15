const express = require('express');
const router = express.Router();

const especificaController = require('../controllers/especifica.controller');

router.get('/', function (req, res) {
    especificaController.getEspecifica(req, res);
});

module.exports = router;