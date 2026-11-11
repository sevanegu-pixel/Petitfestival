// Options de l'aperçu (thème, typos, mise en page du programme) : mémorisées dans le navigateur, appliquées avant l'affichage.
(function () {
  var d = document.documentElement, o = {};
  // Panneau masqué pour les visiteurs (aperçu envoyé aux artistes) : il ne revient qu'avec ?options=1 dans l'adresse, et les choix mémorisés ne s'appliquent que dans ce cas.
  var actif = false;
  try { if (/[?&]options=1/.test(location.search)) sessionStorage.setItem('pf_optsOn', '1'); if (/[?&]options=0/.test(location.search)) sessionStorage.removeItem('pf_optsOn'); actif = sessionStorage.getItem('pf_optsOn') === '1'; } catch (e) {}
  try { if (actif) o = JSON.parse(localStorage.getItem('pf_opts') || '{}') || {}; } catch (e) { o = {}; }
  if (actif && o.v !== 2) { delete o.menu; o.v = 2; try { localStorage.setItem('pf_opts', JSON.stringify(o)); } catch (e) {} } // nouvel entête « comme le dépliant » montré une fois par défaut
  var def = { theme: 'clair', titre: 'fraunces', texte: 'newsreader', prog: 'grand', texture: 'argentique', menu: 'centre-depliant', ombre: '60', lueur: '40', sections: 'unies', entete: 'aucun' };
  var CURSEURS = { ombre: '--ok', lueur: '--lk' };
  function poser(k, v) { if (CURSEURS[k]) { if (!/^\d+$/.test(String(v))) v = def[k]; d.style.setProperty(CURSEURS[k], Number(v) / 100); } else d.setAttribute('data-' + k, v); }
  Object.keys(def).forEach(function (k) { poser(k, o[k] || def[k]); });
  window.PF_OPTS = {
    def: def, actif: actif,
    get: function (k) { var v = o[k] || def[k]; return CURSEURS[k] && !/^\d+$/.test(String(v)) ? def[k] : v; },
    set: function (k, v) { o[k] = v; poser(k, v); try { localStorage.setItem('pf_opts', JSON.stringify(o)); } catch (e) {} }
  };
})();
