// Options de l'aperçu (thème, typos, mise en page du programme) : mémorisées dans le navigateur, appliquées avant l'affichage.
(function () {
  var d = document.documentElement, o = {};
  try { o = JSON.parse(localStorage.getItem('pf_opts') || '{}') || {}; } catch (e) { o = {}; }
  var def = { theme: 'clair', titre: 'fraunces', texte: 'newsreader', prog: 'grand', texture: 'argentique', menu: 'centre' };
  Object.keys(def).forEach(function (k) { d.setAttribute('data-' + k, o[k] || def[k]); });
  window.PF_OPTS = {
    def: def,
    get: function (k) { return o[k] || def[k]; },
    set: function (k, v) { o[k] = v; d.setAttribute('data-' + k, v); try { localStorage.setItem('pf_opts', JSON.stringify(o)); } catch (e) {} }
  };
})();
