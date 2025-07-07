#!/bin/bash

#==================================================
# 🤖 Robô dos Grupos – Start Script
# Autor: Cleberson Souza
#==================================================

# Função para criar pastas se não existirem
export $(grep -v '^#' .env | xargs)

check_and_create_folders() {
  for dir in logs .wwebjs_auth .wwebjs_cache; do
    if [ ! -d "$dir" ]; then
      echo "📁 Criando diretório '$dir'..."
      mkdir -p "$dir"
    else
      echo "✅ Diretório '$dir' já existe."
    fi
  done
}

# Função para criar arquivos .txt se não existirem
check_and_create_files() {
  for file in grupos_visitados.txt grupos_autorizados.txt grupos_mensagens.txt; do
    if [ ! -f "$file" ]; then
      echo "📝 Criando arquivo '$file'..."
      touch "$file"
    fi
  done
}

# Verificações iniciais
echo "📂 Verificando estrutura..."
check_and_create_folders
check_and_create_files

# Comportamento baseado no argumento
case "$1" in
start)
  echo "🔄 Atualizando o repositório..."
  git pull origin main

  echo "🐳 Recriando imagem Docker..."
  docker compose build

  echo "🚀 Iniciando o bot em segundo plano..."
  docker compose up -d
  echo "✅ Bot iniciado! Use './start.sh logs' para ver os logs"
  ;;

interactive)
  echo "🧪 Rodando bot em modo interativo (permite entrada de teclas)..."
  docker compose run --rm ${CONTAINER_NAME}
  ;;

stop)
  echo "🛑 Parando o bot..."
  docker compose stop
  ;;

restart)
  echo "🔁 Reiniciando o bot..."
  docker compose restart
  ;;

status)
  echo "📊 Status do container:"
  docker compose ps
  ;;

logs)
  echo "📜 Exibindo logs (pressione CTRL+C para sair)..."
  docker compose logs -f
  ;;

*)
  echo "❌ Uso inválido."
  echo "Use: $0 {start|interactive|stop|restart|status|logs}"
  exit 1
  ;;
esac
