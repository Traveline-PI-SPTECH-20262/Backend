const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');

router.get('/kpis/:idagencia', function (req, res) {
    dashboardController.getKpis(req, res);
});

router.get('/analise/:tipo/:idagencia', (req, res) => {
    dashboardController.getAnalise(req, res);
});

module.exports = router;