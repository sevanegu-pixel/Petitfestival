#!/usr/bin/env python3
"""Référencement (Google) du site du P’tit Festival.

Fabrique, dans apercu/ :
  - spectacles/<nom>.html : une vraie page par spectacle (texte, photos, dates, lien de réservation),
    lisible par Google sans JavaScript, avec ses données « événement » (schema.org) ;
  - les données Google du festival (bloc <script type="application/ld+json" id="ld">) dans index.html et programme.html ;
  - la liste des spectacles en bas de chaque page (liens que Google suit) ;
  - sitemap.xml (copié à la racine par outils/publier.sh).

Sources : apercu/festival.js (textes, photos) et outils/programme-google.json (dates, heures, tarifs, copie de la feuille).
Usage : python3 outils/referencement.py   (à relancer après un changement de programme ou de fiche, avant publier.sh)
"""
import json, os, re, subprocess, sys, unicodedata, datetime
from PIL import Image

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(R, 'apercu')
SITE = 'https://ptit-festival.ch'

F, SP = json.loads(subprocess.check_output(['node', '-e', '''
global.window = {}; require(process.argv[1]);
process.stdout.write(JSON.stringify([window.FESTIVAL, window.SPECTACLES]));''', os.path.join(A, 'festival.js')]))
PROG = json.load(open(os.path.join(R, 'outils', 'programme-google.json'), encoding='utf-8'))['representations']

JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
LIEU = {'@type': 'PerformingArtsTheater', '@id': SITE + '/#theatricul', 'name': 'Théâtricul', 'url': 'https://theatricul.net',
        'address': {'@type': 'PostalAddress', 'streetAddress': 'Rue de Genève 64', 'postalCode': '1225',
                    'addressLocality': 'Chêne-Bourg', 'addressRegion': 'Genève', 'addressCountry': 'CH'}}
ORGA = {'@type': 'Organization', '@id': SITE + '/#organisation', 'name': F['nom'], 'url': SITE + '/',
        'logo': SITE + '/favicon-512.png', 'email': F.get('contact', '')}


