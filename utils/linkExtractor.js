module.exports = function extractLinks(text) {
  if (!text) return [];
  text = text.replace(/\s+/g, ''); // remove espaços e quebras
  const regex = /(?:https?:\/\/)?chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/g;
  return text.match(regex) || [];
};
