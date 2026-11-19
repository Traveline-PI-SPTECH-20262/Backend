const notificacaoService = require('../services/notificacao.service');

function responderErro(res, erro) {
    if (erro.status) {
        return res.status(erro.status).json({ mensagem: erro.message });
    }
    console.error('Erro em notificações:', erro);
    return res.status(500).json({ mensagem: 'Erro ao processar notificações' });
}

async function listar(req, res) {
    try {
        const lista = await notificacaoService.listar(Number(req.params.idusuario), req.query.tag);
        return res.status(200).json(lista);
    } catch (erro) {
        return responderErro(res, erro);
    }
}

async function criar(req, res) {
    try {
        const resultado = await notificacaoService.criar(req.body);
        return res.status(resultado.criada ? 201 : 200).json(resultado);
    } catch (erro) {
        return responderErro(res, erro);
    }
}

async function atualizar(req, res) {
    try {
        await notificacaoService.atualizar(Number(req.params.idusuario), Number(req.params.id), req.body);
        return res.status(200).json({ mensagem: 'Notificação atualizada' });
    } catch (erro) {
        return responderErro(res, erro);
    }
}

async function excluir(req, res) {
    try {
        await notificacaoService.excluir(Number(req.params.idusuario), Number(req.params.id));
        return res.status(204).end();
    } catch (erro) {
        return responderErro(res, erro);
    }
}

module.exports = { listar, criar, atualizar, excluir };