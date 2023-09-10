(async () => {
  const isDarkmode = (await getSyncStorage()).darkmode;
  if (isDarkmode) {
    document.documentElement.setAttribute('data-dark', 'true');
  }
})();