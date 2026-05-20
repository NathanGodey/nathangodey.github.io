(function () {
  function sampleColor(img) {
    try {
      var w = 24;
      var h = 24;
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      var data = ctx.getImageData(0, 0, w, h).data;

      var r = 0, g = 0, b = 0, n = 0;
      for (var i = 0; i < data.length; i += 4) {
        var pr = data[i], pg = data[i + 1], pb = data[i + 2], pa = data[i + 3];
        if (pa < 10) continue;
        // skip near-white (likely paper background) so we get the meaningful color
        if (pr > 240 && pg > 240 && pb > 240) continue;
        r += pr; g += pg; b += pb; n++;
      }
      if (n === 0) return null;
      r = Math.round(r / n);
      g = Math.round(g / n);
      b = Math.round(b / n);

      // Soften: blend toward white so the color stays light enough for a background
      var soften = 0.55; // 0 = original color, 1 = pure white
      r = Math.round(r + (255 - r) * soften);
      g = Math.round(g + (255 - g) * soften);
      b = Math.round(b + (255 - b) * soften);

      return 'rgb(' + r + ',' + g + ',' + b + ')';
    } catch (e) {
      return null; // canvas tainted or other error -> fall back to CSS default
    }
  }

  function apply(img) {
    var parent = img.parentElement;
    if (!parent) return;
    // .preview-img may be the immediate parent (Chirpy wraps imgs); walk up one more
    if (parent.classList.contains('preview-img')) parent = parent.parentElement;
    if (!parent) return;

    var color = sampleColor(img);
    if (color) parent.style.backgroundColor = color;
  }

  function init() {
    var imgs = document.querySelectorAll('img[data-bg-sample]');
    imgs.forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        apply(img);
      } else {
        img.addEventListener('load', function () { apply(img); }, { once: true });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
