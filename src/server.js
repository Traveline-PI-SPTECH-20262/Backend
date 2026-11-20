const app = require('./app');
require('dotenv').config({path: './src/.env'});

const PORT = process.env.PORT;

app.listen(PORT, (erro) => {
    if (erro) {
        console.error('Não foi possível iniciar o servidor:', erro.code);
        process.exitCode = 1;
        return;
    }
    console.log("Servidor rodando na porta", PORT)
})