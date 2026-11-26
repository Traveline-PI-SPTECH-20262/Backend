const db = require('../database/db');

async function auth(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(401).json({ message: 'Preencha todos os campos' });
    }

    try {
        const [usuarios] = await db.execute(
            'SELECT u.*, c.cargo FROM usuario u JOIN cargo c ON c.idCargo = u.idCargo WHERE u.email = ? AND u.senha = ?', [email, password]
        );
        if (usuarios.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado ou senha incorreta' });
        }
        await db.execute('INSERT IGNORE INTO preferencias_usuario (idUsuario) VALUES (?)', [usuarios[0].idusuario]);
        const [preferencias] = await db.execute(
            'SELECT * FROM preferencias_usuario WHERE idUsuario = ?', [usuarios[0].idusuario]
        );
        return res.status(200).json({ usuario: usuarios[0], preferencias: preferencias[0] });
    } catch (erro) {
        console.error('Erro no login:', erro);
        return res.status(500).json({ message: 'Erro ao realizar login' });
    }
}

async function register(req, res) {
    const { nome, codigoAtivacao, email, senha, idCargo } = req.body;
    if (!nome || !codigoAtivacao || !email || !senha || !idCargo) {
        return res.status(401).json({ message: 'Preencha todos os campos' });
    }

    let conexao;
    try {
        conexao = await db.getConnection();
        await conexao.beginTransaction();
        const [codigos] = await conexao.execute(
            'SELECT idAgencia FROM codigo_ativacao WHERE codigo = ? AND status = 1', [codigoAtivacao]
        );
        if (codigos.length === 0) {
            await conexao.rollback();
            return res.status(400).json({ message: 'Código de ativação inválido ou desativado!' });
        }
        const [usuarios] = await conexao.execute('SELECT idusuario FROM usuario WHERE email = ?', [email]);
        if (usuarios.length > 0) {
            await conexao.rollback();
            return res.status(400).json({ message: 'E-mail já cadastrado!' });
        }
        const [cargos] = await conexao.execute('SELECT idCargo FROM cargo WHERE idCargo = ?', [idCargo]);
        if (cargos.length === 0) {
            await conexao.rollback();
            return res.status(400).json({ message: 'Selecione um cargo válido.' });
        }
        const [resultado] = await conexao.execute(
            'INSERT INTO usuario (nome, idAgencia, email, senha, idCargo) VALUES (?, ?, ?, ?, ?)',
            [nome, codigos[0].idAgencia, email, senha, idCargo]
        );
        await conexao.execute('INSERT INTO preferencias_usuario (idUsuario) VALUES (?)', [resultado.insertId]);
        await conexao.commit();
        return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (erro) {
        if (conexao) await conexao.rollback();
        console.error('Erro no cadastro:', erro);
        return res.status(500).json({ message: 'Erro do servidor' });
    } finally {
        if (conexao) conexao.release();
    }
}

async function listarCargos(req, res) {
    try {
        const [cargos] = await db.execute(
            "SELECT idCargo, cargo FROM cargo WHERE cargo <> 'Administrador' ORDER BY cargo"
        );
        return res.status(200).json(cargos);
    } catch (erro) {
        console.error('Erro ao carregar cargos:', erro);
        return res.status(500).json({ message: 'Erro ao carregar cargos.' });
    }
}

module.exports = { auth, register, listarCargos };