def norm(t):
    t = unicodedata.normalize('NFD', str(t or '').lower())
    t = ''.join(c for c in t if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', t).strip()


def slug(t): return norm(t).replace(' ', '-')


def esc(t):
    t = str(t or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
    return t.replace('« ', '« ').replace(' »', ' »')


def enrichir(p):
    p = esc(p)
    p = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', p)
    return re.sub(r'(^|[^*])\*([^*\n]+?)\*', r'\1<em>\2</em>', p)


def paras(t):  # même mise en forme que app.js
    out = []
    for p in re.split(r'\n\s*\n', str(t or '').replace('\r', '')):
        p = p.strip()
        if not p: continue
        if re.match(r'^##\s*', p): out.append('<h3>' + enrichir(re.sub(r'^##\s*', '', p)) + '</h3>')
        elif re.match(r'^>\s*', p): out.append('<p class="citation">' + enrichir(re.sub(r'(?m)^>\s*', '', p)).replace('\n', '<br>') + '</p>')
        elif re.match(r'^[-•]\s+', p): out.append('<ul>' + ''.join('<li>' + enrichir(re.sub(r'^[-•]\s+', '', l)) + '</li>' for l in p.split('\n')) + '</ul>')
        else: out.append('<p>' + enrichir(p).replace('\n', '<br>') + '</p>')
    return ''.join(out)


def texte_brut(t):
    t = re.sub(r'(?m)^(##|>)\s*', '', str(t or ''))
    return re.sub(r'\s+', ' ', t.replace('*', '')).strip()


def couper(t, n=158):
    if len(t) <= n: return t
    t = t[:n].rsplit(' ', 1)[0].rstrip(',;:')
    return t + '…'


def tarif_html(t):
    if '\n' not in t: return esc(t)
    grille, notes = '', ''
    for l in [x.strip() for x in t.split('\n') if x.strip()]:
        m = re.match(r'^(.*\S)\s+:\s+(.+)$', l)
        if l.startswith('*') or not m: notes += '<p class="tarifNote">' + esc(l) + '</p>'
        else: grille += '<li><span>' + esc(m.group(1)) + '</span><b>' + esc(m.group(2)) + '</b></li>'
    return ('<ul class="tarifs">' + grille + '</ul>' if grille else '') + notes


def prix(t):
    """Prix d'entrée pour Google : le premier montant d'un tarif fixe ; 0 pour « au chapeau » ou « prix libre » (entrée libre)."""
    if re.search(r'chapeau|prix libre', t, re.I): return 0
    m = re.search(r'(\d+)\s*francs', t)
    return int(m.group(1)) if m else None


def minutes(d):
    m = re.search(r'(\d+)\s*h\s*(\d+)?', d or '')
    if m: return int(m.group(1)) * 60 + int(m.group(2) or 0)
    m = re.search(r'(\d+)\s*min', d or '')
    return int(m.group(1)) if m else None


def date_longue(iso):
    d = datetime.date.fromisoformat(iso)
    return JOURS[d.weekday()] + ' ' + ('1er' if d.day == 1 else str(d.day)) + ' ' + MOIS[d.month - 1]


def taille(src):
    try:
        with Image.open(os.path.join(A, src)) as im: return im.size
    except Exception: return None


# --- Spectacles et leurs représentations (dans l'ordre du programme)
INDEX = {}
for k, s in SP.items():
    INDEX[norm(k)] = (k, s)
    for n in s.get('anciensNoms', []): INDEX.setdefault(norm(n), (k, s))
spectacles = {}
for rid, titre, date, debut, duree, tarif, image in PROG:
    k, s = INDEX.get(norm(titre), (titre, {}))
    sp = spectacles.setdefault(k, {'titre': k, 's': s, 'reps': [], 'slug': slug(k)})
    sp['reps'].append({'id': rid, 'date': date, 'debut': debut, 'duree': duree or s.get('duree', ''), 'tarif': tarif or s.get('tarif', ''), 'image': image})


def photos(sp):
    s = sp['s']; ph = list(s.get('photos') or [])
    if s.get('photo') and not any(p['src'] == s['photo'] for p in ph): ph.insert(0, {'src': s['photo'], 'credit': s.get('credit', '')})
    first = next((r['image'] for r in sp['reps'] if r['image']), '')
    if first:
        i = next((i for i, p in enumerate(ph) if p['src'] == first), -1)
        if i > 0: ph.insert(0, ph.pop(i))
        elif i < 0: ph.insert(0, {'src': first, 'credit': ''})
    return [p for p in ph if not p['src'].startswith('http') and os.path.exists(os.path.join(A, p['src']))]


def evenement(sp, r, ph):
    s = sp['s']; url = SITE + '/spectacles/' + sp['slug'] + '.html'
    debut = r['date'] + 'T' + r['debut'] + ':00+01:00'
    typ = 'MusicEvent' if re.search(r'concert', s.get('discipline', ''), re.I) else 'TheaterEvent'
    o = {'@type': typ, 'name': sp['titre'], 'startDate': debut,
         'eventStatus': 'https://schema.org/EventScheduled', 'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
         'location': {'@id': LIEU['@id']}, 'url': url, 'inLanguage': 'fr',
         'organizer': {'@id': ORGA['@id']}, 'superEvent': {'@id': SITE + '/#festival'}}
    mn = minutes(r['duree'])
    if mn:
        h, m = map(int, r['debut'].split(':')); fin = datetime.datetime(2000, 1, 1, h, m) + datetime.timedelta(minutes=mn)
        o['endDate'] = r['date'] + 'T' + fin.strftime('%H:%M') + ':00+01:00'
    desc = texte_brut(s.get('court') or s.get('long'))
    if desc: o['description'] = desc
    if ph: o['image'] = [SITE + '/' + p['src'] for p in ph[:3]]
    if s.get('compagnie'): o['performer'] = {'@type': 'PerformingGroup', 'name': s['compagnie']}
    p = prix(r['tarif'])
    offre = {'@type': 'Offer', 'url': SITE + '/programme.html#' + r['id'], 'priceCurrency': 'CHF',
             'availability': 'https://schema.org/InStock', 'validFrom': '2026-11-16T00:00:00+01:00'}
    if p is not None: offre['price'] = p
    o['offers'] = offre
    return o


FESTIVAL_LD = {'@type': 'Festival', '@id': SITE + '/#festival', 'name': F['nom'], 'alternateName': ['Le P’tit Festival', 'Le Petit Festival au Théâtricul', 'Petit Festival Chêne-Bourg', 'P’tit Festival Genève'],
               'startDate': '2026-12-03', 'endDate': '2026-12-20', 'url': SITE + '/', 'image': [SITE + '/partage.png', SITE + '/photos/illustration.webp'],
               'description': F.get('accroche', ''), 'location': {'@id': LIEU['@id']}, 'organizer': {'@id': ORGA['@id']},
               'eventStatus': 'https://schema.org/EventScheduled', 'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
               'offers': {'@type': 'Offer', 'url': SITE + '/programme.html', 'price': 0, 'priceCurrency': 'CHF',
                          'availability': 'https://schema.org/InStock', 'validFrom': '2026-11-16T00:00:00+01:00',
                          'description': 'Chaque spectacle a son tarif, souvent au chapeau ; paiement sur place.'}}
SITE_LD = {'@type': 'WebSite', '@id': SITE + '/#site', 'name': 'Le P’tit Festival', 'alternateName': F['nom'], 'url': SITE + '/', 'inLanguage': 'fr-CH'}


def bloc_ld(graph):
    s = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return '<script type="application/ld+json" id="ld">' + s + '</script>'


def liste_pied(actuel=''):
    return ('<nav class="spectaclesPied" aria-label="Les spectacles du festival"><p>Les spectacles</p><ul>' +
            ''.join('<li><a href="spectacles/' + sp['slug'] + '.html"' + (' aria-current="page"' if sp['slug'] == actuel else '') + '>' + esc(sp['titre']) + '</a></li>'
                    for sp in spectacles.values()) + '</ul></nav>')


# --- Gabarit : la tête et l'en-tête de programme.html
modele = open(os.path.join(A, 'programme.html'), encoding='utf-8').read()
modele = re.sub(r'\n?<script type="application/ld\+json" id="ld">.*?</script>', '', modele, flags=re.S)
tete, reste = modele.split('<main', 1)
pied_tpl = '</main>\n<footer id="pied">{pied}</footer>\n<script src="app.js"></script>\n</body>\n</html>\n'


def jours_texte(reps):
    jours = [datetime.date.fromisoformat(r['date']) for r in reps]
    return (' et '.join(str(d.day) if i < len(jours) - 1 else str(d.day) + ' ' + MOIS[d.month - 1] for i, d in enumerate(jours)) if len(set(d.month for d in jours)) == 1
             else ', '.join(date_longue(r['date']) for r in reps))


def heure_texte(h): return h.replace(':', ' h ').replace(' h 00', ' h')


def carte_partage(sp):
    """Ce qui est écrit sur l'image de partage du spectacle."""
    reps = sp['reps']; ph = photos(sp)
    quand = (date_longue(reps[0]['date']).capitalize() + ' · ' + heure_texte(reps[0]['debut'])) if len(reps) == 1 else jours_texte(reps).capitalize() + ' 2026'
    return {'slug': sp['slug'], 'titre': sp['titre'], 'cie': sp['s'].get('compagnie', ''), 'discipline': sp['s'].get('discipline', ''),
            'quand': quand, 'photo': ph[0]['src'] if ph else 'photos/illustration.webp', 'entier': bool(sp['s'].get('entier'))}


def page_spectacle(sp):
    s = sp['s']; ph = photos(sp); url = SITE + '/spectacles/' + sp['slug'] + '.html'
    reps = sp['reps']; cie = s.get('compagnie', '')
    quand = ('le ' if len(reps) == 1 else 'les ') + jours_texte(reps) + ' 2026'
    titre = sp['titre'] + (', ' + cie if cie and len(sp['titre'] + cie) < 46 else '') + ' · Le P’tit Festival, Chêne-Bourg'
    resume = texte_brut(s.get('court') or s.get('long') or '')
    desc = couper((s.get('discipline', '') + ' au Théâtricul, Chêne-Bourg (Genève), ' + quand + '. ' + resume).strip(), 158)
    img = SITE + '/partage/' + sp['slug'] + '.jpg'
    h = tete
    h = re.sub(r'<title>.*?</title>', '<title>' + esc(titre) + '</title>', h)
    h = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + esc(desc), h)
    h = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + url, h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + esc(sp['titre'] + ' · Le P’tit Festival au Théâtricul'), h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + esc(desc), h)
    h = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, h)
    h = re.sub(r'(<meta property="og:image" content=")[^"]*', lambda m: m.group(1) + img, h)
    h = h.replace('<meta property="og:locale"', '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
                  '<meta property="og:image:alt" content="' + esc(sp['titre'] + ', ' + quand + ', au P’tit Festival') + '">\n<meta property="og:locale"', 1)
    h = h.replace('<meta property="og:type" content="website">', '<meta property="og:type" content="article">')
    h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="../">', 1)
    graph = [evenement(sp, r, ph) for r in reps] + [dict(LIEU), dict(ORGA),
             {'@type': 'BreadcrumbList', 'itemListElement': [
                 {'@type': 'ListItem', 'position': 1, 'name': 'Programme', 'item': SITE + '/programme.html'},
                 {'@type': 'ListItem', 'position': 2, 'name': sp['titre'], 'item': url}]}]
    h = h.replace('</head>', bloc_ld(graph) + '\n</head>', 1)
    h = h.replace('<body data-page="programme">', '<body data-page="spectacle">')
    h = h.replace('<a href="programme.html" data-nav="programme">', '<a href="programme.html" data-nav="programme" class="actif">')
    corps = '<main id="contenu"><article class="fiche ficheSp"><div class="int large"><a class="retour" href="programme.html">← Tout le programme</a>'
    texte_partage = sp['titre'] + (' (' + cie + ')' if cie else '') + ', ' + quand + ' au P’tit Festival, Théâtricul de Chêne-Bourg'
    corps += ('<p class="ficheTete">' + ('<span class="tag">' + esc(s['discipline']) + '</span>' if s.get('discipline') else '') +
              '<button type="button" class="btn petitbtn contour partager" data-titre="' + esc(sp['titre']) + '" data-texte="' + esc(texte_partage) + '" data-url="' + url + '">Partager</button></p>')
    corps += '<h1>' + esc(sp['titre']) + '</h1>' + ('<p class="cie">' + esc(cie) + '</p>' if cie else '')
    if ph:
        w = taille(ph[0]['src']); dim = ' width="%d" height="%d"' % w if w else ''
        corps += ('<div class="galerie"><div class="visuel principal' + (' entier' if s.get('entier') else '') + '"><img src="' + esc(ph[0]['src']) + '" alt="' +
                  esc(sp['titre'] + (' (' + cie + ')' if cie else '') + ', au P’tit Festival') + '"' + dim + ' fetchpriority="high"></div>' +
                  ('<p class="credit">' + esc(ph[0]['credit']) + '</p>' if ph[0].get('credit') else '') + '</div>')
    infos = ''
    duree = reps[0]['duree'] or s.get('duree', '')
    if duree: infos += '<dt>Durée</dt><dd>' + esc(duree) + '</dd>'
    if s.get('age'): infos += '<dt>Public</dt><dd>' + esc(s['age']) + '</dd>'
    infos += '<dt>Lieu</dt><dd>Théâtricul, ' + esc(F.get('adresse', '')) + '</dd>'
    if reps[0]['tarif']: infos += '<dt>Tarif' + ('s' if '\n' in reps[0]['tarif'] else '') + '</dt><dd>' + tarif_html(reps[0]['tarif']) + '</dd>'
    corps += '<div class="cols"><div><dl>' + infos + '</dl>'
    texte = s.get('long') or s.get('court') or ''
    corps += '<div class="texteSp">' + (paras(texte) if texte else '<p class="vide">Présentation à venir.</p>') + (('<p class="citation">' + esc(s['citation']) + '</p>') if s.get('citation') else '') + (('<p class="avertissement">' + esc(s['avertissement']) + '</p>') if s.get('avertissement') else '') + '</div>'
    autres = ph[1:7]
    if autres:
        corps += '<div class="photosSp">' + ''.join(
            '<figure><img src="' + esc(p['src']) + '" alt="' + esc(sp['titre'] + ', photo ' + str(i + 2)) + '" loading="lazy"' +
            (' width="%d" height="%d"' % taille(p['src']) if taille(p['src']) else '') + '>' + '</figure>' for i, p in enumerate(autres)) + '</div>'
    if s.get('lien'): corps += '<p><a href="' + esc(s['lien']) + '" rel="noopener">' + esc(s.get('lienTitre') or 'Le site de la compagnie') + '</a></p>'
    if s.get('distribution'): corps += '<p class="distribution">' + esc(s['distribution']) + '</p>'
    corps += '</div><div class="colle"><div class="datesSp"><h2>' + ('Date' if len(reps) == 1 else 'Dates') + '</h2><ul>'
    for r in reps:
        aussi = [(x[3], x[1]) for x in PROG if x[2] == r['date'] and x[0] != r['id']]
        aussi_html = ('<span class="aussi">Aussi ce jour-là : ' + ', '.join(esc(INDEX.get(norm(t), (t, {}))[0]) + ' (' + esc(heure_texte(hh)) + ')' for hh, t in aussi) + '</span>') if aussi else ''
        corps += ('<li><span><b>' + esc(date_longue(r['date']).capitalize()) + '</b> à ' + esc(heure_texte(r['debut'])) + aussi_html + '</span>'
                  '<a class="btn petitbtn" href="programme.html#' + r['id'] + '">Réserver</a></li>')
    corps += '</ul><p class="petit">Chaque jour, plusieurs spectacles s’enchaînent : venez pour un seul ou pour plusieurs. Chacun se réserve à part (ou toute la journée d’un coup depuis le programme). Paiement sur place.</p></div></div></div></div></article></main>\n'
    return h + corps + pied_tpl.format(pied=liste_pied(sp['slug']))


