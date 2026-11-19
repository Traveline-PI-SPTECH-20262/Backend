const db = require('../database/db');

const TAGS = ['Oportunidade', 'Sazonalidade', 'Erro'];

function criarErro(status, mensagem) {
    const e = new Error(mensagem);
    e.status = status;
    return e;
}

function validarId(valor, nome) {
    if (!Number.isInteger(valor) || valor < 1) {
        throw criarErro(400, nome + ' inválido');
    }
}

function validarCampos(titulo, mensagem, descricao) {
    if (!titulo || !mensagem || !descricao) {
        throw criarErro(400, 'Preencha titulo, mensagem (tag) e descricao');
    }
    if (!TAGS.includes(mensagem)) {
        throw criarErro(400, 'A tag (mensagem) deve ser: ' + TAGS.join(', '));
    }
    if (titulo.length > 100 || descricao.length > 100) {
        throw criarErro(400, 'Título e descrição podem ter no máximo 100 caracteres');
    }
}

// READ: lista as notificações do usuário (filtro opcional por tag)
async function listar(idusuario, tag) {
    validarId(idusuario, 'idusuario');

    let sql = `SELECT idrelatorio, titulo, mensagem, descricao,
                      DATE_FORMAT(dataCriacao, '%d/%m/%Y') AS dataCriacao
               FROM relatorio WHERE usuario_idusuario = ?`;
    const params = [idusuario];

    if (tag) {
        sql += ' AND mensagem = ?';
        params.push(tag);
    }
    sql += ' ORDER BY idrelatorio DESC';

    const [linhas] = await db.execute(sql, params);
    return linhas;
}

// CREATE: só cria se o usuário não desativou as notificações
async function criar(corpo) {
    const { idusuario, titulo, mensagem, descricao } = corpo;
    validarId(Number(idusuario), 'idusuario');
    validarCampos(titulo, mensagem, descricao);

    const [prefs] = await db.execute(
        'SELECT notificacoesAtivas FROM preferencias_usuario WHERE idUsuario = ?',
        [idusuario]
    );
    if (prefs.length > 0 && !prefs[0].notificacoesAtivas) {
        return { criada: false, motivo: 'O usuário desativou as notificações' };
    }

    const [resultado] = await db.execute(
        `INSERT INTO relatorio (titulo, mensagem, descricao, dataCriacao, usuario_idusuario)
         VALUES (?, ?, ?, CURDATE(), ?)`,
        [titulo, mensagem, descricao, idusuario]
    );
    return { criada: true, idrelatorio: resultado.insertId };
}

// UPDATE
async function atualizar(idusuario, id, corpo) {
    validarId(idusuario, 'idusuario');
    validarId(id, 'id');
    const { titulo, mensagem, descricao } = corpo;
    validarCampos(titulo, mensagem, descricao);

    const [resultado] = await db.execute(
        `UPDATE relatorio SET titulo = ?, mensagem = ?, descricao = ?
         WHERE idrelatorio = ? AND usuario_idusuario = ?`,
        [titulo, mensagem, descricao, id, idusuario]
    );
    if (resultado.affectedRows === 0) throw criarErro(404, 'Notificação não encontrada');
}

// DELETE
async function excluir(idusuario, id) {
    validarId(idusuario, 'idusuario');
    validarId(id, 'id');

    const [resultado] = await db.execute(
        'DELETE FROM relatorio WHERE idrelatorio = ? AND usuario_idusuario = ?',
        [id, idusuario]
    );
    if (resultado.affectedRows === 0) throw criarErro(404, 'Notificação não encontrada');
}

module.exports = { listar, criar, atualizar, excluir };