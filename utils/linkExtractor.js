module.exports = function extractLinks(text) {
  if (!text) return [];
  const regex = /https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/g;
  return text.match(regex) || [];
};
