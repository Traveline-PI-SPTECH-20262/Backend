const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.get('/usuarios/:idAgencia', function (req, res) {
    adminController.listarUsuarios(req, res);
});
router.put('/usuarios/:idusuario', function (req, res) {
    adminController.editarUsuario(req, res);
});
router.delete('/usuarios/:idusuario', function (req, res) {
    adminController.deletarUsuario(req, res);
});

module.exports = router;