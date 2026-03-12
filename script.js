// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Stagger children in grids
document.querySelectorAll('.services-grid, .projects-grid, .apps-grid, .stack-grid, .certs-grid, .exp-grid, .contact-links').forEach(grid => {
  grid.querySelectorAll('.reveal').forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.08}s`;
  });
});

// ===========================
// LANGUAGE TOGGLE
// ===========================
let currentLang = localStorage.getItem('lang') || 'en';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  document.documentElement.lang = lang;

  // Update all translatable elements
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = lang === 'es' ? el.dataset.es : el.dataset.en;
  });

  // Update active state on toggle buttons
  document.getElementById('langEN').classList.toggle('active', lang === 'en');
  document.getElementById('langES').classList.toggle('active', lang === 'es');
}

document.getElementById('langEN').addEventListener('click', () => applyLang('en'));
document.getElementById('langES').addEventListener('click', () => applyLang('es'));

// Apply on load
applyLang(currentLang);
