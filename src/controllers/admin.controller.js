const adminService = require('../services/admin.service');

const CARGOS_PERMITIDOS = ['Gerente', 'Analista'];

function idValido(valor) {
    const id = Number(valor);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function listarUsuarios(req, res) {
    const idAgencia = idValido(req.params.idAgencia);
    if (!idAgencia) return res.status(400).json({ message: 'Agência inválida.' });

    try {
        const usuarios = await adminService.listarUsuarios(idAgencia);
        return res.status(200).json(usuarios);
    } catch (erro) {
        console.error('Erro ao listar usuários:', erro);
        return res.status(500).json({ message: 'Erro ao listar os usuários.' });
    }
}

async function editarUsuario(req, res) {
    const idusuario = idValido(req.params.idusuario);
    if (!idusuario) return res.status(400).json({ message: 'Usuário inválido.' });

    const { nome, email, cargo } = req.body;
    if (!nome || !email || !cargo) {
        return res.status(400).json({ message: 'Preencha todos os campos.' });
    }
    if (!CARGOS_PERMITIDOS.includes(cargo)) {
        return res.status(400).json({ message: 'Cargo inválido. Use Gerente ou Analista.' });
    }

    try {
        const resultado = await adminService.editarUsuario(idusuario, { nome, email, cargo });
        return res.status(resultado.status).json({ message: resultado.message });
    } catch (erro) {
        console.error('Erro ao editar usuário:', erro);
        return res.status(500).json({ message: 'Erro ao atualizar o usuário.' });
    }
}

async function deletarUsuario(req, res) {
    const idusuario = idValido(req.params.idusuario);
    if (!idusuario) return res.status(400).json({ message: 'Usuário inválido.' });

    try {
        const resultado = await adminService.deletarUsuario(idusuario);
        return res.status(resultado.status).json({ message: resultado.message });
    } catch (erro) {
        console.error('Erro ao deletar usuário:', erro);
        return res.status(500).json({ message: 'Erro ao deletar o usuário.' });
    }
}

module.exports = { listarUsuarios, editarUsuario, deletarUsuario };