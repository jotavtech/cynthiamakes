<?php
echo "<h1>Teste de Suporte Node.js</h1>";

// Teste 1: Verificar se Node.js está instalado
echo "<h2>1. Verificando Node.js:</h2>";
$node_version = shell_exec('node --version 2>&1');
if ($node_version) {
    echo "<p style='color: green;'>✅ Node.js encontrado: " . htmlspecialchars($node_version) . "</p>";
} else {
    echo "<p style='color: red;'>❌ Node.js não encontrado</p>";
}

// Teste 2: Verificar npm
echo "<h2>2. Verificando NPM:</h2>";
$npm_version = shell_exec('npm --version 2>&1');
if ($npm_version) {
    echo "<p style='color: green;'>✅ NPM encontrado: " . htmlspecialchars($npm_version) . "</p>";
} else {
    echo "<p style='color: red;'>❌ NPM não encontrado</p>";
}

// Teste 3: Verificar comandos disponíveis
echo "<h2>3. Comandos disponíveis:</h2>";
$commands = shell_exec('which node npm pm2 2>&1');
echo "<pre>" . htmlspecialchars($commands) . "</pre>";

// Teste 4: Informações do servidor
echo "<h2>4. Informações do Servidor:</h2>";
echo "<p><strong>Sistema:</strong> " . php_uname() . "</p>";
echo "<p><strong>Versão PHP:</strong> " . phpversion() . "</p>";

// Teste 5: Verificar se pode executar scripts
echo "<h2>5. Teste de Execução:</h2>";
$test_command = shell_exec('echo "Teste de execução funcionando" 2>&1');
echo "<p>" . htmlspecialchars($test_command) . "</p>";

?> 