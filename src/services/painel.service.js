const db = require('../database/db');

function getfuncionarios(idagencia){
    const listafuncionarios = db.execute('SELECT * FROM usuario WHERE idAgencia = ?'[idagencia])
    return listafuncionarios;
}

module.exports = {
    getfuncionarios
}

