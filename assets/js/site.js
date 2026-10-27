// Abstract / BibTeX toggles and copy button on publication entries.
document.addEventListener('click', function (e) {
  var toggle = e.target.closest('[data-toggle]');
  if (toggle) {
    var pub = toggle.closest('.pub');
    pub.querySelectorAll('[data-toggle]').forEach(function (b) {
      var panel = pub.querySelector('[data-panel="' + b.getAttribute('data-toggle') + '"]');
      var open = b === toggle && panel.hidden;
      panel.hidden = !open;
      b.setAttribute('aria-expanded', open);
    });
    return;
  }
  var copy = e.target.closest('[data-copy]');
  if (copy) {
    var text = copy.parentElement.querySelector('code').textContent;
    navigator.clipboard.writeText(text).then(function () {
      copy.textContent = 'Copied';
      setTimeout(function () { copy.textContent = 'Copy'; }, 1500);
    });
  }
});
