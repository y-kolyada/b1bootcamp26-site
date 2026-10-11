// tests/test-terms.mjs — автоматическая проверка интерактивных карточек терминов в Playwright
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const fileUrl = 'file://' + path.join(rootDir, '02.html');

let browser;
let totalChecks = 0;
let failedChecks = 0;

function check(desc, condition, details = '') {
  totalChecks++;
  if (condition) {
    console.log('  [ ДА  ] ' + desc);
  } else {
    failedChecks++;
    console.error('  [ НЕТ ] ' + desc + (details ? ' -> ' + details : ''));
  }
}

try {
  browser = await chromium.launch();
  
  for (const vp of [
    { name: 'мобильный (390x844)', width: 390, height: 844 },
    { name: 'десктоп (1280x800)', width: 1280, height: 800 }
  ]) {
    console.log(`\n--- Проверка карточек терминов: ${vp.name} ---`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(fileUrl);

    const termBtns = page.locator('.term-btn');
    const termCards = page.locator('.term-card');
    const count = await termBtns.count();

    check(`найдены кнопки терминов (${count} шт.)`, count >= 4);

    // 1. При загрузке страницы все карточки скрыты
    let allHiddenOnLoad = true;
    for (let i = 0; i < count; i++) {
      if (await termCards.nth(i).isVisible()) {
        allHiddenOnLoad = false;
        break;
      }
    }
    check('при открытии страницы ни одна карточка не видна в тексте', allHiddenOnLoad);

    // 2. Проверяем каждую кнопку по очереди
    for (let i = 0; i < count; i++) {
      const btn = termBtns.nth(i);
      const card = termCards.nth(i);
      const btnText = (await btn.textContent()).trim();

      // Если шаг внутри закрытого <details>, открываем его как читатель
      const details = btn.locator('xpath=ancestor::details');
      if (await details.count() > 0) {
        await details.evaluate((d) => { d.open = true; });
      }

      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      const isVisible = await card.isVisible();
      check(`клик на «${btnText}» открывает карточку`, isVisible);

      if (isVisible) {
        const text = await card.innerText();
        
        // Проверка отсутствия склеенного текста
        const hasGluedTitle = /АртефактОсязаемый|ПредикатУтверждение|КоммитНесгораемая|diffКоманда/.test(text);
        check(`в карточке «${btnText}» заголовок отделён от описания`, !hasGluedTitle, text.slice(0, 50));

        const hasGluedLinks = /→В|→\s*В\s*словарь/i.test(text) && text.includes('→В');
        check(`в карточке «${btnText}» ссылки не склеены (нет «→В» без пробела)`, !hasGluedLinks);

        // Проверка границ на экране
        const box = await card.boundingBox();
        if (box) {
          const withinLeft = box.x >= 0;
          const withinRight = box.x + box.width <= vp.width + 1;
          check(`карточка «${btnText}» не вылезает за экран (x=${Math.round(box.x)}, w=${Math.round(box.width)}, экран=${vp.width})`, withinLeft && withinRight);
        }

        // Закрытие крестиком
        const closeBtn = card.locator('.term-close');
        if (await closeBtn.count() > 0) {
          await closeBtn.click();
          const closed = !(await card.isVisible());
          check(`крестик закрывает карточку «${btnText}»`, closed);
        } else {
          // Закрытие повторным кликом
          await btn.click();
          check(`повторный клик закрывает карточку «${btnText}»`, !(await card.isVisible()));
        }
      }
    }

    // 3. Проверка закрытия по Esc
    if (count > 0) {
      const firstBtn = termBtns.first();
      const firstCard = termCards.first();
      await firstBtn.scrollIntoViewIfNeeded();
      await firstBtn.click();
      await page.keyboard.press('Escape');
      check('клавиша Escape закрывает открытую карточку', !(await firstCard.isVisible()));
    }

    // 4. Проверка закрытия по клику вне карточки
    if (count > 0) {
      const firstBtn = termBtns.first();
      const firstCard = termCards.first();
      await firstBtn.scrollIntoViewIfNeeded();
      await firstBtn.click();
      await page.locator('header.top').first().click();
      check('клик вне карточки закрывает её (light dismiss)', !(await firstCard.isVisible()));
    }

    await page.close();
  }
} catch (err) {
  console.error('Ошибка выполнения теста:', err);
  process.exit(1);
} finally {
  if (browser) await browser.close();
}

console.log(`\nИтог: проверок ${totalChecks}, ошибок ${failedChecks}`);
process.exit(failedChecks === 0 ? 0 : 1);
