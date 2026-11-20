const db = require('../database/db');
const MESES = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function numeroMes(valor) {
    const texto = String(valor).trim().toLowerCase().replace('ç', 'c');
    const numero = Number(texto);
    if (Number.isInteger(numero) && numero >= 1 && numero <= 12) return numero;
    return MESES.indexOf(texto) + 1;
}

function preparar(linhas) {
    const dados = [];
    for (const linha of linhas) {
        linha.ano = Number(linha.ano);
        linha.mes = numeroMes(linha.mes);
        linha.chegadas = Number(linha.chegadas);
        if (Number.isInteger(linha.ano) && linha.ano > 0 && linha.mes > 0) {
            dados.push(linha);
        }
    }
    return dados;
}

async function getAnalise(idAgencia) {
    const [planilhas] = await db.execute(
        `SELECT idplanilha FROM planilha
         WHERE agencia_idAgencia = ? AND situacao = 'CONCLUIDA'
         ORDER BY idplanilha DESC LIMIT 1`,
        [idAgencia]
    );
    if (planilhas.length === 0) return { idplanilha: null, paises: [], ufs: [] };

    const idPlanilha = planilhas[0].idplanilha;
    const [paises] = await db.execute(
        `SELECT t.ano, t.mes, p.nome AS pais, p.continente,
                SUM(t.quantidade_turistas) AS chegadas
         FROM turista_por_pais_mes t JOIN pais p ON p.idpais = t.pais_idpais
         WHERE t.planilha_idplanilha = ?
         GROUP BY t.ano, t.mes, p.idpais, p.nome, p.continente`,
        [idPlanilha]
    );
    const [ufs] = await db.execute(
        `SELECT t.ano, t.mes, u.sigla AS uf, SUM(t.quantidade_turista) AS chegadas
         FROM turista_por_estado_mes t JOIN uf u ON u.iduf = t.uf_iduf
         WHERE t.planilha_idplanilha = ?
         GROUP BY t.ano, t.mes, u.iduf, u.sigla`,
        [idPlanilha]
    );

    return { idplanilha: idPlanilha, paises: preparar(paises), ufs: preparar(ufs) };
}

module.exports = { getAnalise };
