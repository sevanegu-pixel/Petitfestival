(function () {
  var F = window.FESTIVAL || {};
  var MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  var JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  var vue = document.getElementById('vue');
  var evenements = null, erreurChargement = false;

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function parties(iso) { var p = iso.split('-').map(Number); return { a: p[0], m: p[1], j: p[2], js: new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay() }; }
  function dateLongue(iso) { var d = parties(iso); return JOURS[d.js] + ' ' + (d.j === 1 ? '1er' : d.j) + ' ' + MOIS[d.m - 1] + ' ' + d.a; }
  function heure(e) { return e.debut ? e.debut + (e.fin ? ' – ' + e.fin : '') : ''; }
  function contact() { return F.contact ? '<a href="mailto:' + esc(F.contact) + '">' + esc(F.contact) + '</a>' : ''; }
  function etat(e) {
    if (e.complet) return '<span class="etat complet">Complet</span>';
    if (!e.reservable) return '<span class="etat">Réservation fermée</span>';
    return e.restantes != null && e.restantes <= 10 ? '<span class="etat">Plus que ' + e.restantes + ' place' + (e.restantes > 1 ? 's' : '') + '</span>' : '';
  }

  document.getElementById('marque').textContent = F.nom || 'Festival';
  document.getElementById('pied').innerHTML = esc(F.nom) + (F.dates ? ' · ' + esc(F.dates) : '') + (F.lieu ? ' · ' + esc(F.lieu) : '') + (F.contact ? '<br>' + contact() : '');

  function charger() {
    if (!F.api) { evenements = []; route(); return; }
    fetch(F.api + '?api=evenements').then(function (r) { return r.json(); }).then(function (d) {
      evenements = d.evenements || []; route();
    }).catch(function () { evenements = []; erreurChargement = true; route(); });
  }

  function programme() {
    if (evenements === null) return '<p class="vide">Chargement du programme…</p>';
    if (!F.api) return '<p class="vide">Le programme et les réservations ouvrent bientôt.</p>';
    if (erreurChargement) return '<p class="vide">Impossible de charger le programme pour le moment. Réessayez dans un instant' + (F.contact ? ', ou écrivez-nous à ' + contact() : '') + '.</p>';
    if (!evenements.length) return '<p class="vide">Le programme arrive bientôt.</p>';
    var h = '', jour = '';
    evenements.forEach(function (e) {
      if (e.date !== jour) { jour = e.date; h += '<h3 class="jourTitre">' + dateLongue(e.date) + '</h3>'; }
      h += '<article class="ev"><div class="heure">' + esc(e.debut || '') + '</div>' +
        '<div><h3><a href="#' + esc(e.id) + '">' + esc(e.titre) + '</a></h3><p>' +
        esc([e.compagnie, e.lieu, e.duree, e.age].filter(Boolean).join(' · ')) + '</p></div>' +
        '<div class="action">' + (e.reservable ? '<a class="btn" href="#' + esc(e.id) + '">Réserver</a>' : '<a class="btn contour" href="#' + esc(e.id) + '">Voir</a>') + etat(e) + '</div></article>';
    });
    return h;
  }

  function accueil(ancre) {
    document.title = F.nom || 'Festival';
    vue.innerHTML = '<section class="hero">' + (F.edition ? '<p class="edition">' + esc(F.edition) + '</p>' : '') +
      '<h1>' + esc(F.nom) + '</h1><p class="quand">' + esc(F.dates) + '</p><p class="ou">' + esc(F.lieu) + '</p>' +
      (F.accroche ? '<p class="accroche">' + esc(F.accroche) + '</p>' : '') + '<p><a class="btn" href="#programme">Voir le programme et réserver</a></p></section>' +
      '<h2 class="section" id="programme">Programme</h2>' + programme() +
      '<h2 class="section" id="infos">Infos pratiques</h2><div class="infos">' + (F.infos || []).map(function (i) {
        return '<div><h3>' + esc(i[0]) + '</h3><p>' + esc(i[1]) + '</p></div>';
      }).join('') + (F.contact ? '<div><h3>Contact</h3><p>' + contact() + '</p></div>' : '') + '</div>';
    if (ancre) { var c = document.getElementById(ancre); if (c) c.scrollIntoView(); }
  }

  function fiche(e) {
    document.title = e.titre + ' · ' + (F.nom || 'Festival');
    var max = e.restantes != null ? Math.min(10, e.restantes) : 10, opts = '';
    for (var i = 1; i <= max; i++) opts += '<option>' + i + '</option>';
    var h = '<div class="fiche"><a class="retour" href="#programme">← Tout le programme</a><h1>' + esc(e.titre) + '</h1>' +
      (e.compagnie ? '<p class="cie">' + esc(e.compagnie) + '</p>' : '<p class="cie"></p>') + '<div class="cols"><div>' +
      (e.image ? '<img src="' + esc(e.image) + '" alt="">' : '') +
      '<dl><dt>Date</dt><dd>' + dateLongue(e.date) + '</dd>' + (heure(e) ? '<dt>Heure</dt><dd>' + esc(heure(e)) + '</dd>' : '') +
      (e.duree ? '<dt>Durée</dt><dd>' + esc(e.duree) + '</dd>' : '') + (e.age ? '<dt>Âge</dt><dd>' + esc(e.age) + '</dd>' : '') +
      (e.lieu || e.adresse ? '<dt>Lieu</dt><dd>' + esc([e.lieu, e.adresse].filter(Boolean).join(', ')) + '</dd>' : '') +
      (e.tarif ? '<dt>Tarif</dt><dd>' + esc(e.tarif) + '</dd>' : '') + '</dl>' +
      (e.description ? '<div class="desc">' + esc(e.description) + '</div>' : '') + '</div><div>';
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
    vue.innerHTML = h + '</div></div></div>';
    scrollTo(0, 0);
    var f = document.getElementById('resa');
    if (f) f.onsubmit = function (ev) { ev.preventDefault(); envoyer(e, f); };
  }

  function envoyer(e, f) {
    var err = document.getElementById('err'), bt = f.querySelector('button');
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
          '<b>' + esc(d.email) + '</b>.</p><p><a href="#programme">Voir les autres spectacles</a></p></div>';
        if (r.restantes != null) { e.restantes = r.restantes; e.complet = r.restantes <= 0; e.reservable = !e.complet; }
      })
      .catch(function () { bt.disabled = false; bt.textContent = 'Réserver'; montrer('Problème de connexion. Réessayez dans un instant.'); });
    function montrer(t) { err.textContent = t; err.hidden = false; }
  }

  function route() {
    var id = decodeURIComponent(location.hash.slice(1));
    var e = id && evenements && evenements.filter(function (x) { return x.id === id; })[0];
    if (e) fiche(e); else accueil(id);
  }
  addEventListener('hashchange', route);
  route();
  charger();
})();
