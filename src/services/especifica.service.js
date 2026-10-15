function niveis(texto) {
    return texto.split('').map(function (letra) {
        if (letra === 'a') return 'alta';
        if (letra === 'm') return 'media';
        return 'baixa';
    });
}

async function getEspecifica() {
    return {
        kpis: [
            { titulo: 'Rota mais lucrativa',       valor: 'São Paulo → Salvador', detalhe: 'R$ 612 mil · 142 viagens',               icone: '🗺️' },
            { titulo: 'Destino em ascensão',       valor: 'Bonito, MS',           detalhe: '↑ +38% de viagens vs. período anterior', icone: '📈' },
            { titulo: 'Modal mais rentável',       valor: 'Aéreo',                detalhe: 'R$ 1.920 de receita por viagem',         icone: '✈️' },
            { titulo: 'Próxima alta temporada',    valor: 'Dezembro',             detalhe: 'Salvador e Florianópolis',               icone: '📅' },
        ],
        
        trimestres: {
            labels: ['T1', 'T2', 'T3', 'T4'],
            modais: [
                { nome: 'Aéreo',      valores: [490, 435, 595, 665] },
                { nome: 'Rodoviário', valores: [350, 315, 385, 365] },
                { nome: 'Outros',     valores: [85, 100, 125, 140] }
            ]
        },
        calendario: {
            meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            destinos: [
                { destino: 'Foz do Iguaçu', niveis: niveis('mbbbbmaambbm') },
                { destino: 'Salvador',      niveis: niveis('aambbbmmbbma') },
                { destino: 'Florianópolis', niveis: niveis('aambbbbbbmma') },
                { destino: 'Gramado',       niveis: niveis('bbbbmaambbbm') },
                { destino: 'Manaus',        niveis: niveis('bbbbbbmmaamb') }
            ]
        }
    };
}

module.exports = {
    getEspecifica
};