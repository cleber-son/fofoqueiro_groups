module.exports = function extrairLinks(texto) {
  const regex = /https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]{22}/g;
  return texto.match(regex) || [];
};
