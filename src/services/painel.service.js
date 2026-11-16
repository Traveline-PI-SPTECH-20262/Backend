const db = require('../database/db');

function getfuncionarios(idagencia){
    const listafuncionarios = db.execute('SELECT * FROM usuario WHERE idAgencia = ?',[idagencia])
    return listafuncionarios;
}

async function editarDadosFuncionarios(idusuario, nome, email, cargo) {
    const [resultado] = await db.execute(
        'UPDATE usuario SET nome = ?, email = ?, cargo = ? WHERE idusuario = ?',
        [nome, email, cargo, idusuario]
    );

    return resultado;
}

async function deletarDadosFuncionarios(idusuario) {
    const [resultado] = await db.execute(
        'DELETE FROM usuario WHERE idusuario = ?',
        [idusuario]
    );

    return resultado;
}



module.exports = {
    getfuncionarios,
    editarDadosFuncionarios,
    deletarDadosFuncionarios
};