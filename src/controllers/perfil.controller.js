const perfilService = require('../services/perfil.service');

async function getPerfil(req, res) {
    const id = req.params.id;
    const idagencia = req.params.idagencia
    const resultado = await perfilService.getPerfil(id,idagencia);
    
    return res.status(200).json(resultado);
}

function editarPerfil(req, res) {
    const idusuario = req.params.idusuario;
    const nome = req.body.nome;
    const email = req.body.email;

    perfilService.editarPerfil(idusuario, nome, email)
        .then(function(resultado) {
            res.status(200).json({
                mensagem: 'Perfil atualizado'
            });
        })
        .catch(function(erro) {
            console.log(erro);
            res.status(500).json({
                mensagem: 'Erro'
            });
        });
}

async function salvarNotificacoes(req, res) {

    const idusuario = req.params.idusuario;

    const { notificacoesAtivas, frequencia } = req.body;

    try {

        await perfilService.salvarNotificacoes(
            idusuario,
            notificacoesAtivas,
            frequencia
        );

        return res.status(200).json({
            mensagem: 'Preferências de notificação atualizadas!'
        });

    } catch (erro) {

        console.log(erro);

        return res.status(500).json({
            mensagem: 'Erro ao salvar as notificações.'
        });

    }
}

module.exports = {
    getPerfil,
    editarPerfil,
    salvarNotificacoes
};