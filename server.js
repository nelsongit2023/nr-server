const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// SEU TOKEN SECRETO PARA OS 6 APPS
const TOKEN_SECRETO = "jdhdj2654349GKHYFIEYNB4389V@@##$%bÇdfh%$kf";

// URL DIRETA DO SEU ARQUIVO .M3U (Pode ser link direto do Google Drive, Mega, etc.)
const URL_DO_ARQUIVO = process.env.URL_ARQUIVO_M3U || "https://drive.usercontent.google.com/download?id=1T0KJH2Wg2ZYbJtcQSw6Mc168O4csy3Ea&export=download";
const filePath = path.join(__dirname, 'lista.m3u');

// Função para baixar o arquivo caso ele não esteja na pasta
function baixarArquivoSeNaoExistir() {
    if (fs.existsSync(filePath)) {
        console.log("Arquivo .m3u já está presente no servidor.");
        return;
    }

    console.log("Baixando o arquivo .m3u de 150MB para o servidor...");
    const file = fs.createWriteStream(filePath);
    
    const protocolo = URL_DO_ARQUIVO.startsWith('https') ? https : http;

    protocolo.get(URL_DO_ARQUIVO, function(response) {
        // Se houver redirecionamento (comum no Google Drive)
        if (response.statusCode === 302 || response.statusCode === 301) {
            https.get(response.headers.location, function(redirectRes) {
                redirectRes.pipe(file);
                file.on('finish', function() {
                    file.close();
                    console.log("Download do arquivo .m3u concluído com sucesso!");
                });
            }).on('error', function(err) {
                fs.unlink(filePath);
                console.error("Erro no redirecionamento do download:", err.message);
            });
            return;
        }

        response.pipe(file);
        file.on('finish', function() {
            file.close();
            console.log("Download do arquivo .m3u concluído com sucesso!");
        });
    }).on('error', function(err) {
        fs.unlink(filePath);
        console.error("Erro ao baixar o arquivo:", err.message);
    });
}

// Inicia o download em segundo plano ao ligar o servidor
baixarArquivoSeNaoExistir();

app.get('/playlist.m3u', (req, res) => {
    const tokenCliente = req.query.token;

    // Valida o token
    if (!tokenCliente || tokenCliente !== TOKEN_SECRETO) {
        return res.status(403).send("Acesso negado: Token inválido ou ausente.");
    }

    if (!fs.existsSync(filePath)) {
        return res.status(503).send("O arquivo ainda está sendo baixado pelo servidor. Tente novamente em alguns segundos.");
    }

    res.setHeader('Content-Type', 'audio/x-mpegurl');
    res.sendFile(filePath);
});

app.listen(PORT, () => {
    console.log(`Servidor IPTV rodando na porta ${PORT}`);
});
