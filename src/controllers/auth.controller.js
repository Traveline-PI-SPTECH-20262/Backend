const authService = require('../services/auth.service')

async function auth(req, res) {
    const {tipoLogin} = req.body;

    if(tipoLogin === 'auth') {
        await authService.auth(req, res)
    } else if (tipoLogin === 'google') {

    } else if (tipoLogin === 'microsoft') {

    } else {

    }

}

module.exports = {
    auth
}