const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors('*'));
const userRoutes = require('./routes/user.routes');

app.get('/', async (req, res) => {
    const db = require('./database/db');
    const users = await db.execute('SELECT * FROM usuario')
    res.status(200).json({ mensagem: "Servidor rodando", usuarios: users })
})

app.use('/user', userRoutes);

module.exports = app;