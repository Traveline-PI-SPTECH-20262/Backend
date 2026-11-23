const agenciaService = require('../services//adm_agencia.service');

async function listarAgencias(req, res) {
    try {
        const resultado = await agenciaService.listarAgencias();
        return res.status(200).json(resultado);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: 'Erro ao listar agências.' });
    }
}

async function buscarAgencia(req, res) {
    try {
        const resultado = await agenciaService.buscarAgencia(req.params.id);

        if (resultado.length === 0) {
            return res.status(404).json({ mensagem: 'Agência não encontrada.' });
        }

        return res.status(200).json(resultado[0]);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: 'Erro ao buscar agência.' });
    }
}

async function cadastrarAgencia(req, res) {
    try {
        const resultado = await agenciaService.cadastrarAgencia(req.body);

        return res.status(201).json({
            mensagem: 'Agência cadastrada com sucesso!',
            idAgencia: resultado.idAgencia,
            token: resultado.token
        });

    } catch (erro) {
        console.error('Erro ao cadastrar agência:', erro);
        return res.status(500).json({
            mensagem: 'Erro ao cadastrar agência.'
        });
    }
}

async function atualizarAgencia(req, res) {
    try {
        const resultado = await agenciaService.atualizarAgencia(req.params.id, req.body);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Agência não encontrada.' });
        }

        return res.status(200).json({ mensagem: 'Agência atualizada com sucesso!' });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ mensagem: 'Erro ao atualizar agência.' });
    }
}

async function deletarAgencia(req, res) {
    try {
        const resultado = await agenciaService.deletarAgencia(req.params.id);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Agência não encontrada.' });
        }

        return res.status(200).json({ mensagem: 'Agência excluída com sucesso!' });
    } catch (erro) {
        console.error(erro);

        if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                mensagem: 'Não é possível excluir esta agência porque existem registros vinculados a ela.'
            });
        }

        return res.status(500).json({ mensagem: 'Erro ao excluir agência.' });
    }
}

module.exports = {
    listarAgencias,
    buscarAgencia,
    cadastrarAgencia,
    atualizarAgencia,
    deletarAgencia
};