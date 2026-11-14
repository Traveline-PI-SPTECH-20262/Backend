const dashboardService = require('../services/dashboard.service');

async function getKpis(req, res) {
    try {
        const idAgencia = Number(req.params.idagencia);

        if (!Number.isInteger(idAgencia) || idAgencia < 1) {
            return res.status(400).json({ mensagem: 'idagencia inválido' });
        }

        // req.query são os filtros da URL: ?ano=2021&mes=Janeiro
        const resultado = await dashboardService.getKpis(idAgencia, req.query);
        return res.status(200).json(resultado);
    } catch (erro) {
        console.error('Erro ao buscar KPIs da dashboard:', erro);
        return res.status(500).json({ mensagem: 'Erro ao buscar KPIs da dashboard' });
    }
}

module.exports = {
    getKpis
};