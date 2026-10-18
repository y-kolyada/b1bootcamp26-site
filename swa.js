// swa.js - Simple Web Architecture utilities: theme, font scale & dynamic in-page TOC
(function () {
  // Эти две считает обработчик прокрутки. На странице без навигатора они так и
  // остаются пустыми - проверять наличие панели в каждом кадре не нужно.
  let markActive = function () {};
  let fitNav = function () {};

  // 1. Инициализация и переключение темы (День / Ночь)
  const savedTheme = localStorage.getItem('b1-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // Встроенный значок по той же причине, что и остальные: символы солнца и
  // луны есть не во всех шрифтах и рисуются пустым квадратом.
  const icon = (name, body) => '<svg class="icon" data-icon="' + name + '"'
    + ' viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor"'
    + ' stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'
    + ' aria-hidden="true">' + body + '</svg>';
  const SUN = icon('sun', '<circle cx="10" cy="10" r="3.8"/><path d="M10 1.2v2.2M10 16.6v2.2'
    + 'M1.2 10h2.2M16.6 10h2.2M3.7 3.7l1.6 1.6M14.7 14.7l1.6 1.6M16.3 3.7l-1.6 1.6'
    + 'M5.3 14.7l-1.6 1.6"/>');
  const MOON = icon('moon', '<path d="M16.4 12.6A7.4 7.4 0 0 1 7.4 3.6a7.4 7.4 0 1 0 9 9z"/>');

  const themeToggle = document.getElementById('themeToggle');
  function updateThemeUI() {
    if (!themeToggle) return;
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const isDark = currentTheme === 'dark' ||
      (!currentTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const box = themeToggle.querySelector('.theme-icon');
    if (box) {
      box.innerHTML = isDark ? MOON : SUN;
    }
  }

  if (themeToggle) {
    updateThemeUI();
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const isDark = currentTheme === 'dark' ||
        (!currentTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const nextTheme = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('b1-theme', nextTheme);
      updateThemeUI();
    });
  }

  // 2. Управление размером шрифта (S / M / L)
  const savedFont = localStorage.getItem('b1-font') || 'm';
  document.documentElement.setAttribute('data-font', savedFont);

  const fontBtns = document.querySelectorAll('.font-btn');
  function updateFontUI(activeSize) {
    fontBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-size') === activeSize);
    });
  }
  updateFontUI(savedFont);

  fontBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const size = btn.getAttribute('data-size');
      if (!size) return;
      document.documentElement.setAttribute('data-font', size);
      localStorage.setItem('b1-font', size);
      updateFontUI(size);
    });
  });

  // 3. Динамический навигатор по странице (In-Page TOC / Scroll Spy)
  const tocContainer = document.getElementById('pageToc');
  const tocList = document.getElementById('tocList');
  if (tocContainer && tocList) {
    const items = Array.from(document.querySelectorAll('main h2[id], main .glossary-term[id]'));
    if (items.length > 0) {
      tocList.innerHTML = '';
      items.forEach((item) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + item.id;
        // Берём заголовок: для карточки термина из вложенного h2/h3, иначе из самого элемента
        const titleEl = item.matches('.glossary-term')
          ? item.querySelector('h2, h3')
          : item;
        const text = titleEl ? titleEl.cloneNode(true) : item.cloneNode(true);
        const yakor = text.querySelector('.yakor');
        if (yakor) yakor.remove();
        const obj = text.querySelector('.glossary-object');
        if (obj) obj.remove();
        a.textContent = text.textContent.trim();
        li.appendChild(a);
        tocList.appendChild(li);
      });
      tocContainer.hidden = false;

      // ПОДСВЕТКА СЧИТАЕТСЯ ПО ПОЛОЖЕНИЮ, А НЕ ЧЕРЕЗ IntersectionObserver.
      // Наблюдатель с rootMargin -65% подсвечивает раздел, только когда тот
      // пересекает верхнюю треть экрана. Последний раздел короткой страницы
      // туда не доходит никогда: измерено на дне страницы занятия - не был
      // подсвечен ни один пункт, ни на окне 860px, ни на 1400px. На дне
      // страницы активен последний раздел по определению.
      const LINE = 0.35;

      markActive = function () {
        const line = window.innerHeight * LINE;
        let current = items[0];
        for (const item of items) {
          if (item.getBoundingClientRect().top <= line) current = item;
        }
        const doc = document.scrollingElement || document.documentElement;
        if (doc.scrollTop + window.innerHeight >= doc.scrollHeight - 2) {
          current = items[items.length - 1];
        }
        tocList.querySelectorAll('a').forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + current.id);
        });
      };

      // ВЫСОТА ПАНЕЛИ - ОТ ЕЁ НАСТОЯЩЕГО МЕСТА, А НЕ ОТ ВЫСОТЫ ОКНА.
      // Пока шапка на экране, панель начинается ниже её верха, и max-height
      // в calc(100vh - 36px) уводил её низ за край: измерено 79px при окне
      // 860px, нижние пункты были недостижимы.
      const nav = tocContainer.closest('nav.sessions');

      fitNav = function () {
        if (!nav || getComputedStyle(nav).position !== 'sticky') {
          if (nav) nav.style.maxHeight = '';
          return;
        }
        const top = Math.max(nav.getBoundingClientRect().top, 0);
        nav.style.maxHeight = Math.max(240, Math.round(window.innerHeight - top - 18)) + 'px';
      };
    }
  }

  // 4. Плавающие кнопки прокрутки: в начало и в конец. Листание по экранам
  //    оставлено пальцу и колесу мыши. Кнопки собираются здесь, а не в
  //    разметке: ни одну страницу не нужно править, чтобы они появились.
  const SAY = {
    ru: ['В начало страницы', 'В конец страницы'],
    uk: ['На початок сторінки', 'У кінець сторінки'],
    en: ['To the top of the page', 'To the bottom of the page'],
    de: ['Zum Anfang der Seite', 'Zum Ende der Seite'],
  };
  const LONG_ENOUGH = 1.5; // короче полутора экранов кнопки не нужны

  function arrow(name, body) {
    return '<svg class="icon" data-icon="' + name + '" viewBox="0 0 20 20" width="22"'
      + ' height="22" fill="none" stroke="currentColor" stroke-width="1.7"'
      + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  const floats = document.createElement('div');
  floats.className = 'floats';
  floats.hidden = true;

  const says = SAY[document.documentElement.lang] || SAY.ru;
  [
    [says[0], arrow('to-top', '<path d="M5 10.5l5-5 5 5"/><path d="M5 15l5-5 5 5"/>'), 0],
    [says[1], arrow('to-bottom', '<path d="M5 5l5 5 5-5"/><path d="M5 9.5l5 5 5-5"/>'), 1],
  ].forEach(([label, svg, toEnd]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'float-btn';
    btn.setAttribute('aria-label', label);
    btn.title = label;
    btn.innerHTML = svg;
    btn.addEventListener('click', () => {
      const doc = document.scrollingElement || document.documentElement;
      window.scrollTo({ top: toEnd ? doc.scrollHeight : 0, behavior: 'smooth' });
    });
    floats.appendChild(btn);
  });

  document.body.appendChild(floats);

  // Кнопка «свернуть всё» закреплена в том же углу, поэтому она переезжает в
  // стопку, а не спорит с ней за место.
  const svernut = document.querySelector('.svernut');
  if (svernut) floats.insertBefore(svernut, floats.firstChild);

  function fitFloats() {
    const doc = document.scrollingElement || document.documentElement;
    floats.hidden = doc.scrollHeight < window.innerHeight * LONG_ENOUGH;
  }

  // 5. Один обработчик на всё, что зависит от прокрутки и размера окна,
  //    придержанный кадром анимации: иначе браузер пересчитывает раскладку на
  //    каждое событие прокрутки.
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      fitNav();
      fitFloats();
      markActive();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);
  fontBtns.forEach((btn) => btn.addEventListener('click', onScroll));

  // Первый проход - сейчас, а не в следующем кадре: до него стопка спрятана, а
  // панель не измерена, и именно это прочитала бы проверка.
  fitNav();
  fitFloats();
  markActive();

  // 6. Поддержка режима печати и PDF (раскрытие всех шагов для брошюры)
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('details.step:not([open])').forEach((d) => {
      d.setAttribute('data-was-closed', 'true');
      d.setAttribute('open', '');
    });
  });
  window.addEventListener('afterprint', () => {
    document.querySelectorAll('details.step[data-was-closed]').forEach((d) => {
      d.removeAttribute('data-was-closed');
      d.removeAttribute('open');
    });
  });
})();
