#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando build para Hostinger...\n');

try {
  // 1. Limpar diretório dist se existir
  if (fs.existsSync('dist')) {
    console.log('🗑️  Limpando diretório dist...');
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // 2. Executar build do frontend apenas
  console.log('🔨 Executando build do frontend...');
  execSync('npm run build:frontend', { stdio: 'inherit' });

  // 3. Criar pasta hostinger-deploy
  const deployDir = 'hostinger-deploy';
  if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true, force: true });
  }
  fs.mkdirSync(deployDir);

  console.log('📁 Preparando arquivos para deploy...');

  // 4. Copiar arquivos do build do frontend
  const sourcePath = 'dist/public';
  if (fs.existsSync(sourcePath)) {
    copyFolderRecursive(sourcePath, deployDir);
    console.log('✅ Arquivos do frontend copiados');
  } else {
    console.error('❌ Pasta dist/public não encontrada!');
    process.exit(1);
  }

  // 5. Copiar .htaccess
  if (fs.existsSync('.htaccess')) {
    fs.copyFileSync('.htaccess', path.join(deployDir, '.htaccess'));
    console.log('✅ .htaccess copiado');
  }

  // 6. Copiar index.php se existir
  if (fs.existsSync('public_html/index.php')) {
    fs.copyFileSync('public_html/index.php', path.join(deployDir, 'index.php'));
    console.log('✅ index.php copiado');
  }

  // 7. Criar arquivo README para deploy
  const readmeContent = `# Arquivos para Upload na Hostinger

## Instruções:
1. Acesse o File Manager da Hostinger
2. Vá para a pasta public_html
3. Delete todos os arquivos existentes (faça backup primeiro!)
4. Faça upload de TODOS os arquivos desta pasta
5. Aguarde alguns minutos para propagação

## Arquivos incluídos:
- index.html (aplicação principal)
- assets/ (CSS, JS, imagens)
- .htaccess (configuração do servidor)
- index.php (fallback)
- Outros arquivos estáticos

## Verificação:
Após upload, acesse seu domínio e verifique se tudo funciona corretamente.

Build gerado em: ${new Date().toLocaleString('pt-BR')}
`;

  fs.writeFileSync(path.join(deployDir, 'README-DEPLOY.txt'), readmeContent);

  console.log('\n✅ Build concluído com sucesso!');
  console.log(`📦 Arquivos prontos para upload em: ${deployDir}/`);
  console.log('📖 Leia o arquivo README-DEPLOY.txt para instruções');
  console.log('\n🔧 Para fazer deploy, execute:');
  console.log('   npm run deploy:prepare');

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}

function copyFolderRecursive(source, target) {
  const files = fs.readdirSync(source);

  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.lstatSync(sourcePath).isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyFolderRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
} 