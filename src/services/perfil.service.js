const db = require('../database/db');


async function getPerfil(id) {
    const resultado = await db.execute('SELECT * FROM usuario WHERE idusuario = ?', [id]);
    //const resultadoAgencia = await db.execute('SELECT * FROM agencia WHERE idusuario = ?', )
    return resultado[0][0];
}

module.exports = {
    getPerfil
};

