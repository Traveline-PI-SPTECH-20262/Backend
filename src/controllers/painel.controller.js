const painelService = require('../services/painel.service');

async function getfuncionarios(req, res){
    const idagencia = req.params.idagencia;
    const result = await painelService.getfuncionarios(idagencia);
    return res.status(200).json(result);
}

function editarDadosFuncionarios(req, res) {
    const idusuario = req.params.idusuario;
    const nome = req.body.nome;
    const email = req.body.email;
    const cargo = req.body.cargo;

    painelService.editarDadosFuncionarios(idusuario, nome, email, cargo)
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

function deletarDadosFuncionarios(req, res) {
    const idusuario = req.params.idusuario;

    painelService.deletarDadosFuncionarios(idusuario)
        .then(function(resultado) {
            res.status(200).json({
                mensagem: 'Perfil deletado'
            });
        })
        .catch(function(erro) {
            console.log(erro);
            res.status(500).json({
                mensagem: 'Erro'
            });
        });
}



module.exports = {
    getfuncionarios,
    editarDadosFuncionarios,
    deletarDadosFuncionarios
};