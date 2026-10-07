const db = require('../database/db');

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

module.exports = {
    auth
}