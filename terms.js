// terms.js — интерактивные карточки терминов на мобильных и десктопах
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.term-btn');
  const openTerms = document.querySelectorAll('.term[data-open]');
  openTerms.forEach((t) => {
    if (!t.contains(e.target)) t.removeAttribute('data-open');
  });
  if (btn) {
    const term = btn.closest('.term');
    if (term) {
      if (term.hasAttribute('data-open')) {
        term.removeAttribute('data-open');
      } else {
        term.setAttribute('data-open', '');
      }
    }
  }
});
