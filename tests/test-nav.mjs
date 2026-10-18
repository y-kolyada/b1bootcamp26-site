// tests/test-nav.mjs - навигатор, липкая панель и стопка плавающих кнопок.
//
//   node tests/test-nav.mjs
//
// Меряет то, чего не видно в файле:
//   - на дне страницы подсвечен последний раздел (на любой высоте окна);
//   - верх липкой панели не уехал за край окна;
//   - низ панели помещается в окно, пока шапка на экране;
//   - кнопки прокрутки стоят одной стопкой, не меньше 44px, не наезжают друг
//     на друга и не вылезают за экран, а «свернуть всё» стоит в той же стопке.
//
// Две высоты окна: дефект подсветки был виден только на высоком экране, где
// страница кончается раньше, чем последний заголовок доходит до верхней трети.
//
// Возвращает 1, если хоть одна страница в браке, и 0, когда всё чисто.
import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = readdirSync(rootDir).filter((n) => n.endsWith('.html')).sort();
const HEIGHTS = [860, 1400];
const PHONE = { width: 390, height: 844 };
const STICKY_TOP = 18; // то же число, что у nav.contents в style.css

const bad = [];
const g = (s) => '\x1b[32m' + s + '\x1b[0m';
const r = (s) => '\x1b[31m' + s + '\x1b[0m';

const browser = await chromium.launch();

// 1. Навигатор и липкая панель на широком экране, две высоты окна.
for (const height of HEIGHTS) {
  const page = await browser.newPage({ viewport: { width: 1280, height } });
  for (const name of pages) {
    await page.goto('file://' + path.join(rootDir, name));
    const seen = await page.evaluate(async (top) => {
      const sleep = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const nav = document.querySelector('nav.contents');
      const links = [...document.querySelectorAll('#tocList a')];
      if (!nav || links.length === 0) return null;

      const doc = document.scrollingElement;
      doc.scrollTop = doc.scrollHeight;
      for (let i = 0; i < 20; i++) await sleep();

      const active = links.filter((a) => a.classList.contains('active'));
      const rect = nav.getBoundingClientRect();
      return {
        подсвечен: active.length === 1 && active[0] === links[links.length - 1],
        подсвеченных: active.length,
        надОкном: Math.max(0, Math.round(top - rect.top)),
        нижеОкна: Math.max(0, Math.round(rect.bottom - window.innerHeight)),
      };
    }, STICKY_TOP);

    if (!seen) continue;
    const where = ' (окно ' + height + 'px)';
    if (!seen.подсвечен) {
      bad.push(name + ': на дне страницы последний раздел не подсвечен, подсвечено пунктов ' + seen.подсвеченных + where);
    }
    if (seen.надОкном > 1) bad.push(name + ': верх панели уехал за край окна на ' + seen.надОкном + 'px' + where);
    if (seen.нижеОкна > 1) bad.push(name + ': низ панели ниже края окна на ' + seen.нижеОкна + 'px' + where);
  }
  await page.close();
}

// 2. Стопка кнопок - на телефоне: самый тесный экран и большой палец.
const phone = await browser.newPage({ viewport: PHONE });
for (const name of pages) {
  await phone.goto('file://' + path.join(rootDir, name));
  const seen = await phone.evaluate(async (checkClicks) => {
    const sleep = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await sleep();
    const doc = document.scrollingElement;
    const stack = document.querySelector('.floats');
    if (!stack) return ['стопки кнопок нет вовсе'];

    const out = [];
    const long = doc.scrollHeight >= window.innerHeight * 1.5;
    const shown = !stack.hidden;
    if (long && !shown) out.push('на длинной странице нет кнопок прокрутки');
    if (!long && shown) out.push('на короткой странице кнопки прокрутки лишние');
    if (!shown) return out;

    const collapse = document.querySelector('.collapse-btn');
    if (collapse && collapse.parentElement !== stack) out.push('кнопка «свернуть всё» не в стопке');

    const items = [...stack.children];
    const rect = (el) => el.getBoundingClientRect();
    for (const b of items) {
      const box = rect(b);
      if (Math.round(box.height) < 36) out.push('кнопка в стопке ниже 36px: ' + Math.round(box.height));
      if (b.classList.contains('float-btn') && Math.round(box.width) < 44) {
        out.push('кнопка прокрутки уже 44px: ' + Math.round(box.width));
      }
      if (!b.getAttribute('aria-label') && !b.getAttribute('title')) out.push('у кнопки нет доступного имени');
    }
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = rect(items[i]), b = rect(items[j]);
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) {
          out.push('кнопки в стопке наезжают друг на друга');
        }
      }
    }
    const box = rect(stack);
    if (Math.round(box.right) > window.innerWidth || Math.round(box.bottom) > window.innerHeight) {
      out.push('стопка вылезает за край экрана');
    }

    if (checkClicks) {
      const buttons = items.filter((b) => b.classList.contains('float-btn'));
      buttons[buttons.length - 1].click();
      for (let i = 0; i < 120; i++) {
        if (doc.scrollTop + window.innerHeight >= doc.scrollHeight - 2) break;
        await sleep();
      }
      if (doc.scrollTop + window.innerHeight < doc.scrollHeight - 2) out.push('кнопка «в конец» не доводит до низа');
      buttons[0].click();
      for (let i = 0; i < 120; i++) {
        if (doc.scrollTop === 0) break;
        await sleep();
      }
      if (doc.scrollTop !== 0) out.push('кнопка «в начало» не доводит до верха');
    }
    return out;
  }, name === '01.html');
  for (const why of seen) bad.push(name + ': ' + why + ' (телефон)');
}

await browser.close();

console.log('  страниц проверено: ' + pages.length + ' на двух высотах окна и на телефоне');
for (const why of bad.slice(0, 12)) console.log('        -> ' + why);
if (bad.length > 12) console.log('        -> ... и ещё ' + (bad.length - 12));
console.log('  ' + (bad.length ? r('КРАСНОЕ') : g('ЗЕЛЁНОЕ')));
process.exit(bad.length ? 1 : 0);
