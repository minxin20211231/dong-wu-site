/**
 * 預先渲染 5 型屋主的分享卡片圖 → public/ai-diagnosis/share/{key}.jpg
 *
 * 為什麼：分享按鈕原本用 html2canvas 即時截圖，但它在手機上會把卡片
 * （漸層/圓角/flex/自訂字體）渲染變形。改用 Playwright 截「真實瀏覽器渲染」
 * 的卡片，像素級正確、不變形。卡片內容是每型固定的，所以可預先產好靜態圖。
 *
 * 何時要重跑：屋主類型卡片的文案／版面／角色圖有改時。
 *
 * 前置：
 *   1. 先 build + 起本機 preview：npx astro build && npx astro preview --port 4321
 *   2. 需要 Playwright 與 Chromium（本機已有 npx playwright 快取）
 *   3. 跑：node scripts/prerender_share_cards.mjs
 *   4. 產出後轉 JPG 壓縮（見檔尾說明），再 build 部署
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import fs from 'fs';

const SEC = { researcher: 'intuitive', intuitive: 'researcher', defender: 'planner', planner: 'intuitive', solo: 'researcher' };
const KEYS = Object.keys(SEC);
const OUT = 'public/ai-diagnosis/share';
fs.mkdirSync(OUT, { recursive: true });

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 860, height: 1200 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:4321/ai-diagnosis/', { waitUntil: 'networkidle' });

for (const key of KEYS) {
  await page.evaluate(({ key, sec }) => {
    const html = window.renderArchetypeCard({ primary: key, secondary: sec });
    const old = document.getElementById('cap'); if (old) old.remove();
    const cap = document.createElement('div');
    cap.id = 'cap';
    cap.style.cssText = 'position:absolute;top:0;left:0;z-index:99999;width:780px;padding:40px;background:#1C1815;box-sizing:border-box';
    cap.innerHTML = html;
    document.body.appendChild(cap);
    if (!document.getElementById('capfix')) {
      const st = document.createElement('style');
      st.id = 'capfix';
      st.textContent = '#cap .anim-in{opacity:1!important;transform:none!important;animation:none!important}';
      document.head.appendChild(st);
    }
    const w = cap.querySelector('.anim-in'); if (w) w.style.margin = '0';
    const sb = cap.querySelector('.arch-share-btn'); if (sb) sb.style.display = 'none';
  }, { key, sec: SEC[key] });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await (await page.$('#cap')).screenshot({ path: `${OUT}/${key}.png` });
  console.log(`✓ ${key}.png`);
  await page.goto('http://localhost:4321/ai-diagnosis/', { waitUntil: 'networkidle' });
}
await b.close();
console.log('DONE — 接著轉 JPG 壓縮：');
console.log(`  python -c "from PIL import Image;import glob,os;[ (Image.open(f).convert('RGB').save(f[:-4]+'.jpg',quality=86,optimize=True),os.remove(f)) for f in glob.glob('${OUT}/*.png')]"`);
