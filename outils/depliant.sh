#!/bin/sh
# Met à jour la page partageable du dépliant (apercu/depliant/) à partir du PDF de deux pages (extérieur, intérieur).
# Usage : sh outils/depliant.sh /chemin/vers/depliant.pdf   puis git add -A, commit et push sur main.
set -e
PDF="${1:-/mnt/project-files/festival/impression/depliant-essai1b.pdf}"
D="$(cd "$(dirname "$0")/.." && pwd)/apercu/depliant"
T="$(mktemp -d)"
pdftoppm -r 220 -png "$PDF" "$T/p"
python3 - "$T" "$D" <<'PY'
import sys, glob, datetime
from PIL import Image
t, d = sys.argv[1], sys.argv[2]
pages = sorted(glob.glob(t + '/p-*.png'))
for src, nom in zip(pages, ['exterieur', 'interieur']):
    Image.open(src).convert('RGB').save(d + '/depliant-' + nom + '.webp', quality=86, method=6)
mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
n = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=1)))
maj = '%d %s %d à %dh%02d' % (n.day, mois[n.month-1], n.year, n.hour, n.minute)
v = n.strftime('%Y%m%d%H%M')
open(d + '/index.html', 'w').write('''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dépliant · Le P’tit Festival au Théâtricul</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f7f0e1">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,800;9..144,900&family=Space+Mono:wght@700&family=Newsreader:opsz,wght@6..72,400&display=swap" rel="stylesheet">
<style>
body{margin:0;background:#efe6d2;color:#1b1733;font:17px/1.5 Newsreader,Georgia,serif}
main{max-width:1500px;margin:0 auto;padding:28px 16px 60px}
h1{font:900 clamp(28px,5vw,44px)/1 Fraunces,Georgia,serif;margin:0 0 6px}
.sur{font:700 12px/1.4 "Space Mono",monospace;text-transform:uppercase;letter-spacing:.16em;color:#6b2cff;margin:0 0 10px}
p{margin:0 0 8px;max-width:60ch}
h2{font:800 20px/1.2 Fraunces,Georgia,serif;margin:34px 0 10px}
a.img{display:block;border:2px solid #1b1733;box-shadow:6px 6px 0 #ff1fb4;background:#f7f0e1}
img{display:block;width:100%;height:auto}
.note{color:#4a4560;font-size:15px}
a{color:#6b2cff}
</style>
</head>
<body>
<main>
<p class="sur">Document de travail · 3 – 20 décembre 2026</p>
<h1>Le dépliant du P’tit Festival</h1>
<p>Le programme imprimé, en trois volets. Cette page montre toujours la dernière version.</p>
<p class="note">Mise à jour : ''' + maj + '''. Touchez une image pour l'agrandir. Le site : <a href="../">ptit-festival.ch/apercu</a></p>
<h2>Extérieur (rabat, dos, couverture)</h2>
<a class="img" href="depliant-exterieur.webp?v=''' + v + '''"><img src="depliant-exterieur.webp?v=''' + v + '''" alt="Extérieur du dépliant : présentation du festival, programme jour par jour, couverture" width="2573" height="1819"></a>
<h2>Intérieur (les spectacles)</h2>
<a class="img" href="depliant-interieur.webp?v=''' + v + '''"><img src="depliant-interieur.webp?v=''' + v + '''" alt="Intérieur du dépliant : les spectacles, avec photos, dates et tarifs" width="2573" height="1819"></a>
</main>
</body>
</html>
''')
print('Page du dépliant mise à jour :', maj)
PY
rm -rf "$T"
