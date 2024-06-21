/**
 * @param {string} src
 * @returns {HTMLImageElement}
 */
function LinkIcon(src) {
  const icon = document.createElement('img');
  icon.classList.add('linkIcon');
  icon.src = src;
  return icon;
}
