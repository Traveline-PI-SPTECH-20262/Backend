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
    const [resultado] = await db.execute(
        'DELETE FROM usuario WHERE idusuario = ?',
        [idusuario]
    );

    return resultado;
}

async function salvarNotificacoes(
    idusuario,
    notificacoesAtivas,
    frequencia
) {

    const [resultado] = await db.execute(
        `UPDATE preferencias_notificacao
         SET notificacoesAtivas = ?, frequencia = ?
         WHERE idusuario = ?`,
        [notificacoesAtivas, frequencia, idusuario]
    );

    return resultado;
}

module.exports = {
    getPerfil,
    editarPerfil,
    salvarNotificacoes,
    deletarPerfil
};

