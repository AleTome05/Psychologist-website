const menu = document.getElementById('side-menu');
const overlay = document.getElementById('overlay');
const openBtn = document.getElementById('menu-open');
const closeBtn = document.getElementById('menu-close');

function openMenu() {
  menu.classList.remove('translate-x-full');
  overlay.classList.remove('opacity-0', 'pointer-events-none');
  openBtn.setAttribute('aria-expanded', 'true');
  document.body.classList.add('overflow-hidden');
}

function closeMenu() {
  menu.classList.add('translate-x-full');
  overlay.classList.add('opacity-0', 'pointer-events-none');
  openBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('overflow-hidden');
}

openBtn.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('opacity-0', 'translate-y-4');
      observer.unobserve(entry.target); // anima una volta sola
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Aggiorna la posizione allo scroll, al ridimensionamento e al caricamento
window.addEventListener('scroll', adjustWhatsAppPosition, { passive: true });
window.addEventListener('resize', adjustWhatsAppPosition, { passive: true });
adjustWhatsAppPosition();