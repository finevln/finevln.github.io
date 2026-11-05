// Navbar behaviour: scrolled state, closing the mobile menu after a link is tapped, and scrollspy.
// The burger's open/close toggle stays in index.js.
(() => {
  // Smooth scrolling waits for load: an animated jump to a URL's #section during load stops short
  // when the figures and images above it change size.
  window.addEventListener('load', () => document.documentElement.classList.add('ui-smooth-scroll'));

  const navbar = document.querySelector('.navbar');
  const menu = navbar && navbar.querySelector('.navbar-menu');
  if (!menu) return;
  const burger = navbar.querySelector('.navbar-burger');

  const syncScrolled = () => navbar.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', syncScrolled, { passive: true });
  syncScrolled();

  // "Project" has no href, so tapping it leaves the menu open.
  menu.addEventListener('click', (event) => {
    if (!event.target.closest('a[href^="#"]')) return;
    menu.classList.remove('is-active');
    burger.classList.remove('is-active');
  });

  const linkFor = new Map();
  menu.querySelectorAll('a.navbar-item[href^="#"]').forEach((link) => {
    const section = document.getElementById(link.getAttribute('href').slice(1));
    if (section && section !== document.body) linkFor.set(section, link);
  });
  const sections = [...linkFor.keys()];
  if (!sections.length) return;
  const lastSection = sections[sections.length - 1];

  const inBand = new Set();
  let lastFullyVisible = false;
  let activeLink = null;

  const render = () => {
    // Two sections can share the band during a transition; the later one has just arrived.
    const current = lastFullyVisible ? lastSection : sections.filter((s) => inBand.has(s)).pop();
    const link = current ? linkFor.get(current) : null;
    if (link === activeLink) return;
    if (activeLink) activeLink.classList.remove('is-active');
    if (link) link.classList.add('is-active');
    activeLink = link;
  };

  const navHeight = navbar.offsetHeight;

  // A section becomes current when its top reaches this band just under the navbar. The band is
  // at the top so that a section is already current when a nav link lands it there.
  const bandObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) inBand.add(entry.target);
      else inBand.delete(entry.target);
    });
    render();
  }, { rootMargin: `-${navHeight}px 0px -85% 0px` });
  sections.forEach((section) => bandObserver.observe(section));

  // The page can end before the last section's top reaches the band, so that section also counts
  // as current whenever all of it is on screen.
  new IntersectionObserver(([entry]) => {
    lastFullyVisible = entry.intersectionRatio >= 1;
    render();
  }, { rootMargin: `-${navHeight}px 0px 0px 0px`, threshold: 1 }).observe(lastSection);
})();
