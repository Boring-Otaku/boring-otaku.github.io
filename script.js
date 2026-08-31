document.addEventListener('DOMContentLoaded', function() {
  const menu = document.getElementById('mobile-menu');
  const navMenu = document.querySelector('.nav-menu');

  menu.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  // Close menu on link click (desktop/mobile)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) navMenu.classList.remove('active');
    });
  });
});
