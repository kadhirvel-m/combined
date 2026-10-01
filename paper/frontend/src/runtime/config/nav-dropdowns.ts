/**
 * Navbar "Projects" dropdowns (desktop + mobile): toggle on button click, close
 * on outside click or window blur. Opening the mobile menu (#menuBtn) collapses
 * the mobile projects dropdown.
 *
 * (No try/catch here, matching the original IIFE.)
 */
export function install(): void {
  function setupNavDropdown(btnId: string, menuId: string): void {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    if (!btn || !menu) return;
    const hide = function () { menu.classList.add('hidden'); };
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      menu.classList.toggle('hidden');
    });
    document.addEventListener('click', function (event) {
      if (menu.classList.contains('hidden')) return;
      if (!menu.contains(event.target as Node | null) && !btn.contains(event.target as Node | null)) hide();
    });
    window.addEventListener('blur', hide);
  }
  function setupMobileMenuReset(): void {
    const menuBtn = document.getElementById('menuBtn');
    if (!menuBtn) return;
    menuBtn.addEventListener('click', function () {
      const mobileMenu = document.getElementById('navProjectsMenuMobile');
      if (mobileMenu) mobileMenu.classList.add('hidden');
    });
  }
  const init = function () {
    setupNavDropdown('navProjectsBtn', 'navProjectsMenu');
    setupNavDropdown('navProjectsBtnMobile', 'navProjectsMenuMobile');
    setupMobileMenuReset();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}
