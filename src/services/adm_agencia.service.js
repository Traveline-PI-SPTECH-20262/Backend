const db = require('../database/db');
const { randomInt } = require('crypto');

    async function listarAgencias() {
        const [agencias] = await db.execute(`SELECT a.idAgencia, a.nome, a.cnpj, a.email, a.dataCadastro, a.telefone, ca.codigo AS codigoAtivacao FROM agencia a LEFT JOIN codigo_ativacao ca ON ca.idAgencia = a.idAgencia AND ca.status = 1 WHERE a.status = 1`);
        return agencias;
    }

    async function buscarAgencia(idAgencia) {
        const [agencias] = await db.execute(
            'SELECT * FROM agencia WHERE idAgencia = ?',
            [idAgencia]
        );

        return agencias;
    }

    // GERAR PRIMEIRO TOKEN, NO CADASTRO
    function gerarToken(nomeAgencia) {
        const prefixo = nomeAgencia
            .replace(/[^a-zA-Z]/g, '') //ignora letras especisais
            .substring(0, 3)
            .toUpperCase();

        const numeros = randomInt(0, 10000000) //sortea numero
            .toString()
            .padStart(7, '0');
        return prefixo + numeros;
    }


    async function cadastrarAgencia(dados) {
        const conexao = await db.getConnection();
        try {
            await conexao.beginTransaction();

            const { nome, cnpj, email, dataCadastro, telefone } = dados;

            const [resultado] = await conexao.execute(
                `INSERT INTO agencia (nome, cnpj, email, dataCadastro, telefone) VALUES (?, ?, ?, ?, ?)`,
                [nome, cnpj, email, dataCadastro, telefone]
            );

            const idAgencia = resultado.insertId;

            // Token de ativação
            let token;
            let cadastrado = false;

            for (let tentativa = 0; tentativa < 5 && !cadastrado; tentativa++) {
                token = gerarToken(nome);
                try {
                    await conexao.execute(
                        `INSERT INTO codigo_ativacao (codigo, status, idAgencia) VALUES (?, 1, ?)`,
                        [token, idAgencia]
                    );

                    cadastrado = true;
                } catch (erro) {
                    if (erro.code !== 'ER_DUP_ENTRY') {
                        throw erro;
                    }
                }
            }

            if (!cadastrado) {
                throw new Error('Não foi possível gerar um token único.');
            }

            await conexao.commit();

            return {idAgencia, token};
        } catch (erro) {
            await conexao.rollback();
            throw erro;

        } finally {
            conexao.release();
        }
    }


    // GERAR TOEN NOVO ATUALIZAR
    async function gerarNovoToken(idAgencia) {
        const conexao = await db.getConnection();
        try {
            await conexao.beginTransaction();

            const [agencias] = await conexao.execute(
                'SELECT nome FROM agencia WHERE idAgencia = ? AND status = 1',
                [idAgencia]
            );

            if (agencias.length === 0) {
                throw new Error('Agência não encontrada ou inativa.');
            }
            const nomeAgencia = agencias[0].nome;

            let token;
            let cadastrado = false;

            for (let tentativa = 0; tentativa < 5 && !cadastrado; tentativa++) {
                token = gerarToken(nomeAgencia);
                try {
                    await conexao.execute(
                        'UPDATE codigo_ativacao SET status = 0 WHERE idAgencia = ? AND status = 1',
                        [idAgencia]
                    );
                    await conexao.execute(
                        `INSERT INTO codigo_ativacao (codigo, status, idAgencia) VALUES (?, 1, ?)`,
                        [token, idAgencia]
                    );
                    cadastrado = true;

                } catch (erro) {
                    if (erro.code !== 'ER_DUP_ENTRY') {
                        throw erro;
                    }
                }
            }

            if (!cadastrado) {
                throw new Error('Não foi possível gerar um token único.');
            }
            await conexao.commit();
            return token;

        } catch (erro) {
            await conexao.rollback();
            throw erro;
        } finally {
            conexao.release();
        }
    }

    async function atualizarAgencia(idAgencia, dados) {
        const { nome, cnpj, email, telefone } = dados;

        const [resultado] = await db.execute(
            `UPDATE agencia SET nome = ?, cnpj = ?, email = ?, telefone = ? WHERE idAgencia = ?`,
            [nome, cnpj, email, telefone, idAgencia]
        );

        return resultado;
    }

    // SOFT DELETE
    async function deletarAgencia(idAgencia) {
        const [resultado] = await db.execute(
            `UPDATE agencia SET status = 0 WHERE idAgencia = ? AND status = 1`, 
            [idAgencia]
        );

        return resultado;
    }

module.exports = {
    listarAgencias,
    buscarAgencia,
    cadastrarAgencia,
    atualizarAgencia,
    deletarAgencia,
    gerarNovoToken
};