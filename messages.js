const mensagens = [
  "Oi gente! Cheguei há pouco na cidade e tô procurando grupos de WhatsApp. Alguém tem algum pra indicar?",
  "Boa tarde! Quem puder compartilhar links de grupos da cidade (compra, venda, notícias), agradeço muito ❤️",
  "Oiê! Vocês conhecem grupos legais daqui? Pode ser de classificados, dicas, eventos... tô querendo me conectar :)",
  "Olá! Tô montando uma listinha de grupos úteis da região. Se alguém puder mandar alguns links, seria ótimo!",
  "Gente, alguém tem grupos de WhatsApp da cidade? Compra e venda, avisos, achadinhos... tô por fora ainda.",
  "Oi! Acabei de chegar por aqui e queria me enturmar. Me indicam grupos de WhatsApp da cidade?",
  "Olá, tudo bem? Alguém pode me mandar links de grupos de compra e venda ou informações da região?",
  "E aí, pessoal! Se alguém tiver grupos ativos da cidade e puder me adicionar, fico super agradecida 😄",
  "Oi, pessoal! Aceito links de grupos da cidade, qualquer tipo: notícias, empregos, bazar, o que tiver!",
  "Bom dia! Tô caçando grupos bons daqui. Quem tiver link de WhatsApp de compra, eventos ou notícias, me manda?"
];

module.exports = {
  sortear: () => mensagens[Math.floor(Math.random() * mensagens.length)]
};
