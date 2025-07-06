#!/bin/bash
#
#<!-- 
#==================================================
#🤖 WhatsApp Multifunction Bot – By Cleberson Souza
#==================================================
# Author: Cleberson Souza
# Email: cleberson.brasil@gmail.com
# Created: 2025-06-29
# Version: 2.0.1
# License: MIT
# Description:
#   A powerful, multi-purpose WhatsApp bot with scheduled commands, 
#   weather, news, currency conversions, AI, forbidden word alerts, and more.
#==================================================
#-->
#


# Função para criar pastas se não existirem
check_and_create_folders() {
  for dir in logs .wwebjs_auth .webjs_cache; do
    if [ ! -d "$dir" ]; then
      echo "📁 Criando diretório '$dir'..."
          touch grupos_visitados.txt
    touch grupos_autorizados.txt
    touch grupos_mensagens.txt
      mkdir -p "$dir"
    else
      echo "✅ Diretório '$dir' já existe."
    fi
  done
}

case "$1" in
start)
  echo "📂 Verificando pastas necessárias..."
  check_and_create_folders

  echo "🔄 Atualizando o repositório..."
  git pull origin main

  echo "🐳 Recriando imagem Docker..."
  docker compose build

  echo "🚀 Iniciando o bot em segundo plano..."
  docker compose up -d

  echo "✅ Bot iniciado!"
  ;;
stop)
  echo "🛑 Parando o bot..."
  docker compose stop
  echo "✅ Bot parado!"
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
  echo "Use: $0 {start|stop|restart|status|logs}"
  exit 1
  ;;
esac



