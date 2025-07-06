#!/bin/bash

echo "🔧 Verificando estrutura necessária..."

# Cria pasta de logs, se não existir
mkdir -p logs

# Cria arquivos .txt se não existirem
touch grupos_visitados.txt
touch grupos_autorizados.txt
touch grupos_mensagens.txt

echo "✅ Estrutura pronta no host."

echo "🐳 Iniciando o Docker..."
docker-compose up --build
