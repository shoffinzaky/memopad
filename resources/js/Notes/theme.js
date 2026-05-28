export function initTheme() {
    const btnToggle = document.getElementById('btn-theme-toggle');
    if (!btnToggle) return;

    // Load initial theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark-theme');
        updateIcon(true);
    } else {
        document.body.classList.remove('dark-theme');
        updateIcon(false);
    }

    btnToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateIcon(isDark);
    });
}

function updateIcon(isDark) {
    const icon = document.querySelector('#btn-theme-toggle i');
    if (!icon) return;
    if (isDark) {
        icon.className = 'bi bi-sun';
    } else {
        icon.className = 'bi bi-moon-stars';
    }
}
