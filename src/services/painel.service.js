const db = require('../database/db');

function getfuncionarios(idagencia){
    const listafuncionarios = db.execute('SELECT u.*, c.cargo FROM usuario u JOIN cargo c ON c.idCargo = u.idCargo WHERE u.idAgencia = ?',[idagencia])
    return listafuncionarios;
}

module.exports = {
    getfuncionarios
}

