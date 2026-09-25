const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const rankingRoutes = require('./routes/rankingRoutes');

const app = express();

const PORT = process.env.PORT || 3000;


// Middlewares
app.use(cors());

app.use(express.json());


// Arquivos do frontend
app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);


// Rotas da API
app.use(
    '/api/ranking',
    rankingRoutes
);


// Página principal
app.get('/', (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            'public',
            'index.html'
        )
    );
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(
        `Servidor rodando na porta ${PORT}`
    );

    console.log(
        `Acesse: http://localhost:${PORT}`
    );
});