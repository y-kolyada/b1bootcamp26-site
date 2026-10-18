// tests/test-font.mjs - проверка настройки «А А А»: размер должен слушаться на
// всей странице, а не только в абзацах.
//
//   node tests/test-font.mjs
//
// Меряет то, чего не видно в файле: при трёх настройках размер заголовка,
// абзаца и подвала должен расти, и при самой большой настройке на экране
// телефона ничего не должно уезжать за правый край - ни на одной из страниц.
//
// Возвращает 1, если хоть одна страница в браке, и 0, когда всё чисто.
import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = readdirSync(rootDir).filter((n) => n.endsWith('.html')).sort();
const PHONE = { width: 390, height: 844 };

const bad = [];
const g = (s) => '\x1b[32m' + s + '\x1b[0m';
const r = (s) => '\x1b[31m' + s + '\x1b[0m';

const browser = await chromium.launch();

// 1. Размеры на трёх настройках. Одной страницы довольно: таблица стилей одна.
const probe = await browser.newPage({ viewport: PHONE });
await probe.goto('file://' + path.join(rootDir, '01.html'));
const sizes = await probe.evaluate(() => {
  const px = (sel) => {
    const el = document.querySelector(sel);
    return el ? parseFloat(getComputedStyle(el).fontSize) : null;
  };
  const read = (size) => {
    const btn = document.querySelector('.font-btn[data-size="' + size + '"]');
    if (btn) btn.click();
    else document.documentElement.setAttribute('data-font', size);
    return { root: px(':root'), heading: px('h2'), paragraph: px('p'), footer: px('footer') };
  };
  const out = { s: read('s'), m: read('m'), l: read('l') };
  read('m');
  return out;
});

const NAMES = { root: 'корень', heading: 'заголовок', paragraph: 'абзац', footer: 'подвал' };
for (const part of Object.keys(NAMES)) {
  const [s, m, l] = [sizes.s[part], sizes.m[part], sizes.l[part]];
  if (s === null) continue;
  if (s < m && m < l) {
    console.log('  [ ' + g('ДА ') + ' ] ' + NAMES[part] + ' слушается настройки: ' + s + ' / ' + m + ' / ' + l);
  } else {
    bad.push(NAMES[part] + ' не слушается настройки: ' + s + ' / ' + m + ' / ' + l);
  }
}

// 2. Самая большая настройка на телефоне: ничего не уезжает за край.
const phone = await browser.newPage({ viewport: PHONE });
await phone.addInitScript(() => {
  try { localStorage.setItem('b1-font', 'l'); } catch (e) { /* приватное окно */ }
});
for (const name of pages) {
  await phone.goto('file://' + path.join(rootDir, name));
  const seen = await phone.evaluate(() => {
    const out = { font: document.documentElement.getAttribute('data-font'), over: [] };
    const edge = document.documentElement.clientWidth;
    for (const el of document.querySelectorAll('body *')) {
      if (el.getBoundingClientRect().right > edge + 1) {
        out.over.push(el.tagName + ': ' + el.textContent.trim().slice(0, 30));
      }
    }
    return out;
  });
  if (seen.font !== 'l') bad.push(name + ': выбранный размер не применился, data-font=' + seen.font);
  if (seen.over.length) bad.push(name + ': при большом шрифте за край вылезло ' + seen.over.length + ' (' + seen.over[0] + ')');
}

await browser.close();

console.log('  страниц проверено телефоном при большом шрифте: ' + pages.length);
for (const why of bad.slice(0, 10)) console.log('        -> ' + why);
if (bad.length > 10) console.log('        -> ... и ещё ' + (bad.length - 10));
console.log('  ' + (bad.length ? r('КРАСНОЕ') : g('ЗЕЛЁНОЕ')));
process.exit(bad.length ? 1 : 0);
