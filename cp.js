// cp.js - кнопка копирования в каждом блоке кода. Подключается только на
// страницах, где код есть, чтобы заглушка его не тащила.
(function () {
  // Подписи идут за языком страницы, поэтому один файл служит всем языкам.
  // Для языков без своей строки берётся русская: основной язык курса русский.
  var LANG = (document.documentElement.getAttribute('lang') || 'ru').slice(0, 2);
  var LABELS = {
    ru: { copy: 'Скопировать код', done: 'Скопировано', fail: 'Не удалось' },
    uk: { copy: 'Скопіювати код',  done: 'Скопійовано', fail: 'Не вдалося' },
    en: { copy: 'Copy code',       done: 'Copied',      fail: 'Failed' },
    de: { copy: 'Code kopieren',   done: 'Kopiert',     fail: 'Fehlgeschlagen' }
  };
  var label = LABELS[LANG] || LABELS.ru;

  // Запасной путь срабатывает на любой отказ, а не на отсутствие API: file://
  // считается защищённым окружением, буфер обмена там есть, но writeText всё
  // равно отказывает без разрешения или без фокуса.
  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    // Увезено за экран, а не спрятано: спрятанное поле нельзя выделить, а без
    // выделения копировать нечего.
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    area.style.top = '0';
    document.body.appendChild(area);
    area.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (e) { copied = false; }
    area.remove();
    return copied;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopy(text) ? Promise.resolve()
                                  : Promise.reject(new Error('оба пути отказали'));
      });
    }
    return fallbackCopy(text) ? Promise.resolve()
                              : Promise.reject(new Error('оба пути отказали'));
  }

  var blocks = document.querySelectorAll('pre > code');
  for (var i = 0; i < blocks.length; i++) {
    (function (code) {
      var pre = code.parentNode;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'cp-btn';
      button.setAttribute('aria-label', label.copy);
      // Картинка, а не символ: типографский знак копирования во многих шрифтах
      // рисуется пустым квадратом. От чтения с экрана скрыта - читалка назовёт
      // кнопку по её aria-label.
      button.innerHTML =
        '<svg class="cp-ico" aria-hidden="true" width="13" height="13" viewBox="0 0 16 16"'
        + ' fill="none" stroke="currentColor" stroke-width="1.6"'
        + ' stroke-linejoin="round">'
        + '<rect x="5.2" y="5.2" width="9" height="9" rx="1.6"/>'
        + '<path d="M10.8 2.5H3.3a1.6 1.6 0 0 0-1.6 1.6v7.5"/>'
        + '</svg>'
        + '<span class="cp-say" role="status"></span>';
      var status = button.querySelector('.cp-say');
      var timer = null;

      button.addEventListener('click', function () {
        // textContent, а не innerHTML: ровно видимый текст, без разметки.
        copyText(code.textContent).then(function () {
          respond(label.done, 'ok');
        }, function () {
          respond(label.fail, 'fail');
        });
      });

      function respond(message, state) {
        clearTimeout(timer);
        status.textContent = message;
        button.classList.add(state);
        timer = setTimeout(function () {
          status.textContent = '';
          button.classList.remove('ok', 'fail');
        }, 1500);
      }

      pre.appendChild(button);
    })(blocks[i]);
  }
})();
