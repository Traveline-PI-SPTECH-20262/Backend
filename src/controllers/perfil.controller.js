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
function deletarPerfil(req, res) {
    const idusuario = req.params.idusuario;

    perfilService.deletarPerfil(idusuario)
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

async function getPreferencias(req, res) {
    const idusuario = Number(req.params.idusuario);
    if (!Number.isSafeInteger(idusuario) || idusuario <= 0) {
        return res.status(400).json({ mensagem: 'Usuário inválido.' });
    }
    try {
        const resultado = await perfilService.getPreferencias(idusuario);
        if (!resultado) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        return res.status(200).json(resultado);
    } catch (erro) {
        console.error('Erro ao carregar preferências:', erro);
        return res.status(500).json({ mensagem: 'Erro ao carregar as preferências.' });
    }
}

async function salvarPreferencias(req, res) {
    const campos = ['temaClaro', 'totalTuristas', 'viaAerea', 'viaTerrestre', 'viaMaritima', 'viaFluvial', 'paisesEmissores'];
    const idusuario = Number(req.params.idusuario);
    if (!Number.isSafeInteger(idusuario) || idusuario <= 0) {
        return res.status(400).json({ mensagem: 'Usuário inválido.' });
    }

    for (const campo of campos) {
        if (typeof req.body[campo] !== 'boolean') {
            return res.status(400).json({ mensagem: 'Informe as preferências válidas.' });
        }
    }

    try {
        await perfilService.salvarPreferencias(req.params.idusuario, req.body);
        return res.status(200).json({ mensagem: 'Preferências atualizadas!' });
    } catch (erro) {
        console.error('Erro ao salvar preferências:', erro);
        return res.status(500).json({ mensagem: 'Erro ao salvar as preferências.' });
    }
}

module.exports = { getPerfil, editarPerfil, deletarPerfil, getPreferencias, salvarPreferencias };
