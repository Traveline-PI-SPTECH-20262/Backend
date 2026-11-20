const db = require('../database/db');

async function buscarPaises(idPlanilha) {
    const sql = `SELECT p.idpais, p.nome, SUM(t.quantidade_turistas) AS total,
        (SELECT t2.mes FROM turista_por_pais_mes t2
         WHERE t2.pais_idpais = p.idpais AND t2.planilha_idplanilha = t.planilha_idplanilha
         GROUP BY t2.mes ORDER BY SUM(t2.quantidade_turistas) DESC LIMIT 1) AS pico,
        SUM(t.quantidade_turistas) * 100 /
        (SELECT SUM(quantidade_turistas) FROM turista_por_pais_mes
         WHERE planilha_idplanilha = t.planilha_idplanilha) AS percentual
        FROM turista_por_pais_mes t JOIN pais p ON p.idpais = t.pais_idpais
        WHERE t.planilha_idplanilha = ?
        GROUP BY p.idpais, p.nome, t.planilha_idplanilha ORDER BY total DESC LIMIT 25`;

    const [paises] = await db.execute(sql, [idPlanilha]);
    return paises;
}

async function buscarEstados(idPlanilha) {
    const sql = `SELECT u.iduf, u.nome, SUM(t.quantidade_turista) AS total,
        (SELECT t2.mes FROM turista_por_estado_mes t2
         WHERE t2.uf_iduf = u.iduf AND t2.planilha_idplanilha = t.planilha_idplanilha
         GROUP BY t2.mes ORDER BY SUM(t2.quantidade_turista) DESC LIMIT 1) AS pico,
        SUM(t.quantidade_turista) * 100 /
        (SELECT SUM(quantidade_turista) FROM turista_por_estado_mes
         WHERE planilha_idplanilha = t.planilha_idplanilha) AS percentual
        FROM turista_por_estado_mes t JOIN uf u ON u.iduf = t.uf_iduf
        WHERE t.planilha_idplanilha = ?
        GROUP BY u.iduf, u.nome, t.planilha_idplanilha ORDER BY total DESC LIMIT 25`;

    const [estados] = await db.execute(sql, [idPlanilha]);
    return estados;
}

function montarLista(locais, campoId) {
    const lista = [];

    for (const local of locais) {
        if (lista.length === 25) break;
        const posicao = lista.length + 1;
        let nivel = 'BAIXO';
        if (posicao <= 7) nivel = 'MÉDIO';
        if (posicao <= 3) nivel = 'ALTO';

        lista.push({
            id: local[campoId],
            nome: local.nome,
            total: Number(local.total),
            participacao: Number(local.percentual),
            nivel: nivel,
            sazonalidade: local.pico
        });
    }

    return lista;
}

async function getRecomendacoes(idAgencia) {
    const [planilhas] = await db.execute(
        `SELECT idplanilha FROM planilha
         WHERE agencia_idAgencia = ? AND situacao = 'CONCLUIDA'
         ORDER BY idplanilha DESC LIMIT 1`,
        [idAgencia]
    );

    if (planilhas.length === 0) {
        return { idplanilha: null, recomendacoes: [], estados: [] };
    }

    const idPlanilha = planilhas[0].idplanilha;
    const paises = await buscarPaises(idPlanilha);
    const estados = await buscarEstados(idPlanilha);

    return {
        idplanilha: idPlanilha,
        recomendacoes: montarLista(paises, 'idpais'),
        estados: montarLista(estados, 'iduf')
    };
}

module.exports = { getRecomendacoes };
