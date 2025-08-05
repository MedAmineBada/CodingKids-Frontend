export function cleanSpaces(text) {
  return text.trim().replace(/\s+/g, " ");
}
export function removeAllSpaces(text) {
  return text.replace(/\s+/g, "");
}
export function capitalizeWords(text) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
