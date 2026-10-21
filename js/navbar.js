/**
 * React Bits Navbar Controller (reactbits.dev landing page behavior)
 * - Wide-to-compact floating glass capsule on scroll
 * - Smooth gliding highlight pill tracking hovered and active navigation items
 * - Responsive mobile drawer integration
 */
(function () {
  function initReactBitsNavbar() {
    const header = document.querySelector('.site-header, .ln-navbar');
    if (!header) return;

    // Ensure .ln-navbar class is present
    if (!header.classList.contains('ln-navbar')) {
      header.classList.add('ln-navbar');
    }

    const inner = header.querySelector('.header-inner, .ln-navbar-inner');
    if (inner && !inner.classList.contains('ln-navbar-inner')) {
      inner.classList.add('ln-navbar-inner');
    }

    // 1. Scroll-driven wide-to-compact capsule contraction
    const SCROLL_THRESHOLD = 20;
    let ticking = false;

    function updateScroll() {
      const y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      if (y > SCROLL_THRESHOLD) {
        header.classList.add('ln-navbar-scrolled', 'scrolled');
      } else {
        header.classList.remove('ln-navbar-scrolled', 'scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    }, { passive: true });
    updateScroll();

    // 2. Gliding link highlight
    const navContainer = header.querySelector('.ln-navbar-links');
    if (!navContainer) return;

    let highlight = navContainer.querySelector('.ln-navbar-link-highlight');
    if (!highlight) {
      highlight = document.createElement('div');
      highlight.className = 'ln-navbar-link-highlight';
      highlight.setAttribute('aria-hidden', 'true');
      navContainer.prepend(highlight);
    }

    const links = Array.from(navContainer.querySelectorAll('.ln-navbar-link'));
    if (!links.length) return;

    // Detect active page link based on current URL
    const currentPath = window.location.pathname.toLowerCase().split('/').pop() || 'index.html';
    let activeLink = links.find(link => {
      const href = (link.getAttribute('href') || '').toLowerCase().split('/').pop();
      if (currentPath === '' || currentPath === 'index.html') {
        return href === '' || href === 'index.html';
      }
      return href === currentPath;
    });

    if (!activeLink) {
      activeLink = navContainer.querySelector('.ln-navbar-link.active') || links[0];
    }

    links.forEach(l => {
      if (l === activeLink) {
        l.classList.add('active', 'ln-navbar-link-active');
      } else {
        l.classList.remove('active', 'ln-navbar-link-active');
      }
    });

    function moveHighlight(target, immediate = false) {
      if (!target || !highlight) return;
      if (window.innerWidth <= 900) {
        highlight.style.opacity = '0';
        return;
      }

      const containerRect = navContainer.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const left = targetRect.left - containerRect.left;
      const top = targetRect.top - containerRect.top;
      const width = targetRect.width;
      const height = targetRect.height;

      if (immediate) {
        highlight.style.transition = 'none';
      } else {
        highlight.style.transition = 'transform 0.28s cubic-bezier(0.23, 1, 0.32, 1), width 0.28s cubic-bezier(0.23, 1, 0.32, 1), height 0.28s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.2s ease';
      }

      highlight.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      highlight.style.width = `${width}px`;
      highlight.style.height = `${height}px`;
      highlight.style.opacity = '1';

      if (immediate) {
        highlight.offsetHeight; // trigger reflow
        highlight.style.transition = 'transform 0.28s cubic-bezier(0.23, 1, 0.32, 1), width 0.28s cubic-bezier(0.23, 1, 0.32, 1), height 0.28s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.2s ease';
      }
    }

    // Set initial highlight position on active item
    if (activeLink) {
      setTimeout(() => moveHighlight(activeLink, true), 60);
      window.addEventListener('load', () => moveHighlight(activeLink, true));
    }

    // Hover and focus listeners
    links.forEach(link => {
      link.addEventListener('mouseenter', () => moveHighlight(link));
      link.addEventListener('focus', () => moveHighlight(link));
    });

    navContainer.addEventListener('mouseleave', () => {
      if (activeLink) {
        moveHighlight(activeLink);
      } else {
        highlight.style.opacity = '0';
      }
    });

    window.addEventListener('resize', () => {
      if (activeLink) {
        moveHighlight(activeLink, true);
      }
    }, { passive: true });

    // 3. Mobile Navigation Drawer Toggle
    const toggleBtn = header.querySelector('.mobile-menu-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navContainer.classList.toggle('mobile-open');
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        toggleBtn.classList.toggle('active', isOpen);
      });

      document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) {
          navContainer.classList.remove('mobile-open');
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.classList.remove('active');
        }
      });

      links.forEach(link => {
        link.addEventListener('click', () => {
          navContainer.classList.remove('mobile-open');
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.classList.remove('active');
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReactBitsNavbar);
  } else {
    initReactBitsNavbar();
  }
})();
