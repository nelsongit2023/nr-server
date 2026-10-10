const express = require('express');
const path = require('path');
const app = express();

// Porta onde o servidor vai rodar (o Render define isso automaticamente)
const PORT = process.env.PORT || 3000;

// SEU TOKEN SECRETO (Altere aqui para a senha/token que seus 6 apps vão usar)
const TOKEN_SECRETO = "jdhdj2654349GKHYFIEYNB4389V@@##$%bÇdfh%$kf";

app.get('/playlist.m3u', (req, res) => {
    const tokenCliente = req.query.token;

    // Valida se o token foi enviado e se está correto
    if (!tokenCliente || tokenCliente !== TOKEN_SECRETO) {
        return res.status(403).send("Acesso negado: Token inválido ou ausente.");
    }

    // Caminho para o seu arquivo m3u na pasta
    const filePath = path.join(__dirname, 'lista.m3u');

    // Define os headers corretos para players de IPTV reconhecerem a lista
    res.setHeader('Content-Type', 'audio/x-mpegurl');
    
    // Envia o arquivo de 150MB para o player
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("Erro ao enviar o arquivo:", err);
            if (!res.headersSent) {
                res.status(500).send("Erro interno ao carregar a lista.");
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor IPTV rodando na porta ${PORT}`);
});