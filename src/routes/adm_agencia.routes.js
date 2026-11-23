const express = require('express');
const router = express.Router();

const agenciaController = require('../controllers/adm_agencia.controller');

router.get('/', (req, res) => {
    agenciaController.listarAgencias(req, res);
});

router.get('/:id', (req, res) => {
    agenciaController.buscarAgencia(req, res);
});

router.post('/', (req, res) => {
    agenciaController.cadastrarAgencia(req, res);
});

router.put('/:id', (req, res) => {
    agenciaController.atualizarAgencia(req, res);
});

router.delete('/:id', (req, res) => {
    agenciaController.deletarAgencia(req, res);
});

module.exports = router;