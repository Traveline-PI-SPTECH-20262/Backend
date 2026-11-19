const db = require('../database/db');


async function getPerfil(id,idAgencia) {
    const resultado = await db.execute('SELECT * FROM usuario WHERE idusuario = ?', [id]);
    const resultadoRelatorio = await db.execute('SELECT * FROM relatorio WHERE usuario_idusuario = ?', [id]);
    const resultadoAgencia = await db.execute('SELECT * FROM agencia WHERE idAgencia = ?',[idAgencia] )
    const resultadoPlanilha = await db.execute('SELECT * FROM planilha WHERE agencia_idAgencia = ?',[idAgencia] )
    console.log('teste',resultadoPlanilha, resultadoRelatorio)
    return {
        usuario: resultado[0][0],
        relatorio: resultadoRelatorio[0],
        agencia: resultadoAgencia[0][0],
        planilha: resultadoPlanilha[0]
    };
}

async function editarPerfil(idusuario, nome, email) {
    const [resultado] = await db.execute(
        'UPDATE usuario SET nome = ?, email = ? WHERE idusuario = ?',
        [nome, email, idusuario]
    );

    return resultado;
}

async function deletarPerfil(idusuario) {
    // Primeiro apaga o que depende do usuário (chaves estrangeiras)
    await db.execute('DELETE FROM preferencias_usuario WHERE idUsuario = ?', [idusuario]);
    await db.execute('DELETE FROM relatorio WHERE usuario_idusuario = ?', [idusuario]);

    const [resultado] = await db.execute(
        'DELETE FROM usuario WHERE idusuario = ?',
        [idusuario]
    );

    return resultado;
}

const FREQUENCIAS = ['modoTeste', 'diaria', 'semanal', 'mensal'];

async function salvarNotificacoes(idusuario, notificacoesAtivas, frequencia) {
    if (typeof notificacoesAtivas !== 'boolean') {
        const e = new Error('notificacoesAtivas deve ser true ou false');
        e.status = 400;
        throw e;
    }
    if (!FREQUENCIAS.includes(frequencia)) {
        const e = new Error('Frequência inválida. Use: ' + FREQUENCIAS.join(', '));
        e.status = 400;
        throw e;
    }

    const [resultado] = await db.execute(
        `INSERT INTO preferencias_usuario (idUsuario, notificacoesAtivas, frequencia)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
            notificacoesAtivas = VALUES(notificacoesAtivas),
            frequencia = VALUES(frequencia)`,
        [idusuario, notificacoesAtivas ? 1 : 0, frequencia]
    );

    return resultado;
}

module.exports = {
    getPerfil,
    editarPerfil,
    salvarNotificacoes,
    deletarPerfil
};

