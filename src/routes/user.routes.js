const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller')

router.post('/auth', async (req, res) => {
    await authController.auth(req, res)
})

module.exports = router