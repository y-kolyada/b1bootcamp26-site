// swa.js — Simple Web Architecture utilities: theme, font scale & dynamic in-page TOC
(function () {
  // 1. Инициализация и переключение темы (День / Ночь)
  const savedTheme = localStorage.getItem('b1-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  const themeToggle = document.getElementById('themeToggle');
  function updateThemeUI() {
    if (!themeToggle) return;
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const isDark = currentTheme === 'dark' ||
      (!currentTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const icon = themeToggle.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = isDark ? '☾' : '☼';
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
    const headings = Array.from(document.querySelectorAll('main h2[id]'));
    if (headings.length > 0) {
      tocList.innerHTML = '';
      headings.forEach((h) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h.id;
        // Берём текст заголовка без символа '#' ссылки-якоря
        const text = h.cloneNode(true);
        const yakor = text.querySelector('.yakor');
        if (yakor) yakor.remove();
        a.textContent = text.textContent.trim();
        li.appendChild(a);
        tocList.appendChild(li);
      });
      tocContainer.hidden = false;

      // Scroll Spy через нативный IntersectionObserver
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id;
              tocList.querySelectorAll('a').forEach((link) => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + id);
              });
            }
          });
        }, {
          rootMargin: '0px 0px -65% 0px',
          threshold: 0
        });

        headings.forEach((h) => observer.observe(h));
      }
    }
  }
})();
