/* =============================================
   NAV: scroll state
   ============================================= */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* =============================================
   FADE-UP: Intersection Observer
   ============================================= */
const fadeEls = document.querySelectorAll('.fade-up');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => fadeObserver.observe(el));

/* =============================================
   PILLARS SLIDER
   ============================================= */
const track = document.getElementById('pillarsTrack');
const dots = document.querySelectorAll('.pillars__dot');
const cards = document.querySelectorAll('.pillars__card');
const prevBtn = document.getElementById('pillarsPrev');
const nextBtn = document.getElementById('pillarsNext');

let currentIndex = 0;
const totalCards = cards.length;

function getVisibleCount() {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function goToPillar(index) {
  const visible = getVisibleCount();
  const maxIndex = totalCards - visible;
  currentIndex = Math.max(0, Math.min(index, maxIndex));

  const cardWidth = cards[0].offsetWidth + 24;
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

  cards.forEach((c, i) => c.classList.toggle('pillars__card--active', i === currentIndex));
  dots.forEach((d, i) => d.classList.toggle('pillars__dot--active', i === currentIndex));
}

prevBtn?.addEventListener('click', () => goToPillar(currentIndex - 1));
nextBtn?.addEventListener('click', () => goToPillar(currentIndex + 1));
dots.forEach(dot => {
  dot.addEventListener('click', () => goToPillar(Number(dot.dataset.index)));
});

// Auto-advance
let autoPlay = setInterval(() => goToPillar((currentIndex + 1) % totalCards), 4500);
track.addEventListener('mouseenter', () => clearInterval(autoPlay));
track.addEventListener('mouseleave', () => {
  autoPlay = setInterval(() => goToPillar((currentIndex + 1) % totalCards), 4500);
});

// Touch/swipe support
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) goToPillar(diff > 0 ? currentIndex + 1 : currentIndex - 1);
});

window.addEventListener('resize', () => goToPillar(currentIndex));

/* =============================================
   FAQ ACCORDION
   ============================================= */
const faqItems = document.querySelectorAll('.faq__item');

faqItems.forEach(item => {
  const btn = item.querySelector('.faq__question');
  const answer = item.querySelector('.faq__answer');

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    // Close all
    faqItems.forEach(other => {
      other.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
      other.querySelector('.faq__answer').style.maxHeight = '0';
    });

    // Open clicked (if it was closed)
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

/* =============================================
   STAGGER: problem cards on scroll
   ============================================= */
const problemCards = document.querySelectorAll('.problem__card');
const problemObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const cards = entry.target.querySelectorAll('.problem__card');
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 80);
      });
      problemObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

const problemGrid = document.querySelector('.problem__grid');
if (problemGrid) {
  problemCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  problemObserver.observe(problemGrid);
}
