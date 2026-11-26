const express = require("express");
const router = express.Router();

const agenciaController = require("../controllers/adm_agencia.controller");

router.get("/", (req, res) => {
  agenciaController.listarAgencias(req, res);
});

router.get("/:id", (req, res) => {
  agenciaController.buscarAgencia(req, res);
});

router.post("/", (req, res) => {
  agenciaController.cadastrarAgencia(req, res);
});

router.put("/:id", (req, res) => {
  agenciaController.atualizarAgencia(req, res);
});

router.delete("/:id", (req, res) => {
  agenciaController.deletarAgencia(req, res);
});

//o metodo patch serve pra enviar só uma parte/elemento. Por ex aqui só muda o token, ao inves de mudar todas as outras coisas
router.patch("/:id/token", (req, res) => {
  agenciaController.gerarNovoToken(req, res);
});

module.exports = router;
