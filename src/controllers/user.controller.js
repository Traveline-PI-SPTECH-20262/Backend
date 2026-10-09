const userService = require('../services/user.service')

async function auth(req, res) {
    const {tipoLogin} = req.body;

    if(tipoLogin === 'auth') {
        return await userService.auth(req, res)
    } else if (tipoLogin === 'google') {

    } else if (tipoLogin === 'microsoft') {

    } else {

    }

}

async function register(req, res) {
    return userService.register(req, res);
}

module.exports = {
    auth,
    register
}