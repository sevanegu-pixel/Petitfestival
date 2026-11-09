// Options de l'aperçu (thème, typos, mise en page du programme) : mémorisées dans le navigateur, appliquées avant l'affichage.
(function () {
  var d = document.documentElement, o = {};
  try { o = JSON.parse(localStorage.getItem('pf_opts') || '{}') || {}; } catch (e) { o = {}; }
  var def = { theme: 'clair', titre: 'fraunces', texte: 'newsreader', prog: 'grand', texture: 'argentique', menu: 'centre', ombre: '60', lueur: '40', sections: 'unies' };
  var CURSEURS = { ombre: '--ok', lueur: '--lk' };
  function poser(k, v) { if (CURSEURS[k]) { if (!/^\d+$/.test(String(v))) v = def[k]; d.style.setProperty(CURSEURS[k], Number(v) / 100); } else d.setAttribute('data-' + k, v); }
  Object.keys(def).forEach(function (k) { poser(k, o[k] || def[k]); });
  window.PF_OPTS = {
    def: def,
    get: function (k) { var v = o[k] || def[k]; return CURSEURS[k] && !/^\d+$/.test(String(v)) ? def[k] : v; },
    set: function (k, v) { o[k] = v; poser(k, v); try { localStorage.setItem('pf_opts', JSON.stringify(o)); } catch (e) {} }
  };
})();
