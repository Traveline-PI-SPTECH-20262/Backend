const db = require('../database/db');

async function auth(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(401).json({ message: 'Preencha todos os campos' });
    }

    try {
        const [usuarios] = await db.execute(
            'SELECT * FROM usuario WHERE email = ? AND senha = ?', [email, password]
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
    const { nome, codigoAtivacao, email, senha, cargo } = req.body;
    if (!nome || !codigoAtivacao || !email || !senha || !cargo) {
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
        const [resultado] = await conexao.execute(
            'INSERT INTO usuario (nome, idAgencia, email, senha, cargo) VALUES (?, ?, ?, ?, ?)',
            [nome, codigos[0].idAgencia, email, senha, cargo]
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

module.exports = { auth, register };