# Images de partage (WhatsApp, Facebook, mail…) : une par spectacle, faites par outils/partage.js
cartes = os.path.join(R, 'outils', 'partage-cartes.json')
json.dump([carte_partage(sp) for sp in spectacles.values()], open(cartes, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
subprocess.check_call(['node', os.path.join(R, 'outils', 'partage.js'), cartes])
os.makedirs(os.path.join(A, 'spectacles'), exist_ok=True)
faits = set()
for sp in spectacles.values():
    nom = sp['slug'] + '.html'; faits.add(nom)
    open(os.path.join(A, 'spectacles', nom), 'w', encoding='utf-8').write(page_spectacle(sp))
for n in os.listdir(os.path.join(A, 'spectacles')):
    if n.endswith('.html') and n not in faits: os.remove(os.path.join(A, 'spectacles', n))

# --- Données Google du festival et liste des spectacles en bas des 4 pages
tous = [evenement(sp, r, photos(sp)) for sp in spectacles.values() for r in sp['reps']]
tous.sort(key=lambda e: e['startDate'])
for p in ['index.html', 'programme.html', 'festival.html', 'infos.html']:
    chemin = os.path.join(A, p); s = open(chemin, encoding='utf-8').read()
    s = re.sub(r'<footer id="pied">.*?</footer>', '<footer id="pied">' + liste_pied() + '</footer>', s, flags=re.S)
    s = re.sub(r'\n?<script type="application/ld\+json" id="ld">.*?</script>', '', s, flags=re.S)
    graph = [dict(FESTIVAL_LD), dict(LIEU), dict(ORGA), dict(SITE_LD)]
    if p == 'programme.html': graph = tous + graph
    if p in ('index.html', 'programme.html'):
        s = s.replace('</head>', bloc_ld(graph) + '\n</head>', 1)
    open(chemin, 'w', encoding='utf-8').write(s)

# --- sitemap.xml (pages du site principal ; copié à la racine par publier.sh)
auj = datetime.date.today().isoformat()
urls = [('/', '1.0'), ('/programme.html', '0.9'), ('/infos.html', '0.7'), ('/festival.html', '0.6')] + \
       [('/spectacles/' + sp['slug'] + '.html', '0.8') for sp in spectacles.values()]
xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + \
      ''.join('  <url><loc>' + SITE + u + '</loc><lastmod>' + auj + '</lastmod><priority>' + pr + '</priority></url>\n' for u, pr in urls) + '</urlset>\n'
open(os.path.join(A, 'sitemap.xml'), 'w', encoding='utf-8').write(xml)
print(len(spectacles), 'pages de spectacles,', len(tous), 'représentations dans les données Google, sitemap de', len(urls), 'adresses.')
