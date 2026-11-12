(function () {
  var F = window.FESTIVAL || {}, SP = window.SPECTACLES || {}, OPTS = window.PF_OPTS;
  var MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  var MOIS_COURT = ['jan','fév','mars','avr','mai','juin','juil','août','sept','oct','nov','déc'];
  var JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  var page = document.body.getAttribute('data-page');
  var evenements = null, erreurChargement = false, BROUILLON = false;
  var FRAIS = /[?&]frais=/.test(location.search); // ?frais=1 : ignorer la copie locale (aperçu depuis l'appli)
  var APERCU = /\/apercu\//.test(location.pathname);
  var CACHE = 'pf_evenements';
  // Réglages du formulaire de réservation, choisis dans l'appli (réponse « formulaire » de ?api=evenements). Sans eux : comportement d'origine.
  var FORM = { telephone: 'facultatif', message: 'facultatif', telDes: 0, maxPlaces: 10 };
  function reglerForm(f) {
    if (!f || typeof f !== 'object') return;
    ['telephone', 'message'].forEach(function (k) { if (/^(facultatif|obligatoire|masque)$/.test(f[k])) FORM[k] = f[k]; });
    FORM.telDes = Math.max(0, Math.floor(Number(f.telDes) || 0)); FORM.maxPlaces = Math.max(1, Math.floor(Number(f.maxPlaces) || 10));
  }
  function telObligatoire(places) { return FORM.telephone === 'obligatoire' || (FORM.telephone === 'facultatif' && FORM.telDes > 0 && Number(places) >= FORM.telDes); }
  function champTel() {
    if (FORM.telephone === 'masque') return '';
    var des = FORM.telephone === 'facultatif' && FORM.telDes > 0;
    return '<label for="telephone">Téléphone<span id="telEtoile"' + (telObligatoire(1) ? '' : ' hidden') + '> *</span>' + (des ? ' <small class="mention">obligatoire à partir de ' + FORM.telDes + ' places</small>' : '') + '</label><input id="telephone" name="telephone" type="tel" autocomplete="tel"' + (telObligatoire(1) ? ' required' : '') + '>';
  }
  function champMessage() { return FORM.message === 'masque' ? '' : '<label for="message">Message' + (FORM.message === 'obligatoire' ? ' *' : '') + '</label><textarea id="message" name="message"' + (FORM.message === 'obligatoire' ? ' required' : '') + '></textarea>'; }
  // Le téléphone devient obligatoire dès que le nombre de places atteint le seuil choisi.
  function suivreTel(f) {
    var sel = f.querySelector('[name=places]'), tel = f.querySelector('[name=telephone]'), et = f.querySelector('#telEtoile');
    if (!sel || !tel) return;
    function maj() { var o = telObligatoire(sel.value); tel.required = o; if (et) et.hidden = !o; }
    sel.addEventListener('change', maj); maj();
  }
  function erreurForm(d) {
    if (FORM.telephone !== 'masque' && telObligatoire(d.places) && !String(d.telephone || '').trim()) return FORM.telephone === 'obligatoire' ? 'Indiquez votre numéro de téléphone.' : 'À partir de ' + FORM.telDes + ' places, indiquez votre numéro de téléphone.';
    if (FORM.message === 'obligatoire' && !String(d.message || '').trim()) return 'Écrivez un message.';
    return '';
  }

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }).replace(/« /g, '«\u00a0').replace(/ »/g, '\u00a0»'); } // guillemets français collés au mot (espace insécable)
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function parties(iso) { var p = iso.split('-').map(Number); return { a: p[0], m: p[1], j: p[2], js: new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay() }; }
  function dateLongue(iso) { var d = parties(iso); return JOURS[d.js] + ' ' + (d.j === 1 ? '1er' : d.j) + ' ' + MOIS[d.m - 1]; }
  function dateCourte(iso) { var d = parties(iso); return JOURS[d.js].slice(0, 3) + ' ' + d.j + ' ' + MOIS_COURT[d.m - 1]; }
  function maj(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function heure(e) { return e.debut ? e.debut + (e.fin ? ' – ' + e.fin : '') : ''; }
  function contact() { return F.contact ? '<a href="mailto:' + esc(F.contact) + '">' + esc(F.contact) + '</a>' : ''; }
  // Mise en forme simple des textes : **gras**, *italique*, « ## Sous-titre », « > citation », « - liste », lignes vides = paragraphes.
  function enrichir(p) { return esc(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+?)\*/g, '$1<em>$2</em>'); }
  function paras(t) {
    return String(t || '').replace(/\r/g, '').split(/\n\s*\n/).map(function (p) {
      p = p.trim(); if (!p) return '';
      if (/^##\s*/.test(p)) return '<h3>' + enrichir(p.replace(/^##\s*/, '')) + '</h3>';
      if (/^>\s*/.test(p)) return '<p class="citation">' + enrichir(p.replace(/^>\s*/gm, '')).replace(/\n/g, '<br>') + '</p>';
      if (/^[-•]\s+/.test(p)) return '<ul>' + p.split(/\n/).map(function (l) { return '<li>' + enrichir(l.replace(/^[-•]\s+/, '')) + '</li>'; }).join('') + '</ul>';
      return '<p>' + enrichir(p).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }
  function etat(e) {
    if (e.complet) return '<span class="etat complet">Complet</span>';
    if (e.essai) return '<span class="etat">Bientôt</span>';
    if (!e.reservable) return '<span class="etat">Réservation fermée</span>';
    return e.restantes != null && e.restantes <= 10 ? '<span class="etat">Plus que ' + e.restantes + ' place' + (e.restantes > 1 ? 's' : '') + '</span>' : '';
  }
  function pluriel(n, mot) { return n + ' ' + mot + (n > 1 ? 's' : ''); }

  // Fusionne une représentation (feuille) avec sa fiche (festival.js) : la feuille gagne si elle est remplie.
  var INDEX = {}; Object.keys(SP).forEach(function (k) { INDEX[norm(k)] = SP[k]; (SP[k].anciensNoms || []).forEach(function (n) { if (!INDEX[norm(n)]) INDEX[norm(n)] = SP[k]; }); });
  function fiche(e) {
    var s = INDEX[norm(e.spectacle || e.titre)] || INDEX[norm(e.titre)] || {};
    var photos = (s.photos || []).slice();
    if (s.photo && !photos.some(function (p) { return p.src === s.photo; })) photos.unshift({ src: s.photo, credit: s.credit || '' });
    // Visuels de la feuille : placés en tête. Si la feuille contient un visuel de la fiche (ou « #seules »),
    // c'est la liste complète choisie dans l'appli : on n'ajoute pas les autres.
    var liste = String(e.image || '').split(/\s*[,\n]\s*/).filter(Boolean), nomDe = function (u) { return String(u).split('?')[0].split('/').pop(); };
    var seules = liste.indexOf('#seules') >= 0 || liste.some(function (u) { return photos.some(function (p) { return nomDe(p.src) === nomDe(u); }); });
    liste = liste.filter(function (u) { return u.charAt(0) !== '#'; });
    if (seules) photos = liste.map(function (u) { return photos.filter(function (p) { return nomDe(p.src) === nomDe(u); })[0] || { src: u, credit: '' }; });
    else liste.reverse().forEach(function (u) {
      var nomF = nomDe(u), deja = photos.findIndex(function (p) { return nomDe(p.src) === nomF; });
      if (deja >= 0) photos.unshift(photos.splice(deja, 1)[0]); else photos.unshift({ src: u, credit: '' });
    });
    var videos = (s.videos || []).slice(); if (s.video) videos.push({ url: s.video }); if (e.video) videos.unshift({ url: e.video });
    return {
      compagnie: e.compagnie || s.compagnie || '', discipline: s.discipline || '', duree: e.duree || s.duree || '', age: e.age || s.age || '',
      court: e.description || s.court || '', long: e.long || s.long || '', tarif: e.tarif || s.tarif || '', banque: s.banque || [], distribution: e.distribution || s.distribution || '', citation: s.citation || '',
      photos: photos, photo: photos.length ? photos[0].src : '', credit: photos.length ? photos[0].credit : '', videos: videos, lien: s.lien || '', lienTitre: s.lienTitre || '', entier: !!s.entier
    };
  }
  function visuel(e, s, classe, href) {
    var tag = href ? 'a' : 'div', h = href ? ' href="' + href + '"' : '';
    if (s.photo) return '<' + tag + h + ' class="visuel ' + (s.entier ? 'entier ' : '') + (classe || '') + '"><img src="' + esc(s.photo) + '" alt="' + esc(e.titre) + '" loading="lazy"></' + tag + '>';
    var t = (norm(e.titre).length % 3);
    return '<' + tag + h + ' class="visuel vide t' + t + ' ' + (classe || '') + '" aria-hidden="true">' + esc((e.titre || '?').charAt(0).toUpperCase()) + '</' + tag + '>';
  }
  function meta(s) { return [s.discipline, s.duree, s.age].filter(Boolean).join(' · '); }
  /* Tarif sur plusieurs lignes (champ « Tarif » de la feuille ou de festival.js) : chaque ligne « Libellé : prix » devient une ligne de grille,
     une ligne qui commence par * devient une note. Sur une seule ligne, le tarif s'affiche tel quel. */
  function tarifHtml(t) {
    t = String(t || ''); if (!/\n/.test(t)) return esc(t);
    var lignes = t.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean), grille = '', notes = '';
    lignes.forEach(function (l) {
      var m = l.match(/^(.*\S)\s+:\s+(.+)$/);
      if (/^\*/.test(l) || !m) notes += '<p class="tarifNote">' + esc(l) + '</p>';
      else grille += '<li><span>' + esc(m[1]) + '</span><b>' + esc(m[2]) + '</b></li>';
    });
    return (grille ? '<ul class="tarifs">' + grille + '</ul>' : '') + notes;
  }
  function lienFiche(e) { return 'programme.html#' + encodeURIComponent(e.id); }
  function lienJour(d) { return 'programme.html#jour-' + d; }
  function memeJour(e) { return evenements.filter(function (x) { return x.date === e.date; }); }

  // Commun à toutes les pages
  document.getElementById('marqueTexte').textContent = F.nomCourt || F.nom || 'Festival';
  document.querySelectorAll('[data-nav]').forEach(function (a) { if (a.getAttribute('data-nav') === page) a.classList.add('actif'); });
  var burger = document.getElementById('burger'), menu = document.getElementById('menu');
  if (burger) burger.onclick = function () { var o = menu.classList.toggle('ouvert'); burger.setAttribute('aria-expanded', o); };
  document.getElementById('pied').innerHTML = '<div class="int"><div><p class="nom">' + esc(F.nom) + '</p><p>' + esc(F.dates) + ' · ' + esc(F.adresse || F.lieu) + '<br>' + contact() + '</p></div>' +
    '<div class="liens"><a href="programme.html">Programme</a><a href="festival.html">Le festival</a><a href="infos.html">Infos pratiques</a>' + (F.theatriculSite ? '<a href="' + esc(F.theatriculSite) + '" rel="noopener">Théâtricul</a>' : '') + '</div></div>';
  function carte(el) {
    if (!el || !F.carte) return;
    el.innerHTML = '<iframe src="' + esc(F.carte) + '" loading="lazy" title="Carte : le Théâtricul" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><span class="legende">' + esc(F.adresse || '') + '</span>';
  }

  // Options de l'aperçu (thème, typos, mise en page)
  if (OPTS && APERCU && OPTS.actif) {
    var GROUPES = [
      ['theme', 'Couleurs', [['clair', 'Clair'], ['nuit', 'Nuit']]],
      ['texture', 'Texture', [['argentique', 'Argentique'], ['nette', 'Nette']]],
      ['titre', 'Typo des titres', [['fraunces', 'Fraunces'], ['archivo', 'Archivo Black'], ['shoulders', 'Big Shoulders'], ['syne', 'Syne (avant)']]],
      ['texte', 'Typo des textes', [['newsreader', 'Newsreader (journal)'], ['franklin', 'Libre Franklin (presse)'], ['atkinson', 'Atkinson'], ['barlow', 'Barlow (avant)']]],
      ['prog', 'Programme', [['grand', 'Grand format'], ['liste', 'Liste (avant)']]],
      ['menu', 'Menu', [['centre-depliant', 'Comme le dépliant (nouveau)'], ['centre', 'Centré, ligne fine'], ['centre-cadre', 'Centré, encadré'], ['centre-pastilles', 'Centré, pastilles'], ['centre-affiche', 'Centré, façon affiche'], ['centre-bande', 'Centré, bande violette'], ['barre', 'Barre en haut (avant)']]],
      ['entete', 'Fond de l\'en-tête', [['aucun', 'Aucun (actuel)'], ['papier', 'Papier kraft'], ['rayures', 'Rayures fines'], ['aurore', 'Aurore (lueurs)'], ['nuit', 'Nuit étoilée'], ['diagonale', 'Diagonale colorée']]],
      ['ombre', 'Ombres (quantité)', 'curseur'],
      ['lueur', 'Lueurs colorées (accueil, bords des sections)', 'curseur'],
      ['sections', 'Couleurs des sections', [['unies', 'Unies (actuel)'], ['papiers', 'Papiers (crème, ivoire, kraft)'], ['rosee', 'Rosée (rose poudré, lavande)'], ['nuit', 'Dernière section nuit']]]
    ];
    var opt = document.createElement('div'); opt.className = 'opt';
    opt.innerHTML = '<button type="button" aria-expanded="false">Options de l\'aperçu</button><div class="panneau">' + GROUPES.map(function (g) {
      if (g[2] === 'curseur') return '<h4>' + g[1] + '</h4><div class="choixOpt curseur"><input type="range" min="0" max="100" step="5" data-k="' + g[0] + '" value="' + esc(OPTS.get(g[0])) + '" aria-label="' + g[1] + '"><output>' + esc(OPTS.get(g[0])) + '</output></div>';
      return '<h4>' + g[1] + '</h4><div class="choixOpt">' + g[2].map(function (c) { return '<button type="button" data-k="' + g[0] + '" data-v="' + c[0] + '" class="' + (OPTS.get(g[0]) === c[0] ? 'on' : '') + '">' + c[1] + '</button>'; }).join('') + '</div>';
    }).join('') + '<p class="note">Ces choix ne concernent que cet aperçu. Dites-moi lesquels garder.</p></div>';
    document.body.appendChild(opt);
    opt.firstChild.onclick = function () { var o = opt.classList.toggle('ouvert'); opt.firstChild.setAttribute('aria-expanded', o); };
    opt.querySelectorAll('.choixOpt input[type=range]').forEach(function (r) { r.oninput = function () { OPTS.set(r.getAttribute('data-k'), r.value); r.nextSibling.textContent = r.value; }; });
    opt.querySelectorAll('.choixOpt button').forEach(function (b) {
      b.onclick = function () {
        OPTS.set(b.getAttribute('data-k'), b.getAttribute('data-v'));
        opt.querySelectorAll('[data-k="' + b.getAttribute('data-k') + '"]').forEach(function (x) { x.classList.toggle('on', x === b); });
        if (b.getAttribute('data-k') === 'prog' && window.PF_RAFRAICHIR) window.PF_RAFRAICHIR();
        if (b.getAttribute('data-k') === 'menu' && document.body.getAttribute('data-page') === 'accueil') location.reload();
      };
    });
  }

  // Chargement : copie locale affichée tout de suite, puis mise à jour depuis l'appli de réservation.
  function preparer(liste) {
    var evs = liste.slice();
    if (window.PROGRAMME_ESSAI && APERCU) {
      var deja = {}; evs.forEach(function (e) { deja[e.date + ' ' + e.debut] = 1; });
      window.PROGRAMME_ESSAI.forEach(function (r, i) {
        if (deja[r[0] + ' ' + r[1]]) return;
        evs.push({ id: 'essai' + i, titre: r[2], spectacle: r[2], date: r[0], debut: r[1], lieu: 'Théâtricul', adresse: 'Chêne-Bourg', places: 45, restantes: 45, reservable: false, complet: false, essai: true });
      });
    }
    evs.sort(function (a, b) { return (a.date + a.debut).localeCompare(b.date + b.debut); });
    return evs;
  }
  function charger(cb) {
    if (!F.api) { evenements = []; cb(); return; }
    var brut = null;
    try { var c = JSON.parse(localStorage.getItem(CACHE) || 'null'); if (!FRAIS && c && c.evenements && Date.now() - c.t < 7 * 86400e3) { brut = c.evenements; reglerForm(c.formulaire); } } catch (e) {}
    if (brut) { evenements = preparer(brut); cb(); }
    else if (window.PROGRAMME_ESSAI && APERCU) { evenements = preparer([]); cb(); }
    fetch(F.api + '?api=evenements').then(function (r) { return r.json(); }).then(function (d) {
      var liste = d.evenements || [], avantForm = JSON.stringify(FORM);
      reglerForm(d.formulaire);
      var texte = JSON.stringify(liste);
      try { localStorage.setItem(CACHE, JSON.stringify({ t: Date.now(), evenements: liste, formulaire: d.formulaire || null })); } catch (e) {}
      if (brut && JSON.stringify(brut) === texte && avantForm === JSON.stringify(FORM)) return;
      evenements = preparer(liste); cb(true);
    }).catch(function () { if (evenements === null) { evenements = []; erreurChargement = true; cb(); } });
  }
  function messageVide() {
    if (!F.api) return '<p class="vide">Le programme et les réservations ouvrent bientôt.</p>';
    if (erreurChargement) return '<p class="vide">Impossible de charger le programme pour le moment. Réessayez dans un instant' + (F.contact ? ', ou écrivez-nous à ' + contact() : '') + '.</p>';
    return '<p class="vide">Le programme arrive bientôt.</p>';
  }

  function carteSpectacle(e) {
    var s = fiche(e);
    return '<a class="carteSp" href="' + lienFiche(e) + '">' + visuel(e, s) + '<div class="corps"><span class="quand">' + esc(dateCourte(e.date)) + (e.debut ? ' · ' + esc(e.debut) : '') + '</span>' +
      '<h3>' + esc(e.titre) + '</h3>' + (s.compagnie ? '<p class="cie">' + esc(s.compagnie) + '</p>' : '') + (s.court ? '<p class="court">' + esc(s.court) + '</p>' : '') +
      '<div class="pied">' + (s.discipline ? '<span class="tag">' + esc(s.discipline) + '</span>' : '<span></span>') + etat(e) + '</div></div></a>';
  }
  function carteGrande(e) {
    var s = fiche(e);
    return '<article class="carteG" id="ev-' + esc(e.id) + '">' + visuel(e, s, '', lienFiche(e)) + '<div class="corps"><p class="heure">' + esc(heure(e)) + '</p><h3><a href="' + lienFiche(e) + '">' + esc(e.titre) + '</a></h3>' +
      '<p class="meta">' + esc([s.compagnie, meta(s)].filter(Boolean).join(' · ')) + '</p>' + (s.court ? '<p class="court">' + esc(s.court) + '</p>' : '') +
      '<div class="pied">' + (e.reservable ? '<a class="btn" href="' + lienFiche(e) + '">Réserver</a>' : '') + '<a class="lien" href="' + lienFiche(e) + '">' + (s.long || s.photos.length > 1 || s.videos.length ? 'Photos, vidéo et texte complet' : 'En savoir plus') + '</a>' + etat(e) + '</div></div></article>';
  }
  function boutonJour(d, classe) {
    var ouverts = evenements.filter(function (x) { return x.date === d && x.reservable; }).length;
    return '<a class="btn ' + (ouverts ? '' : 'contour ') + (classe || '') + '" href="' + lienJour(d) + '#resaJour">' + (ouverts ? 'Réserver la journée' : 'Voir la journée') + '</a>';
  }

  // ----- Accueil
  if (page === 'accueil') {
    document.getElementById('heroEdition').textContent = F.edition || '';
    document.getElementById('heroTitre').textContent = F.nom || '';
    document.getElementById('heroDates').textContent = F.dates || '';
    document.getElementById('heroLieu').textContent = (document.documentElement.getAttribute('data-menu') === 'centre-depliant' && F.accroche) || F.lieu || '';
    document.getElementById('hero').insertAdjacentHTML('beforeend', '<div class="rayures" aria-hidden="true"></div>');
    document.getElementById('presTexte').innerHTML = (F.accroche ? '<p class="chapo">' + esc(F.accroche) + '</p>' : '') + paras((F.presentation || []).slice(0, 1).join('\n\n')) + '<p><a href="festival.html">En savoir plus sur le festival</a></p>';
    document.getElementById('accesCourt').innerHTML = '<p><b>' + esc(F.adresse || F.lieu) + '</b></p>' + (F.acces || []).slice(0, 2).map(function (a) { return '<p><b>' + esc(a[0]) + '.</b> ' + esc(a[1]) + '</p>'; }).join('');
    carte(document.getElementById('carte'));
    var pr = document.getElementById('prochains');
    pr.innerHTML = '<p class="vide">Chargement du programme…</p>';
    charger(function () {
      if (!evenements.length) { pr.innerHTML = messageVide(); return; }
      var h = '', jour = '';
      evenements.forEach(function (e) {
        if (e.date !== jour) {
          jour = e.date; var p = parties(jour), n = evenements.filter(function (x) { return x.date === jour; }).length;
          h += (h ? '</div></section>' : '') + '<section class="jourA"><header><a href="' + lienJour(jour) + '"><span class="num">' + p.j + '</span><span class="nomJour">' + esc(JOURS[p.js] + ' ' + MOIS[p.m - 1]) + '</span></a>' +
            '<span class="resume">' + pluriel(n, 'spectacle') + '</span><a class="btn petitbtn contour" href="' + lienJour(jour) + '">Voir la journée</a></header><div class="grilleA">';
        }
        var s = fiche(e);
        h += '<a class="carteA" href="' + lienFiche(e) + '">' + visuel(e, s) + '<div class="corps"><span class="heure">' + esc(e.debut || '') + '</span><h3>' + esc(e.titre) + '</h3>' + (s.compagnie ? '<p class="cie">' + esc(s.compagnie) + '</p>' : '') + (etat(e) ? '<p class="etatA">' + etat(e) + '</p>' : '') + '</div></a>';
      });
      pr.innerHTML = h + '</div></section>';
      jsonLd(evenements);
    });
  }

  // ----- Le festival
  if (page === 'festival') {
    document.getElementById('festAccroche').textContent = F.accroche || '';
    document.getElementById('festTexte').innerHTML = paras((F.presentation || []).join('\n\n'));
    document.getElementById('festLieu').textContent = F.theatricul || '';
    document.getElementById('festOrga').textContent = F.organisation || '';
    var feu = F.coinDuFeu, zf = document.getElementById('coinFeu');
    if (feu && zf) { document.getElementById('feuSur').textContent = feu.sur || ''; document.getElementById('feuTitre').textContent = feu.titre || ''; document.getElementById('feuTexte').innerHTML = paras((feu.textes || []).join('\n\n')); zf.hidden = false; }
    var hm = F.hommage, secH = document.getElementById('gerard');
    if (hm && secH) {
      secH.hidden = false;
      secH.querySelector('.hommage').innerHTML = (hm.photo ? '<figure><img src="' + esc(hm.photo) + '" alt="" loading="lazy"><figcaption>' + esc(hm.legende || '') + '</figcaption></figure>' : '') +
        '<div><p class="sur">' + esc(hm.sur || 'En mémoire') + '</p><h2>' + esc(hm.titre) + '</h2>' + paras((hm.textes || []).join('\n\n')) + '</div>';
    }
    var lt = document.getElementById('festLienTheatricul'); if (F.theatriculSite) lt.href = F.theatriculSite; else lt.parentNode.remove();
    var art = document.getElementById('artistes');
    art.innerHTML = Object.keys(SP).filter(function (k) { return SP[k].court; }).map(function (k) {
      var s = SP[k]; return '<div class="artiste"><h3>' + esc(s.compagnie || k) + '</h3><p>' + esc(k) + (s.discipline ? ' · ' + esc(s.discipline) : '') + '</p></div>';
    }).join('');
    charger(function () {});
  }

  // ----- Infos pratiques
  if (page === 'infos') {
    document.getElementById('infosCartes').innerHTML = (F.infos || []).map(function (i) { return '<div><h3>' + esc(i[0]) + '</h3><p>' + esc(i[1]) + '</p></div>'; }).join('');
    document.getElementById('adresse').textContent = (F.lieu ? F.lieu.split(',')[0] + ', ' : '') + (F.adresse || '');
    document.getElementById('accesListe').innerHTML = (F.acces || []).map(function (a) { return '<div><h3>' + esc(a[0]) + '</h3><p>' + esc(a[1]) + '</p></div>'; }).join('');
    var it = document.getElementById('itineraire'); if (F.itineraire) it.href = F.itineraire; else it.remove();
    carte(document.getElementById('carte'));
    var cm = document.getElementById('contactMail'); cm.href = 'mailto:' + F.contact; cm.textContent = F.contact;
    document.getElementById('infosTheatricul').innerHTML = F.theatriculSite ? 'Le lieu : <a href="' + esc(F.theatriculSite) + '" rel="noopener">theatricul.net</a>.' : '';
    charger(function () {});
  }

  // ----- Programme, pages par jour et fiches
  if (page === 'programme') {
    var vue = document.getElementById('vue'), filtreActif = '', vueActuelle = '';
    function dates() { var d = []; evenements.forEach(function (e) { if (d.indexOf(e.date) < 0) d.push(e.date); }); return d; }
    function barreJours(active) {
      return '<nav class="jours" aria-label="Aller à une journée"><div class="pellicule">' + dates().map(function (d) { var p = parties(d); return '<a href="' + (active === undefined ? '#jour-' + d : lienJour(d)) + '" class="' + (active === d ? 'on' : '') + '"><b>' + p.j + '</b>' + esc(JOURS[p.js].slice(0, 3) + '.') + '</a>'; }).join('') + '</div></nav>';
    }
    function enteteJour(d, lien) {
      var p = parties(d), evs = evenements.filter(function (e) { return e.date === d; });
      var titre = '<span class="nomJour">' + esc(JOURS[p.js] + ' ' + MOIS[p.m - 1]) + '</span><span class="num">' + p.j + '</span>';
      return '<header class="jourTete"><div>' + (lien ? '<a href="' + lienJour(d) + '" style="text-decoration:none;color:inherit">' + titre + '</a>' : titre) + '</div>' +
        '<p class="resume">' + pluriel(evs.length, 'spectacle') + (evs[0].debut ? ' · dès ' + esc(evs[0].debut) : '') + '</p><div class="jourActions">' + boutonJour(d) + '</div></header>';
    }
    function programme() {
      var h = '<section class="entete"><div class="int large"><p class="sur">Programme</p><h1>Dix-huit jours, tous les genres</h1><p class="chapo">Chaque spectacle a son tarif, souvent au chapeau. Réservez spectacle par spectacle, ou toute une journée d\'un coup : la salle est petite. La programmation peut encore évoluer : revenez voir cette page.</p>';
      if (evenements === null) return h + '</div></section><section class="bande pres"><div class="int large"><p class="vide">Chargement du programme…</p></div></section>';
      if (!evenements.length) return h + '</div></section><section class="bande pres"><div class="int large">' + messageVide() + '</div></section>';
      h += barreJours() + '</div></section><section class="bande pres"><div class="int large">';
      var grand = !OPTS || OPTS.get('prog') !== 'liste';
      var jour = '', ouvert = false, n = 0;
      evenements.forEach(function (e, i) {
        var s = fiche(e);
        if (filtreActif && s.discipline !== filtreActif) return;
        if (e.date !== jour) {
          jour = e.date; var d = parties(jour); n = evenements.filter(function (x) { return x.date === jour && (!filtreActif || fiche(x).discipline === filtreActif); }).length;
          if (grand) h += (ouvert ? '</div></section>' : '') + '<section class="jourG" id="jour-' + jour + '">' + enteteJour(jour, true) + '<div class="grilleG n' + n + '">';
          else h += (ouvert ? '</div></div>' : '') + '<div class="jour" id="jour-' + jour + '"><div class="date"><span class="num">' + d.j + '</span><span class="nomJour">' + esc(JOURS[d.js] + ' ' + MOIS[d.m - 1]) + '</span>' + boutonJour(jour, 'petitbtn') + '</div><div class="liste">';
          ouvert = true;
        }
        if (grand) h += carteGrande(e);
        else h += '<article class="ev" id="ev-' + esc(e.id) + '">' + visuel(e, s) + '<div><p class="heure">' + esc(heure(e)) + '</p><h3><a href="' + lienFiche(e) + '">' + esc(e.titre) + '</a></h3>' +
          '<p class="meta">' + esc([s.compagnie, meta(s)].filter(Boolean).join(' · ')) + '</p>' + (s.court ? '<p class="court">' + esc(s.court) + '</p>' : '') + '</div>' +
          '<div class="action">' + (e.reservable ? '<a class="btn" href="' + lienFiche(e) + '">Réserver</a>' : '<a class="btn contour" href="' + lienFiche(e) + '">Voir</a>') + etat(e) + '</div></article>';
      });
      if (ouvert) h += grand ? '</div></section>' : '</div></div>';
      h += '</div></section>';
      if (F.hommage && F.hommage.ligneProgramme) h += '<p class="memoireLigne"><img src="favicon.svg" alt=""><span>' + esc(F.hommage.ligneProgramme) + '</span> <a href="festival.html#gerard">' + esc(F.hommage.lienTexte || 'En savoir plus') + '</a></p>';
      return h;
    }
    function afficherProgramme() {
      document.documentElement.classList.remove('ficheResa');
      document.title = 'Programme · ' + (F.nom || 'Festival');
      vue.innerHTML = programme(); vueActuelle = 'programme';
      vue.querySelectorAll('.filtre button').forEach(function (b) { b.onclick = function () { filtreActif = b.getAttribute('data-f'); afficherProgramme(); }; });
      vue.querySelectorAll('.jours a').forEach(function (a) { a.onclick = function (ev) { var el = document.getElementById(a.getAttribute('href').slice(1)); if (el) { ev.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }; });
    }

    // Page d'une journée : tous les spectacles du jour + réservation groupée
    function afficherJour(d) {
      document.documentElement.classList.remove('ficheResa');
      var evs = evenements.filter(function (e) { return e.date === d; }), ds = dates(), i = ds.indexOf(d);
      document.title = maj(dateLongue(d)) + ' · ' + (F.nom || 'Festival');
      var ouverts = evs.filter(function (e) { return e.reservable; });
      var h = '<section class="entete"><div class="int large"><a class="retour" href="programme.html">← Tout le programme</a><p class="sur">Journée</p><h1>' + esc(maj(dateLongue(d))) + '</h1>' +
        '<p class="chapo">' + pluriel(evs.length, 'spectacle') + (evs[0].debut ? ' à partir de ' + esc(evs[0].debut) : '') + '. ' + (ouverts.length ? 'Réservez vos places pour plusieurs spectacles d\'un coup, en bas de page.' : 'Les réservations de cette journée ouvriront prochainement.') + '</p>' +
        '<div class="actions">' + (ouverts.length ? '<a class="btn" href="#resaJour">Réserver la journée</a>' : '') + (i > 0 ? '<a class="btn contour" href="' + lienJour(ds[i - 1]) + '">← Jour précédent</a>' : '') + (i < ds.length - 1 ? '<a class="btn contour" href="' + lienJour(ds[i + 1]) + '">Jour suivant →</a>' : '') + '</div>' + barreJours(d) + '</div></section>' +
        '<section class="bande pres"><div class="int large" id="programmeJour"><div class="grilleG n' + evs.length + '">' + evs.map(carteGrande).join('') + '</div>' +
        '<div class="jourNav">' + (i > 0 ? '<a href="' + lienJour(ds[i - 1]) + '">← ' + esc(maj(dateLongue(ds[i - 1]))) + '</a>' : '<span></span>') + (i < ds.length - 1 ? '<a href="' + lienJour(ds[i + 1]) + '">' + esc(maj(dateLongue(ds[i + 1]))) + ' →</a>' : '') + '</div>' +
        '<div class="resaJour" id="resaJour"><h2>Réserver la journée</h2>';
      if (ouverts.length) {
        var max = Math.min(FORM.maxPlaces, Math.max.apply(null, ouverts.map(function (e) { return e.restantes != null ? e.restantes : FORM.maxPlaces; }))), opts = '';
        for (var k = 1; k <= max; k++) opts += '<option>' + k + '</option>';
        h += '<form id="resa" novalidate><div class="cols"><div><h3>Quels spectacles ?</h3><ul class="choix">' + ouverts.map(function (e) {
          return '<li><input type="checkbox" id="ev' + esc(e.id) + '" name="ev" value="' + esc(e.id) + '" checked><label for="ev' + esc(e.id) + '"><b>' + esc(e.debut || '') + '</b>' + esc(e.titre) + '</label>' + etat(e) + '</li>';
        }).join('') + '</ul>' + (ouverts.length < evs.length ? '<p class="petit">Les autres spectacles de la journée ne sont pas encore ouverts à la réservation.</p>' : '') + '</div><div>' +
          '<h3>Vos coordonnées</h3><label for="nom">Prénom et nom *</label><input id="nom" name="nom" autocomplete="name" required>' +
          '<label for="email">E-mail *</label><input id="email" name="email" type="email" autocomplete="email" required>' +
          champTel() +
          '<label for="places">Nombre de places (pour chaque spectacle coché) *</label><select id="places" name="places">' + opts + '</select>' +
          champMessage() +
          '<input class="piege" name="site" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<p class="erreur" id="err" role="alert" hidden></p><p style="margin:18px 0 0"><button class="btn" type="submit">Réserver</button></p>' +
          '<p class="petit">Une réservation par spectacle coché. Vous recevrez un e-mail de confirmation pour chacune. Le paiement se fait sur place.</p></div></div></form>';
      } else {
        h += '<div class="merci"><h3>Réservations bientôt ouvertes</h3><p>Les réservations pour les spectacles de cette journée ouvriront prochainement.' + (F.contact ? ' Une question ? Écrivez-nous à ' + contact() + '.' : '') + '</p></div>';
      }
      var y = scrollY, memeVue = vueActuelle === 'jour';
      vue.innerHTML = h + '</div></div></section>';
      vueActuelle = 'jour';
      if (memeVue) scrollTo(0, Math.min(y, document.body.scrollHeight - innerHeight));
      else if (!/#resaJour$/.test(location.href)) scrollTo(0, 0);
      var actif = vue.querySelector('.jours a.on'); if (actif && actif.scrollIntoView) actif.scrollIntoView({ block: 'nearest', inline: 'center' });
      var f = document.getElementById('resa');
      if (f) { suivreTel(f); f.onsubmit = function (ev) { ev.preventDefault(); envoyerJour(ouverts, f); }; }
    }
    function envoyerJour(ouverts, f) {
      var err = document.getElementById('err'), bt = f.querySelector('button[type=submit]');
      var d = {}; new FormData(f).forEach(function (v, k) { if (k !== 'ev') d[k] = v; });
      var choisis = ouverts.filter(function (e) { return f.querySelector('[name=ev][value="' + e.id + '"]').checked; });
      err.hidden = true;
      if (!choisis.length) return montrer('Cochez au moins un spectacle.');
      if (!d.nom.trim()) return montrer('Indiquez votre nom.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return montrer('L\'adresse e-mail ne semble pas correcte.');
      var ef = erreurForm(d); if (ef) return montrer(ef);
      bt.disabled = true; bt.textContent = 'Envoi…';
      var resultats = [];
      (function suivant(i) {
        if (i >= choisis.length) return fin();
        var e = choisis[i], corps = Object.assign({ api: 'reserver', evenement: e.id }, d);
        fetch(F.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(corps) })
          .then(function (r) { return r.json(); })
          .then(function (r) {
            resultats.push({ e: e, ok: !!r.ok, erreur: r.erreur });
            if (r.ok && r.restantes != null) { e.restantes = r.restantes; e.complet = r.restantes <= 0; e.reservable = !e.complet; }
            suivant(i + 1);
          })
          .catch(function () { resultats.push({ e: e, ok: false, erreur: 'problème de connexion' }); suivant(i + 1); });
      })(0);
      function fin() {
        var ok = resultats.filter(function (r) { return r.ok; }), ko = resultats.filter(function (r) { return !r.ok; });
        f.outerHTML = '<div class="merci"><h3>' + (ok.length ? 'Merci !' : 'Ça n\'a pas marché') + '</h3>' +
          (ok.length ? '<p>' + esc(d.places) + ' place' + (d.places > 1 ? 's' : '') + ' réservée' + (d.places > 1 ? 's' : '') + ' pour :</p><ul class="resultats">' + ok.map(function (r) { return '<li><b>' + esc(r.e.debut || '') + '</b> ' + esc(r.e.titre) + '</li>'; }).join('') + '</ul><p>Un e-mail de confirmation vient de partir à <b>' + esc(d.email) + '</b> pour chaque spectacle.</p>' : '') +
          (ko.length ? '<p class="erreur">Pas de réservation pour : ' + ko.map(function (r) { return esc(r.e.titre) + (r.erreur ? ' (' + esc(r.erreur) + ')' : ''); }).join(', ') + '.</p>' : '') +
          '<p><a href="programme.html">Voir les autres spectacles</a></p></div>';
      }
      function montrer(t) { err.textContent = t; err.hidden = false; }
    }

    function afficherFiche(e) {
      var s = fiche(e), i = evenements.indexOf(e), prec = evenements[i - 1], suiv = evenements[i + 1];
      document.title = e.titre + ' · ' + (F.nom || 'Festival');
      var attente = !!(e.complet && e.attente && !e.reservable);
      var optsResa = (Array.isArray(e.options) ? e.options : []).filter(function (o) { return o && o.id && o.nom; });
      var libresC = optsResa.reduce(function (m, o) { return o.type === 'contingent' && o.restantes > m ? o.restantes : m; }, 0);
      var max = attente ? FORM.maxPlaces : e.restantes != null ? Math.min(FORM.maxPlaces, Math.max(e.restantes, libresC)) : FORM.maxPlaces, opts = '';
      for (var k = 1; k <= max; k++) opts += '<option>' + k + '</option>';
      var autres = memeJour(e).filter(function (x) { return x !== e; });
      var h = '<div class="fiche"><div class="int large"><a class="retour" href="programme.html">← Tout le programme</a>' + '<p class="ficheTete">' + (s.discipline ? '<span class="tag">' + esc(s.discipline) + '</span>' : '') + ((e.reservable || attente) ? '<button type="button" class="btn petitbtn versResa" id="versResa">' + (attente ? 'Liste d\'attente pour ce spectacle' : 'Réserver pour ce spectacle') + '</button>' : '') + '</p><h1>' + esc(e.titre) + '</h1>' +
        (s.compagnie ? '<p class="cie">' + esc(s.compagnie) + '</p>' : '');
      if (s.photos.length) {
        h += '<div class="galerie" id="galerie"><div class="visuel principal' + (s.entier ? ' entier' : '') + '"><img src="' + esc(s.photos[0].src) + '" alt="' + esc(e.titre) + '"></div>' +
          (s.photos.length > 1 ? '<div class="vignettes" role="group" aria-label="Autres photos">' + s.photos.map(function (p, n) { return '<button type="button" class="' + (n ? '' : 'on') + '" data-n="' + n + '" aria-label="Photo ' + (n + 1) + '"><img src="' + esc(p.src) + '" alt="" loading="lazy"></button>'; }).join('') + '</div>' : '') +
          '<p class="credit" id="credit">' + esc(s.photos[0].credit || '') + '</p></div>';
      }
      h += '<div class="cols"><div>' +
        '<dl><dt>Date</dt><dd>' + esc(dateLongue(e.date)) + '</dd>' + (heure(e) ? '<dt>Heure</dt><dd>' + esc(heure(e)) + '</dd>' : '') +
        (s.duree ? '<dt>Durée</dt><dd>' + esc(s.duree) + '</dd>' : '') + (s.age ? '<dt>Public</dt><dd>' + esc(s.age) + '</dd>' : '') +
        '<dt>Lieu</dt><dd>' + esc([e.lieu || 'Théâtricul', e.adresse || F.adresse].filter(Boolean).join(', ')) + '</dd>' +
        (s.tarif ? '<dt>Tarif' + (/\n/.test(s.tarif) ? 's' : '') + '</dt><dd>' + tarifHtml(s.tarif) + '</dd>' : '') + '</dl>' +
        (s.court ? '<div class="desc court">' + enrichir(s.court) + '</div>' : (s.long ? '' : '<p class="vide">Présentation à venir.</p>')) +
        (s.long ? '<button class="lire" id="lire" aria-expanded="false">Lire la suite</button><div class="suite" id="suite">' + paras(s.long) + (s.citation ? '<p class="citation">' + esc(s.citation) + '</p>' : '') + '</div>' : '') +
        (s.videos.length ? '<div class="videos"><h2>En vidéo</h2>' + s.videos.map(video).join('') + '</div>' : '') +
        (s.lien ? '<p><a href="' + esc(s.lien) + '" rel="noopener">' + esc(s.lienTitre || 'Le site de la compagnie') + '</a></p>' : '') +
        (s.distribution ? '<p class="distribution">' + esc(s.distribution) + '</p>' : '') + '</div><div class="colle">';
      if (e.reservable || attente) {
        h += '<form id="resa" novalidate' + (attente ? ' data-attente="1"' : '') + '><h3>' + (attente ? 'Liste d\'attente' : 'Réserver') + '</h3>' + (attente ? '<p class="petit">C\'est complet, mais des places se libèrent souvent : inscrivez-vous, nous vous écrivons dès qu\'il y en a.</p>' : etat(e) ? '<p class="petit">' + etat(e) + '</p>' : '') +
          '<label for="nom">Prénom et nom *</label><input id="nom" name="nom" autocomplete="name" required>' +
          '<label for="email">E-mail *</label><input id="email" name="email" type="email" autocomplete="email" required>' +
          champTel() +
          '<label for="places">Nombre de places *</label><select id="places" name="places">' + opts + '</select>' +
          (optsResa.length && !attente ? '<fieldset class="optionsResa"><legend>Options</legend>' + optsResa.map(function (o) {
            var plein = o.type === 'contingent' && o.restantes != null && o.restantes <= 0;
            return '<label class="optResa' + (plein ? ' plein' : '') + '"><input type="checkbox" name="opt" value="' + esc(o.id) + '"' + (plein ? ' disabled' : '') + '> <span><b>' + esc(o.nom) + '</b>' +
              (o.aide ? '<small>' + esc(o.aide) + '</small>' : '') + (plein ? '<small>Ces places sont toutes prises.</small>' : '') + '</span></label>';
          }).join('') + '</fieldset>' : '') +
          champMessage() +
          '<input class="piege" name="site" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<p class="erreur" id="err" role="alert" hidden></p><p style="margin:18px 0 0"><button class="btn" type="submit">' + (attente ? 'M\'inscrire sur la liste d\'attente' : 'Réserver') + '</button></p>' +
          '<p class="petit">' + (attente ? 'Vous recevrez un e-mail quand une place se libère ; rien n\'est réservé tant que nous ne vous avons pas confirmé.' : 'Vous recevrez un e-mail de confirmation. Le paiement se fait sur place.') + '</p></form>';
      } else {
        h += '<div class="merci"><h3>' + (e.complet ? 'C\'est complet' : e.essai ? 'Réservations bientôt ouvertes' : 'Réservation fermée') + '</h3><p>' +
          (e.essai ? 'Les réservations pour ce spectacle ouvriront prochainement.' : F.contact ? 'Écrivez-nous à ' + contact() + ' : une place se libère parfois.' : 'Une place se libère parfois : revenez voir un peu plus tard.') + '</p></div>';
      }
      h += '<div class="encadre"><h3>' + (autres.length ? 'Le même jour, ' + esc(dateLongue(e.date)) : 'Ce jour-là : ' + esc(dateLongue(e.date))) + '</h3>' +
        (autres.length ? '<ul>' + autres.map(function (x) { return '<li><b>' + esc(x.debut || '') + '</b><a href="' + lienFiche(x) + '">' + esc(x.titre) + '</a></li>'; }).join('') + '</ul>' : '<p class="petit">C\'est le seul spectacle de la journée.</p>') +
        '<div class="liensJour"><a href="' + lienJour(e.date) + '">Voir la journée</a>' + (memeJour(e).some(function (x) { return x.reservable; }) && autres.length ? '<a href="' + lienJour(e.date) + '#resaJour">Réserver la journée</a>' : '') + '</div></div>';
      h += '</div></div>';
      if (prec || suiv) {
        h += '<nav class="navSp" aria-label="Autres spectacles">' +
          (prec ? '<a class="precedent" href="' + lienFiche(prec) + '">' + visuel(prec, fiche(prec)) + '<div><p class="sens">← Spectacle précédent</p><p class="titre">' + esc(prec.titre) + '</p><p class="quand">' + esc(dateCourte(prec.date)) + (prec.debut ? ' · ' + esc(prec.debut) : '') + '</p></div></a>' : '<span></span>') +
          (suiv ? '<a class="suivant" href="' + lienFiche(suiv) + '"><div><p class="sens">Spectacle suivant →</p><p class="titre">' + esc(suiv.titre) + '</p><p class="quand">' + esc(dateCourte(suiv.date)) + (suiv.debut ? ' · ' + esc(suiv.debut) : '') + '</p></div>' + visuel(suiv, fiche(suiv)) + '</a>' : '') + '</nav>';
      }
      vue.innerHTML = h + '</div></div>'; vueActuelle = 'fiche';
      // Sur une fiche réservable, le bouton « Réservation » du menu est remplacé par « Réserver pour ce spectacle », qui descend au formulaire.
      var vr = document.getElementById('versResa');
      document.documentElement.classList.toggle('ficheResa', !!vr);
      if (vr) vr.onclick = function () { var f = document.getElementById('resa'); if (f) { f.scrollIntoView({ behavior: 'smooth', block: 'start' }); var n = document.getElementById('nom'); if (n) setTimeout(function () { n.focus({ preventScroll: true }); }, 500); } };
      scrollTo(0, 0);
      var lire = document.getElementById('lire');
      if (lire) lire.onclick = function () { var o = document.getElementById('suite').classList.toggle('ouvert'); lire.textContent = o ? 'Réduire' : 'Lire la suite'; lire.setAttribute('aria-expanded', o); };
      vue.querySelectorAll('.vignettes button').forEach(function (b) {
        b.onclick = function () {
          var p = s.photos[+b.getAttribute('data-n')];
          document.querySelector('#galerie .principal img').src = p.src; document.getElementById('credit').textContent = p.credit || '';
          vue.querySelectorAll('.vignettes button').forEach(function (x) { x.classList.toggle('on', x === b); });
        };
      });
      var f = document.getElementById('resa');
      if (f) { suivreTel(f); f.onsubmit = function (ev) { ev.preventDefault(); envoyer(e, f); }; }
    }
    function video(v) {
      var h = '', m;
      if (v.src) h = '<div class="video"><video controls preload="metadata"' + (v.poster ? ' poster="' + esc(v.poster) + '"' : '') + ' src="' + esc(v.src) + '"></video></div>';
      else if ((m = String(v.url || '').match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/)([\w-]{11})/))) h = '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + m[1] + '" title="' + esc(v.titre || 'Vidéo') + '" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
      else if ((m = String(v.url || '').match(/vimeo\.com\/(?:video\/)?(\d+)/))) h = '<div class="video"><iframe src="https://player.vimeo.com/video/' + m[1] + '?dnt=1" title="' + esc(v.titre || 'Vidéo') + '" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>';
      else if (v.url) return '<p><a href="' + esc(v.url) + '" rel="noopener">' + esc(v.titre || 'Voir la vidéo') + '</a></p>';
      return h + (v.titre ? '<p class="legende">' + esc(v.titre) + '</p>' : '');
    }
    function envoyer(e, f) {
      var err = document.getElementById('err'), bt = f.querySelector('button[type=submit]');
      var d = { api: 'reserver', evenement: e.id, options: [] }, attente = f.getAttribute('data-attente') === '1', libelle = bt.textContent;
      new FormData(f).forEach(function (v, k) { if (k === 'opt') d.options.push(v); else d[k] = v; });
      if (attente) d.attente = true;
      err.hidden = true;
      if (!d.nom.trim()) return montrer('Indiquez votre nom.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return montrer('L\'adresse e-mail ne semble pas correcte.');
      var ef = erreurForm(d); if (ef) return montrer(ef);
      bt.disabled = true; bt.textContent = 'Envoi…';
      fetch(F.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d) })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (!r.ok) { bt.disabled = false; bt.textContent = libelle; return montrer(r.erreur || 'La réservation n\'a pas pu être enregistrée.'); }
          if (r.attente) f.outerHTML = '<div class="merci"><h3>C\'est noté</h3><p>Vous êtes sur la liste d\'attente pour « ' + esc(e.titre) + ' » (' + esc(d.places) + ' place' + (d.places > 1 ? 's' : '') + '). Dès qu\'une place se libère, nous vous écrivons à <b>' + esc(d.email) + '</b>.</p><p><a href="programme.html">Voir les autres spectacles</a></p></div>';
          else f.outerHTML = '<div class="merci"><h3>Merci !</h3><p>Votre réservation de ' + esc(d.places) + ' place' + (d.places > 1 ? 's' : '') +
            ' pour « ' + esc(e.titre) + ' » est confirmée' + (d.options.length ? ' (' + esc((e.options || []).filter(function (o) { return d.options.indexOf(o.id) >= 0; }).map(function (o) { return o.nom; }).join(', ')) + ')' : '') + '.</p><p>' + (r.mailEnvoye === false ? 'Nous vous écrirons à ' : 'Un e-mail de confirmation vient de partir à ') +
            '<b>' + esc(d.email) + '</b>.</p><p><a href="programme.html">Voir les autres spectacles</a></p></div>';
          if (r.restantes != null) { e.restantes = r.restantes; e.complet = r.restantes <= 0; e.reservable = !e.complet; }
        })
        .catch(function () { bt.disabled = false; bt.textContent = libelle; montrer('Problème de connexion. Réessayez dans un instant.'); });
      function montrer(t) { err.textContent = t; err.hidden = false; }
    }
    function route() {
      var id = decodeURIComponent(location.hash.slice(1)).replace(/#.*$/, '');
      if (evenements && /^jour-\d{4}-\d\d-\d\d$/.test(id) && evenements.some(function (x) { return x.date === id.slice(5); })) { afficherJour(id.slice(5)); if (/#resaJour$/.test(location.hash)) { var r = document.getElementById('resaJour'); if (r) r.scrollIntoView(); } return; }
      var e = id && evenements && evenements.filter(function (x) { return x.id === id; })[0];
      if (e) afficherFiche(e); else afficherProgramme();
    }
    function enSaisie() { var f = document.getElementById('resa'); return f && Array.prototype.some.call(f.querySelectorAll('input,textarea'), function (i) { return i.value && !i.classList.contains('piege'); }); }
    window.PF_RAFRAICHIR = route;
    addEventListener('hashchange', route);
    // Aperçu en direct depuis l'appli de gestion : elle envoie l'événement en cours de modification (même pas enregistré).
    addEventListener('message', function (ev) {
      if (!/^https:\/\/sevanegu-pixel\.github\.io$|^https?:\/\/localhost(:\d+)?$/.test(ev.origin) && ev.origin !== location.origin) return;
      var d = ev.data; if (!d || d.type !== 'pf-brouillon' || !d.evenement) return;
      var b = d.evenement, places = Number(b.places) || 0;
      b.id = b.id || 'brouillon'; b.places = places; b.restantes = places || null; b.complet = false; b.reservable = b.statut === 'Ouvert'; b.attente = b.attente === 'Oui' || b.attente === true;
      if (typeof b.options === 'string') { try { b.options = JSON.parse(b.options || '[]'); } catch (x) { b.options = []; } (b.options || []).forEach(function (o) { if (o.type === 'contingent') o.restantes = Number(o.places) || 0; }); }
      var premier = !BROUILLON; BROUILLON = true; evenements = preparer((evenements || []).filter(function (x) { return x.id !== b.id; }).concat([b]));
      var h = decodeURIComponent(location.hash.slice(1)).replace(/#.*$/, '');
      if (h && !/^jour-/.test(h) && !evenements.some(function (x) { return x.id === h; })) location.hash = b.id; else route();
      if (premier) { var cible = document.getElementById('ev-' + b.id); if (cible) setTimeout(function () { cible.scrollIntoView({ block: 'center' }); }, 60); }
    });
    route();
    charger(function (miseAJour) { if (miseAJour && (enSaisie() || BROUILLON)) return; route(); jsonLd(evenements); });
  }

  // Données structurées pour Google (événements)
  function jsonLd(evs) {
    if (!evs || !evs.length || document.getElementById('ld')) return;
    var lieu = { '@type': 'PerformingArtsTheater', name: 'Théâtricul', address: { '@type': 'PostalAddress', streetAddress: 'Rue de Genève 64', postalCode: '1225', addressLocality: 'Chêne-Bourg', addressCountry: 'CH' } };
    var items = evs.map(function (e) {
      var s = fiche(e);
      var o = { '@type': 'TheaterEvent', name: e.titre, startDate: e.date + (e.debut ? 'T' + e.debut + ':00+01:00' : ''), location: lieu, url: (F.site || '') + '/' + lienFiche(e), eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode' };
      if (s.court) o.description = s.court; if (s.compagnie) o.performer = { '@type': 'PerformingGroup', name: s.compagnie };
      if (s.photo) o.image = (F.site || '') + '/' + s.photo;
      return o;
    });
    var sc = document.createElement('script'); sc.type = 'application/ld+json'; sc.id = 'ld';
    sc.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Festival', name: F.nom, startDate: '2026-12-03', endDate: '2026-12-20', location: lieu, url: F.site, description: F.accroche, subEvent: items });
    document.head.appendChild(sc);
  }
})();
