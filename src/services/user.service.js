const db = require('../database/db');

//auth
async function auth(req, res) {
    const {email, password} = req.body;

    if( !email || !password){
        return res.status(401).json({ message: "Preencha todos os campos" });
    }

    try {
        const [resposta] = await db.execute('select * from usuario where email = ? and senha = ?', [email, password])
        if(resposta.length < 1) return res.status(404).json({ message: "Usuário não encontrado ou senha incorreta" });
        const [resposta2] = await db.execute('select * from preferencias_notificacao where idusuario = ?', [resposta[0].idusuario])
        console.log(resposta)
        return res.status(200).json({ usuario: resposta[0], preferencias: resposta2[0], message: 'testee2'} );
    } catch (error) {
        console.log(error)
        return res.status(500).json({erro: error})
    }
}



//register
async function register(req, res) {
    const { nome, codigoAtivacao, email, senha, cargo } = req.body;

    if(!nome || !codigoAtivacao || !email || !senha || !cargo){
        return res.status(401).json({ message: "Preencha todos os campos" });
    }

    try {
        const [agencias] = await db.execute(`SELECT idAgencia FROM agencia WHERE codigoAtivacao = ?`,[codigoAtivacao]);

        if (agencias.length === 0) {
                return res.status(400).json({
                    message: "Código de ativação inválido!"
                });
        }
        
        const idAgencia = agencias[0].idAgencia;
        const [usuariosExistentes] = await db.execute('SELECT * FROM usuario WHERE email = ?', [email]);

        if (usuariosExistentes.length > 0) {
            return res.status(400).json({ message: "E-mail já cadastrado!" });
        }

        const [respostaUser] = await db.execute(
                    'INSERT INTO usuario (nome, idAgencia, email, senha, cargo) VALUES (?, ?, ?, ?, ?)',
                    [nome, idAgencia, email, senha, cargo]
        );

        
        await db.execute(
            'INSERT INTO preferencias_notificacao (idusuario, notificacoesAtivas, frequencia) VALUES (?, true, ?)',
            [respostaUser.insertId, 'modoTeste']
        );

        // 5. Retorna sucesso apenas se tudo deu certo
        return res.status(201).json({ message: "Usuário cadastrado com sucesso!" });

    } catch (error) {
        console.error("Erro no cadastro:", error);
        return res.status(500).json({ message: "Erro do servidor" });
    }

}
module.exports = {
    auth,
    register
}