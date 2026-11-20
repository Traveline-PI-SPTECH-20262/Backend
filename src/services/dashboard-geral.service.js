const db = require('../database/db');

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const VIAS = [
    { chave: 'viaAerea', titulo: 'Via aérea', meio: 'Avião', icone: '🛬' },
    { chave: 'viaTerrestre', titulo: 'Via terrestre', meio: 'Ônibus', icone: '🚗' },
    { chave: 'viaMaritima', titulo: 'Via marítima', meio: 'Navio', icone: '🛥️' },
    { chave: 'viaFluvial', titulo: 'Via fluvial', meio: 'Barco', icone: '🌊' }
];

function variacao(atual, anterior) {
    if (anterior <= 0) return null;

    const percentual = (atual - anterior) / anterior * 100;
    return Number(percentual.toFixed(1));
}

// Se o meio não for informado, soma todos os transportes.
function somar(linhas, meio) {
    let total = 0;

    for (const linha of linhas) {
        if (!meio || linha.meio === meio) {
            total += Number(linha.total);
        }
    }

    return total;
}

function contarPaises(linhas) {
    const ids = [];

    for (const linha of linhas) {
        if (Number(linha.total) > 0 && !ids.includes(linha.idpais)) {
            ids.push(linha.idpais);
        }
    }

    return ids.length;
}

function agrupar(linhas, campo) {
    const grupos = [];

    for (const linha of linhas) {
        const nome = linha[campo] || 'Não informado';
        let grupo = grupos.find(function (item) {
            return item.nome === nome;
        });

        if (!grupo) {
            grupo = { nome: nome, valor: 0 };
            grupos.push(grupo);
        }

        grupo.valor += Number(linha.total);
    }

    grupos.sort(function (a, b) {
        if (a.valor === b.valor) return a.nome.localeCompare(b.nome);
        return b.valor - a.valor;
    });

    return grupos;
}

function montarKpis(atuais, anteriores) {
    const kpis = [{
        chave: 'totalTuristas',
        titulo: 'Total de turistas',
        valor: somar(atuais),
        variacao: variacao(somar(atuais), somar(anteriores)),
        icone: '👤'
    }];

    for (const via of VIAS) {
        const atual = somar(atuais, via.meio);
        const anterior = somar(anteriores, via.meio);

        kpis.push({
            chave: via.chave, titulo: via.titulo, meio: via.meio,
            valor: atual, variacao: variacao(atual, anterior), icone: via.icone
        });
    }

    const paisesAtual = contarPaises(atuais);
    const paisesAnterior = contarPaises(anteriores);

    kpis.push({
        chave: 'paisesEmissores',
        titulo: 'Países emissores',
        valor: paisesAtual,
        variacao: variacao(paisesAtual, paisesAnterior),
        icone: '🌎'
    });

    return kpis;
}

function montarOportunidades(atuais, anteriores) {
    const oportunidades = [];
    const paisesAtuais = agrupar(atuais, 'nome');
    const paisesAnteriores = agrupar(anteriores, 'nome');
    const totalAtual = somar(atuais);

    for (const pais of paisesAtuais) {
        if (pais.valor <= 0) continue;
        if (oportunidades.length === 5) break;

        const anterior = paisesAnteriores.find(function (item) {
            return item.nome === pais.nome;
        });

        let totalAnterior = 0;
        if (anterior) totalAnterior = anterior.valor;

        const mudanca = variacao(pais.valor, totalAnterior);

        let participacao = 0;
        if (totalAtual > 0) {
            participacao = Number((pais.valor / totalAtual * 100).toFixed(2));
        }

        let oportunidade = 'Média';
        if (oportunidades.length < 3) oportunidade = 'Alta';

        oportunidades.push({
            pais: pais.nome, variacao: mudanca, participacao: participacao,
            oportunidade: oportunidade
        });
    }

    return oportunidades;
}

function montarSazonalidade(meses) {
    const sazonalidade = [];

    for (let indice = 0; indice < MESES.length; indice++) {
        let total = 0;

        for (const linha of meses) {
            const mes = String(linha.mes).trim().toLowerCase().replace('ç', 'c');
            const nomeMes = MESES[indice].toLowerCase().replace('ç', 'c');

            if (mes === nomeMes || Number(mes) === indice + 1) {
                total += Number(linha.total);
            }
        }

        sazonalidade.push({ nome: MESES[indice], valor: total });
    }

    return sazonalidade;
}

async function getGeral(idAgencia) {
    // Todos os dados vêm da mesma importação concluída.
    const [planilhas] = await db.execute(
        `SELECT idplanilha, caminho, dataHora FROM planilha
         WHERE agencia_idAgencia = ? AND situacao = 'CONCLUIDA'
         ORDER BY idplanilha DESC LIMIT 1`,
        [idAgencia]
    );

    if (planilhas.length === 0) {
        return { planilha: null, semDados: true };
    }

    const planilha = planilhas[0];
    const [paises] = await db.execute(
        `SELECT t.ano, p.idpais, p.nome, p.continente, m.tipo AS meio,
                SUM(t.quantidade_turistas) AS total
         FROM turista_por_pais_mes t
         JOIN pais p ON p.idpais = t.pais_idpais
         JOIN meio m ON m.idmodal = t.meio_idmodal
         WHERE t.planilha_idplanilha = ?
         GROUP BY t.ano, p.idpais, p.nome, p.continente, m.tipo`,
        [planilha.idplanilha]
    );

    let primeiroAno = null;
    let ano = null;

    for (const pais of paises) {
        const anoPais = Number(pais.ano);
        if (!Number.isInteger(anoPais) || anoPais <= 0) continue;

        if (primeiroAno === null || anoPais < primeiroAno) primeiroAno = anoPais;
        if (ano === null || anoPais > ano) ano = anoPais;
    }

    if (ano === null) return { planilha: planilha, semDados: true };

    const [ufs] = await db.execute(
        `SELECT u.sigla AS nome, SUM(t.quantidade_turista) AS valor
         FROM turista_por_estado_mes t
         JOIN uf u ON u.iduf = t.uf_iduf
         WHERE t.planilha_idplanilha = ?
         GROUP BY u.iduf, u.sigla ORDER BY valor DESC, u.sigla`,
        [planilha.idplanilha]
    );

    const [meses] = await db.execute(
        `SELECT mes, SUM(quantidade_turistas) AS total
         FROM turista_por_pais_mes WHERE planilha_idplanilha = ? GROUP BY mes`,
        [planilha.idplanilha]
    );

    const anoAnterior = ano - 1;
    const atuais = [];
    const anteriores = [];

    for (const pais of paises) {
        if (Number(pais.ano) === ano) atuais.push(pais);
        if (Number(pais.ano) === anoAnterior) anteriores.push(pais);
    }

    const topPaises = agrupar(paises, 'nome').slice(0, 10);
    for (const pais of topPaises) {
        const origem = paises.find(function (linha) {
            return linha.nome === pais.nome;
        });
        pais.continente = origem.continente;
    }

    for (const uf of ufs) uf.valor = Number(uf.valor);

    let periodo = String(ano);
    if (primeiroAno !== ano) periodo = primeiroAno + '–' + ano;

    return {
        planilha: planilha,
        semDados: false,
        periodo: periodo,
        ano: ano,
        anoAnterior: anoAnterior,
        kpis: montarKpis(atuais, anteriores),
        continentes: agrupar(paises, 'continente'),
        paises: topPaises,
        ufs: ufs,
        sazonalidade: montarSazonalidade(meses),
        oportunidades: montarOportunidades(atuais, anteriores)
    };
}

module.exports = { getGeral };

