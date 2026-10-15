const especificaService = require('../services/especifica.service');

async function getEspecifica(req, res) {
    try {
        const resultado = await especificaService.getEspecifica();
        return res.status(200).json(resultado);
    } catch (erro) {
        console.error('Erro ao buscar dados da dashboard específica:', erro);
        return res.status(500).json({ mensagem: 'Erro ao buscar dados da dashboard específica' });
    }
}

module.exports = {
    getEspecifica
};