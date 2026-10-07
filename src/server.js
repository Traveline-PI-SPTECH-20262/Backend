const app = require('./app');
require('dotenv').config({path: './src/.env'});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("Servidor rodando na porta", PORT)
})