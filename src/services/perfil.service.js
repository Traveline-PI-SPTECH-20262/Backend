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
    const conexao = await db.getConnection();
    try {
        await conexao.beginTransaction();
        await conexao.execute('DELETE FROM preferencias_usuario WHERE idUsuario = ?', [idusuario]);
        await conexao.execute('DELETE FROM relatorio WHERE usuario_idusuario = ?', [idusuario]);
        const [resultado] = await conexao.execute('DELETE FROM usuario WHERE idusuario = ?', [idusuario]);
        await conexao.commit();
        return resultado;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
}

async function getPreferencias(idusuario) {
    await db.execute(
        'INSERT IGNORE INTO preferencias_usuario (idUsuario) SELECT idusuario FROM usuario WHERE idusuario = ?',
        [idusuario]
    );
    const [resultado] = await db.execute('SELECT * FROM preferencias_usuario WHERE idUsuario = ?', [idusuario]);
    return resultado[0];
}

async function salvarPreferencias(idusuario, dados) {
    const campos = ['temaClaro', 'totalTuristas', 'viaAerea', 'viaTerrestre', 'viaMaritima', 'viaFluvial', 'paisesEmissores', 'notificacoesAtivas'];
    const valores = [];
    for (const campo of campos) {
        valores.push(Number(dados[campo]));
    }
    valores.push(dados.frequencia);
    const [resultado] = await db.execute(
        `INSERT INTO preferencias_usuario (idUsuario, temaClaro, totalTuristas, viaAerea, viaTerrestre, viaMaritima, viaFluvial, paisesEmissores, notificacoesAtivas, frequencia)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE temaClaro = ?, totalTuristas = ?, viaAerea = ?, viaTerrestre = ?, viaMaritima = ?, viaFluvial = ?, paisesEmissores = ?, notificacoesAtivas = ?, frequencia = ?`,
        [idusuario].concat(valores, valores)
    );
    return resultado;
}

module.exports = { getPerfil, editarPerfil, deletarPerfil, getPreferencias, salvarPreferencias };
