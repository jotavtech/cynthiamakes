<?php
// Redireciona para o index.html gerado pelo build
if (file_exists('index.html')) {
    include 'index.html';
} else {
    echo '<!DOCTYPE html>
<html>
<head>
    <title>Site em Manutenção</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h1>Site em manutenção</h1>
    <p>Por favor, aguarde enquanto fazemos o upload dos arquivos.</p>
</body>
</html>';
}
?> 