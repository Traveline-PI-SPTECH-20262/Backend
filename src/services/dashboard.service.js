const db = require('../database/db');

// Liga cada KPI ao nome do meio que o worker grava na tabela "meio"
const VIAS = [
    { chave: 'viaAerea',     titulo: 'Via aérea',     meio: 'Avião'  },
    { chave: 'viaTerrestre', titulo: 'Via terrestre', meio: 'Ônibus' },
    { chave: 'viaMaritima',  titulo: 'Via marítima',  meio: 'Navio'  },
    { chave: 'viaFluvial',   titulo: 'Via fluvial',   meio: 'Barco'  },
];

// Monta o WHERE. Sempre filtra pela agência e usa só a ÚLTIMA planilha concluída
// (assim, se a mesma planilha for enviada 2 vezes, o total não dobra).
function montarFiltros(idAgencia, ano, mes) {
    let where = `
        WHERE p.agencia_idAgencia = ?
        AND p.situacao = 'CONCLUIDA'
        AND p.idplanilha = (
            SELECT MAX(idplanilha) FROM planilha
            WHERE agencia_idAgencia = ? AND situacao = 'CONCLUIDA'
        )`;
    const params = [idAgencia, idAgencia];

    if (ano) {
        where += ' AND t.ano = ?';
        params.push(ano);
    }
    if (mes) {
        where += ' AND t.mes = ?';
        params.push(mes);
    }
    return { where, params };
}

// Parte do SQL que se repete (tabelas ligadas)
const FROM = `
    FROM turista_por_pais_mes t
    JOIN planilha p ON p.idplanilha = t.planilha_idplanilha
    JOIN meio m ON m.idmodal = t.meio_idmodal`;

// Soma de turistas por meio de transporte: { 'Avião': 28615, 'Ônibus': 156853, ... }
async function totaisPorMeio(idAgencia, ano, mes) {
    const { where, params } = montarFiltros(idAgencia, ano, mes);
    const [linhas] = await db.execute(
        `SELECT m.tipo, SUM(t.quantidade_turistas) AS total ${FROM} ${where} GROUP BY m.tipo`,
        params
    );
    const resultado = {};
    linhas.forEach(function (linha) {
        resultado[linha.tipo] = Number(linha.total);
    });
    return resultado;
}

async function contarPaises(idAgencia, ano, mes) {
    const { where, params } = montarFiltros(idAgencia, ano, mes);
    const [linhas] = await db.execute(
        `SELECT COUNT(DISTINCT t.pais_idpais) AS total ${FROM} ${where} AND t.quantidade_turistas > 0`,
        params
    );
    return Number(linhas[0].total);
}

// Ano mais recente que existe nos dados (usado quando o usuário não escolhe ano)
async function anoMaisRecente(idAgencia) {
    const { where, params } = montarFiltros(idAgencia);
    const [linhas] = await db.execute(`SELECT MAX(t.ano) AS ano ${FROM} ${where}`, params);
    return linhas[0].ano;
}

// Variação em % em relação ao período anterior
function calcularVariacao(atual, anterior) {
    if (!anterior) return null; // sem dado anterior, não dá para comparar
    return Number((((atual - anterior) / anterior) * 100).toFixed(1));
}

function somar(objeto) {
    return Object.values(objeto).reduce(function (a, b) { return a + b; }, 0);
}
///
const kpisMock = {
    filtros: { ano: '2021', mes: null },
    kpis: [
        { chave: 'totalTuristas',   titulo: 'Total de turistas', valor: 745871, variacao: 12 },
        { chave: 'viaAerea',        titulo: 'Via aérea',         valor: 28615,  variacao: 8 },
        { chave: 'viaTerrestre',    titulo: 'Via terrestre',     valor: 156853, variacao: 5 },
        { chave: 'viaMaritima',     titulo: 'Via marítima',      valor: 495,    variacao: 4 },
        { chave: 'viaFluvial',      titulo: 'Via fluvial',       valor: 1136,   variacao: 4 },
        { chave: 'paisesEmissores', titulo: 'Países emissores',  valor: 127,    variacao: null }
    ]
};
///
async function getKpis(idAgencia, query) {
    if (process.env.USE_MOCK === 'true') return kpisMock;
///
    const ano = query.ano || await anoMaisRecente(idAgencia);
    const anoAnterior = ano ? String(Number(ano) - 1) : null;
    const mes = query.mes;

    const atual = await totaisPorMeio(idAgencia, ano, mes);
    const anterior = await totaisPorMeio(idAgencia, anoAnterior, mes);
    const paisesAtual = await contarPaises(idAgencia, ano, mes);
    const paisesAnterior = await contarPaises(idAgencia, anoAnterior, mes);

    const kpis = [
        {
            chave: 'totalTuristas',
            titulo: 'Total de turistas',
            valor: somar(atual),
            variacao: calcularVariacao(somar(atual), somar(anterior))
        }
    ];

    VIAS.forEach(function (via) {
        const valorAtual = atual[via.meio] || 0;
        const valorAnterior = anterior[via.meio] || 0;
        kpis.push({
            chave: via.chave,
            titulo: via.titulo,
            valor: valorAtual,
            variacao: calcularVariacao(valorAtual, valorAnterior)
        });
    });

    kpis.push({
        chave: 'paisesEmissores',
        titulo: 'Países emissores',
        valor: paisesAtual,
        variacao: calcularVariacao(paisesAtual, paisesAnterior)
    });

    return { filtros: { ano: ano, mes: mes || null }, kpis: kpis };
}

module.exports = {
    getKpis
};