const db = require('../database/db');
const perfilService = require('./perfil.service');

async function listarUsuarios(idAgencia) {
    const [usuarios] = await db.execute(
        'SELECT idusuario, nome, email, cargo, idAgencia FROM usuario WHERE idAgencia = ? ORDER BY nome',
        [idAgencia]
    );
    return usuarios;
}

async function editarUsuario(idusuario, { nome, email, cargo }) {
    const [alvo] = await db.execute('SELECT cargo FROM usuario WHERE idusuario = ?', [idusuario]);
    if (alvo.length === 0) {
        return { status: 404, message: 'Usuário não encontrado.' };
    }
    if (alvo[0].cargo === 'Administrador') {
        return { status: 403, message: 'Não é possível editar um administrador.' };
    }

    const [emailEmUso] = await db.execute(
        'SELECT idusuario FROM usuario WHERE email = ? AND idusuario <> ?',
        [email, idusuario]
    );
    if (emailEmUso.length > 0) {
        return { status: 400, message: 'E-mail já cadastrado!' };
    }

    await db.execute(
        'UPDATE usuario SET nome = ?, email = ?, cargo = ? WHERE idusuario = ?',
        [nome, email, cargo, idusuario]
    );
    return { status: 200, message: 'Usuário atualizado com sucesso!' };
}

async function deletarUsuario(idusuario) {
    const [alvo] = await db.execute('SELECT cargo FROM usuario WHERE idusuario = ?', [idusuario]);
    if (alvo.length === 0) {
        return { status: 404, message: 'Usuário não encontrado.' };
    }
    if (alvo[0].cargo === 'Administrador') {
        return { status: 403, message: 'Não é possível deletar um administrador.' };
    }

    // reaproveita a exclusão em transação que já existe (preferências + relatórios + usuário)
    await perfilService.deletarPerfil(idusuario);
    return { status: 200, message: 'Usuário deletado com sucesso!' };
}

module.exports = { listarUsuarios, editarUsuario, deletarUsuario };