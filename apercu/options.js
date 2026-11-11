// Options de l'aperçu (thème, typos, mise en page du programme) : mémorisées dans le navigateur, appliquées avant l'affichage.
(function () {
  var d = document.documentElement, o = {};
  try { o = JSON.parse(localStorage.getItem('pf_opts') || '{}') || {}; } catch (e) { o = {}; }
  if (o.v !== 2) { delete o.menu; o.v = 2; try { localStorage.setItem('pf_opts', JSON.stringify(o)); } catch (e) {} } // nouvel entête « comme le dépliant » montré une fois par défaut
  var def = { theme: 'clair', titre: 'fraunces', texte: 'newsreader', prog: 'grand', texture: 'argentique', menu: 'centre-depliant', ombre: '60', lueur: '40', sections: 'unies', entete: 'aucun' };
  var CURSEURS = { ombre: '--ok', lueur: '--lk' };
  function poser(k, v) { if (CURSEURS[k]) { if (!/^\d+$/.test(String(v))) v = def[k]; d.style.setProperty(CURSEURS[k], Number(v) / 100); } else d.setAttribute('data-' + k, v); }
  Object.keys(def).forEach(function (k) { poser(k, o[k] || def[k]); });
  window.PF_OPTS = {
    def: def,
    get: function (k) { var v = o[k] || def[k]; return CURSEURS[k] && !/^\d+$/.test(String(v)) ? def[k] : v; },
    set: function (k, v) { o[k] = v; poser(k, v); try { localStorage.setItem('pf_opts', JSON.stringify(o)); } catch (e) {} }
  };
})();
