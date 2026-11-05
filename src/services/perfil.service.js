const db = require('../database/db');


async function getPerfil(id,idAgencia) {
    const resultado = await db.execute('SELECT * FROM usuario WHERE idusuario = ?', [id]);
    const resultadoAgencia = await db.execute('SELECT * FROM agencia WHERE idAgencia = ?',[idAgencia] )
    return {
        usuario: resultado[0][0],
        agencia: resultadoAgencia[0][0]
    };
}

async function editarPerfil(idusuario, nome, email) {
    const [resultado] = await db.execute(
        'UPDATE usuario SET nome = ?, email = ? WHERE idusuario = ?',
        [nome, email, idusuario]
    );

    return resultado;
}

module.exports = {
    getPerfil,
    editarPerfil
};

