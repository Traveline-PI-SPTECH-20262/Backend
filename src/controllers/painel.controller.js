const painelService = require('../services/painel.service');

async function getfuncionarios(req, res){
    idagencia = req.params.idagencia
    const result = await painelService.getfuncionarios(idagencia);
    return res.status(200).json(result);
}

module.exports = {
    getfuncionarios
};
