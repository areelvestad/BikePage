document.addEventListener('DOMContentLoaded', function () {
  function initDarkModeToggle() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
      console.log('Toggle found.');

      // Load the saved theme from localStorage
      const savedTheme = localStorage.getItem('theme');
      console.log('Saved theme:', savedTheme);
      if (savedTheme === 'dark') {
        document.body.setAttribute('data-darkmode', 'on');
        toggle.setAttribute('data-active', 'true');
      }

      // Add event listener to the toggle switch
      toggle.addEventListener('click', function () {
        console.log('Toggle clicked.');
        const isActive = document.body.getAttribute('data-darkmode') === 'on';
        if (isActive) {
          document.body.removeAttribute('data-darkmode');
          toggle.removeAttribute('data-active');
          localStorage.setItem('theme', 'light');
        } else {
          document.body.setAttribute('data-darkmode', 'on');
          toggle.setAttribute('data-active', 'true');
          localStorage.setItem('theme', 'dark');
        }
      });
    } else {
      console.log('Toggle not found, retrying...');
      setTimeout(initDarkModeToggle, 100); // Retry after 100ms
    }
  }

  initDarkModeToggle();
});
