const recomendacoesService = require('../services/recomendacoes.service');

async function getRecomendacoes(req, res) {
    const idAgencia = Number(req.params.idagencia);
    if (!Number.isSafeInteger(idAgencia) || idAgencia <= 0) {
        return res.status(400).json({ mensagem: 'Agência inválida.' });
    }

    try {
        const resultado = await recomendacoesService.getRecomendacoes(idAgencia);
        return res.status(200).json(resultado);
    } catch (erro) {
        console.error('Erro ao carregar recomendações:', erro);
        return res.status(500).json({ mensagem: 'Não foi possível carregar as recomendações.' });
    }
}

module.exports = { getRecomendacoes };
