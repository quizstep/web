// Clean SVG Theme Icons (inherit stroke color)
const MOON_ICON_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const SUN_ICON_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

function updateThemeToggleIcons(theme) {
    const toggleBtns = document.querySelectorAll('#theme-toggle, .btn-icon');
    toggleBtns.forEach(btn => {
        if (btn.id === 'theme-toggle' || btn.classList.contains('btn-icon')) {
            if (theme === 'dark') {
                btn.innerHTML = SUN_ICON_SVG;
                btn.title = 'Switch to Light Mode';
                btn.setAttribute('aria-label', 'Switch to Light Mode');
            } else {
                btn.innerHTML = MOON_ICON_SVG;
                btn.title = 'Switch to Dark Mode';
                btn.setAttribute('aria-label', 'Switch to Dark Mode');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Management (Light/Dark Mode with SVG icons)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme and update icon on load
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggleIcons(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            let newTheme = theme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeToggleIcons(newTheme);
        });
    }

    // 2. Navigation to Login Page (Fallback if rendered as button)
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn && loginBtn.tagName === 'BUTTON') {
        loginBtn.addEventListener('click', () => {
            const isSubpage = window.location.pathname.includes('/pages/');
            window.location.href = isSubpage ? '../login.html' : 'login.html';
        });
    }
});

/**
 * Placeholder function for fetching exam materials from the database
 * @param {string} examName - e.g., 'jee', 'neet'
 * @param {string} subject - e.g., 'physics'
 */
async function fetchMaterials(examName, subject) {
    try {
        // const response = await fetch(`/api/materials?exam=${examName}&subject=${subject}`, {
        //     headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        // });
        // return await response.json();
        console.log(`Fetching materials for ${examName.toUpperCase()} - ${subject}`);
    } catch (error) {
        console.error("Database fetch failed", error);
    }
}