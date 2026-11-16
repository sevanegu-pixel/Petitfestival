// Images de partage des spectacles (1200 × 630, ce qui s'affiche quand on partage un lien sur WhatsApp, Facebook, par mail…).
// Appelé par outils/referencement.py avec un fichier JSON : [{ slug, titre, cie, discipline, quand, photo, entier }].
// Écrit apercu/partage/<slug>.jpg. Usage direct : node outils/partage.js cartes.json
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const A = path.join(__dirname, '..', 'apercu');
const cartes = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const esc = t => String(t || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function page(c) {
  const img = 'data:image/webp;base64,' + fs.readFileSync(path.join(A, c.photo)).toString('base64');
  const t = c.titre.length, taille = t > 28 ? 58 : t > 18 ? 70 : 84;
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,800;9..144,900&family=Newsreader:opsz,wght@6..72,500&family=Space+Mono:wght@700&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#f7f0e1;color:#1c1830;font-family:Newsreader,serif;position:relative}
.photo{position:absolute;left:0;top:0;width:610px;height:630px;background:#15131f;clip-path:polygon(0 0,100% 0,88% 100%,0 100%)}
.photo img{width:100%;height:100%;object-fit:${c.entier ? 'contain' : 'cover'};display:block}
.trait{position:absolute;left:530px;top:0;width:100px;height:630px;background:#ff1fb4;clip-path:polygon(80% 0,100% 0,20% 100%,0 100%)}
.texte{position:absolute;left:640px;right:56px;top:52px;bottom:48px;display:flex;flex-direction:column}
.festival{font:700 15px/1.3 'Space Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#6b2cff}
.tag{align-self:flex-start;margin-top:26px;font:700 13px/1 'Space Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:#6b2cff;padding:7px 10px}
h1{font:900 ${taille}px/0.98 Fraunces,serif;letter-spacing:-.01em;margin-top:18px}
.cie{font-size:26px;color:#5a536b;margin-top:12px;line-height:1.2}
.bas{margin-top:auto}
.quand{font:800 36px/1.1 Fraunces,serif;color:#ff1fb4}
.ou{font:700 15px/1.4 'Space Mono',monospace;letter-spacing:.06em;margin-top:12px;color:#1c1830}
</style></head><body>
<div class="photo"><img src="${img}"></div><div class="trait"></div>
<div class="texte"><p class="festival">Le P’tit Festival au Théâtricul</p>${c.discipline ? `<p class="tag">${esc(c.discipline)}</p>` : ''}
<h1>${esc(c.titre)}</h1>${c.cie ? `<p class="cie">${esc(c.cie)}</p>` : ''}
<div class="bas"><p class="quand">${esc(c.quand)}</p><p class="ou">Théâtricul, Chêne-Bourg · ptit-festival.ch</p></div></div>
</body></html>`;
}

(async () => {
  fs.mkdirSync(path.join(A, 'partage'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const c of cartes) {
    await p.setContent(page(c), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(A, 'partage', c.slug + '.jpg'), type: 'jpeg', quality: 86 });
  }
  await b.close();
  console.log(cartes.length, 'images de partage');
})();
