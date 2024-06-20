onPage('article', () => {
  window.addEventListener(
    'selectstart',
    function (event) {
      event.stopImmediatePropagation();
    },
    true,
  );
});
