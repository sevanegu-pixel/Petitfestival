(function () {
  var F = window.FESTIVAL || {}, SP = window.SPECTACLES || {};
  var MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  var MOIS_COURT = ['jan','fév','mars','avr','mai','juin','juil','août','sept','oct','nov','déc'];
  var JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  var page = document.body.getAttribute('data-page');
  var evenements = null, erreurChargement = false;

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function parties(iso) { var p = iso.split('-').map(Number); return { a: p[0], m: p[1], j: p[2], js: new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay() }; }
  function dateLongue(iso) { var d = parties(iso); return JOURS[d.js] + ' ' + (d.j === 1 ? '1er' : d.j) + ' ' + MOIS[d.m - 1]; }
  function dateCourte(iso) { var d = parties(iso); return JOURS[d.js].slice(0, 3) + ' ' + d.j + ' ' + MOIS_COURT[d.m - 1]; }
  function heure(e) { return e.debut ? e.debut + (e.fin ? ' – ' + e.fin : '') : ''; }
  function contact() { return F.contact ? '<a href="mailto:' + esc(F.contact) + '">' + esc(F.contact) + '</a>' : ''; }
  function paras(t) { return String(t || '').split(/\n\s*\n/).map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join(''); }
  function etat(e) {
    if (e.complet) return '<span class="etat complet">Complet</span>';
    if (!e.reservable) return '<span class="etat">Réservation fermée</span>';
    return e.restantes != null && e.restantes <= 10 ? '<span class="etat">Plus que ' + e.restantes + ' place' + (e.restantes > 1 ? 's' : '') + '</span>' : '';
  }

  // Fusionne une représentation (feuille) avec sa fiche (festival.js) : la feuille gagne si elle est remplie.
  var INDEX = {}; Object.keys(SP).forEach(function (k) { INDEX[norm(k)] = SP[k]; });
  function fiche(e) {
    var s = INDEX[norm(e.spectacle || e.titre)] || INDEX[norm(e.titre)] || {};
    var cie = e.compagnie || s.compagnie || '';
    return {
      compagnie: cie, discipline: s.discipline || '', duree: e.duree || s.duree || '', age: e.age || s.age || '',
      court: s.court || e.description || '', long: s.long || '', distribution: s.distribution || '', citation: s.citation || '',
      photo: e.image || s.photo || '', credit: s.credit || '', video: s.video || '', lien: s.lien || ''
    };
  }
  function visuel(e, s, classe) {
    if (s.photo) return '<div class="visuel ' + (classe || '') + '"><img src="' + esc(s.photo) + '" alt="' + esc(e.titre) + '" loading="lazy"></div>';
    var t = (norm(e.titre).length % 3);
    return '<div class="visuel vide t' + t + ' ' + (classe || '') + '" aria-hidden="true">' + esc((e.titre || '?').charAt(0).toUpperCase()) + '</div>';
  }
  function meta(s) { return [s.discipline, s.duree, s.age].filter(Boolean).join(' · '); }
  function lienFiche(e) { return 'programme.html#' + encodeURIComponent(e.id); }

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

  function charger(cb) {
    if (!F.api) { evenements = []; cb(); return; }
    fetch(F.api + '?api=evenements').then(function (r) { return r.json(); }).then(function (d) {
      evenements = (d.evenements || []).slice().sort(function (a, b) { return (a.date + a.debut).localeCompare(b.date + b.debut); }); cb();
    }).catch(function () { evenements = []; erreurChargement = true; cb(); });
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

  // ----- Accueil
  if (page === 'accueil') {
    document.getElementById('heroEdition').textContent = F.edition || '';
    document.getElementById('heroTitre').textContent = F.nom || '';
    document.getElementById('heroDates').textContent = F.dates || '';
    document.getElementById('heroLieu').textContent = F.lieu || '';
    document.getElementById('hero').insertAdjacentHTML('beforeend', '<div class="rayures" aria-hidden="true"></div>');
    document.getElementById('presTexte').innerHTML = (F.accroche ? '<p class="chapo">' + esc(F.accroche) + '</p>' : '') + paras((F.presentation || []).slice(0, 1).join('\n\n')) + '<p><a href="festival.html">En savoir plus sur le festival</a></p>';
    document.getElementById('accesCourt').innerHTML = '<p><b>' + esc(F.adresse || F.lieu) + '</b></p>' + (F.acces || []).slice(0, 2).map(function (a) { return '<p><b>' + esc(a[0]) + '.</b> ' + esc(a[1]) + '</p>'; }).join('');
    carte(document.getElementById('carte'));
    var pr = document.getElementById('prochains');
    pr.innerHTML = '<p class="vide">Chargement du programme…</p>';
    charger(function () {
      if (!evenements.length) { pr.innerHTML = messageVide(); return; }
      var auj = new Date().toISOString().slice(0, 10);
      var futurs = evenements.filter(function (e) { return e.date >= auj; });
      pr.innerHTML = (futurs.length ? futurs : evenements).slice(0, 6).map(carteSpectacle).join('');
      jsonLd(evenements);
    });
  }

  // ----- Le festival
  if (page === 'festival') {
    document.getElementById('festAccroche').textContent = F.accroche || '';
    document.getElementById('festTexte').innerHTML = paras((F.presentation || []).join('\n\n'));
    document.getElementById('festLieu').textContent = F.theatricul || '';
    document.getElementById('festOrga').textContent = F.organisation || '';
    var lt = document.getElementById('festLienTheatricul'); if (F.theatriculSite) lt.href = F.theatriculSite; else lt.parentNode.remove();
    var art = document.getElementById('artistes');
    art.innerHTML = Object.keys(SP).filter(function (k) { return SP[k].court; }).map(function (k) {
      var s = SP[k]; return '<div class="artiste"><h3>' + esc(s.compagnie || k) + '</h3><p>' + esc(k) + (s.discipline ? ' · ' + esc(s.discipline) : '') + '</p></div>';
    }).join('');
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
  }

  // ----- Programme + fiches
  if (page === 'programme') {
    var vue = document.getElementById('vue'), filtreActif = '';
    function programme() {
      var h = '<section class="entete"><div class="int"><p class="sur">Programme</p><h1>Dix-huit jours, tous les genres</h1><p class="chapo">Chaque spectacle a son tarif, souvent au chapeau. Réservez vos places depuis la fiche du spectacle : la salle est petite.</p></div></section><section class="bande pres"><div class="int">';
      if (evenements === null) return h + '<p class="vide">Chargement du programme…</p></div></section>';
      if (!evenements.length) return h + messageVide() + '</div></section>';
      var disciplines = []; evenements.forEach(function (e) { var d = fiche(e).discipline; if (d && disciplines.indexOf(d) < 0) disciplines.push(d); });
      if (disciplines.length > 1) h += '<div class="filtre" role="group" aria-label="Filtrer par genre"><button class="' + (filtreActif ? '' : 'on') + '" data-f="">Tout</button>' + disciplines.map(function (d) { return '<button class="' + (filtreActif === d ? 'on' : '') + '" data-f="' + esc(d) + '">' + esc(d) + '</button>'; }).join('') + '</div>';
      var jour = '', ouvert = false;
      evenements.forEach(function (e) {
        var s = fiche(e);
        if (filtreActif && s.discipline !== filtreActif) return;
        if (e.date !== jour) {
          jour = e.date; var d = parties(jour);
          h += (ouvert ? '</div></div>' : '') + '<div class="jour"><div class="date"><span class="num">' + d.j + '</span><span class="nomJour">' + esc(JOURS[d.js] + ' ' + MOIS[d.m - 1]) + '</span></div><div class="liste">'; ouvert = true;
        }
        h += '<article class="ev">' + visuel(e, s) + '<div><p class="heure">' + esc(e.debut || '') + (e.fin ? ' – ' + esc(e.fin) : '') + '</p><h3><a href="' + lienFiche(e) + '">' + esc(e.titre) + '</a></h3>' +
          '<p class="meta">' + esc([s.compagnie, meta(s)].filter(Boolean).join(' · ')) + '</p>' + (s.court ? '<p class="court">' + esc(s.court) + '</p>' : '') + '</div>' +
          '<div class="action">' + (e.reservable ? '<a class="btn" href="' + lienFiche(e) + '">Réserver</a>' : '<a class="btn contour" href="' + lienFiche(e) + '">Voir</a>') + etat(e) + '</div></article>';
      });
      if (ouvert) h += '</div></div>';
      return h + '</div></section>';
    }
    function afficherProgramme() {
      document.title = 'Programme · ' + (F.nom || 'Festival');
      vue.innerHTML = programme();
      vue.querySelectorAll('.filtre button').forEach(function (b) { b.onclick = function () { filtreActif = b.getAttribute('data-f'); afficherProgramme(); }; });
    }
    function afficherFiche(e) {
      var s = fiche(e);
      document.title = e.titre + ' · ' + (F.nom || 'Festival');
      var max = e.restantes != null ? Math.min(10, e.restantes) : 10, opts = '';
      for (var i = 1; i <= max; i++) opts += '<option>' + i + '</option>';
      var h = '<div class="fiche"><div class="int"><a class="retour" href="programme.html">← Tout le programme</a>' + (s.discipline ? '<p><span class="tag">' + esc(s.discipline) + '</span></p>' : '') + '<h1>' + esc(e.titre) + '</h1>' +
        (s.compagnie ? '<p class="cie">' + esc(s.compagnie) + '</p>' : '') + '<div class="cols"><div>' +
        (s.photo ? visuel(e, s) + (s.credit ? '<p class="credit">' + esc(s.credit) + '</p>' : '') : '') +
        '<dl><dt>Date</dt><dd>' + esc(dateLongue(e.date)) + '</dd>' + (heure(e) ? '<dt>Heure</dt><dd>' + esc(heure(e)) + '</dd>' : '') +
        (s.duree ? '<dt>Durée</dt><dd>' + esc(s.duree) + '</dd>' : '') + (s.age ? '<dt>Public</dt><dd>' + esc(s.age) + '</dd>' : '') +
        '<dt>Lieu</dt><dd>' + esc([e.lieu || 'Théâtricul', e.adresse || F.adresse].filter(Boolean).join(', ')) + '</dd>' +
        (e.tarif ? '<dt>Tarif</dt><dd>' + esc(e.tarif) + '</dd>' : '') + '</dl>' +
        (s.court ? '<div class="desc court">' + esc(s.court) + '</div>' : (s.long ? '' : '<p class="vide">Présentation à venir.</p>')) +
        (s.long ? '<button class="lire" id="lire" aria-expanded="false">Lire la suite</button><div class="suite" id="suite">' + paras(s.long) + (s.citation ? '<p class="citation">' + esc(s.citation) + '</p>' : '') + '</div>' : '') +
        (s.video ? '<p><a href="' + esc(s.video) + '" rel="noopener">Voir un extrait vidéo</a></p>' : '') + (s.lien ? '<p><a href="' + esc(s.lien) + '" rel="noopener">Le site de la compagnie</a></p>' : '') +
        (s.distribution ? '<p class="distribution">' + esc(s.distribution) + '</p>' : '') + '</div><div class="colle">';
      if (e.reservable) {
        h += '<form id="resa" novalidate><h3>Réserver</h3>' + (etat(e) ? '<p class="petit">' + etat(e) + '</p>' : '') +
          '<label for="nom">Prénom et nom *</label><input id="nom" name="nom" autocomplete="name" required>' +
          '<label for="email">E-mail *</label><input id="email" name="email" type="email" autocomplete="email" required>' +
          '<label for="telephone">Téléphone</label><input id="telephone" name="telephone" type="tel" autocomplete="tel">' +
          '<label for="places">Nombre de places *</label><select id="places" name="places">' + opts + '</select>' +
          '<label for="message">Message</label><textarea id="message" name="message"></textarea>' +
          '<input class="piege" name="site" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<p class="erreur" id="err" role="alert" hidden></p><p style="margin:18px 0 0"><button class="btn" type="submit">Réserver</button></p>' +
          '<p class="petit">Vous recevrez un e-mail de confirmation. Le paiement se fait sur place.</p></form>';
      } else {
        h += '<div class="merci"><h3>' + (e.complet ? 'C\'est complet' : 'Réservation fermée') + '</h3><p>' +
          (F.contact ? 'Écrivez-nous à ' + contact() + ' : une place se libère parfois.' : 'Une place se libère parfois : revenez voir un peu plus tard.') + '</p></div>';
      }
      vue.innerHTML = h + '</div></div></div></div>';
      scrollTo(0, 0);
      var lire = document.getElementById('lire');
      if (lire) lire.onclick = function () { var o = document.getElementById('suite').classList.toggle('ouvert'); lire.textContent = o ? 'Réduire' : 'Lire la suite'; lire.setAttribute('aria-expanded', o); };
      var f = document.getElementById('resa');
      if (f) f.onsubmit = function (ev) { ev.preventDefault(); envoyer(e, f); };
    }
    function envoyer(e, f) {
      var err = document.getElementById('err'), bt = f.querySelector('button[type=submit]');
      var d = { api: 'reserver', evenement: e.id };
      new FormData(f).forEach(function (v, k) { d[k] = v; });
      err.hidden = true;
      if (!d.nom.trim()) return montrer('Indiquez votre nom.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return montrer('L\'adresse e-mail ne semble pas correcte.');
      bt.disabled = true; bt.textContent = 'Envoi…';
      fetch(F.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d) })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (!r.ok) { bt.disabled = false; bt.textContent = 'Réserver'; return montrer(r.erreur || 'La réservation n\'a pas pu être enregistrée.'); }
          f.outerHTML = '<div class="merci"><h3>Merci !</h3><p>Votre réservation de ' + esc(d.places) + ' place' + (d.places > 1 ? 's' : '') +
            ' pour « ' + esc(e.titre) + ' » est confirmée.</p><p>' + (r.mailEnvoye === false ? 'Nous vous écrirons à ' : 'Un e-mail de confirmation vient de partir à ') +
            '<b>' + esc(d.email) + '</b>.</p><p><a href="programme.html">Voir les autres spectacles</a></p></div>';
          if (r.restantes != null) { e.restantes = r.restantes; e.complet = r.restantes <= 0; e.reservable = !e.complet; }
        })
        .catch(function () { bt.disabled = false; bt.textContent = 'Réserver'; montrer('Problème de connexion. Réessayez dans un instant.'); });
      function montrer(t) { err.textContent = t; err.hidden = false; }
    }
    function route() {
      var id = decodeURIComponent(location.hash.slice(1));
      var e = id && evenements && evenements.filter(function (x) { return x.id === id; })[0];
      if (e) afficherFiche(e); else afficherProgramme();
    }
    addEventListener('hashchange', route);
    route();
    charger(function () { route(); jsonLd(evenements); });
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
