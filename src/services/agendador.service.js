const db = require('../database/db');
const notificacaoService = require('./notificacao.service');

// ---------------------------------------------------------------
// TEXTOS FIXOS de cada caso (tag). Título e descrição: máx. 100 caracteres.
// Para mudar o texto de uma notificação, é só editar aqui.
// ---------------------------------------------------------------
const TEXTOS = {
    Oportunidade: [
        { titulo: 'Oportunidade em países emissores', descricao: 'Confira o ranking de países emissores na Dashboard e veja onde há espaço para crescer.' },
        { titulo: 'Oportunidade por via de acesso', descricao: 'Compare as vias de acesso na Dashboard. Alguma delas pode abrir novas parcerias.' },
        { titulo: 'Oportunidade em novos mercados', descricao: 'Países com menos turistas podem ser mercados a explorar. Veja a análise específica.' },
        { titulo: 'Revise suas recomendações', descricao: 'Há recomendações de destinos para sua agência. Veja a página de Recomendações.' }
    ],
    Sazonalidade: [
        { titulo: 'Atenção à alta temporada', descricao: 'Meses de alta movimentação pedem planejamento. Veja a sazonalidade na Dashboard.' },
        { titulo: 'Atenção à baixa temporada', descricao: 'Meses de menor movimento são ótimos para promoções. Confira a sazonalidade.' },
        { titulo: 'Planeje o próximo período', descricao: 'Use o histórico mensal para ajustar pacotes e preços do próximo período.' },
        { titulo: 'Compare meses e anos', descricao: 'Compare a movimentação entre meses e anos para antecipar picos de chegadas.' }
    ],
    // Textos de erro NÃO são enviados pelo agendador (um erro falso a cada intervalo
    // confundiria o usuário). Ficam prontos para o upload/worker usarem quando uma planilha falhar.
    Erro: [
        { titulo: 'Falha na importação', descricao: 'A planilha enviada tem colunas diferentes do modelo. Revise o arquivo e envie novamente.' },
        { titulo: 'Arquivo inválido', descricao: 'O arquivo enviado não está no formato XLSX. Envie uma planilha válida.' },
        { titulo: 'Planilha sem dados', descricao: 'Nenhuma linha válida foi encontrada na planilha. Confira se as abas foram preenchidas.' }
    ]
};

// Ordem em que o agendador envia: Oportunidade, Sazonalidade, Oportunidade, ...
const CICLO = [];
const maior = Math.max(TEXTOS.Oportunidade.length, TEXTOS.Sazonalidade.length);
for (let i = 0; i < maior; i++) {
    if (TEXTOS.Oportunidade[i]) CICLO.push({ mensagem: 'Oportunidade', ...TEXTOS.Oportunidade[i] });
    if (TEXTOS.Sazonalidade[i]) CICLO.push({ mensagem: 'Sazonalidade', ...TEXTOS.Sazonalidade[i] });
}

// Intervalo de cada frequência, em minutos
const MINUTOS = {
    modoTeste: 1,
    diaria: 1440,      // 1 dia
    semanal: 10080,    // 7 dias
    mensal: 43200      // 30 dias
};

const TOLERANCIA_SEGUNDOS = 5;
let executando = false;

async function verificar() {
    if (executando) return; // evita duas verificações ao mesmo tempo
    executando = true;

    try {
        // Para cada usuário com notificações ligadas: segundos desde a última notificação
        // (NULL = nunca recebeu nenhuma) e quantas já recebeu
        const [usuarios] = await db.execute(
            `SELECT p.idUsuario, p.frequencia,
                    TIMESTAMPDIFF(SECOND, MAX(r.criado_em), NOW()) AS segundosDesdeUltima,
                    COUNT(r.idrelatorio) AS total
             FROM preferencias_usuario p
             LEFT JOIN relatorio r ON r.usuario_idusuario = p.idUsuario
             WHERE p.notificacoesAtivas = 1
             GROUP BY p.idUsuario, p.frequencia`
        );

        for (const usuario of usuarios) {
            const minutos = MINUTOS[usuario.frequencia];
            if (!minutos) continue;

            const nuncaRecebeu = usuario.segundosDesdeUltima === null;
            const jaPassouOTempo = Number(usuario.segundosDesdeUltima) >= minutos * 60 - TOLERANCIA_SEGUNDOS;
            if (!nuncaRecebeu && !jaPassouOTempo) continue;

            // escolhe o texto da vez, girando pela lista
            const texto = CICLO[Number(usuario.total) % CICLO.length];

            const resultado = await notificacaoService.criar({
                idusuario: usuario.idUsuario,
                titulo: texto.titulo,
                mensagem: texto.mensagem,
                descricao: texto.descricao
            });

            if (resultado.criada) {
                console.log(`[agendador] notificação "${texto.titulo}" criada para o usuário ${usuario.idUsuario} (${usuario.frequencia})`);
            }
        }
    } catch (erro) {
        console.error('[agendador] erro:', erro.message);
    } finally {
        executando = false;
    }
}

function iniciar() {
    if (process.env.AGENDADOR === 'false') {
        console.log('[agendador] desativado (AGENDADOR=false no .env)');
        return;
    }
    console.log('[agendador] ligado: verifica as notificações a cada 60 segundos');
    verificar();
    setInterval(verificar, 60 * 1000);
}

module.exports = { iniciar, verificar, TEXTOS };