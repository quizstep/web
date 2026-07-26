document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Management (Light/Dark Mode)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme on load
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // 2. Backend Integration Hooks (To be implemented later)
    const loginBtn = document.getElementById('login-btn');
    if(loginBtn) {
        loginBtn.addEventListener('click', () => {
            // TODO: Integrate authentication flow (e.g., JWT, Firebase, or custom Node.js auth)
            console.log("Login sequence initiated. Backend auth required.");
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