const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors('*'));
const userRoutes = require('./routes/user.routes');
const perfilRoutes = require('./routes/perfil.routes');
const especificaRoutes = require('./routes/especifica.routes');
const painel = require("./routes/painel.routes")
const dashboardRoutes = require('./routes/dashboard.routes');

app.get('/', async (req, res) => {
    const db = require('./database/db');
    const users = await db.execute('SELECT * FROM usuario')
    res.status(200).json({ mensagem: "Servidor rodando", usuarios: users })
})

app.use('/user', userRoutes);
app.use('/perfil', perfilRoutes); 
app.use('/especifica', especificaRoutes);
app.use('/painel', painel)
app.use('/dashboard', dashboardRoutes);

module.exports = app;