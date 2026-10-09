const db = require('../database/db');

//auth
async function auth(req, res) {
    const {email, password} = req.body;
    try {
        const [resposta] = await db.execute('select * from usuario where email = ? and senha = ?', [email, password])
        if(resposta.length < 1) return res.status(404).json({ message: "Usuário não encontrado" });
        console.log(resposta)
        return res.status(200).json({ usuario: resposta[0] })
    } catch (error) {
        console.log(error)
        return res.status(500).json({erro: error})
    }
}

async function googleAuth(token) {

}



//register
function register(req, res) {
    const { nome, codigoAtivacao, email, senha, cargo } = req.body;

    return db.execute('SELECT * FROM usuario WHERE email = ?', [email])
        .then(([resposta]) => {
            if (resposta.length > 0) {
                return res.status(400).json({ message: "E-mail já cadastrado!" });
            }             
            return db.execute('INSERT INTO usuario (nome, codigoAtivacao, email, senha, cargo) VALUES (?, ?, ?, ?, ?)', [nome, codigoAtivacao, email, senha, cargo])
                .then(() => {
                    return res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
                });
        })
        .catch((error) => {
            console.error("Erro no cadastro:", error);
            return res.status(500).json({ message: "Erro do servidor" });
        });
}
module.exports = {
    auth,
    register
}