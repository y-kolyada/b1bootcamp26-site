// glaza.mjs - глаза для ИИ.
//
//   node glaza.mjs index.html
//
// Открывает твою страницу так, как её увидит телефон, и говорит, что с ней не
// так. ИИ сам страницу не видит: он читает текст файлов. Этот скрипт - то, чем
// он смотрит.
//
// Возвращает 1, если что-то вылезло за край, и 0, если всё в порядке. Поэтому
// его можно поставить в проверку, а не только запускать руками.

import { chromium } from 'playwright';

const file = process.argv[2] || 'index.html';
const url = file.startsWith('http') ? file : 'file://' + process.cwd() + '/' + file;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(url);

// Всё меряется внутри страницы: тут выполняется код в самом браузере.
const beda = await page.evaluate(() => {
  const okno = document.documentElement.clientWidth;
  const vylezli = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.right > okno + 1) vylezli.push(el.tagName + ': ' + el.textContent.trim().slice(0, 30));
  }
  return { okno, stranica: document.documentElement.scrollWidth, vylezli };
});

console.log('экран телефона: ' + beda.okno + 'px, страница: ' + beda.stranica + 'px');
console.log(beda.vylezli.length ? 'за край вылезло: ' + beda.vylezli.length : 'за край ничего не вылезло');
for (const v of beda.vylezli.slice(0, 5)) console.log('  ' + v);

await page.screenshot({ path: 'telefon.png', fullPage: true });
console.log('снимок: telefon.png - посмотри на него сам');

await browser.close();
process.exit(beda.vylezli.length ? 1 : 0);
