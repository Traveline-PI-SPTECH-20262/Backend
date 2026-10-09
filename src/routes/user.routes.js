const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');

router.post('/auth', function (req, res){
    userController.auth(req, res)
});
router.post('/register', function (req,res){
    userController.register(req, res)
});

module.exports = router