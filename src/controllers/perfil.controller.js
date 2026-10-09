const perfilService = require('../services/perfil.service');

async function getPerfil(req, res) {
    const id = req.params.id;
    const resultado = await perfilService.getPerfil(id);
    
    return res.status(200).json(resultado);
}

module.exports = {
    getPerfil
};