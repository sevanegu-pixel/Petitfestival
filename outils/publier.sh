#!/bin/sh
# Publie l'aperçu (apercu/) comme site principal (racine de ptit-festival.ch).
# L'aperçu reste en place : on continue d'y essayer les changements, puis on relance ce script quand Sévane dit « publie ».
# Différences avec l'aperçu : pas de noindex, pas de panneau d'options (réglages retenus écrits dans <html>),
# seulement les polices utilisées. app.js ignore tout seul le programme d'essai hors de /apercu/.
# Avant : python3 outils/referencement.py (pages des spectacles, données Google, sitemap).
# Usage : sh outils/publier.sh   puis git add -A, commit et push sur main.
set -e
R="$(cd "$(dirname "$0")/.." && pwd)"
python3 - "$R" <<'PY'
import sys, os, shutil, re
R = sys.argv[1]; A = os.path.join(R, 'apercu')
PAGES = ['index.html', 'programme.html', 'festival.html', 'infos.html'] + \
        sorted('spectacles/' + n for n in os.listdir(os.path.join(A, 'spectacles')) if n.endswith('.html'))  # pages faites par outils/referencement.py
FICHIERS = ['app.js', 'festival.js', 'style.css', 'favicon.svg', 'favicon.png', 'partage.png', 'sitemap.xml']
DOSSIERS = ['photos', 'videos', 'partage']
# Réglages retenus (valeurs par défaut de apercu/options.js)
HTML = ('<html lang="fr" data-theme="clair" data-titre="fraunces" data-texte="newsreader" data-prog="grand" '
        'data-texture="argentique" data-menu="centre-depliant" data-sections="unies" data-entete="aucun" style="--ok:0.6;--lk:0.4">')
POLICES = ('<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600'
           '&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600'
           '&family=Fraunces:opsz,wght@9..144,700;9..144,800;9..144,900'
           '&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">')
pages = {}
for p in PAGES:                          # d'abord vérifier les 4 pages, ensuite seulement copier
    s = open(os.path.join(A, p), encoding='utf-8').read()
    s, a = re.subn(r'<html lang="fr">', HTML, s, count=1)
    s, b = re.subn(r'[ \t]*<meta name="robots" content="noindex, nofollow">\n', '', s)
    s, c = re.subn(r'[ \t]*<script src="options\.js"></script>\n', '', s)
    s, d = re.subn(r'<link href="https://fonts\.googleapis\.com/css2\?[^"]*" rel="stylesheet">', POLICES, s, count=1)
    if (a, b, c, d) != (1, 1, 1, 1):
        sys.exit(f'{p} : structure inattendue (html {a}, noindex {b}, options {c}, polices {d}) : rien n\'a été publié')
    pages[p] = s
for f in FICHIERS:
    shutil.copy2(os.path.join(A, f), os.path.join(R, f))
for d in DOSSIERS:
    src, dst = os.path.join(A, d), os.path.join(R, d)
    os.makedirs(dst, exist_ok=True)
    garder = set(os.listdir(src))
    for n in garder:
        shutil.copy2(os.path.join(src, n), os.path.join(dst, n))
    for n in os.listdir(dst):           # fichiers retirés de l'aperçu
        if n not in garder:
            os.remove(os.path.join(dst, n))
os.makedirs(os.path.join(R, 'spectacles'), exist_ok=True)
for n in os.listdir(os.path.join(R, 'spectacles')):   # pages de spectacles retirées
    if 'spectacles/' + n not in pages:
        os.remove(os.path.join(R, 'spectacles', n))
for p, s in pages.items():
    open(os.path.join(R, p), 'w', encoding='utf-8').write(s)
    print('publié :', p)
print('Site principal mis à jour depuis apercu/.')
PY
