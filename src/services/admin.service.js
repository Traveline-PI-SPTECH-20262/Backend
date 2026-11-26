const db = require('../database/db');
const perfilService = require('./perfil.service');

async function listarUsuarios(idAgencia) {
    const [usuarios] = await db.execute(
        'SELECT usuario.idusuario, usuario.nome, usuario.email, cargo.cargo, usuario.idAgencia FROM usuario INNER JOIN cargo ON usuario.idCargo = cargo.idCargo WHERE idAgencia = ? ORDER BY nome;',
        [idAgencia]
    );
    return usuarios;
}

async function editarUsuario(idusuario, { nome, email, cargo }) {
    const [alvo] = await db.execute('SELECT cargo.cargo FROM usuario JOIN cargo ON usuario.idCargo = cargo.idCargo WHERE idusuario = ?', [idusuario]);
    if (alvo.length === 0) {
        return { status: 404, message: 'Usuário não encontrado.' };
    }
    if (alvo[0].cargo === 'Administrador') {
        return { status: 403, message: 'Não é possível editar um administrador.' };
    }
    const [cargoAlvoId] = await db.execute('SELECT * FROM cargo where cargo = ?', [cargo])

    const [emailEmUso] = await db.execute(
        'SELECT idusuario FROM usuario WHERE email = ? AND idusuario <> ?',
        [email, idusuario]
    );
    if (emailEmUso.length > 0) {
        return { status: 400, message: 'E-mail já cadastrado!' };
    }

    await db.execute(
        'UPDATE usuario SET nome = ?, email = ?, idCargo = ? WHERE idusuario = ?',
        [nome, email, cargoAlvoId[0].idCargo , idusuario]
    );
    return { status: 200, message: 'Usuário atualizado com sucesso!' };
}

async function deletarUsuario(idusuario) {
    // const [alvo] = await db.execute('SELECT cargo FROM usuario WHERE idusuario = ?', [idusuario]);
    // if (alvo.length === 0) {
    //     return { status: 404, message: 'Usuário não encontrado.' };
    // }
    // if (alvo[0].cargo === 'Administrador') {
    //     return { status: 403, message: 'Não é possível deletar um administrador.' };
    // }

    // reaproveita a exclusão em transação que já existe (preferências + relatórios + usuário)
    await perfilService.deletarPerfil(idusuario);
    return { status: 200, message: 'Usuário deletado com sucesso!' };
}

module.exports = { listarUsuarios, editarUsuario, deletarUsuario };